const express = require('express');
const router = express.Router();
const subirMovimientosController = require('../controllers/subirMovimientosController');
const multer = require("multer");

var storage = multer.memoryStorage();


var upload = multer({
    storage: storage
  });  

//Librería multer, dónde va importada?
//Modificar
router.post('/', upload.single('file'), subirMovimientosController);

module.exports = router;