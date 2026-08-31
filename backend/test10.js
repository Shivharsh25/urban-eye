const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Detection = require('./models/Detection'); // Use the actual model

async function test() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  try {
    const newDetectionData = {
      type: 'pothole',
      confidence: 0.9,
      lat: null, // intentionally null
      lng: null,
      location: {
        type: 'Point',
        coordinates: [null, null] // intentionally null
      }
    };
    const created = await Detection.create(newDetectionData);
    console.log('Creation success!', created.location);
  } catch (err) {
    console.error('Creation failed:', err.message);
  }
  await mongoose.disconnect();
  await mongod.stop();
}
test();
