const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('../config/dbConn');


const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });


    const pool = await sql.connect(config);
    const users = await pool.request().query("SELECT * FROM [User]");
    const userList = users.recordsets[0];

    const foundUser = userList.find(element => element.User === user);
    

    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.Password);
    if (match) {
        const roles = foundUser.Role;
        const user = foundUser.User;

        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.User,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '300s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.User },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;

        const pool = await sql.connect(config);
        const result = await pool.request().query("UPDATE [User] SET [refreshToken] = '" + refreshToken + "' WHERE [User] = '" + foundUser.User + "'");

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure:true,  maxAge: 24 * 60 * 60 * 1000 }); //secure: true,
        res.json({ user, roles, accessToken });

        console.log(foundUser);
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };