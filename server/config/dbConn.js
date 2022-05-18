const sql = require('mssql');

const config = {
    authentication: {
      options: {
        userName: process.env.USER_NAME, 
        password: process.env.PASSWORD 
      },
      type: "default"
    },
    server: process.env.SERVER , // update me
    options: {
      database: process.env.DATA_BASE, //update me
      encrypt: true
    }
  };

  module.exports = config;