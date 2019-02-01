const express = require('express');

const ApplicationController = require('../controllers/applications');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();

router.post('', checkAuth, extractFile, ApplicationController.createApplication);
router.put('/:id', checkAuth, extractFile, ApplicationController.updateApplication);
router.get('', ApplicationController.getApplications);
router.get('/:id', ApplicationController.getApplication);
router.delete('/:id', checkAuth, ApplicationController.deleteApplication);

module.exports = router;
