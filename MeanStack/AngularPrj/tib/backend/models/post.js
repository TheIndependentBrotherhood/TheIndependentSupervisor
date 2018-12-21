const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);
