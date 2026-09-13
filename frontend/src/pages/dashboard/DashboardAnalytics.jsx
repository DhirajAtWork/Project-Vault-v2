import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  FolderKanban,
  Eye,
  Users,
  Bookmark,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Flame,
  Award,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Check,
  X,
  CalendarDays,
  Building2
} from 'lucide-react';
import { getStudentAnalyticsApi, updateCollaborationStatusApi } from '../../api/analyticsApi';

const DashboardAnalytics = () => {
  const { user } = useOutletContext() || {};
  const userName = user?.name || 'Student Developer';
  const accountType = user?.accountType || 'student';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeTab, setActiveTab] = useState('all'); // all | pending | accepted | interview_scheduled
  const [chartMode, setChartMode] = useState('activity'); // activity | recruiterViews
  const [hoveredDay, setHoveredDay] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch analytics data dynamically computed by backend
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentAnalyticsApi();
      if (res.success && res.analytics) {
        setAnalyticsData(res.analytics);
      } else {
        throw new Error(res.message || 'Unable to calculate analytics');
      }
    } catch (err) {
      console.error('Backend analytics calculation error:', err);
      setError(err.message || 'Failed to calculate analytics from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const handleFocus = () => {
      fetchAnalytics();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Handle status update for recruiter collaboration inquiries
  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      await updateCollaborationStatusApi(id, newStatus);
      // Update local state optimistically
      setAnalyticsData((prev) => {
        if (!prev) return prev;
        const updatedReqs = prev.collaborationRequests.map((req) =>
          req._id === id ? { ...req, status: newStatus } : req
        );
        return {
          ...prev,
          collaborationRequests: updatedReqs,
        };
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered collaboration requests
  const filteredRequests = useMemo(() => {
    if (!analyticsData?.collaborationRequests) return [];
    if (activeTab === 'all') return analyticsData.collaborationRequests;
    return analyticsData.collaborationRequests.filter((r) => r.status === activeTab);
  }, [analyticsData, activeTab]);

  // Heatmap matrix split into weeks (52 columns of 7 days)
  const heatmapWeeks = useMemo(() => {
    if (!analyticsData?.heatmap) return [];
    const weeks = [];
    const days = [...analyticsData.heatmap];
    while (days.length) {
      weeks.push(days.splice(0, 7));
    }
    return weeks;
  }, [analyticsData]);

  // Months label calculation for GitHub heatmap header
  const monthLabels = [
    { name: 'Jan', col: 0 },
    { name: 'Feb', col: 4 },
    { name: 'Mar', col: 8 },
    { name: 'Apr', col: 13 },
    { name: 'May', col: 17 },
    { name: 'Jun', col: 22 },
    { name: 'Jul', col: 26 },
    { name: 'Aug', col: 30 },
    { name: 'Sep', col: 35 },
    { name: 'Oct', col: 39 },
    { name: 'Nov', col: 43 },
    { name: 'Dec', col: 48 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-slate-600 font-semibold text-sm animate-pulse">
          Computing Engineering Analytics & Contribution Matrix...
        </p>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm max-w-lg mx-auto my-12 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center">
          <X className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 font-brand">Live Analytics Computation Unavailable</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{error}</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate from Database</span>
        </button>
      </div>
    );
  }

  const kpis = analyticsData?.kpis || {};
  const streaks = analyticsData?.streaks || {};
  const monthlyTrends = analyticsData?.monthlyTrends || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* 1. Page Header & Live Status */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider font-mono flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Analytics</span>
              </span>
              <span className="bg-slate-800/80 text-slate-300 border border-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Live Portfolio Intelligence</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-brand text-white">
              Engineering Activity & Recruiter Insights
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track your project showcase growth, daily contribution records, monthly milestone cadence, and verified recruiter inquiries.
            </p>
          </div>

          {/* Timeframe & Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchAnalytics}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-white/15 cursor-pointer active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/dashboard/projects"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Manage Projects</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Projects */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Projects</span>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
              {kpis.totalProjects ?? 0}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{kpis.totalProjects > 0 ? `${kpis.totalProjects} published` : '0 published'}</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Showcased in public repository catalog
          </p>
        </div>

        {/* Card 2: Recruiter Profile Views */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter Profile Views</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 flex items-center justify-center shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
              {Number(kpis.uniqueRecruiters ?? kpis.totalProfileViews ?? kpis.recruiterViews ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              {kpis.profileViewsGrowth || '0%'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {Number(kpis.uniqueRecruiters ?? kpis.totalProfileViews ?? 0) > 0
              ? `${kpis.uniqueRecruiters ?? kpis.totalProfileViews} unique recruiter${(kpis.uniqueRecruiters ?? kpis.totalProfileViews) > 1 ? 's' : ''} viewing profiles`
              : 'Unique recruiters viewing your profile'}
          </p>
        </div>

        {/* Card 3: Recruiter Collaboration Requests */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
              {kpis.totalCollaborationRequests ?? 0}
            </span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full">
              {kpis.recruiterInterestRate || 'Active Pipeline'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Active interview & collaboration requests
          </p>
        </div>

        {/* Card 4: Project Bookmarks & Stars */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stars & Saves</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center shadow-xs">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
              {kpis.projectBookmarks ?? 0}
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              {kpis.projectBookmarks > 0 ? `${kpis.projectBookmarks} Bookmarks` : '0 Bookmarks'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Recruiter & peer developer bookmarks
          </p>
        </div>

      </div>

      {/* 3. GitHub-Style Contribution Heatmap Section */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        
        {/* Header & Streaks */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-brand">
                Contribution Activity Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily code commits, project posts, and engineering milestones over the past 365 days
            </p>
          </div>

          {/* Quick Streak Stats Pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <span className="text-slate-400">Total:</span>
              <span className="font-extrabold text-slate-900 font-mono">
                {streaks.totalYearlyContributions ?? 0} commits
              </span>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/70 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              <span>Current Streak:</span>
              <span className="font-extrabold text-emerald-900 font-mono">
                {streaks.currentStreak ?? 0} days
              </span>
            </div>

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Longest:</span>
              <span className="font-extrabold text-slate-900 font-mono">
                {streaks.longestStreak ?? 0} days
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid Container with Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto no-scrollbar py-2">
          <div className="min-w-[720px] space-y-2">
            
            {/* Month labels header */}
            <div className="grid grid-cols-52 text-[10px] font-semibold text-slate-400 pl-8">
              {monthLabels.map((m, idx) => (
                <div key={idx} style={{ gridColumnStart: m.col + 1 }}>
                  {m.name}
                </div>
              ))}
            </div>

            {/* Heatmap Body: Day Labels + 52 Column Grid */}
            <div className="flex items-start gap-2">
              
              {/* Day of Week Labels (Mon, Wed, Fri) */}
              <div className="flex flex-col justify-between h-[105px] text-[9px] font-semibold text-slate-400 select-none pt-1">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* 52 Columns of 7 Day Squares */}
              <div className="flex items-center gap-1">
                {heatmapWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => {
                      // Color mapping matching GitHub / Emerald Palette
                      let bgClass = 'bg-stone-100 hover:ring-2 hover:ring-stone-400';
                      if (day.level === 1) bgClass = 'bg-emerald-200 hover:ring-2 hover:ring-emerald-400';
                      else if (day.level === 2) bgClass = 'bg-emerald-400 hover:ring-2 hover:ring-emerald-500';
                      else if (day.level === 3) bgClass = 'bg-emerald-600 hover:ring-2 hover:ring-emerald-700';
                      else if (day.level === 4) bgClass = 'bg-emerald-800 hover:ring-2 hover:ring-emerald-950';

                      return (
                        <div
                          key={day.date || dayIdx}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3 h-3 rounded-[3px] transition-all cursor-pointer ${bgClass}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Hover Tooltip display & Heatmap Legend Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-slate-500">
              {/* Active Hover Detail */}
              <div className="min-h-[20px] font-mono text-[11px] text-slate-700 font-medium">
                {hoveredDay ? (
                  <span>
                    <strong className="text-slate-900 font-bold">{hoveredDay.count} contributions</strong> on {hoveredDay.date}
                  </span>
                ) : (
                  <span>Hover over any square to see daily engineering output</span>
                )}
              </div>

              {/* Legend: Less -> More */}
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-[10px] font-semibold text-slate-400">Less</span>
                <span className="w-2.5 h-2.5 rounded-[2px] bg-stone-100 border border-stone-200/60" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800" />
                <span className="text-[10px] font-semibold text-slate-400">More</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Monthly Posting & Milestone Cadence Chart */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-brand flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <span>Monthly Engineering Cadence & Milestones</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative analysis of project releases and development activity across 2026
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setChartMode('activity')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartMode === 'activity'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Activity & Commits
            </button>
            <button
              onClick={() => setChartMode('recruiterViews')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartMode === 'recruiterViews'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Recruiter Impressions
            </button>
          </div>
        </div>

        {/* Interactive Custom Bar Chart */}
        <div className="space-y-2">
          <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
            {monthlyTrends.map((m, idx) => {
              const val = chartMode === 'activity' ? m.commits : m.recruiterViews;
              const maxVal = chartMode === 'activity' ? 60 : 200;
              const heightPercent = Math.min(100, Math.max(14, (val / maxVal) * 100));

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                >
                  {/* Hover Floating Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md whitespace-nowrap pointer-events-none z-20">
                    {m.month}: {val} {chartMode === 'activity' ? 'commits' : 'views'}
                    {m.projects > 0 && ` • ${m.projects} project${m.projects > 1 ? 's' : ''}`}
                  </div>

                  {/* Project milestone badge indicator */}
                  {m.projects > 0 && (
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                      +{m.projects}
                    </span>
                  )}

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-stone-100 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-95">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        chartMode === 'activity'
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gradient-to-t from-slate-900 to-slate-700'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-stone-100">
            <span>• Numbers indicate code pushes and milestone deployment records</span>
            <span>+{kpis.totalProjects ?? 0} Total Repositories Published</span>
          </div>
        </div>

      </div>

      {/* 5. Recruiter Collaboration Requests Tracker */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-brand">
                Recruiter Collaboration & Hiring Requests
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct outreach and interview screenings from company technical talent recruiters
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'interview_scheduled', label: 'Interviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No requests in this category</p>
            <p className="text-xs text-slate-400">Share your Project Vault link to attract more recruiters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((req) => {
              const isActionLoading = actionLoadingId === req._id;

              return (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition-all shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Recruiter Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {req.recruiterAvatar ? (
                          <img
                            src={req.recruiterAvatar}
                            alt={req.recruiterName}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          req.recruiterName.substring(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {req.recruiterName}
                          </h4>
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5" />
                            <span>{req.recruiterCompany}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {req.recruiterRole} • <span className="font-mono text-slate-400">{req.recruiterEmail}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {req.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {req.status === 'accepted' && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </span>
                      )}
                      {req.status === 'interview_scheduled' && (
                        <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Interview Scheduled</span>
                        </span>
                      )}
                      {req.status === 'declined' && (
                        <span className="bg-stone-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Project Pill */}
                  <div className="bg-white border border-stone-200/70 p-3 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Project of Interest: {req.projectName}</span>
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{req.message}"
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-slate-400">
                      Received {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {req.status === 'pending' && (
                        <>
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleUpdateStatus(req._id, 'accepted')}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Accept & Connect</span>
                          </button>
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleUpdateStatus(req._id, 'declined')}
                            className="bg-stone-200 hover:bg-stone-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {req.status === 'accepted' && (
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleUpdateStatus(req._id, 'interview_scheduled')}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Screening</span>
                        </button>
                      )}
                    </div>
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

export default DashboardAnalytics;
