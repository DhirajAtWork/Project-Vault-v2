import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getCurrentUserApi } from '../../api/authApi';

/**
 * Dashboard Layout shell component rendering sidebar tabs automatically based on database user.accountType
 */
const mockStudentUser = {
  _id: 'mock_student_123',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@iitd.ac.in',
  accountType: 'student',
  headline: 'Full-Stack Software Engineer & AI Systems Researcher',
  location: 'New Delhi, India',
  phone: '+91 98765 43210',
  bio: 'Final-year Computer Science undergraduate at IIT Delhi building distributed backends, developer tools, and machine learning infrastructure.',
  avatar: '',
  socialLinks: {
    github: 'https://github.com/aaravsharma-dev',
    linkedin: 'https://linkedin.com/in/aaravsharma-iitd',
    website: 'https://aaravsharma.dev',
  },
  education: [
    {
      institution: 'Indian Institute of Technology Delhi (IIT Delhi)',
      degree: 'B.Tech in Computer Science and Engineering',
      startYear: '2021',
      endYear: '2025',
      gpa: '9.4 / 10.0',
    },
    {
      institution: 'Delhi Public School, R.K. Puram',
      degree: 'Higher Secondary Certificate (CBSE Class XII)',
      startYear: '2019',
      endYear: '2021',
      gpa: '97.6%',
    },
  ],
  experience: [
    {
      company: 'Razorpay',
      role: 'Software Development Engineer Intern',
      duration: 'May 2024 - Jul 2024',
      startDate: 'May 2024',
      endDate: 'Jul 2024',
      current: false,
      location: 'Bengaluru, India',
      description: 'Engineered high-throughput webhook dispatch pipelines handling 15,000+ RPS with 99.99% reliability using Go and Apache Kafka.',
    },
    {
      company: 'Infosys Innovation Labs',
      role: 'Research & Systems Engineering Intern',
      duration: 'Dec 2023 - Jan 2024',
      startDate: 'Dec 2023',
      endDate: 'Jan 2024',
      current: false,
      location: 'Bengaluru, India',
      description: 'Benchmarked containerized microservices and automated Docker container health audits with sub-millisecond latency.',
    },
  ],
  skills: {
    languages: ['TypeScript', 'JavaScript', 'Go', 'Python', 'C++', 'SQL'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express.js', 'FastAPI', 'TailwindCSS'],
    tools: ['Docker', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'Git', 'Linux'],
  },
  certifications: [
    {
      title: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services (AWS)',
      issueDate: '2024',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      title: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: '2023',
      credentialUrl: 'https://www.cncf.io/certification/cka/',
    },
  ],
};

const mockRecruiterUser = {
  _id: 'mock_recruiter_123',
  name: 'Pooja Deshmukh',
  email: 'pooja.deshmukh@razorpay.com',
  accountType: 'recruiter',
  company: 'Razorpay / Infosys Talent Labs',
  headline: 'Director of Technical Talent & University Relations',
  location: 'Bengaluru, Karnataka, India',
  phone: '+91 98450 12345',
  bio: 'Leading technical recruitment, engineering campus partnerships, and top talent discovery across premier Indian universities including IITs, BITS, and NITs.',
  avatar: '',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/poojadeshmukh-talent',
    website: 'https://razorpay.com/careers',
  },
  education: [
    {
      institution: 'Symbiosis Institute of Business Management (SIBM Pune)',
      degree: 'MBA in Human Resources & Talent Strategy',
      startYear: '2015',
      endYear: '2017',
      gpa: '3.8 / 4.0',
    },
  ],
  experience: [
    {
      company: 'Razorpay',
      role: 'Director of Talent Acquisition',
      duration: '2023 - Present',
      startDate: '2023',
      endDate: 'Present',
      current: true,
      location: 'Bengaluru, India',
      description: 'Overseeing pan-India hiring for core distributed systems, cloud platform infrastructure, and product engineering teams.',
    },
    {
      company: 'Infosys Innovation Labs',
      role: 'Senior Lead Technical Recruiter',
      duration: '2019 - 2023',
      startDate: '2019',
      endDate: '2023',
      current: false,
      location: 'Bengaluru, India',
      description: 'Spearheaded engineering leadership searches and annual campus hackathon recruitment programs across India.',
    },
  ],
  skills: {
    languages: ['Go', 'TypeScript', 'Java', 'Python', 'C++'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Distributed Systems', 'Microservices'],
    tools: ['Docker', 'Kubernetes', 'AWS Cloud', 'PostgreSQL', 'System Design'],
  },
  certifications: [
    {
      title: 'Talent Acquisition Certified Strategist (SHRM-SCP)',
      issuer: 'SHRM Global',
      issueDate: '2022',
      credentialUrl: 'https://shrm.org',
    },
  ],
};

/**
 * Dashboard Layout shell component rendering sidebar tabs automatically based on database user.accountType
 */
const DashboardLayout = () => {
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('vault_role') || 'recruiter';
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUserApi();
        if (data?.user) {
          setUser(data.user);
          const userRole = data.user.accountType === 'recruiter' ? 'recruiter' : 'student';
          setActiveRole(userRole);
          localStorage.setItem('vault_role', userRole);
        } else {
          throw new Error('No user returned');
        }
      } catch (err) {
        // Fallback profile matching the active saved role
        const savedRole = localStorage.getItem('vault_role') || activeRole || 'recruiter';
        setUser(savedRole === 'recruiter' ? mockRecruiterUser : mockStudentUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('vault_role', newRole);
    setUser(newRole === 'recruiter' ? mockRecruiterUser : mockStudentUser);
  };

  const currentRole = activeRole || (user?.accountType === 'recruiter' ? 'recruiter' : 'student');

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
      {/* Mobile Top Header Navigation */}
      <div className="print:hidden">
        <Sidebar user={user} activeRole={currentRole} onRoleChange={handleRoleChange} isMobile={true} />
      </div>

      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden md:block print:hidden">
        <Sidebar user={user} activeRole={currentRole} onRoleChange={handleRoleChange} isMobile={false} />
      </div>

      {/* Main Dynamic Nested Route Content Area (<Outlet />) */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 min-w-0 print:p-0 print:m-0 print:overflow-visible">
        <div className="max-w-6xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
          <Outlet context={{ user, setUser, activeRole: currentRole, onRoleChange: handleRoleChange }} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
