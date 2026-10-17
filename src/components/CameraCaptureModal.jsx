import React, { useState, useEffect, useRef } from 'react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture, title = 'Take Photo with Camera' }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
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
      console.warn('Camera error:', err.message);
      // Fallback without facingMode constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch (fallbackErr) {
        setCameraActive(false);
        setCameraError(fallbackErr.message || 'Unable to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#082B5C" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>{title}</h3>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
          Point your laptop camera at the maintenance item and click <strong>Snap Photo</strong> to capture evidence.
        </p>

        {/* Viewport Box */}
        <div style={{ position: 'relative', width: '100%', height: '320px', background: '#0F172A', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0F172A' }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: cameraActive ? 1 : 0
                }}
              />

              {!cameraActive && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: '1rem', textAlign: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={{ marginBottom: '8px' }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <div style={{ fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 500 }}>
                    {cameraError ? cameraError : 'Starting camera video stream...'}
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{ marginTop: '10px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', padding: '5px 14px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Retry Access
                  </button>
                </div>
              )}

              {/* Viewfinder Target Guide */}
              {cameraActive && (
                <div style={{ position: 'absolute', inset: '24px', border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '6px', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderTop: '2px solid #F5A623', borderLeft: '2px solid #F5A623', position: 'absolute', top: '-2px', left: '-2px' }}></div>
                  <div style={{ width: '16px', height: '16px', borderTop: '2px solid #F5A623', borderRight: '2px solid #F5A623', position: 'absolute', top: '-2px', right: '-2px' }}></div>
                  <div style={{ width: '16px', height: '16px', borderBottom: '2px solid #F5A623', borderLeft: '2px solid #F5A623', position: 'absolute', bottom: '-2px', left: '-2px' }}></div>
                  <div style={{ width: '16px', height: '16px', borderBottom: '2px solid #F5A623', borderRight: '2px solid #F5A623', position: 'absolute', bottom: '-2px', right: '-2px' }}></div>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn-action" onClick={onClose}>
            Cancel
          </button>

          {capturedImage ? (
            <>
              <button className="btn-action" onClick={handleRetake}>
                Retake
              </button>
              <button
                className="btn-primary"
                style={{ width: 'auto', background: '#10B981' }}
                onClick={handleConfirm}
              >
                Use This Photo ✓
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              style={{ width: 'auto', background: '#F5A623', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={handleSnap}
              disabled={!cameraActive}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Snap Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
