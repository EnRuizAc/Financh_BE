const express = require('express');
const cors = require('cors');
const sql = require("mssql");

const { Connection, Request } = require("tedious");

const multer = require("multer");
const xlsx = require('xlsx');
const { text } = require('body-parser');


const app = express();
app.use(cors());
app.use(express.json());

app.listen(3001, () => {
    console.log('running on port 3001');
}); 

app.use(express.urlencoded({ extended: true }));
var storage = multer.memoryStorage();

app.get("/", (req, res) => {
    res.send("Saludos");
})


// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "itcorp", // update me
      password: "Financhdb1*" // update me
    },
    type: "default"
  },
  server: "itcorpsv.database.windows.net", // update me
  options: {
    database: "Financh", //update me
    encrypt: true
  }
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("conexion!");
  }
});

connection.connect();


app.get('/datos', (req, res) => {


  sql.connect(config, function (err) {
    if (err) console.log(err);
  let sqlRequest = new sql.Request();
  
  let sqlQuery = 'Select * FROM usuario';

  sqlRequest.query(sqlQuery, function(err, data){
    if(err) console.log(err)
    console.log(data);
    res.send(data.recordsets[0]);
  });
});
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

app.post('/crear-empresa', (req,res) =>{
  console.log(req.body);
    const Nombre = req.body.Nombre;
    const Sucursal = req.body.Sucursal;
    // console.log(Nombre);

    sql.connect(config, function (err) {
      if (err) console.log(err);
    let sqlRequest = new sql.Request();
    
    let sqlQuery = "INSERT INTO empresa (Nombre, Sucursal) VALUES ('" + Nombre + "',  '" + Sucursal +"')";
  
    sqlRequest.query(sqlQuery, function(err, data){
      if(err) console.log(err)
      // console.log(data);
      // res.send(data);

    });
  });
});

app.get('/empresas', (req,res) =>{

  sql.connect(config, function (err) {
    if (err) console.log(err);
  let sqlRequest = new sql.Request();
  
  let sqlQuery = 'Select * FROM empresa';

  sqlRequest.query(sqlQuery, function(err, data){
    if(err) console.log(err)
    console.log(data);
    res.send(data.recordsets[0]);
  });
});
});


app.post('/login', (req,res) =>{
    const Correo = req.body.Correo;
    const Contrasena = req.body.Contrasena;

    sql.connect(config, function (err) {
      if (err) console.log(err);
    let sqlRequest = new sql.Request();
    
    let sqlQuery = "Select * from usuario where Correo = '"+Correo+"' and Contrasena='"+Contrasena+"'";
  
    sqlRequest.query(sqlQuery, function(err, data,result){
      if(err) console.log(err)
      else{
        if(data.recordsets[0].length === 1){
          console.log("bien");
          res.redirect('http://localhost:3000');
        } else {
          console.log("Correo o contraseña incorrecta");
        }
      }
    });
  });
});


app.post('/Registro', (req,res) =>{
  console.log(req.body);
    const Correo = req.body.Correo;
    const Contrasena = req.body.Contrasena;
    const Rol = req.body.Rol;
    // console.log(Nombre);

    sql.connect(config, function (err) {
      if (err) console.log(err);
    let sqlRequest = new sql.Request();
    
    let sqlQuery = "INSERT INTO usuario (Correo, Contrasena, Rol) VALUES ('" + Correo + "',  '" + Contrasena +"',  '" + Rol +"')";
  
    sqlRequest.query(sqlQuery, function(err, data){
      if(err) console.log(err)
      // console.log(data);
      // res.send(data);

    });
  });
});

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

app.get('/datosMovimientos', (req, res) => {

  db.query(
    "SELECT * FROM Movimiento",
    (err, result) => {
          if (err) {
              res.send({err:err})
          }
          res.send(result);
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
  // console.log("Data Completa recién asignada");
  // console.log(data);
  // console.log("Tamaño");
  // console.log(data.length);

  //Se define el tamaño de todo según los contenidos
  const size = data.length;

  // Cuentas tendrá data en formato que pueda ser interpretado para insertar en la base de datos mediante las llaves
  var cuentas = [];

  //Convertir cada línea horizontal en un objeto fijo para poder acceder al valor dado iterando
  for (var i = 0; i < size; i++)
  {
    data[i] = Object.values(data[i]);
  }
  
  // console.log("Cuentas");
  // console.log(cuentas);
  // console.log("Data");
  // console.log(data);


  // Inserción en base de datos. Es necesario solo almacenar las cuentas, no toda la información (encabezado y pie)
  // Variable para indice de cuentas
  var k = 0;

  //Ciclo para almacenar los valores en cuentas, al mismo tiempo que se insertan en la base de datos
  for (var i = 0; i < size; i++)
  {
    //Se comprueba que el primer elemento sea un número, verificación de que el dato sea un nivel de cuenta
    if (typeof(data[i][0]) == typeof(13))
    {
      //Se llena de elementos vacíos acorde al tamaño, iterativamente
      cuentas.push(
        {
          "Nivel": "",
          "Codigo": "",
          "Nombre": "",
          "Tipo": "",
          "Afectable": ""
        }
      );

      // Se asignan los valores de data (que ya estamos seguros que es una cuenta) a cuentas
      cuentas[k].Nivel = data[i][0];
      cuentas[k].Codigo = data[i][1];
      cuentas[k].Nombre = data[i][2];
      cuentas[k].Tipo = data[i][3];
      //Pequeña verificación y conversión de string a bool
      if (data[k][4] == "Afectable")
      {
        cuentas[k].Afectable = true;
      } else {
        cuentas[k].Afectable = false;
      }

      //Inserción en la base de datos de los respectivos atributos
      db.query(
        "INSERT INTO Cuenta (Nivel, Codigo, Nombre, Tipo, Es_Afectable) VALUES (?, ?, ?, ?, ?)", [cuentas[k].Nivel, cuentas[k].Codigo, cuentas[k].Nombre, cuentas[k].Tipo, cuentas[k].Afectable],
        (err, result) => {
              if (err) {
                console.log(err)
              } 
              // else {
              //   res.send(result)
              // }
          }
      );
      //Aumento del índice que tendra cuentas, debido al desface que existe debido al encabezado
      k++;
  }

  //Verificación final de los valores que contiene cuentas después del ciclo

  }
  console.log("Cuentas después ciclo");
  // console.log(cuentas);

return res.status(201).send(cuentas);
};


app.post("/api/movimientos", upload.single('file'), uploadMovimientos);
function uploadMovimientos(req, res) {    
    var workbook = xlsx.read(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var account = "";
    var count = 0;
    var movimientos = [];
    for (let line of data) {
        if (Object.keys(line).length >= 4 && line["CONTPAQ i"] !== undefined && line["__EMPTY"] !== "") {
            if (String(line["CONTPAQ i"]).match(/\d{3}-\d{3}/)) {
                account = line["CONTPAQ i"];
            } else {
                if (Object.keys(line).length >= 6 && line["CONTPAQ i"] !== "Fecha") {

                  // Inserción del nuevo movimiento a llenar de información
                  movimientos.push(
                    {
                      "Cuenta": "",
                      "Fecha": "",
                      "Tipo": "",
                      "Numero": "",
                      "Concepto": "",
                      "Referencia": "",
                      "Cargo": "",
                      "Abono": "",
                      "Saldo": ""
                    });

                    // Cambios para intentar inserción
                    movimientos[count].Cuenta = account;
                    movimientos[count].Fecha = new Date(line["CONTPAQ i"]).toLocaleDateString('en-ZA');
                    movimientos[count].Tipo = line["__EMPTY"];
                    movimientos[count].Numero = line["__EMPTY_1"];
                    movimientos[count].Concepto = line["Lecar Consultoria en TI, S.C."];

                    // Revisión de si referencia es indefinido para insertar string vacío en la base de datos
                    if (typeof(line["__EMPTY_2"]) == typeof(""))
                    {
                      movimientos[count].Referencia = line["__EMPTY_2"];
                    } else 
                    {
                      movimientos[count].Referencia = "";
                    }

                    // Revisión de si cargo o abono está vacío, para que el otro se almacene con un 0 y no como indefinido
                    if (typeof(line["__EMPTY_3"]) == typeof(1))
                    {
                      movimientos[count].Cargo = line["__EMPTY_3"];
                      movimientos[count].Abono = 0;

                    } else if ((typeof(line["__EMPTY_4"]) == typeof(1)))
                    {
                      movimientos[count].Cargo = 0;
                      movimientos[count].Abono = line["__EMPTY_4"];

                    }
                   
                    movimientos[count].Saldo = line["Hoja:      1"];

                    // console.log("Tipo Fecha");
                    // console.log(typeof(movimientos[count].Fecha))


                    //Inserción en la base de datos de los respectivos atributos
                    db.query(
                      "INSERT INTO Movimiento (Fecha, Tipo, Numero, Concepto, Referencia, Cargo, Abono, Saldo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                       [movimientos[count].Fecha, movimientos[count].Tipo, movimientos[count].Numero, movimientos[count].Concepto, movimientos[count].Referencia,
                        movimientos[count].Cargo, movimientos[count].Abono, movimientos[count].Saldo],
                      (err, result) => {
                            if (err) {
                              console.log(err)
                            } 
                            // else {
                            //   res.send(result)
                            // }
                        }
                    );




                    count++;
                }
            }
        }
    }

    console.log(movimientos);
    // console.log(count);
    console.log(typeof(movimientos[0].Fecha));    

    return res.status(201).send(movimientos);
}
