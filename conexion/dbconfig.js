require("dotenv").config();

const { Pool } = require("pg");

const connectionString = 'posgressql://postgres:postgres@localhost:5432/postgres';

const pool = new Pool({
  connectionString:connectionString
});

module.exports = { pool };