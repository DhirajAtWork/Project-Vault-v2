import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Terminal,
  Bookmark,
  BarChart3,
  Search
} from 'lucide-react';
import RecruiterDashboardHome from '../../components/dashboard/RecruiterDashboardHome';

const DashboardHome = () => {
  const { user, activeRole } = useOutletContext() || {};
  const currentRole = activeRole || user?.accountType || 'student';

  if (currentRole === 'recruiter') {
    return <RecruiterDashboardHome user={user} />;
  }

  const userName = user?.name || 'Student Developer';
  const userAvatar = user?.avatar || '';
  const headline = user?.headline || 'Full-Stack Software Engineer & AI Researcher';
  const location = user?.location || '';
  const email = user?.email || '';
  const phone = user?.phone || '';
  const bio = user?.bio || '';
  const accountType = 'student';
  const socialLinks = user?.socialLinks || {};

  const education = user?.education || [];
  const experience = user?.experience || [];
  const skills = user?.skills || { languages: [], frameworks: [], tools: [] };
  const certifications = user?.certifications || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* 1. Unique Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800/80">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
            
            {/* Student Profile Photo Avatar with Glow */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-3xl flex items-center justify-center font-brand overflow-hidden border-2 border-emerald-400/40 shadow-xl transition-transform group-hover:scale-105 duration-300">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span>{userName.substring(0, 2).toUpperCase() || 'PV'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-slate-950 flex items-center justify-center" title="Active Account">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono">
                  {accountType} Workspace
                </span>
                <span className="bg-slate-800/80 text-slate-300 border border-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Developer CV</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-brand text-white">
                {userName}
              </h1>

              {headline ? (
                <p className="text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <span>{headline}</span>
                  {location && <span className="text-slate-400 font-normal">• {location}</span>}
                </p>
              ) : (
                <p className="text-slate-400 text-xs font-medium">
                  {accountType === 'recruiter'
                    ? 'Technical Talent & Candidate Discovery Portal'
                    : 'Student Developer Portfolio & Interactive Resume'}
                </p>
              )}
            </div>
          </div>

          {/* Role-tailored Hero Action Button */}
          <div className="shrink-0">
            {accountType === 'student' ? (
              <Link
                to="/dashboard/analytics"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>View Analytics & Activity</span>
              </Link>
            ) : (
              <Link
                to="/dashboard/visit-projects"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Visit Projects Catalog</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Unique Asymmetric 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Sidebar Matrix & Contact info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Contact & Portfolio Quick Links Card */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Contact & Profiles</span>
            </h3>

            <div className="space-y-3">
              {email && (
                <div className="flex items-center gap-3 text-xs text-slate-700 bg-stone-50 border border-stone-200/70 p-3 rounded-xl">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">{email}</span>
                </div>
              )}

              {phone && (
                <div className="flex items-center gap-3 text-xs text-slate-700 bg-stone-50 border border-stone-200/70 p-3 rounded-xl">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{phone}</span>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-3 text-xs text-slate-700 bg-stone-50 border border-stone-200/70 p-3 rounded-xl">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{location}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(socialLinks.github || socialLinks.linkedin || socialLinks.website || socialLinks.twitter) && (
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Online Presence</h4>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-blue-200" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3 text-blue-200" />
                    </a>
                  )}

                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Portfolio</span>
                      <ExternalLink className="w-3 h-3 text-emerald-200" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Categorized Technical Skills Card */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Technical Skills</span>
            </h3>

            {/* Languages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Languages</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  {skills.languages?.length || 0}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.languages && skills.languages.length > 0 ? (
                  skills.languages.map((sk, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No languages added</span>
                )}
              </div>
            </div>

            {/* Frameworks */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Frameworks & Libraries</span>
                <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-mono">
                  {skills.frameworks?.length || 0}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.frameworks && skills.frameworks.length > 0 ? (
                  skills.frameworks.map((sk, i) => (
                    <span key={i} className="bg-sky-50 text-sky-800 border border-sky-200/80 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No frameworks added</span>
                )}
              </div>
            </div>

            {/* Tools & DBs */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Tools & Databases</span>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono">
                  {skills.tools?.length || 0}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.tools && skills.tools.length > 0 ? (
                  skills.tools.map((sk, i) => (
                    <span key={i} className="bg-purple-50 text-purple-800 border border-purple-200/80 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No tools added</span>
                )}
              </div>
            </div>
          </div>

          {/* Certifications Card */}
          {certifications.length > 0 && (
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Certifications</span>
              </h3>

              <div className="space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs">{cert.title}</h4>
                      {cert.issueDate && <span className="text-[10px] text-slate-500 font-medium">{cert.issueDate}</span>}
                    </div>
                    <p className="text-[11px] font-bold text-emerald-700">{cert.issuer}</p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Executive Bio, Interactive Timeline & Education (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Executive Bio / About Card */}
          {bio && (
            <div className="bg-gradient-to-br from-white via-white to-emerald-50/30 border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Executive Bio & Objective</span>
              </h3>
              <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                "{bio}"
              </p>
            </div>
          )}

          {/* Work & Internship Experience Timeline Card */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-brand">Experience & Internships</h3>
                  <p className="text-xs text-slate-500">Professional career timeline and technical achievements</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full font-mono">
                {experience.length} Position(s)
              </span>
            </div>

            {experience.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-stone-50/50">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No work experience listed yet.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-emerald-500/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8 py-2">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100 shadow-md group-hover:scale-125 transition-transform duration-300"></div>

                    <div className="bg-[#f8fafc] border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-300 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="font-black text-slate-900 text-base font-brand">{exp.title || 'Developer Position'}</h4>
                          <p className="text-xs font-bold text-emerald-700">
                            {exp.company} {exp.location ? `• ${exp.location}` : ''}
                          </p>
                        </div>

                        {(exp.startDate || exp.endDate || exp.current) && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-stone-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-center">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                          </div>
                        )}
                      </div>

                      {exp.description && (
                        <p className="text-xs text-slate-600 font-medium leading-relaxed pt-2 border-t border-stone-200/60 mt-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education History Section */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-brand">Academic Education</h3>
                  <p className="text-xs text-slate-500">Degree programs, universities, and academic metrics</p>
                </div>
              </div>
            </div>

            {education.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-stone-50/50">
                <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No education history added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="bg-[#f8fafc] border border-stone-200/90 rounded-2xl p-5 space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm font-brand">{edu.institution || 'University'}</h4>
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">
                          {edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}
                        </p>
                      </div>

                      {(edu.startYear || edu.endYear) && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 font-mono">
                          {edu.startYear} - {edu.endYear}
                        </span>
                      )}
                    </div>

                    {edu.gpa && (
                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Cumulative Grade / CGPA:</span>
                        <span className="bg-slate-900 text-white font-extrabold px-2.5 py-0.5 rounded-md font-mono">
                          {edu.gpa}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardHome;
