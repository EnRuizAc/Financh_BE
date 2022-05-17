const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config/dbConn');


const handleNewUser = async (req, res) => {
    const {user, pwd } = req.body;
    if(!user || !pwd) return res.status(400).json({ 'message' : 'Username and password are required.'});
    // chek for duplicate usernames in the DB
   
    const pool = await sql.connect(config);
    const users = await pool.request().query("SELECT * FROM [User]");
    const userList = users.recordsets[0];
    
    const duplicate = await userList.find(element => element.User === user);
    if (duplicate){

        console.log("User allready exist!!");
        return res.sendStatus(409); //Conflict 
    } 

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

            

            const pool = await sql.connect(config);
            const insertUser = await pool.request().query("INSERT INTO [User] ([User], [Password]) VALUES ('"+ user + "', '"+ hashedPwd + "')");

            res.status(201).json({ 'success': `New user ${user} created!` });
            

    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };

