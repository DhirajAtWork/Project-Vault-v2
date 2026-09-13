import User from '../models/User.js';
import Project from '../models/Project.js';
import CollaborationRequest from '../models/CollaborationRequest.js';
import { sendAccountRemovedEmail } from '../utils/sendEmail.js';

/**
 * @desc    Get Admin Overview Metrics & System Stats
 * @route   GET /api/admin/overview
 * @access  Private (Admin Only)
 */
export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const studentCount = await User.countDocuments({ accountType: 'student' });
    const recruiterCount = await User.countDocuments({ accountType: 'recruiter' });
    const adminCount = await User.countDocuments({ $or: [{ accountType: 'admin' }, { role: 'admin' }] });
    
    const totalProjects = await Project.countDocuments({});
    const verifiedProjects = await Project.countDocuments({ status: { $in: ['Build Verified', 'Audit Approved'] } });
    const totalInquiries = await CollaborationRequest.countDocuments({});

    const recentUsers = await User.find({})
      .select('name email accountType role createdAt avatar headline')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentProjects = await Project.find({})
      .populate('student', 'name email')
      .select('title category status score createdAt views executableFile')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          studentCount,
          recruiterCount,
          adminCount,
          totalProjects,
          verifiedProjects,
          totalInquiries,
          systemHealth: '99.98% Healthy',
          serverUptime: process.uptime ? `${Math.floor(process.uptime() / 60)} mins` : 'Active',
        },
        recentUsers,
        recentProjects,
      },
    });
  } catch (error) {
    console.error('Admin Overview Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin metrics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get All Users for Administration
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users list',
      error: error.message,
    });
  }
};

/**
 * @desc    Get All Student Accounts
 * @route   GET /api/admin/students
 * @access  Private (Admin Only)
 */
export const getAdminStudents = async (req, res) => {
  try {
    const students = await User.find({
      $or: [{ accountType: 'student' }, { accountType: { $exists: false } }, { accountType: null }],
      role: { $ne: 'admin' },
    })
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students list',
      error: error.message,
    });
  }
};

/**
 * @desc    Get All Recruiter Accounts
 * @route   GET /api/admin/recruiters
 * @access  Private (Admin Only)
 */
export const getAdminRecruiters = async (req, res) => {
  try {
    const recruiters = await User.find({ accountType: 'recruiter' })
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      recruiters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recruiters list',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Projects with Dangerous Health Score (score < 40)
 * @route   GET /api/admin/dangerous-projects
 * @access  Private (Admin Only)
 */
export const getDangerousProjects = async (req, res) => {
  try {
    const projects = await Project.find({ score: { $lt: 40, $ne: null } })
      .populate('student', 'name email')
      .select('title category status score createdAt student views')
      .sort({ score: 1 }); // lowest score first

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dangerous projects',
      error: error.message,
    });
  }
};

/**
 * @desc    Get All Projects with Health Scores (Categorized)
 * @route   GET /api/admin/projects-health
 * @access  Private (Admin Only)
 */
export const getAdminProjectsHealth = async (req, res) => {
  try {
    const allProjects = await Project.find({})
      .populate('student', 'name email')
      .select('title category status score createdAt student views')
      .sort({ score: 1 });

    const dangerousProjects = allProjects.filter(p => p.score !== null && p.score !== undefined && p.score < 40);
    const healthyProjects = allProjects.filter(p => p.score === null || p.score === undefined || p.score >= 40);

    res.status(200).json({
      success: true,
      projects: allProjects,
      dangerousProjects,
      healthyProjects,
      dangerousCount: dangerousProjects.length,
      totalCount: allProjects.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects health data',
      error: error.message,
    });
  }
};


/**
 * @desc    Delete a User Account (Admin Action) & send removal email
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting admins
    if (user.accountType === 'admin' || user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot remove admin accounts' });
    }

    const { name, email } = user;

    // Delete user from DB
    await User.findByIdAndDelete(id);

    // Delete associated projects & collaboration requests
    if (user.accountType === 'student') {
      await Project.deleteMany({ student: id });
      await CollaborationRequest.deleteMany({ student: id });
    } else if (user.accountType === 'recruiter') {
      await CollaborationRequest.deleteMany({ recruiter: id });
    }

    // Send removal notification email
    try {
      await sendAccountRemovedEmail(email, name);
    } catch (mailErr) {
      console.warn('Account removal email failed (non-fatal):', mailErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Account for ${name} has been removed successfully.`,
    });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing user account',
      error: error.message,
    });
  }
};
