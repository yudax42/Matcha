const mysql = require('mysql2');
const pool = mysql.createPool(
{
	host: 'localhost',
	user: 'root',
	database: 'matcha',
	waitForConnections: true
});
module.exports = pool.promise();