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