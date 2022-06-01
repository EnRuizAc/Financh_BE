const express = require('express');
const router = express.Router();
const subirCuentasController = require('../controllers/subirCuentasController');
const multer = require("multer");

var storage = multer.memoryStorage();


var upload = multer({
    storage: storage
  });  

//Librería multer, dónde va importada?
//Modificar
router.post('/', upload.single('file'), subirCuentasController);

module.exports = router;