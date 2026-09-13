import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Sparkles,
  FileCode2,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Building2,
  Terminal,
  Cpu,
  Users,
  Eye,
  MessageSquare,
  ShieldCheck,
  X
} from 'lucide-react';
import { getRecruiterAnalyticsApi } from '../../api/analyticsApi';

/**
 * Recruiter Dashboard Home - Talent Hub & Candidate Discovery Portal
 * Dynamically computes all recruitment KPIs, outreach pipelines, and top talent showcases from MongoDB.
 */
const RecruiterDashboardHome = ({ user }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getRecruiterAnalyticsApi();
      if (res?.recruiter) {
        setData(res.recruiter);
      }
    } catch (err) {
      console.error('Failed to load recruiter analytics:', err);
      setError(err.message || 'Could not load recruiter data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const recruiterName = user?.name || 'Pooja Deshmukh';
  const recruiterCompany = user?.company || 'Razorpay Engineering / Infosys Labs';
  const recruiterHeadline = user?.headline || 'Director of University Talent Acquisition';
  const recruiterAvatar = user?.avatar || '';

  const kpis = data?.kpis || {
    totalProjects: 0,
    topGradedProjectsCount: 0,
    executableProjectsCount: 0,
    totalOutreach: 0,
    interviewsScheduled: 0,
    acceptedCount: 0,
    totalCandidates: 0,
  };

  const inquiries = data?.inquiries || [];
  const recommendedProjects = data?.recommendedProjects || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* 1. Recruiter Executive Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Recruiter Avatar */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-3xl flex items-center justify-center font-brand overflow-hidden border-2 border-purple-400/40 shadow-xl">
                {recruiterAvatar ? (
                  <img src={recruiterAvatar} alt={recruiterName} className="w-full h-full object-cover" />
                ) : (
                  <span>{recruiterName.substring(0, 2).toUpperCase() || 'PD'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 ring-4 ring-slate-950 flex items-center justify-center" title="Verified Recruiter">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-purple-400" />
                  Recruiter Workspace
                </span>
                <span className="bg-slate-800/90 text-slate-300 border border-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-400" />
                  <span>{recruiterCompany}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-brand text-white">
                {recruiterName}
              </h1>

              <p className="text-purple-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span>{recruiterHeadline}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              to="/dashboard/visit-projects"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-900/30 active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Visit Projects Catalog</span>
            </Link>
            <Link
              to="/dashboard/profile"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Hiring Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Live Dynamic Recruitment KPIs (MongoDB-Calculated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Verified Projects */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Projects</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileCode2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 font-brand">
              {loading ? '...' : kpis.totalProjects}
            </span>
            <p className="text-xs text-slate-500 mt-1">Verified student builds in catalog</p>
          </div>
        </div>

        {/* Metric 2: AI Grade A+ Distinctions */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Grade A+ Showcases</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-purple-700 font-brand">
              {loading ? '...' : kpis.topGradedProjectsCount}
            </span>
            <p className="text-xs text-slate-500 mt-1">Autonomous AI score &ge; 90/100</p>
          </div>
        </div>

        {/* Metric 3: Executable Binaries */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Testable Binaries (.exe)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Terminal className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-700 font-brand">
              {loading ? '...' : kpis.executableProjectsCount}
            </span>
            <p className="text-xs text-slate-500 mt-1">Ready for desktop sandboxed run</p>
          </div>
        </div>

        {/* Metric 4: Scheduled Interviews & Outreach */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Inquiries</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-indigo-700 font-brand">
              {loading ? '...' : kpis.totalOutreach}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-bold text-purple-600">{kpis.interviewsScheduled}</span> Interview Scheduled
            </p>
          </div>
        </div>
      </div>

      {/* 3. Target Talent Sourcing Quick Filters */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border border-purple-200/70 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Target Sourcing by Engineering Domains</span>
            </h2>
            <p className="text-xs text-slate-600">
              Click any high-demand technical vertical to filter student projects instantly
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Generative AI & LLMs', query: 'AI' },
              { label: 'Distributed Systems', query: 'Systems' },
              { label: 'Rust / WASM', query: 'Rust' },
              { label: 'Python / PyTorch', query: 'Python' },
              { label: 'Full-Stack MERN', query: 'MERN' },
            ].map((stack, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/dashboard/visit-projects?search=${encodeURIComponent(stack.query)}`)}
                className="bg-white hover:bg-purple-600 hover:text-white text-slate-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {stack.label} &rarr;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Active Outreach Pipeline & Interview Tracker */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 font-brand flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span>Candidate Outreach & Interview Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time synchronization with student applicant responses and interview schedules
            </p>
          </div>

          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-mono">
            {inquiries.length} Active Records
          </span>
        </div>

        {inquiries.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl p-6">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No active outreach inquiries yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Visit the Projects Catalog to review verified engineering projects and send interview invitations.
            </p>
            <Link
              to="/dashboard/visit-projects"
              className="mt-4 inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-purple-700 transition-all cursor-pointer"
            >
              <span>Explore Projects Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {inquiries.map((inq) => {
              const student = inq.student;
              const studentName = student?.name || 'Candidate Engineer';
              const studentAvatar = student?.avatar || '';

              const getStatusBadge = (status) => {
                switch (status) {
                  case 'interview_scheduled':
                    return (
                      <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Interview Scheduled</span>
                      </span>
                    );
                  case 'accepted':
                    return (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted Inquiry</span>
                      </span>
                    );
                  case 'declined':
                    return (
                      <span className="bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        <span>Declined</span>
                      </span>
                    );
                  default:
                    return (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending Student Review</span>
                      </span>
                    );
                }
              };

              return (
                <div
                  key={inq._id}
                  className="border border-stone-200/80 hover:border-purple-300 rounded-2xl p-4 sm:p-5 transition-all bg-stone-50/50 hover:bg-purple-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Student Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-purple-200">
                      {studentAvatar ? (
                        <img src={studentAvatar} alt={studentName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{studentName.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900">{studentName}</h3>
                        {getStatusBadge(inq.status)}
                      </div>
                      <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                        <span>Project: {inq.projectName}</span>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 italic bg-white p-2 rounded-lg border border-stone-200/60 mt-1">
                        "{inq.message}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Link
                      to="/dashboard/visit-projects"
                      className="bg-white hover:bg-stone-100 text-slate-700 border border-stone-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>Review Showcases</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboardHome;
