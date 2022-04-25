const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const multer = require("multer");
const xlsx = require('xlsx');


const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
var storage = multer.memoryStorage();

app.get("/", (req, res) => {
    res.send("Saludos");
})


const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "financhdb",
});

app.listen(3001, () => {
  db.connect(function(err){
      if (err) throw err;
      console.log("Connected!");
    });
  console.log("Funcionando en puerto 3001");
});



app.get('/datos', (req, res) => {

  db.query(
    "SELECT * FROM Usuario",
    (err, result) => {
          if (err) {
              res.send({err:err})
          }
          res.send(result);

      }
  );
});


app.post('/prueba', (req, res) => {

  const nombre = req.body.nombre;
  const contrasena = req.body.contrasena;
  console.log(nombre);
  console.log(contrasena);

  db.query(
    "INSERT INTO Usuario (Correo, Contraseña) VALUES (?,?)", [nombre, contrasena],
    (err, result) => {
          if (err) {
              console.log(err)
          } else {
            res.send("you")
          }
      }
  );
});

app.get('/usuarios', (req, res) => {
  db.query(
    "SELECT * FROM usuario" ,
    (err, result) => {
          if (err) {
              console.log(err);
          } else {
            res.send(result);
          }
      }
  );
});



var upload = multer({
  storage: storage
});

app.post("/api/xlsx", upload.single('file'), uploadXlsx);
function uploadXlsx(req, res) {    
  // Interpretar archivo y convertirlo a Json
  var workbook = xlsx.read(req.file.buffer);
  console.log(req.file);
  console.log(req.file.buffer);
  var sheet_name_list = workbook.SheetNames;
  var data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  // Variables para manejo e inserción
  console.log(data[0]);
  console.log(data.length);
  console.log(data[0].Nivel)
  console.log(data[0]["  C ó d i g o"])
  console.log(data[0]["N o m b r e"])
  console.log(data[0]["T i p o"])
  console.log(data[0]["T i p o"])

  




  console.log(data);
  
  // Insertar en base de datos
  for (var i = 0; data.length; i++)
  {
    db.query(
      "INSERT INTO Cuenta (Nivel, Codigo, Nombre, Tipo) VALUES (?, ?, ?, ?)", [data[i].Nivel, data[i]["  C ó d i g o"], data[i]["N o m b r e"], data[i]["T i p o"]],
      (err, result) => {
            if (err) {
              console.log(err)
            } 
            // else {
            //   res.send(result)
            // }
        }
    );
  }
    


    // return res.status(201).send(data);
}


app.get('/datosCuentas', (req, res) => {

  db.query(
    "SELECT * FROM Cuenta",
    (err, result) => {
          if (err) {
              res.send({err:err})
          }
          res.send(result);

      }
  );
});