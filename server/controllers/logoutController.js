
const sql = require('mssql');
const config = require('../config/dbConn');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;
    

    // Is refreshToken in db?
    const pool = await sql.connect(config);
    const users = await pool.request().query("SELECT * FROM [User]");
    const userList = users.recordsets[0];
    
    const foundUser = userList.find(element => element.refreshToken === refreshToken);;
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = null;
    const result = await pool.request().query("UPDATE [User] SET [refreshToken] = '"+foundUser.refreshToken+"' WHERE [User] = '"+foundUser.User+"'");
    console.log(foundUser);
    
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

module.exports = { handleLogout }