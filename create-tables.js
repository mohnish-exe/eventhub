// Create Oracle Database Tables
// This script will create all required tables for the Event Management System

const oracledb = require('oracledb');

const ORACLE_CONFIG = {
  user: 'system',
  password: 'root',
  connectString: 'localhost:1521/free',
};

async function createTables() {
  let connection;
  
  try {
    console.log('🔌 Connecting to Oracle database...');
    connection = await oracledb.getConnection(ORACLE_CONFIG);
    console.log('✅ Connected to Oracle database!');

    // Read the schema file
    const fs = require('fs');
    const schemaSQL = fs.readFileSync('oracle-schema.sql', 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️ Statement ${i + 1} skipped (already exists)`);
          } else {
            console.log(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('🎉 All tables created successfully!');
    
    // Test by querying one of the tables
    const result = await connection.execute('SELECT COUNT(*) as table_count FROM user_tables WHERE table_name LIKE \'%_1\'');
    console.log(`📊 Created ${result.rows[0][0]} tables with -1 suffix`);

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    if (connection) {
      await connection.close();
      console.log('🔌 Database connection closed');
    }
  }
}

createTables();

