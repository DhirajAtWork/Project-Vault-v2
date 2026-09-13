import mongoose from 'mongoose';

/**
 * CollaborationRequest Schema
 * Tracks inquiries, interview invites, and project collaboration requests
 * sent by recruiters to student developers.
 */
const collaborationRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required'],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recruiterName: {
      type: String,
      required: [true, 'Recruiter name is required'],
      trim: true,
    },
    recruiterCompany: {
      type: String,
      required: [true, 'Recruiter company is required'],
      trim: true,
    },
    recruiterRole: {
      type: String,
      default: 'Technical Talent Lead',
      trim: true,
    },
    recruiterAvatar: {
      type: String,
      default: '',
    },
    recruiterEmail: {
      type: String,
      default: '',
      trim: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      default: 'Portfolio Showcase',
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'interview_scheduled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema);
export default CollaborationRequest;
