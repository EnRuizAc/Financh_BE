const express = require('express')
const app = express()
const mysql = require('mysql')

app.get("/", (req, res) => {
    res.send("Saludos");
})

app.use(express.json());


const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "ITCORP",
});

app.listen(3001, () => {
  db.connect(function(err){
      if (err) throw err;
      console.log("Connected!");
    });
  console.log("Funcionando en puerto 3001");
});




app.post("/registro", (req, res) => {
  const usuario = req.body.usuario;
  const contrasena = req.body.contrasena;
  const rol = req.body.rol;

  bcrypt.hash(contrasena, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO users (usuario, contrasena, rol) VALUES (?,?,?)",
      [usuario, contrasena, rol],
      (err, result) => {
        console.log(err);
      }
    );
  });
});

//----------------------------
/*
// Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  cb(null, __basedir + '/uploads/')
  },
  filename: (req, file, cb) => {
  cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
  }
  });

  const upload = multer({storage: storage});

//! Routes start
//route for Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// -> Express Upload RestAPIs
app.post('/uploadfile', upload.single("uploadfile"), (req, res) =>{
  importExcelData2MySQL(__basedir + '/uploads/' + req.file.filename);
  console.log(res);
});
// -> Import Excel Data to MySQL database
function importExcelData2MySQL(filePath){
// File path.
readXlsxFile(filePath).then((rows) => {
// `rows` is an array of rows
// each row being an array of cells.  
  console.log(rows);

/**
[ [ 'nivel', 'codigo', 'nombre', 'tipo' ],
[ 1, '000-0100', 'activo', 'A Activo Deudora' ],
[ 2, '000-0110', 'circulante', 'A Activo Deudora' ],
[ 3, '100-000', 'Fondo Fijo Caja', 'A Activo Deudora' ]
*/

//----------------------------



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