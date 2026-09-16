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
  ShieldCheck,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { updateAccountTypeApi } from '../../api/authApi';

/**
 * RoleSelectionModal
 * Prompts OAuth users (Google / GitHub) on initial signup to choose their permanent account profile.
 * Once selected and confirmed, switching between student and recruiter is strictly prohibited.
 */
const RoleSelectionModal = ({ isOpen, user, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState(user?.accountType === 'recruiter' ? 'recruiter' : 'student');
  const [isPermanentAcknowledged, setIsPermanentAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.accountType) {
      setSelectedRole(user.accountType === 'recruiter' ? 'recruiter' : 'student');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsPermanentAcknowledged(false);
    setError('');
  };

  const handleConfirm = async () => {
    if (!isPermanentAcknowledged) {
      setError('Please check the acknowledgement below confirming that this selection is permanent.');
      return;
    }

    setError('');
    try {
      setLoading(true);
      const res = await updateAccountTypeApi(selectedRole);
      if (res?.user) {
        onRoleSelected(res.user);
      }
    } catch (err) {
      console.error('Failed to configure permanent profile role:', err);
      setError(err.message || 'Failed to save selected role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = selectedRole === 'student';
  const roleName = isStudent ? 'Student / Developer' : 'Recruiter / Talent Scout';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in font-sans"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-400 backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OAuth Setup</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              PV
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-brand">
                Select Your Profile Type
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Welcome to Project Vault! Choose your account role to continue.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-5">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Please choose the profile that matches your role. This configures your dashboard workspace, analytics tools, and permissions.
          </p>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleRoleSelect('student')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRoleSelect('student'); }}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                isStudent
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isStudent ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                }`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isStudent ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isStudent && <CheckCircle2 className="w-4 h-4 text-white fill-emerald-600" />}
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
              onClick={() => handleRoleSelect('recruiter')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRoleSelect('recruiter'); }}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                !isStudent
                  ? 'border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  !isStudent ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  !isStudent ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {!isStudent && <CheckCircle2 className="w-4 h-4 text-white fill-purple-600" />}
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

          {/* PERMANENT WARNING BANNER */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3 text-amber-900 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 font-mono">
                  Permanent Selection Warning
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                  <Lock className="w-3 h-3" /> Cannot be changed later
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                You are setting your profile permanently as a <strong className="font-extrabold text-amber-950">{roleName}</strong>. 
                Once confirmed, you will <strong>not</strong> be able to switch between Student and Recruiter.
              </p>
            </div>
          </div>

          {/* Mandatory Checkbox Acknowledgement */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              id="permanent-role-checkbox"
              checked={isPermanentAcknowledged}
              onChange={(e) => {
                setIsPermanentAcknowledged(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700 leading-snug">
              I understand that selecting <strong className="text-slate-900">{roleName}</strong> is permanent and cannot be changed after confirmation.
            </span>
          </label>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              id="confirm-permanent-role-btn"
              onClick={handleConfirm}
              disabled={loading || !isPermanentAcknowledged}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                !isStudent
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              } ${loading || !isPermanentAcknowledged ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:shadow-xl'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Configuring Permanent Profile...</span>
                </>
              ) : (
                <>
                  <span>Set Permanent Profile as {isStudent ? 'Student' : 'Recruiter'}</span>
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
