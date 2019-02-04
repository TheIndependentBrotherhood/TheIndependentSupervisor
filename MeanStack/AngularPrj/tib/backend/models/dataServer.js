const mongoose = require('mongoose');

const dataServerSchema = mongoose.Schema({
  date: { type: Date, default: Date.now }
  , rateCPU: { type: Number }
  , rateRAM: { type: Number }
  , rateDiskStorage: { type: Number }
});

module.exports = mongoose.model('DataServer', dataServerSchema);
