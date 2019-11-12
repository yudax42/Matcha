const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "172.17.0.2",
  // port: '3306',
  user: "root",
  password: "1234",
  database: "matcha",
  waitForConnections: true
});
module.exports = pool.promise();
