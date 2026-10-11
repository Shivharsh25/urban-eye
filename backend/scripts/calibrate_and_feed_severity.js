const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Detection = require('../models/Detection');
const { calculateSeverity, getSeverityTier } = require('../services/severityService');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.\n');

    const detections = await Detection.find({}).sort({ createdAt: -1 });
    console.log(`Calculating and feeding severity percentages for all ${detections.length} issues...\n`);

    const results = [];
    const tierCounts = { low: 0, medium: 0, high: 0 };

    for (let i = 0; i < detections.length; i++) {
      const d = detections[i];
      const oldSev = d.severity || 'unassigned';

      // Compute new percentage severity
      const newSev = calculateSeverity({
        type: d.type,
        confidence: d.confidence,
        bbox: d.bbox,
        reportCount: d.reportCount || 1
      });

      const tier = getSeverityTier(newSev);
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;

      // Update the document in MongoDB Atlas
      d.severity = newSev;
      await d.save();

      const w = d.bbox?.width || 0;
      const h = d.bbox?.height || 0;
      const area = Math.round(w * h);

      results.push({
        num: i + 1,
        id: (d.id || d._id.toString()).slice(0, 10),
        type: d.type,
        oldSev,
        newSev,
        tier: tier.toUpperCase(),
        area,
        dim: `${Math.round(w)}x${Math.round(h)}`,
        reports: d.reportCount || 1,
        location: (d.address || `${d.lat?.toFixed(3)}, ${d.lng?.toFixed(3)}`).slice(0, 32)
      });
    }

    console.log('========================================================================================================================');
    console.log('| #  | ID         | Issue Type  | Previous Sev | Severity (%) | Tier   | Area (px²) | Dims     | Rpts | Location');
    console.log('========================================================================================================================');

    results.forEach(r => {
      console.log(
        `| ${r.num.toString().padStart(2)} ` +
        `| ${r.id.padEnd(10)} ` +
        `| ${r.type.padEnd(11)} ` +
        `| ${r.oldSev.padEnd(12)} ` +
        `| ${r.newSev.padStart(12)} ` +
        `| ${r.tier.padEnd(6)} ` +
        `| ${r.area.toString().padStart(10)} ` +
        `| ${r.dim.padEnd(8)} ` +
        `| ${r.reports.toString().padStart(4)} ` +
        `| ${r.location}`
      );
    });

    console.log('========================================================================================================================\n');

    console.log('PERCENTAGE CALIBRATION SUMMARY:');
    console.log('-------------------------------');
    console.log('Total issues updated:', results.length);
    console.log('Tier distribution (<40% Low, 40-69% Medium, >=70% High):', tierCounts);

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

run();
