import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FolderKanban, 
  Eye, 
  Send, 
  Search, 
  ShieldCheck 
} from 'lucide-react';
import { updateAccountTypeApi } from '../../api/authApi';

/**
 * RoleSelectionModal
 * Prompts OAuth users (or users without confirmed account type)
 * "What kind of profile do you want?"
 */
const RoleSelectionModal = ({ isOpen, user, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState(user?.accountType === 'recruiter' ? 'recruiter' : 'student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.accountType) {
      setSelectedRole(user.accountType === 'recruiter' ? 'recruiter' : 'student');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError('');
    try {
      setLoading(true);
      const res = await updateAccountTypeApi(selectedRole);
      if (res?.user) {
        onRoleSelected(res.user);
      }
    } catch (err) {
      console.error('Failed to configure profile role:', err);
      setError(err.message || 'Failed to save selected role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Setup
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              PV
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-brand">
                Welcome to Project Vault!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                What kind of profile do you want?
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <p className="text-slate-600 text-sm mb-6">
            Choose how you plan to use Project Vault. This customizes your navigation, dashboard workspace, and collaboration features.
          </p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Student Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole('student')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRole('student'); }}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                selectedRole === 'student'
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  selectedRole === 'student' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                }`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedRole === 'student' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {selectedRole === 'student' && <CheckCircle2 className="w-4 h-4 text-white fill-emerald-600" />}
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  Student / Developer
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">
                  Build & Showcase Projects
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Best for software developers, engineers, and students building their digital portfolio.
                </p>
              </div>

              <ul className="mt-4 pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Upload & manage code repositories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Track recruiter views & impressions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Receive collaboration & hire requests</span>
                </li>
              </ul>
            </div>

            {/* Recruiter Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole('recruiter')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRole('recruiter'); }}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                selectedRole === 'recruiter'
                  ? 'border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  selectedRole === 'recruiter' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedRole === 'recruiter' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {selectedRole === 'recruiter' && <CheckCircle2 className="w-4 h-4 text-white fill-purple-600" />}
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
                  Recruiter / Scout
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">
                  Discover & Hire Talent
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Best for hiring managers, technical talent scouts, and recruiters seeking top builders.
                </p>
              </div>

              <ul className="mt-4 pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Browse & filter student projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Inspect verified source code & demos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Send direct collaboration inquiries</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-slate-400">
              * You can also adjust your account type later from your profile settings.
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-md transition-all active:scale-95 ml-auto ${
                selectedRole === 'recruiter'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Configuring Profile...</span>
                </>
              ) : (
                <>
                  <span>Continue as {selectedRole === 'recruiter' ? 'Recruiter' : 'Student'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
