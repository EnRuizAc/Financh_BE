const express = require('express');
const getData = require('../controllers/balanzaComprobacionController');
const router = express.Router();

router.post('/', getData);

module.exports = router;