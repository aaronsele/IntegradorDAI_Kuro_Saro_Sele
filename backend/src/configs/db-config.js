import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const DBconfig = {
  host: process.env.DB_HOST ?? '',
  database: process.env.DB_DATABASE ?? '',
  user: process.env.DB_USER ?? '',
  password: process.env.DB_PASSWORD ?? '',
  port: parseInt(process.env.DB_PORT) || 5432
};

const pool = new Pool(DBconfig);

export default pool;