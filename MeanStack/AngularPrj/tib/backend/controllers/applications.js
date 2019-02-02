const Application = require('../models/application');

exports.createApplication = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const application = new Application({
    title: req.body.title
    , content: req.body.content
    , imagePath: url + "/images/" + req.file.filename
    , creator: req.userData.userId
  });
  application.save().then(createdApplication => {
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
  const application = new Application({
    _id: req.body.id
    , title: req.body.title
    , content: req.body.content
    , imagePath: imagePath
    , creator: req.userData.userId
  });
  Application.updateOne({ _id: req.params.id, creator: req.userData.userId }, application)
    .then(result => {
      if (result.n > 0) {
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
  Application.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
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
