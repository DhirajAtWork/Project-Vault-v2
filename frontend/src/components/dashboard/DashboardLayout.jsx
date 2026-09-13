import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import RoleSelectionModal from './RoleSelectionModal';
import { getCurrentUserApi } from '../../api/authApi';

/**
 * Dashboard Layout shell component rendering sidebar tabs automatically based on database user.accountType
 */
const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleModalDismissed, setRoleModalDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const data = await getCurrentUserApi();
        if (data?.user) {
          if (isMounted) {
            setUser(data.user);
            const userRole = data.user.accountType === 'recruiter' ? 'recruiter' : 'student';
            localStorage.setItem('vault_role', userRole);
          }
        } else {
          throw new Error('No user returned');
        }
      } catch (err) {
        console.warn('Authentication check failed or no session found:', err.message);
        if (isMounted) {
          navigate('/signin');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const currentRole = user?.accountType === 'recruiter' ? 'recruiter' : 'student';

  const isRolePromptOpen = Boolean(
    !roleModalDismissed &&
    user &&
    (user.roleSelected === false || location.search.includes('onboarding=select-role'))
  );

  const handleRoleSelected = (updatedUser) => {
    setUser(updatedUser);
    setRoleModalDismissed(true);
    const userRole = updatedUser.accountType === 'recruiter' ? 'recruiter' : 'student';
    localStorage.setItem('vault_role', userRole);
    if (location.search.includes('onboarding=select-role')) {
      navigate(location.pathname, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] bg-grid-pattern flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 animate-spin flex items-center justify-center font-bold text-white shadow-md">
            PV
          </div>
          <p className="text-slate-600 text-sm font-medium animate-pulse">Loading Project Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f7f7f2] bg-grid-pattern text-slate-900 font-sans flex flex-col md:flex-row antialiased ${
      currentRole === 'recruiter' ? 'selection:bg-purple-100 selection:text-purple-900' : 'selection:bg-emerald-100 selection:text-emerald-900'
    } print:bg-white print:p-0 print:m-0`}>
      {/* Role Selection Onboarding Modal for OAuth / Unconfirmed accounts */}
      <RoleSelectionModal
        isOpen={isRolePromptOpen}
        user={user}
        onRoleSelected={handleRoleSelected}
      />

      {/* Mobile Top Header Navigation */}
      <div className="print:hidden">
        <Sidebar user={user} isMobile={true} />
      </div>

      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden md:block print:hidden">
        <Sidebar user={user} isMobile={false} />
      </div>

      {/* Main Dynamic Nested Route Content Area (<Outlet />) */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 min-w-0 print:p-0 print:m-0 print:overflow-visible">
        <div className="max-w-6xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
          <Outlet context={{ user, setUser, accountType: currentRole }} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
