const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Detection = require('../models/Detection');

async function clean() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    const legacyFilter = { type: { $in: ['water_leak', 'streetlight'] } };
    const countBefore = await Detection.countDocuments(legacyFilter);
    console.log(`Found ${countBefore} legacy water_leak/streetlight records.`);

    const res = await Detection.deleteMany(legacyFilter);
    console.log(`Successfully purged ${res.deletedCount} legacy records.`);

    const remaining = await Detection.find({}).sort({ createdAt: -1 });
    console.log(`Remaining issues in DB: ${remaining.length} (Only pothole and garbage remain)`);
    
    const byType = {};
    const bySeverity = {};
    remaining.forEach(d => {
      byType[d.type] = (byType[d.type] || 0) + 1;
      bySeverity[d.severity] = (bySeverity[d.severity] || 0) + 1;
    });

    console.log('Distribution by type:', byType);
    console.log('Distribution by severity:', bySeverity);
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

clean();
