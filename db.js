/** Database setup for BizTime. */
require("dotenv").config();

const { Client } = require("pg");

const dbUsername = process.env.PGUSER;
const dbPassword = process.env.PGPASSWORD;
const dbName = "biztime"; // Modify the database name accordingly

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = `postgresql://${dbUsername}:${dbPassword}@localhost:5432/${dbName}_test`;
} else {
  DB_URI = `postgresql://${dbUsername}:${dbPassword}@localhost:5432/${dbName}`;
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;