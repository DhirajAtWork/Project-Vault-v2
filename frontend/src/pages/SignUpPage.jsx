import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import codingWorkspaceImg from '../assets/developer_coding_workspace.jpg';
import {
  registerUserApi,
  verifyOtpApi,
  resendOtpApi,
  googleAuthApi,
  githubAuthApi,
  triggerPassportGoogleAuth,
  triggerPassportGithubAuth,
} from '../api/authApi';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accountType: 'student',
    password: '',
    confirmPassword: '',
    subscribeNewsletter: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await registerUserApi(formData);
      setSuccessMsg(res.message || 'Registration successful! Check your email for OTP verification code.');
      if (res.requiresOtpVerification) {
        setIsOtpStep(true);
      } else {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtpApi({ 
        email: formData.email, 
        otp: otpCode,
        accountType: formData.accountType 
      });
      setSuccessMsg(res.message || 'Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      const res = await resendOtpApi({ 
        email: formData.email,
        accountType: formData.accountType 
      });
      setSuccessMsg(res.message || 'New OTP verification code sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      triggerPassportGoogleAuth();
    } catch (err) {
      try {
        const googlePayload = {
          googleId: 'google_' + Date.now(),
          email: formData.email || 'developer.google@example.com',
          name: formData.name || 'Google Developer',
          avatar: 'https://lh3.googleusercontent.com/a/default-user',
          accountType: formData.accountType,
        };
        const res = await googleAuthApi(googlePayload);
        setSuccessMsg(res.message || 'Google authentication successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } catch (fallbackErr) {
        setErrorMsg(fallbackErr.message || 'Google Auth failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGithubAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      triggerPassportGithubAuth();
    } catch (err) {
      try {
        const githubPayload = {
          githubId: 'github_' + Date.now(),
          email: formData.email || 'developer.github@example.com',
          name: formData.name || 'GitHub Developer',
          avatar: 'https://avatars.githubusercontent.com/u/123456?v=4',
          accountType: formData.accountType,
        };
        const res = await githubAuthApi(githubPayload);
        setSuccessMsg(res.message || 'GitHub authentication successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } catch (fallbackErr) {
        setErrorMsg(fallbackErr.message || 'GitHub Auth failed');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Container Card */}
      <div className="w-full max-w-md lg:max-w-5xl bg-white border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Real Life Coding Visual Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative p-6 sm:p-8 flex-col justify-between overflow-hidden border-r border-stone-200/80 bg-slate-900 min-h-full">
          <img
            src={codingWorkspaceImg}
            alt="Software developer coding in workspace"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/40 pointer-events-none"></div>

          {/* Top Bar: Logo & Back to Home */}
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
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-black/40 hover:bg-black/60 border border-white/20 px-3 py-1.5 rounded-full transition-all backdrop-blur-md"
            >
              <span>Back to website</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12" y1="5" x2="19" y2="12"></polyline>
              </svg>
            </Link>
          </div>

          {/* Bottom Hero Text */}
          <div className="relative z-10 mt-12 lg:mt-0 pt-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-2 font-brand">
              Turn your projects into <span className="text-emerald-400">verified proof.</span>
            </h2>
            <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">
              Join thousands of developers, faculty auditors, and recruiters showcasing verified builds with automated container scans.
            </p>
          </div>
        </div>

        {/* Right Side: Light Theme Form Panel */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1 font-brand">
              {isOtpStep ? 'Verify Your Email' : 'Create an account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {isOtpStep ? (
                `Enter the 6-digit OTP code sent to ${formData.email}`
              ) : (
                <>
                  Already a member?{' '}
                  <Link to="/signin" className="text-[#059669] hover:text-[#047857] font-semibold underline underline-offset-4">
                    Sign In
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Error & Success Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>{successMsg}</span>
            </div>
          )}

          {isOtpStep ? (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6-Digit Verification OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.99] text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
                <span>Verify OTP & Complete Sign Up</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Edit Account Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs font-semibold text-[#059669] hover:text-[#047857]"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
              />
            </div>

            {/* Account Type Select Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Type
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#f8fafc] border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Newsletter Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="subscribeNewsletter"
                name="subscribeNewsletter"
                checked={formData.subscribeNewsletter}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 bg-[#f8fafc] text-[#059669] focus:ring-[#059669]/20 cursor-pointer"
              />
              <label htmlFor="subscribeNewsletter" className="text-xs text-slate-600 cursor-pointer leading-tight select-none">
                Subscribe to weekly platform updates & top projects newsletter
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.99] text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
              <span>Sign Up</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200"></div>
            <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or sign up with Passport OAuth
            </span>
          </div>

          {/* Social Sign Up Options (Google & GitHub Passport OAuth) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sign up with Google */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.8 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.2-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
              </svg>
              <span>Google</span>
            </button>

            {/* Sign up with GitHub */}
            <button
              type="button"
              onClick={handleGithubAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
          </>
          )}

        </div>

      </div>

    </div>
  );
};

export default SignUpPage;
