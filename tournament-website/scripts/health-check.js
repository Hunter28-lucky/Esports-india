#!/usr/bin/env node
/**
 * Comprehensive Supabase Database Health Check
 * Tests connectivity, RLS policies, and data integrity
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bdcwmkeluowefvcekwqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE';

const supabase = createClient(supabaseUrl, supabaseKey);

const issues = [];
const warnings = [];

async function runHealthCheck() {
  console.log('\n' + '='.repeat(80));
  console.log('🏥 SUPABASE DATABASE HEALTH CHECK');
  console.log('='.repeat(80));
  console.log(`\n⏱️  Started at: ${new Date().toLocaleString()}\n`);

  // Test 1: Basic Connectivity
  await testConnectivity();

  // Test 2: Table Access
  await testTableAccess();

  // Test 3: Data Integrity
  await testDataIntegrity();

  // Test 4: Response Time
  await testResponseTime();

  // Test 5: Foreign Key Relationships
  await testRelationships();

  // Summary
  printSummary();
}

async function testConnectivity() {
  console.log('📡 TEST 1: Basic Connectivity');
  console.log('-'.repeat(80));
  
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('tournaments').select('count', { count: 'exact', head: true });
    const duration = Date.now() - start;

    if (error) {
      issues.push(`❌ Connectivity failed: ${error.message}`);
      console.log(`  ❌ FAILED: ${error.message}`);
    } else {
      console.log(`  ✅ Connected successfully (${duration}ms)`);
      console.log(`  📊 Project: bdcwmkeluowefvcekwqq`);
      console.log(`  🌐 URL: ${supabaseUrl}`);
    }
  } catch (error) {
    issues.push(`❌ Connection error: ${error.message}`);
    console.log(`  ❌ ERROR: ${error.message}`);
  }
  console.log('');
}

async function testTableAccess() {
  console.log('📋 TEST 2: Table Access');
  console.log('-'.repeat(80));
  
  const tables = ['users', 'tournaments', 'tournament_participants', 'matches', 'transactions'];
  
  for (const table of tables) {
    try {
      const start = Date.now();
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      const duration = Date.now() - start;

      if (error) {
        issues.push(`❌ Cannot access '${table}': ${error.message}`);
        console.log(`  ❌ ${table}: FAILED - ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: ${count || 0} rows (${duration}ms)`);
        
        if (table === 'users' && count === 0) {
          warnings.push(`⚠️  '${table}' is empty - no registered users yet`);
        }
      }
    } catch (error) {
      issues.push(`❌ Error accessing '${table}': ${error.message}`);
      console.log(`  ❌ ${table}: ERROR - ${error.message}`);
    }
  }
  console.log('');
}

async function testDataIntegrity() {
  console.log('🔍 TEST 3: Data Integrity');
  console.log('-'.repeat(80));
  
  // Check if tournaments have required fields
  try {
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*');

    if (error) {
      issues.push(`❌ Cannot check tournaments: ${error.message}`);
      console.log(`  ❌ Tournaments check failed: ${error.message}`);
    } else if (tournaments && tournaments.length > 0) {
      let hasIssues = false;

      tournaments.forEach(t => {
        if (!t.name) {
          issues.push(`❌ Tournament ${t.id} missing name`);
          hasIssues = true;
        }
        if (!t.game) {
          issues.push(`❌ Tournament ${t.id} missing game`);
          hasIssues = true;
        }
        if (t.entry_fee === null || t.entry_fee === undefined) {
          issues.push(`❌ Tournament ${t.id} missing entry_fee`);
          hasIssues = true;
        }
        if (!t.image_url) {
          warnings.push(`⚠️  Tournament '${t.name}' missing image_url`);
        }
        if (t.current_players > t.max_players) {
          issues.push(`❌ Tournament '${t.name}' has more players (${t.current_players}) than max (${t.max_players})`);
          hasIssues = true;
        }
      });

      if (!hasIssues) {
        console.log(`  ✅ All ${tournaments.length} tournament(s) have valid data`);
      }
    } else {
      warnings.push('⚠️  No tournaments in database');
      console.log('  ⚠️  No tournaments to check');
    }
  } catch (error) {
    issues.push(`❌ Data integrity check failed: ${error.message}`);
    console.log(`  ❌ ERROR: ${error.message}`);
  }

  // Check orphaned participants
  try {
    const { data: participants, error } = await supabase
      .from('tournament_participants')
      .select('tournament_id, user_id');

    if (!error && participants && participants.length > 0) {
      const { data: tournaments } = await supabase
        .from('tournaments')
        .select('id');
      
      const tournamentIds = new Set(tournaments?.map(t => t.id) || []);
      
      const orphaned = participants.filter(p => !tournamentIds.has(p.tournament_id));
      if (orphaned.length > 0) {
        issues.push(`❌ Found ${orphaned.length} orphaned participant(s)`);
        console.log(`  ❌ ${orphaned.length} orphaned participant(s) found`);
      } else {
        console.log(`  ✅ All ${participants.length} participant(s) have valid tournament references`);
      }
    }
  } catch (error) {
    warnings.push(`⚠️  Could not check for orphaned participants: ${error.message}`);
  }

  console.log('');
}

async function testResponseTime() {
  console.log('⚡ TEST 4: Response Time');
  console.log('-'.repeat(80));
  
  const tests = [
    { name: 'Simple SELECT', query: () => supabase.from('tournaments').select('id').limit(1) },
    { name: 'SELECT with filter', query: () => supabase.from('tournaments').select('*').eq('status', 'upcoming') },
    { name: 'COUNT query', query: () => supabase.from('tournaments').select('*', { count: 'exact', head: true }) },
  ];

  for (const test of tests) {
    try {
      const start = Date.now();
      const { error } = await test.query();
      const duration = Date.now() - start;

      if (error) {
        issues.push(`❌ ${test.name} failed: ${error.message}`);
        console.log(`  ❌ ${test.name}: FAILED`);
      } else if (duration > 2000) {
        warnings.push(`⚠️  ${test.name} slow (${duration}ms)`);
        console.log(`  ⚠️  ${test.name}: ${duration}ms (SLOW)`);
      } else {
        console.log(`  ✅ ${test.name}: ${duration}ms`);
      }
    } catch (error) {
      issues.push(`❌ ${test.name} error: ${error.message}`);
      console.log(`  ❌ ${test.name}: ERROR`);
    }
  }
  console.log('');
}

async function testRelationships() {
  console.log('🔗 TEST 5: Foreign Key Relationships');
  console.log('-'.repeat(80));
  
  try {
    // Test tournament_participants -> tournaments relationship
    const { data: participants, error: pError } = await supabase
      .from('tournament_participants')
      .select('tournament_id')
      .limit(1);

    if (!pError && participants && participants.length > 0) {
      const { data: tournament, error: tError } = await supabase
        .from('tournaments')
        .select('id')
        .eq('id', participants[0].tournament_id)
        .single();

      if (tError) {
        issues.push(`❌ Broken relationship: tournament_participants -> tournaments`);
        console.log('  ❌ tournament_participants -> tournaments: BROKEN');
      } else {
        console.log('  ✅ tournament_participants -> tournaments: OK');
      }
    } else {
      console.log('  ℹ️  No participants to test relationships');
    }
  } catch (error) {
    warnings.push(`⚠️  Could not test relationships: ${error.message}`);
  }
  console.log('');
}

function printSummary() {
  console.log('='.repeat(80));
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('='.repeat(80));
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ ALL TESTS PASSED - Database is healthy!\n');
  } else {
    if (issues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND:');
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }
  }

  console.log('Summary:');
  console.log(`  Critical Issues: ${issues.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Status: ${issues.length === 0 ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run the health check
runHealthCheck().catch(console.error);
