import React from 'react';

const renderIcon = (type) => {
  switch (type) {
    case 'dashboard':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" rx="1"/>
          <rect x="14" y="3" width="7" height="5" rx="1"/>
          <rect x="14" y="12" width="7" height="9" rx="1"/>
          <rect x="3" y="16" width="7" height="5" rx="1"/>
        </svg>
      );
    case 'new-complaint':
    case 'plus':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      );
    case 'my-complaints':
    case 'all-complaints':
    case 'my-tasks':
    case 'list':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      );
    case 'chat':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      );
    case 'notifications':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      );
    case 'profile':
    case 'users':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    case 'assign-technician':
    case 'parts-cost':
    case 'wrench':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      );
    case 'technicians':
    case 'people':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M9 21v-2a4 4 0 0 1 3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
      );
    case 'recurring-issues':
    case 'update-status':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      );
    case 'analytics':
    case 'performance':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      );
    case 'settings':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      );
    case 'logout':
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      );
  }
};

export default function Sidebar({ activeRole, activeTab, setActiveTab, onLogout, currentUser, isVerified }) {
  const getNavItems = () => {
    if (activeRole === 'student') {
      return [
        { id: 'dashboard', label: isVerified ? 'Dashboard' : 'Portal Lock 🔒' },
        { id: 'new-complaint', label: isVerified ? 'New Complaint' : 'New Complaint 🔒' },
        { id: 'my-complaints', label: isVerified ? 'My Complaints' : 'My Complaints 🔒' },
        { id: 'chat', label: 'Chat' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'profile', label: 'Profile' },
      ];
    } else if (activeRole === 'warden') {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'all-complaints', label: 'All Complaints' },
        { id: 'assign-technician', label: 'Assign Technician' },
        { id: 'technicians', label: 'Technicians' },
        { id: 'recurring-issues', label: 'Recurring Issues' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'users', label: 'Users' },
        { id: 'settings', label: 'Settings' },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'my-tasks', label: 'My Tasks' },
        { id: 'update-status', label: 'Update Status' },
        { id: 'parts-cost', label: 'Parts & Cost' },
        { id: 'chat', label: 'Chat' },
        { id: 'performance', label: 'Performance' },
        { id: 'profile', label: 'Profile' },
      ];
    }
  };

  const navItems = getNavItems();

  const getRoleTitle = () => {
    if (activeRole === 'student') return 'Student Portal';
    if (activeRole === 'warden') return 'Warden Portal';
    return 'Technician Portal';
  };

  return (
    <aside className="erp-sidebar">
      {/* Prominent Left Corner Header Badge */}
      <div className="sidebar-role-badge">
        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#12D8C7', fontWeight: 400 }}>
          ROLE PORTAL
        </div>
        <div style={{ fontSize: '19px', fontWeight: 400, color: '#FFFFFF', marginTop: '3px', lineHeight: 1.2 }}>
          {getRoleTitle()}
        </div>
        {activeRole === 'student' && (
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: isVerified ? '#10B981' : '#F5A623', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isVerified ? '#10B981' : '#F5A623', display: 'inline-block' }}></span>
            {isVerified ? 'Biometrics Verified ✓' : 'Face Scan Required'}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="sidebar-icon">{renderIcon(item.id)}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 600, marginBottom: '10px' }}>
          {currentUser ? currentUser.name : activeRole === 'student' ? 'Suruthi T. (21CS042)' : activeRole === 'warden' ? 'Dr. Lakshmi V. (Warden)' : 'Anand Pillai (Technician)'}
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <span className="sidebar-icon">{renderIcon('logout')}</span> Logout
        </button>
      </div>
    </aside>
  );
}
