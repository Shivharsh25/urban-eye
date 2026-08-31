import { io } from 'socket.io-client';
import { API_BASE_URL } from './client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('https://urban-eye-wi2j.onrender.com', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to Urban EYE Real-Time Network:', socket.id);
      
      // Auto-join user room if user is logged in
      try {
        const storedUser = localStorage.getItem('urban_eye_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user && user.id) {
            socket.emit('join:user', user.id);
          }
        }
      } catch (e) {
        // Ignore parse error
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected from network:', reason);
    });
  }

  return socket;
}

export function subscribeToJob(jobId, onProgress) {
  const s = getSocket();
  s.emit('join:job', jobId);

  const handler = (data) => {
    if (data.jobId === jobId) {
      onProgress(data);
    }
  };

  s.on('pipeline:progress', handler);

  return () => {
    s.off('pipeline:progress', handler);
  };
}

export function subscribeToDetections({ onCreated, onMerged, onUpdated, onDeleted }) {
  const s = getSocket();

  if (onCreated) s.on('detection:created', onCreated);
  if (onMerged) s.on('detection:merged', onMerged);
  if (onUpdated) s.on('detection:updated', onUpdated);
  if (onDeleted) s.on('detection:deleted', onDeleted);

  return () => {
    if (onCreated) s.off('detection:created', onCreated);
    if (onMerged) s.off('detection:merged', onMerged);
    if (onUpdated) s.off('detection:updated', onUpdated);
    if (onDeleted) s.off('detection:deleted', onDeleted);
  };
}
