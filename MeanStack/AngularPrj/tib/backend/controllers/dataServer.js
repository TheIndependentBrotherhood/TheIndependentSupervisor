const os = require('os');
const osu = require('node-os-utils');
const diskspace = require('diskspace');

const DataServer = require('../models/dataServer');

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

        console.log('output: ');
        console.log(newDataServer);

        newDataServer.save().then(() => {
          console.log('DataServer saved !');
        });
      })
  });
}

// setInterval(readNSaveData, 10000);
setInterval(readNSaveData, 600000);

exports.getData = (req, res, next) => {
  const dataQuery = DataServer.find();
  let fectchedData;
  dataQuery.limit(6);
  dataQuery
    .then(documents => {
      fectchedData = documents;
      console.log(fectchedData);
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

            console.log('output: ');
            console.log(curData);

            res.status(200).json({
              message: 'Data fetched succesfully!'
              , dataServer: fectchedData
              , curData: curData
            });
          })
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching data failed!'
      });
    });
}