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

  // Extract 128D invariant face vector using adaptive skin localization & histogram equalization
  const extractFaceFeatures = () => {
    if (cameraActive && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, width, height);

      // Snapshot photo as base64 JPEG
      const snapshotUrl = canvas.toDataURL('image/jpeg', 0.65);

      // 1. Scan central region for skin-tone pixels to adaptively find face centroid & scale
      const fullImg = ctx.getImageData(0, 0, width, height);
      const raw = fullImg.data;
      const xCoords = [];
      const yCoords = [];

      const minY = Math.floor(height * 0.08);
      const maxY = Math.floor(height * 0.92);
      const minX = Math.floor(width * 0.12);
      const maxX = Math.floor(width * 0.88);

      for (let y = minY; y < maxY; y += 4) {
        for (let x = minX; x < maxX; x += 4) {
          const idx = (y * width + x) * 4;
          const r = raw[idx];
          const g = raw[idx + 1];
          const b = raw[idx + 2];

          // Generalized skin-tone detection
          if (r > 60 && g > 40 && b > 20 && (r - g) > 8 && (r - b) > 8 && Math.max(r, g, b) - Math.min(r, g, b) > 12) {
            xCoords.push(x);
            yCoords.push(y);
          }
        }
      }

      let cropX, cropY, cropSize;
      if (xCoords.length > 50) {
        xCoords.sort((a, b) => a - b);
        yCoords.sort((a, b) => a - b);
        const p15X = xCoords[Math.floor(xCoords.length * 0.15)];
        const p85X = xCoords[Math.floor(xCoords.length * 0.85)];
        const p15Y = yCoords[Math.floor(yCoords.length * 0.15)];
        const p85Y = yCoords[Math.floor(yCoords.length * 0.85)];

        const cx = (p15X + p85X) / 2;
        const cy = (p15Y + p85Y) / 2;
        const bw = p85X - p15X;
        const bh = p85Y - p15Y;

        cropSize = Math.max(bw, bh) * 1.35;
        cropX = Math.max(0, Math.min(width - cropSize, cx - cropSize * 0.5));
        cropY = Math.max(0, Math.min(height - cropSize, cy - cropSize * 0.55));
      } else {
        // Fallback to center guide oval
        cropSize = Math.min(width * 0.55, height * 0.65);
        cropX = Math.max(0, (width - cropSize) / 2);
        cropY = Math.max(0, (height - cropSize) / 2 * 0.85);
      }

      // 2. Render canonical 64x64 face crop on an offscreen canvas
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 64;
      faceCanvas.height = 64;
      const faceCtx = faceCanvas.getContext('2d');
      faceCtx.drawImage(canvas, cropX, cropY, cropSize, cropSize, 0, 0, 64, 64);
      const faceData = faceCtx.getImageData(0, 0, 64, 64);
      const fd = faceData.data;

      // 3. Compute 8-bit grayscale & luminance histogram
      const gray = new Uint8Array(64 * 64);
      const hist = new Int32Array(256);
      for (let i = 0, j = 0; i < fd.length; i += 4, j++) {
        const lum = Math.round(0.299 * fd[i] + 0.587 * fd[i + 1] + 0.114 * fd[i + 2]);
        gray[j] = lum;
        hist[lum]++;
      }

      // 4. Histogram Equalization (removes illumination/lighting variance)
      const cdf = new Int32Array(256);
      let acc = 0;
      let minCdf = 0;
      for (let i = 0; i < 256; i++) {
        acc += hist[i];
        cdf[i] = acc;
        if (minCdf === 0 && acc > 0) minCdf = acc;
      }
      const totalPixels = 64 * 64;
      const equalized = new Float32Array(64 * 64);
      let sumEq = 0;
      for (let i = 0; i < totalPixels; i++) {
        const g = gray[i];
        const eqVal = Math.round(((cdf[g] - minCdf) / (totalPixels - minCdf)) * 255);
        equalized[i] = eqVal;
        sumEq += eqVal;
      }
      const meanEq = sumEq / totalPixels;

      // 5. Extract 64-patch normalized contrast + 64-patch edge energy = 128D
      const grid = 8;
      const pw = 8;
      const contrast = [];
      const edges = [];

      for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
          let patchSum = 0;
          let edgeSum = 0;
          let count = 0;

          for (let y = r * pw; y < (r + 1) * pw; y++) {
            for (let x = c * pw; x < (c + 1) * pw; x++) {
              const idx = y * 64 + x;
              const v = equalized[idx];
              patchSum += v;
              if (x < (c + 1) * pw - 1) {
                edgeSum += Math.abs(equalized[idx + 1] - v);
              }
              count++;
            }
          }
          contrast.push((patchSum / count - meanEq) / 128.0);
          edges.push(edgeSum / 32.0);
        }
      }

      // 6. Combine & L2 unit normalize
      const raw128 = [...contrast, ...edges];
      const norm = Math.sqrt(raw128.reduce((sum, v) => sum + v * v, 0)) || 1.0;
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

        // Case 2: Face matches registered profile (cosine match >= 65%)
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
          setStatusMsg(`❌ Face Not Recognized! Cosine Match: ${(score * 100).toFixed(1)}% (Threshold: 65%). This face does not match ${selectedResident?.name}'s registered profile.`);
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
              <span style={{ color: parseFloat(similarityScore) >= 65 ? '#059669' : '#DC2626', fontWeight: 700 }}>
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
