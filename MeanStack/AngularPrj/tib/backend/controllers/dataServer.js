const os = require('os');
const osu = require('node-os-utils');
const diskspace = require('diskspace');

const DataServer = require('../models/dataServer');

const ApplicationController = require('../controllers/applications');

const interval = 60000;
const limit = 80.0;

function readNSaveData() {
  var curCPUrate, curMemrate, curDiskrate;

  /* for (let key in tabTime) {
    if (tabTime.hasOwnProperty(key)) {
      await DataServer.findOne({ time: key })
        .then(dataServer => {
          if (dataServer) {
            tabTime[key] = dataServer;
            console.log('dataTime: ' + dataServer);
          } else {
            console.log('Time ' + key + ' not found');
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  } */

  diskspace.check('/', function (err, result)
  {
    curDiskrate = (100 * result.used)/result.total;

    const cpu = osu.cpu
    cpu.usage()
      .then(cpuPercentage => {
        curCPUrate = cpuPercentage;
        curMemrate = (1 - (os.freemem() / os.totalmem())) * 100;

        const newDataServer = new DataServer({
          rateCPU: curCPUrate
          , rateRAM: curMemrate
          , rateDiskStorage: curDiskrate
        });

        newDataServer.save().then(() => {
          const appId = ApplicationController.findLastRunningApplication();
          if ( curCPUrate > limit || curMemrate > limit || curDiskrate > limit ) {
            if ( appId ) {
              ApplicationController.stopApplication(appId);
            }
          }
        });
      })
  });
}

setInterval(readNSaveData, interval);
// setInterval(readNSaveData, 600000);

exports.getData = (req, res, next) => {
  const dataQuery = DataServer.find();
  let fectchedData;
  dataQuery.limit(6);
  dataQuery
    .then(documents => {
      fectchedData = documents;
      return DataServer.countDocuments();
    })
    .then(() => {
      diskspace.check('/', function (err, result)
      {
        curDiskrate = (100 * result.used)/result.total;

        const cpu = osu.cpu
        cpu.usage()
          .then(cpuPercentage => {
            curCPUrate = cpuPercentage;
            curMemrate = (1 - (os.freemem() / os.totalmem())) * 100;

            const curData = new DataServer({
              rateCPU: curCPUrate
              , rateRAM: curMemrate
              , rateDiskStorage: curDiskrate
            });

            res.status(200).json({
              message: 'Data fetched succesfully!'
              , dataServer: fectchedData
              , curData: curData
            });
          })
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching data failed!'
      });
    });
}
