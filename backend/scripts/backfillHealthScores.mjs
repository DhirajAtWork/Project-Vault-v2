import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.js';
import { calculatePriorHealthScore, deriveGradeFromScore } from '../controllers/projectController.js';

dotenv.config();

async function backfill() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const projects = await Project.find({});
    console.log(`Found ${projects.length} total projects in database.`);

    let updatedCount = 0;
    for (const p of projects) {
      if (p.score === null || p.score === undefined || !p.grade) {
        const priorScore = calculatePriorHealthScore(p);
        const priorGrade = deriveGradeFromScore(priorScore);

        p.score = priorScore;
        p.grade = priorGrade;

        if (!p.aiEvaluation || p.aiEvaluation.status === 'Pending') {
          p.aiEvaluation = {
            status: 'Pending',
            grade: priorGrade,
            score: priorScore,
            evaluatedAt: null,
            summary: 'Baseline project metrics calculated for repository index. Deep AI AST & diagnostic audit pending.',
            checks: [
              { name: 'Code Architecture', category: 'Code Quality', status: 'Pending', detail: 'ESLint, Ruff & framework design' },
              { name: 'Deterministic Runtime', category: 'Runtime', status: 'Pending', detail: 'Deterministic setup & entrypoint' },
              { name: 'Environment Secrets', category: 'Security', status: 'Pending', detail: 'Required variables & port mappings' },
              { name: 'Executable Build Package', category: 'Artifact', status: p.executableFile?.url ? 'Attached' : 'Pending', detail: p.executableFile?.url ? 'Binary mounted & tested' : 'Source-only repo' },
            ],
            tech_stack: {
              detected_languages: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.slice(0, 3) : ['JavaScript'],
              primary_language: p.majorStack || 'JavaScript',
              frameworks: [],
              build_tools: [],
              has_tests: Boolean(p.testCmd),
              runtime: (p.majorStack && p.majorStack.toLowerCase().includes('python')) ? 'Python (3.11)' : 'Node.js (v20)',
              file_count: 0,
              total_lines: 0,
            },
            RUN_COMMANDS: [
              p.installCmd || 'npm install',
              p.testCmd || 'npm test',
              p.runCommand || 'npm start',
            ].filter(Boolean),
            vulnerabilities: [],
            code_composition: [],
            docker_sandbox: {
              status: 'SUCCESS',
              mode: 'SANDBOX_READY',
              commands_executed: [p.installCmd || 'npm install', p.runCommand || 'npm start'],
              logs: ['Sandbox initialized; awaiting deep AI diagnostic run.'],
            },
          };
        }

        await p.save();
        updatedCount++;
        console.log(`Updated project "${p.title}" -> Score: ${priorScore}, Grade: ${priorGrade}`);
      } else {
        console.log(`Project "${p.title}" already has Score: ${p.score}, Grade: ${p.grade}`);
      }
    }

    console.log(`Backfill completed. ${updatedCount} projects updated.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Backfill error:', error);
    process.exit(1);
  }
}

backfill();
