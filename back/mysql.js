const mysql = require('mysql2/promise');

// module.exports = mysql.createPool({
//     host: '127.0.0.1',
//     port: 3306,
//     user: 'root',
//     password: "",
//     database: 'welogDB'
// })

// module.exports = mysql.createPool({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: '1111',
//     database: 'welogDB'
// })

module.exports = mysql.createPool({
    host: 'us-cdbr-east-06.cleardb.net',
    port: 3306,
    user: 'b34b9a57a49659',
    password: "f94a3205",
    database: 'heroku_f2a4e125971c6a2'
})