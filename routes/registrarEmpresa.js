const express = require('express');
const router = express.Router();
const registrarEmpresa = require('../controllers/registrarEmpresaController');
const getEmpresas = require('../controllers/verEmpresasController');

router.post('/', registrarEmpresa);
router.get('/', getEmpresas);

module.exports = router;
