// for delete an element : delete tab.b; => b is a key
// for add an element : tab.c = 'value'; => c is a key OR tab['c'] = 'value';
/*for (var key in runningApps) {
  if (runningApps.hasOwnProperty(key) && key === req.body.id) {
    isRunning = true;
  }
}*/

const Application = require('../models/application');
const spawn = require('child_process').spawn;
const respawn = require('respawn');
const psTree = require('ps-tree');
const fs = require('fs');

const kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};

let runningApps = {};

exports.createApplication = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const application = new Application({
    title: req.body.title
    , content: req.body.content
    , imagePath: url + "/images/" + req.file.filename
    , creator: req.userData.userId
    , isRunning: false
  });
  application.save().then(createdApplication => {
    // Creates /scripts/application.title, regardless of whether `/scripts` exist.
    fs.mkdir('./backend/scripts/' + application.title, { recursive: true }, (err) => {
      if (err) console.log('Create dir: ' + err);
    });

    const data = "#!/bin/bash \n echo \"Nothing in this script\"";

    fs.writeFile('./backend/scripts/' + application.title + '/start.sh', data, { mode: 0o765 }, (err) => {
      if (err) console.log('Create start script: ' + err);
    });

    fs.writeFile('./backend/scripts/' + application.title + '/stop.sh', data, { mode: 0o765 }, (err) => {
      if (err) console.log('Create stop script: ' + err);
    });

    fs.writeFile('./backend/scripts/' + application.title + '/update.sh', data, { mode: 0o765 }, (err) => {
      if (err) console.log('Create update script: ' + err);
    });

    res.status(201).json({
      message: 'Application added successfully!',
      application: {
        ...createdApplication,
        id: createdApplication._id
      }
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: 'Creating an application failed!'
    });
  });
}

exports.updateApplication = (req, res, next) => {
  let imagePath = req.body.imagePath;

  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + "/images/" + req.file.filename;
  }

  // WIP
  // Renomme l'image de l'application

  Application.findById(req.params.id)
    .then(oldApp => {
      if (oldApp && !oldApp.isRunning) {
        const application = new Application({
          _id: req.body.id
          , title: req.body.title
          , content: req.body.content
          , imagePath: imagePath
          , creator: req.userData.userId
          , isRunning: oldApp.isRunning
        });
        Application.updateOne({ _id: req.params.id, creator: req.userData.userId }, application)
          .then(result => {
            if (result.n > 0) {
              fs.rename('./backend/scripts/' + oldApp.title, './backend/scripts/' + req.body.title, (err) => {
                if (err) console.log('Rename dir: ' + err);
              });
              res.status(200).json({ message: 'Update succesful!' });
            } else {
              res.status(401).json({ message: 'Not authorized!' });
            }
          })
          .catch(error => {
            res.status(500).json({
              message: 'Couldn\'t update application!'
            })
          });
      } else if (!oldApp) {
        res.status(404).json({message: 'Application not found!'});
      } else {
        res.status(500).json({
          message: 'Currently running!'
        })
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching application failed!'
      });
  });
}

exports.getApplications = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const applicationQuery = Application.find();
  let fectchedApplications;
  if(pageSize && currentPage) {
    applicationQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  applicationQuery
    .then(documents => {
      fectchedApplications = documents;
      return Application.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: 'Applications fetched succesfully!'
        , applications: fectchedApplications
        , maxApplications: count
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching applications failed!'
      });
    });
}

exports.getApplication = (req, res, next) => {
  Application.findById(req.params.id)
    .then(application => {
      if (application) {
        res.status(200).json(application);
      } else {
        res.status(404).json({message: 'Application not found!'});
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching application failed!'
      });
    });
}

exports.deleteApplication = (req, res, next) => {
  let isRunning = false;

  Application.findById(req.params.id)
    .then(application => {
      if (application) {
        Application.deleteOne({ _id: req.params.id, creator: req.userData.userId })
          .then(result => {
            if (result.n > 0) {
              for (var key in runningApps) {
                if (runningApps.hasOwnProperty(key) && key === req.params.id) {
                  isRunning = true;
                }
              }

              // WIP
              // Manque la suppression de l'image de l'application
              /* fs.unlink('./backend/images/' + application.imagePath, (err) => {
                if (err) console.log('Delete image: ' + err);
              }); */

              fs.unlink('./backend/scripts/' + application.title + '/start.sh', (err) => {
                if (err) console.log('Delete start script: ' + err);
              });
              fs.unlink('./backend/scripts/' + application.title + '/stop.sh', (err) => {
                if (err) console.log('Delete stop script: ' + err);
              });
              fs.unlink('./backend/scripts/' + application.title + '/update.sh', (err) => {
                if (err) console.log('Delete update script: ' + err);
              });

              fs.rmdir('./backend/scripts/' + application.title, (err) => {
                if (err) console.log('Delete scripts folder: ' + err);
              });

              if (isRunning) {
                kill(runningApps[req.params.id].pid);
                delete runningApps[req.params.id];
              }

              res.status(200).json({ message: 'Deletion succesful!' });
            } else {
              res.status(401).json({ message: 'Not authorized!' });
            }
          })
          .catch(error => {
            res.status(500).json({
              message: 'Fetching applications failed!'
            });
        });
      } else {
        res.status(404).json({message: 'Application not found!'});
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching application failed!'
      });
    });
}

exports.startApplication = (req, res, next) => {
  Application.findById(req.params.id)
    .then(oldApp => {
      if (oldApp && !oldApp.isRunning) {
        const newApp = new Application({
          ...oldApp
          , _id: req.params.id
          , isRunning: true
        });
        Application.updateOne({ _id: req.params.id, creator: req.userData.userId }, newApp)
          .then(result => {
            if (result.n > 0) {
              // Start script and add in object
              // const child = spawn('ls', ['-lh', '/usr']);

              if (req.body.autoRestart) {
                const monitor = respawn([`./backend/scripts/${oldApp.title}/start.sh`, ''], {
                    cwd: '.',
                    maxRestarts: 2,
                    sleep: 500,
                });

                monitor.on('spawn', function () {
                  console.log('application monitor started...');
                  console.log('monitor_pid: ' + monitor.pid);

                  runningApps[req.params.id] = { pid: monitor.pid , autoRestart: req.body.autoRestart, monitor: monitor };
                });

                monitor.on('stop', function () {
                  console.log('application monitor stopped !');
                });

                monitor.on('exit', function (code, signal) {
                  console.log('process exited, code: ' + code + ' signal: ' + signal);
                  delete runningApps[req.params.id];
                });

                monitor.on('stdout', function (data) {
                  console.log(data.toString());
                });

                monitor.on('stderr', function (data) {
                  console.error(data.toString());
                });

                monitor.start();

                res.status(200).json({ message: 'Start succesful!' });
              } else {
                const child = spawn(`./backend/scripts/${oldApp.title}/start.sh`);
                console.log('child: ' + child.pid);

                runningApps[req.params.id] = { pid: child.pid , autoRestart: req.body.autoRestart };

                for (var key in runningApps) {
                  for (var value in runningApps[key]) {
                    console.log('key.value: ' + value + '.' + runningApps[key][value]);
                  }
                }

                child.stdout.on('data', function(data){
                  console.log(`child stdout:\n${data}`);
                });

                child.stderr.on('data', function(data){
                  console.log(`child stderr:\n${data}`);
                });

                child.on('close', function (code){
                  console.log(`child process exited with code ${code}`);
                  console.log('child_close: ' + child);
                  // WIP
                  // Manque l'Autorestart
                  // Manque la mise à jour s'il y a autorestart
                  const closedApp = new Application({
                    ...oldApp
                    , _id: req.params.id
                    , isRunning: false
                  });
                  Application.updateOne({ _id: req.params.id, creator: req.userData.userId }, closedApp)
                    .then(result => {
                      if (result.n > 0) {
                        delete runningApps[oldApp.id];
                        console.log('App ( ' + oldApp.title + ' ): Exit succesful!' );
                      } else {
                        console.log('App ( ' + oldApp.title + ' ): Not authorized!');
                      }
                    })
                    .catch(error => {
                      console.log('App ( ' + oldApp.title + ' ): ' + error);
                  });
                });

                res.status(200).json({ message: 'Start succesful!' });
              }
            } else {
              res.status(401).json({ message: 'Not authorized!' });
            }
          })
          .catch(error => {
            console.log(error);
            res.status(500).json({
              message: 'Couldn\'t update application!'
            })
        });
      } else if (!oldApp) {
        res.status(404).json({message: 'Application not found!'});
      } else {
        res.status(500).json({
          message: 'Already running!'
        })
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching application failed!'
      });
  });
}

exports.updateSoftwareApplication = (req, res, next) => {
  Application.findById(req.params.id)
    .then(app => {
      if (app && !app.isRunning) {
        const child = spawn(`./backend/scripts/${app.title}/update.sh`);
        console.log('child: ' + child.pid);

        child.stdout.on('data', function(data){
          console.log(`child stdout:\n${data}`);
        });

        child.stderr.on('data', function(data){
          console.log(`child stderr:\n${data}`);
        });

        child.on('close', function (code){
          console.log(`child process exited with code ${code}`);
        });
        res.status(200).json({ message: 'Update succesful!' });
      } else if (!app) {
        res.status(404).json({message: 'Application not found!'});
      } else {
        res.status(500).json({
          message: 'This app is currently running!'
        })
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching application failed!'
      });
  });
}

exports.stopApplicationAPI = (req, res, next) => {
  Application.findById(req.params.id)
    .then(oldApp => {
      if (oldApp && oldApp.isRunning) {
        // Stop script
        if ( runningApps[oldApp.id] ) {
          if (runningApps[oldApp.id].autoRestart) {
            const monitor = runningApps[oldApp.id].monitor;
            monitor.stop();
          } else {
            console.log('kill :');
            console.log(runningApps[oldApp.id]);
            kill(runningApps[oldApp.id].pid);
          }
        }

        const closedApp = new Application({
          ...oldApp
          , _id: req.params.id
          , isRunning: false
        });
        Application.updateOne({ _id: req.params.id, creator: req.userData.userId }, closedApp)
          .then(result => {
            if (result.n > 0) {
              if ( runningApps[closedApp.id] ) {
                delete runningApps[closedApp.id];
              }
              res.status(200).json({ message: 'Stop succesful!' });
            } else {
              res.status(401).json({ message: 'Not authorized!' });
            }
          })
          .catch(error => {
            console.log(error);
            res.status(500).json({
              message: 'Couldn\'t update application!'
            })
        });
      } else if (!oldApp) {
        res.status(404).json({message: 'Application not found!'});
      } else {
        res.status(500).json({
          message: 'Already stopped!'
        })
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching application failed!'
      });
  });
}

exports.stopApplication = (id) => {
  Application.findById(id)
    .then(oldApp => {
      if (oldApp && oldApp.isRunning) {
        // Stop script
        if (runningApps[oldApp.id].autoRestart) {
          const monitor = runningApps[oldApp.id].monitor;
          monitor.stop();
        } else {
          kill(runningApps[oldApp.id].pid);
        }

        const closedApp = new Application({
          ...oldApp
          , _id: id
          , isRunning: false
        });
        Application.updateOne({ _id: id}, closedApp)
          .then(result => {
            if (result.n > 0) {
              delete runningApps[closedApp.id];
              console.log('Stop succesful!');
            } else {
              console.log('Not authorized!');
            }
          })
          .catch(error => {
            console.log(error);
            console.log('Couldn\'t update application!');
        });
      } else if (!oldApp) {
        console.log('Application not found!');
      } else {
        console.log('Already stopped!');
      }
    })
    .catch(error => {
      console.log(error);
      console.log('Fetching application failed!');
  });
}

exports.findLastRunningApplication = () => {
  let appId;
  if ( runningApps ) {
    for (var key in runningApps) {
      if (runningApps.hasOwnProperty(key)) {
        appId = key;
      }
    }
    return appId;
  } else {
    return null;
  }
}
