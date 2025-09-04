const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// List of users to add
const usersToAdd = [
  {
    email: 'student1@example.com',
    password: 'password123',
    username: 'student1',
    name: 'Student One',
    contact: '1234567890'
  },
  {
    email: 'student2@example.com',
    password: 'password123',
    username: 'student2',
    name: 'Student Two',
    contact: '1234567891'
  },
  {
    email: 'teacher@example.com',
    password: 'password123',
    username: 'teacher',
    name: 'Teacher User',
    contact: '1234567892'
  }
  // Add more users here as needed
];

async function bulkAddUsers() {
  console.log('👥 Bulk Add Users Script');
  console.log('========================\n');

  let successCount = 0;
  let errorCount = 0;

  for (const userData of usersToAdd) {
    try {
      console.log(`🔄 Processing: ${userData.email}`);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email.toLowerCase() },
            { username: userData.username },
          ],
        },
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        errorCount++;
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          username: userData.username,
          name: userData.name || null,
          contact: userData.contact || null,
          roles: 3, // Default role for regular users
        },
        select: {
          userid: true,
          email: true,
          username: true,
          name: true,
        },
      });

      console.log(`✅ Created: ${user.email} (ID: ${user.userid})`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`❌ Errors: ${errorCount} users`);

  if (successCount > 0) {
    console.log('\n🎉 All users can login with password: password123');
  }

  await prisma.$disconnect();
}

// Allow custom user list from command line
if (process.argv[2] === '--custom') {
  console.log('📝 Edit the usersToAdd array in this file to add your custom users');
  console.log('Then run: node bulk-add-users.js');
  process.exit(0);
}

bulkAddUsers();
