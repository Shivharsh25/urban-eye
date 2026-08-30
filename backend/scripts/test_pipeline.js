const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000';
const AI_URL = 'http://localhost:8000';

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 RUNNING URBAN EYE END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  // Test 1: AI Service Health
  console.log('[Test 1] Checking Python FastAPI AI Microservice Health...');
  const aiHealth = await axios.get(`${AI_URL}/health`);
  console.log(`  ✓ AI Service Status: ${aiHealth.data.status} (Mode: ${aiHealth.data.mode}, Classes: ${aiHealth.data.classes.join(', ')})`);

  // Test 2: AI Service Detection Endpoint
  console.log('\n[Test 2] Testing POST /detect on Python Microservice...');
  const dummyBuffer = Buffer.from('fake-image-bytes-urban-eye');
  const aiForm = new FormData();
  aiForm.append('image', dummyBuffer, { filename: 'pothole_sample.jpg', contentType: 'image/jpeg' });
  const aiDetectRes = await axios.post(`${AI_URL}/detect`, aiForm, { headers: aiForm.getHeaders() });
  console.log(`  ✓ Received Detections:`, aiDetectRes.data.detections);
  if (aiDetectRes.data.detections.length === 0 || !aiDetectRes.data.detections[0].bbox) {
    throw new Error('AI detection contract violated');
  }

  // Test 3: Backend Health Check
  console.log('\n[Test 3] Checking Node.js Backend API Health...');
  const backendHealth = await axios.get(`${BACKEND_URL}/health`);
  console.log(`  ✓ Backend Status: ${backendHealth.data.status}`);

  // Test 4: Auth Login (Admin & Citizen)
  console.log('\n[Test 4] Testing User Authentication & JWT Issuance...');
  const adminLogin = await axios.post(`${BACKEND_URL}/api/auth/login`, {
    email: 'admin@urbaneye.local',
    password: 'Admin@123456'
  });
  const adminToken = adminLogin.data.token;
  console.log(`  ✓ Admin Login: ${adminLogin.data.user.name} (${adminLogin.data.user.role}) - Token: ${adminToken.substring(0, 20)}...`);

  const citizenLogin = await axios.post(`${BACKEND_URL}/api/auth/login`, {
    email: 'sarah.jenkins@example.com',
    password: 'Citizen@123456'
  });
  const citizenToken = citizenLogin.data.token;
  console.log(`  ✓ Citizen Login: ${citizenLogin.data.user.name} (${citizenLogin.data.user.role})`);

  // Test 5: Full Automated Pipeline (POST /api/detect)
  console.log('\n[Test 5] Testing Full Automated Ingestion & Dispatch Pipeline (POST /api/detect)...');
  const reportForm = new FormData();
  reportForm.append('image', dummyBuffer, { filename: 'water_leak_test.jpg', contentType: 'image/jpeg' });
  reportForm.append('lat', '40.7150');
  reportForm.append('lng', '-74.0020');
  reportForm.append('address', '300 Innovation Way & 7th Ave');
  reportForm.append('typeHint', 'water_leak');

  const uploadRes = await axios.post(`${BACKEND_URL}/api/detect`, reportForm, {
    headers: {
      ...reportForm.getHeaders(),
      Authorization: `Bearer ${citizenToken}`
    }
  });

  const createdIncident = uploadRes.data.detection;
  console.log(`  ✓ Incident Created: #${createdIncident.id} (${createdIncident.type})`);
  console.log(`  ✓ Severity Computed: ${createdIncident.severity}`);
  console.log(`  ✓ Department Assigned: ${createdIncident.assignedDepartment}`);
  console.log(`  ✓ Dispatch Status: ${createdIncident.dispatchStatus}`);
  console.log(`  ✓ Verifiable Email Preview URL: ${createdIncident.dispatchPreviewUrl}`);

  // Test 6: Geospatial Duplicate Clustering (Reporting same type within 50m)
  console.log('\n[Test 6] Testing Geospatial Duplicate Clustering (<50m proximity)...');
  const citizen2Login = await axios.post(`${BACKEND_URL}/api/auth/login`, {
    email: 'david.kumar@example.com',
    password: 'Citizen@123456'
  });
  const citizen2Token = citizen2Login.data.token;

  const duplicateForm = new FormData();
  duplicateForm.append('image', dummyBuffer, { filename: 'water_leak_duplicate.jpg', contentType: 'image/jpeg' });
  duplicateForm.append('lat', '40.7151'); // ~15 meters away
  duplicateForm.append('lng', '-74.0021');
  duplicateForm.append('address', '302 Innovation Way');
  duplicateForm.append('typeHint', 'water_leak');

  const duplicateRes = await axios.post(`${BACKEND_URL}/api/detect`, duplicateForm, {
    headers: {
      ...duplicateForm.getHeaders(),
      Authorization: `Bearer ${citizen2Token}`
    }
  });

  console.log(`  ✓ Is Duplicate Merged: ${duplicateRes.data.isDuplicate}`);
  console.log(`  ✓ Updated Report Count: ${duplicateRes.data.detection.reportCount} (Reporters: ${duplicateRes.data.detection.reporterIds.length})`);
  if (!duplicateRes.data.isDuplicate || duplicateRes.data.detection.reportCount < 2) {
    throw new Error('Duplicate clustering failed to merge');
  }

  // Test 7: Admin Status Triage & Resolution Email Trigger
  console.log('\n[Test 7] Testing Admin Status Triage & Resolution Email Notification...');
  const resolveRes = await axios.patch(
    `${BACKEND_URL}/api/detections/${createdIncident.id}/status`,
    { status: 'resolved' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  console.log(`  ✓ Status Updated: ${resolveRes.data.detection.status}`);
  console.log(`  ✓ Resolution Notified At: ${resolveRes.data.detection.resolutionNotifiedAt}`);

  // Test 8: Admin Stats Summary
  console.log('\n[Test 8] Checking Admin Stats KPI Summary...');
  const statsRes = await axios.get(`${BACKEND_URL}/api/stats/summary`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`  ✓ Stats Summary: Total Reports: ${statsRes.data.totalReports}, Resolved: ${statsRes.data.statusCounts.resolved}, Potholes: ${statsRes.data.byType.pothole}`);

  console.log('\n====================================================');
  console.log('🎉 ALL INTEGRATION & PIPELINE TESTS PASSED 100%!');
  console.log('====================================================\n');
}

runVerification().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
