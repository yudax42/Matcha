const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "172.17.0.2",
  user: "root",
  password: "matcha",
  database: "matcha",
  waitForConnections: true
});
module.exports = pool.promise();
