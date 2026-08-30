/**
 * Real-Time WebSockets Service (Socket.io)
 * Broadcasts system events:
 * - detection:created (brand-new issue created & dispatched)
 * - detection:merged (duplicate folded into existing issue with incremented report count)
 * - detection:updated (status changed, e.g. resolved)
 * - pipeline:progress (granular stage updates scoped to jobId)
 */

let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Allow clients to join rooms (e.g. user-specific room or job-specific room)
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined room user:${userId}`);
      }
    });

    socket.on('join:job', (jobId) => {
      if (jobId) {
        socket.join(`job:${jobId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined room job:${jobId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit granular progress events for an active upload pipeline job
 * Stages: received -> detecting -> geo-tagging -> duplicate-check -> routing -> dispatched/merged
 */
function emitPipelineProgress(jobId, { stage, step, totalSteps = 6, message, details = {} }) {
  if (!ioInstance) return;

  const payload = {
    jobId,
    stage,
    step,
    totalSteps,
    message,
    details,
    timestamp: new Date().toISOString()
  };

  // Emit both to specific job room and broadcast
  ioInstance.to(`job:${jobId}`).emit('pipeline:progress', payload);
  ioInstance.emit('pipeline:progress', payload);
}

/**
 * Emit brand-new detection created event
 */
function emitDetectionCreated(detection) {
  if (!ioInstance) return;
  ioInstance.emit('detection:created', detection);
}

/**
 * Emit duplicate merged event
 */
function emitDetectionMerged(detection, details = {}) {
  if (!ioInstance) return;
  ioInstance.emit('detection:merged', { detection, details });
}

/**
 * Emit detection status or data updated event
 */
function emitDetectionUpdated(detection) {
  if (!ioInstance) return;
  ioInstance.emit('detection:updated', detection);

  // Also emit specifically to each reporter's room
  if (detection.reporterIds && Array.isArray(detection.reporterIds)) {
    detection.reporterIds.forEach((userId) => {
      ioInstance.to(`user:${userId}`).emit('detection:updated', detection);
    });
  }
}

function emitDetectionDeleted(id, reporterIds = []) {
  if (!ioInstance) return;
  ioInstance.emit('detection:deleted', { id });
  
  if (reporterIds && Array.isArray(reporterIds)) {
    reporterIds.forEach((userId) => {
      ioInstance.to(`user:${userId}`).emit('detection:deleted', { id });
    });
  }
}

module.exports = {
  initSocket,
  emitPipelineProgress,
  emitDetectionCreated,
  emitDetectionMerged,
  emitDetectionUpdated,
  emitDetectionDeleted
};
