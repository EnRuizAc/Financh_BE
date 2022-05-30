const sql = require('mssql');
const config = require('../config/dbConn');


const registrarEmpresa = async (req, res) => {

    const Nombre = req.body.Nombre;
    const Sucursal = req.body.Sucursal;
    if(!Nombre) return res.status(400).json({ 'message' : 'Name required.'});

    try {
     
        const pool = await sql.connect(config);
        const nuevaEmpresa = await pool.request().query("INSERT INTO empresa (Nombre, Sucursal) VALUES ('" + Nombre + "',  '" + Sucursal +"')");

        res.status(201).json({ 'success': `New empresa ${Nombre} created!` });

    } catch (error) {
       console.log(error);

    }
}

module.exports = registrarEmpresa;
  
