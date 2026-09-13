import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Globe, 
  FolderKanban, 
  RefreshCw, 
  Clock, 
  Eye, 
  Binary,
  Handshake,
  Send,
  User,
  Users,
  Building2,
  X,
  Check
} from 'lucide-react';
import { getAllProjectsApi } from '../../api/projectApi';
import { sendCollaborationRequestApi, getRecruiterAnalyticsApi } from '../../api/analyticsApi';

/**
 * Recruiter Visit Projects Catalog
 * Displays verified student project showcases.
 * Provides direct "View Project" link and a dedicated "Collaborate" action linked directly to the student's account.
 */
const DashboardVisitProjects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [inquirySent, setInquirySent] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryType, setInquiryType] = useState('interview');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [projectsRes, analyticsRes] = await Promise.allSettled([
        getAllProjectsApi({ search: searchQuery }),
        getRecruiterAnalyticsApi(),
      ]);

      if (projectsRes.status === 'fulfilled' && projectsRes.value?.success && projectsRes.value?.projects) {
        setProjects(projectsRes.value.projects);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.success && analyticsRes.value?.recruiter?.inquiries) {
        setMyInquiries(analyticsRes.value.recruiter.inquiries);
      }
    } catch (err) {
      console.error('Failed to load projects catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [searchQuery]);

  // Check if current recruiter has already initiated collaboration on this project
  const isProjectCollaborated = (project) => {
    if (!myInquiries || !Array.isArray(myInquiries) || myInquiries.length === 0) {
      return false;
    }
    const projId = String(project._id || project.id || '');
    const projTitle = (project.title || '').trim().toLowerCase();
    const projStudentId = String(project.student?._id || project.student || '');

    return myInquiries.some((inq) => {
      // 1. Direct projectId match if populated
      const inqProjId = String(inq.projectId?._id || inq.projectId || '');
      if (projId && inqProjId && inqProjId === projId) {
        return true;
      }

      // 2. Project title + student match
      const inqTitle = (inq.projectName || '').trim().toLowerCase();
      if (projTitle && inqTitle && projTitle === inqTitle) {
        const inqStudentId = String(inq.student?._id || inq.student || '');
        if (projStudentId && inqStudentId) {
          return projStudentId === inqStudentId;
        }
        return true;
      }

      return false;
    });
  };

  // Filter projects by search, then sort so that already collaborated projects are displayed at the last
  const filteredProjects = projects
    .filter((project) => {
      const devName = project.student?.name || project.developer || '';
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        devName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(project.tags) && project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    })
    .sort((a, b) => {
      const aCollab = isProjectCollaborated(a);
      const bCollab = isProjectCollaborated(b);

      // Already collaborated projects must be displayed at the end
      if (aCollab && !bCollab) return 1;
      if (!aCollab && bCollab) return -1;
      return 0;
    });

  const handleOpenCollaborate = (project) => {
    setSelectedProject(project);
    setInquirySent(false);
    const studentName = project.student?.name || 'Student Engineer';
    setInquiryMessage(
      `Hi ${studentName}! We reviewed your project "${project.title}" on Project Vault. We are impressed by your engineering architecture and execution. We would love to collaborate with you and discuss potential technical opportunities and an introductory screening interview.`
    );
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!selectedProject || !inquiryMessage.trim()) return;

    try {
      setSendingInquiry(true);
      const studentId = selectedProject.student?._id || selectedProject.student;
      const projId = selectedProject._id || selectedProject.id;
      await sendCollaborationRequestApi({
        studentId,
        projectId: projId,
        projectName: selectedProject.title,
        message: inquiryMessage.trim(),
      });

      // Instantly mark as collaborated in state so button flips and item moves to the last
      setMyInquiries((prev) => [
        {
          projectId: projId,
          projectName: selectedProject.title,
          student: { _id: studentId, name: selectedProject.student?.name },
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setInquirySent(true);
      setTimeout(() => {
        setInquirySent(false);
        setSelectedProject(null);
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to dispatch collaboration request');
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest font-mono">
              Recruiter Showcase Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-brand mt-1">
            Visit & Collaborate on Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover verified student engineering projects, inspect AI health audits, and initiate direct collaboration requests with developers.
          </p>
        </div>

        {/* Global Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tech stack, project title, or student name..."
            className="w-full bg-[#f8fafc] border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 transition-all"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project._id || project.id} 
            className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Thumbnail Image */}
              <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-900 relative shadow-inner">
                <img 
                  src={project.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Domain & Audit Badges on Thumbnail */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {project.category || 'Computer Science'}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isProjectCollaborated(project) && (
                      <span className="bg-purple-900/90 backdrop-blur-md text-purple-200 border border-purple-400/40 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 text-purple-300" />
                        <span>Collaborated</span>
                      </span>
                    )}

                    {project.grade && project.score !== null ? (
                      <span className="bg-purple-600/90 backdrop-blur-md text-white border border-purple-400/40 text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 text-purple-200" />
                        <span>Grade {project.grade} ({project.score}/100)</span>
                      </span>
                    ) : (
                      <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>AI Grade Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {project.executableFile?.url && (
                  <div className="absolute bottom-2.5 left-3">
                    <span className="bg-emerald-500/95 backdrop-blur-md text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <Binary className="w-3 h-3" />
                      <span>.exe attached</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Author Meta */}
              <div>
                <h3 className="font-black text-slate-900 text-base tracking-tight group-hover:text-purple-600 transition-colors line-clamp-1">
                  {project.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                  <span className="font-bold text-slate-800">
                    {project.student?.name || project.developer || 'Student Engineer'}
                  </span>
                  {project.student?.location && (
                    <span className="text-slate-400">• {project.student.location}</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {project.description || project.tagline}
              </p>

              {/* Stacks & Tech Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Array.isArray(project.tags) ? project.tags : []).slice(0, 4).map((tag, tagIdx) => (
                  <span key={tagIdx} className="bg-stone-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer Controls: View Project + Collaborate / Already Collaborated */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
              <Link
                to={`/project/view-project/${project._id || project.id}?role=recruiter`}
                state={{ from: 'visit-projects', role: 'recruiter' }}
                className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>View Project</span>
              </Link>

              {isProjectCollaborated(project) ? (
                <button
                  type="button"
                  disabled
                  className="bg-purple-50 text-purple-700 border border-purple-200/90 text-xs font-bold px-3 sm:px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-90 select-none shadow-2xs"
                  title="You have already initiated collaboration on this project"
                >
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Already Collaborated</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenCollaborate(project)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-900/20 active:scale-95"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Collaborate</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Collaborate Modal (Linked to Student's Account) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-brand">Collaborate with Student</h3>
                  <p className="text-xs text-purple-700 font-bold">{selectedProject.title}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedProject(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg">Collaboration Request Dispatched!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  This request is now directly linked to <span className="font-bold text-slate-900">{selectedProject.student?.name || 'the student'}</span>'s account. They can accept, schedule an interview, or reply from their Analytics & Collaboration dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                
                {/* Linked Student Account Banner */}
                <div className="bg-purple-50/70 border border-purple-200/80 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {(selectedProject.student?.name || 'S').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider font-mono">
                      Linked Student Developer Account
                    </span>
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {selectedProject.student?.name || 'Student Engineer'}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {selectedProject.student?.email || 'Registered University Student'}
                    </p>
                  </div>
                </div>

                {/* Collaboration Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Collaboration Objective
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'interview', label: 'Technical Screening / Interview' },
                      { id: 'internship', label: 'Engineering Internship / Role' },
                      { id: 'mentorship', label: 'Architecture Mentorship' },
                      { id: 'sponsorship', label: 'Project Sponsorship' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setInquiryType(type.id)}
                        className={`p-2 rounded-xl text-left font-semibold border transition-all cursor-pointer ${
                          inquiryType === type.id
                            ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold'
                            : 'bg-stone-50 border-stone-200 text-slate-600 hover:bg-stone-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personalized Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collaboration Invitation Note
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe role details, interview dates, or questions about the architecture..."
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInquiry}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingInquiry ? 'Sending...' : 'Send Collaboration Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardVisitProjects;
