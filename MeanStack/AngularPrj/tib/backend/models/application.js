const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
  title: { type: String, require: true }
  , content: { type: String, require: true }
  , imagePath: { type: String, require: true }
  , date: { type: Date, default: Date.now }
  , creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  , isRunning: { type: Boolean, default: false }
});

module.exports = mongoose.model('Application', applicationSchema);
