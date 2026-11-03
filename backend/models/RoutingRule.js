const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RoutingRuleSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
  categoryKey: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  categoryLabel: {
    type: String,
    required: true
  },
  departmentId: {
    type: String,
    required: true
  },
  departmentName: {
    type: String,
    required: true
  },
  minConfidenceThreshold: {
    type: Number,
    default: 0.15
  },
  defaultSeverity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  autoDispatchEnabled: {
    type: Boolean,
    default: true
  },
  keywords: {
    type: [String],
    default: []
  }
}, { timestamps: true });

RoutingRuleSchema.pre('validate', function() {
  if (!this.id) {
    this.id = uuidv4();
  }
});

module.exports = mongoose.model('RoutingRule', RoutingRuleSchema);

