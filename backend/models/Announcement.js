const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AnnouncementSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    enum: ['info', 'warning', 'success', 'error']
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

AnnouncementSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = uuidv4();
  }
  next();
});

AnnouncementSchema.statics.deleteById = async function(id) {
  const query = { $or: [{ id: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or.push({ _id: id });
  }
  return this.deleteOne(query);
};

module.exports = mongoose.model('Announcement', AnnouncementSchema);
