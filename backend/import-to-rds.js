const mysql = require('mysql2/promise');
const fs = require('fs');

// AWS RDS Configuration
// Replace these with your actual RDS details
const RDS_CONFIG = {
  host: 'your-rds-endpoint.amazonaws.com', // Replace with your RDS endpoint
  port: 3306,
  user: 'admin', // Your RDS master username
  password: 'your-rds-password', // Your RDS master password
  database: 'cloud'
};

async function importToRDS() {
  console.log('🚀 Importing data to AWS RDS MySQL...');
  console.log('📍 RDS Host:', RDS_CONFIG.host);
  
  let connection;
  try {
    // Read the exported SQL file
    if (!fs.existsSync('cloud_export.sql')) {
      console.error('❌ cloud_export.sql not found. Run export-data.js first.');
      return;
    }

    const sqlContent = fs.readFileSync('cloud_export.sql', 'utf8');
    console.log('📄 Loaded SQL file');

    // Connect to AWS RDS
    console.log('🔗 Connecting to AWS RDS...');
    connection = await mysql.createConnection(RDS_CONFIG);
    console.log('✅ Connected to AWS RDS');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.toLowerCase().includes('set foreign_key_checks')) {
        console.log(`🔧 ${statement.substring(0, 50)}...`);
      } else if (statement.toLowerCase().includes('drop table')) {
        console.log(`🗑️ ${statement.substring(0, 50)}...`);
      } else if (statement.toLowerCase().includes('create table')) {
        const tableName = statement.match(/create table `?(\w+)`?/i)?.[1] || 'unknown';
        console.log(`🏗️ Creating table: ${tableName}`);
      } else if (statement.toLowerCase().includes('insert into')) {
        const tableName = statement.match(/insert into `?(\w+)`?/i)?.[1] || 'unknown';
        console.log(`📥 Inserting data into: ${tableName}`);
      }

      try {
        await connection.execute(statement);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️ Already exists, skipping...');
        } else {
          console.error(`❌ Error executing statement: ${error.message}`);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    // Verify the import
    console.log('\n🔍 Verifying import...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Tables in RDS:', tables.map(t => Object.values(t)[0]));

    // Check data counts
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      if (tableName !== '_prisma_migrations') {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        console.log(`📊 ${tableName}: ${count[0].count} records`);
      }
    }

    console.log('\n🎉 Data successfully imported to AWS RDS!');
    console.log('🔧 Next steps:');
    console.log('1. Update your .env file with the RDS connection string');
    console.log('2. Test your application with the new database');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Check your RDS endpoint URL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your RDS username and password');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('💡 Check your RDS security group settings');
    }
  } finally {
    if (connection) await connection.end();
  }
}

console.log('⚠️ IMPORTANT: Update the RDS_CONFIG object with your actual RDS details before running!');
console.log('📝 You need to replace:');
console.log('   - host: your-rds-endpoint.amazonaws.com');
console.log('   - password: your-rds-password');
console.log('');

importToRDS();
