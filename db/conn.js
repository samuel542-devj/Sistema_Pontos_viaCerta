const mysql = require('mysql2');
const dotenv =  require('dotenv')
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.BD_HOST,
    user: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_NAME
});

connection.connect((err) =>{
    if(err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

module.exports = connection;