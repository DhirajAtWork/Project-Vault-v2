import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="w-full border-b border-stone-200/80 bg-[#f7f7f2]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-md group-hover:bg-slate-800 transition-colors shrink-0">
              <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 20L20 4H15L12 11L9 4H4Z" fill="white" />
              </svg>
            </div>
            <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 font-brand">
              PROJECT VAULT
            </span>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/signin"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 sm:py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/get-started"
              className="bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98] shrink-0"
            >
              <span>Get Started</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-28 w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4 sm:mb-6 font-sans">
              Turn your projects into <span className="text-[#2563eb]">verified proof.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 max-w-xl leading-relaxed">
              Bring your code out of cold repositories. Project Vault provides automated container builds, security scans, and faculty audit credentials for next-gen builders.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <button
                type="button"
                className="bg-[#059669] hover:bg-[#047857] text-white font-semibold px-6 py-3 sm:py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98] w-full sm:w-auto cursor-default"
              >
                <span>Submit Your Project</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </button>
              <button
                type="button"
                className="bg-white hover:bg-stone-50 border border-stone-300 text-slate-700 font-semibold px-6 py-3 sm:py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98] w-full sm:w-auto cursor-default"
              >
                <span>Explore Showcase</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-4 border-t border-stone-200/80">
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white font-bold text-[10px] sm:text-xs ring-2 ring-white">
                  ER
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold text-[10px] sm:text-xs ring-2 ring-white">
                  MV
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold text-[10px] sm:text-xs ring-2 ring-white">
                  AP
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white font-bold text-[10px] sm:text-xs ring-2 ring-white">
                  SC
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                <strong className="font-bold text-slate-900">1,400+ Verified Builds</strong> from IIT Delhi, BITS Pilani & DTU engineering labs
              </p>
            </div>
          </div>

          {/* Hero Right Visual / Terminal Card */}
          <div className="lg:col-span-6 relative mt-2 lg:mt-0 w-full">
            
            {/* Mobile Top Badge (Health Score) */}
            <div className="sm:hidden mb-3 bg-white border border-stone-200 shadow-sm rounded-xl p-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-slate-700 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    HEALTH SCORE
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">
                    98 / 100 (A+)
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl bg-stone-100/80 border border-stone-200 p-3 sm:p-6 shadow-sm">
              
              {/* Terminal Code Window */}
              <div className="bg-[#0b132b] rounded-xl overflow-hidden shadow-xl sm:shadow-2xl border border-slate-800">
                {/* Top Control Bar */}
                <div className="bg-[#1c2541] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-slate-700/50">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/90 inline-block"></span>
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/90 inline-block"></span>
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/90 inline-block"></span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 tracking-wider truncate ml-2">
                    &gt;_ CONTAINER_PIPELINE.DOCKERFILE
                  </span>
                </div>

                {/* Code Snippet Body */}
                <div className="p-3 sm:p-6 font-mono text-[11px] sm:text-sm leading-relaxed text-slate-200 overflow-x-auto whitespace-pre sm:whitespace-normal">
                  <div className="text-emerald-400 font-semibold mb-1.5 truncate sm:whitespace-normal">
                    <span className="text-slate-500 mr-2 sm:mr-3">$</span>FROM nvidia/cuda:12.0.0-devel-ubuntu22.04
                  </div>
                  <div className="text-emerald-400 font-semibold mb-1.5 truncate sm:whitespace-normal">
                    <span className="text-slate-500 mr-2 sm:mr-3">$</span>WORKDIR /workspace/nexora
                  </div>
                  <div className="text-slate-400 italic my-2 text-[10px] sm:text-xs">
                    # Inject empirical health telemetry AST auditor
                  </div>
                  <div className="text-emerald-400 font-semibold mb-1.5 truncate sm:whitespace-normal">
                    <span className="text-slate-500 mr-2 sm:mr-3">$</span>RUN cargo build --release --target wasm32-wasi
                  </div>
                  <div className="text-emerald-400 font-semibold truncate sm:whitespace-normal">
                    <span className="text-slate-500 mr-2 sm:mr-3">$</span>CMD ["project-vault", "inspect", "--strict"]
                  </div>
                </div>
              </div>

              {/* Desktop Floating Badge 1: Health Score (Top Right - Hidden on Mobile) */}
              <div className="hidden sm:flex absolute -top-5 -right-4 bg-white border border-stone-200 shadow-lg rounded-xl p-3 px-4 items-center gap-3.5 z-20">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-slate-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    HEALTH SCORE
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    98 / 100 (A+)
                  </div>
                </div>
              </div>

              {/* Desktop Floating Badge 2: Container Latency (Bottom Left - Hidden on Mobile) */}
              <div className="hidden sm:flex absolute -bottom-6 -left-4 bg-white border border-stone-200 shadow-lg rounded-xl p-3 px-4 items-center gap-3.5 z-20">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    CONTAINER TIME
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    0.012s Latency
                  </div>
                </div>
              </div>

            </div>

            {/* Mobile Bottom Badge (Container Latency) */}
            <div className="sm:hidden mt-3 bg-white border border-stone-200 shadow-sm rounded-xl p-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                    CONTAINER TIME
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">
                    0.012s Latency
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
};

export default LandingPage;
