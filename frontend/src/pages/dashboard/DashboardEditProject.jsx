import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  AlertCircle,
  Save,
  Pencil
} from 'lucide-react';
import { uploadMediaApi } from '../../api/authApi';
import { getProjectByIdApi, updateProjectApi, uploadExecutableApi } from '../../api/projectApi';

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

// Suggested individual tech tags
const SUGGESTED_TECH_TAGS = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'FastAPI', 
  'Go', 'Rust', 'C++', 'Java', 'Kotlin', 'Swift', 'PostgreSQL', 
  'MongoDB', 'Redis', 'GraphQL', 'PyTorch', 'AWS', 'Flutter', 'Figma'
];

// Execution Command Presets
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

const DashboardEditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const categoryKeys = Object.keys(TAXONOMY);

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    category: categoryKeys[0],
    subcategory: '',
    customSubcategory: '',
    subdomain: '',
    customSubdomain: '',
    description: '',
    thumbnailUrl: '',
    executableFile: null,
    majorStack: '',
    tags: [],
    currentTagInput: '',
    githubUrl: '',
    liveUrl: '',
    installCommand: 'npm install',
    runCommand: 'npm run dev',
    testCommand: 'npm test',
    envVars: [],
    envNotes: ''
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

  // Fetch existing project details on mount
  useEffect(() => {
    let isMounted = true;

    const fetchProjectDetails = async () => {
      setIsLoadingProject(true);
      setLoadError('');
      try {
        const res = await getProjectByIdApi(id);
        const p = res.project || res;

        if (p && isMounted) {
          // Normalize Category, Subcategory, Subdomain
          const matchedCategory = categoryKeys.includes(p.category) ? p.category : categoryKeys[0];
          const availableSubcats = Object.keys(TAXONOMY[matchedCategory] || {});
          const matchedSubcat = availableSubcats.includes(p.subcategory) ? p.subcategory : (availableSubcats[0] || 'General');
          const availableSubdoms = TAXONOMY[matchedCategory]?.[matchedSubcat] || ['General'];
          const matchedSubdom = availableSubdoms.includes(p.subdomain) ? p.subdomain : (availableSubdoms[0] || 'General');

          // Normalize Environment Variables
          const loadedEnvVars = Array.isArray(p.envVariables) && p.envVariables.length > 0
            ? p.envVariables.map((ev, i) => ({
                id: `env_${Date.now()}_${i}`,
                key: ev.key || '',
                value: ev.value || '',
                showSecret: false,
              }))
            : [];

          setFormData({
            title: p.title || '',
            tagline: p.tagline || '',
            category: matchedCategory,
            subcategory: matchedSubcat,
            customSubcategory: !availableSubcats.includes(p.subcategory) ? p.subcategory : '',
            subdomain: matchedSubdom,
            customSubdomain: !availableSubdoms.includes(p.subdomain) ? p.subdomain : '',
            description: p.description || '',
            thumbnailUrl: p.thumbnailUrl || '',
            executableFile: p.executableFile || null,
            majorStack: p.majorStack || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            currentTagInput: '',
            githubUrl: p.githubUrl || '',
            liveUrl: p.liveUrl || '',
            installCommand: p.installCmd || p.installCommand || 'npm install',
            runCommand: p.runCommand || 'npm run dev',
            testCommand: p.testCmd || p.testCommand || 'npm test',
            envVars: loadedEnvVars,
            envNotes: p.envNotes || ''
          });
        }
      } catch (err) {
        console.error('Failed to load project details for editing:', err);
        if (isMounted) {
          setLoadError(err.message || 'Unable to retrieve project details');
        }
      } finally {
        if (isMounted) {
          setIsLoadingProject(false);
        }
      }
    };

    if (id) {
      fetchProjectDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  // Environment Variables Handlers
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
      if (!trimmed || trimmed.startsWith('#')) return;
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

  // Submit Update Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        title: formData.title.trim(),
        tagline: formData.tagline.trim(),
        category: formData.category,
        subcategory: formData.subcategory === 'Other / Custom Subcategory' ? formData.customSubcategory : formData.subcategory,
        subdomain: formData.subdomain === 'Other / Custom Subdomain' ? formData.customSubdomain : formData.subdomain,
        majorStack: formData.majorStack,
        description: formData.description,
        thumbnailUrl: formData.thumbnailUrl,
        executableFile: formData.executableFile,
        tags: formData.tags,
        githubUrl: formData.githubUrl,
        liveUrl: formData.liveUrl,
        installCmd: formData.installCommand,
        runCommand: formData.runCommand,
        testCmd: formData.testCommand,
        envVariables: formData.envVars
          .filter((ev) => ev && ev.key && ev.key.trim())
          .map((ev) => ({ key: ev.key.trim(), value: ev.value || '' })),
        envNotes: formData.envNotes
      };

      const response = await updateProjectApi(id, payload);
      setSuccessMsg('Project details successfully updated!');
      const updatedProject = response?.project;

      setTimeout(() => {
        navigate('/dashboard/projects', {
          state: {
            newProject: updatedProject,
            refresh: true,
            timestamp: Date.now(),
          },
          replace: true,
        });
      }, 700);
    } catch (err) {
      console.error('Error updating project:', err);
      setErrorMsg(err.message || 'Failed to update project details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-600 text-sm font-semibold">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Project Not Found</h2>
          <p className="text-xs text-slate-600">{loadError}</p>
          <Link
            to="/dashboard/projects"
            className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      
      {/* Top Standalone Navbar */}
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-mono">
                  Editing Mode
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-brand flex items-center gap-2.5 mt-1">
                <Pencil className="w-7 h-7 text-emerald-600" />
                <span>Edit Project Details</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Update project metadata, domain taxonomy, binary artifacts, runtime instructions, and environment secrets.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl shrink-0 self-start sm:self-center">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Showcase</span>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
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
                      Specify Custom Subdomain / Track
                    </label>
                    <input
                      type="text"
                      value={formData.customSubdomain}
                      onChange={(e) => setFormData({ ...formData, customSubdomain: e.target.value })}
                      placeholder="Enter custom subdomain track..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>

              {/* Comprehensive Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comprehensive Description & Problem Statement
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the technical challenges solved, architecture diagrams, benchmark numbers, and real-world utility..."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-4 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Media, Executable Binary & Visual Artifacts */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>2. Media & Executable Artifacts</span>
            </h2>

            {/* Thumbnail Upload Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Project Showcase Thumbnail Image
              </label>

              {formData.thumbnailUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 group aspect-video max-w-md bg-stone-100 shadow-sm">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Project Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="bg-white hover:bg-stone-100 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-stone-300 hover:border-emerald-500 bg-[#fafaf8] hover:bg-emerald-50/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors max-w-md">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Upload Project Thumbnail</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {isUploadingImage && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading thumbnail to Cloudinary...</span>
                </div>
              )}

              {imageUploadError && (
                <p className="text-xs text-rose-600 font-semibold">{imageUploadError}</p>
              )}
            </div>

            {/* Executable Binary (.exe) Upload Section */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Binary className="w-4 h-4 text-purple-600" />
                    <span>Compiled Executable / Binary Build (.exe)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Optional executable artifact (.exe, .jar, .bin) enabling recruiters and AI reviewers to run sandbox checks.
                  </p>
                </div>
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                  Automated Sandbox
                </span>
              </div>

              {formData.executableFile?.url ? (
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-4 border border-slate-800 shadow-sm max-w-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <Binary className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-slate-100">
                        {formData.executableFile.name || 'compiled_build.exe'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {formatBytes(formData.executableFile.size)} • Attached
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveExecutable}
                    className="text-slate-400 hover:text-rose-400 p-2 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Remove Executable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-stone-300 hover:border-purple-500 bg-[#fafaf8] hover:bg-purple-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors max-w-md">
                  <Binary className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Attach Executable (.exe)</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Supports standalone .exe, .bin, .jar builds</span>
                  <input
                    type="file"
                    accept=".exe,.bin,.jar,.msi,.zip"
                    onChange={handleExecutableFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {isUploadingExecutable && (
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading executable package...</span>
                </div>
              )}

              {executableUploadError && (
                <p className="text-xs text-rose-600 font-semibold">{executableUploadError}</p>
              )}
            </div>
          </div>

          {/* SECTION 3: Technology Stacks & Ecosystem Tags */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>3. Technology Stack & Classification</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Architecture / Major Stack Preset
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.majorStack}
                    onChange={(e) => setFormData({ ...formData, majorStack: e.target.value })}
                    placeholder="e.g. MERN (MongoDB, Express, React, Node)"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Presets:</span>
                  {MAJOR_STACK_PRESETS.slice(0, 5).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, majorStack: preset })}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 transition-colors cursor-pointer"
                    >
                      {preset.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Management */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ecosystem Tech Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.currentTagInput}
                    onChange={(e) => setFormData({ ...formData, currentTagInput: e.target.value })}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type a library/tool and press Enter or comma..."
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-stone-100">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Suggested:</span>
                  {SUGGESTED_TECH_TAGS.map((stag) => (
                    <button
                      key={stag}
                      type="button"
                      onClick={() => handleAddTag(stag)}
                      disabled={formData.tags.includes(stag)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      + {stag}
                    </button>
                  ))}
                </div>
              </div>

              {/* External Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Live Demo / Production Deployment URL
                  </label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://my-project-showcase.vercel.app"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Deterministic Runtime Commands & Execution Guide */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>4. Step-by-Step Terminal Execution Guide</span>
              </h2>
              <button
                type="button"
                onClick={handleCopyCommands}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Commands Copied' : 'Copy Run Script'}</span>
              </button>
            </div>

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
            </div>

            {/* SECTION 5: Render-Style Environment Variables */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Environment Variables (.env Key-Value Store)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure port variables, database placeholders, and runtime flags.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowRawEnvEditor(!showRawEnvEditor)}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>{showRawEnvEditor ? 'Close Raw Editor' : 'Import Raw .env'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddEnvVar}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variable</span>
                  </button>
                </div>
              </div>

              {/* Raw .env Importer Area */}
              {showRawEnvEditor && (
                <div className="bg-slate-900 rounded-2xl p-4 space-y-3 border border-slate-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Paste Raw .env Text</span>
                    </span>
                    <span className="text-[10px] text-slate-400">KEY=VALUE format</span>
                  </div>
                  <textarea
                    rows={4}
                    value={rawEnvInput}
                    onChange={(e) => setRawEnvInput(e.target.value)}
                    placeholder="PORT=5000&#10;DATABASE_URL=mongodb://localhost:27017&#10;JWT_SECRET=secret"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRawEnvEditor(false)}
                      className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImportRawEnv}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Import Variables
                    </button>
                  </div>
                </div>
              )}

              {/* Key-Value Pairs List */}
              <div className="space-y-2.5">
                {formData.envVars.length === 0 && (
                  <div className="py-6 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                    <Sliders className="w-6 h-6 text-stone-300 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-600">No Environment Variables Configured</p>
                    <p className="text-[11px] text-slate-400">Click "Add Variable" to add custom parameters.</p>
                  </div>
                )}

                {formData.envVars.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-[#fafaf8] border border-stone-200/80 p-2 sm:p-2.5 rounded-2xl"
                  >
                    <div className="w-1/3 min-w-[100px]">
                      <input
                        type="text"
                        value={item.key}
                        onChange={(e) => handleUpdateEnvVar(item.id, 'key', e.target.value)}
                        placeholder="KEY_NAME"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 uppercase"
                      />
                    </div>

                    <div className="flex-1 relative">
                      <input
                        type={item.showSecret ? 'text' : 'password'}
                        value={item.value}
                        onChange={(e) => handleUpdateEnvVar(item.id, 'value', e.target.value)}
                        placeholder="Variable value or placeholder"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 pr-8 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleSecret(item.id)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={item.showSecret ? 'Mask Secret' : 'Reveal Secret'}
                      >
                        {item.showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEnvVar(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete variable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Environment Setup Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Environment & Hardware Setup Notes
                </label>
                <input
                  type="text"
                  value={formData.envNotes}
                  onChange={(e) => setFormData({ ...formData, envNotes: e.target.value })}
                  placeholder="e.g. Requires Node.js v18+, PostgreSQL on localhost:5432, or CUDA 11.8 for GPU training."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Form Submit Bottom Card */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Save className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Save Your Updates</h4>
                <p className="text-xs text-slate-500">
                  Modifications will update your portfolio showcase immediately across all views.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/dashboard/projects"
                className="w-1/2 sm:w-auto text-center px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </main>

    </div>
  );
};

export default DashboardEditProject;
