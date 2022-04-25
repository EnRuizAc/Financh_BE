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
  // console.log(req.file);
  // console.log(req.file.buffer);
  var sheet_name_list = workbook.SheetNames;
  var data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  // Variables para manejo e inserción
  console.log("Data en 0");
  console.log(data);
  console.log("Length");
  console.log(data.length);
  // console.log(data[0].Nivel);
  // console.log(data[0]["  C ó d i g o"]);
  // console.log(data[0]["N o m b r e"]);
  // console.log(data[0]["T i p o"]);
  // console.log(data[0]["T i p o"]);

  //Convertir cada línea horizontal en un objeto fijo para poder acceder al valor dado iterando
  const size = data.length;
  // Cuentas tendrá data en formato que pueda ser interpretado para insertar en la base de datos mediante las llaves
  var cuentas = [];
  for (var i = 0; i < size; i++)
  {
    data[i] = Object.values(data[i]);

    // Se llena de elementos vacíos acorde al tamaño
    cuentas.push(
      {
        "Nivel": "",
        "Codigo": "",
        "Nombre": "",
        "Tipo": "",
        "Afectable": ""
      }
    );
  }
  

  console.log("Cuentas");
  console.log(cuentas);
  
  // Insertar en base de datos
  for (var i = 0; i < size; i++)
  {
    console.log(i);
    cuentas[i].Nivel = data[i][0];
    cuentas[i].Codigo = data[i][1];
    cuentas[i].Nombre = data[i][2];
    cuentas[i].Tipo = data[i][3];
    if (data[i][4] == "Afectable")
    {
      cuentas[i].Afectable = true;
    } else {
      cuentas[i].Afectable = false;
    }




    db.query(
      "INSERT INTO Cuenta (Nivel, Codigo, Nombre, Tipo, Es_Afectable) VALUES (?, ?, ?, ?, ?)", [cuentas[i].Nivel, cuentas[i].Codigo, cuentas[i].Nombre, cuentas[i].Tipo, cuentas[i].Afectable],
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
  console.log("Cuentas después ciclo");
  console.log(cuentas);


    return res.status(201).send(data);
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