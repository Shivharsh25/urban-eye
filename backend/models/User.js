const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure we have an id that matches _id if needed, or just use string id for backwards compatibility
UserSchema.pre('save', function() {
  if (!this.id) {
    this.id = uuidv4();
  }
});

// Backwards compatibility methods
UserSchema.statics.updateById = async function(id, updates) {
  // Try both string id and ObjectId if valid
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOneAndUpdate(query, updates, { new: true });
};

UserSchema.statics.findById = async function(id) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOne(query);
};

module.exports = mongoose.model('User', UserSchema);
