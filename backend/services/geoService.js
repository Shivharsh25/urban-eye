/**
 * Geo-tagging & EXIF Metadata Service
 * - Extracts GPS latitude/longitude from image EXIF metadata
 * - Validates coordinate bounds
 * - Provides reverse geocoding / descriptive street names for reports
 */

const ExifParser = require('exif-parser');
const piexif = require('piexifjs');

/**
 * Inject GPS coordinates into a JPEG image buffer's EXIF metadata
 * @param {Buffer} imageBuffer 
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Buffer} Modified image buffer or original if not a valid JPEG
 */
function injectExifGps(imageBuffer, lat, lng) {
  if (!imageBuffer || imageBuffer.length === 0 || !isValidCoordinate(lat, lng)) {
    return imageBuffer;
  }

  try {
    // Basic check for JPEG magic numbers (FF D8)
    if (imageBuffer[0] !== 0xFF || imageBuffer[1] !== 0xD8) {
      return imageBuffer; // Not a JPEG, skip EXIF injection via piexif
    }

    const imgString = imageBuffer.toString("binary");
    
    let exifObj;
    try {
      exifObj = piexif.load(imgString);
    } catch (e) {
      exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {}, "thumbnail": null };
    }

    if (!exifObj["GPS"]) {
      exifObj["GPS"] = {};
    }

    // Convert decimal degrees to EXIF Rational format: [[deg, 1], [min, 1], [sec, 100]]
    const degToDmsRational = (degrees) => {
      const d = Math.abs(degrees);
      const deg = Math.floor(d);
      const min = Math.floor((d - deg) * 60);
      const sec = Math.round((d - deg - min / 60) * 3600 * 100);
      return [[deg, 1], [min, 1], [sec, 100]];
    };

    const latRef = lat < 0 ? "S" : "N";
    const lngRef = lng < 0 ? "W" : "E";

    exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = latRef;
    exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = degToDmsRational(lat);
    exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lngRef;
    exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = degToDmsRational(lng);
    
    const exifbytes = piexif.dump(exifObj);
    const newImgStr = piexif.insert(exifbytes, imgString);
    
    return Buffer.from(newImgStr, "binary");
  } catch (err) {
    console.error("[geoService] Failed to inject EXIF GPS:", err.message);
    return imageBuffer;
  }
}

/**
 * Extract GPS coordinates from an image buffer
 * @param {Buffer} imageBuffer 
 * @returns {{ lat: number | null, lng: number | null, hasExif: boolean }}
 */
function extractExifGps(imageBuffer) {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      return { lat: null, lng: null, hasExif: false };
    }

    const parser = ExifParser.create(imageBuffer);
    const result = parser.parse();

    if (result && result.tags && result.tags.GPSLatitude !== undefined && result.tags.GPSLongitude !== undefined) {
      const lat = result.tags.GPSLatitude;
      const lng = result.tags.GPSLongitude;
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng, hasExif: true };
      }
    }
  } catch (err) {
    // Non-fatal: most web demo photos don't carry EXIF GPS headers
  }

  return { lat: null, lng: null, hasExif: false };
}

/**
 * Validates coordinate ranges
 */
function isValidCoordinate(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  return !isNaN(numLat) && !isNaN(numLng) && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
}

/**
 * Resolves location using EXIF or fallback manual inputs
 */
function resolveLocation({ imageBuffer, manualLat, manualLng, defaultCityLat = 40.7128, defaultCityLng = -74.0060 }) {
  // 1. Try EXIF GPS first
  const exif = extractExifGps(imageBuffer);
  if (exif.hasExif && isValidCoordinate(exif.lat, exif.lng)) {
    return {
      lat: Number(exif.lat.toFixed(6)),
      lng: Number(exif.lng.toFixed(6)),
      source: 'exif'
    };
  }

  // 2. Try Manual Pin/Input
  if (isValidCoordinate(manualLat, manualLng)) {
    return {
      lat: Number(Number(manualLat).toFixed(6)),
      lng: Number(Number(manualLng).toFixed(6)),
      source: 'manual'
    };
  }

  // 3. Fallback to default city center with slight jitter to simulate real neighborhood
  const jitterLat = (Math.random() - 0.5) * 0.015;
  const jitterLng = (Math.random() - 0.5) * 0.015;
  return {
    lat: Number((defaultCityLat + jitterLat).toFixed(6)),
    lng: Number((defaultCityLng + jitterLng).toFixed(6)),
    source: 'fallback'
  };
}

const axios = require('axios');

/**
 * Generates or formats a descriptive address based on coordinates
 */
async function formatAddress(lat, lng, userAddress = '') {
  if (userAddress && userAddress.trim().length > 0) {
    return userAddress.trim();
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
          key: apiKey
        },
        timeout: 3000
      });
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
    } catch (err) {
      console.error('[geoService] Reverse geocoding failed, falling back to mock.', err.message);
    }
  }

  // Generate realistic smart city address lookup based on quadrant
  const streets = [
    'Civic Center Blvd', 'Market Street', 'Grand Avenue', 'Riverside Expressway',
    'Oakland Way', 'Metro Parkway', 'Highland Ave', 'Pine Street', 'Industrial Rd'
  ];
  const districts = ['Downtown Central', 'North Ward', 'Innovation District', 'Riverside Quarter', 'South Bay'];

  const streetIdx = Math.abs(Math.floor(lat * 1000)) % streets.length;
  const districtIdx = Math.abs(Math.floor(lng * 1000)) % districts.length;
  const buildingNo = Math.abs(Math.floor((lat + lng) * 10000)) % 890 + 100;

  return `${buildingNo} ${streets[streetIdx]}, ${districts[districtIdx]} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

module.exports = {
  extractExifGps,
  isValidCoordinate,
  resolveLocation,
  formatAddress,
  injectExifGps
};
