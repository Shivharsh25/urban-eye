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

const Detection = mongoose.model('Detection_Test9', DetectionSchema);

async function run() {
  const newDetectionData = {
      lat: NaN,
      lng: NaN,
      location: {
        type: 'Point',
        coordinates: [NaN, NaN]
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
