import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [loginRole, setLoginRole] = useState('student');
  const [email, setEmail] = useState('suruthi@hostel.edu');
  const [password, setPassword] = useState('password123');
  const [captchaInput, setCaptchaInput] = useState('7B29X');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = (role) => {
    setLoginRole(role);
    setErrorMsg('');
    if (role === 'student') {
      setEmail('suruthi@hostel.edu');
      setPassword('password123');
    } else if (role === 'warden') {
      setEmail('lakshmi@hostel.edu');
      setPassword('admin123');
    } else {
      setEmail('anand@hostel.edu');
      setPassword('tech123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        id: loginRole === 'student' ? 1 : loginRole === 'warden' ? 2 : 3,
        role: loginRole,
        email,
        name: loginRole === 'student' ? 'Suruthi T.' : loginRole === 'warden' ? 'Dr. Lakshmi V.' : 'Anand Pillai'
      });
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title" style={{ fontSize: '1.25rem' }}>HostelHub ERP Login</h3>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Single Sign-On Access Control System</div>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {/* Role Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '9999px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`role-btn ${loginRole === 'student' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '6px 8px', justifyContent: 'center' }}
            onClick={() => handleRoleChange('student')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Student
          </button>
          <button
            type="button"
            className={`role-btn ${loginRole === 'warden' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '6px 8px', justifyContent: 'center' }}
            onClick={() => handleRoleChange('warden')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Warden
          </button>
          <button
            type="button"
            className={`role-btn ${loginRole === 'technician' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '6px 8px', justifyContent: 'center' }}
            onClick={() => handleRoleChange('technician')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            Technician
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label>{loginRole === 'student' ? 'Student Email / Registration No.' : loginRole === 'warden' ? 'Warden Email ID' : 'Technician Employee ID / Email'}</label>
            <input
              type="text"
              className="form-control"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {/* Security Captcha Code */}
          <div className="form-group">
            <label>Security Captcha Code</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ background: '#082B5C', color: '#12D8C7', padding: '6px 14px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.15em', fontSize: '16px', fontFamily: 'monospace', userSelect: 'none' }}>
                7B29X
              </div>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Enter Code"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn-action" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
