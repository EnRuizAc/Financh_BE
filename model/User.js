const sql = require('mssql');

class User {
    constructor(id, user, password, role ) {
        this.id = id;
        this.user = user;
        this.password = password;
        this.role = role;
    }
}

module.exports = sql.module