const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: "",
    database: 'welogDB'
})

// module.exports = mysql.createPool({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: '1111',
//     database: 'welogDB'
// })