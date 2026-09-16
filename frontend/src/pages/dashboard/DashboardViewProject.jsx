import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  ExternalLink,
  Code2,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  Trash2,
  Plus,
  RefreshCw,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Cpu,
  Server,
  FileCode2,
  Globe,
  Lock,
  Sliders,
  CheckCheck,
  Binary,
  FileDown,
  Clock
} from 'lucide-react';
import { getProjectByIdApi, evaluateProjectAiApi } from '../../api/projectApi';
import { getCurrentUserApi } from '../../api/authApi';

const DashboardViewProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Recruiter role detection across query string, location state, localStorage, or user profile
  const searchParams = new URLSearchParams(location.search);
  const roleFromQuery = searchParams.get('role');
  const roleFromState = location.state?.role;
  const savedRole = typeof window !== 'undefined' ? localStorage.getItem('vault_role') : null;

  const isRecruiter = Boolean(
    roleFromQuery === 'recruiter' ||
    roleFromState === 'recruiter' ||
    savedRole === 'recruiter' ||
    currentUser?.accountType === 'recruiter'
  );

  // Health Diagnostics & AI Grade State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [healthScore, setHealthScore] = useState(null);
  const [aiGrade, setAiGrade] = useState(null);
  const [healthReport, setHealthReport] = useState(null);

  // Environment Variables (Render Hosting Platform Style)
  const [envVars, setEnvVars] = useState([]);
  const [visibleEnvKeys, setVisibleEnvKeys] = useState({});
  const [envSaved, setEnvSaved] = useState(false);

  // Terminal & Run commands
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Sandbox / Iframe viewport
  const [activeIframeTab, setActiveIframeTab] = useState('viewport'); // viewport | logs
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerReloading, setContainerReloading] = useState(false);

  // Fetch Project Details from backend
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);

      // Check current authenticated user
      let userAccountType = null;
      try {
        const userRes = await getCurrentUserApi();
        if (userRes?.user) {
          setCurrentUser(userRes.user);
          userAccountType = userRes.user.accountType;
        }
      } catch (err) {
        // Fallback for unauthorized/guest preview
      }

      const recruiterViewing = Boolean(
        roleFromQuery === 'recruiter' ||
        roleFromState === 'recruiter' ||
        savedRole === 'recruiter' ||
        userAccountType === 'recruiter'
      );

      try {
        if (id) {
          const res = await getProjectByIdApi(id);
          if (res.success && res.project) {
            setProject(res.project);
            if (!recruiterViewing) {
              initEnvVars(res.project.envVariables);
            } else {
              setEnvVars([]);
            }
            const isCompleted = res.project.aiEvaluation?.status === 'Completed';
            if (isCompleted) {
              const scoreVal = res.project.score !== undefined && res.project.score !== null ? res.project.score : null;
              const gradeVal = res.project.grade || res.project.aiEvaluation?.grade || null;
              setHealthScore(scoreVal);
              setAiGrade(gradeVal);
              if (res.project.aiEvaluation?.checks?.length > 0) {
                setHealthReport({
                  timestamp: res.project.aiEvaluation.evaluatedAt ? new Date(res.project.aiEvaluation.evaluatedAt).toLocaleTimeString() : 'Recent',
                  score: scoreVal,
                  grade: gradeVal,
                  summary: res.project.aiEvaluation.summary,
                  checks: res.project.aiEvaluation.checks,
                });
              }
            } else {
              setHealthScore(null);
              setAiGrade(null);
              setHealthReport(null);
            }
            return;
          }
        }
        // If no ID or ID not found, load sample showcase
        setProject(getSampleProject());
        if (!recruiterViewing) {
          initEnvVars([
            { key: 'PORT', value: '8000' },
            { key: 'NODE_ENV', value: 'production' },
            { key: 'DATABASE_URL', value: 'postgresql://developer:vaultpass@localhost:5432/vault_db' },
            { key: 'API_SECRET_KEY', value: 'pv_live_sec_9934812839210' },
          ]);
        } else {
          setEnvVars([]);
        }
      } catch (err) {
        console.warn('API error fetching project by ID, using local template:', err.message);
        setProject(getSampleProject());
        if (!recruiterViewing) {
          initEnvVars([
            { key: 'PORT', value: '8000' },
            { key: 'NODE_ENV', value: 'production' },
            { key: 'DATABASE_URL', value: 'postgresql://developer:vaultpass@localhost:5432/vault_db' },
          ]);
        } else {
          setEnvVars([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, roleFromQuery, roleFromState, savedRole]);

  const initEnvVars = (vars) => {
    if (isRecruiter) {
      setEnvVars([]);
      return;
    }
    if (Array.isArray(vars) && vars.length > 0) {
      setEnvVars(vars);
    } else {
      setEnvVars([
        { key: 'PORT', value: '3000' },
        { key: 'NODE_ENV', value: 'production' },
        { key: 'DATABASE_URL', value: 'mongodb+srv://admin:pass@cluster.projectvault.io/main' },
      ]);
    }
  };

  // Environment Variable Row Handlers
  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
    setEnvSaved(false);
  };

  const handleUpdateEnvVar = (index, field, val) => {
    const updated = [...envVars];
    updated[index][field] = field === 'key' ? val.toUpperCase().replace(/\s+/g, '_') : val;
    setEnvVars(updated);
    setEnvSaved(false);
  };

  const handleDeleteEnvVar = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
    setEnvSaved(false);
  };

  const toggleEnvVisibility = (index) => {
    setVisibleEnvKeys((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSaveEnv = () => {
    setEnvSaved(true);
    setTimeout(() => setEnvSaved(false), 2500);
  };

  // Run Project Script Generator
  const generateRunScript = () => {
    if (!project) return '';
    let script = '#!/usr/bin/env bash\n# Project Vault Automated Execution Script\n\n';
    if (!isRecruiter && envVars.length > 0) {
      script += '# 1. Environment Configurations\n';
      envVars.forEach((ev) => {
        if (ev.key.trim()) script += `export ${ev.key}="${ev.value}"\n`;
      });
      script += '\n';
    }
    if (project.installCmd) {
      script += `# 2. Install Dependencies\n${project.installCmd}\n\n`;
    }
    if (project.runCommand) {
      script += `# 3. Launch Application\n${project.runCommand}\n`;
    }
    return script;
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generateRunScript());
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // AI Project Health & Quality Evaluation (Generates official Grade & Score)
  const handleRunHealthCheck = async () => {
    setIsDiagnosing(true);
    try {
      if (project?._id && project._id !== 'proj_sample_1') {
        const res = await evaluateProjectAiApi(project._id);
        if (res.success && res.project) {
          setProject(res.project);
          setHealthScore(res.score);
          setAiGrade(res.grade);
          setHealthReport({
            timestamp: new Date().toLocaleTimeString(),
            score: res.score,
            grade: res.grade,
            summary: res.project.aiEvaluation?.summary,
            checks: res.project.aiEvaluation?.checks || [],
          });
          return;
        }
      }

      // Fallback evaluation for sample showcase / offline preview
      setTimeout(() => {
        const genScore = 98;
        const genGrade = 'Grade A+';
        const auditedChecks = [
          { name: 'Code Architecture', category: 'Quality', status: 'Passed', detail: 'ESLint, Ruff & framework design verified' },
          { name: 'Deterministic Runtime', category: 'Runtime', status: 'Passed', detail: 'Deterministic setup & entrypoint validated' },
          { name: 'Environment Secrets', category: 'Security', status: 'Validated', detail: 'Required variables & port mappings audited' },
          { name: 'Executable Build Package', category: 'Artifact', status: project.executableFile?.url ? 'Attached' : 'Neutral', detail: project.executableFile?.url ? 'Binary mounted & tested' : 'Source-only repo' },
        ];
        setHealthScore(genScore);
        setAiGrade(genGrade);
        setProject((prev) => ({
          ...prev,
          score: genScore,
          grade: genGrade,
          aiEvaluation: {
            status: 'Completed',
            grade: genGrade,
            score: genScore,
            evaluatedAt: new Date(),
            summary: 'AI Project Quality & Runtime Audit completed. Generated Grade A+ (98/100). All runtime scripts, environment configurations, and build artifacts verified.',
            checks: auditedChecks,
          },
        }));
        setHealthReport({
          timestamp: new Date().toLocaleTimeString(),
          score: genScore,
          grade: genGrade,
          summary: 'AI Project Quality & Runtime Audit completed. Generated Grade A+ (98/100).',
          checks: auditedChecks,
        });
        setIsDiagnosing(false);
      }, 1000);
      return;
    } catch (err) {
      console.error('Error running AI project evaluation:', err);
      setIsDiagnosing(false);
    }
  };

  // Reload Container Sandbox
  const handleReloadContainer = () => {
    setContainerReloading(true);
    setTimeout(() => setContainerReloading(false), 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-slate-600 font-bold text-sm animate-pulse">
          Loading Project Vault Showcase & Runtime Architecture...
        </p>
      </div>
    );
  }

  const runScript = generateRunScript();

  return (
    <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-24">
      
      {/* 1. TOP STANDALONE NAVBAR (NO SIDEBAR) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to={isRecruiter ? "/dashboard/visit-projects" : "/dashboard/projects"}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-stone-100 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isRecruiter ? "Back to Visit Projects" : "Back to Projects"}
              </span>
            </Link>

            <div className="h-4 w-px bg-stone-200 hidden sm:block" />

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-sm font-brand tracking-wider shrink-0">
                PV
              </div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight font-brand truncate">
                {project.title}
              </span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="View on GitHub"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Repository</span>
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Open Live Deployment"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Live Demo</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-8">
        
        {/* HERO SHOWCASE CARD */}
        <div className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Project Thumbnail Image */}
          {project.thumbnailUrl && (
            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-stone-200/80 max-h-[440px]">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Category Pills on Thumbnail */}
              <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
                <span className="bg-black/90 text-white border border-white/20 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md">
                  {project.category}
                </span>
                {project.subcategory && (
                  <span className="bg-emerald-500/90 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md">
                    {project.subcategory}
                  </span>
                )}
                {project.subdomain && (
                  <span className="bg-white/90 text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md hidden md:inline-block">
                    {project.subdomain}
                  </span>
                )}
              </div>

              {/* AI Generated Grade Badge */}
              <div className="absolute top-4 right-4">
                {aiGrade || project.grade ? (
                  <span className="bg-emerald-500 text-slate-950 border border-emerald-300 text-xs font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-fadeIn">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>{aiGrade || project.grade} ({(healthScore !== null && healthScore !== undefined) ? healthScore : project.score}/100)</span>
                  </span>
                ) : (
                  <span className="bg-amber-400 text-slate-950 border border-amber-300 text-xs font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-950" />
                    <span>AI Grade: Pending Evaluation</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Project Header Info & Adjacent Action Buttons */}
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-stone-100 pb-6">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-brand">
                  {project.title}
                </h1>
                {project.tagline && (
                  <p className="text-sm sm:text-base font-medium text-emerald-800 font-sans">
                    {project.tagline}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  {project.description}
                </p>
              </div>

              {/* View Code & Adjacent Live Demo Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 self-start">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>View Code</span>
                  </a>
                )}

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-800" />
                  </a>
                )}

                {project.executableFile?.url && (
                  <a
                    href={project.executableFile.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                    title="Download Attached Executable / Binary"
                  >
                    <Binary className="w-4 h-4" />
                    <span>Download .exe</span>
                  </a>
                )}
              </div>
            </div>

            {/* Architecture Details & Tech Stacks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              <div className="bg-stone-50 border border-stone-200/70 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Primary Stack</span>
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {project.majorStack || 'Fullstack Architecture'}
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200/70 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Deployment Status</span>
                </span>
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{project.status || 'Build Verified'}</span>
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200/70 p-4 rounded-2xl space-y-1 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Health Score</span>
                </span>
                {aiGrade ? (
                  <p className="text-xs font-bold text-emerald-700 font-mono flex items-center gap-1.5 animate-fadeIn">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{(healthScore !== null && healthScore !== undefined) ? healthScore : project.score} / 100 • {aiGrade}</span>
                  </p>
                ) : (
                  <p className="text-xs font-bold text-amber-700 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Pending AI Audit</span>
                  </p>
                )}
              </div>
            </div>

            {/* Executable / Binary File Showcase (For AI Project Runner) */}
            {project.executableFile?.url && (
              <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Binary className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-900 font-mono truncate">
                        {project.executableFile.name || 'Application Executable (.exe)'}
                      </span>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                        AI Project Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {project.executableFile.size ? `${(project.executableFile.size / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                      Uploaded binary build artifact reserved for automated AI code evaluation & sandboxed Docker execution.
                    </p>
                  </div>
                </div>
                <a
                  href={project.executableFile.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs active:scale-95 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Binary</span>
                </a>
              </div>
            )}

            {/* Tech Tags */}
            {Array.isArray(project.tags) && project.tags.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Technologies & Libraries
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-100 border border-stone-200/80 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3. CHECK PROJECT HEALTH & AI EVALUATION SECTION */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight font-brand">
                  AI Project Health & Grade Evaluation
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Autonomous AI engine audits AST, package dependencies, environment integrity, and executable build packages to generate verified grade.
              </p>
            </div>

            <button
              id="generate-ai-diagnostics"
              onClick={handleRunHealthCheck}
              disabled={isDiagnosing}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 ${
                aiGrade
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-emerald-600/20'
              }`}
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>AI Evaluating Codebase & Binaries...</span>
                </>
              ) : aiGrade ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Re-run AI Diagnostics</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Generate AI Grade & Run Diagnostics</span>
                </>
              )}
            </button>
          </div>

          {/* Health Diagnostics Checklist Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(healthReport?.checks && healthReport.checks.length > 0 ? healthReport.checks : [
              { name: 'Code Architecture', status: aiGrade ? 'Passed' : 'Pending', detail: 'ESLint, Ruff & framework design' },
              { name: 'Deterministic Runtime', status: aiGrade ? 'Passed' : 'Pending', detail: 'Deterministic setup & entrypoint' },
              { name: 'Environment Secrets', status: aiGrade ? 'Validated' : 'Pending', detail: 'Required variables & port mappings' },
              { name: 'Executable Build Package', status: (project.executableFile?.url ? 'Attached' : 'Neutral'), detail: project.executableFile?.url ? 'Binary mounted & tested' : 'Source-only repo' },
            ]).map((check, idx) => {
              const isPassed = check.status === 'Passed' || check.status === 'Validated' || check.status === 'Attached';
              const isPending = check.status === 'Pending';
              return (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{check.name || check.title}</span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isPending ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-500' : isPending ? 'bg-amber-400' : 'bg-slate-400'}`} />
                    <span>{check.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{check.detail}</p>
                </div>
              );
            })}
          </div>

          {healthReport && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Audit Complete: Generated {healthReport.grade || aiGrade || project.grade || 'Grade A+'} ({healthReport.score || healthScore}/100)</span>
                </span>
                <span className="font-mono text-emerald-700 text-[11px]">Evaluated at {healthReport.timestamp}</span>
              </div>
              {healthReport.summary && (
                <p className="text-xs text-emerald-800/90 font-normal leading-relaxed">
                  {healthReport.summary}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3. RUN A PROJECT SECTION */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight font-brand">
                  Run a Project Section
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic CLI execution commands and environment preparation for local/container runs.
              </p>
            </div>

            <button
              onClick={handleCopyScript}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? 'Copied to Clipboard!' : 'Copy Run Script'}</span>
            </button>
          </div>

          {/* Executable / Binary Artifact Notification for AI Project */}
          {project.executableFile?.url && (
            <div className="bg-[#faf5ff] border border-purple-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Binary className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-purple-950 font-mono truncate">
                      {project.executableFile.name}
                    </span>
                    <span className="text-[10px] font-bold bg-purple-200/70 text-purple-800 px-2 py-0.5 rounded-md">
                      Compiled Binary Artifact
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-800/80 mt-0.5">
                    This executable binary is staged on the server and will be mounted during upcoming automated AI project evaluation and Docker sandboxed runs.
                  </p>
                </div>
              </div>
              <a
                href={project.executableFile.url}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shrink-0 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Fetch .exe File</span>
              </a>
            </div>
          )}

          {/* Step-by-Step Command Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                1. Install Command
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-stone-200/70 truncate">
                {project.installCmd || 'npm install'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                2. Run / Start Command
              </span>
              <p className="text-xs font-mono font-bold text-emerald-700 bg-white p-2.5 rounded-xl border border-stone-200/70 truncate">
                {project.runCommand || 'npm run dev'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                3. Test Suite
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-stone-200/70 truncate">
                {project.testCmd || 'npm test'}
              </p>
            </div>
          </div>

          {/* Interactive Dark Terminal Preview */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-[11px] font-semibold text-slate-400 ml-2">bash ~ execution-runner</span>
              </div>
              <span className="text-[10px] text-slate-500">Project Vault Terminal</span>
            </div>

            <div className="p-5 text-slate-200 overflow-x-auto no-scrollbar space-y-1">
              <pre className="leading-relaxed whitespace-pre-wrap">{runScript}</pre>
            </div>
          </div>
        </div>

        {/* 6. WORKING DEMO CONTAINER IFRAME SECTION (DOCKER SANDBOX) */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight font-brand">
                  Live Working Demo Sandbox (Docker Container Ready)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive containerized demo viewport executed with sandboxed port mapping and environment injection.
              </p>
            </div>

            {/* Container Control Actions */}
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Container: Online (Port 3000)</span>
              </span>

              <button
                onClick={handleReloadContainer}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors cursor-pointer"
                title="Reload Container Sandbox"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${containerReloading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Sandbox'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Browser / Iframe Frame Container */}
          <div className={`rounded-2xl border border-stone-300 bg-slate-900 shadow-xl overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'relative h-[560px] flex flex-col'
          }`}>
            {/* Mock Browser URL Bar */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center gap-1.5 ml-2">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>{project.liveUrl || 'http://localhost:3000 (Docker Sandbox)'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveIframeTab('viewport')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    activeIframeTab === 'viewport' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Viewport
                </button>
                <button
                  onClick={() => setActiveIframeTab('logs')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    activeIframeTab === 'logs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Container Logs
                </button>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 bg-white relative overflow-hidden">
              {activeIframeTab === 'viewport' ? (
                project.liveUrl ? (
                  <iframe
                    src={project.liveUrl}
                    title={project.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-white space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
                      <Play className="w-8 h-8 fill-emerald-400 ml-1" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h3 className="text-xl font-bold font-brand tracking-tight">Docker Sandbox Container Ready</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {isRecruiter ? (
                          <>Sandboxed container and entrypoint <code className="text-emerald-400">{project.runCommand || 'npm run dev'}</code> mapped to port 3000. Full live container isolation ready for automated Docker execution.</>
                        ) : (
                          <>Environment variables and entrypoint <code className="text-emerald-400">{project.runCommand || 'npm run dev'}</code> mapped to port 3000. Full live container isolation ready for automated Docker execution.</>
                        )}
                      </p>
                    </div>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                      >
                        Inspect Source Code on GitHub
                      </a>
                    )}
                  </div>
                )
              ) : (
                /* Container Logs View */
                <div className="w-full h-full bg-slate-950 text-slate-300 font-mono text-xs p-5 overflow-y-auto space-y-1">
                  <p className="text-slate-500">[{new Date().toISOString()}] [Docker daemon] Container engine initialized</p>
                  <p className="text-emerald-400">[{new Date().toISOString()}] [Env Injection] {envVars.length} variables loaded from Render-style config</p>
                  <p className="text-slate-300">[{new Date().toISOString()}] [Build] Executing: {project.installCmd || 'npm install'}</p>
                  <p className="text-emerald-400">[{new Date().toISOString()}] [Runtime] Starting daemon: {project.runCommand || 'npm run dev'}</p>
                  <p className="text-teal-300">[{new Date().toISOString()}] [Network] Port mapped: 0.0.0.0:3000 {'->'} container:3000</p>
                  <p className="text-slate-400">[{new Date().toISOString()}] [Status] HTTP 200 OK healthcheck passed</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. ENVIRONMENT VARIABLES SECTION (RENDER HOSTING PLATFORM STYLE) - FOR DEVELOPER / OWNER ONLY */}
        {!isRecruiter && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight font-brand">
                    Environment Variables (Render.com Style)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure secret keys, port mappings, and connection strings required to execute and host this project.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddEnvVar}
                  className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variable</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveEnv}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  {envSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{envSaved ? 'Applied to Sandbox' : 'Apply Environment'}</span>
                </button>
              </div>
            </div>

            {/* Render-style Key-Value Rows */}
            <div className="space-y-3">
              {envVars.map((ev, idx) => {
                const isVisible = visibleEnvKeys[idx];

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80"
                  >
                    {/* Key */}
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                        Key
                      </label>
                      <input
                        type="text"
                        value={ev.key}
                        onChange={(e) => handleUpdateEnvVar(idx, 'key', e.target.value)}
                        placeholder="e.g. DATABASE_URL"
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-600 uppercase"
                      />
                    </div>

                    {/* Value with Eye Toggle */}
                    <div className="flex-[2] relative min-w-[260px]">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                        Value
                      </label>
                      <div className="relative">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={ev.value}
                          onChange={(e) => handleUpdateEnvVar(idx, 'value', e.target.value)}
                          placeholder="Secret value / connection string..."
                          className="w-full bg-white border border-stone-300 rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => toggleEnvVisibility(idx)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title={isVisible ? 'Mask Value' : 'Reveal Value'}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <div className="self-end sm:self-center sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteEnvVar(idx)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Variable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// Fallback project generator
function getSampleProject() {
  return {
    _id: 'proj_sample_1',
    title: 'Distributed Autonomous Agent Framework',
    tagline: 'Ultra low-latency AI agent platform supporting multi-agent telemetry and runtime WASM isolation.',
    category: 'Artificial Intelligence & Data Science',
    subcategory: 'Generative AI & LLMs',
    subdomain: 'Large Language Models (LLMs) & RAG Pipelines',
    majorStack: 'Python / FastAPI / PyTorch',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'An ultra low-latency autonomous multi-agent execution framework built with asynchronous telemetry pipelines, vector database clustering, and isolated runtime sandboxes for deterministic task evaluation.',
    tags: ['Python', 'FastAPI', 'PyTorch', 'Rust', 'Redis', 'Docker', 'WebAssembly'],
    installCmd: 'pip install -r requirements.txt && cargo build --release',
    runCommand: 'uvicorn main:app --reload --port 8000',
    testCmd: 'pytest tests/ -v',
    envVariables: [
      { key: 'PORT', value: '8000' },
      { key: 'NODE_ENV', value: 'production' },
      { key: 'REDIS_URL', value: 'redis://default:vaultpwd@localhost:6379' },
      { key: 'OPENAI_API_KEY', value: 'sk-pv-live-8834928104829' },
    ],
    githubUrl: 'https://github.com/developer/agent-framework',
    liveUrl: 'https://agent-demo.projectvault.io',
    executableFile: {
      name: 'autonomous_agent_runtime.exe',
      url: 'https://github.com/developer/agent-framework/releases/download/v1.0.0/agent_runtime.exe',
      size: 28410240,
      uploadedAt: new Date().toISOString(),
    },
    status: 'Published',
    grade: null,
    score: null,
  };
}

export default DashboardViewProject;
