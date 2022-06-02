const express = require('express');
const getData = require('../controllers/balanzaComprobacionController');
const router = express.Router();

router.get('/', getData);

module.exports = router;