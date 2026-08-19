const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const bcrypt = require("bcryptjs");

let mongodInstance = null;

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Seeding initial sample data (Students, Company, Admin)...");
      const hashedPassword = await bcrypt.hash("password123", 10);
      const adminPassword = await bcrypt.hash("admin123", 10);

      // Create Admin
      await User.create({
        name: "Portal Admin",
        username: "admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",
        isVerified: true,
        approved: true,
      });

      // Create Students
      await User.create({
        name: "Alice Johnson",
        username: "alice",
        email: "alice@example.com",
        password: hashedPassword,
        role: "student",
        skills: ["Python", "Machine Learning", "Data Science", "SQL"],
        isVerified: true,
      });

      await User.create({
        name: "Bob Smith",
        username: "bob",
        email: "bob@example.com",
        password: hashedPassword,
        role: "student",
        skills: ["React", "JavaScript", "Node.js", "Express", "MongoDB"],
        isVerified: true,
      });

      // Create Companies
      const company1 = await User.create({
        name: "Tech Corp",
        username: "techcorp",
        email: "hr@techcorp.com",
        password: hashedPassword,
        role: "company",
        isVerified: true,
        approved: true,
      });

      const company2 = await User.create({
        name: "Innovate AI",
        username: "innovateai",
        email: "careers@innovate.ai",
        password: hashedPassword,
        role: "company",
        isVerified: true,
        approved: true,
      });

      // Create Sample Jobs
      await Job.create([
        {
          title: "Junior Machine Learning Engineer",
          description: "Join our AI research team to build and train machine learning models using Python and scikit-learn.",
          skillsRequired: ["Python", "Machine Learning", "Data Science"],
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          salary: "$85,000 / year",
          experience: "0-2 years",
          company: company1._id,
        },
        {
          title: "Full Stack React / Node Developer",
          description: "Build high-performance web applications using React, Node.js, Express, and MongoDB.",
          skillsRequired: ["React", "JavaScript", "Node.js", "MongoDB"],
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          salary: "$90,000 / year",
          experience: "1-3 years",
          company: company2._id,
        },
        {
          title: "Python Backend Developer",
          description: "Develop scalable APIs and microservices using Python and Flask / FastApi.",
          skillsRequired: ["Python", "SQL", "Flask"],
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          salary: "$80,000 / year",
          experience: "0-1 years",
          company: company1._id,
        }
      ]);

      console.log("✅ Initial Data Seeded Successfully!");
      console.log("=========================================");
      console.log("🎓 Student Login: alice@example.com / password123");
      console.log("🏢 Company Login: hr@techcorp.com / password123");
      console.log("👑 Admin Login:   admin@example.com / admin123");
      console.log("=========================================");
    }
  } catch (seedErr) {
    console.log("Seed note:", seedErr.message);
  }
};

const connectDB = async () => {
  const defaultUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/placement";

  try {
    // Try connecting to external / local MongoDB instance first (5s timeout)
    await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 5000,
    });
    const safeUri = defaultUri.includes("@") ? defaultUri.split("@")[1] : defaultUri;
    console.log(`✅ MongoDB Connected to: ${safeUri}`);
  } catch (error) {
    console.log(`⚠️ Primary MongoDB connection attempt to ${defaultUri.includes("@") ? defaultUri.split("@")[1] : defaultUri} failed: ${error.message}`);

    // If a remote MONGO_URI is explicitly specified in production, fail clearly
    if (process.env.NODE_ENV === "production" && process.env.MONGO_URI && !process.env.MONGO_URI.includes("127.0.0.1") && !process.env.MONGO_URI.includes("localhost")) {
      console.error("❌ Failed to connect to MongoDB Atlas. Please ensure MONGO_URI is correct and IP 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.");
      process.exit(1);
    }

    console.log(`🚀 Attempting to start embedded MongoDB engine for local dev fallback...`);

    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongodInstance = await MongoMemoryServer.create();
      const embeddedUri = mongodInstance.getUri();
      await mongoose.connect(embeddedUri);
      console.log(`✅ Connected to Embedded MongoDB at: ${embeddedUri}`);
    } catch (embeddedErr) {
      console.error("❌ Could not connect to MongoDB and embedded MongoDB is unavailable:", embeddedErr.message);
      console.error("💡 Please configure a valid MONGO_URI environment variable (e.g. MongoDB Atlas).");
      process.exit(1);
    }
  }

  await seedInitialData();
};

module.exports = connectDB;

