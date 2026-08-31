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
  if (this.isModified('lat') || this.isModified('lng')) {
    this.location = {
      type: 'Point',
      coordinates: [this.lng, this.lat]
    };
  }
  next();
});

const Detection = mongoose.model('Detection_Test4', DetectionSchema);

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test_db', { family: 4 });
  
  const newDetectionData = {
      id: "ABCDEF",
      lat: 40.7128,
      lng: -74.006,
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128]
      }
  };

  try {
    const created = await Detection.create(newDetectionData);
    console.log("Validation passed via create!", created.location);
  } catch (err) {
    console.error("VALIDATION ERROR:", err.message);
  }
  
  mongoose.disconnect();
}

run();
