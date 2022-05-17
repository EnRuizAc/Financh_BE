
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('../config/dbConn');


const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const pool = await sql.connect(config);
    const users = await pool.request().query("SELECT * FROM [User]");
    const userList = users.recordsets[0];
    
    const foundUser = userList.find(element => element.refreshToken === refreshToken);
 
    if (!foundUser) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.User !== decoded.username) return res.sendStatus(403);
            const roles = foundUser.Role;
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.User,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '300s' }
            );
            res.json({ accessToken })
            
        }
    );
}

module.exports = { handleRefreshToken }