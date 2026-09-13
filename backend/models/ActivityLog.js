import mongoose from 'mongoose';

/**
 * ActivityLog Schema
 * Logs engineering milestones, code pushes, project additions, and profile actions
 * to calculate real-time daily/monthly heatmaps and streaks.
 */
const activityLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['project_created', 'project_updated', 'commit_logged', 'milestone_completed', 'profile_updated'],
      default: 'commit_logged',
    },
    count: {
      type: Number,
      default: 1,
    },
    date: {
      type: String, // 'YYYY-MM-DD' format for fast grouping
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ student: 1, date: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
