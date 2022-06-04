const sql = require('mssql');
const config = require('../config/dbConn');




const userId = async (req) => {
   const userid = req.body.idUsuario;
   console.log(userId);

}

const getAllCompanies = async (req, res) => {


    try {

      const pool = await sql.connect(config);
      const companies = await pool.request().query("SELECT * FROM [empresa]");
      const companiesList = companies.recordsets[0];

      res.json(companiesList);
      console.log(companiesList);


    } catch (error) {
      console.log(error);

    }
}

const getAccessCompanies = async (req, res) => {
  const userId = req.body.id;




  try {

      const pool = await sql.connect(config);
      const companies = await pool.request().query("SELECT E.ID_Empresa, E.Nombre FROM Empresa E JOIN Usuario_Empresa UE on E.ID_Empresa = UE.ID_Empresa JOIN [dbo].[User] U on UE.ID_Usuario = U.UserId WHERE U.UserId = '"+userId+"'");
      const companiesList = companies.recordsets[0];

      res.json(companiesList);
      console.log(companiesList);


    } catch (error) {
      console.log(error);

    }

}

const getRelationUserCompanyData = async (req, res) => {


  try {

      const pool = await sql.connect(config);
      const companies = await pool.request().query("SELECT U.UserId, E.ID_Empresa, U.[User], E.Nombre FROM Empresa E JOIN Usuario_Empresa UE on E.ID_Empresa = UE.ID_Empresa JOIN [dbo].[User] U on UE.ID_Usuario = U.UserId ");

      res.json(companies);
      console.log(companies);


    } catch (error) {
      console.log(error);

    }

}






module.exports = { getAllCompanies, getAccessCompanies, userId, getRelationUserCompanyData };