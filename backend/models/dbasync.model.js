import mysql from 'mysql2/promise.js';
import { db_config } from "../config/db.config.js";

console.log("Trying to connect to DB...");
const pool = mysql.createPool({
    host: db_config.HOST,
    port: db_config.PORT,
    user: db_config.USER,
    password: db_config.PASSWORD,
    database: db_config.DB,
    waitForConnections: true,
    connectionLimit: 50,
});

if (pool) {
    console.log(`Database Connected`);
}
else {
    console.log("Error in the connection");
    console.log(err);
}

const query = async (sql, param) => {
    return await pool.query(sql, param);
}

export { query };