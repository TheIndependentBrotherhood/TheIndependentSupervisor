const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: { type: String, require: true }
  , content: { type: String, require: true }
  , imagePath: { type: String, require: true }
  , date: { type: Date, default: Date.now }
  , creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Post', postSchema);
