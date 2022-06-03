const express = require('express');
const router = express.Router();
const getData = require('../controllers/EstadoResultadosController');

router.get('/', getData);

module.exports = router;