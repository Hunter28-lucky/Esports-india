#!/usr/bin/env node
/**
 * Helper script to query Supabase database
 * Usage: node scripts/query-supabase.js [command]
 * Commands: projects, tables, tournaments, users
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bdcwmkeluowefvcekwqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('\n📋 TOURNAMENTS:\n');
  data.forEach(t => {
    console.log(`  ${t.name} (${t.game})`);
    console.log(`    Entry: ₹${t.entry_fee} | Prize: ₹${t.prize_pool}`);
    console.log(`    Players: ${t.current_players}/${t.max_players}`);
    console.log(`    Status: ${t.status}`);
    console.log('');
  });
}

async function listUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('email, full_name, wallet_balance, total_tournaments')
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('\n👥 USERS:\n');
  data.forEach(u => {
    console.log(`  ${u.full_name} (${u.email})`);
    console.log(`    Wallet: ₹${u.wallet_balance} | Tournaments: ${u.total_tournaments}`);
    console.log('');
  });
}

async function listTables() {
  const tables = ['users', 'tournaments', 'tournament_participants', 'matches', 'transactions'];
  
  console.log('\n📊 DATABASE TABLES:\n');
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`  ${table}: ${count || 0} rows`);
    }
  }
  console.log('');
}

async function getProjectInfo() {
  console.log('\n🔧 PROJECT INFO:\n');
  console.log(`  URL: ${supabaseUrl}`);
  console.log(`  Project ID: bdcwmkeluowefvcekwqq`);
  console.log(`  Region: Available via API`);
  console.log('');
  
  await listTables();
}

const command = process.argv[2] || 'projects';

switch(command) {
  case 'projects':
    getProjectInfo();
    break;
  case 'tables':
    listTables();
    break;
  case 'tournaments':
    listTournaments();
    break;
  case 'users':
    listUsers();
    break;
  default:
    console.log('Usage: node scripts/query-supabase.js [projects|tables|tournaments|users]');
}
