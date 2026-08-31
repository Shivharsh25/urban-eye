/**
 * Department Routing & Report Generation Service
 * Maps issue categories to municipal departments and renders official dispatch reports.
 */

const fs = require('fs');
const path = require('path');

const DEPARTMENTS_FILE = path.join(__dirname, '../config/departments.json');
let departments = {
  pothole: { department: 'Roads & Public Works', email: 'shivharsh86017@gmail.com' },
  garbage: { department: 'Sanitation Dept', email: 'shivharsh86017@gmail.com' },
  water_leak: { department: 'Water Dept', email: 'shivharsh86017@gmail.com' },
  streetlight: { department: 'Electrical Dept', email: 'shivharsh86017@gmail.com' }
};

if (fs.existsSync(DEPARTMENTS_FILE)) {
  try {
    departments = JSON.parse(fs.readFileSync(DEPARTMENTS_FILE, 'utf-8'));
  } catch (err) {
    console.error('[RoutingService] Failed to load departments.json:', err.message);
  }
}

/**
 * Gets department mapping for an issue type
 * @param {string} type 
 * @returns {{ department: string, email: string }}
 */
function getDepartmentForType(type) {
  return departments[type] || { department: 'Municipal Operations', email: 'shivharsh86017@gmail.com' };
}

/**
 * Formats a formal municipal dispatch report text
 */
function generateReportText({
  id,
  type,
  severity,
  reportCount = 1,
  address,
  lat,
  lng,
  createdAt,
  imageUrl,
  departmentName
}) {
  const typeDisplay = {
    pothole: 'Road Pothole / Surface Damage',
    garbage: 'Illegal Dumping / Refuse Accumulation',
    water_leak: 'Water Infrastructure Leakage / Pipe Rupture',
    streetlight: 'Faulty / Non-functional Streetlight'
  }[type] || type.toUpperCase();

  const formattedDate = new Date(createdAt || Date.now()).toUTCString();

  return `=====================================================
URBAN EYE - MUNICIPAL INFRASTRUCTURE INCIDENT REPORT
Incident Ref: #${id || 'NEW'}
=====================================================

1. INCIDENT CLASSIFICATION
-----------------------------------------------------
Category:        ${typeDisplay} (${type})
Assigned Dept:   ${departmentName}
Current Urgency: ${severity.toUpperCase()}
Citizen Reports: ${reportCount} confirmed submission(s)

2. LOCATION & GEODATA
-----------------------------------------------------
Approx Address:  ${address || 'Address Unspecified'}
Coordinates:     Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}
Map Pin:         https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}

3. TIMELINES & ASSETS
-----------------------------------------------------
Detected At:     ${formattedDate}
Evidence Image:  ${imageUrl ? (imageUrl.startsWith('/') ? (process.env.CLIENT_URL || 'http://localhost:5173') + imageUrl : imageUrl) : 'No image attached'}

4. AUTOMATED DISPATCH INSTRUCTIONS
-----------------------------------------------------
This issue was automatically identified and classified by the Urban EYE
Intelligent Urban Surveillance Network. No manual triage step was required.
Please dispatch field inspection / repair crew to the location above.
=====================================================`;
}

/**
 * Formats an escalation notification text
 */
function generateEscalationText({ id, type, oldSeverity, newSeverity, reportCount, address }) {
  return `=====================================================
URBAN EYE - INCIDENT ESCALATION NOTICE
Incident Ref: #${id}
=====================================================
ATTENTION: Incident #${id} (${type}) at ${address} has been
escalated to ${newSeverity.toUpperCase()} (previously ${oldSeverity.toUpperCase()})
due to ${reportCount} distinct citizen reports.

Priority field inspection recommended.
=====================================================`;
}

module.exports = {
  getDepartmentForType,
  generateReportText,
  generateEscalationText,
  departments
};
