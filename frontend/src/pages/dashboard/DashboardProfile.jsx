import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Award, 
  Globe, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Printer, 
  Camera, 
  Sparkles, 
  ExternalLink,
  Loader2,
  FileDown,
  FileText,
  Building2,
  Edit3,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  updateProfileApi, 
  uploadAvatarApi, 
  requestEmailChangeApi, 
  verifyEmailChangeApi,
  updateAccountTypeApi
} from '../../api/authApi';

const DashboardProfile = () => {
  const { user, setUser } = useOutletContext() || {};
  const currentRole = user?.accountType === 'recruiter' ? 'recruiter' : 'student';
  const isRecruiter = currentRole === 'recruiter';
  const isOAuthUser = Boolean(
    user?.isOAuthUser ||
    user?.googleId ||
    user?.githubId ||
    user?.authProvider === 'github' ||
    user?.authProvider === 'google'
  );
  const focusBorderClass = isRecruiter ? 'focus:border-purple-600' : 'focus:border-[#059669]';

  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Email authentication modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailModalStep, setEmailModalStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [emailModalLoading, setEmailModalLoading] = useState(false);
  const [emailModalMsg, setEmailModalMsg] = useState('');
  const [emailModalError, setEmailModalError] = useState('');

  // Account type switch modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalTarget, setRoleModalTarget] = useState('student');
  const [roleModalLoading, setRoleModalLoading] = useState(false);
  const [roleModalError, setRoleModalError] = useState('');

  const handleSwitchAccountType = async () => {
    setRoleModalError('');
    setRoleModalLoading(true);
    try {
      const res = await updateAccountTypeApi(roleModalTarget);
      if (res?.user) {
        setFormData((prev) => ({ ...prev, accountType: res.user.accountType }));
        if (setUser) {
          setUser(res.user);
        }
        setSavedMsg(`Account type successfully changed to ${res.user.accountType}!`);
        setTimeout(() => setSavedMsg(''), 4000);
        setShowRoleModal(false);
      }
    } catch (err) {
      console.error('Failed to update account type:', err);
      setRoleModalError(err.message || 'Failed to update account type. Please try again.');
    } finally {
      setRoleModalLoading(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setSavedMsg('');
    setErrorMsg('');

    try {
      const res = await uploadAvatarApi(file);
      if (res.avatar) {
        setFormData((prev) => ({ ...prev, avatar: res.avatar }));
        if (setUser && res.user) {
          setUser(res.user);
        }
        setSavedMsg('Profile picture uploaded successfully!');
        setTimeout(() => setSavedMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();
    if (!newEmailInput.trim() || !newEmailInput.includes('@')) {
      setEmailModalError('Please enter a valid email address');
      return;
    }
    setEmailModalLoading(true);
    setEmailModalError('');
    setEmailModalMsg('');
    try {
      const res = await requestEmailChangeApi(newEmailInput.trim());
      setEmailModalMsg(res.message || `Verification code sent to ${newEmailInput.trim()}`);
      setEmailModalStep('otp');
    } catch (err) {
      setEmailModalError(err.message || 'Failed to send verification code');
    } finally {
      setEmailModalLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtpInput.trim() || emailOtpInput.trim().length !== 6) {
      setEmailModalError('Please enter the 6-digit verification code');
      return;
    }
    setEmailModalLoading(true);
    setEmailModalError('');
    try {
      const res = await verifyEmailChangeApi(newEmailInput.trim(), emailOtpInput.trim());
      setFormData((prev) => ({ ...prev, email: newEmailInput.trim() }));
      if (setUser && res.user) {
        setUser(res.user);
      }
      setEmailModalStep('success');
      setEmailModalMsg('Email successfully verified and updated!');
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailModalStep('input');
        setNewEmailInput('');
        setEmailOtpInput('');
        setEmailModalMsg('');
      }, 1800);
    } catch (err) {
      setEmailModalError(err.message || 'Failed to verify code');
    } finally {
      setEmailModalLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    accountType: user?.accountType || 'student',
    company: user?.company || '',
    avatar: user?.avatar || '',
    headline: user?.headline || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    socialLinks: {
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
      website: user?.socialLinks?.website || '',
      twitter: user?.socialLinks?.twitter || '',
    },
    education: user?.education || [],
    experience: user?.experience || [],
    skills: {
      languages: user?.skills?.languages || [],
      frameworks: user?.skills?.frameworks || [],
      tools: user?.skills?.tools || [],
    },
    certifications: user?.certifications || [],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        accountType: user.accountType || 'student',
        company: user.company || '',
        avatar: user.avatar || '',
        headline: user.headline || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        socialLinks: {
          github: user.socialLinks?.github || '',
          linkedin: user.socialLinks?.linkedin || '',
          website: user.socialLinks?.website || '',
          twitter: user.socialLinks?.twitter || '',
        },
        education: user.education || [],
        experience: user.experience || [],
        skills: {
          languages: user.skills?.languages || [],
          frameworks: user.skills?.frameworks || [],
          tools: user.skills?.tools || [],
        },
        certifications: user.certifications || [],
      });
    }
  }, [user]);

  const [skillInputs, setSkillInputs] = useState({
    languages: '',
    frameworks: '',
    tools: '',
  });

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSavedMsg('');
    setErrorMsg('');

    try {
      const res = await updateProfileApi(formData);
      if (res.user && setUser) {
        setUser(res.user);
      }
      setSavedMsg('Profile & Resume updated successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', gpa: '' },
      ],
    }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' },
      ],
    }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const addSkill = (type) => {
    const val = skillInputs[type].trim();
    if (!val) return;
    if (!formData.skills[type].includes(val)) {
      setFormData((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [type]: [...prev.skills[type], val],
        },
      }));
    }
    setSkillInputs((prev) => ({ ...prev, [type]: '' }));
  };

  const removeSkill = (type, val) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((item) => item !== val),
      },
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { title: '', issuer: '', issueDate: '', credentialUrl: '' },
      ],
    }));
  };

  const removeCertification = (index) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const updateCertification = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const handleExportWord = () => {
    const studentName = formData.name || 'Student Developer';
    const headline = formData.headline || '';
    const email = formData.email || '';
    const phone = formData.phone || '';
    const location = formData.location || '';
    const bio = formData.bio || '';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${studentName} - Resume</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 { size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.0in; mso-header-margin: .5in; mso-footer-margin: .5in; mso-paper-source: 0; }
          div.Section1 { page: Section1; }
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.35; color: #1e293b; background-color: #ffffff; }
          h1 { font-size: 24pt; font-weight: bold; margin: 0 0 4pt 0; color: #0f172a; }
          .headline { font-size: 13pt; font-weight: bold; color: #047857; margin: 0 0 6pt 0; }
          .contact { font-size: 10pt; color: #475569; border-bottom: 2pt solid #047857; padding-bottom: 8pt; margin-bottom: 16pt; }
          h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 1pt solid #cbd5e1; padding-bottom: 3pt; margin-top: 14pt; margin-bottom: 8pt; letter-spacing: 0.5pt; }
          .entry { margin-bottom: 10pt; }
          .entry-title { font-weight: bold; font-size: 11pt; color: #0f172a; }
          .entry-sub { font-weight: 600; font-size: 10.5pt; color: #047857; }
          .entry-meta { float: right; font-size: 10pt; color: #64748b; font-weight: bold; text-align: right; }
          .entry-desc { font-size: 10pt; color: #334155; margin-top: 3pt; line-height: 1.4; }
          .skill-line { margin-bottom: 4pt; font-size: 10.5pt; color: #334155; }
          .skill-cat { font-weight: bold; color: #0f172a; }
        </style>
      </head>
      <body>
        <div class="Section1">
          <h1>${studentName}</h1>
          ${headline ? `<div class="headline">${headline}</div>` : ''}
          <div class="contact">
            ${email ? `<span>Email: ${email}</span>` : ''}
            ${phone ? ` &nbsp;|&nbsp; <span>Phone: ${phone}</span>` : ''}
            ${location ? ` &nbsp;|&nbsp; <span>Location: ${location}</span>` : ''}
            ${formData.socialLinks?.github ? ` &nbsp;|&nbsp; <span>GitHub: ${formData.socialLinks.github}</span>` : ''}
            ${formData.socialLinks?.linkedin ? ` &nbsp;|&nbsp; <span>LinkedIn: ${formData.socialLinks.linkedin}</span>` : ''}
            ${formData.socialLinks?.website ? ` &nbsp;|&nbsp; <span>Portfolio: ${formData.socialLinks.website}</span>` : ''}
          </div>

          ${bio ? `
            <h2>Executive Summary</h2>
            <p style="font-size: 10.5pt; color: #334155; line-height: 1.5; margin-bottom: 12pt;">${bio}</p>
          ` : ''}

          ${formData.education?.length > 0 ? `
            <h2>Education</h2>
            ${formData.education.map(edu => `
              <div class="entry">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td class="entry-title">${edu.institution || 'University'}</td>
                    <td class="entry-meta">${edu.startYear || ''} - ${edu.endYear || 'Present'}</td>
                  </tr>
                </table>
                <div class="entry-sub">${edu.degree || ''} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''} ${edu.gpa ? `(GPA: ${edu.gpa})` : ''}</div>
              </div>
            `).join('')}
          ` : ''}

          ${formData.experience?.length > 0 ? `
            <h2>Work & Internship Experience</h2>
            ${formData.experience.map(exp => `
              <div class="entry">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td class="entry-title">${exp.title || 'Role Title'}</td>
                    <td class="entry-meta">${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}</td>
                  </tr>
                </table>
                <div class="entry-sub">${exp.company || ''} ${exp.location ? `• ${exp.location}` : ''}</div>
                ${exp.description ? `<div class="entry-desc">${exp.description}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}

          ${(formData.skills?.languages?.length > 0 || formData.skills?.frameworks?.length > 0 || formData.skills?.tools?.length > 0) ? `
            <h2>Technical Skills</h2>
            ${formData.skills.languages?.length > 0 ? `
              <div class="skill-line"><span class="skill-cat">Languages:</span> ${formData.skills.languages.join(', ')}</div>
            ` : ''}
            ${formData.skills.frameworks?.length > 0 ? `
              <div class="skill-line"><span class="skill-cat">Frameworks & Libraries:</span> ${formData.skills.frameworks.join(', ')}</div>
            ` : ''}
            ${formData.skills.tools?.length > 0 ? `
              <div class="skill-line"><span class="skill-cat">Developer Tools & DBs:</span> ${formData.skills.tools.join(', ')}</div>
            ` : ''}
          ` : ''}

          ${formData.certifications?.length > 0 ? `
            <h2>Certifications & Honors</h2>
            ${formData.certifications.map(cert => `
              <div class="entry">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td class="entry-title">${cert.title}</td>
                    <td class="entry-meta">${cert.issueDate || ''}</td>
                  </tr>
                </table>
                <div class="entry-sub">${cert.issuer || ''}</div>
              </div>
            `).join('')}
          ` : ''}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${(studentName).replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        className="hidden"
      />
      
      {/* Top Header Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0">
          <div 
            className="relative group cursor-pointer shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload profile picture"
          >
            <div className={`w-20 h-20 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-md font-brand overflow-hidden border-2 ${
              currentRole === 'recruiter' ? 'border-purple-500/40 group-hover:border-purple-500' : 'border-emerald-500/30 group-hover:border-emerald-500'
            } transition-colors`}>
              {isUploadingAvatar ? (
                <div className={`flex flex-col items-center justify-center bg-slate-900/90 w-full h-full ${
                  currentRole === 'recruiter' ? 'text-purple-400' : 'text-emerald-400'
                }`}>
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : formData.avatar ? (
                <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <span>{formData.name.substring(0, 2).toUpperCase() || 'PV'}</span>
              )}
            </div>
            <button
              type="button"
              disabled={isUploadingAvatar}
              className={`absolute -bottom-1.5 -right-1.5 ${
                currentRole === 'recruiter' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white p-1.5 rounded-xl shadow-lg border-2 border-white transition-transform group-hover:scale-110 flex items-center justify-center cursor-pointer disabled:opacity-50`}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-brand truncate">
                {formData.name || (currentRole === 'recruiter' ? 'Recruiter' : 'Student')}
              </h1>
              <span className={`${
                currentRole === 'recruiter' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
              } text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded font-mono uppercase`}>
                {formData.accountType}
              </span>
              {isOAuthUser && (
                <button
                  type="button"
                  onClick={() => {
                    setRoleModalTarget(formData.accountType === 'recruiter' ? 'student' : 'recruiter');
                    setRoleModalError('');
                    setShowRoleModal(true);
                  }}
                  className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Switch your account type (Student or Recruiter)"
                >
                  <RefreshCw className="w-3 h-3 text-slate-600" />
                  <span>Switch to {formData.accountType === 'recruiter' ? 'Student' : 'Recruiter'}</span>
                </button>
              )}
            </div>
            <p className={`text-xs sm:text-sm font-semibold ${
              currentRole === 'recruiter' ? 'text-purple-700' : 'text-emerald-700'
            } mt-0.5`}>
              {formData.headline || (currentRole === 'recruiter' ? 'Add your recruiter headline below' : 'Add your professional headline below')}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="truncate font-mono font-medium">{formData.email}</span>
              {isOAuthUser && (
                <button
                  type="button"
                  onClick={() => {
                    setNewEmailInput('');
                    setEmailOtpInput('');
                    setEmailModalStep('input');
                    setEmailModalError('');
                    setEmailModalMsg('');
                    setShowEmailModal(true);
                  }}
                  className={`text-[11px] font-bold ${
                    currentRole === 'recruiter'
                      ? 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                  } border px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95`}
                  title="Edit and authenticate email address with OTP verification"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Email</span>
                </button>
              )}
              {formData.location && <span>• {formData.location}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end flex-wrap">
          {currentRole === 'student' && (
            <button
              onClick={handleExportWord}
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              title="Export as Microsoft Word Document (.doc)"
            >
              <FileDown className="w-4 h-4 text-emerald-100" />
              <span>Export Word (.doc)</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            type="button"
            className={`${
              currentRole === 'recruiter'
                ? 'bg-purple-700 hover:bg-purple-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            } font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95`}
            title="Print or Save as Official PDF Document"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print / PDF</span>
          </button>
          
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className={`${
              currentRole === 'recruiter' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedMsg && (
        <div className={`${
          currentRole === 'recruiter' ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        } border px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 print:hidden`}>
          <CheckCircle2 className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 print:hidden">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* EDIT RESUME / PROFILE SECTION FORM */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-sm print:hidden">
        
        <div className="border-b border-stone-200 px-3 sm:px-6 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(currentRole === 'recruiter'
            ? [
                { id: 'personal', label: 'Company & Personal Details', icon: Building2 },
                { id: 'skills', label: 'Target Hiring Stacks', icon: Code2 },
                { id: 'experience', label: 'Executive Background', icon: Briefcase },
              ]
            : [
                { id: 'personal', label: 'Personal & Contact', icon: User },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'skills', label: 'Technical Skills', icon: Code2 },
                { id: 'certifications', label: 'Certifications', icon: Award },
              ]
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  active
                    ? currentRole === 'recruiter'
                      ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                      : 'border-[#059669] text-[#059669] bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8">
          
          {/* PERSONAL TAB */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-base font-black text-slate-900 font-brand flex items-center gap-2">
                {currentRole === 'recruiter' ? (
                  <>
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Company & Recruiter Details</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Personal Details & Social Links</span>
                  </>
                )}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full bg-stone-100 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                {currentRole === 'recruiter' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                      placeholder="e.g. Razorpay Engineering / Infosys Innovation Labs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentRole === 'recruiter' ? 'Recruiter Title / Role' : 'Professional Headline / Tagline'}
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    placeholder={
                      currentRole === 'recruiter'
                        ? 'e.g. Director of Technical Talent & University Relations'
                        : 'e.g. Full-Stack Software Engineer & AI Researcher'
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                    placeholder="e.g. Bengaluru, Karnataka / New Delhi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio / Executive Summary</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                  placeholder={
                    isRecruiter
                      ? 'Leading engineering talent acquisition, campus initiatives, and leadership hiring...'
                      : 'Passionate computer science student specializing in web applications and distributed systems...'
                  }
                />
              </div>

              {currentRole === 'student' && (
                <div className="pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">Online Links & Social Portfolios</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={formData.socialLinks.github}
                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                        className={`w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={formData.socialLinks.linkedin}
                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                        className={`w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Portfolio / Personal Website</label>
                      <input
                        type="url"
                        value={formData.socialLinks.website}
                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
                        className={`w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                        placeholder="https://yourportfolio.dev"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Twitter / X Handle</label>
                      <input
                        type="text"
                        value={formData.socialLinks.twitter}
                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                        className={`w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-brand flex items-center gap-2">
                    <GraduationCap className={`w-4 h-4 ${isRecruiter ? 'text-purple-600' : 'text-emerald-600'}`} />
                    Academic Degrees & Qualifications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Add your universities, degrees, graduation dates, and GPA</p>
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className={`${
                    isRecruiter
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  } font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              </div>

              {formData.education.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No education entries added yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Add Education" above to enter your degree and university details.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 sm:p-5 relative group">
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-8">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">University / Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="e.g. Indian Institute of Technology (IIT) Delhi"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="e.g. B.Tech / M.Tech / B.E."
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Field of Study</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="e.g. Computer Science and Engineering"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Year</label>
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="2022"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">End / Graduation Year</label>
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="2026"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">CGPA / Grade</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="e.g. 8.9 / 10.0 CGPA"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-brand flex items-center gap-2">
                    <Briefcase className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} />
                    <span>{currentRole === 'recruiter' ? 'Executive Background & Experience' : 'Work & Internship Experience'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentRole === 'recruiter' ? 'List leadership, technical recruitment, or talent executive roles' : 'List developer internships or jobs'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className={`${
                    currentRole === 'recruiter'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  } font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Position</span>
                </button>
              </div>

              {formData.experience.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No work experience added yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Add Position" above to add internship details.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 sm:p-5 relative group space-y-3">
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-8">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Role / Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="Software Engineer Intern"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="e.g. Swiggy / Infosys / Razorpay / TCS"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(index, 'location', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="e.g. Bengaluru, Karnataka / Pune"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="May 2024"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">End Date</label>
                          <input
                            type="text"
                            disabled={exp.current}
                            value={exp.current ? 'Present' : exp.endDate}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="Aug 2024"
                          />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                              className={`w-4 h-4 ${isRecruiter ? 'text-purple-600 focus:ring-purple-500' : 'text-[#059669] focus:ring-emerald-500'} rounded`}
                            />
                            <span>Currently Working</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Description / Key Achievements</label>
                        <textarea
                          rows={2}
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className={`w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                          placeholder="Built REST APIs in Node.js, optimized database queries..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TECHNICAL SKILLS TAB */}
          {/* SKILLS / TARGET HIRING STACKS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h3 className="text-base font-black text-slate-900 font-brand flex items-center gap-2">
                <Code2 className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} />
                <span>{currentRole === 'recruiter' ? 'Target Hiring Stacks & Technologies' : 'Technical & Tooling Skills'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Languages</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInputs.languages}
                      onChange={(e) => setSkillInputs({ ...skillInputs, languages: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('languages'))}
                      className={`w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none ${
                        currentRole === 'recruiter' ? 'focus:border-purple-600' : 'focus:border-[#059669]'
                      }`}
                      placeholder="Python, C++"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill('languages')}
                      className={`${
                        currentRole === 'recruiter' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      } text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 cursor-pointer`}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.skills.languages.map((skill, i) => (
                      <span key={i} className={`${
                        currentRole === 'recruiter' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      } text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1`}>
                        {skill}
                        <button type="button" onClick={() => removeSkill('languages', skill)} className="hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Frameworks</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInputs.frameworks}
                      onChange={(e) => setSkillInputs({ ...skillInputs, frameworks: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('frameworks'))}
                      className={`w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none ${
                        currentRole === 'recruiter' ? 'focus:border-purple-600' : 'focus:border-[#059669]'
                      }`}
                      placeholder="React, Node.js"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill('frameworks')}
                      className={`${
                        currentRole === 'recruiter' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      } text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 cursor-pointer`}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.skills.frameworks.map((skill, i) => (
                      <span key={i} className={`${
                        currentRole === 'recruiter' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      } text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1`}>
                        {skill}
                        <button type="button" onClick={() => removeSkill('frameworks', skill)} className="hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Tools & DBs</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInputs.tools}
                      onChange={(e) => setSkillInputs({ ...skillInputs, tools: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('tools'))}
                      className={`w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none ${
                        currentRole === 'recruiter' ? 'focus:border-purple-600' : 'focus:border-[#059669]'
                      }`}
                      placeholder="Docker, AWS, Git"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill('tools')}
                      className={`${
                        currentRole === 'recruiter' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      } text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 cursor-pointer`}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.skills.tools.map((skill, i) => (
                      <span key={i} className={`${
                        currentRole === 'recruiter' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      } text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1`}>
                        {skill}
                        <button type="button" onClick={() => removeSkill('tools', skill)} className="hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CERTIFICATIONS TAB */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-brand flex items-center gap-2">
                    <Award className={`w-4 h-4 ${isRecruiter ? 'text-purple-600' : 'text-emerald-600'}`} />
                    Certifications & Honors
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">List industry certifications or course badges</p>
                </div>
                <button
                  type="button"
                  onClick={addCertification}
                  className={`${
                    isRecruiter
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  } font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Certification</span>
                </button>
              </div>

              {formData.certifications.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No certifications added yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Add Certification" above to list AWS or Google Cloud badges.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 sm:p-5 relative group">
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pr-8">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={cert.title}
                            onChange={(e) => updateCertification(index, 'title', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="AWS Certified Developer"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Issuer</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="Amazon Web Services"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Issue Date</label>
                          <input
                            type="text"
                            value={cert.issueDate}
                            onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="June 2024"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Credential URL</label>
                          <input
                            type="url"
                            value={cert.credentialUrl}
                            onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${focusBorderClass}`}
                            placeholder="https://credly.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* LIVE DIGITAL RESUME CV PREVIEW SHEET */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} />
            <h2 className="text-base font-black text-slate-900 font-brand">
              {currentRole === 'recruiter' ? 'Live Recruiter Profile Preview' : 'Live Resume CV Preview'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Updates in real-time as you edit your details above</span>
        </div>

        <div 
          id="resume-document-page"
          className="bg-white border border-stone-300/90 rounded-2xl p-8 sm:p-10 shadow-lg font-sans text-slate-900 space-y-8 relative overflow-hidden print-document print:p-0 print:border-none print:shadow-none print:rounded-none"
        >
          <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
            currentRole === 'recruiter' ? 'from-purple-600 via-indigo-600 to-slate-900' : 'from-emerald-600 via-teal-600 to-slate-900'
          } print:hidden`} />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-stone-200 pb-6 print:pb-4 page-break-avoid">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center font-brand overflow-hidden shrink-0 border-2 ${
                currentRole === 'recruiter' ? 'border-purple-500' : 'border-emerald-500'
              } shadow-md`}>
                {formData.avatar ? (
                  <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.name.substring(0, 2).toUpperCase() || 'PV'}</span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-brand">
                  {formData.name || (currentRole === 'recruiter' ? 'Recruiter' : 'Student')}
                </h1>
                <p className={`text-sm font-bold ${currentRole === 'recruiter' ? 'text-purple-700' : 'text-emerald-700'} mt-0.5`}>
                  {formData.headline || ''}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium mt-2">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {formData.email}</span>
                  {formData.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {formData.phone}</span>}
                  {formData.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {formData.location}</span>}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2">
              {formData.socialLinks.github && (
                <a href={formData.socialLinks.github} target="_blank" rel="noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-xs font-semibold flex items-center gap-1">
                  GitHub
                </a>
              )}
              {formData.socialLinks.linkedin && (
                <a href={formData.socialLinks.linkedin} target="_blank" rel="noreferrer" className="bg-sky-50 hover:bg-sky-100 text-sky-800 p-2 rounded-lg text-xs font-semibold flex items-center gap-1">
                  LinkedIn
                </a>
              )}
              {formData.socialLinks.website && (
                <a href={formData.socialLinks.website} target="_blank" rel="noreferrer" className={`${
                  currentRole === 'recruiter' ? 'bg-purple-50 hover:bg-purple-100 text-purple-800' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                } p-2 rounded-lg text-xs font-semibold flex items-center gap-1`}>
                  <Globe className={`w-3.5 h-3.5 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} /> Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          {formData.bio && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-stone-100 pb-1">
                {currentRole === 'recruiter' ? 'Executive Profile & Hiring Mission' : 'Professional Summary'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">{formData.bio}</p>
            </div>
          )}

          {/* Education */}
          {formData.education.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                <GraduationCap className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} /> Education
              </h3>
              <div className="space-y-3">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{edu.institution || 'University Name'}</h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500">{edu.startYear} - {edu.endYear || 'Present'}</span>
                      {edu.gpa && <p className={`text-[11px] font-bold ${currentRole === 'recruiter' ? 'text-purple-700' : 'text-emerald-700'}`}>GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {formData.experience.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                <Briefcase className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} />
                <span>{currentRole === 'recruiter' ? 'Executive Background & Experience' : 'Work & Internship Experience'}</span>
              </h3>
              <div className="space-y-4">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{exp.title || 'Role Title'}</h4>
                        <p className={`text-xs ${currentRole === 'recruiter' ? 'text-purple-700' : 'text-emerald-700'} font-bold`}>{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {(formData.skills.languages.length > 0 || formData.skills.frameworks.length > 0 || formData.skills.tools.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                <Code2 className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} />
                <span>{currentRole === 'recruiter' ? 'Target Hiring Stacks & Technologies' : 'Technical Skills'}</span>
              </h3>
              
              <div className="space-y-2 text-xs">
                {formData.skills.languages.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-slate-900 w-24 shrink-0">
                      {currentRole === 'recruiter' ? 'Core Stacks:' : 'Languages:'}
                    </span>
                    <span className="text-slate-700">{formData.skills.languages.join(', ')}</span>
                  </div>
                )}
                {formData.skills.frameworks.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-slate-900 w-24 shrink-0">Frameworks:</span>
                    <span className="text-slate-700">{formData.skills.frameworks.join(', ')}</span>
                  </div>
                )}
                {formData.skills.tools.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-slate-900 w-24 shrink-0">Tools & DBs:</span>
                    <span className="text-slate-700">{formData.skills.tools.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications */}
          {formData.certifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                <Award className={`w-4 h-4 ${currentRole === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'}`} /> Certifications & Honors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cert.title}</h4>
                      <p className="text-[11px] text-slate-500">{cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ''}</p>
                    </div>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className={`${
                        currentRole === 'recruiter' ? 'text-purple-600 hover:text-purple-800' : 'text-emerald-600 hover:text-emerald-800'
                      }`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-stone-200 text-center text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            Project Vault v2 • {currentRole === 'recruiter' ? 'Verified Technical Recruiter Profile' : 'Verified Student Developer Resume'}
          </div>

        </div>
      </div>

      {/* Email Edit & Authentication Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isRecruiter ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-brand">Authenticate Email</h3>
                  <p className="text-xs text-slate-500">Secure OTP verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {emailModalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl">
                {emailModalError}
              </div>
            )}

            {emailModalMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailModalMsg}</span>
              </div>
            )}

            {emailModalStep === 'input' && (
              <form onSubmit={handleRequestEmailOtp} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Current Registered Email</label>
                  <div className="bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-600 truncate">
                    {formData.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="Enter your real email (e.g. name@gmail.com)"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    A 6-digit authentication code will be sent to verify you own this inbox.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailModalLoading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
                      isRecruiter ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    } transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm active:scale-95`}
                  >
                    {emailModalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    <span>Send Verification Code</span>
                  </button>
                </div>
              </form>
            )}

            {emailModalStep === 'otp' && (
              <form onSubmit={handleVerifyEmailOtp} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={emailOtpInput}
                    onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600 transition-all"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span>Sent to: <strong className="font-mono text-slate-800">{newEmailInput}</strong></span>
                    <button
                      type="button"
                      onClick={() => setEmailModalStep('input')}
                      className="text-emerald-700 hover:underline font-bold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={emailModalLoading}
                    onClick={handleRequestEmailOtp}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100 transition-all cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    type="submit"
                    disabled={emailModalLoading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
                      isRecruiter ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    } transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm active:scale-95`}
                  >
                    {emailModalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Verify & Update Email</span>
                  </button>
                </div>
              </form>
            )}

            {emailModalStep === 'success' && (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-base">Email Successfully Updated!</h4>
                <p className="text-xs text-slate-500 font-mono">{newEmailInput}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Switch Account Type Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  roleModalTarget === 'recruiter' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Switch to {roleModalTarget === 'recruiter' ? 'Recruiter' : 'Student'}?
                  </h3>
                  <p className="text-xs text-slate-500">Change your account workspace and permissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {roleModalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                {roleModalError}
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                You are currently a <strong className="uppercase font-mono text-slate-900">{formData.accountType}</strong>.
              </p>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800">
                  Switching to {roleModalTarget === 'recruiter' ? 'Recruiter' : 'Student'} will:
                </p>
                {roleModalTarget === 'recruiter' ? (
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Enable the "Visit Projects" tab to explore student repositories</li>
                    <li>Allow you to send collaboration & hire inquiries to students</li>
                    <li>Adjust your dashboard metrics to recruiter statistics</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Enable the "Projects" tab to publish and showcase your work</li>
                    <li>Allow you to receive collaboration requests from recruiters</li>
                    <li>Display recruiter view analytics on your projects and profile</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                disabled={roleModalLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSwitchAccountType}
                disabled={roleModalLoading}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  roleModalTarget === 'recruiter'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                } ${roleModalLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {roleModalLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Switching...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Switch</span>
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

export default DashboardProfile;
