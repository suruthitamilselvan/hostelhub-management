// API Service for connecting React Frontend to Spring Boot REST Endpoints (http://localhost:8080/api)

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Generic fetch wrapper with fallback handling
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`Backend connection note (${endpoint}):`, error.message);
    return null; // Return null so callers can gracefully fallback to local state
  }
}

export const apiService = {
  // Authentication & Face Biometrics Verification
  login: (email, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  registerFace: (userId, faceEmbedding, facePhoto) => fetchApi('/auth/register-face', {
    method: 'POST',
    body: JSON.stringify({ userId, faceEmbedding, facePhoto })
  }),

  getFaceStatus: (userId) => fetchApi(`/auth/face-status/${userId}`),

  resetFace: (userId) => fetchApi(`/auth/reset-face/${userId}`, {
    method: 'POST'
  }),

  verifyFace: (userId, incomingEmbedding, ipAddress) => fetchApi('/auth/verify-face', {
    method: 'POST',
    body: JSON.stringify({ userId, incomingEmbedding, ipAddress })
  }),

  // Student Endpoints
  getAllComplaints: () => fetchApi('/complaints'),
  
  getStudentComplaints: (studentId) => fetchApi(`/complaints/student/${studentId}`),

  createComplaint: (complaintData) => fetchApi('/complaints', {
    method: 'POST',
    body: JSON.stringify({
      studentId: complaintData.studentId || 1,
      category: complaintData.category.toUpperCase(),
      title: complaintData.title,
      description: complaintData.description,
      locationBlock: complaintData.locationBlock,
      locationRoom: complaintData.locationRoom,
      beforePhotoUrl: complaintData.photoName || 'evidence.jpg'
    })
  }),

  updateStage: (ticketId, stage) => fetchApi(`/complaints/${ticketId}/stage`, {
    method: 'PUT',
    body: JSON.stringify({ stage })
  }),

  rateComplaint: (ticketId, rating) => fetchApi(`/complaints/${ticketId}/rate`, {
    method: 'PUT',
    body: JSON.stringify({ rating })
  }),

  // Warden Endpoints
  getWardenMetrics: () => fetchApi('/warden/metrics'),

  getDuplicateSuggestions: () => fetchApi('/warden/duplicate-suggestions'),

  autoAssignTechnician: (ticketId, strategy = 'leastLoaded') => fetchApi(`/warden/auto-assign/${ticketId}?strategy=${strategy}`, {
    method: 'POST'
  }),

  mergeComplaints: (targetTicketId, sourceTicketId) => fetchApi('/warden/merge', {
    method: 'POST',
    body: JSON.stringify({ targetTicketId, sourceTicketId })
  }),

  // Technician Endpoints
  getTechnicianQueue: (technicianId) => fetchApi(`/technician/queue/${technicianId}`),

  addSparePart: (complaintId, partData) => fetchApi(`/technician/${complaintId}/parts`, {
    method: 'POST',
    body: JSON.stringify({
      partName: partData.name,
      quantity: partData.qty,
      unitCost: partData.unitCost
    })
  }),

  markJobCompleted: (complaintId, afterPhotoUrl = 'after-tap.jpg') => fetchApi(`/technician/${complaintId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ afterPhotoUrl })
  })
};
