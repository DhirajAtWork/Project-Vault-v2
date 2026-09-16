import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import codingWorkspaceImg from '../assets/developer_coding_workspace.jpg';
import { 
  forgotPasswordApi, 
  resetPasswordApi, 
  triggerPassportGoogleAuth, 
  triggerPassportGithubAuth 
} from '../api/authApi';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [email, setEmail] = useState('');
  const [oauthInfo, setOauthInfo] = useState(null); // { isOAuth: true, provider: string }

  const [resetData, setResetData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setOauthInfo(null);

    try {
      setLoading(true);
      const res = await forgotPasswordApi({ email });
      setSuccessMsg(res.message || 'Password reset OTP sent to your email address');
      setStep('reset');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset OTP');
      if (err.isOAuthAccount) {
        setOauthInfo({
          isOAuth: true,
          provider: err.authProvider || 'oauth',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (resetData.newPassword !== resetData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPasswordApi({
        email,
        otp: resetData.otp,
        newPassword: resetData.newPassword,
        confirmPassword: resetData.confirmPassword,
      });
      setSuccessMsg(res.message || 'Password reset successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Container Card */}
      <div className="w-full max-w-md lg:max-w-5xl bg-white border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Visual Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative p-6 sm:p-8 flex-col justify-between overflow-hidden border-r border-stone-200/80 bg-slate-900 min-h-full">
          <img
            src={codingWorkspaceImg}
            alt="Developer workspace"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/40 pointer-events-none"></div>

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-slate-800 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L12 20L20 4H15L12 11L9 4H4Z" fill="white" />
                </svg>
              </div>
              <span className="font-black text-lg tracking-tight text-white font-brand">
                PROJECT VAULT
              </span>
            </Link>

            <Link
              to="/signin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-black/40 hover:bg-black/60 border border-white/20 px-3 py-1.5 rounded-full transition-all backdrop-blur-md"
            >
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Bottom Hero Text */}
          <div className="relative z-10 mt-12 lg:mt-0 pt-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-2 font-brand">
              Account Recovery & <span className="text-emerald-400">Security</span>
            </h2>
            <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">
              Verify your identity with encrypted OTP authentication to safely restore access to your Project Vault account.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1 font-brand">
              {step === 'request' ? 'Reset Your Password' : 'Enter Reset OTP Code'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {step === 'request'
                ? 'Enter your registered email address below to receive a 6-digit OTP code.'
                : `We've sent a 6-digit code to ${email}. Enter it below along with your new password.`}
            </p>
          </div>

          {/* Alerts */}
          {oauthInfo?.isOAuth ? (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-sm animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-amber-950 mb-1">
                    OAuth Social Account Detected
                  </h3>
                  <p className="text-xs text-amber-800 leading-relaxed mb-3">
                    {errorMsg || `This account was registered using ${oauthInfo.provider === 'google' ? 'Google' : oauthInfo.provider === 'github' ? 'GitHub' : 'social'} login and does not use a password. Password recovery is disabled for OAuth accounts.`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={triggerPassportGoogleAuth}
                      className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 border border-slate-300/90 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.8 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.2-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={triggerPassportGithubAuth}
                      className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 border border-slate-300/90 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Sign in with GitHub</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Email Request Form */}
          {step === 'request' ? (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@iitd.ac.in"
                  className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.99] text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
                <span>Send Reset OTP Code</span>
              </button>

              <div className="text-center pt-2">
                <Link to="/signin" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: OTP & New Password Form */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6-Digit Reset OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={resetData.otp}
                  onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
                  placeholder="123456"
                  className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={resetData.newPassword}
                    onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={resetData.confirmPassword}
                  onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.99] text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
                <span>Reset Password & Sign In</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Change Email
                </button>

                <button
                  type="button"
                  onClick={handleRequestSubmit}
                  className="text-xs font-semibold text-[#059669] hover:text-[#047857]"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};

export default ForgotPasswordPage;
