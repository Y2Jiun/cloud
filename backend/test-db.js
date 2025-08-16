const mysql = require("mysql2/promise");
require("dotenv").config();

// Create connection without database specified
const connectionConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
};

async function testDatabase() {
  console.log("🔍 Testing database connection...\n");

  let connection;
  try {
    // Connect without specifying database
    connection = await mysql.createConnection(connectionConfig);
    console.log("✅ MySQL connection successful!");

    // Check if dashboard_app database exists
    const [databases] = await connection.execute("SHOW DATABASES");
    console.log(
      "📊 Available databases:",
      databases.map((db) => db.Database)
    );

    const dbExists = databases.some((db) => db.Database === "dashboard_app");

    if (!dbExists) {
      console.log("🔨 Creating dashboard_app database...");
      await connection.execute("CREATE DATABASE dashboard_app");
      console.log("✅ Database dashboard_app created successfully!");
    } else {
      console.log("✅ Database dashboard_app already exists!");
    }

    // Test basic query
    console.log("📊 Testing basic query...");
    const [result] = await connection.execute("SELECT 1 as test");
    console.log("✅ Basic query successful:", result);

    // Check tables in dashboard_app
    console.log("\n🗄️ Checking tables...");
    const [tables] = await connection.execute("SHOW TABLES FROM dashboard_app");
    if (tables.length > 0) {
      console.log(
        "✅ Tables found:",
        tables.map((t) => Object.values(t)[0])
      );
    } else {
      console.log("⚠️ No tables found. Run setup.sql to create tables.");
    }

    await connection.end();
    console.log("\n🎉 Database test completed!");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    if (connection) await connection.end();
  }

  process.exit(0);
}

testDatabase();
