import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password is only required if user is NOT signing in via Google or GitHub OAuth
        return !this.googleId && !this.githubId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    accountType: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      default: 'student',
    },
    roleSelected: {
      type: Boolean,
      default: false,
    },
    roleChangesCount: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    subscribeNewsletter: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: null,
      select: false,
    },
    githubId: {
      type: String,
      default: null,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    education: [
      {
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        fieldOfStudy: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
        gpa: { type: String, default: '' },
      },
    ],
    experience: [
      {
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
      },
    ],
    skills: {
      languages: [{ type: String }],
      frameworks: [{ type: String }],
      tools: [{ type: String }],
    },
    certifications: [
      {
        title: { type: String, default: '' },
        issuer: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        credentialUrl: { type: String, default: '' },
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
      select: false,
    },
    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    resetPasswordOtp: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    emailChangeCandidate: {
      type: String,
      default: null,
      select: false,
    },
    emailChangeOtp: {
      type: String,
      default: null,
      select: false,
    },
    emailChangeOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Automatically remove sensitive fields when converting User document to JSON or object
 */
const removeSensitiveFields = (doc, ret) => {
  delete ret.password;
  delete ret.otp;
  delete ret.otpExpires;
  delete ret.resetPasswordOtp;
  delete ret.resetPasswordOtpExpires;
  delete ret.emailChangeOtp;
  delete ret.emailChangeOtpExpires;
  delete ret.emailChangeCandidate;
  delete ret.googleId;
  delete ret.githubId;
  return ret;
};

userSchema.set('toJSON', { transform: removeSensitiveFields });
userSchema.set('toObject', { transform: removeSensitiveFields });

/**
 * Pre-save middleware to hash password before storing in DB
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Method to compare entered password with hashed password in database
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compound unique index allowing the same email to register under different account roles
userSchema.index({ email: 1, accountType: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;
