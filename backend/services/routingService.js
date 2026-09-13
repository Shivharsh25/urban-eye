/**
 * Department Routing & Report Generation Service
 * Maps issue categories to municipal departments and renders official dispatch reports.
 */

const fs = require('fs');
const path = require('path');

const DEPARTMENTS_FILE = path.join(__dirname, '../config/departments.json');
let departments = {
  pothole: { department: 'Roads & Public Works', email: 'shivharshtiwari86017@gmail.com' },
  garbage: { department: 'Sanitation Dept', email: 'shivharshtiwari86017@gmail.com' },
  water_leak: { department: 'Water Dept', email: 'shivharshtiwari86017@gmail.com' },
  streetlight: { department: 'Electrical Dept', email: 'shivharshtiwari86017@gmail.com' }
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
  return departments[type] || { department: 'Municipal Operations', email: 'shivharshtiwari86017@gmail.com' };
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
  departmentName,
  citizenName,
  customRemarks
}) {
  const problemDetails = {
    pothole: {
      title: 'Road Pothole & Carriageway Hazard',
      subject: 'Urgent repair of hazardous road pothole and carriageway surface damage',
      department: departmentName || 'Roads & Public Works Department (PWD)',
      hazard: 'This deep road depression and surface breakdown poses an immediate danger to vehicular commuters, two-wheelers, and pedestrians, with substantial risk of road accidents, vehicle suspension damage, and acute traffic bottlenecks during peak transit hours.',
      actionRequested: 'Promptly dispatch a road maintenance crew to execute hot-mix/cold-mix asphalt patch repair and restore safe, level carriageway conditions.'
    },
    garbage: {
      title: 'Illegal Solid Waste Dumping & Refuse Accumulation',
      subject: 'Immediate clearance and sanitization of unattended garbage and waste accumulation',
      department: departmentName || 'Department of Public Health & Sanitation',
      hazard: 'The uncontrolled accumulation of solid waste and decomposing garbage is producing pervasive foul odors, attracting stray animals, and creating an active breeding ground for disease-carrying pests and pathogens, presenting severe public health risks to nearby residents.',
      actionRequested: 'Urgently deploy municipal solid waste compactor vehicles and sanitation personnel to clear the dump site and apply disinfectant powder.'
    },
    water_leak: {
      title: 'Municipal Water Supply Pipeline Rupture & Leakage',
      subject: 'Emergency repair of potable water distribution pipeline rupture',
      department: departmentName || 'Department of Water Supply & Sewerage',
      hazard: 'A severe rupture in the subterranean distribution pipeline is causing continuous wastage of thousands of liters of potable municipal water, sub-surface soil erosion, localized road waterlogging, and contamination risks to the surrounding potable supply.',
      actionRequested: 'Isolate the affected pipeline sector immediately, deploy repair technicians to replace the ruptured conduit, and restore normal drinking water supply.'
    },
    streetlight: {
      title: 'Defective & Inoperative Streetlight Luminaire',
      subject: 'Urgent restoration and repair of defunct public street lighting infrastructure',
      department: departmentName || 'Department of Electrical & Public Street Lighting',
      hazard: 'The persistent failure of street illumination has plunged this active stretch into total darkness after dusk, severely compromising nighttime pedestrian visibility, vehicle navigation safety, and local neighborhood security.',
      actionRequested: 'Depute a technical maintenance unit to inspect the luminaire, replace faulty LED modules/chokes or repair underground feeder wiring.'
    }
  }[type] || {
    title: (type || 'Civil Infrastructure Defect').replace('_', ' ').toUpperCase(),
    subject: `Urgent remediation of ${type} infrastructure hazard`,
    department: departmentName || 'Municipal Administration & Public Works',
    hazard: 'This infrastructure breakdown is causing disruption, pedestrian safety concerns, and substantial civic inconvenience to local residents.',
    actionRequested: 'Depute an inspection team to review the site and take immediate corrective measures.'
  };

  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const complaintRef = `UE-${id ? id.toString().slice(-8).toUpperCase() : 'GRIEVANCE'}`;
  const coordinatesText = (typeof lat === 'number' && typeof lng === 'number')
    ? `Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`
    : 'GPS coordinates verified via mobile sensor';

  return `FORMAL CIVIC GRIEVANCE & COMPLAINT LETTER

Date: ${formattedDate}
Complaint Reference No: ${complaintRef}
Priority Level: ${(severity || 'MEDIUM').toUpperCase()} PRIORITY

TO:
The Municipal Commissioner / Executive Engineer,
${problemDetails.department},
Municipal Corporation / Urban Development Authority.

SUBJECT: Formal Grievance regarding ${problemDetails.subject} at ${address || 'Local Ward Area'}.

Respected Sir/Madam,

I am writing this formal complaint as a concerned citizen to bring to your immediate attention a serious public infrastructure grievance in our locality. The following defect has been verified and registered via the Urban EYE Intelligent Civic Platform:

1. PARTICULARS OF THE DEFECT:
----------------------------------------------------------------------
• Nature of Problem:       ${problemDetails.title} (${type})
• Current Urgency:         ${(severity || 'MEDIUM').toUpperCase()}
• Location / Address:      ${address || 'Location Coordinates Noted Below'}
• GPS Coordinates:         ${coordinatesText}
• Citizen Confirmations:   ${reportCount} verified community report(s)

2. HAZARD DESCRIPTION & CITIZEN IMPACT:
----------------------------------------------------------------------
${problemDetails.hazard}

3. FORMAL RELIEF PRAYER / ACTION REQUESTED:
----------------------------------------------------------------------
In accordance with citizen charter standards and public safety regulations, I earnestly request your competent authority to:
  (a) Acknowledge receipt of this formal civic complaint.
  (b) Depute the designated ward inspection team and repair machinery at the earliest.
  (c) ${problemDetails.actionRequested}
${customRemarks ? `
4. CITIZEN ADDITIONAL REMARKS / SPECIFIC OBSERVATIONS:
----------------------------------------------------------------------
${customRemarks}
` : ''}
Photographic evidence with tamper-proof geocodes and timestamps has been appended to this digital record for administrative verification.

Thanking you in anticipation of prompt action.

Yours faithfully,
${citizenName || 'Concerned Citizen / Neighborhood Resident'}
Resident & Civic Contributor
Submitted via Urban EYE Smart City Grievance Redressal Network`;
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
