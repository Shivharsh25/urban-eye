const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DetectionSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
  imageUrl: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    default: 0.9
  },
  severity: {
    type: String,
    default: 'medium'
  },
  // GeoJSON Point for 2dsphere index
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'new'
  },
  reportText: {
    type: String,
    default: ''
  },
  submittedBy: {
    type: String,
    default: null
  },
  reporterIds: {
    type: [String],
    default: []
  },
  reportCount: {
    type: Number,
    default: 1
  },
  lastReportedAt: {
    type: Date,
    default: Date.now
  },
  assignedDepartment: {
    type: String,
    default: ''
  },
  dispatchStatus: {
    type: String,
    default: 'pending'
  },
  dispatchedAt: {
    type: Date,
    default: null
  },
  dispatchPreviewUrl: {
    type: String,
    default: null
  },
  resolutionNotifiedAt: {
    type: Date,
    default: null
  },
  bbox: {
    type: mongoose.Schema.Types.Mixed,
    default: { x: 0, y: 0, width: 100, height: 100 }
  }
}, { timestamps: true });

// Create 2dsphere index on location for geospatial queries
DetectionSchema.index({ location: '2dsphere' });

// Statics for findNearbyOpen
DetectionSchema.statics.findNearbyOpen = async function({ type, lat, lng, maxDistanceMeters = 50, maxAgeDays = 30 }) {
  const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  
  const matches = await this.find({
    type: type,
    status: { $ne: 'resolved' },
    $or: [
      { lastReportedAt: { $gte: cutoffDate } },
      { createdAt: { $gte: cutoffDate } }
    ],
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistanceMeters
      }
    }
  }).limit(1);

  return matches.length > 0 ? matches[0] : null;
};

// Backwards compatibility methods
DetectionSchema.statics.updateById = async function(id, updates) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOneAndUpdate(query, updates, { new: true });
};

DetectionSchema.statics.findById = async function(id) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOne(query);
};

DetectionSchema.statics.deleteById = async function(id) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.deleteOne(query);
};

// Ensure id exists
DetectionSchema.pre('save', function(next) {
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

// Sync on update as well
DetectionSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.lat !== undefined || update.lng !== undefined || (update.$set && (update.$set.lat !== undefined || update.$set.lng !== undefined))) {
    const lat = update.lat !== undefined ? update.lat : (update.$set ? update.$set.lat : undefined);
    const lng = update.lng !== undefined ? update.lng : (update.$set ? update.$set.lng : undefined);
    
    if (lat !== undefined && lng !== undefined) {
      if (!update.$set) update.$set = {};
      update.$set.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    }
  }
  next();
});

module.exports = mongoose.model('Detection', DetectionSchema);
