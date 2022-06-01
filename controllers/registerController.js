const bcrypt = require('bcryptjs');
const { query } = require('express');
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

const postData = async (userId, companyId) => {
    console.log(`Empresa id: ${companyId} `);
    console.log(`Usuario id: ${userId} `);

    
        const pool = await sql.connect(config);
        const postUserCompanyRealtion = await pool.request().query("INSERT INTO [usuario_empresa] ([ID_Empresa], [ID_Usuario]) VALUES ('"+ companyId +"' , '"+ userId + "')");
        
}



const handleUserCompanyRelation = async (req, res) => {
    console.log("Testing User Company Realtion");
    const {userId, companiesIds} = req.body;


        await companiesIds.reduce(async (acc, companyId) => {
            await acc;
            const post = await postData(userId[0], companyId);
    
        }, Promise.resolve());
        


}

module.exports = { handleNewUser, handleUserCompanyRelation}