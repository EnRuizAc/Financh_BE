const sql = require('mssql');
const config = require('../config/dbConn');
    
const getEmpresas = async (req, res) => {

    console.log("Testing ver Empresas");

    try {
     
        const pool = await sql.connect(config);
        const empresas = await pool.request().query("Select * FROM empresa");
        const listaEmpresa = empresas.recordsets[0];
        
        res.json(listaEmpresa);

    } catch (error) {
       console.log(error);

    }
}

module.exports = getEmpresas;