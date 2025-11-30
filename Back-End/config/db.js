import mysql from "mysql2";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "tubesippl",
});

export default db;
