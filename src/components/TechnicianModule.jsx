import React, { useState, useRef } from 'react';
import CameraCaptureModal from './CameraCaptureModal';

export default function TechnicianModule({
  activeTab,
  setActiveTab,
  activeTask,
  onAddSparePart,
  onDeleteSparePart,
  onUploadAfterPhoto,
  onMarkJobCompleted
}) {
  const [newPartName, setNewPartName] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newUnitCost, setNewUnitCost] = useState('');
  const [techNotes, setTechNotes] = useState('Replaced damaged rubber washer and tightened valve packing seal.');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState('');

  const handleCompleteClick = () => {
    onMarkJobCompleted();
    setCompleteSuccess('Job marked as Completed! After-repair proof and spare parts expenses recorded.');
    setTimeout(() => {
      setCompleteSuccess('');
    }, 4000);
  };

  const techFileInputRef = useRef(null);
  const techCameraInputRef = useRef(null);

  const handleAfterPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUploadAfterPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPartSubmit = (e) => {
    e.preventDefault();
    if (newPartName && newUnitCost) {
      onAddSparePart({
        name: newPartName,
        qty: parseInt(newQty, 10) || 1,
        unitCost: parseFloat(newUnitCost) || 0
      });
      setNewPartName('');
      setNewQty(1);
      setNewUnitCost('');
    }
  };

  const currentTask = activeTask || null;
  const tasksList = currentTask ? [currentTask] : [];

  return (
    <div className="module-content">
      {/* DASHBOARD TAB & MY TASKS TAB */}
      {(activeTab === 'dashboard' || activeTab === 'my-tasks') && (
        <div>
          {/* Welcome Banner */}
          <div className="erp-welcome-card">
            <div>
              <h2 className="welcome-title">Technician Workstation</h2>
              <div className="welcome-sub">
                Technician: <strong>Anand Pillai</strong> | Specialty: <strong>Plumbing Services</strong>
              </div>
            </div>
          </div>

          {/* Single Unified Statistics Box */}
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>ASSIGNED TASKS</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{tasksList.length}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>IN PROGRESS</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{tasksList.filter(t => t.stage === 'In Progress').length}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>COMPLETED THIS MONTH</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#059669', marginTop: '2px' }}>{tasksList.filter(t => t.stage === 'Completed' || t.stage === 'Closed').length}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>AVERAGE SERVICE RATING</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>★ 5.0</div>
            </div>
          </div>

          {/* Task Queue Table */}
          <div className="queue-card">

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Issue Description</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>SLA Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          No Maintenance Jobs Assigned
                        </div>
                        <div style={{ fontSize: '0.82rem' }}>
                          New repair tickets dispatched by the Warden will appear here.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tasksList.map(task => (
                      <tr key={task.id}>
                        <td style={{ fontWeight: 700, color: '#0284C7' }}>{task.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{task.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Category: {task.category}</div>
                        </td>
                        <td>{task.locationShort}</td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#334155' }}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#334155' }}>
                            {task.stage}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#64748B' }}>{task.sla}</span>
                        </td>
                        <td>
                          <button className="btn-action" onClick={() => setActiveTab('parts-cost')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                            Work Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PARTS & COST / WORK PAGE TAB */}
      {(activeTab === 'parts-cost' || activeTab === 'update-status') && (
        !currentTask ? (
          <div className="queue-card">
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" style={{ marginBottom: '14px' }}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                No Active Repair Job Selected
              </div>
              <p style={{ fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                When the Warden assigns a maintenance ticket to this workstation, you will be able to log spare parts, calculate total repair expenses, and snap live completion proof here.
              </p>
              <button className="btn-action" onClick={() => setActiveTab('my-tasks')}>
                View Tasks Queue
              </button>
            </div>
          </div>
        ) : (
          <div className="queue-card">
          <div className="queue-header">
            <div className="queue-title-group">
              <h2>Task Execution & Spare Parts Costing</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Task {currentTask.id} · {currentTask.locationShort}</span>
                <span className={`badge ${currentTask.stage === 'Completed' ? 'badge-stage-completed' : 'badge-stage-in-progress'}`}>
                  {currentTask.stage}
                </span>
              </div>
            </div>
            <button
              className="btn-primary"
              style={{
                width: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: currentTask.stage === 'Completed' ? '#10B981' : '#F5A623',
                cursor: currentTask.stage === 'Completed' ? 'default' : 'pointer'
              }}
              onClick={handleCompleteClick}
              disabled={currentTask.stage === 'Completed'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {currentTask.stage === 'Completed' ? 'Job Completed ✓' : 'Mark Job Completed'}
            </button>
          </div>

          {completeSuccess && (
            <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '12px 16px', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {completeSuccess}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0F172A', marginBottom: '4px' }}>
                {currentTask.title}
              </div>
              <span className={`badge ${currentTask.stage === 'Completed' ? 'badge-stage-completed' : 'badge-stage-in-progress'}`}>
                {currentTask.stage}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Student: <strong>{currentTask.studentName || 'Suruthi T.'}</strong> | Priority: <strong>{currentTask.priority}</strong> | SLA: <strong>{currentTask.sla}</strong>
            </div>
          </div>

          {/* Photo Comparison Grid */}
          <div className="photo-compare-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="photo-slot" style={{ background: '#F8FAFC', padding: '1rem', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
              <div className="photo-slot-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>BEFORE REPAIR EVIDENCE</div>
              {currentTask.beforePhoto && currentTask.beforePhoto.startsWith('data:image') ? (
                <img
                  src={currentTask.beforePhoto}
                  alt="Before Repair"
                  style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                />
              ) : (
                <div className="file-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  {currentTask.beforePhoto || 'before-tap.jpg'}
                </div>
              )}
            </div>

            <div className="photo-slot" style={{ background: '#F8FAFC', padding: '1rem', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
              <div className="photo-slot-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>AFTER REPAIR PROOF (LIVE CAMERA)</div>
              
              <input
                type="file"
                ref={techFileInputRef}
                accept="image/*"
                onChange={handleAfterPhotoSelect}
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={techCameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleAfterPhotoSelect}
                style={{ display: 'none' }}
              />

              {currentTask.afterPhoto ? (
                <div>
                  {currentTask.afterPhoto.startsWith('data:image') ? (
                    <img
                      src={currentTask.afterPhoto}
                      alt="After Repair Proof"
                      style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '4px', border: '2px solid #10B981', marginBottom: '8px' }}
                    />
                  ) : (
                    <div className="file-badge" style={{ borderColor: '#10B981', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      {currentTask.afterPhoto}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-action" onClick={() => setIsCameraModalOpen(true)} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                      Retake Photo
                    </button>
                    <button type="button" className="btn-action" onClick={() => techFileInputRef.current?.click()} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                      Change File
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => setIsCameraModalOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Snap Repair Photo (Camera)
                  </button>
                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => techFileInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Technician Notes */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Technician Resolution Notes</label>
            <textarea
              className="form-control"
              rows="2"
              value={techNotes}
              onChange={e => setTechNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Spare Parts Inventory & Cost Table */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0B2859', marginBottom: '8px' }}>
              SPARE PARTS USED & REPAIR COST
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Part Name</th>
                    <th style={{ width: '90px' }}>Qty</th>
                    <th style={{ width: '110px' }}>Unit Cost</th>
                    <th style={{ width: '130px' }}>Line Total</th>
                    <th style={{ width: '70px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTask.parts.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.qty}</td>
                      <td>₹{p.unitCost}</td>
                      <td style={{ fontWeight: 600 }}>₹{p.lineTotal}</td>
                      <td>
                        <button
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                          onClick={() => onDeleteSparePart(p.id)}
                          title="Delete part row"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Add Part Row Form */}
                  <tr>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Tap washer set"
                        value={newPartName}
                        onChange={e => setNewPartName(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Cost"
                        value={newUnitCost}
                        onChange={e => setNewUnitCost(e.target.value)}
                      />
                    </td>
                    <td colSpan="2">
                      <button className="btn-action" onClick={handleAddPartSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Part Row
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="total-cost-bar">
              <span>Total Spare Parts Cost</span>
              <span>₹{currentTask.totalCost}</span>
            </div>
          </div>
        </div>
        )
      )}

      {/* CHAT, PERFORMANCE, PROFILE TABS */}
      {(activeTab === 'chat' || activeTab === 'performance' || activeTab === 'profile') && (
        <div className="queue-card">
          <div className="queue-header">
            <h2>Technician Module — {activeTab.toUpperCase()}</h2>
            <p>Workstation module view for active repairs</p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#475569' }}>
            Technician {activeTab} view is active.
          </div>
        </div>
      )}

      {/* Live Camera Capture Modal for Technician Repair Evidence */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => {
          onUploadAfterPhoto(dataUrl);
        }}
        title="Capture After Repair Proof (Live Camera)"
      />
    </div>
  );
}
