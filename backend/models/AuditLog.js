const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AuditLogSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  actorId: {
    type: String,
    required: true,
    index: true
  },
  actorName: {
    type: String,
    default: 'Administrator'
  },
  actorRole: {
    type: String,
    required: true
  },
  targetEntity: {
    type: String,
    required: true,
    index: true // 'department' | 'admin_request' | 'detection' | 'user' | 'routing_rule'
  },
  targetId: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, { timestamps: { createdAt: true, updatedAt: false } }); // Immutable audit log

AuditLogSchema.pre('validate', function() {
  if (!this.id) {
    this.id = uuidv4();
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);

