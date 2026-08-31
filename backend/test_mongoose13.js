const mongoose = require('mongoose');

const DetectionSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const Detection = mongoose.model('Detection_Test13', DetectionSchema);

async function run() {
  const newDetectionData = {
      lat: 40,
      lng: -74,
      location: {
        type: 'Point',
        coordinates: [] // empty array
      }
  };

  const doc = new Detection(newDetectionData);
  
  const err = doc.validateSync();
  if (err) {
    console.error("VALIDATION ERROR:", err.message);
  } else {
    console.log("Validation passed");
  }
}

run();
