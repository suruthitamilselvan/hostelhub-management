import React from 'react';

export default function Header({
  activeRole,
  setActiveRole,
  isVerified,
  onOpenVerifyModal,
  currentUser,
  onOpenLoginModal
}) {
  const handleSelectRole = (role) => {
    setActiveRole(role);
    setTimeout(() => {
      const workspaceEl = document.getElementById('live-workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <header style={{ width: '100%' }}>
      {/* 1. Main Navbar */}
      <nav className="genius-navbar">
        <div className="genius-logo">
          <div className="genius-logo-cap-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#F5A623">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div className="genius-logo-text-group">
            <div className="genius-logo-title" style={{ fontSize: '20px', fontWeight: 700, color: '#082B5C' }}>
              HostelHub<span style={{ fontSize: '12px', color: '#F5A623', verticalAlign: 'super', marginLeft: '3px' }}>v2.4</span>
            </div>
            <div className="genius-logo-subtitle" style={{ fontSize: '12px', color: '#627D98', fontWeight: 600 }}>Hostel & Residence Maintenance System</div>
          </div>
        </div>

        <ul className="genius-nav-menu">
          <li className={`genius-nav-item ${activeRole === 'student' ? 'active-link' : ''}`} onClick={() => handleSelectRole('student')}>
            STUDENT PORTAL
          </li>
          <li className={`genius-nav-item ${activeRole === 'warden' ? 'active-link' : ''}`} onClick={() => handleSelectRole('warden')}>
            WARDEN DASHBOARD
          </li>
          <li className={`genius-nav-item ${activeRole === 'technician' ? 'active-link' : ''}`} onClick={() => handleSelectRole('technician')}>
            TECHNICIAN WORKSTATION
          </li>
          <li className="genius-nav-item" onClick={() => alert('SLA Resolution Policy Standard Active')}>
            SLA MATRIX
          </li>
          <li className="genius-nav-item" onClick={() => alert('Spare Parts Inventory Logger Active')}>
            SPARE PARTS
          </li>
          <li className="genius-nav-item" onClick={onOpenVerifyModal}>
            BIOMETRICS
          </li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="genius-btn-login-pill" onClick={onOpenLoginModal}>
            {currentUser ? currentUser.name.split(' ')[0] : 'Login / SSO'}
          </button>
          <button className="genius-btn-demo-pill" onClick={() => handleSelectRole(activeRole)}>
            Explore Portals ▾
          </button>
        </div>
      </nav>

      {/* 2. Hero Banner Section */}
      <section className="genius-hero-banner">
        <div className="genius-hero-container">
          <div>
            <h1 className="genius-hero-heading" style={{ fontSize: '42px', fontWeight: 700 }}>
              HostelHub <span style={{ color: '#10B981', background: '#FFFFFF', padding: '2px 12px', borderRadius: '6px' }}>Management System</span>
            </h1>

            <div className="genius-check-group">
              <div className="genius-check-row">
                <svg className="genius-check-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div className="genius-check-body">
                  <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#12D8C7', marginBottom: '3px' }}>
                    Automated 3-Step Student Complaint Intake & SLA Tracking
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: 400, color: '#F5F7FA' }}>
                    Students log room maintenance tickets (Plumbing, Electrical, Carpentry) with instant auto-priority assignment & live 6-stage resolution steppers.
                  </p>
                </div>
              </div>

              <div className="genius-check-row">
                <svg className="genius-check-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div className="genius-check-body">
                  <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#12D8C7', marginBottom: '3px' }}>
                    Warden Console with AI Duplicate Complaint Merging
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: 400, color: '#F5F7FA' }}>
                    Wardens monitor central block intake queues, automatically merge identical room tickets, and dispatch technicians using Strategy Pattern algorithm.
                  </p>
                </div>
              </div>

              <div className="genius-check-row">
                <svg className="genius-check-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div className="genius-check-body">
                  <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#12D8C7', marginBottom: '3px' }}>
                    Technician Workstation & Spare Parts Inventory Costing
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: 400, color: '#F5F7FA' }}>
                    Technicians log line-item spare parts expenses, upload before/after repair photo verification, and sync state in real-time via Observer Pattern.
                  </p>
                </div>
              </div>
            </div>

            <div className="genius-hero-btn-row">
              <button className="btn-hero-white-pill" onClick={() => handleSelectRole('student')}>
                Student Portal
              </button>
              <button className="btn-hero-orange-pill" onClick={() => handleSelectRole('warden')}>
                Warden Console
              </button>
              <button className="btn-hero-white-pill" onClick={() => handleSelectRole('technician')}>
                Technician Hub
              </button>
            </div>
          </div>

          {/* GeniusEdu Exact Diagonal Stack Diamond Graphic */}
          <div className="genius-diamond-container">
            {/* Diagonal Left Stack Node 1: Navy */}
            <div className="diamond-node navy-node" onClick={() => handleSelectRole('student')} style={{ cursor: 'pointer' }}>
              <div className="diamond-node-inner">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                Student Portal
              </div>
            </div>

            {/* Diagonal Left Stack Node 2: Golden Orange */}
            <div className="diamond-node orange-node" onClick={() => handleSelectRole('warden')} style={{ cursor: 'pointer' }}>
              <div className="diamond-node-inner">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                Warden Console
              </div>
            </div>

            {/* Diagonal Left Stack Node 3: Sky Blue (Far Left) */}
            <div className="diamond-node blue-node" onClick={() => handleSelectRole('technician')} style={{ cursor: 'pointer' }}>
              <div className="diamond-node-inner">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                Technician Hub
              </div>
            </div>

            {/* Diagonal Left Stack Node 4: Indigo Purple */}
            <div className="diamond-node purple-node">
              <div className="diamond-node-inner">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                Observer Sync
              </div>
            </div>

            {/* Diagonal Left Stack Node 5: Bright Teal */}
            <div className="diamond-node teal-node" onClick={onOpenVerifyModal} style={{ cursor: 'pointer' }}>
              <div className="diamond-node-inner">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                Face Biometrics
              </div>
            </div>

            {/* Central Main Diamond Card (Right Side) */}
            <div className="diamond-center-card">
              <div className="diamond-center-content">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#F5A623">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                  </svg>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#082B5C', margin: '2px 0' }}>
                  HostelHub<span style={{ color: '#F5A623', fontSize: '11px', verticalAlign: 'super', marginLeft: '2px' }}>v2.4</span>
                </h4>
                <p style={{ fontSize: '11px', color: '#627D98', fontWeight: 600 }}>Hostel Management System Pvt Ltd</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HostelHub System Modules Cards Section */}
      <section className="genius-cards-section">
        <h2 className="genius-signup-banner-title" style={{ fontSize: '30px', fontWeight: 400, color: '#082B5C', letterSpacing: '0.04em' }}>HOSTELHUB SYSTEM MODULES</h2>

        <div className="genius-cards-grid-3">
          <div className="genius-feature-card" onClick={() => handleSelectRole('student')}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#082B5C' }}>Student Residence Portal</h3>
            <ul className="genius-card-bullet-list">
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span> 3-Step Verified Complaint Ticket Intake
              </li>
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span> Auto-Priority (Electrical Safety High Tag)
              </li>
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span> 6-Stage Resolution Timeline Stepper
              </li>
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span> Live Chat Channel with Assigned Technician
              </li>
            </ul>
          </div>

          <div className="genius-feature-card" onClick={() => handleSelectRole('warden')}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#082B5C' }}>Warden Administration Console</h3>
            <p style={{ fontSize: '16px', color: '#627D98', marginBottom: '1rem', fontWeight: 400 }}>
              Central oversight and maintenance SLA enforcement for hostel residence blocks:
            </p>
            <ul className="genius-card-bullet-list">
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span> <strong>AI Duplicate Merge:</strong> Merge ticket clusters
              </li>
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </span> <strong>Auto Dispatch:</strong> Least-Loaded technician strategy
              </li>
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </span> <strong>Analytics:</strong> Recurring issue category breakdown
              </li>
            </ul>
          </div>

          <div className="genius-feature-card" onClick={() => handleSelectRole('technician')}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#082B5C' }}>Technician Workstation & Spare Parts</h3>
            <p style={{ fontSize: '16px', color: '#627D98', marginBottom: '0.75rem', fontWeight: 400 }}>
              Mobile task execution hub for on-site hostel repair staff:
            </p>
            <ul className="genius-card-bullet-list">
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </span> <strong>Inventory Costing:</strong> Line-item parts logging
              </li>
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </span> <strong>Photo Proof:</strong> Before & After repair upload
              </li>
              <li>
                <span className="check-icon" style={{ color: '#12D8C7', display: 'inline-flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </span> <strong>Live Sync:</strong> Observer pattern backend sync
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Role Switcher Control Strip Right Above Interactive Workstation */}
      <div className="role-switcher-banner-strip" style={{ background: '#082B5C' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '18px', fontWeight: 400, color: '#12D8C7', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#12D8C7" strokeWidth="2">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"/>
            </svg>
            LIVE INTERACTIVE WORKSPACE
          </div>
          <span className="badge" style={{ background: '#F5A623', color: 'white', fontSize: '12px', padding: '4px 10px', fontWeight: 500, letterSpacing: '0.03em' }}>
            {activeRole.toUpperCase()} VIEW ACTIVE
          </span>
        </div>

        <div className="header-role-switcher" style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px', borderRadius: '6px' }}>
          <button
            className={`role-tab-btn ${activeRole === 'student' ? 'active' : ''}`}
            style={{
              padding: '8px 18px',
              fontSize: '15px',
              fontWeight: 400,
              borderRadius: '4px',
              background: activeRole === 'student' ? '#F5A623' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => handleSelectRole('student')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Student Portal
          </button>
          <button
            className={`role-tab-btn ${activeRole === 'warden' ? 'active' : ''}`}
            style={{
              padding: '8px 18px',
              fontSize: '15px',
              fontWeight: 400,
              borderRadius: '4px',
              background: activeRole === 'warden' ? '#F5A623' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => handleSelectRole('warden')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Warden Dashboard
          </button>
          <button
            className={`role-tab-btn ${activeRole === 'technician' ? 'active' : ''}`}
            style={{
              padding: '8px 18px',
              fontSize: '15px',
              fontWeight: 400,
              borderRadius: '4px',
              background: activeRole === 'technician' ? '#F5A623' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => handleSelectRole('technician')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            Technician Workstation
          </button>
        </div>

        <button
          className={`biometric-btn ${isVerified ? 'verified' : ''}`}
          onClick={onOpenVerifyModal}
          style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600, borderRadius: '4px', background: '#FFFFFF', color: '#082B5C', border: '1px solid #082B5C', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          {isVerified ? 'Face Verified' : 'Face Biometrics'}
        </button>
      </div>

      {/* 5. Floating Bottom Right Contact Button */}
      <button className="floating-contact-widget" onClick={() => alert('HostelHub Support Desk: Call 1800-HOSTEL-ERP or email support@hostelhub.com')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        HostelHub Support Desk
      </button>
    </header>
  );
}
