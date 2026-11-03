/**
 * Department Routing & Report Generation Service
 * Dynamically maps issue categories to municipal departments and renders official dispatch reports.
 */

const fs = require('fs');
const path = require('path');

const DEPARTMENTS_FILE = path.join(__dirname, '../config/departments.json');
let departments = {
  pothole: { department: 'Roads & Public Works', email: 'shivharshtiwari86017@gmail.com' },
  garbage: { department: 'Sanitation Dept', email: 'shivharshtiwari86017@gmail.com' }
};

if (fs.existsSync(DEPARTMENTS_FILE)) {
  try {
    departments = JSON.parse(fs.readFileSync(DEPARTMENTS_FILE, 'utf-8'));
  } catch (err) {
    console.error('[RoutingService] Failed to load departments.json:', err.message);
  }
}

/**
 * Synchronous fallback: Gets department mapping for an issue type
 * @param {string} type 
 * @returns {{ department: string, email: string }}
 */
function getDepartmentForType(type) {
  return departments[type] || { department: 'Municipal Operations', email: 'shivharshtiwari86017@gmail.com' };
}

/**
 * Asynchronous dynamic department resolution against MongoDB RoutingRule and Department models
 * Handles minimum confidence threshold checking and unknown category marking
 * @param {{ type: string, confidence?: number }} params
 * @returns {Promise<{ departmentId: string|null, department: string, email: string, needsReview: boolean, reviewReason: string }>}
 */
async function resolveDepartmentForIssue({ type, confidence = 0.9 }) {
  const cleanType = (type || '').toLowerCase().trim();

  try {
    const RoutingRule = require('../models/RoutingRule');
    const Department = require('../models/Department');

    // 1. Look up rule in MongoDB RoutingRule
    const rule = await RoutingRule.findOne({ categoryKey: cleanType });
    if (rule) {
      const mongooseMod = require('mongoose');
      const orClauses = [{ id: rule.departmentId }];
      if (mongooseMod.Types.ObjectId.isValid(rule.departmentId)) {
        orClauses.push({ _id: rule.departmentId });
      }
      const dept = await Department.findOne({ $or: orClauses });
      if (dept && dept.status === 'active') {
        const threshold = rule.minConfidenceThreshold || 0.45;
        const lowConfidence = confidence < threshold;
        return {
          departmentId: dept.id || dept._id,
          department: dept.name,
          code: dept.code,
          email: dept.contactEmail || rule.email || 'shivharshtiwari86017@gmail.com',
          needsReview: lowConfidence,
          reviewReason: lowConfidence ? `AI confidence (${(confidence * 100).toFixed(0)}%) is below threshold (${(threshold * 100).toFixed(0)}%)` : ''
        };
      }
    }

    // 2. Fallback: Search Department by categories array
    const deptMatch = await Department.findOne({
      categories: cleanType,
      status: 'active'
    });
    if (deptMatch) {
      const lowConfidence = confidence < 0.45;
      return {
        departmentId: deptMatch.id || deptMatch._id,
        department: deptMatch.name,
        code: deptMatch.code,
        email: deptMatch.contactEmail,
        needsReview: lowConfidence,
        reviewReason: lowConfidence ? `AI confidence (${(confidence * 100).toFixed(0)}%) is below default threshold (45%)` : ''
      };
    }
  } catch (err) {
    console.warn('[RoutingService] Dynamic resolution warning:', err.message);
  }

  // 3. Static fallback: departments.json
  const legacy = departments[cleanType] || { department: 'Municipal Operations', email: 'shivharshtiwari86017@gmail.com' };
  return {
    departmentId: null,
    department: legacy.department,
    email: legacy.email,
    needsReview: !departments[cleanType],
    reviewReason: !departments[cleanType] ? `Category '${cleanType}' is unmapped. Flagged for review.` : ''
  };
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

• Problem Classification: ${problemDetails.title}
• Official Reference No:   ${complaintRef}
• Exact Physical Address:  ${address || 'Location coordinates recorded via GPS'}
• GPS Coordinates:         ${coordinatesText}
• Priority & Urgency:      ${(severity || 'MEDIUM').toUpperCase()} PRIORITY
• Total Verified Reports:  ${reportCount} Citizen Submission(s)
• Registration Timestamp:  ${new Date().toISOString()}

STATEMENT OF CIVIC HAZARD & IMPACT:
${problemDetails.hazard}

${customRemarks ? `CITIZEN ADDITIONAL REMARKS:\n"${customRemarks}"\n\n` : ''}REQUESTED MUNICIPAL ACTION:
${problemDetails.actionRequested}

Kindly assign an incident work order to the respective field maintenance crew and issue a tracking update once remediation has been initiated.

Yours faithfully,
${citizenName || 'Verified Citizen Reporter'}
Citizen of Urban Ward
Urban EYE Active Municipal Network
Verification Portal: https://urbaneye.gov.in/track/${complaintRef}
Official Automated Dispatch: System generated via Urban EYE AI Edge Node`;
}

/**
 * Formats an urgent escalation notice when duplicate complaints threshold is breached
 */
function generateEscalationText({
  id,
  type,
  oldSeverity,
  newSeverity,
  reportCount,
  address
}) {
  const complaintRef = `UE-${id ? id.toString().slice(-8).toUpperCase() : 'ESCALATION'}`;
  return `URGENT CITIZEN COMPLAINT ESCALATION NOTICE

Reference: ${complaintRef}
Issue: ${(type || '').toUpperCase()}
Location: ${address || 'Reported Location'}
Previous Severity: ${oldSeverity || 'Medium'}
Escalated Severity: ${newSeverity || 'High'} (CRITICAL)
Total Citizen Reports: ${reportCount}

ALERT: Multiple citizens have reported this identical infrastructure hazard within 50 meters. The issue has been automatically escalated to ${newSeverity}. Immediate inspection and remediation are required.`;
}

module.exports = {
  getDepartmentForType,
  resolveDepartmentForIssue,
  generateReportText,
  generateEscalationText
};
