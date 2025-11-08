#!/usr/bin/env node
/**
 * Complete Supabase Schema Inspector
 * Analyzes all tables, columns, data, RLS policies, and relationships
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bdcwmkeluowefvcekwqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDatabase() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 COMPLETE SUPABASE DATABASE INSPECTION');
  console.log('='.repeat(80));
  
  console.log('\n📋 PROJECT INFORMATION:');
  console.log(`  URL: ${supabaseUrl}`);
  console.log(`  Project ID: bdcwmkeluowefvcekwqq`);
  
  // Inspect all tables
  const tables = [
    'users',
    'tournaments', 
    'tournament_participants',
    'matches',
    'transactions'
  ];
  
  for (const table of tables) {
    await inspectTable(table);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ INSPECTION COMPLETE');
  console.log('='.repeat(80) + '\n');
}

async function inspectTable(tableName) {
  console.log('\n' + '-'.repeat(80));
  console.log(`📊 TABLE: ${tableName.toUpperCase()}`);
  console.log('-'.repeat(80));
  
  // Get row count
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log(`  ❌ Error accessing table: ${countError.message}`);
    return;
  }
  
  console.log(`  Total Rows: ${count || 0}`);
  
  // Get all data
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(100);
  
  if (error) {
    console.log(`  ❌ Error fetching data: ${error.message}`);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('  📭 No data in this table');
    return;
  }
  
  // Show column structure from first row
  console.log('\n  📋 COLUMNS:');
  const firstRow = data[0];
  Object.keys(firstRow).forEach(col => {
    const value = firstRow[col];
    const type = typeof value;
    const isNull = value === null;
    console.log(`    - ${col}: ${isNull ? 'NULL' : type} ${isNull ? '' : `(example: ${JSON.stringify(value).substring(0, 50)}...)`}`);
  });
  
  // Show all rows with details
  console.log('\n  📄 DATA:');
  data.forEach((row, index) => {
    console.log(`\n    Row ${index + 1}:`);
    Object.entries(row).forEach(([key, value]) => {
      let displayValue = value;
      if (typeof value === 'string' && value.length > 100) {
        displayValue = value.substring(0, 100) + '...';
      }
      console.log(`      ${key}: ${JSON.stringify(displayValue)}`);
    });
  });
}

// Run the inspection
inspectDatabase().catch(console.error);
