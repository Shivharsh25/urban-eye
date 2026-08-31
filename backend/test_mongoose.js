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

DetectionSchema.pre('validate', function(next) {
  if (this.isModified('lat') || this.isModified('lng')) {
    this.location = {
      type: 'Point',
      coordinates: [this.lng, this.lat]
    };
  }
  next();
});

const Detection = mongoose.model('Detection', DetectionSchema);

async function run() {
  const doc = new Detection({
    lat: 40.7128,
    lng: -74.0060,
    location: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128]
    }
  });

  const err = doc.validateSync();
  if (err) {
    console.error("VALIDATION ERROR:", err);
  } else {
    console.log("Validation passed");
  }
}

run();
