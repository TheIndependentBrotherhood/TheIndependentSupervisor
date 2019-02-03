const mongoose = require('mongoose');

const dataServerSchema = mongoose.Schema({
  rateCPU: { type: Number[7] }
  , rateRAM: { type: Number[7] }
  , rateDiskStorage: { type: Number[7] }
});

module.exports = mongoose.model('DataServer', dataServerSchema);
