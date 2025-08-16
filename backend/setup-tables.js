const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function setupTables() {
  console.log("🔨 Setting up database tables...\n");

  let connection;
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: "dashboard_app",
      multipleStatements: true
    });

    console.log("✅ Connected to dashboard_app database!");

    // Read the setup SQL file
    const sqlFile = path.join(__dirname, "database", "setup.sql");
    const sqlContent = fs.readFileSync(sqlFile, "utf8");

    // Split SQL commands (simple split by semicolon)
    const commands = sqlContent
      .split(";")
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith("--"));

    console.log(`📄 Found ${commands.length} SQL commands to execute...\n`);

    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.toLowerCase().includes("create database") || 
          command.toLowerCase().includes("use dashboard_app")) {
        console.log(`⏭️ Skipping: ${command.substring(0, 50)}...`);
        continue;
      }

      try {
        console.log(`🔄 Executing: ${command.substring(0, 50)}...`);
        await connection.execute(command);
        console.log("✅ Success!");
      } catch (error) {
        if (error.message.includes("already exists")) {
          console.log("⚠️ Already exists, skipping...");
        } else {
          console.error("❌ Error:", error.message);
        }
      }
    }

    // Verify tables were created
    console.log("\n🔍 Checking created tables...");
    const [tables] = await connection.execute("SHOW TABLES");
    console.log("✅ Tables created:", tables.map(t => Object.values(t)[0]));

    // Show sample data
    console.log("\n👥 Sample users:");
    const [users] = await connection.execute("SELECT id, username, email, first_name, last_name FROM users");
    console.table(users);

    await connection.end();
    console.log("\n🎉 Database setup completed successfully!");

  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupTables();
