import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';

const sampleStudents = [
  { id: 1, name: 'Suruthi T.', email: 'suruthi@hostel.edu', regNo: '21CS042', block: 'Block B', room: '204' },
  { id: 8, name: 'Sahana V.', email: 'sahana@hostel.edu', regNo: '21CS038', block: 'Block B', room: '205' },
  { id: 9, name: 'Rithika S.', email: 'rithika@hostel.edu', regNo: '21CS045', block: 'Block B', room: '206' },
  { id: 10, name: 'Pavana K.', email: 'pavana@hostel.edu', regNo: '21CS032', block: 'Block A', room: '102' }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialRole = 'student' }) {
  const [loginRole, setLoginRole] = useState(initialRole || 'student');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('suruthi@hostel.edu');
  const [email, setEmail] = useState('suruthi@hostel.edu');
  const [password, setPassword] = useState('password123');
  const [captchaInput, setCaptchaInput] = useState('7B29X');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && initialRole) {
      handleRoleChange(initialRole);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleRoleChange = (role) => {
    setLoginRole(role);
    setErrorMsg('');
    if (role === 'student') {
      setEmail(selectedStudentEmail);
      setPassword('password123');
    } else if (role === 'warden') {
      setEmail('lakshmi@hostel.edu');
      setPassword('admin123');
    } else {
      setEmail('anand@hostel.edu');
      setPassword('tech123');
    }
  };

  const handleSelectStudent = (st) => {
    setSelectedStudentEmail(st.email);
    setEmail(st.email);
    setPassword('password123');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const apiUser = await apiService.login(email, password);

      if (loginRole === 'student') {
        const studentMeta = sampleStudents.find(s => s.email.toLowerCase() === email.toLowerCase()) || sampleStudents[0];
        onLoginSuccess({
          id: apiUser?.id || studentMeta.id,
          role: 'student',
          email: apiUser?.email || email,
          name: apiUser?.name || studentMeta.name,
          regNo: studentMeta.regNo,
          block: studentMeta.block,
          room: studentMeta.room,
          hasFaceEnrolled: apiUser?.hasFaceEnrolled || false
        });
      } else if (loginRole === 'warden') {
        onLoginSuccess({
          id: apiUser?.id || 2,
          role: 'warden',
          email: apiUser?.email || email,
          name: apiUser?.name || 'Dr. Lakshmi V.',
          hasFaceEnrolled: apiUser?.hasFaceEnrolled || false
        });
      } else {
        onLoginSuccess({
          id: apiUser?.id || 3,
          role: 'technician',
          email: apiUser?.email || email,
          name: apiUser?.name || 'Anand Pillai',
          hasFaceEnrolled: apiUser?.hasFaceEnrolled || false
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Login failed. Please check credentials.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '480px' }}>
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

        {/* Student Quick Select Switcher */}
        {loginRole === 'student' && (
          <div style={{ marginBottom: '1.25rem', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Select Student Account:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {sampleStudents.map(st => {
                const isSelected = email.toLowerCase() === st.email.toLowerCase();
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStudent(st)}
                    style={{
                      background: isSelected ? '#082B5C' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#1E293B',
                      border: `1px solid ${isSelected ? '#082B5C' : '#CBD5E1'}`,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{st.name}</div>
                    <div style={{ fontSize: '0.68rem', color: isSelected ? '#93C5FD' : '#64748B' }}>{st.email}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label>{loginRole === 'student' ? 'Student Email' : loginRole === 'warden' ? 'Warden Email ID' : 'Technician Email ID'}</label>
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
