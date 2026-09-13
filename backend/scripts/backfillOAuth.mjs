import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function backfill() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  await User.updateMany(
    { $or: [{ googleId: { $ne: null } }, { githubId: { $ne: null } }] },
    { isOAuthUser: true }
  );

  await User.updateMany(
    { googleId: null, githubId: null },
    { isOAuthUser: false }
  );

  const users = await User.find({}).select('+googleId +githubId isOAuthUser name email');
  console.log('Backfill complete. Current users:');
  console.log(users.map(u => ({
    name: u.get('name'),
    email: u.get('email'),
    isOAuthUser: u.get('isOAuthUser')
  })));

  await mongoose.disconnect();
}

backfill().catch(console.error);
