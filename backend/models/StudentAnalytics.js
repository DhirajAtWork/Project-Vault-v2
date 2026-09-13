import mongoose from 'mongoose';

/**
 * StudentAnalytics Schema
 * Stores activity records, GitHub-like daily/monthly contributions,
 * profile view stats, and recruiter engagement metrics for a student.
 */
const studentAnalyticsSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalProjects: {
      type: Number,
      default: 0,
    },
    profileViews: {
      type: Number,
      default: 1420,
    },
    recruiterViews: {
      type: Number,
      default: 965,
    },
    projectBookmarks: {
      type: Number,
      default: 342,
    },
    // Daily activity/contribution records for GitHub-style heatmap (date: 'YYYY-MM-DD', count: Number)
    dailyContributions: [
      {
        date: { type: String, required: true },
        count: { type: Number, default: 1 },
      },
    ],
    // Monthly statistics for bar charts
    monthlyStats: [
      {
        month: { type: String, required: true },
        year: { type: Number, required: true },
        projects: { type: Number, default: 0 },
        commits: { type: Number, default: 0 },
        recruiterViews: { type: Number, default: 0 },
      },
    ],
    topSearchSkills: [
      {
        skill: { type: String },
        searches: { type: Number, default: 0 },
      },
    ],
    recruiterIndustries: [
      {
        industry: { type: String },
        percentage: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const StudentAnalytics = mongoose.model('StudentAnalytics', studentAnalyticsSchema);
export default StudentAnalytics;
