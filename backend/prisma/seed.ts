import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create sample users if they don't exist
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      name: "Admin User",
      password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m", // password: admin123
      roles: 1, // admin
      contact: "+1234567890",
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      username: "user",
      name: "Regular User",
      password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m", // password: user123
      roles: 3, // user
      contact: "+1234567891",
    },
  });

  console.log("✅ Users created/updated");

  // Create sample FAQs
  const sampleFAQs = [
    {
      title: "How to Report a Scam",
      content:
        'To report a scam, navigate to the Scam Reports section and click "Create Report". Fill in all required information including the scammer\'s details, platform used, and any evidence you may have. Your report will be reviewed by our team.',
      category: "GUIDE",
      tags: "scam,report,guide",
      status: "published",
      isPinned: true,
      createdBy: adminUser.userid,
    },
    {
      title: "What Information Should I Include in a Scam Report?",
      content:
        "When reporting a scam, include as much detail as possible: scammer's name, contact information, platform used, amount lost, screenshots of conversations, and any other relevant evidence. The more information you provide, the better we can help.",
      category: "FAQ",
      tags: "scam,information,evidence",
      status: "published",
      isPinned: false,
      createdBy: adminUser.userid,
    },
    {
      title: "How Long Does It Take to Review a Report?",
      content:
        "Our team typically reviews scam reports within 24-48 hours. Complex cases may take longer. You will receive notifications about the status of your report.",
      category: "FAQ",
      tags: "timeline,review,process",
      status: "published",
      isPinned: false,
      createdBy: adminUser.userid,
    },
    {
      title: "Understanding Scam Alerts",
      content:
        "Scam alerts are warnings about new or trending scams in your area. These are created by our team based on verified reports and help protect the community from similar scams.",
      category: "TUTORIAL",
      tags: "alerts,warnings,protection",
      status: "published",
      isPinned: false,
      createdBy: adminUser.userid,
    },
    {
      title: "How to Stay Safe Online",
      content:
        "Always verify the identity of people you interact with online. Never share personal information, passwords, or financial details with unknown individuals. Use strong passwords and enable two-factor authentication when possible.",
      category: "GUIDE",
      tags: "safety,online,security",
      status: "published",
      isPinned: true,
      createdBy: adminUser.userid,
    },
  ];

  for (const faqData of sampleFAQs) {
    await prisma.fAQ.create({
      data: faqData,
    });
  }

  console.log("✅ Sample FAQs created");

  // Create sample scam reports
  const sampleScamReports = [
    {
      title: "Fake Investment Opportunity",
      description:
        "Someone contacted me claiming to be a financial advisor offering high returns on cryptocurrency investments. They asked for an initial investment of $5000.",
      scammerInfo:
        "Name: John Smith, Phone: +1234567890, Email: john.smith@fakeinvestment.com",
      platform: "WhatsApp",
      status: "pending",
      userId: regularUser.userid,
    },
    {
      title: "Online Shopping Scam",
      description:
        "I found a website selling electronics at extremely low prices. After placing an order and paying, the website disappeared and I never received the items.",
      scammerInfo:
        "Website: cheap-electronics-now.com, Email: support@cheap-electronics-now.com",
      platform: "Website",
      status: "pending",
      userId: regularUser.userid,
    },
  ];

  for (const reportData of sampleScamReports) {
    await prisma.scamReport.create({
      data: reportData,
    });
  }

  console.log("✅ Sample scam reports created");

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
