import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
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
  Clock
} from 'lucide-react';
import { getMyProjectsApi, deleteProjectApi } from '../../api/projectApi';

const DashboardProjects = () => {
  const { user } = useOutletContext() || {};

  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getMyProjectsApi();
      if (res.success && res.projects) {
        setProjects(res.projects);
      }
    } catch (err) {
      console.error('Failed to load projects from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
              to="/dashboard/add-project"
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
            className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group"
          >
            {/* Project Thumbnail */}
            {project.thumbnailUrl && (
              <div className="relative aspect-video w-full bg-stone-100 overflow-hidden border-b border-stone-100">
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {project.subdomain || project.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(project._id || project.id)}
                  className="absolute top-3 right-3 text-white/90 bg-slate-900/75 hover:bg-rose-600 transition-colors p-1.5 rounded-xl backdrop-blur-xs shadow-md cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">
                        {project.category}
                      </span>
                      {project.subcategory && (
                        <>
                          <span className="text-stone-300 text-xs">•</span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {project.subcategory}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-brand leading-snug mt-0.5">
                      {project.title}
                    </h3>
                  </div>

                  {!project.thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project._id || project.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {project.majorStack && (
                  <div className="inline-flex items-center gap-1.5 bg-stone-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Stack: {project.majorStack}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="bg-[#f8fafc] border border-stone-200 text-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Run Command Terminal Box */}
                {project.runCommand && (
                  <div className="bg-slate-950 rounded-xl p-2.5 text-xs font-mono text-emerald-400 flex items-center justify-between gap-2 border border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">$ {project.runCommand}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyRunCmd(project.id, project.runCommand)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy Run Command"
                    >
                      {copiedId === project.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Status & View Project Button */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3 mt-4 flex-wrap sm:flex-nowrap">
                {(project.grade || project.score) ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-md">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{project.grade || 'Grade A+'} ({project.score}/100)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Grade Pending</span>
                  </div>
                )}

                <Link
                  to={`/project/view-project/${project._id || project.id}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Project</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardProjects;

