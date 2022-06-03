const sql = require('mssql');
const config = require('../config/dbConn');
    
const getData  = async (req, res) => {

    console.log("Testing ver balance general");

    try {
     
        
        const pool = await sql.connect(config);
        const empresas = await pool.request().query("Select * FROM empresa");
        const lit = empresas.recordsets[0];
        
        res.json(lit);



        } 
    catch (error) {
            console.log(error);
    } 
    console.log("Done");
}

module.exports = getData;