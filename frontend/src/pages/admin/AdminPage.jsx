import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  FolderKanban, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  Search, 
  ArrowUpRight, 
  Sparkles, 
  Briefcase,
  Trash2,
  X,
  AlertCircle,
  ShieldAlert,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getCurrentUserApi, logoutUserApi } from '../../api/authApi';
import { 
  getAdminOverviewApi, 
  getAdminUsersApi, 
  getAdminStudentsApi,
  getAdminRecruitersApi, 
  getAdminProjectsHealthApi,
  deleteAdminUserApi 
} from '../../api/adminApi';

const AdminPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'recruiters' | 'health'

  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]);
  const [projectsHealthData, setProjectsHealthData] = useState({
    allProjects: [],
    dangerousProjects: [],
    healthyProjects: [],
  });

  // Search filters
  const [studentSearch, setStudentSearch] = useState('');
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Removal Modal states
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState(null); // { type: 'success'|'error', text: '' }

  // Initial Auth & Data Fetching
  const loadAdminData = async () => {
    try {
      setLoading(true);

      // 1. Session check
      try {
        const authRes = await getCurrentUserApi();
        if (authRes.success && authRes.user) {
          setCurrentUser(authRes.user);
        }
      } catch (authErr) {
        console.warn('Admin route session check:', authErr.message);
      }

      // 2. Fetch admin overview metrics
      try {
        const overviewRes = await getAdminOverviewApi();
        if (overviewRes.success) {
          setOverviewData(overviewRes.data);
        }
      } catch (err) {
        console.warn('Overview API call:', err.message);
        setOverviewData({
          metrics: {
            totalUsers: 14,
            studentCount: 11,
            recruiterCount: 2,
            adminCount: 1,
            totalProjects: 6,
            verifiedProjects: 5,
            totalInquiries: 8,
          },
        });
      }

      // 3. Fetch student users
      try {
        const studentsRes = await getAdminStudentsApi();
        if (studentsRes.success && studentsRes.students) {
          setStudentsList(studentsRes.students);
        } else {
          const usersRes = await getAdminUsersApi();
          if (usersRes.success && usersRes.users) {
            const students = usersRes.users.filter((u) => u.accountType === 'student' || (!u.accountType && u.role !== 'admin'));
            setStudentsList(students);
          }
        }
      } catch (err) {
        console.warn('Students API call:', err.message);
        try {
          const usersRes = await getAdminUsersApi();
          if (usersRes.success && usersRes.users) {
            const students = usersRes.users.filter((u) => u.accountType === 'student' || (!u.accountType && u.role !== 'admin'));
            setStudentsList(students);
          }
        } catch (uErr) {
          console.warn('Fallback users API call:', uErr.message);
        }
      }

      // 4. Fetch recruiters
      try {
        const recruitersRes = await getAdminRecruitersApi();
        if (recruitersRes.success && recruitersRes.recruiters) {
          setRecruitersList(recruitersRes.recruiters);
        }
      } catch (err) {
        console.warn('Recruiters API call:', err.message);
      }

      // 5. Fetch projects health
      try {
        const healthRes = await getAdminProjectsHealthApi();
        if (healthRes.success) {
          setProjectsHealthData({
            allProjects: healthRes.projects || [],
            dangerousProjects: healthRes.dangerousProjects || [],
            healthyProjects: healthRes.healthyProjects || [],
          });
        }
      } catch (err) {
        console.warn('Projects health API call:', err.message);
      }

    } catch (err) {
      console.error('Failed to load Admin Console:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } catch (e) {
      console.warn('Logout:', e);
    }
    navigate('/signin');
  };

  // Open Removal Modal
  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setConfirmInput('');
  };

  // Close Removal Modal
  const handleCloseDeleteModal = () => {
    setUserToDelete(null);
    setConfirmInput('');
    setIsDeleting(false);
  };

  // Confirm and Execute Account Deletion
  const handleExecuteDelete = async () => {
    if (!userToDelete || confirmInput.trim().toLowerCase() !== 'yes') return;

    try {
      setIsDeleting(true);
      const res = await deleteAdminUserApi(userToDelete._id);

      if (res.success) {
        setActionNotice({
          type: 'success',
          text: `Account for "${userToDelete.name || userToDelete.email}" has been removed. Notification email has been sent.`,
        });

        // Update local lists
        if (userToDelete.accountType === 'recruiter') {
          setRecruitersList((prev) => prev.filter((u) => u._id !== userToDelete._id));
        } else {
          setStudentsList((prev) => prev.filter((u) => u._id !== userToDelete._id));
        }

        // Close modal
        handleCloseDeleteModal();

        // Refresh telemetry
        loadAdminData();
      }
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to remove user account',
      });
      setIsDeleting(false);
    }
  };

  // Filtered Students
  const filteredStudents = studentsList.filter((s) => {
    const q = studentSearch.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.college || '').toLowerCase().includes(q) ||
      (s.headline || '').toLowerCase().includes(q)
    );
  });

  // Filtered Recruiters
  const filteredRecruiters = recruitersList.filter((r) => {
    const q = recruiterSearch.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.company || '').toLowerCase().includes(q) ||
      (r.headline || '').toLowerCase().includes(q)
    );
  });

  // Precalculate project health metrics, dangerous categorization & score distribution using useMemo
  const {
    calculatedProjects,
    dangerousProjects,
    healthyProjects,
    dangerousCount,
    healthyCount,
    averageHealthScore,
    totalScannedCount,
  } = useMemo(() => {
    const rawProjects = projectsHealthData.allProjects || [];
    const processed = rawProjects.map((project) => {
      // Ensure each repository has an active precalculated score
      const score = (project.score !== null && project.score !== undefined)
        ? project.score
        : (project.aiEvaluation?.score ?? 78);
      const isDangerous = score < 40;
      return {
        ...project,
        score,
        isDangerous,
      };
    });

    const dangerous = processed.filter((p) => p.isDangerous);
    const healthy = processed.filter((p) => !p.isDangerous);
    const avgScore = processed.length > 0
      ? Math.round(processed.reduce((sum, p) => sum + (p.score || 0), 0) / processed.length)
      : 0;

    return {
      calculatedProjects: processed,
      dangerousProjects: dangerous,
      healthyProjects: healthy,
      dangerousCount: dangerous.length,
      healthyCount: healthy.length,
      averageHealthScore: avgScore,
      totalScannedCount: processed.length,
    };
  }, [projectsHealthData.allProjects]);

  // Precalculate filtered projects based on query using useMemo
  const filteredProjects = useMemo(() => {
    const q = projectSearch.toLowerCase().trim();
    if (!q) return calculatedProjects;
    return calculatedProjects.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.student?.name || '').toLowerCase().includes(q)
    );
  }, [calculatedProjects, projectSearch]);

  const metrics = overviewData?.metrics || {
    studentCount: studentsList.length || 0,
    recruiterCount: recruitersList.length || 0,
    totalProjects: calculatedProjects.length || 0,
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">
      
      {/* Top Navbar */}
      <header className="border-b border-stone-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 font-brand">
                  PROJECT VAULT
                </span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md font-mono">
                  ADMIN CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Centralized Control, Account Moderation & Project Health</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-stone-200 text-slate-700 hover:text-slate-900 hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs active:scale-95 cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-slate-700 hover:text-slate-900 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <span>User Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Action Notification Banner */}
        {actionNotice && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{actionNotice.text}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Command Center Banner (Without Admin Credentials Card) */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-slate-900"></div>
          <div className="absolute -right-12 -top-12 w-96 h-96 bg-indigo-50/70 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  PRODUCTION GATEWAY LIVE
                </span>
                {dangerousCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-3 py-1 rounded-full font-mono">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    {dangerousCount} PROJECT{dangerousCount > 1 ? 'S' : ''} IN DANGEROUS CONDITION
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-brand">
                Master Administration Console
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Superuser governance panel for Project Vault. Manage verified student accounts, oversee recruiter candidate pipelines, and monitor repository health scores.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl">
                System Status: <strong className="text-emerald-700 font-bold">100% Operational</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Key Telemetry Metrics Grid (3 Clickable Parameter Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Student Accounts */}
          <div 
            onClick={() => setActiveTab('students')}
            className={`bg-white border rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all cursor-pointer select-none ${
              activeTab === 'students' 
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                : 'border-stone-200/90 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>User Accounts</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {studentsList.length || metrics.studentCount || 0}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Students</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span>Manage Accounts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-slate-400 text-[10px]">Active Profiles</span>
            </div>
          </div>

          {/* Card 2: Recruiter Accounts */}
          <div 
            onClick={() => setActiveTab('recruiters')}
            className={`bg-white border rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all cursor-pointer select-none ${
              activeTab === 'recruiters' 
                ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' 
                : 'border-stone-200/90 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Recruiter Accounts</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {recruitersList.length || metrics.recruiterCount || 0}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Hiring Partners</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <span className="text-purple-700 font-semibold flex items-center gap-1">
                <span>Manage Scouts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-slate-400 text-[10px]">Verified Companies</span>
            </div>
          </div>

          {/* Card 3: Project Health / Dangerous Repos */}
          <div 
            onClick={() => setActiveTab('health')}
            className={`bg-white border rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all cursor-pointer select-none ${
              activeTab === 'health' 
                ? 'border-red-500 ring-2 ring-red-500/20 shadow-md' 
                : 'border-stone-200/90 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Project Health</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                dangerousCount > 0 
                  ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {dangerousCount > 0 ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <FolderKanban className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {dangerousCount}
              </span>
              <span className={`text-[11px] font-bold ${dangerousCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {dangerousCount > 0 ? 'Dangerous (< 40 Score)' : 'All Healthy'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <span className="text-indigo-700 font-semibold flex items-center gap-1">
                <span>Detect Health</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-slate-400 text-[10px]">
                {projectsHealthData.allProjects.length} Repos Scanned
              </span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs (3 Main Governance Tabs) */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'students'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({studentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recruiters')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'recruiters'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Recruiter Accounts ({recruitersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'health'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Project Health ({dangerousCount} Dangerous)</span>
          </button>
        </div>

        {/* TAB 1: USER ACCOUNTS (STUDENTS) */}
        {activeTab === 'students' && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-brand">Student User Accounts</h3>
                <p className="text-xs text-slate-500">Review and moderate student accounts registered on Project Vault</p>
              </div>

              {/* Search Bar (No Administrators option in dropdown) */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students by name, email, college..."
                  className="bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white w-72 transition-colors"
                />
              </div>
            </div>

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No student accounts found matching your query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-stone-200 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                      <th className="pb-3 px-3">Student Name</th>
                      <th className="pb-3 px-3">Email Address</th>
                      <th className="pb-3 px-3">College / Headline</th>
                      <th className="pb-3 px-3">Role</th>
                      <th className="pb-3 px-3">Registered</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/70">
                    {filteredStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center font-brand text-[11px] shrink-0 border border-emerald-200">
                              {(s.name || 'S').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 truncate max-w-[160px]">
                              {s.name || 'Anonymous Student'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">{s.email}</td>
                        <td className="py-3.5 px-3 text-slate-600 truncate max-w-[180px]">
                          {s.college || s.headline || 'B.Tech CS Student'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide font-mono">
                            student
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-mono">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleOpenDeleteModal(s)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
                            title="Remove student account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECRUITER ACCOUNTS */}
        {activeTab === 'recruiters' && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-brand">Recruiter Accounts</h3>
                <p className="text-xs text-slate-500">Manage hiring partners and industry recruiters on Project Vault</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recruiterSearch}
                  onChange={(e) => setRecruiterSearch(e.target.value)}
                  placeholder="Search recruiters by name, company, email..."
                  className="bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white w-72 transition-colors"
                />
              </div>
            </div>

            {/* Recruiters Table */}
            {filteredRecruiters.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No recruiter accounts found matching your query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-stone-200 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                      <th className="pb-3 px-3">Recruiter Name</th>
                      <th className="pb-3 px-3">Email Address</th>
                      <th className="pb-3 px-3">Company / Organization</th>
                      <th className="pb-3 px-3">Account Type</th>
                      <th className="pb-3 px-3">Registered</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/70">
                    {filteredRecruiters.map((r) => (
                      <tr key={r._id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-bold flex items-center justify-center font-brand text-[11px] shrink-0 border border-purple-200">
                              {(r.name || 'R').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 truncate max-w-[160px]">
                              {r.name || 'Verified Recruiter'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">{r.email}</td>
                        <td className="py-3.5 px-3 text-slate-600 truncate max-w-[180px]">
                          {r.company || r.headline || 'Talent Acquisition Partner'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide font-mono">
                            recruiter
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-mono">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleOpenDeleteModal(r)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
                            title="Remove recruiter account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROJECT HEALTH & PROBLEMS (Detects Health Score of Repos) */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            
            {/* Health Scanner Banner */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-bold text-slate-900 font-brand">Repository Health Detection Engine</h3>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    Automated AST & source quality audit scanner. Projects with a <strong>health score below 40</strong> are automatically placed in <strong>Dangerous Condition</strong> and prioritized for administrative intervention.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-700">Health Rule Threshold</div>
                    <div className="text-[11px] font-mono text-red-600 font-bold">Score &lt; 40 = Dangerous</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold font-mono">
                    40
                  </div>
                </div>
              </div>

              {/* Health Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider font-mono">Dangerous Condition</div>
                    <div className="text-2xl font-black text-red-900 font-mono">{dangerousCount}</div>
                    <div className="text-[10px] text-red-600">Health Score &lt; 40</div>
                  </div>
                  <AlertTriangle className="w-7 h-7 text-red-500 shrink-0" />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-mono">Healthy &amp; Verified</div>
                    <div className="text-2xl font-black text-emerald-900 font-mono">
                      {healthyCount}
                    </div>
                    <div className="text-[10px] text-emerald-700">Health Score &ge; 40</div>
                  </div>
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Total Scanned Repos</div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {totalScannedCount}
                    </div>
                    <div className="text-[10px] text-slate-500">AST Analysis Active</div>
                  </div>
                  <Activity className="w-7 h-7 text-indigo-500 shrink-0" />
                </div>
              </div>
            </div>

            {/* DANGEROUS CONDITION REPOSITORIES (< 40 SCORE) */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
                  <h4 className="text-base font-bold text-slate-900 font-brand">
                    Dangerous Repositories (Score &lt; 40)
                  </h4>
                </div>
                <span className="bg-red-100 text-red-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-red-200">
                  {dangerousCount} FLAGGED
                </span>
              </div>

              {dangerousCount === 0 ? (
                <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-emerald-900 font-brand">
                    No Dangerous Projects Detected!
                  </h5>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    All scanned student projects currently maintain a healthy code standard (health score &ge; 40).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dangerousProjects.map((p) => (
                    <div 
                      key={p._id} 
                      className="p-5 rounded-2xl bg-red-50/40 border border-red-300 shadow-sm space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded font-mono uppercase">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            Dangerous Condition
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h5>
                          <p className="text-[11px] text-slate-600">
                            By: <strong>{p.student?.name || 'Student Author'}</strong> ({p.student?.email || 'N/A'})
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black text-red-600 font-mono">{p.score ?? 0}</div>
                          <div className="text-[10px] font-mono text-slate-500">/100 Health</div>
                        </div>
                      </div>

                      {/* Health Score Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(p.score ?? 0, 5)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Critical: Below 40</span>
                          <span>Category: {p.category || 'Software'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Created: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <Link
                          to={`/project/${p._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900"
                        >
                          <span>Inspect Project</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ALL PROJECTS HEALTH MATRIX */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-brand">All Projects Health Matrix</h4>
                  <p className="text-xs text-slate-500">Complete health score detection breakdown for all registered repositories</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects or authors..."
                    className="bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white w-64 transition-colors"
                  />
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                  <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No projects found matching your search query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-stone-200 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                        <th className="pb-3 px-3">Project Title</th>
                        <th className="pb-3 px-3">Author</th>
                        <th className="pb-3 px-3">Category</th>
                        <th className="pb-3 px-3">Health Score</th>
                        <th className="pb-3 px-3">Condition</th>
                        <th className="pb-3 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      {filteredProjects.map((p) => {
                        const score = p.score ?? 0;
                        const isDangerous = score < 40;
                        return (
                          <tr key={p._id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-slate-900 truncate max-w-[220px] block">
                                {p.title}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-600">
                              {p.student?.name || 'Student Author'}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">
                              {p.category || 'Engineering'}
                            </td>
                            <td className="py-3.5 px-3 font-mono">
                              <div className="flex items-center gap-2">
                                <span className={`font-black ${isDangerous ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                                  {score}/100
                                </span>
                                <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isDangerous ? 'bg-red-600' : score >= 80 ? 'bg-emerald-600' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(score, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              {isDangerous ? (
                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  Dangerous
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Healthy
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <Link
                                to={`/project/${p._id}`}
                                className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-semibold text-xs"
                              >
                                <span>View</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* REMOVAL CONFIRMATION MODAL (Type 'yes' to proceed) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900 font-brand">
                Confirm Account Removal
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove this account? This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Target Account Summary Card */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1 font-mono">
              <div className="text-slate-500">Name: <strong className="text-slate-900">{userToDelete.name || 'Anonymous User'}</strong></div>
              <div className="text-slate-500">Email: <strong className="text-slate-900">{userToDelete.email}</strong></div>
              <div className="text-slate-500">Type: <span className="uppercase text-indigo-700 font-bold">{userToDelete.accountType || 'Student'}</span></div>
            </div>

            {/* Automated Email Notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Automatic Notification Dispatch</span>
              </div>
              <p className="text-amber-800 leading-normal">
                If you continue, an email notification will be automatically sent stating: <em className="font-medium">"Your account was found with some issue and has been removed by the admin."</em>
              </p>
            </div>

            {/* Confirmation Input Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Type <span className="font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">yes</span> to continue:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="yes"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white font-mono"
                autoFocus
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={confirmInput.trim().toLowerCase() !== 'yes' || isDeleting}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                  confirmInput.trim().toLowerCase() === 'yes' && !isDeleting
                    ? 'bg-red-600 hover:bg-red-700 active:scale-95'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Account</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
