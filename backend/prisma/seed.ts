import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      username: "admin",
      profilepic:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("✅ Created admin user:", adminUser.email);

  // Create demo user
  const demoPassword = await bcrypt.hash("demo123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: demoPassword,
      username: "demo",
      profilepic:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("✅ Created demo user:", demoUser.email);

  // Create sample customers
  const customers = [
    {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1-555-0123",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        country: "USA",
        zipCode: "10001",
      },
    },
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1-555-0124",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      address: {
        street: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        zipCode: "90210",
      },
    },
    {
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+1-555-0125",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      address: {
        street: "789 Pine St",
        city: "Chicago",
        state: "IL",
        country: "USA",
        zipCode: "60601",
      },
    },
    {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "+1-555-0126",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      address: {
        street: "321 Elm St",
        city: "Houston",
        state: "TX",
        country: "USA",
        zipCode: "77001",
      },
    },
    {
      name: "David Wilson",
      email: "david.wilson@example.com",
      phone: "+1-555-0127",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      address: {
        street: "654 Maple Ave",
        city: "Phoenix",
        state: "AZ",
        country: "USA",
        zipCode: "85001",
      },
    },
  ];

  for (const customerData of customers) {
    const customer = await prisma.customer.upsert({
      where: { email: customerData.email },
      update: {},
      create: customerData,
    });
    console.log("✅ Created customer:", customer.name);
  }

  // Create sample activities
  const activities = [
    {
      type: "user_registered",
      description: "New user registered: Demo User",
      userId: demoUser.userid.toString(),
    },
    {
      type: "customer_created",
      description: "New customer added: John Smith",
    },
    {
      type: "customer_created",
      description: "New customer added: Sarah Johnson",
    },
  ];

  for (const activityData of activities) {
    const activity = await prisma.activity.create({
      data: activityData,
    });
    console.log("✅ Created activity:", activity.description);
  }

  console.log("🎉 Database seeding completed!");
  console.log("\n📝 Login credentials:");
  console.log("Admin: admin@example.com / admin123");
  console.log("Demo: demo@example.com / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
