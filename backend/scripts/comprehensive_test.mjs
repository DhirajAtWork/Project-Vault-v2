// Integration Test with Mongoose and HTTP
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== PROJECT VAULT COMPREHENSIVE TEST SUITE ===\n');

  // 1. Health check
  console.log('1. Checking Backend Health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  if (!healthData.success) throw new Error('Health check failed');
  console.log('   ✓ Health check passed');

  // 2. Connect to DB to fetch an existing user or create a JWT
  let retries = 3;
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      break;
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      console.log('   Retrying DB connection...');
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.log('   ✓ Connected to MongoDB Atlas');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  let user = await User.findOne({ email: { $exists: true } });

  if (!user) {
    throw new Error('No user found in database to test');
  }

  console.log(`\n2. Found existing user: ${user.get('name')} (${user.get('email')}, ${user.get('accountType')})`);

  // Generate valid test JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('   ✓ Generated valid JWT test token');

  // 3. Test /api/auth/me
  console.log('\n3. Testing GET /api/auth/me...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  if (!meData.success || !meData.user) {
    throw new Error('GET /api/auth/me failed: ' + JSON.stringify(meData));
  }
  console.log(`   ✓ Successfully retrieved current user: ${meData.user.name}`);

  // 4. Test PUT /api/auth/account-type to recruiter
  console.log('\n4. Testing PUT /api/auth/account-type (Switch to recruiter)...');
  const toRecruiterRes = await fetch(`${BASE_URL}/auth/account-type`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ accountType: 'recruiter' })
  });
  const toRecruiterData = await toRecruiterRes.json();
  if (!toRecruiterData.success || toRecruiterData.user.accountType !== 'recruiter') {
    throw new Error('Switch to recruiter failed: ' + JSON.stringify(toRecruiterData));
  }
  console.log(`   ✓ Account type updated to: ${toRecruiterData.user.accountType}`);
  console.log(`   ✓ roleSelected: ${toRecruiterData.user.roleSelected}`);

  // 5. Test PUT /api/auth/account-type back to student
  console.log('\n5. Testing PUT /api/auth/account-type (Switch back to student)...');
  const toStudentRes = await fetch(`${BASE_URL}/auth/account-type`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${toRecruiterData.token || token}`
    },
    body: JSON.stringify({ accountType: 'student' })
  });
  const toStudentData = await toStudentRes.json();
  if (!toStudentData.success || toStudentData.user.accountType !== 'student') {
    throw new Error('Switch back to student failed: ' + JSON.stringify(toStudentData));
  }
  console.log(`   ✓ Account type switched back to: ${toStudentData.user.accountType}`);

  // 6. Test GET /api/projects
  console.log('\n6. Testing GET /api/projects?scope=all...');
  const projectsRes = await fetch(`${BASE_URL}/projects?scope=all`);
  const projectsData = await projectsRes.json();
  if (!projectsData.success || !Array.isArray(projectsData.projects)) {
    throw new Error('GET /api/projects failed: ' + JSON.stringify(projectsData));
  }
  console.log(`   ✓ Verified ${projectsData.projects.length} projects retrieved`);

  // 7. Test Student Analytics
  console.log('\n7. Testing GET /api/analytics/student...');
  const analyticsRes = await fetch(`${BASE_URL}/analytics/student`, {
    headers: { 'Authorization': `Bearer ${toStudentData.token || token}` }
  });
  const analyticsData = await analyticsRes.json();
  if (!analyticsData.success) {
    throw new Error('GET /api/analytics/student failed: ' + JSON.stringify(analyticsData));
  }
  console.log(`   ✓ Student Analytics operational (Views: ${analyticsData.analytics?.totalViews ?? 0})`);

  // 8. Test Recruiter Analytics
  console.log('\n8. Testing GET /api/analytics/recruiter...');
  const recruiterAnalyticsRes = await fetch(`${BASE_URL}/analytics/recruiter`, {
    headers: { 'Authorization': `Bearer ${toStudentData.token || token}` }
  });
  const recruiterAnalyticsData = await recruiterAnalyticsRes.json();
  if (!recruiterAnalyticsData.success) {
    throw new Error('GET /api/analytics/recruiter failed: ' + JSON.stringify(recruiterAnalyticsData));
  }
  console.log(`   ✓ Recruiter Analytics operational (Total Requests Sent: ${recruiterAnalyticsData.analytics?.totalRequestsSent ?? 0})`);

  // 9. Test Student Projects (scope=me)
  console.log('\n9. Testing GET /api/projects?scope=me...');
  const myProjectsRes = await fetch(`${BASE_URL}/projects?scope=me`, {
    headers: { 'Authorization': `Bearer ${toStudentData.token || token}` }
  });
  const myProjectsData = await myProjectsRes.json();
  if (!myProjectsData.success || !Array.isArray(myProjectsData.projects)) {
    throw new Error('GET /api/projects?scope=me failed: ' + JSON.stringify(myProjectsData));
  }
  console.log(`   ✓ Retrieved ${myProjectsData.projects.length} user-owned projects`);

  await mongoose.disconnect();
  console.log('\n=============================================');
  console.log('🎉 ALL INTEGRATION & BACKEND TESTS PASSED 100%!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('\n❌ ERROR:', err);
  process.exit(1);
});
