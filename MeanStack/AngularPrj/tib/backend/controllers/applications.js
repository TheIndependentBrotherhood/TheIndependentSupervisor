// for delete an element : delete tab.b; => b is a key
// for add an element : tab.c = 'value'; => c is a key OR tab['c'] = 'value';
/*for (var key in runningApps) {
  if (runningApps.hasOwnProperty(key) && key === req.body.id) {
    isRunning = true;
  }
}*/

const Application = require('../models/application');
const spawn = require('child_process').spawn;
const psTree = require('ps-tree');

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
    fs.mkdir('/scripts/' + application.title, { recursive: true }, (err) => {
      if (err) throw err;
    });

    const data = "#!/bin/bash \n echo \"Nothing in this script\"";

    fs.writeFile('/scripts/' + application.title + '/start.sh', data, (err) => {
      if (err) throw err;
    });

    fs.writeFile('/scripts/' + application.title + '/stop.sh', data, (err) => {
      if (err) throw err;
    });

    fs.writeFile('/scripts/' + application.title + '/update.sh', data, (err) => {
      if (err) throw err;
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
              fs.rename('/scripts/' + oldApp.title, '/scripts/' + req.body.title, (err) => {
                if (err) throw err;
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
      console.log('hey: ' + error);
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
      res.status(500).json({
        message: 'Fetching application failed!'
      });
    });
}

exports.deleteApplication = (req, res, next) => {
  let isRunning = false;

  Application.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        for (var key in runningApps) {
          if (runningApps.hasOwnProperty(key) && key === req.params.id) {
            isRunning = true;
          }
        }

        // WIP
        // Manque la suppression du dossier comprenant les scripts
        // Manque la suppression de l'image de l'application
        if (isRunning) {
          kill(runningApps[req.params.id]);
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
}

exports.startApplication = (req, res, next) => {
  console.log('coucou: ' + req.params.id);
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
              const child = spawn(`./scripts/${newApp.title}/start.sh`);
              console.log('child: ' + child.pid);

              runningApps[req.params.id] = child.pid;

              for (var key in runningApps) {
                console.log('key.value: ' + key + '.' + runningApps[key]);
              }

              child.stdout.on('data', function(data){
                console.log(`child stdout:\n${data}`);
              });

              child.stderr.on('data', function(data){
                console.log(`child stderr:\n${data}`);
              });

              child.on('close', function (code){
                console.log(`child process exited with code ${code}`);
                const closedApp = new Application({
                  ...newApp
                  , _id: req.params.id
                  , isRunning: false
                });
                Application.updateOne({ _id: req.params.id, creator: req.userData.userId }, closedApp)
                  .then(result => {
                    if (result.n > 0) {
                      delete runningApps[closedApp.id];
                      console.log('App ( ' + closedApp.title + ' ): Update succesful!' );
                    } else {
                      console.log('App ( ' + closedApp.title + ' ): Not authorized!');
                    }
                  })
                  .catch(error => {
                    console.log('App ( ' + closedApp.title + ' ): ' + error);
                });
              });

              res.status(200).json({ message: 'Update succesful!' });
            } else {
              res.status(401).json({ message: 'Not authorized!' });
            }
          })
          .catch(error => {
            console.log('Ah: ' + error);
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
      console.log('hey: ' + error);
      res.status(500).json({
        message: 'Fetching application failed!'
      });
  });
}

exports.stopApplication = (req, res, next) => {
  Application.findById(req.params.id)
    .then(oldApp => {
      if (oldApp && oldApp.isRunning) {
        // Stop script
        kill(runningApps[oldApp.id]);

        const closedApp = new Application({
          ...oldApp
          , _id: req.params.id
          , isRunning: false
        });
        Application.updateOne({ _id: req.params.id, creator: req.userData.userId }, closedApp)
          .then(result => {
            if (result.n > 0) {
              delete runningApps[closedApp.id];
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
          message: 'Already stopped!'
        })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching application failed!'
      });
  });
}
