const DataServer = require('../models/dataServer');

exports.getData = (req, res, next) => {
  const dataQuery = DataServer.find();
  let fectchedData;
  dataQuery
    .then(documents => {
      fectchedData = documents;
      return DataServer.countDocuments();
    })
    .then(() => {
      res.status(200).json({
        message: 'Posts fetched succesfully!'
        , dataServer: fectchedData
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      });
    });
}
