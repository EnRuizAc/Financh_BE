const sql = require('mssql');
const config = require('../config/dbConn');

const deleteData = async (userId, companyId) => {

    console.log(`Empresa a Borrar id: ${companyId} `);
    console.log(`Usuario  a Borrar id: ${userId} `);

    const pool = await sql.connect(config);
    const postDeleteUserCompanyRealtion = await pool.request().query("DELETE FROM usuario_empresa WHERE ID_Empresa = '"+ companyId + "' AND ID_Usuario = '"+ userId + "'")


  }

  const deleteRelation = async (req, res) => {
    console.log("Testing deleting  Realtion data");;

    console.log(req.body);
    const {userId, companyId } = req.body;


    const post = await deleteData(userId, companyId);


  }

  module.exports = deleteRelation;