import supabase from "../../configs/db-configs";


const { Pool } = pkg;
const pool = new Pool(supabase);
