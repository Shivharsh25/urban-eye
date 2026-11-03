/**
 * Bootstrap Super Admin & Standard Municipal Departments
 * Seeds initial Super Admin, default municipal departments, and AI routing rules.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Department = require('../models/Department');
const RoutingRule = require('../models/RoutingRule');
const AuditLog = require('../models/AuditLog');

const DEFAULT_DEPARTMENTS = [
  {
    name: 'Roads & Public Works Department',
    code: 'roads',
    description: 'Autonomous road surface maintenance, asphalt patch repairs, pothole filling, and carriageway restoration.',
    categories: ['pothole', 'road_damage'],
    contactEmail: 'pwd.roads@urbaneye.local',
    contactPhone: '+91 120 2501001',
    slaHours: 48,
    status: 'active'
  },
  {
    name: 'Sanitation & Solid Waste Department',
    code: 'sanitation',
    description: 'Municipal waste clearance, illegal dumping remediation, compactor vehicle dispatch, and community sanitation.',
    categories: ['garbage', 'waste_dump'],
    contactEmail: 'sanitation@urbaneye.local',
    contactPhone: '+91 120 2501002',
    slaHours: 24,
    status: 'active'
  },
  {
    name: 'Electrical & Street Lighting Department',
    code: 'electrical',
    description: 'Sodium lamp repairs, high-mast tower lighting, junction box remediation, and electrical grid safety.',
    categories: ['streetlight', 'electrical_fault'],
    contactEmail: 'electrical@urbaneye.local',
    contactPhone: '+91 120 2501003',
    slaHours: 24,
    status: 'active'
  },
  {
    name: 'Water & Drainage Works Department',
    code: 'water',
    description: 'Underground pipeline leakage containment, storm drain de-silting, water logging, and supply line repairs.',
    categories: ['water_leak', 'drainage'],
    contactEmail: 'jalboard@urbaneye.local',
    contactPhone: '+91 120 2501004',
    slaHours: 36,
    status: 'active'
  },
  {
    name: 'Parks & Environmental Care Department',
    code: 'parks',
    description: 'Public park infrastructure maintenance, fallen tree clearance, fencing repairs, and environmental safety.',
    categories: ['park_damage', 'tree_fall'],
    contactEmail: 'horticulture@urbaneye.local',
    contactPhone: '+91 120 2501005',
    slaHours: 72,
    status: 'active'
  }
];

async function bootstrap() {
  console.log('[Bootstrap] Initializing database connection...');
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('[Bootstrap] Connected to MongoDB Atlas.');
    } catch (e) {
      console.warn('[Bootstrap] Atlas connection failed, starting in-memory fallback:', e.message);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('[Bootstrap] Connected to in-memory fallback.');
    }
  } else {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('[Bootstrap] Connected to in-memory fallback.');
  }

  // 1. Seed Departments
  console.log('[Bootstrap] Seeding municipal departments...');
  const deptMap = {};
  for (const deptData of DEFAULT_DEPARTMENTS) {
    let dept = await Department.findOne({ code: deptData.code });
    if (!dept) {
      dept = await Department.create(deptData);
      console.log(`[Bootstrap] Created department: ${dept.name} (${dept.code})`);
    } else {
      console.log(`[Bootstrap] Department already exists: ${dept.name} (${dept.code})`);
    }
    deptMap[dept.code] = dept;
  }

  // 2. Seed Routing Rules
  console.log('[Bootstrap] Seeding category routing rules...');
  const ROUTING_RULES = [
    { key: 'pothole', label: 'Pothole & Road Hazard', dept: 'roads', minConf: 0.15, sev: 'high' },
    { key: 'road_damage', label: 'Carriageway Breakdown', dept: 'roads', minConf: 0.20, sev: 'medium' },
    { key: 'garbage', label: 'Garbage & Solid Waste Dump', dept: 'sanitation', minConf: 0.15, sev: 'medium' },
    { key: 'waste_dump', label: 'Hazardous Waste Dump', dept: 'sanitation', minConf: 0.20, sev: 'high' },
    { key: 'streetlight', label: 'Street Light Outage', dept: 'electrical', minConf: 0.20, sev: 'low' },
    { key: 'electrical_fault', label: 'Exposed Electrical Hazard', dept: 'electrical', minConf: 0.20, sev: 'high' },
    { key: 'water_leak', label: 'Water Pipeline Leakage', dept: 'water', minConf: 0.20, sev: 'high' },
    { key: 'drainage', label: 'Blocked Municipal Drain', dept: 'water', minConf: 0.20, sev: 'medium' },
    { key: 'park_damage', label: 'Public Park Defect', dept: 'parks', minConf: 0.25, sev: 'low' },
    { key: 'tree_fall', label: 'Fallen Tree Obstruction', dept: 'parks', minConf: 0.25, sev: 'high' }
  ];

  for (const r of ROUTING_RULES) {
    const dept = deptMap[r.dept];
    if (dept) {
      const existing = await RoutingRule.findOne({ categoryKey: r.key });
      if (!existing) {
        await RoutingRule.create({
          categoryKey: r.key,
          categoryLabel: r.label,
          departmentId: dept.id || dept._id,
          departmentName: dept.name,
          minConfidenceThreshold: r.minConf,
          defaultSeverity: r.sev,
          autoDispatchEnabled: true,
          keywords: [r.key, r.dept]
        });
        console.log(`[Bootstrap] Created routing rule: ${r.key} -> ${dept.name}`);
      }
    }
  }

  // 3. Seed Initial Super Admin
  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@urbaneye.local').toLowerCase().trim();
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@2026!';

  let superAdmin = await User.findOne({ email: superAdminEmail });
  const hash = await bcrypt.hash(superAdminPassword, 10);

  if (!superAdmin) {
    superAdmin = await User.create({
      name: 'Super Administrator',
      email: superAdminEmail,
      phone: '+91 99999 00001',
      passwordHash: hash,
      role: 'super_admin',
      status: 'active'
    });
    console.log(`[Bootstrap] Created root Super Admin: ${superAdminEmail}`);
  } else {
    superAdmin.role = 'super_admin';
    superAdmin.status = 'active';
    superAdmin.passwordHash = hash;
    await superAdmin.save();
    console.log(`[Bootstrap] Updated root Super Admin: ${superAdminEmail}`);
  }

  // 4. Seed Roads Department Admin for instant demonstration
  const roadsDept = deptMap['roads'];
  if (roadsDept) {
    const roadsAdminEmail = 'roads.admin@urbaneye.local';
    let roadsAdmin = await User.findOne({ email: roadsAdminEmail });
    const roadsHash = await bcrypt.hash('DeptAdmin@2026!', 10);
    if (!roadsAdmin) {
      roadsAdmin = await User.create({
        name: 'Rajesh Mehra (PWD Chief)',
        email: roadsAdminEmail,
        phone: '+91 98765 43210',
        passwordHash: roadsHash,
        role: 'department_admin',
        departmentId: roadsDept.id || roadsDept._id,
        departmentName: roadsDept.name,
        status: 'active'
      });
      roadsDept.headAdminId = roadsAdmin.id || roadsAdmin._id;
      roadsDept.headAdminName = roadsAdmin.name;
      await roadsDept.save();
      console.log(`[Bootstrap] Created Roads Department Admin: ${roadsAdminEmail}`);
    }
  }

  // 5. Seed Sanitation Department Admin for instant demonstration
  const sanitationDept = deptMap['sanitation'];
  if (sanitationDept) {
    const sanitationAdminEmail = 'sanitation.admin@urbaneye.local';
    let sanitationAdmin = await User.findOne({ email: sanitationAdminEmail });
    const sanHash = await bcrypt.hash('DeptAdmin@2026!', 10);
    if (!sanitationAdmin) {
      sanitationAdmin = await User.create({
        name: 'Sunita Sharma (Sanitation Lead)',
        email: sanitationAdminEmail,
        phone: '+91 98765 43211',
        passwordHash: sanHash,
        role: 'department_admin',
        departmentId: sanitationDept.id || sanitationDept._id,
        departmentName: sanitationDept.name,
        status: 'active'
      });
      sanitationDept.headAdminId = sanitationAdmin.id || sanitationAdmin._id;
      sanitationDept.headAdminName = sanitationAdmin.name;
      await sanitationDept.save();
      console.log(`[Bootstrap] Created Sanitation Department Admin: ${sanitationAdminEmail}`);
    }
  }

  // 6. Record Audit Log
  await AuditLog.create({
    action: 'SYSTEM_BOOTSTRAP',
    actorId: superAdmin.id || superAdmin._id,
    actorName: superAdmin.name,
    actorRole: 'super_admin',
    targetEntity: 'system',
    targetId: 'bootstrap',
    details: {
      departmentsCount: DEFAULT_DEPARTMENTS.length,
      superAdminEmail
    }
  });

  console.log('=======================================================');
  console.log('✅ Urban EYE Bootstrap Completed Successfully!');
  console.log(`🔑 Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
  console.log(`🔑 Roads Admin: roads.admin@urbaneye.local / DeptAdmin@2026!`);
  console.log(`🔑 Sanitation Admin: sanitation.admin@urbaneye.local / DeptAdmin@2026!`);
  console.log('=======================================================');

  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Error]:', err);
  process.exit(1);
});
