const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function checkRender() {
  console.log('================================================================');
  console.log('CHECKING RENDER BACKEND: https://urban-eye-wi2j.onrender.com');
  console.log('================================================================\n');

  // 1. Public Stats Endpoint
  try {
    const pub = await axios.get('https://urban-eye-wi2j.onrender.com/api/stats/public-summary');
    console.log('1. [GET /api/stats/public-summary]: ACTIVE');
    console.log('   Data:', pub.data);
  } catch (e) {
    console.error('1. [GET /api/stats/public-summary] FAILED:', e.message);
  }

  // 2. Admin Authentication
  let token = null;
  try {
    const login = await axios.post('https://urban-eye-wi2j.onrender.com/api/auth/login', {
      email: 'admin@urbaneye.local',
      password: 'Admin@123456'
    });
    token = login.data.token;
    console.log('\n2. [POST /api/auth/login]: ACTIVE');
    console.log('   Authenticated as:', login.data.user.email, '| Role:', login.data.user.role);
  } catch (e) {
    console.error('\n2. [POST /api/auth/login] FAILED:', e.response?.data || e.message);
  }

  if (!token) return;

  const authHeaders = { Authorization: 'Bearer ' + token };

  // 3. Admin Summary Stats
  try {
    const stats = await axios.get('https://urban-eye-wi2j.onrender.com/api/stats/summary', {
      headers: authHeaders
    });
    console.log('\n3. [GET /api/stats/summary]: ACTIVE');
    console.log('   - Total Active Issues:', stats.data.totalReports);
    console.log('   - Severity Distribution:', stats.data.bySeverity);
    console.log('   - Issues By Category:', stats.data.byType);
    console.log('   - Issues By Department:', stats.data.byDepartment);
  } catch (e) {
    console.error('\n3. [GET /api/stats/summary] FAILED:', e.response?.data || e.message);
  }

  // 4. Issues Feed & Severity Formatting
  try {
    const list = await axios.get('https://urban-eye-wi2j.onrender.com/api/detections', {
      headers: authHeaders
    });
    console.log('\n4. [GET /api/detections]: ACTIVE');
    console.log('   - Fetched Issues Count:', list.data.detections.length);
    console.log('   - Sample of Recent Issues:');
    list.data.detections.slice(0, 5).forEach((d, i) => {
      console.log(`     ${i + 1}. [${d.id || d._id}] ${d.type.toUpperCase().padEnd(8)} | Severity: ${d.severity.padStart(4)} | Dept: ${d.assignedDepartment} | Location: ${d.address || 'N/A'}`);
    });
  } catch (e) {
    console.error('\n4. [GET /api/detections] FAILED:', e.response?.data || e.message);
  }

  // 5. Test Live Detection Pipeline on Render
  console.log('\n5. [POST /api/detect]: TESTING LIVE UPLOAD PIPELINE ON RENDER...');
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(path.join(__dirname, '../../test_real_random.jpg')));
    form.append('lat', '28.5355');
    form.append('lng', '77.3910');

    const detectRes = await axios.post('https://urban-eye-wi2j.onrender.com/api/detect', form, {
      headers: { ...authHeaders, ...form.getHeaders() }
    });
    console.log('   - Upload Response Status:', detectRes.status);
    console.log('   - Pipeline Response:', detectRes.data);
  } catch (e) {
    console.error('   - Detection Pipeline Error:', e.response?.data || e.message);
  }

  console.log('\n================================================================');
  console.log('RENDER BACKEND HEALTH CHECK COMPLETE');
  console.log('================================================================');
}

checkRender();
