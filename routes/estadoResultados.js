const express = require('express');
const router = express.Router();
const getData = require('../controllers/EstadoResultadosController');

router.post('/', getData);

module.exports = router;