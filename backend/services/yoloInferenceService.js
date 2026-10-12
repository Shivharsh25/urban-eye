/**
 * Embedded YOLOv8 ONNX Inference Engine for Urban EYE
 * Runs directly inside Node.js using onnxruntime-node and sharp.
 * 
 * Supports:
 * - Direct image buffer processing
 * - Direct 640x640 normalization to float32 tensor
 * - Dual-class detection: pothole (0) and garbage (1)
 * - NMS (Non-Maximum Suppression) IoU filtering
 * - Minimum bounding box sanity filtering (removes single-pixel artifacts)
 * - Zero external server dependency (100% self-contained on Render)
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
let ort = null;

function getOrt() {
  if (ort) return ort;
  // Try onnxruntime-web first (pure WASM, zero native .so / glibc dependencies, 100% portable on Render Linux containers)
  try {
    ort = require('onnxruntime-web');
    return ort;
  } catch (webErr) {
    console.warn('[YOLO ONNX] onnxruntime-web not loaded:', webErr.message);
  }

  // Fallback to onnxruntime-node if available
  try {
    ort = require('onnxruntime-node');
    return ort;
  } catch (nodeErr) {
    console.warn('[YOLO ONNX] onnxruntime-node not loaded:', nodeErr.message);
  }

  throw new Error('Neither onnxruntime-web nor onnxruntime-node could be loaded.');
}

const MODEL_PATH = path.join(__dirname, '../models/urban_eye_yolov8.onnx');
const CLASS_NAMES = ['pothole', 'garbage'];
const DEFAULT_CONF_THRESHOLD = 0.10;
const NMS_IOU_THRESHOLD = 0.45;
const MIN_BOX_PIXELS = 10; // Minimum width & height in original image pixels

let session = null;
let sessionLoading = null;

/**
 * Initializes and caches the ONNX Runtime session
 */
async function getSession() {
  if (session) return session;
  const ortInstance = getOrt();

  if (sessionLoading) return sessionLoading;

  sessionLoading = (async () => {
    if (!fs.existsSync(MODEL_PATH)) {
      throw new Error(`YOLO ONNX model not found at ${MODEL_PATH}`);
    }

    console.log(`[YOLO ONNX] Initializing session from: ${MODEL_PATH}`);
    const modelBuffer = fs.readFileSync(MODEL_PATH);
    try {
      session = await ortInstance.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm', 'cpu']
      });
    } catch (createErr) {
      // Fallback for native runtime if buffer signature differs
      session = await ortInstance.InferenceSession.create(MODEL_PATH);
    }
    console.log('[YOLO ONNX] Session loaded successfully!');
    return session;
  })();

  return sessionLoading;
}

/**
 * Calculates Intersection-over-Union (IoU) between two bounding boxes
 */
function calculateIoU(boxA, boxB) {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  const areaA = boxA.width * boxA.height;
  const areaB = boxB.width * boxB.height;

  const unionArea = areaA + areaB - interArea;
  return unionArea > 0 ? interArea / unionArea : 0;
}

/**
 * Performs Non-Maximum Suppression (NMS)
 */
function applyNMS(candidates, iouThreshold = NMS_IOU_THRESHOLD) {
  // Sort descending by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  const selected = [];
  while (candidates.length > 0) {
    const current = candidates.shift();
    selected.push(current);

    candidates = candidates.filter(box => {
      // Allow different classes to co-exist
      if (box.type !== current.type) return true;
      return calculateIoU(box.bbox, current.bbox) < iouThreshold;
    });
  }

  return selected;
}

/**
 * Executes YOLOv8 Object Detection on an input image buffer
 * @param {Buffer} imageBuffer - Raw image file buffer
 * @param {number} [confThreshold] - Minimum confidence (0.0 to 1.0)
 * @returns {Promise<Array<{ type: string, confidence: number, bbox: { x: number, y: number, width: number, height: number } }>>}
 */
async function runYoloDetection(imageBuffer, confThreshold = DEFAULT_CONF_THRESHOLD) {
  const modelSession = await getSession();

  // 1. Get original image metadata
  const metadata = await sharp(imageBuffer).metadata();
  const origWidth = metadata.width || 640;
  const origHeight = metadata.height || 640;

  // 2. Preprocess: Resize to 640x640 RGB planar tensor
  const TARGET_SIZE = 640;
  const rawPixelBuffer = await sharp(imageBuffer)
    .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();

  const numPixels = TARGET_SIZE * TARGET_SIZE;
  const float32Data = new Float32Array(3 * numPixels);

  // Convert interleaved RGB to Planar [RRR...GGG...BBB...] normalized [0.0, 1.0]
  for (let i = 0; i < numPixels; i++) {
    float32Data[i] = rawPixelBuffer[i * 3] / 255.0;
    float32Data[numPixels + i] = rawPixelBuffer[i * 3 + 1] / 255.0;
    float32Data[2 * numPixels + i] = rawPixelBuffer[i * 3 + 2] / 255.0;
  }

  const ortInstance = getOrt();
  const tensor = new ortInstance.Tensor('float32', float32Data, [1, 3, TARGET_SIZE, TARGET_SIZE]);

  // 3. Run Inference
  const inputName = modelSession.inputNames[0];
  const feeds = {};
  feeds[inputName] = tensor;

  const results = await modelSession.run(feeds);
  const outputName = modelSession.outputNames[0];
  const outputTensor = results[outputName];
  const outputData = outputTensor.data; // Float32Array of shape [1, 6, 8400]

  const numProposals = 8400;
  const scaleX = origWidth / TARGET_SIZE;
  const scaleY = origHeight / TARGET_SIZE;

  const rawCandidates = [];

  for (let p = 0; p < numProposals; p++) {
    const scorePothole = outputData[4 * numProposals + p];
    const scoreGarbage = outputData[5 * numProposals + p];

    const maxScore = Math.max(scorePothole, scoreGarbage);
    if (maxScore < confThreshold) continue;

    const classIdx = scorePothole >= scoreGarbage ? 0 : 1;
    const detectedType = CLASS_NAMES[classIdx];

    const cx = outputData[0 * numProposals + p];
    const cy = outputData[1 * numProposals + p];
    const w = outputData[2 * numProposals + p];
    const h = outputData[3 * numProposals + p];

    const x = Math.max(0, (cx - w / 2) * scaleX);
    const y = Math.max(0, (cy - h / 2) * scaleY);
    const width = Math.min(origWidth - x, w * scaleX);
    const height = Math.min(origHeight - y, h * scaleY);

    // Sanity filter: Ignore degenerate / micro boxes
    if (width < MIN_BOX_PIXELS || height < MIN_BOX_PIXELS) {
      continue;
    }

    rawCandidates.push({
      type: detectedType,
      confidence: Math.round(maxScore * 10000) / 10000,
      bbox: {
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        width: Math.round(width * 100) / 100,
        height: Math.round(height * 100) / 100
      },
      normalizedBbox: {
        xPercent: Math.round((x / origWidth) * 1000) / 10,
        yPercent: Math.round((y / origHeight) * 1000) / 10,
        widthPercent: Math.round((width / origWidth) * 1000) / 10,
        heightPercent: Math.round((height / origHeight) * 1000) / 10
      }
    });
  }

  // 4. Non-Maximum Suppression
  const finalDetections = applyNMS(rawCandidates);
  return finalDetections;
}

module.exports = {
  runYoloDetection,
  isModelAvailable: () => fs.existsSync(MODEL_PATH)
};
