import mongoose from 'mongoose';

/**
 * ProfileView Schema
 * Tracks every profile and project impression, including viewer role,
 * recruiter company demographics, and timestamps for live analytics.
 */
const profileViewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    viewerRole: {
      type: String,
      enum: ['student', 'recruiter', 'guest'],
      default: 'guest',
    },
    viewerCompany: {
      type: String,
      default: 'General Visitor',
      trim: true,
    },
    industry: {
      type: String,
      default: 'Tech & Engineering',
    },
    searchKeyword: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

profileViewSchema.index({ student: 1, createdAt: -1 });

const ProfileView = mongoose.model('ProfileView', profileViewSchema);
export default ProfileView;
