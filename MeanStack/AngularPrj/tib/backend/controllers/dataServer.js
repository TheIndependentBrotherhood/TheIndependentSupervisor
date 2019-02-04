const os = require('os');
const osUtils = require('os-utils');
const osu = require('node-os-utils')
const usage = require('os-usage');
const diskspace = require('diskspace');

const DataServer = require('../models/dataServer');

let tabTime = {"n1h": null, "n50m": null, "n40m": null, "n30m": null, "n20m": null, "n10m": null, "now": null};

async function readNSaveData() {
  var curCPUrate, curMemrate, curDiskrate;

  for (let key in tabTime) {
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
  }

  diskspace.check('/', function (err, result)
  {
    curDiskrate = (100 * result.used)/result.total;

    const cpu = osu.cpu
    cpu.usage()
      .then(cpuPercentage => {
        curCPUrate = cpuPercentage;
        curMemrate = (1 - (os.freemem() / os.totalmem())) * 100;

        for (let key in tabTime) {
          if (tabTime.hasOwnProperty(key) && key !== 'now') {
            // Décalage des infos
          } else {
            const newDataServer = new DataServer({
              time: key
              , rateCPU: curCPUrate
              , rateRAM: curMemrate
              , rateDiskStorage: curDiskrate
            });

            console.log('output: ');
            console.log(newDataServer);

            if (tabTime.now) {
              newDataServer['_id'] = tabTime.now['_id'];
              DataServer.updateOne({ _id: newDataServer['_id'] }, newDataServer)
                .then(result => {
                  if (result.n > 0) {
                    console.log('Update succesful!');
                  } else {
                    console.log('Not authorized!');
                  }
                })
                .catch(error => {
                  console.log('Couldn\'t update application!');
                });
            } else {
              newDataServer.save().then(() => {
                console.log('DataServer saved !');
              });
            }
          }
        }
      })
  });
}

setInterval(readNSaveData, 10000);
// setInterval(readNSaveData, 600000);

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
