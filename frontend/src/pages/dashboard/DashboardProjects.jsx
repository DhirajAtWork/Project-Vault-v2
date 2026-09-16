import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useLocation, Link } from 'react-router-dom';
import { 
  Plus, 
  FolderKanban, 
  Code2, 
  ExternalLink, 
  Trash2, 
  CheckCircle2,
  Terminal,
  Play,
  Copy,
  Check,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Clock,
  Pencil,
  Binary
} from 'lucide-react';
import { getMyProjectsApi, deleteProjectApi } from '../../api/projectApi';

const DashboardProjects = () => {
  const { user } = useOutletContext() || {};
  const location = useLocation();

  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  // Fetch projects from backend API
  const fetchProjects = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    try {
      const res = await getMyProjectsApi();
      if (res.success && Array.isArray(res.projects)) {
        setProjects((prev) => {
          // If a project was just added and passed via navigation state, ensure it stays present
          const passedProj = location.state?.newProject;
          let combined = [...res.projects];
          if (passedProj) {
            const passedId = passedProj._id || passedProj.id;
            const exists = combined.some((p) => (p._id || p.id) === passedId);
            if (!exists) {
              combined = [passedProj, ...combined];
            }
          }
          return combined;
        });
      }
    } catch (err) {
      console.error('Failed to load projects from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  // Immediately inject newly added project if passed via navigation state so user sees it with zero latency
  useEffect(() => {
    if (location.state?.newProject) {
      const newProj = location.state.newProject;
      setProjects((prev) => {
        const passedId = newProj._id || newProj.id;
        const exists = prev.some((p) => (p._id || p.id) === passedId);
        if (exists) return prev;
        return [newProj, ...prev];
      });
      setLoading(false);
    }
  }, [location.state]);

  // Auto-fetch whenever route changes, location key changes, or navigation lands here
  useEffect(() => {
    fetchProjects(projects.length === 0);
  }, [location.key, location.state, fetchProjects]);

  // Auto-sync when window re-focuses without causing jarring reload
  useEffect(() => {
    const handleFocus = () => {
      fetchProjects(false);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProjects]);

  const handleCopyRunCmd = (id, cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProjectApi(id);
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-brand flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-[#059669]" />
            <span>My Verified Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your project portfolio across multiple domains, verify stack setups, and provide execution guides.
          </p>
        </div>

        <Link
          to="/projects/add-project"
          className="bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/50 p-6">
            <FolderKanban className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Projects Published Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload your source code, runnable binaries, and architecture details to showcase them on Project Vault.
            </p>
            <Link
              to="/projects/add-project"
              className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Your First Project</span>
            </Link>
          </div>
        )}
        {projects.map((project, idx) => (
          <div
            key={project._id || project.id || idx}
            className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3.5">
              {/* Thumbnail Image */}
              <div className="w-full h-52 rounded-2xl overflow-hidden bg-slate-900 relative shadow-inner">
                <img
                  src={project.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                
                {/* Domain & Audit Badges on Thumbnail */}
                <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
                  <span className="bg-[#042f2e]/95 text-[#10b981] border border-[#059669]/30 text-xs font-extrabold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                    {project.category || 'Computer Science & Engineering'}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {project.grade && project.score !== null ? (
                      <span className="bg-[#9333ea] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Grade Grade {project.grade} ({project.score}/100)</span>
                      </span>
                    ) : (
                      <span className="bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Clock className="w-3.5 h-3.5 text-slate-950" />
                        <span>AI Grade Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteProject(project._id || project.id)}
                  className="absolute top-3 right-3 text-white/90 bg-slate-900/75 hover:bg-rose-600 transition-colors p-1.5 rounded-xl backdrop-blur-xs shadow-md cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {project.executableFile?.url && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-[#10b981] text-[#0f172a] font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                      <Binary className="w-3.5 h-3.5" />
                      <span>.exe attached</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Author Meta */}
              <div>
                <h3 className="text-xl font-black text-[#9333ea] tracking-tight hover:opacity-90 transition-opacity line-clamp-1">
                  {project.title}
                </h3>
                
                <h4 className="text-slate-900 font-extrabold text-sm uppercase tracking-wide mt-1">
                  {project.student?.name || project.developer || user?.name || 'SK TAJUDDIN'}
                </h4>

                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2">
                  {project.description || project.tagline || 'All Home service under one Roof'}
                </p>
              </div>

              {/* Stacks & Tech Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {(Array.isArray(project.tags) && project.tags.length > 0 ? project.tags : ['PHP', 'MYSQL', 'HTML', 'CSS']).slice(0, 5).map((tag, tagIdx) => (
                  <span key={tagIdx} className="bg-[#f1f5f9] text-[#334155] font-extrabold text-xs px-3 py-1 rounded-lg uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer Controls: View Project + Edit Details */}
            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <Link
                to={`/project/view-project/${project._id || project.id}`}
                className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] text-xs sm:text-sm font-bold py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 text-center"
              >
                <Eye className="w-4 h-4 text-slate-600 shrink-0" />
                <span>View Project</span>
              </Link>

              <Link
                to={`/projects/edit-project/${project._id || project.id}`}
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 text-center"
                title="Edit Project Details"
              >
                <Pencil className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Edit Details</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardProjects;

