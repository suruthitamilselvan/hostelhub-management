import React from 'react';

export default function AccessDeniedModal({
  isOpen,
  onClose,
  targetRole,
  currentUser,
  onSwitchAccount
}) {
  if (!isOpen) return null;

  const targetRoleName = targetRole === 'warden' ? 'Warden Administration Console' : targetRole === 'technician' ? 'Technician Workstation' : 'Student Residence Portal';
  const currentRoleName = currentUser?.role === 'warden' ? 'Chief Warden' : currentUser?.role === 'technician' ? 'Technician' : 'Student';

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid #FEE2E2', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem', color: '#991B1B' }}>Access Restricted (Role Guard)</h3>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Hostel Security & Data Protection Policy</div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div style={{ padding: '1.25rem 0' }}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991B1B', marginBottom: '4px' }}>
              🚫 Permission Denied
            </div>
            <div style={{ fontSize: '0.82rem', color: '#B91C1C', lineHeight: 1.5 }}>
              You are currently signed in as <strong>{currentRoleName} ({currentUser?.name || 'User'})</strong>. Your role is not authorized to access the <strong>{targetRoleName}</strong>.
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, color: '#082B5C', marginBottom: '3px' }}>Authorization Rules:</div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              <li><strong>Students:</strong> Access restricted to room maintenance & personal complaints.</li>
              <li><strong>Wardens:</strong> Access restricted to administrative oversight & duplicate complaint triage.</li>
              <li><strong>Technicians:</strong> Access restricted to job queue & material cost logging.</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
          <button
            type="button"
            className="btn-action"
            onClick={onClose}
          >
            Stay in My Portal
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto', background: '#082B5C' }}
            onClick={() => {
              onClose();
              if (onSwitchAccount) onSwitchAccount(targetRole);
            }}
          >
            Switch Account / Sign In as {targetRole === 'warden' ? 'Warden' : targetRole === 'technician' ? 'Technician' : 'Student'} ➔
          </button>
        </div>
      </div>
    </div>
  );
}
