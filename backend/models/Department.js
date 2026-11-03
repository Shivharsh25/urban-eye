const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DepartmentSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true // e.g. 'roads', 'sanitation', 'electrical', 'water', 'parks'
  },
  description: {
    type: String,
    default: ''
  },
  categories: {
    type: [String], // e.g. ['pothole', 'road_damage']
    default: []
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    default: ''
  },
  headAdminId: {
    type: String,
    default: null
  },
  headAdminName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  slaHours: {
    type: Number,
    default: 48
  },
  activeReportsCount: {
    type: Number,
    default: 0
  },
  resolvedReportsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

DepartmentSchema.pre('validate', function() {
  if (!this.id) {
    this.id = uuidv4();
  }
});

DepartmentSchema.statics.findById = async function(id) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOne(query);
};

DepartmentSchema.statics.updateById = async function(id, updates) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOneAndUpdate(query, updates, { new: true });
};

module.exports = mongoose.model('Department', DepartmentSchema);

