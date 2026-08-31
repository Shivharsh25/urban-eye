const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DetectionSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
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

DetectionSchema.pre('validate', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  // Sync lat/lng with location coordinates
  if (this.isModified('lat') || this.isModified('lng')) {
    this.location = {
      type: 'Point',
      coordinates: [this.lng, this.lat]
    };
  }
  next();
});

const Detection = mongoose.model('Detection_Test', DetectionSchema);

async function run() {
  const newDetectionData = {
      id: "ABCDEF",
      lat: 40.7128,
      lng: -74.006,
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128]
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
