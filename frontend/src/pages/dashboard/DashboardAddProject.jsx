import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FolderKanban, 
  ArrowLeft, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  Plus,
  Image as ImageIcon,
  UploadCloud,
  X,
  Layers,
  Cpu,
  Play,
  Copy,
  Check,
  Code2,
  Sliders,
  FileCode2,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Key,
  FileText,
  Binary,
  FileDown,
  AlertCircle
} from 'lucide-react';
import { uploadMediaApi } from '../../api/authApi';
import { createProjectApi, uploadExecutableApi } from '../../api/projectApi';

// Comprehensive 3-Tier Taxonomy: Domain/Category -> Subcategory -> Subdomain (Tech & Non-Tech)
const TAXONOMY = {
  'Computer Science & Engineering': {
    'Web & Cloud Platforms': [
      'Full Stack Web Development',
      'Backend & Microservices Architecture',
      'Cloud Engineering & DevOps CI/CD',
      'Serverless & Edge Computing Systems'
    ],
    'Mobile & Cross-Platform': [
      'iOS Native Development (Swift / SwiftUI)',
      'Android Native Development (Kotlin)',
      'Cross-Platform Apps (Flutter / React Native)'
    ],
    'Systems & Infrastructure': [
      'Distributed Systems & Database Engineering',
      'Cybersecurity, Cryptography & Infosec',
      'Operating Systems & Kernel Modules',
      'Embedded Systems & Internet of Things (IoT)',
      'Blockchain, Smart Contracts & Web3'
    ]
  },
  'Artificial Intelligence & Data Science': {
    'Generative AI & LLMs': [
      'Large Language Models (LLMs) & RAG Pipelines',
      'Autonomous Multi-Agent Networks',
      'Fine-Tuning & Model Distillation',
      'Multimodal AI (Vision-Language Models)'
    ],
    'Machine Learning & Analytics': [
      'Computer Vision & Autonomous Perception',
      'Natural Language Processing (NLP)',
      'Deep Learning & Neural Architectures',
      'Predictive Analytics & Big Data Systems',
      'Reinforcement Learning & Robotics AI'
    ],
    'AI Safety & Governance': [
      'Model Interpretability & Explainable AI (XAI)',
      'Algorithmic Bias Mitigation & Fairness',
      'AI Safety & Regulatory Compliance'
    ]
  },
  'Design, Media & Creative Arts': {
    'Digital Product Design': [
      'UI/UX & Interactive Product Design',
      'Design Systems & Component Architecture',
      'User Experience Research & Prototyping'
    ],
    '3D, CGI & Game Design': [
      '3D Modeling, Texturing & CGI Rendering',
      'Game Design & Interactive Environments',
      'Spatial Computing & AR/VR Experiences'
    ],
    'Visual Communication & Media': [
      'Brand Identity & Motion Graphics Systems',
      'Digital Audio Production & Sound Synthesis',
      'Industrial Product & Hardware Prototyping',
      'Visual Storytelling & Digital Media'
    ]
  },
  'Business, Finance & Management': {
    'Financial Technology (FinTech)': [
      'Quantitative Trading & Algorithmic Models',
      'Decentralized Finance (DeFi) & Tokenomics',
      'Payment Rails & Fraud Prevention Systems'
    ],
    'Product & Growth Strategy': [
      'Product Strategy & Feature Roadmaps',
      'Marketing Analytics & Attribution Engines',
      'E-Commerce & Digital Marketplace Architecture'
    ],
    'Operations & Entrepreneurship': [
      'Supply Chain & Intelligent Logistics Tech',
      'Entrepreneurship & SaaS Business Models',
      'Enterprise Resource Planning (ERP) & Automation'
    ]
  },
  'Engineering & Physical Sciences': {
    'Robotics & Automation': [
      'Autonomous Mobile Robots (AMR)',
      'Mechatronics & Embedded Automation',
      'Industrial Control Systems & PLCs'
    ],
    'Electrical & Electronics': [
      'Power Electronics & Battery Energy Storage',
      'VLSI & Semiconductor Circuit Design',
      'Signal Processing & Wireless Communications'
    ],
    'Mechanical & Civil Systems': [
      'Mechanical CAD & Finite Element Analysis',
      'Civil, Structural & Smart Infrastructure',
      'Aerospace, Drone & Avionics Systems',
      'Renewable Energy & Sustainable Microgrids'
    ]
  },
  'Healthcare, Life Sciences & Biotech': {
    'Computational Biology': [
      'Bioinformatics & Genomic Sequence Analytics',
      'Computational Drug Discovery & Folding',
      'Biological Big Data & Systems Biology'
    ],
    'Digital Health & MedTech': [
      'Telemedicine & Electronic Health Records (EHR)',
      'Wearable Biomedical Sensors & Diagnostics',
      'Medical Imaging & Clinical Diagnostic AI'
    ]
  },
  'Social Sciences, Law & Education': {
    'EdTech & Learning Platforms': [
      'Adaptive Learning & Personalized Tutoring',
      'Gamified Education & Virtual Lab Simulations',
      'Curriculum Analytics & Learning Assessment'
    ],
    'Civic Tech, Law & Society': [
      'Civic Tech & Public Policy Analysis',
      'LegalTech & Automated Contract Compliance',
      'Behavioral Economics & Decision Sciences',
      'Environmental Policy & Climate Impact Analysis'
    ]
  },
  'Interdisciplinary & Open Innovation': {
    'Social Impact Tech': [
      'Accessibility & Assistive Tech Solutions',
      'Humanitarian Engineering & Disaster Response',
      'Civic Engagement & Community Platforms'
    ],
    'Developer Ecosystems': [
      'Open Source Developer Tooling & Frameworks',
      'Human-Computer Interaction (HCI) Research',
      'Cross-Disciplinary Experimental Prototypes'
    ]
  }
};

// Major Stack Presets
const MAJOR_STACK_PRESETS = [
  'MERN (MongoDB, Express, React, Node)',
  'Next.js / TypeScript / Tailwind CSS',
  'Python / FastAPI / PyTorch',
  'Django / PostgreSQL / Celery',
  'Go / Gin / PostgreSQL',
  'Rust / Actix / WebAssembly',
  'C++ / Systems & Embedded',
  'Spring Boot / PostgreSQL / React',
  'Flutter / Dart / Firebase',
  'UI/UX / Figma / Design System'
];

// Suggested individual tech tags across all programming domains
const SUGGESTED_TECH_TAGS = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'FastAPI', 
  'Go', 'Rust', 'C++', 'Java', 'Kotlin', 'Swift', 'PostgreSQL', 
  'MongoDB', 'Redis', 'GraphQL', 'PyTorch', 'AWS', 'Flutter', 'Figma'
];

// Execution Command Presets for all kinds of programming projects
const EXECUTION_PRESETS = [
  {
    name: 'Node / Vite / React',
    install: 'npm install',
    run: 'npm run dev',
    test: 'npm test',
    envVars: [
      { key: 'PORT', value: '5173' },
      { key: 'VITE_API_URL', value: 'http://localhost:5000' }
    ],
    envNotes: 'Node.js v18+ required.'
  },
  {
    name: 'Next.js Fullstack',
    install: 'npm install',
    run: 'npm run dev',
    test: 'npm run test',
    envVars: [
      { key: 'PORT', value: '3000' },
      { key: 'DATABASE_URL', value: 'postgresql://postgres:secret@localhost:5432/vault' },
      { key: 'NEXTAUTH_SECRET', value: 'jwt_secure_auth_token_secret' }
    ],
    envNotes: 'Ensure PostgreSQL is running locally on port 5432.'
  },
  {
    name: 'Python (FastAPI / Django)',
    install: 'pip install -r requirements.txt',
    run: 'python main.py',
    test: 'pytest',
    envVars: [
      { key: 'PORT', value: '8000' },
      { key: 'ENVIRONMENT', value: 'development' },
      { key: 'SECRET_KEY', value: 'dev_jwt_secret_key_9823' }
    ],
    envNotes: 'Python 3.10+ in a virtual environment.'
  },
  {
    name: 'Rust (Cargo)',
    install: 'cargo check',
    run: 'cargo run',
    test: 'cargo test',
    envVars: [
      { key: 'RUST_LOG', value: 'info' },
      { key: 'PORT', value: '8080' }
    ],
    envNotes: 'Requires Rust toolchain (cargo, rustc).'
  },
  {
    name: 'Go / Golang',
    install: 'go mod download',
    run: 'go run main.go',
    test: 'go test ./...',
    envVars: [
      { key: 'PORT', value: '8080' },
      { key: 'GIN_MODE', value: 'debug' }
    ],
    envNotes: 'Requires Go 1.20+.'
  },
  {
    name: 'C / C++ (CMake)',
    install: 'cmake -B build -S . && cmake --build build',
    run: './build/main',
    test: 'ctest --test-dir build',
    envVars: [
      { key: 'BUILD_TYPE', value: 'Debug' }
    ],
    envNotes: 'Requires GCC/Clang and CMake.'
  },
  {
    name: 'Java (Spring Boot)',
    install: './mvnw clean install',
    run: './mvnw spring-boot:run',
    test: './mvnw test',
    envVars: [
      { key: 'SPRING_PROFILES_ACTIVE', value: 'dev' },
      { key: 'SERVER_PORT', value: '8080' },
      { key: 'DATABASE_URL', value: 'jdbc:postgresql://localhost:5432/springdb' }
    ],
    envNotes: 'Requires JDK 17+ and Maven.'
  },
  {
    name: 'Flutter / Mobile',
    install: 'flutter pub get',
    run: 'flutter run',
    test: 'flutter test',
    envVars: [
      { key: 'API_BASE_URL', value: 'https://api.projectvault.dev' }
    ],
    envNotes: 'Connect physical device or start iOS/Android simulator.'
  },
  {
    name: 'PHP / Laravel',
    install: 'composer install',
    run: 'php artisan serve --port=8000',
    test: 'php artisan test',
    envVars: [
      { key: 'APP_ENV', value: 'local' },
      { key: 'APP_KEY', value: 'base64:dev_app_key_secret' }
    ],
    envNotes: 'Requires PHP 8.1+ and Composer.'
  },
  {
    name: '.NET / C#',
    install: 'dotnet restore',
    run: 'dotnet run',
    test: 'dotnet test',
    envVars: [
      { key: 'ASPNETCORE_ENVIRONMENT', value: 'Development' }
    ],
    envNotes: 'Requires .NET SDK 8.0+.'
  }
];

const DashboardAddProject = () => {
  const navigate = useNavigate();

  const categoryKeys = Object.keys(TAXONOMY);
  const initialCategory = categoryKeys[0];
  const initialSubcategories = Object.keys(TAXONOMY[initialCategory] || {});
  const initialSubcategory = initialSubcategories[0] || 'General';
  const initialSubdomains = TAXONOMY[initialCategory]?.[initialSubcategory] || ['General'];
  const initialSubdomain = initialSubdomains[0] || 'General';

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    category: initialCategory,
    subcategory: initialSubcategory,
    customSubcategory: '',
    subdomain: initialSubdomain,
    customSubdomain: '',
    architectureType: 'Microservices & Distributed Systems',
    description: '',
    // Thumbnail Image
    thumbnailUrl: '',
    // Executable / Binary Build Artifact (.exe)
    executableFile: null,
    // Tech Stacks
    majorStack: 'MERN (MongoDB, Express, React, Node)',
    tags: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    currentTagInput: '',
    // Links
    githubUrl: '',
    liveUrl: '',
    // Commands & Execution
    installCommand: 'npm install',
    runCommand: 'npm run dev',
    testCommand: 'npm test',
    // Render-style Environment Variables
    envVars: [
      { id: 'env_1', key: 'PORT', value: '5173', showSecret: false },
      { id: 'env_2', key: 'VITE_API_URL', value: 'http://localhost:5000', showSecret: false }
    ],
    envNotes: 'Node.js v18+ required.'
  });

  const [showRawEnvEditor, setShowRawEnvEditor] = useState(false);
  const [rawEnvInput, setRawEnvInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [isUploadingExecutable, setIsUploadingExecutable] = useState(false);
  const [executableUploadError, setExecutableUploadError] = useState('');

  // Handle Domain/Category Change
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const subcats = Object.keys(TAXONOMY[selectedCategory] || {});
    const defaultSubcat = subcats[0] || 'General';
    const subdoms = TAXONOMY[selectedCategory]?.[defaultSubcat] || ['General'];
    const defaultSubdom = subdoms[0] || 'General';

    setFormData((prev) => ({
      ...prev,
      category: selectedCategory,
      subcategory: defaultSubcat,
      customSubcategory: '',
      subdomain: defaultSubdom,
      customSubdomain: ''
    }));
  };

  // Handle Subcategory Change
  const handleSubcategoryChange = (e) => {
    const selectedSubcat = e.target.value;
    const subdoms = TAXONOMY[formData.category]?.[selectedSubcat] || ['General'];
    const defaultSubdom = subdoms[0] || 'General';

    setFormData((prev) => ({
      ...prev,
      subcategory: selectedSubcat,
      customSubcategory: '',
      subdomain: defaultSubdom,
      customSubdomain: ''
    }));
  };

  // Thumbnail file upload handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setImageUploadError('');
    setIsUploadingImage(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, thumbnailUrl: event.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      const response = await uploadMediaApi(file);
      if (response && response.url) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: response.url }));
      }
    } catch (err) {
      // Keep local preview if upload API fails (e.g. offline/mock)
      console.warn('Media upload to server notice:', err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Format File Size
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Executable / Binary File (.exe) Upload Handler
  const handleExecutableFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExecutableUploadError('');
    setIsUploadingExecutable(true);

    try {
      const res = await uploadExecutableApi(file);
      if (res.success && res.file) {
        setFormData((prev) => ({
          ...prev,
          executableFile: res.file,
        }));
      }
    } catch (err) {
      console.error('Error uploading executable:', err);
      setExecutableUploadError(err.message || 'Failed to upload executable file');
    } finally {
      setIsUploadingExecutable(false);
    }
  };

  const handleRemoveExecutable = () => {
    setFormData((prev) => ({
      ...prev,
      executableFile: null,
    }));
    setExecutableUploadError('');
  };

  // Tech tags management
  const handleAddTag = (tagToAdd) => {
    const cleanTag = (tagToAdd || formData.currentTagInput).trim();
    if (!cleanTag) return;
    if (!formData.tags.includes(cleanTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, cleanTag],
        currentTagInput: ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, currentTagInput: '' }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Preset execution command applier
  const applyExecutionPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      installCommand: preset.install,
      runCommand: preset.run,
      testCommand: preset.test,
      envNotes: preset.envNotes || '',
      envVars: (preset.envVars || []).map((ev, i) => ({
        id: `preset_${Date.now()}_${i}`,
        key: ev.key,
        value: ev.value,
        showSecret: false
      }))
    }));
  };

  // Environment Variables Handlers (Render.com Style)
  const handleAddEnvVar = () => {
    setFormData((prev) => ({
      ...prev,
      envVars: [
        ...prev.envVars,
        { id: `env_${Date.now()}`, key: '', value: '', showSecret: false }
      ]
    }));
  };

  const handleRemoveEnvVar = (id) => {
    setFormData((prev) => ({
      ...prev,
      envVars: prev.envVars.filter((item) => item.id !== id)
    }));
  };

  const handleUpdateEnvVar = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      envVars: prev.envVars.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleToggleSecret = (id) => {
    setFormData((prev) => ({
      ...prev,
      envVars: prev.envVars.map((item) =>
        item.id === id ? { ...item, showSecret: !item.showSecret } : item
      )
    }));
  };

  const handleImportRawEnv = () => {
    if (!rawEnvInput.trim()) {
      setShowRawEnvEditor(false);
      return;
    }

    const lines = rawEnvInput.split('\n');
    const imported = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return; // ignore comments & blanks
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (key) {
          imported.push({
            id: `import_${Date.now()}_${idx}`,
            key,
            value: val,
            showSecret: false
          });
        }
      }
    });

    if (imported.length > 0) {
      setFormData((prev) => ({
        ...prev,
        envVars: [...prev.envVars, ...imported]
      }));
    }

    setRawEnvInput('');
    setShowRawEnvEditor(false);
  };

  // Copy run script including .env configuration
  const handleCopyCommands = () => {
    const validEnvVars = formData.envVars.filter((ev) => ev.key.trim());
    const envSection = validEnvVars.length > 0
      ? `# 1. Environment configuration (.env)\n${validEnvVars.map((ev) => `${ev.key}=${ev.value}`).join('\n')}\n\n`
      : '';
    const script = `${envSection}# 2. Setup dependencies\n${formData.installCommand}\n\n# 3. Run the project\n${formData.runCommand}${formData.testCommand ? `\n\n# 4. Test\n${formData.testCommand}` : ''}`;
    navigator.clipboard.writeText(script);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await createProjectApi(formData);
      setSuccessMsg('Project with execution commands & media successfully published!');
      setTimeout(() => {
        navigate('/dashboard/projects');
      }, 1000);
    } catch (err) {
      console.error('Error publishing project:', err);
      setErrorMsg(err.message || 'Failed to publish project to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      
      {/* Top Standalone Navbar (No Sidebar) */}
      <header className="bg-white border-b border-stone-200/90 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-md font-brand tracking-wider group-hover:scale-105 transition-transform">
              PV
            </div>
            <span className="font-black text-slate-900 text-sm tracking-tight font-brand uppercase">
              Project Vault
            </span>
          </Link>

          <Link
            to="/dashboard/projects"
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Projects</span>
          </Link>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-8">
        
        {/* Header Title Card */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-brand flex items-center gap-2.5">
                <FolderKanban className="w-7 h-7 text-emerald-600" />
                <span>Add New Project Showcase</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Register a new project with domain taxonomy, thumbnail media, tech stacks, and step-by-step terminal run commands.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl shrink-0 self-start sm:self-center">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Discipline Portfolio</span>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 1: Project Overview & Identity */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              <span>1. Project Overview & Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Autonomous Robotic Swarm / Quantum Portfolio Optimizer / EcoTrack AI"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  One-Line Pitch / Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Real-time distributed telemetry engine with sub-10ms state synchronization."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* 3-TIER TAXONOMY: CATEGORY -> SUBCATEGORY -> SUBDOMAIN */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#fafaf8] p-4 rounded-2xl border border-stone-200/80">
                {/* 1. Domain / Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Domain / Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-medium cursor-pointer shadow-2xs"
                  >
                    {categoryKeys.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Subcategory */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subcategory <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={handleSubcategoryChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-medium cursor-pointer shadow-2xs"
                  >
                    {(Object.keys(TAXONOMY[formData.category] || {})).map((subcat) => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                    <option value="Other / Custom Subcategory">Other / Custom Subcategory</option>
                  </select>
                </div>

                {/* 3. Subdomain / Specialization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subdomain / Track <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-medium cursor-pointer shadow-2xs"
                  >
                    {(TAXONOMY[formData.category]?.[formData.subcategory] || []).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    <option value="Other / Custom Subdomain">Other / Custom Subdomain</option>
                  </select>
                </div>

                {/* Custom Subcategory Write-in */}
                {formData.subcategory === 'Other / Custom Subcategory' && (
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specify Custom Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.customSubcategory}
                      onChange={(e) => setFormData({ ...formData, customSubcategory: e.target.value })}
                      placeholder="Enter custom subcategory..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                {/* Custom Subdomain Write-in */}
                {formData.subdomain === 'Other / Custom Subdomain' && (
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specify Custom Subdomain
                    </label>
                    <input
                      type="text"
                      value={formData.customSubdomain}
                      onChange={(e) => setFormData({ ...formData, customSubdomain: e.target.value })}
                      placeholder="Enter your custom field specialization..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>


              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  System Architecture Style
                </label>
                <select
                  value={formData.architectureType}
                  onChange={(e) => setFormData({ ...formData, architectureType: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="Microservices & Distributed Systems">Microservices & Distributed Systems</option>
                  <option value="Full-Stack Monolithic Architecture">Full-Stack Monolithic Architecture</option>
                  <option value="Serverless & Edge Compute">Serverless & Edge Compute</option>
                  <option value="Client-Side Standalone / SPA">Client-Side Standalone / SPA</option>
                  <option value="Decentralized / Smart Contracts">Decentralized / Smart Contracts</option>
                  <option value="Physical Prototype / Embedded Hardware">Physical Prototype / Embedded Hardware</option>
                  <option value="Research Paper / Simulation Model">Research Paper / Simulation Model</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Project Summary & Technical Highlights
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the problem statement, challenges overcome, architectural solutions, database design, or research methodology..."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-4 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Project Thumbnail / Media Showcase */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>2. Project Thumbnail & Cover Media</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-stone-100 px-2.5 py-0.5 rounded-lg">
                16:9 Aspect Ratio Recommended
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Uploader Box */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Upload Cover Image / Screenshot
                </label>
                <label className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#fafafa] hover:bg-emerald-50/20 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {isUploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-emerald-700" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {isUploadingImage ? 'Uploading to Cloudinary...' : 'Click to upload image or drag & drop'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    PNG, JPG, WEBP or GIF up to 5MB
                  </span>
                </label>

                {imageUploadError && (
                  <p className="text-xs text-rose-600 font-semibold">{imageUploadError}</p>
                )}

                {/* Direct Image URL input */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Or paste direct image URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or cloud image URL"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">
                  Thumbnail Preview
                </span>
                <div className="aspect-video w-full rounded-2xl border border-stone-200 bg-stone-100 overflow-hidden relative flex items-center justify-center shadow-inner">
                  {formData.thumbnailUrl ? (
                    <>
                      <img
                        src={formData.thumbnailUrl}
                        alt="Project Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-xl transition-colors cursor-pointer shadow-md"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 p-4 text-center">
                      <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-xs font-semibold">No thumbnail selected yet</span>
                      <span className="text-[10px] text-slate-400">
                        Visual thumbnails boost reviewer engagement by 4x
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Executable & Binary Build Artifact (.exe) */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Binary className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  3. Executable / Binary Build Artifact (.exe)
                </h2>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2.5 py-0.5 rounded-lg w-fit">
                For AI Project Testing & Automated Execution
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your compiled executable (<code className="font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded text-slate-800">.exe</code>), binary, or packaged application. These files are stored and will be used when we run automated AI project analysis, sandboxed Docker execution, and code quality scoring.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Uploader Box */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Select or Drag Executable File (.exe, .bin, .jar, .zip)
                </label>
                <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
                  formData.executableFile 
                    ? 'border-purple-300 bg-purple-50/20' 
                    : 'border-stone-300 hover:border-purple-500 bg-[#fafafa] hover:bg-purple-50/30'
                }`}>
                  <input
                    type="file"
                    accept=".exe,.bin,.jar,.zip,.tar,.gz,.apk,.msi"
                    onChange={handleExecutableFileChange}
                    disabled={isUploadingExecutable}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    {isUploadingExecutable ? (
                      <Loader2 className="w-6 h-6 animate-spin text-purple-700" />
                    ) : (
                      <Binary className="w-6 h-6 text-purple-700" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {isUploadingExecutable ? 'Uploading Executable to Server...' : formData.executableFile ? 'Click to replace executable file' : 'Click to browse or drop .exe file here'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Direct binary upload up to 100MB supported
                  </span>
                </label>

                {executableUploadError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{executableUploadError}</span>
                  </div>
                )}
              </div>

              {/* Uploaded File Status / Details Card */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">
                  Executable Artifact Status
                </span>
                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 min-h-[148px] flex flex-col justify-center">
                  {formData.executableFile ? (
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <Binary className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate font-mono" title={formData.executableFile.name}>
                              {formData.executableFile.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{formatBytes(formData.executableFile.size)}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready for AI Project
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveExecutable}
                          className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Remove attached executable"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-white border border-stone-200/80 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-mono truncate mr-2" title={formData.executableFile.url}>
                          {formData.executableFile.url}
                        </span>
                        <a
                          href={formData.executableFile.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="shrink-0 text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 hover:underline"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Test Download</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-3 space-y-2 text-slate-400">
                      <Binary className="w-9 h-9 stroke-[1.5] text-slate-300" />
                      <span className="text-xs font-semibold text-slate-600">
                        No executable attached yet (Optional)
                      </span>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        If your project produces a compiled binary or desktop executable, uploading it enables one-click AI testing and recruiter evaluation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Major Tech Stack & Technologies */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>4. Tech Stacks & Architecture Foundation</span>
            </h2>

            <div className="space-y-5">
              {/* Major Stack */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Major / Primary Tech Stack <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.majorStack}
                  onChange={(e) => setFormData({ ...formData, majorStack: e.target.value })}
                  placeholder="e.g. MERN Stack / Next.js + TypeScript / Python FastAPI"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-semibold text-slate-900"
                />

                {/* Major Stack Quick Chips */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Select:</span>
                  {MAJOR_STACK_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, majorStack: preset })}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                        formData.majorStack === preset
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-stone-100 hover:bg-stone-200 text-slate-700 border-transparent'
                      }`}
                    >
                      {preset.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technologies / Tags */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tools, Frameworks & Libraries Used
                </label>

                {/* Current Active Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-3 p-3 bg-stone-50 border border-stone-200/80 rounded-2xl min-h-[46px]">
                  {formData.tags.length === 0 ? (
                    <span className="text-xs text-slate-400 font-normal">
                      No tags added yet. Type below or click recommended tools.
                    </span>
                  ) : (
                    formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 bg-white border border-stone-300/80 text-slate-800 text-xs font-bold px-3 py-1 rounded-xl shadow-2xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 transition-colors p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Tag Input Field */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.currentTagInput}
                    onChange={(e) => setFormData({ ...formData, currentTagInput: e.target.value })}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type technology and press Enter (e.g. PyTorch, Redis, Tailwind)"
                    className="flex-1 bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tag</span>
                  </button>
                </div>

                {/* Suggested Quick Add Tags */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Popular:</span>
                  {SUGGESTED_TECH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="text-[11px] font-semibold bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-stone-200 text-slate-600 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Terminal Run Commands & Execution Helper */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>5. Step-by-Step Run & Terminal Commands</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/70">
                Helps Reviewers Run Your Build Seamlessly
              </span>
            </div>

            <div className="space-y-5">
              {/* Preset Quick Fill Bar */}
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-2">
                  Auto-Fill by Framework / Environment Preset:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXECUTION_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyExecutionPreset(preset)}
                      className="text-left text-xs font-bold p-2.5 rounded-xl border border-stone-200/90 bg-[#fbfbf9] hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Install and Run inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Installation / Setup Command <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Terminal className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.installCommand}
                      onChange={(e) => setFormData({ ...formData, installCommand: e.target.value })}
                      placeholder="e.g. npm install or pip install -r requirements.txt"
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start / Run Command <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Play className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.runCommand}
                      onChange={(e) => setFormData({ ...formData, runCommand: e.target.value })}
                      placeholder="e.g. npm run dev or python main.py or flutter run"
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-600 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Automated Test / Audit Command (Optional)
                  </label>
                  <div className="relative">
                    <Cpu className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData.testCommand}
                      onChange={(e) => setFormData({ ...formData, testCommand: e.target.value })}
                      placeholder="e.g. npm test or pytest or cargo test"
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Render.com Style Environment Variables Section */}
                <div className="sm:col-span-2 pt-2 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Environment Variables</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Add environment variables as key-value pairs or bulk import from your <code className="bg-stone-100 px-1 py-0.5 rounded text-slate-700">.env</code> file.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRawEnvEditor(!showRawEnvEditor)}
                        className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-stone-50 border border-stone-200/90 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{showRawEnvEditor ? 'Close Raw Editor' : 'Add from .env'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddEnvVar}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add Environment Variable</span>
                      </button>
                    </div>
                  </div>

                  {/* Bulk Import from .env Drawer */}
                  {showRawEnvEditor && (
                    <div className="bg-[#fcfcfa] border border-stone-200/90 rounded-2xl p-4 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Paste from .env file</span>
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Format: KEY=VALUE (one per line)
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={rawEnvInput}
                        onChange={(e) => setRawEnvInput(e.target.value)}
                        placeholder={`PORT=5000\nDATABASE_URL=mongodb://localhost:27017/vault\nJWT_SECRET=supersecretkey\nAPI_KEY="sk_live_12345"`}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-emerald-600 leading-relaxed shadow-2xs"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setRawEnvInput(''); setShowRawEnvEditor(false); }}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleImportRawEnv}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-all shadow-2xs"
                        >
                          Import Variables
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Key-Value Pair Table / List */}
                  {formData.envVars.length === 0 ? (
                    <div className="bg-[#fafaf8] border border-dashed border-stone-300 rounded-2xl p-6 text-center space-y-2">
                      <Key className="w-7 h-7 text-slate-400 mx-auto stroke-[1.5]" />
                      <p className="text-xs font-bold text-slate-700">
                        No environment variables added yet
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Click below to add keys or import directly from your .env file.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleAddEnvVar}
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          + Add Variable
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRawEnvEditor(true)}
                          className="text-xs font-bold text-slate-700 bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          Add from .env
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-bold text-slate-500 uppercase px-1">
                        <span className="col-span-5">Key</span>
                        <span className="col-span-6">Value</span>
                        <span className="col-span-1 text-center">Action</span>
                      </div>

                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {formData.envVars.map((ev) => (
                          <div
                            key={ev.id}
                            className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-stretch sm:items-center bg-[#fafaf8] border border-stone-200/90 rounded-2xl p-2.5 sm:p-2 group hover:border-slate-300 transition-colors shadow-2xs"
                          >
                            {/* Key Input */}
                            <div className="sm:col-span-5">
                              <input
                                type="text"
                                value={ev.key}
                                onChange={(e) => handleUpdateEnvVar(ev.id, 'key', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                                placeholder="e.g. DATABASE_URL"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 uppercase"
                              />
                            </div>

                            {/* Value Input with Show/Hide toggle */}
                            <div className="sm:col-span-6 relative">
                              <input
                                type={ev.showSecret ? 'text' : 'password'}
                                value={ev.value}
                                onChange={(e) => handleUpdateEnvVar(ev.id, 'value', e.target.value)}
                                placeholder="e.g. mongodb+srv://... or secret_key"
                                className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                              />
                              <button
                                type="button"
                                onClick={() => handleToggleSecret(ev.id)}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 transition-colors"
                                title={ev.showSecret ? 'Mask value' : 'Show value'}
                              >
                                {ev.showSecret ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Delete Action */}
                            <div className="sm:col-span-1 flex items-center justify-end sm:justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveEnvVar(ev.id)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs"
                                title="Delete environment variable"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sm:hidden text-[11px] font-bold text-rose-600">Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prerequisites & General Environment Notes */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Prerequisites & System Requirements Notes
                    </label>
                    <input
                      type="text"
                      value={formData.envNotes}
                      onChange={(e) => setFormData({ ...formData, envNotes: e.target.value })}
                      placeholder="e.g. Requires Node.js v18+, Docker daemon running, and Redis on port 6379"
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Live Terminal Preview */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    Reviewer Terminal Execution Preview:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCommands}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 cursor-pointer"
                  >
                    {copiedCmd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-200 shadow-lg border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    <span className="text-[11px] text-slate-400 font-sans ml-2">bash / zsh session</span>
                  </div>

                  {/* Render .env section in terminal if available */}
                  {formData.envVars.filter((ev) => ev.key.trim()).length > 0 && (
                    <>
                      <p className="text-slate-500"># 1. Environment configuration (.env)</p>
                      {formData.envVars.filter((ev) => ev.key.trim()).map((ev) => (
                        <p key={ev.id} className="text-emerald-300">
                          {ev.key}={ev.showSecret ? ev.value : '••••••••••••'}
                        </p>
                      ))}
                    </>
                  )}

                  <p className="text-slate-500 pt-1"># 2. Clone & install dependencies</p>
                  <p className="text-emerald-400">$ {formData.installCommand || 'npm install'}</p>
                  <p className="text-slate-500 pt-1"># 3. Launch the application</p>
                  <p className="text-emerald-400 font-bold">$ {formData.runCommand || 'npm run dev'}</p>
                  {formData.testCommand && (
                    <>
                      <p className="text-slate-500 pt-1"># 4. Run verification tests</p>
                      <p className="text-emerald-400">$ {formData.testCommand}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Repositories & Deployment Links */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>5. Repository & Production Deployment URLs</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source Code / Git Repository URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/yourhandle/project-repo"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Live Deployment / Interactive Demo URL
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  placeholder="https://myproject.vault.app or production domain"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard/projects')}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Project...' : 'Publish Project Showcase'}</span>
            </button>
          </div>

        </form>

      </main>

    </div>
  );
};

export default DashboardAddProject;
