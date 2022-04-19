const express = require('express')
const app = express()

app.get("/", (req, res) => {
    res.send("Saludos");
})

app.listen(3001, () => {
    console.log('running on port 3001');
});

const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "FinanchDB", // update me
      password: "saludos-123" // update me
    },
    type: "default"
  },
  server: "itcorp.database.windows.net", // update me
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
