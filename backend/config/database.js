const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Detection = require('../models/Detection');
const Announcement = require('../models/Announcement');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('[MongoDB] MONGODB_URI is not defined in environment variables. Application will fail to connect if required.');
      return;
    }
    await mongoose.connect(mongoUri);
    console.log('[MongoDB] Connected successfully to cloud database.');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();

const db = {
  User,
  Detection,
  Announcement,

  // Helper for stats summary (backwards compatibility with routes)
  async getStatsSummary() {
    const detections = await Detection.find();

    const totalReports = detections.length;
    const totalIncidents = detections.reduce((sum, d) => sum + (d.reportCount || 1), 0);
    const newCount = detections.filter((d) => d.status === 'new').length;
    const assignedCount = detections.filter((d) => d.status === 'assigned').length;
    const resolvedCount = detections.filter((d) => d.status === 'resolved').length;
    const escalatedCount = detections.filter((d) => d.reportCount > 1).length;

    const bySeverity = {
      low: detections.filter((d) => d.severity === 'low').length,
      medium: detections.filter((d) => d.severity === 'medium').length,
      high: detections.filter((d) => d.severity === 'high').length
    };

    const byType = {
      pothole: detections.filter((d) => d.type === 'pothole').length,
      garbage: detections.filter((d) => d.type === 'garbage').length,
      water_leak: detections.filter((d) => d.type === 'water_leak').length,
      streetlight: detections.filter((d) => d.type === 'streetlight').length
    };

    const byDepartment = {};
    for (const d of detections) {
      const dept = d.assignedDepartment || 'Unassigned';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    }

    return {
      totalReports,
      totalIncidents,
      statusCounts: {
        new: newCount,
        assigned: assignedCount,
        resolved: resolvedCount,
        escalated: escalatedCount
      },
      bySeverity,
      byType,
      byDepartment,
      recentDetections: detections.slice(-10).reverse()
    };
  }
};

module.exports = db;
