const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function exportData() {
  console.log('🔄 Exporting data from local MySQL...');
  
  let connection;
  try {
    // Connect to local MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'cloud'
    });

    console.log('✅ Connected to local database');

    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Found tables:', tables.map(t => Object.values(t)[0]));

    let exportSQL = '';
    exportSQL += '-- Database Export for AWS RDS Migration\n';
    exportSQL += '-- Generated on: ' + new Date().toISOString() + '\n\n';
    exportSQL += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

    // Export each table
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`📤 Exporting table: ${tableName}`);

      // Get table structure
      const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      const createStatement = createTable[0]['Create Table'];
      
      exportSQL += `-- Table: ${tableName}\n`;
      exportSQL += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      exportSQL += createStatement + ';\n\n';

      // Get table data
      const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        exportSQL += `-- Data for table: ${tableName}\n`;
        
        // Get column names
        const [columns] = await connection.execute(`DESCRIBE \`${tableName}\``);
        const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
        
        exportSQL += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES\n`;
        
        const values = rows.map(row => {
          const rowValues = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            return value;
          }).join(', ');
          return `(${rowValues})`;
        }).join(',\n');
        
        exportSQL += values + ';\n\n';
      }
    }

    exportSQL += 'SET FOREIGN_KEY_CHECKS = 1;\n';

    // Write to file
    fs.writeFileSync('cloud_export.sql', exportSQL);
    console.log('✅ Data exported to cloud_export.sql');
    console.log(`📊 Exported ${tables.length} tables`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

exportData();
