const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "172.17.0.3",
  user: "root",
  password: "matcha",
  database: "matcha",
  waitForConnections: true
});
module.exports = pool.promise();
