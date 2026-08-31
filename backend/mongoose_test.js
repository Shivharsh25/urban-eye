const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DetectionSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  type: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const Detection = mongoose.model('DetectionTest8', DetectionSchema);

async function test() {
  try {
    const lat = null; // or undefined
    const lng = null;
    const matches = await Detection.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 50
        }
      }
    }).limit(1);
    console.log('Query success!');
  } catch (err) {
    console.error('Query failed:', err.message);
  }
}
test();
