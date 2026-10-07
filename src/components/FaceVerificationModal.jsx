import React, { useState } from 'react';

export default function FaceVerificationModal({ isOpen, onClose, onVerifySuccess }) {
  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Position your face inside the green guide oval.');
  const [vectorSample, setVectorSample] = useState(null);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setScanning(true);
    setStatusMsg('Extracting 128D Face Embedding vector...');

    setTimeout(() => {
      setVectorSample('[0.1248, -0.4512, 0.8819, 0.0412, 0.3129, -0.0914, 0.7712, ...]');
      setStatusMsg('Comparing against registered student database...');
    }, 1200);

    setTimeout(() => {
      setScanning(false);
      setStatusMsg('Identity Verified! IP Checked: 192.168.1.42 (Hostel Block B Wi-Fi).');
      onVerifySuccess();
    }, 2500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-title">Face Identity Verification</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
          HostelHub biometrics checks your live face embedding vector against your registered profile and verifies your device is connected to hostel Wi-Fi.
        </p>

        <div className="cam-preview-box">
          <div className="cam-face-oval">
            {scanning && <div className="scan-laser-line"></div>}
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Status:</div>
          <div style={{ color: scanning ? '#082B5C' : '#334155', fontWeight: 600 }}>{statusMsg}</div>
          {vectorSample && (
            <div style={{ marginTop: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#059669', wordBreak: 'break-all' }}>
              Vector: {vectorSample}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn-action" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={handleStartScan} disabled={scanning}>
            {scanning ? 'Scanning...' : 'Start Face Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}
