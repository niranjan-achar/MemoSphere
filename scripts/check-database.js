#!/usr/bin/env node

/**
 * Database Setup Verification Script
 * Run this to check if your Supabase database is properly configured
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log('🔍 Checking Supabase Database Setup...\n');
console.log('Supabase URL:', SUPABASE_URL);
console.log('');

const requiredTables = ['users', 'chats', 'reminders', 'todos', 'notes', 'vault', 'documents'];

async function checkTable(tableName) {
  return new Promise((resolve) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${tableName}`);
    url.searchParams.append('select', 'id');
    url.searchParams.append('limit', '1');

    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${tableName.padEnd(15)} - Table exists`);
          resolve({ table: tableName, exists: true, status: res.statusCode });
        } else if (res.statusCode === 401) {
          console.log(`⚠️  ${tableName.padEnd(15)} - Table exists but RLS may be blocking (this is OK)`);
          resolve({ table: tableName, exists: true, status: res.statusCode });
        } else {
          console.log(`❌ ${tableName.padEnd(15)} - Table not found (status: ${res.statusCode})`);
          resolve({ table: tableName, exists: false, status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${tableName.padEnd(15)} - Error: ${error.message}`);
      resolve({ table: tableName, exists: false, error: error.message });
    });

    req.end();
  });
}

async function main() {
  const results = [];
  
  for (const table of requiredTables) {
    const result = await checkTable(table);
    results.push(result);
  }

  console.log('\n📊 Summary:\n');
  
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);

  console.log(`✅ Tables found: ${existing.length}/${requiredTables.length}`);
  
  if (missing.length > 0) {
    console.log(`❌ Missing tables: ${missing.map(r => r.table).join(', ')}`);
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('   Run the database migrations in Supabase Dashboard:');
    console.log('   1. Go to SQL Editor in your Supabase dashboard');
    console.log('   2. Run: supabase/migrations/001_initial_schema.sql');
    console.log('   3. Run: supabase/migrations/002_rls_policies.sql');
    console.log('\n   See DATABASE_SETUP.md for detailed instructions');
  } else {
    console.log('✅ All required tables exist!');
    console.log('\n✨ Your database is ready to use!');
    console.log('   Run: npm run dev');
    console.log('   Then test at: http://localhost:3000/todos');
  }
}

main().catch(console.error);
