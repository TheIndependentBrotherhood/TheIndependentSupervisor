const express = require('express');

const DataServerController = require('../controllers/dataServer');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('', checkAuth, DataServerController.getData);

module.exports = router;
