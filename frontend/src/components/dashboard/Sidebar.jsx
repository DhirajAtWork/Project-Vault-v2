import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FolderKanban, 
  Search, 
  User, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  BarChart3,
  Briefcase
} from 'lucide-react';
import { logoutUserApi } from '../../api/authApi';

/**
 * Sidebar component supporting conditional navigation links based on user accountType:
 * - Student: Home, Projects, Analytics, Profile
 * - Recruiter: Home, Visit Projects, Profile (3 links)
 */
const Sidebar = ({ user, activeRole, onRoleChange, isMobile = false }) => {
  const navigate = useNavigate();
  const accountType = activeRole || user?.accountType || 'recruiter';

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } catch (err) {
      console.warn('Logout API fallback:', err.message);
    } finally {
      navigate('/signin');
    }
  };

  const getNavItems = () => {
    const items = [
      {
        id: 'home',
        label: 'Home',
        path: '/dashboard',
        icon: Home,
        exact: true,
      },
    ];

    if (accountType === 'student') {
      items.push({
        id: 'projects',
        label: 'Projects',
        path: '/dashboard/projects',
        icon: FolderKanban,
      });
      items.push({
        id: 'analytics',
        label: 'Analytics',
        path: '/dashboard/analytics',
        icon: BarChart3,
      });
    }

    if (accountType === 'recruiter') {
      items.push({
        id: 'visit-projects',
        label: 'Visit Projects',
        path: '/dashboard/visit-projects',
        icon: Search,
      });
    }

    items.push({
      id: 'profile',
      label: 'Profile',
      path: '/dashboard/profile',
      icon: User,
    });

    return items;
  };

  const navItems = getNavItems();
  const userName = user?.name || (accountType === 'recruiter' ? 'Pooja Deshmukh' : 'Aarav Sharma');
  const userAvatar = user?.avatar || '';

  // Mobile Top Navigation Tabs with Right-Aligned Logout Icon
  if (isMobile) {
    return (
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-3 py-2 sticky top-0 z-40 md:hidden font-sans shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile Role Switcher Pill */}
          <button
            type="button"
            onClick={() => onRoleChange && onRoleChange(accountType === 'recruiter' ? 'student' : 'recruiter')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              accountType === 'recruiter'
                ? 'bg-purple-50 text-purple-800 border-purple-200 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
            }`}
            title={`Switch to ${accountType === 'recruiter' ? 'Student' : 'Recruiter'} View`}
          >
            {accountType === 'recruiter' ? (
              <Briefcase className="w-3 h-3 text-purple-600" />
            ) : (
              <User className="w-3 h-3 text-emerald-600" />
            )}
            <span className="capitalize">{accountType}</span>
          </button>

          {/* Mobile Horizontal Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? accountType === 'recruiter'
                          ? 'bg-purple-700 text-white shadow-sm font-bold'
                          : 'bg-slate-900 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right-aligned Logout Icon Button */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className="w-8 h-8 flex-shrink-0 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-500/20 transition-all flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </header>
    );
  }

  // Desktop Vertical Sidebar (Light Theme)
  return (
    <aside className="w-56 sm:w-60 md:w-64 lg:w-72 flex-shrink-0 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0 font-sans text-slate-800 shadow-sm z-30 overflow-hidden">
      {/* 1. Header / Logo Branding */}
      <div className="px-4 py-4 sm:px-5 sm:py-5 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 ${
            accountType === 'recruiter' ? 'bg-gradient-to-tr from-purple-700 to-indigo-600' : 'bg-slate-900'
          } rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md font-brand tracking-wider shrink-0`}>
            PV
          </div>
          <div className="min-w-0">
            <span className="font-black text-slate-900 text-xs sm:text-xs md:text-[13px] lg:text-sm tracking-tight font-brand whitespace-nowrap uppercase truncate block">
              PROJECT VAULT
            </span>
            <span className={`text-[9px] font-extrabold uppercase tracking-widest ${
              accountType === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'
            }`}>
              {accountType} Workspace
            </span>
          </div>
        </div>
      </div>

      {/* 2. Workspace Mode Switcher (Student vs Recruiter) */}
      <div className="px-3 pt-3.5">
        <div className="flex items-center p-1 bg-stone-100/90 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => onRoleChange && onRoleChange('student')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              accountType === 'student'
                ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange && onRoleChange('recruiter')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              accountType === 'recruiter'
                ? 'bg-white text-purple-800 shadow-xs border border-stone-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
            <span>Recruiter</span>
          </button>
        </div>
      </div>

      {/* 3. Navigation Section */}
      <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4 overflow-y-auto space-y-1">
        <div className="px-2 mb-2">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
        </div>

        <nav className="space-y-1 sm:space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium text-[11px] sm:text-xs md:text-[13px] transition-all group ${
                    isActive
                      ? accountType === 'recruiter'
                        ? 'bg-purple-700 text-white shadow-md font-semibold'
                        : 'bg-slate-900 text-white shadow-md font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 4. Bottom Footer User Card & Custom Red Logout Button */}
      <div className="p-3 m-3 sm:p-3.5 sm:m-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          {/* Left User Profile Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-stone-300 overflow-hidden ${
                accountType === 'recruiter' ? 'bg-gradient-to-tr from-purple-700 to-indigo-600' : 'bg-slate-900'
              } text-white flex items-center justify-center font-extrabold text-[11px] shadow-sm`}>
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className={`absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 ${
                accountType === 'recruiter' ? 'bg-purple-500' : 'bg-emerald-500'
              } border-2 border-white rounded-full`} />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-[10px] sm:text-[11px] lg:text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                <span className="truncate">{userName}</span>
                <ShieldCheck className={`w-3 h-3 ${accountType === 'recruiter' ? 'text-purple-600' : 'text-emerald-600'} flex-shrink-0`} />
              </h4>
              <p className={`text-[9px] sm:text-[10px] font-bold capitalize truncate ${
                accountType === 'recruiter' ? 'text-purple-700' : 'text-slate-500'
              }`}>
                {accountType}
              </p>
            </div>
          </div>

          {/* Custom Red Logout Icon Button matching reference image */}
          <button
            onClick={handleLogout}
            title="Logout of Project Vault"
            aria-label="Logout"
            className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center shadow-sm group active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
