/**
 * Idempotent Database Seed Script for Urban EYE
 * Creates:
 * - 1 Admin Account: admin@urbaneye.local / Admin@123456
 * - 3 Citizen Accounts:
 *     sarah.jenkins@example.com / Citizen@123456
 *     david.kumar@example.com / Citizen@123456
 *     elena.rodriguez@example.com / Citizen@123456
 * - 18 Realistic Detections across the 4 issue categories (potholes, garbage, water leaks, streetlights):
 *     - Clustered issues with reportCount > 1 (e.g. 3, 5 reporters)
 *     - Various severities (high, medium, low)
 *     - Statuses: new, assigned, resolved (with verifiable resolution email previews)
 *     - Real coordinates around a metropolitan city (e.g. downtown grid)
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { getDepartmentForType, generateReportText } = require('../services/routingService');
const { dispatchIncidentReport, sendResolutionNotifications } = require('../services/dispatchService');

// Seed Users Definition
const SEED_USERS = [
  {
    id: 'user_admin_01',
    name: 'Chief Inspector Marcus Vance',
    email: 'admin@urbaneye.local',
    password: 'Admin@123456',
    role: 'admin'
  },
  {
    id: 'user_citizen_01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    password: 'Citizen@123456',
    role: 'user'
  },
  {
    id: 'user_citizen_02',
    name: 'David Kumar',
    email: 'david.kumar@example.com',
    password: 'Citizen@123456',
    role: 'user'
  },
  {
    id: 'user_citizen_03',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@example.com',
    password: 'Citizen@123456',
    role: 'user'
  }
];

// Base Metro Center Coordinates (e.g., Downtown Metropolitan Area)
const BASE_LAT = 40.7128;
const BASE_LNG = -74.0060;

const SAMPLE_ISSUES = [
  // Potholes
  {
    id: 'INC-POT-101',
    type: 'pothole',
    confidence: 0.94,
    severity: 'high',
    lat: BASE_LAT + 0.0042,
    lng: BASE_LNG - 0.0031,
    address: '428 Grand Ave & 4th St, Downtown Central',
    status: 'assigned',
    reportCount: 4,
    reporters: ['user_citizen_01', 'user_citizen_02', 'user_citizen_03'],
    bbox: { x: 120, y: 250, width: 320, height: 190 },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-POT-102',
    type: 'pothole',
    confidence: 0.88,
    severity: 'medium',
    lat: BASE_LAT - 0.0028,
    lng: BASE_LNG + 0.0054,
    address: '112 Market Street, North Ward',
    status: 'assigned',
    reportCount: 1,
    reporters: ['user_citizen_01'],
    bbox: { x: 160, y: 310, width: 220, height: 140 },
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-POT-103',
    type: 'pothole',
    confidence: 0.96,
    severity: 'high',
    lat: BASE_LAT + 0.0085,
    lng: BASE_LNG + 0.0022,
    address: '890 Riverside Expressway near Pier 7',
    status: 'resolved',
    reportCount: 5,
    reporters: ['user_citizen_02', 'user_citizen_03'],
    bbox: { x: 100, y: 200, width: 400, height: 260 },
    imageUrl: 'https://images.unsplash.com/photo-1584463699052-2a7818e69fa0?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-POT-104',
    type: 'pothole',
    confidence: 0.79,
    severity: 'low',
    lat: BASE_LAT - 0.0065,
    lng: BASE_LNG - 0.0078,
    address: '54 Pine Street, South Bay Residential',
    status: 'new',
    reportCount: 1,
    reporters: ['user_citizen_03'],
    bbox: { x: 220, y: 360, width: 140, height: 110 },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  },

  // Garbage / Illegal Dumping
  {
    id: 'INC-GAR-201',
    type: 'garbage',
    confidence: 0.92,
    severity: 'high',
    lat: BASE_LAT + 0.0015,
    lng: BASE_LNG + 0.0088,
    address: 'Alleyway behind 320 Industrial Rd, East Sector',
    status: 'assigned',
    reportCount: 3,
    reporters: ['user_citizen_01', 'user_citizen_02'],
    bbox: { x: 80, y: 150, width: 450, height: 320 },
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-GAR-202',
    type: 'garbage',
    confidence: 0.86,
    severity: 'medium',
    lat: BASE_LAT - 0.0045,
    lng: BASE_LNG - 0.0012,
    address: '76 Metro Parkway, Parkside Gate',
    status: 'assigned',
    reportCount: 2,
    reporters: ['user_citizen_03'],
    bbox: { x: 190, y: 280, width: 280, height: 210 },
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-GAR-203',
    type: 'garbage',
    confidence: 0.90,
    severity: 'low',
    lat: BASE_LAT + 0.0071,
    lng: BASE_LNG - 0.0064,
    address: '204 Highland Ave, North Heights',
    status: 'resolved',
    reportCount: 1,
    reporters: ['user_citizen_01'],
    bbox: { x: 250, y: 340, width: 180, height: 150 },
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-GAR-204',
    type: 'garbage',
    confidence: 0.95,
    severity: 'high',
    lat: BASE_LAT - 0.0082,
    lng: BASE_LNG + 0.0041,
    address: 'Corner of 14th & Harbor Blvd',
    status: 'assigned',
    reportCount: 4,
    reporters: ['user_citizen_01', 'user_citizen_02', 'user_citizen_03'],
    bbox: { x: 110, y: 180, width: 380, height: 290 },
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80'
  },

  // Water Leakage
  {
    id: 'INC-WAT-301',
    type: 'water_leak',
    confidence: 0.97,
    severity: 'high',
    lat: BASE_LAT + 0.0033,
    lng: BASE_LNG + 0.0048,
    address: 'Hydrant burst at 505 Civic Center Plaza',
    status: 'assigned',
    reportCount: 6,
    reporters: ['user_citizen_01', 'user_citizen_02', 'user_citizen_03'],
    bbox: { x: 140, y: 120, width: 350, height: 300 },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-WAT-302',
    type: 'water_leak',
    confidence: 0.85,
    severity: 'medium',
    lat: BASE_LAT - 0.0019,
    lng: BASE_LNG - 0.0055,
    address: 'Curbside water main seepage, 68 Oakland Way',
    status: 'assigned',
    reportCount: 1,
    reporters: ['user_citizen_02'],
    bbox: { x: 180, y: 240, width: 230, height: 180 },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-WAT-303',
    type: 'water_leak',
    confidence: 0.92,
    severity: 'high',
    lat: BASE_LAT + 0.0062,
    lng: BASE_LNG - 0.0018,
    address: 'Ruptured valve near Metro Transit Hub',
    status: 'resolved',
    reportCount: 3,
    reporters: ['user_citizen_01', 'user_citizen_03'],
    bbox: { x: 130, y: 160, width: 310, height: 260 },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-WAT-304',
    type: 'water_leak',
    confidence: 0.81,
    severity: 'low',
    lat: BASE_LAT - 0.0074,
    lng: BASE_LNG - 0.0038,
    address: 'Sprinkler runoff overflow, 412 South Park Lane',
    status: 'new',
    reportCount: 1,
    reporters: ['user_citizen_03'],
    bbox: { x: 210, y: 320, width: 170, height: 140 },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80'
  },

  // Streetlights
  {
    id: 'INC-LGT-401',
    type: 'streetlight',
    confidence: 0.93,
    severity: 'high',
    lat: BASE_LAT - 0.0035,
    lng: BASE_LNG + 0.0072,
    address: 'Pole #48 broken luminaire, 600 Commerce Way',
    status: 'assigned',
    reportCount: 3,
    reporters: ['user_citizen_02', 'user_citizen_03'],
    bbox: { x: 300, y: 60, width: 150, height: 360 },
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-LGT-402',
    type: 'streetlight',
    confidence: 0.89,
    severity: 'medium',
    lat: BASE_LAT + 0.0051,
    lng: BASE_LNG + 0.0015,
    address: 'Flickering high-mast lamp at School Crossing, 8th Ave',
    status: 'assigned',
    reportCount: 2,
    reporters: ['user_citizen_01'],
    bbox: { x: 280, y: 90, width: 130, height: 320 },
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-LGT-403',
    type: 'streetlight',
    confidence: 0.91,
    severity: 'medium',
    lat: BASE_LAT - 0.0058,
    lng: BASE_LNG + 0.0019,
    address: 'Damaged light fixture, 19 University Boulevard',
    status: 'resolved',
    reportCount: 2,
    reporters: ['user_citizen_01', 'user_citizen_02'],
    bbox: { x: 260, y: 70, width: 160, height: 340 },
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-LGT-404',
    type: 'streetlight',
    confidence: 0.78,
    severity: 'low',
    lat: BASE_LAT + 0.0029,
    lng: BASE_LNG - 0.0081,
    address: 'Non-functioning pedestrian lantern, Riverfront Walkway',
    status: 'new',
    reportCount: 1,
    reporters: ['user_citizen_03'],
    bbox: { x: 310, y: 110, width: 110, height: 280 },
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-POT-105',
    type: 'pothole',
    confidence: 0.91,
    severity: 'high',
    lat: BASE_LAT + 0.0069,
    lng: BASE_LNG + 0.0065,
    address: 'Major asphalt depression, North Bridge Approach',
    status: 'assigned',
    reportCount: 3,
    reporters: ['user_citizen_01', 'user_citizen_02'],
    bbox: { x: 130, y: 220, width: 340, height: 210 },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'INC-GAR-205',
    type: 'garbage',
    confidence: 0.93,
    severity: 'high',
    lat: BASE_LAT - 0.0061,
    lng: BASE_LNG - 0.0052,
    address: 'Construction debris dump, West Warehouse Zone',
    status: 'assigned',
    reportCount: 4,
    reporters: ['user_citizen_02', 'user_citizen_03'],
    bbox: { x: 90, y: 170, width: 420, height: 290 },
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80'
  }
];

async function runSeed() {
  console.log('===============================================================');
  console.log('🌱 Starting Urban EYE Idempotent Database Seeder...');
  console.log('===============================================================');

  // 1. Seed Users
  console.log('\n[1/3] Seeding User Accounts (Bcrypt Hashed)...');
  const salt = await bcrypt.genSalt(10);

  for (const u of SEED_USERS) {
    const existing = await db.User.findOne({ email: u.email });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, salt);
      await db.User.create({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role
      });
      console.log(`  ✓ Created [${u.role.toUpperCase()}]: ${u.email} (${u.name})`);
    } else {
      console.log(`  · [${u.role.toUpperCase()}] exists: ${u.email}`);
    }
  }

  // 2. Seed Realistic Incidents & Detections
  console.log('\n[2/3] Seeding 18 Realistic Detections with Geodata & Dispatch Reports...');
  let seededCount = 0;
  let resolvedIncident = null;

  for (const issue of SAMPLE_ISSUES) {
    const existing = await db.Detection.findById(issue.id);
    if (!existing) {
      const deptInfo = getDepartmentForType(issue.type);
      const reportText = generateReportText({
        id: issue.id,
        type: issue.type,
        severity: issue.severity,
        reportCount: issue.reportCount,
        address: issue.address,
        lat: issue.lat,
        lng: issue.lng,
        createdAt: new Date(Date.now() - seededCount * 3600000).toISOString(),
        imageUrl: issue.imageUrl,
        departmentName: deptInfo.department
      });

      const doc = await db.Detection.create({
        id: issue.id,
        imageUrl: issue.imageUrl,
        type: issue.type,
        confidence: issue.confidence,
        severity: issue.severity,
        lat: issue.lat,
        lng: issue.lng,
        address: issue.address,
        status: issue.status,
        reportText,
        submittedBy: issue.reporters[0],
        reporterIds: issue.reporters,
        reportCount: issue.reportCount,
        lastReportedAt: new Date(Date.now() - (seededCount % 5) * 1800000).toISOString(),
        assignedDepartment: deptInfo.department,
        dispatchStatus: 'sent',
        dispatchedAt: new Date(Date.now() - seededCount * 3600000).toISOString(),
        bbox: issue.bbox
      });

      if (issue.status === 'resolved' && !resolvedIncident) {
        resolvedIncident = doc;
      }
      seededCount++;
    }
  }
  console.log(`  ✓ Total detections available: ${SAMPLE_ISSUES.length}`);

  // 3. Generate Real Verifiable Email Preview for a Dispatched / Resolved Record
  console.log('\n[3/3] Generating Live Verifiable Nodemailer Ethereal Email Previews...');
  try {
    const sampleDetection = await db.Detection.findById('INC-POT-101');
    if (sampleDetection) {
      const deptInfo = getDepartmentForType(sampleDetection.type);
      const dispatchResult = await dispatchIncidentReport({
        detection: sampleDetection,
        departmentEmail: deptInfo.email,
        departmentName: deptInfo.department,
        reportText: sampleDetection.reportText
      });
      if (dispatchResult.previewUrl) {
        await db.Detection.updateById(sampleDetection.id, { dispatchPreviewUrl: dispatchResult.previewUrl });
        console.log(`  📧 Initial Municipal Dispatch Email Preview URL:`);
        console.log(`     🔗 ${dispatchResult.previewUrl}`);
      }
    }

    if (resolvedIncident) {
      const resolutionResults = await sendResolutionNotifications({ detection: resolvedIncident });
      if (resolutionResults.length > 0 && resolutionResults[0].previewUrl) {
        await db.Detection.updateById(resolvedIncident.id, { resolutionNotifiedAt: new Date().toISOString() });
        console.log(`  🎉 Citizen Resolution Notification Email Preview URL:`);
        console.log(`     🔗 ${resolutionResults[0].previewUrl}`);
      }
    }
  } catch (err) {
    console.warn(`  [Email Preview Note] Ethereal preview generation deferred: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log('✅ SEED COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
  console.log('🔑 DEMO LOGIN CREDENTIALS:');
  console.log('---------------------------------------------------------------');
  console.log('  👑 ADMIN (Full Command Center & Triage):');
  console.log('     Email:    admin@urbaneye.local');
  console.log('     Password: Admin@123456\n');
  console.log('  👤 CITIZEN 1 (Uploads & My Reports):');
  console.log('     Email:    sarah.jenkins@example.com');
  console.log('     Password: Citizen@123456\n');
  console.log('  👤 CITIZEN 2 (Multi-report clustering):');
  console.log('     Email:    david.kumar@example.com');
  console.log('     Password: Citizen@123456\n');
  console.log('  👤 CITIZEN 3 (Multi-report clustering):');
  console.log('     Email:    elena.rodriguez@example.com');
  console.log('     Password: Citizen@123456');
  console.log('===============================================================\n');
}

if (require.main === module) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error('Seed script error:', err);
    process.exit(1);
  });
}

module.exports = runSeed;
