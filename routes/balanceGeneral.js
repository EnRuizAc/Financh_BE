const express = require('express');
const getData = require('../controllers/balanceGeneralController');
const router = express.Router();

router.post('/', getData);

module.exports = router;