const mongoose = require('mongoose');

const dataServerSchema = mongoose.Schema({
  time: { type: String }
  , rateCPU: { type: Number }
  , rateRAM: { type: Number }
  , rateDiskStorage: { type: Number }
});

module.exports = mongoose.model('DataServer', dataServerSchema);
