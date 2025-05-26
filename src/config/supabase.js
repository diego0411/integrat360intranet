// src/config/supabase.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_KEY"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ ERROR: Falta la variable de entorno ${varName} en el archivo .env`);
    process.exit(1);
  }
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

console.log("✅ Cliente Supabase inicializado correctamente.");

module.exports = supabase;
