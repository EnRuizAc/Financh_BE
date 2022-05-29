const express = require('express');
const router = express.Router();
const registrarEmpresa = require('../controllers/registrarEmpresaController');

router.post('/', registrarEmpresa);

module.exports = router;