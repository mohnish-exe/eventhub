#!/usr/bin/env node

/**
 * Oracle Database Setup Script
 * This script helps set up the Oracle database for the Event Management System
 */

import { oracleDb } from './client';
import OracleIntegrationTest from './test';

async function setupDatabase() {
  console.log('🚀 Starting Oracle Database Setup...');
  console.log('=====================================');
  
  try {
    // Test connection first
    console.log('1. Testing database connection...');
    const connectionTest = await OracleIntegrationTest.testConnection();
    
    if (!connectionTest) {
      console.error('❌ Database connection failed!');
      console.error('Please check your Oracle database configuration in src/config/oracle.ts');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful!');
    
    // Check if tables exist
    console.log('\n2. Checking if tables exist...');
    const tablesTest = await OracleIntegrationTest.testTablesExist();
    
    if (!tablesTest) {
      console.error('❌ Tables do not exist!');
      console.error('Please run the oracle-schema.sql script in your Oracle database first.');
      console.error('You can find the script in the root directory of this project.');
      process.exit(1);
    }
    
    console.log('✅ All tables exist!');
    
    // Run integration tests
    console.log('\n3. Running integration tests...');
    await OracleIntegrationTest.runAllTests();
    
    console.log('\n🎉 Oracle Database Setup Complete!');
    console.log('Your Event Management System is ready to use with Oracle Database.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };

