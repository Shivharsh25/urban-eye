const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AdminRequestSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
  applicantName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  requestedDepartmentId: {
    type: String,
    required: true
  },
  requestedDepartmentName: {
    type: String,
    required: true
  },
  officialDesignation: {
    type: String,
    default: 'Civic Field Officer',
    trim: true
  },
  idBadgeUrl: {
    type: String,
    default: ''
  },
  verificationNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: String,
    default: null
  },
  reviewedByName: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

AdminRequestSchema.pre('validate', function() {
  if (!this.id) {
    this.id = uuidv4();
  }
});

AdminRequestSchema.statics.findById = async function(id) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOne(query);
};

AdminRequestSchema.statics.updateById = async function(id, updates) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.findOneAndUpdate(query, updates, { new: true });
};

module.exports = mongoose.model('AdminRequest', AdminRequestSchema);
