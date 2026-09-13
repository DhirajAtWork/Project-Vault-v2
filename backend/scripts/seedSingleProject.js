import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedProject = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'projectVault',
    });
    console.log('MongoDB connected successfully.');

    // 1. Find or create an active user to own the project
    let student = await User.findOne({ accountType: 'student' });
    if (!student) {
      student = await User.findOne({});
    }

    if (!student) {
      console.log('No user found. Creating a test student user...');
      student = await User.create({
        name: 'Aarav Sharma',
        email: 'aarav.sharma@iitd.ac.in',
        password: 'password123',
        accountType: 'student',
      });
      console.log('Created student user:', student.email);
    } else {
      console.log(`Using existing user: ${student.name} (${student.email}) [Role: ${student.accountType}]`);
    }

    // 2. Ensure executable directory and sample .exe file exists
    const execDir = path.join(__dirname, '../uploads/executables');
    if (!fs.existsSync(execDir)) {
      fs.mkdirSync(execDir, { recursive: true });
    }

    const exeFileName = 'neural_vault_core.exe';
    const exeFilePath = path.join(execDir, exeFileName);

    if (!fs.existsSync(exeFilePath)) {
      // Write a mock binary header buffer (MZ for DOS/PE Windows executable)
      const buffer = Buffer.alloc(1024 * 1024 * 2); // 2MB dummy binary
      buffer.write('MZ Project Vault AI Runnable Executable Binary Core 2026', 0, 'utf8');
      fs.writeFileSync(exeFilePath, buffer);
      console.log(`Created sample executable file at: ${exeFilePath}`);
    }

    const fileStats = fs.statSync(exeFilePath);
    const host = 'http://localhost:5000';
    const exeUrl = `${host}/uploads/executables/${exeFileName}`;

    // 3. Create rich random test project
    const newProject = await Project.create({
      student: student._id,
      title: 'NeuralVault: Autonomous Multi-Agent Consensus Engine',
      tagline: 'Real-time distributed AI agent network with WebAssembly isolation & Raft consensus telemetry.',
      category: 'Artificial Intelligence & Data Science',
      subcategory: 'Generative AI & LLMs',
      subdomain: 'Autonomous Multi-Agent Networks',
      architectureType: 'Microservices & Distributed Systems',
      majorStack: 'Python / FastAPI / PyTorch',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      description: 'NeuralVault is a high-throughput multi-agent execution runtime. It coordinates asynchronous autonomous LLM agents across distributed nodes with sub-millisecond consensus, isolated sandboxing, and memory graph indexing. Includes a full suite of diagnostics, automated CVE auditing, and executable binaries for upcoming AI project workflows.',
      tags: ['Python', 'FastAPI', 'PyTorch', 'Rust', 'Redis', 'Docker', 'WebAssembly'],
      installCmd: 'pip install -r requirements.txt && cargo build --release',
      runCommand: 'uvicorn main:app --reload --port 8000',
      testCmd: 'pytest tests/ -v',
      envVariables: [
        { key: 'PORT', value: '8000' },
        { key: 'NODE_ENV', value: 'production' },
        { key: 'AGENT_CLUSTER_SECRET', value: 'pv_sec_994827104820' },
        { key: 'REDIS_URL', value: 'redis://default:vaultpwd@localhost:6379' },
        { key: 'OPENAI_API_KEY', value: 'sk-pv-live-8834928104829' },
      ],
      envNotes: 'Requires Python 3.11+, Rust 1.75+, and Redis running on port 6379.',
      githubUrl: 'https://github.com/project-vault-dev/neural-vault-core',
      liveUrl: 'https://neural-vault.dev',
      demoVideoUrl: '',
      executableFile: {
        name: exeFileName,
        filename: exeFileName,
        url: exeUrl,
        size: fileStats.size || 2097152,
        uploadedAt: new Date(),
      },
      status: 'Build Verified',
      score: 98,
      views: 12,
      bookmarks: 3,
    });

    // 4. Increment activity log for student
    const today = new Date().toISOString().split('T')[0];
    await ActivityLog.findOneAndUpdate(
      { student: student._id, date: today, type: 'project_created' },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    console.log('\n=============================================');
    console.log('🎉 Project created successfully!');
    console.log(`Project ID: ${newProject._id}`);
    console.log(`Title: ${newProject.title}`);
    console.log(`Executable Attached: ${newProject.executableFile.name} (${(newProject.executableFile.size / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`Executable URL: ${newProject.executableFile.url}`);
    console.log(`View Project URL: http://localhost:5173/project/view-project/${newProject._id}`);
    console.log(`Projects List URL: http://localhost:5173/dashboard/projects`);
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding project:', error);
    process.exit(1);
  }
};

seedProject();
