const express = require('express');
const getData = require('../controllers/balanceGeneralController');
const router = express.Router();

router.get('/', getData);

module.exports = router;