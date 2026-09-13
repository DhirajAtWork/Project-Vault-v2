import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoToLanding = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden selection:bg-blue-100">
      
      {/* Top Blue Accent Line */}
      <div className="w-full h-1.5 bg-[#2563eb] fixed top-0 left-0 z-50"></div>

      <div className="max-w-xl w-full flex flex-col items-center justify-center text-center relative py-12">
        
        {/* Graphic & 404 Section */}
        <div className="relative flex flex-col items-center justify-center mb-6">
          
          {/* Sad Paper Character (Tilted on Left for Desktop) */}
          <div className="absolute -left-16 sm:-left-24 bottom-2 transform -rotate-12 select-none pointer-events-none hidden sm:block">
            <svg width="110" height="110" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="92" rx="35" ry="4" fill="#e2e8f0" />
              <path d="M20 15 H65 L85 35 V85 H20 Z" fill="#f8fafc" stroke="#1c2541" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M65 15 V35 H85" fill="#e2e8f0" stroke="#1c2541" strokeWidth="3.5" strokeLinejoin="round" />
              <circle cx="38" cy="55" r="3.5" fill="#1c2541" />
              <circle cx="62" cy="55" r="3.5" fill="#1c2541" />
              <path d="M32 46 L44 50" stroke="#1c2541" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M68 46 L56 50" stroke="#1c2541" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M40 72 Q50 64 60 72" stroke="#1c2541" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* Sad Paper Character (Mobile) */}
          <div className="sm:hidden mb-4 transform -rotate-6 select-none pointer-events-none">
            <svg width="85" height="85" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 15 H65 L85 35 V85 H20 Z" fill="#f8fafc" stroke="#1c2541" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M65 15 V35 H85" fill="#e2e8f0" stroke="#1c2541" strokeWidth="3.5" strokeLinejoin="round" />
              <circle cx="38" cy="55" r="3.5" fill="#1c2541" />
              <circle cx="62" cy="55" r="3.5" fill="#1c2541" />
              <path d="M32 46 L44 50" stroke="#1c2541" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M68 46 L56 50" stroke="#1c2541" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M40 72 Q50 64 60 72" stroke="#1c2541" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* Big 404 Heading */}
          <h1 className="text-8xl sm:text-[140px] font-black text-[#1c2541] tracking-tight leading-none select-none">
            404
          </h1>

          {/* Page Not Found Subtitle */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c2541] tracking-tight mt-2">
            Page Not Found
          </h2>
        </div>

        {/* Subtitle / Description */}
        <p className="text-slate-500 max-w-md text-base sm:text-lg leading-relaxed mb-8">
          The page or resource you are looking for doesn't exist or has been moved.
        </p>

        {/* Single Navigation Button */}
        <button
          onClick={handleGoToLanding}
          className="bg-[#059669] hover:bg-[#047857] text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Back to Landing Page</span>
        </button>
      </div>

    </div>
  );
};

export default NotFoundPage;
