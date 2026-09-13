import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Project from '../models/Project.js';
import CollaborationRequest from '../models/CollaborationRequest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedRecruiter = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'projectVault',
    });
    console.log('MongoDB connected.');

    // 1. Check or create demo recruiter user
    let recruiter = await User.findOne({ email: 'recruiter.demo@projectvault.dev' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    if (!recruiter) {
      recruiter = await User.create({
        name: 'Pooja Deshmukh',
        email: 'recruiter.demo@projectvault.dev',
        password: hashedPassword,
        accountType: 'recruiter',
        company: 'Razorpay Engineering / Infosys Labs',
        headline: 'Director of University Talent Acquisition & Tech Relations',
        location: 'Bengaluru, Karnataka, India',
        phone: '+91 98765 43210',
        bio: 'Partnering with elite student engineers, systems architects, and AI researchers across Indian engineering colleges to build high-performance distributed systems, WebAssembly runtimes, and autonomous AI agents.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/pooja-deshmukh-talent',
          website: 'https://razorpay.com',
          twitter: 'https://x.com/poojadeshmukh_in',
        },
      });
      console.log('Created Demo Recruiter:', recruiter.email);
    } else {
      recruiter.name = 'Pooja Deshmukh';
      recruiter.accountType = 'recruiter';
      recruiter.company = 'Razorpay Engineering / Infosys Labs';
      recruiter.headline = 'Director of University Talent Acquisition & Tech Relations';
      recruiter.location = 'Bengaluru, Karnataka, India';
      recruiter.phone = '+91 98765 43210';
      recruiter.bio = 'Partnering with elite student engineers, systems architects, and AI researchers across Indian engineering colleges to build high-performance distributed systems, WebAssembly runtimes, and autonomous AI agents.';
      recruiter.socialLinks = {
        linkedin: 'https://linkedin.com/in/pooja-deshmukh-talent',
        website: 'https://razorpay.com',
        twitter: 'https://x.com/poojadeshmukh_in',
      };
      await recruiter.save();
      console.log('Updated Demo Recruiter:', recruiter.email);
    }

    // 2. Find student projects to link inquiries with
    const projects = await Project.find({}).populate('student').limit(5);

    if (projects.length > 0) {
      // Clear existing demo inquiries for this recruiter to avoid stale duplicates
      await CollaborationRequest.deleteMany({ recruiter: recruiter._id });

      const sampleInquiries = [
        {
          student: projects[0].student?._id || projects[0].student,
          recruiter: recruiter._id,
          recruiterName: recruiter.name || 'Pooja Deshmukh',
          recruiterCompany: recruiter.company || 'Razorpay Engineering',
          recruiterRole: recruiter.headline || 'Director of Technical Talent',
          recruiterEmail: recruiter.email || 'recruiter.demo@projectvault.dev',
          projectName: projects[0].title,
          message: `Namaste! Our engineering team at Razorpay Engineering reviewed your project "${projects[0].title}". The architecture and deterministic runtime execution are impressive. We would love to schedule a 30-min technical screening interview for our Core Systems team in Bengaluru!`,
          status: 'interview_scheduled',
        },
      ];

      if (projects.length > 1) {
        sampleInquiries.push({
          student: projects[1].student?._id || projects[1].student,
          recruiter: recruiter._id,
          recruiterName: recruiter.name,
          recruiterCompany: recruiter.company,
          recruiterRole: recruiter.headline,
          recruiterEmail: recruiter.email,
          projectName: projects[1].title,
          message: `Loved your work on "${projects[1].title}". We have an opening for an Associate Distributed Systems Engineer in our Bengaluru tech office and would like to connect with you.`,
          status: 'accepted',
        });
      }

      await CollaborationRequest.insertMany(sampleInquiries);
      console.log(`Created ${sampleInquiries.length} live recruiter inquiries.`);
    }

    console.log('\n=============================================');
    console.log('🎉 Recruiter User Seeded Successfully!');
    console.log('Email: recruiter.demo@projectvault.dev');
    console.log('Password: password123');
    console.log('Account Type: recruiter');
    console.log('Company: Razorpay Engineering / Infosys Labs');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding recruiter:', err);
    process.exit(1);
  }
};

seedRecruiter();
