const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function addUser() {
  console.log('👤 Add New User Script');
  console.log('====================\n');

  // Get user input from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('❌ Usage: node add-user.js <email> <password> <username> [name] [contact]');
    console.log('📝 Example: node add-user.js john@example.com password123 johndoe "John Doe" "1234567890"');
    process.exit(1);
  }

  const [email, password, username, name, contact] = args;

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      console.error('❌ User already exists with this email or username');
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    console.log('👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username: username,
        name: name || null,
        contact: contact || null,
        roles: 3, // Default role for regular users
      },
      select: {
        userid: true,
        email: true,
        username: true,
        name: true,
        contact: true,
        roles: true,
        created_at: true,
      },
    });

    console.log('✅ User created successfully!');
    console.log('📋 User Details:');
    console.log(`   ID: ${user.userid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Name: ${user.name || 'Not provided'}`);
    console.log(`   Contact: ${user.contact || 'Not provided'}`);
    console.log(`   Role: ${user.roles === 1 ? 'Admin' : user.roles === 2 ? 'Moderator' : 'User'}`);
    console.log(`   Created: ${user.created_at}`);

    console.log('\n🎉 User can now login with:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addUser();
