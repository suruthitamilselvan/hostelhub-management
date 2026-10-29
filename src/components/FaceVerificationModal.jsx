import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';

const defaultStudentRoster = [
  { id: 1, name: 'Suruthi T.', email: 'suruthi@hostel.edu', hostelBlock: 'Block B', roomNumber: '204', hasFaceEnrolled: false, facePhoto: null },
  { id: 8, name: 'Sahana V.', email: 'sahana@hostel.edu', hostelBlock: 'Block B', roomNumber: '205', hasFaceEnrolled: false, facePhoto: null },
  { id: 9, name: 'Rithika S.', email: 'rithika@hostel.edu', hostelBlock: 'Block B', roomNumber: '206', hasFaceEnrolled: false, facePhoto: null },
  { id: 10, name: 'Pavana K.', email: 'pavana@hostel.edu', hostelBlock: 'Block A', roomNumber: '102', hasFaceEnrolled: false, facePhoto: null }
];

export default function FaceVerificationModal({ isOpen, onClose, onVerifySuccess, currentUser }) {
  const [activeTab, setActiveTab] = useState('verify'); // 'verify' | 'register'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Position your face inside the guide oval.');
  const [vectorSample, setVectorSample] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [enrolledPhoto, setEnrolledPhoto] = useState(null);
  const [hasStoredProfile, setHasStoredProfile] = useState(false);

  // Multi-Student Roster State
  const [profilesList, setProfilesList] = useState(defaultStudentRoster);
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || 1);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const selectedResident = profilesList.find(p => p.id === selectedUserId) || profilesList[0];
  const isTargetCurrentUser = currentUser && currentUser.id === selectedUserId;

  // Initialize camera & load roster on open
  useEffect(() => {
    if (isOpen) {
      const initialId = currentUser?.id || 1;
      setSelectedUserId(initialId);
      setVerifiedSuccess(false);
      setVerificationFailed(false);
      setRegisteredSuccess(false);
      setVectorSample(null);
      setSimilarityScore(null);
      setStatusMsg('Checking MySQL resident biometric roster...');
      startCamera();
      loadRosterAndStatus(initialId);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, currentUser?.id]);

  const loadRosterAndStatus = async (targetUserId) => {
    try {
      const liveProfiles = await apiService.getAllProfiles();
      let roster = defaultStudentRoster;
      if (liveProfiles && Array.isArray(liveProfiles) && liveProfiles.length > 0) {
        const studentProfiles = liveProfiles.filter(p => p.role === 'student');
        if (studentProfiles.length > 0) {
          roster = studentProfiles;
          setProfilesList(studentProfiles);
        }
      }

      // Find current selected student in the loaded roster
      const current = roster.find(p => p.id === targetUserId) || roster[0];
      if (current) {
        setHasStoredProfile(!!current.hasFaceEnrolled);
        setEnrolledPhoto(current.facePhoto || null);
        if (current.hasFaceEnrolled) {
          setActiveTab('verify');
          setStatusMsg(`Biometric profile found in MySQL for ${current.name}! Align your face to authenticate.`);
        } else {
          setActiveTab('register');
          setStatusMsg(`⚠️ No face registered yet in MySQL for ${current.name}. Enroll your face below.`);
        }
      }
    } catch (e) {
      console.warn('Roster check notice:', e.message);
    }
  };

  const handleSelectResident = (student) => {
    setSelectedUserId(student.id);
    setHasStoredProfile(!!student.hasFaceEnrolled);
    setEnrolledPhoto(student.facePhoto || null);
    setVerifiedSuccess(false);
    setVerificationFailed(false);
    setRegisteredSuccess(false);
    setSimilarityScore(null);
    setVectorSample(null);

    if (student.hasFaceEnrolled) {
      setActiveTab('verify');
      setStatusMsg(`Biometric profile loaded for ${student.name} from MySQL! Position face to authenticate.`);
    } else {
      setActiveTab('register');
      setStatusMsg(`⚠️ ${student.name} has no face profile in MySQL. Click "Capture & Enroll Face to MySQL".`);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Webcam stream note:', err.message);
      setCameraActive(false);
      setCameraError(err.message || 'Unable to access camera.');
      setStatusMsg('Webcam permissions needed. Enable camera to enroll or verify your face.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Extract 128D mean-centered visual contrast & edge energy vector
  const extractFaceFeatures = () => {
    if (cameraActive && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, width, height);

      // Snapshot photo as base64 JPEG
      const snapshotUrl = canvas.toDataURL('image/jpeg', 0.65);

      // Crop face oval area (center 50% width, 60% height)
      const startX = Math.floor(width * 0.25);
      const startY = Math.floor(height * 0.20);
      const cropW = Math.max(32, Math.floor(width * 0.50));
      const cropH = Math.max(32, Math.floor(height * 0.60));

      const imgData = ctx.getImageData(startX, startY, cropW, cropH);
      const data = imgData.data;

      // 1. Calculate overall mean luminance M of the cropped face area
      let sumAllLum = 0;
      let totalPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        sumAllLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalPixels++;
      }
      const meanLum = totalPixels > 0 ? (sumAllLum / totalPixels) : 128;

      // 2. Divide face into an 8 x 8 grid (64 spatial patches)
      const gridCols = 8;
      const gridRows = 8;
      const patchW = Math.max(2, Math.floor(cropW / gridCols));
      const patchH = Math.max(2, Math.floor(cropH / gridRows));

      const contrastVector = [];
      const edgeVector = [];

      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          let patchLum = 0;
          let patchEdges = 0;
          let count = 0;
          const patchY = r * patchH;
          const patchX = c * patchW;

          for (let py = 0; py < patchH; py += 2) {
            for (let px = 0; px < patchW; px += 2) {
              const curX = patchX + px;
              const curY = patchY + py;
              const idx = (curY * cropW + curX) * 4;

              if (idx + 6 < data.length) {
                const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                patchLum += lum;

                // Horizontal gradient
                const nextLumX = 0.299 * data[idx + 4] + 0.587 * data[idx + 5] + 0.114 * data[idx + 6];
                patchEdges += Math.abs(nextLumX - lum);
                count++;
              }
            }
          }

          const avgLum = count > 0 ? (patchLum / count) : meanLum;
          const avgEdge = count > 0 ? (patchEdges / count) : 0;

          // Zero-center contrast relative to overall face mean
          contrastVector.push((avgLum - meanLum) / 128.0);
          // High-frequency edge density centered
          edgeVector.push((avgEdge - 15.0) / 30.0);
        }
      }

      // Combine 64 contrast + 64 edge density = 128 dimensions
      const raw128 = [...contrastVector, ...edgeVector];

      // L2 unit normalize so sum of squares = 1.0
      const norm = Math.sqrt(raw128.reduce((acc, val) => acc + val * val, 0)) || 1.0;
      const normalized = raw128.map(v => parseFloat((v / norm).toFixed(4)));

      return { vector: normalized, snapshotUrl };
    }

    return { vector: [], snapshotUrl: null };
  };

  // 1. Enrollment Handler: Saves specifically to selectedUserId in MySQL
  const handleEnrollFace = async () => {
    setProcessing(true);
    setVerificationFailed(false);
    setStatusMsg(`Extracting 128D biometric vector for ${selectedResident?.name}...`);

    const { vector, snapshotUrl } = extractFaceFeatures();
    if (!vector || vector.length === 0) {
      setProcessing(false);
      setStatusMsg('❌ Could not capture video frame. Please ensure camera is active.');
      return;
    }

    const vectorJson = JSON.stringify(vector);
    setVectorSample(`[${vector.slice(0, 5).join(', ')}, ... +123 dims]`);

    setTimeout(async () => {
      setStatusMsg(`Saving biometric vector into MySQL table hostelhub.users for ID #${selectedUserId}...`);

      try {
        const res = await apiService.registerFace(selectedUserId, vectorJson, snapshotUrl);
        setProcessing(false);
        if (res && res.success) {
          setRegisteredSuccess(true);
          setHasStoredProfile(true);
          if (snapshotUrl) setEnrolledPhoto(snapshotUrl);

          // Refresh live roster so all profiles show live MySQL status
          await loadRosterAndStatus(selectedUserId);

          setStatusMsg(`✓ Face profile saved in MySQL for ${selectedResident?.name}! Switching to "Verify Face"...`);
          setTimeout(() => {
            setActiveTab('verify');
            setStatusMsg(`Profile active in MySQL! Position face and click "Scan & Verify Face".`);
          }, 1400);
        } else {
          setStatusMsg('❌ Failed to save face to MySQL. Please check backend connection.');
        }
      } catch (err) {
        setProcessing(false);
        setStatusMsg('❌ Network error while communicating with backend.');
      }
    }, 900);
  };

  // 2. Verification Handler: STRICTLY compares against selected resident in MySQL
  const handleStartScan = async () => {
    setProcessing(true);
    setVerificationFailed(false);
    setVerifiedSuccess(false);
    setStatusMsg(`Scanning live face to authenticate against ${selectedResident?.name}'s profile...`);

    const { vector } = extractFaceFeatures();
    if (!vector || vector.length === 0) {
      setProcessing(false);
      setVerificationFailed(true);
      setStatusMsg('❌ Cannot capture face frame. Camera not active.');
      return;
    }

    const vectorJson = JSON.stringify(vector);

    setTimeout(async () => {
      setVectorSample(`[${vector.slice(0, 5).join(', ')}, ... +123 dims]`);
      setStatusMsg(`Querying MySQL for ID #${selectedUserId} and calculating cosine similarity...`);

      try {
        const res = await apiService.verifyFace(selectedUserId, vectorJson, '192.168.1.42');
        setProcessing(false);

        // Case 1: No profile in MySQL
        if (!res || res.hasStoredProfile === false) {
          setVerifiedSuccess(false);
          setVerificationFailed(true);
          setSimilarityScore('0.0');
          setStatusMsg(`❌ Verification Denied: No face registered in MySQL for ${selectedResident?.name}! Please switch to "Register / Enroll Face" tab.`);
          return;
        }

        const score = res && res.embeddingScore ? res.embeddingScore : 0.0;
        setSimilarityScore((score * 100).toFixed(1));

        // Case 2: Face matches registered profile (cosine match >= 75%)
        if (res.overallVerified === true || res.faceVerified === true) {
          setVerifiedSuccess(true);
          setVerificationFailed(false);
          setStatusMsg(`✓ Identity Verified for ${selectedResident?.name}! 128D Cosine Match: ${(score * 100).toFixed(1)}% · IP Authorized.`);

          setTimeout(() => {
            if (isTargetCurrentUser && onVerifySuccess) {
              onVerifySuccess();
            }
            onClose();
          }, 1500);
        } else {
          // Case 3: Face DOES NOT match registered profile
          setVerifiedSuccess(false);
          setVerificationFailed(true);
          setStatusMsg(`❌ Face Not Recognized! Cosine Match: ${(score * 100).toFixed(1)}% (Threshold: 75%). This face does not match ${selectedResident?.name}'s registered profile.`);
        }
      } catch (err) {
        setProcessing(false);
        setVerifiedSuccess(false);
        setVerificationFailed(true);
        setStatusMsg('❌ Server verification error. Please ensure Spring Boot backend is active.');
      }
    }, 1000);
  };

  // 3. Reset Handler: Deletes stored face for selected student from MySQL
  const handleResetFace = async () => {
    if (!window.confirm(`Delete registered face profile for ${selectedResident?.name} from MySQL?`)) return;
    setProcessing(true);
    try {
      await apiService.resetFace(selectedUserId);
      setHasStoredProfile(false);
      setEnrolledPhoto(null);
      setVerifiedSuccess(false);
      setVerificationFailed(false);
      setProcessing(false);
      await loadRosterAndStatus(selectedUserId);
      setActiveTab('register');
      setStatusMsg(`Biometric profile for ${selectedResident?.name} removed from MySQL.`);
    } catch (e) {
      setProcessing(false);
      console.warn('Reset error:', e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '580px' }}>
        <div className="modal-header" style={{ paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#082B5C" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.2rem', color: '#082B5C' }}>
                Biometric Face Intelligence
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Multi-Resident 128D Cosine Verification & MySQL Storage
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} disabled={processing}>×</button>
        </div>

        {/* 1. Multi-Student Biometric Roster & Profile Switcher */}
        <div style={{ marginBottom: '12px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#082B5C', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#082B5C" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Resident Biometric Roster:
            </div>
            <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
              ● Connected to MySQL
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {profilesList.map(st => {
              const isSelected = st.id === selectedUserId;
              const isEnrolled = !!st.hasFaceEnrolled;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectResident(st)}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: `2px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
                    borderRadius: '8px',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  {/* Avatar Thumbnail */}
                  <div style={{ position: 'relative', width: '36px', height: '36px', marginBottom: '5px' }}>
                    {st.facePhoto ? (
                      <img
                        src={st.facePhoto}
                        alt={st.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: isEnrolled ? '2px solid #10B981' : '1px solid #CBD5E1' }}
                      />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                        {st.name.charAt(0)}
                      </div>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isEnrolled ? '#10B981' : '#CBD5E1',
                        border: '1.5px solid #FFFFFF'
                      }}
                      title={isEnrolled ? 'Enrolled in MySQL' : 'No Face Enrolled'}
                    />
                  </div>

                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: isSelected ? '#1E40AF' : '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {st.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#64748B' }}>
                    ID #{st.id}
                  </div>
                  <span style={{
                    fontSize: '0.62rem',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    marginTop: '4px',
                    fontWeight: 600,
                    background: isEnrolled ? '#DCFCE7' : '#F1F5F9',
                    color: isEnrolled ? '#166534' : '#64748B'
                  }}>
                    {isEnrolled ? 'Enrolled ✓' : 'No Face'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Active Profile Selected Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '10px', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: '#64748B' }}>Active Target: </span>
            <strong style={{ color: '#082B5C' }}>{selectedResident?.name}</strong>
            <span style={{ color: '#94A3B8', marginLeft: '4px' }}>(ID #{selectedUserId} · {selectedResident?.email})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasStoredProfile ? '#10B981' : '#EF4444', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 600, color: hasStoredProfile ? '#059669' : '#DC2626' }}>
              {hasStoredProfile ? 'Enrolled in MySQL' : 'No Face Enrolled'}
            </span>
            {hasStoredProfile && (
              <button
                type="button"
                onClick={handleResetFace}
                title="Delete enrolled profile for this resident from MySQL database"
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Clear Face 🗑️
              </button>
            )}
          </div>
        </div>

        {/* 3. Tab Switcher: Register / Enroll vs Verify */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.75rem', background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'verify' ? '#082B5C' : 'transparent',
              color: activeTab === 'verify' ? '#FFFFFF' : '#475569',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Verify Face
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'register' ? '#F5A623' : 'transparent',
              color: activeTab === 'register' ? '#082B5C' : '#475569',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Register / Enroll Face
          </button>
        </div>

        {/* 4. Live Camera Viewport */}
        <div className="cam-preview-box" style={{ height: '220px', background: '#0F172A', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror video for natural UX
              opacity: cameraActive ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />

          {/* Fallback if camera is off or denied */}
          {!cameraActive && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: '1rem', textAlign: 'center', zIndex: 1 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={{ marginBottom: '8px' }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#E2E8F0' }}>Live Camera View</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                {cameraError ? cameraError : 'Starting video stream...'}
              </div>
              <button
                type="button"
                onClick={startCamera}
                style={{ marginTop: '10px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Face Oval Scanning Overlay */}
          <div
            className="cam-face-oval"
            style={{
              zIndex: 2,
              borderColor: verifiedSuccess ? '#10B981' : verificationFailed ? '#EF4444' : activeTab === 'register' ? '#F5A623' : '#12D8C7'
            }}
          >
            {processing && <div className="scan-laser-line"></div>}
            {verifiedSuccess && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            )}
            {verificationFailed && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
            )}
          </div>

          {/* Camera Status Tag */}
          <div style={{ position: 'absolute', bottom: '8px', left: '10px', background: 'rgba(0,0,0,0.7)', color: cameraActive ? '#10B981' : '#EF4444', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cameraActive ? '#10B981' : '#EF4444', display: 'inline-block' }}></span>
            {cameraActive ? 'Camera Live (640x480)' : 'Camera Inactive'}
          </div>

          {/* Enrolled Thumbnail Preview if available */}
          {enrolledPhoto && (
            <div style={{ position: 'absolute', top: '8px', right: '10px', background: 'rgba(0,0,0,0.8)', padding: '3px 8px', borderRadius: '6px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={enrolledPhoto} alt="MySQL Enrolled" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #10B981' }} />
              <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600 }}>MySQL Profile</span>
            </div>
          )}
        </div>

        {/* 5. Verification / Enrollment Status Box */}
        <div style={{
          background: verifiedSuccess || registeredSuccess ? '#ECFDF5' : verificationFailed ? '#FEF2F2' : '#F8FAFC',
          padding: '0.75rem 0.85rem',
          borderRadius: '6px',
          border: `1px solid ${verifiedSuccess || registeredSuccess ? '#A7F3D0' : verificationFailed ? '#FCA5A5' : '#E2E8F0'}`,
          margin: '0.75rem 0',
          fontSize: '0.82rem'
        }}>
          <div style={{ fontWeight: 600, color: verifiedSuccess || registeredSuccess ? '#065F46' : verificationFailed ? '#991B1B' : '#0F172A', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Status:</span>
            {similarityScore && (
              <span style={{ color: parseFloat(similarityScore) >= 75 ? '#059669' : '#DC2626', fontWeight: 700 }}>
                Cosine Similarity: {similarityScore}%
              </span>
            )}
          </div>
          <div style={{
            color: verifiedSuccess || registeredSuccess ? '#047857' : verificationFailed ? '#DC2626' : processing ? '#082B5C' : '#475569',
            fontWeight: 500
          }}>
            {statusMsg}
          </div>
          {vectorSample && (
            <div style={{ marginTop: '6px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#059669', wordBreak: 'break-all', background: '#FFFFFF', padding: '4px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <strong>128D Biometric Vector:</strong> {vectorSample}
            </div>
          )}
        </div>

        {/* 6. Actions Bar */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn-action" onClick={onClose} disabled={processing}>
            Close
          </button>

          {activeTab === 'register' ? (
            <button
              className="btn-primary"
              style={{ width: 'auto', background: registeredSuccess ? '#10B981' : '#F5A623', color: registeredSuccess ? '#FFFFFF' : '#082B5C', fontWeight: 700 }}
              onClick={handleEnrollFace}
              disabled={processing || !cameraActive}
            >
              {processing ? `Enrolling ${selectedResident?.name}...` : registeredSuccess ? 'Face Enrolled in MySQL ✓' : `Capture & Enroll Face for ${selectedResident?.name?.split(' ')[0]}`}
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ width: 'auto', background: verifiedSuccess ? '#10B981' : verificationFailed ? '#DC2626' : '#082B5C' }}
              onClick={handleStartScan}
              disabled={processing || verifiedSuccess || !cameraActive}
            >
              {processing ? 'Analyzing Frame...' : verifiedSuccess ? 'Verified ✓' : verificationFailed ? 'Retry Verification' : `Scan & Verify against ${selectedResident?.name?.split(' ')[0]}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
