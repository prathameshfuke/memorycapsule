import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually parse .env file
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log("Checking Supabase connection...");
console.log("URL:", url);

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase
      .from('cat_players')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Error fetching from cat_players:", error);
    } else {
      console.log("Fetch success! Player record keys:", data.length > 0 ? Object.keys(data[0]) : "No records in table");
    }

    const { data: gameData, error: gameError } = await supabase
      .from('cat_game')
      .select('*')
      .limit(1);

    if (gameError) {
      console.error("Error fetching from cat_game:", gameError);
    } else {
      console.log("Fetch success! Game record keys:", gameData.length > 0 ? Object.keys(gameData[0]) : "No records in table");
    }
  } catch (err) {
    console.error("Exception in test script:", err);
  }
}

test();
