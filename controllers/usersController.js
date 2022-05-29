const sql = require('mssql');
const config = require('../config/dbConn');


const getAllUsers = async (req, res) => {

    console.log("Testing getallUsers");

    try {

      const pool = await sql.connect(config);
      const users = await pool.request().query("SELECT * FROM [User]");
      const userList = users.recordsets[0];

      res.json(userList);
      

    } catch (error) {
      console.log(error);

    }
}


module.exports = getAllUsers;
    

