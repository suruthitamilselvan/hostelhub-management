import React, { useState, useRef } from 'react';
import CameraCaptureModal from './CameraCaptureModal';

export default function StudentModule({
  activeTab,
  setActiveTab,
  complaints,
  onSubmitNewComplaint,
  onOpenChat,
  onRateComplaint,
  onReopenComplaint,
  isVerified,
  onOpenVerifyModal,
  currentUser
}) {
  // New Complaint Form State
  const [category, setCategory] = useState('Plumbing');
  const [block, setBlock] = useState('Block B');
  const [room, setRoom] = useState('204');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // My Complaints Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Complaint for Details Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Statistics calculation
  const activeCount = complaints.filter(c => c.stage !== 'Closed').length;
  const pendingCount = complaints.filter(c => c.stage === 'Submitted' || c.stage === 'Under Review').length;
  const inProgressCount = complaints.filter(c => c.stage === 'Assigned' || c.stage === 'In Progress').length;
  const completedCount = complaints.filter(c => c.stage === 'Completed' || c.stage === 'Closed').length;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      if (onOpenVerifyModal) onOpenVerifyModal();
      return;
    }
    if (!description && !title) return;

    const generatedTitle = title || `${category} issue in ${block} Room ${room}`;
    onSubmitNewComplaint({
      category,
      title: generatedTitle,
      description: description || 'Routine maintenance repair requested.',
      locationBlock: block,
      locationRoom: room,
      photoName: photoPreview || photoName
    });

    setSubmitSuccessMsg(`Complaint ticket has been submitted successfully.`);
    setTitle('');
    setDescription('');
    setPhotoName('');
    setPhotoPreview('');
    setTimeout(() => {
      setSubmitSuccessMsg('');
      setActiveTab('my-complaints');
    }, 1500);
  };

  const getPriorityBadgeClass = (p) => {
    if (p === 'High') return 'badge-priority-high';
    if (p === 'Medium') return 'badge-priority-medium';
    return 'badge-priority-low';
  };

  const getStageBadgeClass = (s) => {
    if (s === 'In Progress') return 'badge-stage-in-progress';
    if (s === 'Completed') return 'badge-stage-completed';
    if (s === 'Closed') return 'badge-stage-closed';
    if (s === 'Under Review') return 'badge-stage-medium';
    return 'badge-stage-assigned';
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'All' && c.stage !== statusFilter) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!isVerified) {
    return (
      <div className="module-content">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '3rem 2rem',
          maxWidth: '640px',
          margin: '2rem auto',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(8, 43, 92, 0.08)'
        }}>
          {/* Padlock Icon */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: '#FEF2F2',
            border: '2px solid #FCA5A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#DC2626'
          }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <span style={{
            background: '#FEE2E2',
            color: '#DC2626',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 14px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            Security Access Control: Portal Locked 🔒
          </span>

          <h2 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#082B5C', marginBottom: '0.75rem' }}>
            Biometric Face Verification Required
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#64748B', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.75rem' }}>
            To safeguard student privacy and prevent proxy complaints, hostel security policy requires you to complete 
            <strong> live face biometric verification</strong> before accessing your student dashboard or lodging room maintenance tickets.
          </p>

          {/* Student Info Card */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Resident</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#082B5C' }}>{currentUser?.name || 'Suruthi T.'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Hostel & Room</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>Block B · Room 204</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Wi-Fi Network</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#059669' }}>192.168.1.42 (Campus Wi-Fi)</div>
            </div>
          </div>

          {/* Unlock Button */}
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenVerifyModal}
            style={{
              background: '#082B5C',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(8, 43, 92, 0.3)',
              cursor: 'pointer'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Scan Face to Unlock Student Portal
          </button>

          <div style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#94A3B8' }}>
            Haven't registered your face yet? Click above to register and save your biometric profile in MySQL.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-content">
      {/* Biometric Session Verified Banner */}
      <div style={{
        background: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: '6px',
        padding: '10px 16px',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#065F46'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <div>
            <strong>Biometric Identity Verified:</strong> Authenticated as {currentUser?.name || 'Suruthi T.'} (21CS042). Full portal access & complaint lodging enabled.
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', background: '#D1FAE5', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
          SESSION SECURE ✓
        </span>
      </div>

      {/* 1. STUDENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Welcome Banner */}
          <div className="erp-welcome-card">
            <div>
              <h2 className="welcome-title">Welcome, Suruthi T.</h2>
              <div className="welcome-sub">
                Register Number: <strong>21CS042</strong> | Hostel: <strong>Block B Residence</strong> | Room: <strong>204</strong>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setActiveTab('new-complaint')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Submit New Complaint
            </button>
          </div>

          {/* Single Unified Statistics Box */}
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>ACTIVE COMPLAINTS</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{activeCount}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>PENDING</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{pendingCount}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>IN PROGRESS</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{inProgressCount}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>COMPLETED</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#059669', marginTop: '2px' }}>{completedCount}</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="queue-card">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <button className="btn-action" onClick={() => setActiveTab('my-complaints')}>
                View All Complaints →
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Complaint Issue</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          No Complaints Logged Yet
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                          You have no active maintenance complaints. Click <strong>"Submit New Complaint"</strong> above to file a new repair request with live camera evidence.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    complaints.slice(0, 5).map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600, color: '#082B5C' }}>{item.id}</td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#0F172A' }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Category: {item.category}</div>
                        </td>
                        <td>{item.locationShort || item.location}</td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#334155' }}>
                            {item.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#334155' }}>
                            {item.stage}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#64748B' }}>18 Oct 2026</span>
                        </td>
                        <td>
                          <button className="btn-action" onClick={() => setSelectedTicket(item)}>
                            View
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

      {/* 2. NEW COMPLAINT PAGE */}
      {activeTab === 'new-complaint' && (
        <div className="queue-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="queue-header">
            <div className="queue-title-group">
              <h2>Submit New Complaint</h2>
              <p>Enter details below to log a hostel room maintenance ticket</p>
            </div>
          </div>

          {submitSuccessMsg && (
            <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px 16px', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              {submitSuccessMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Complaint Category *</label>
                <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Internet">Internet</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority Indicator (System Suggested)</label>
                <div style={{ padding: '8px 12px', background: category === 'Electrical' ? '#FEE2E2' : '#F1F5F9', color: category === 'Electrical' ? '#DC2626' : '#334155', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                  {category === 'Electrical' ? 'High Priority (Electrical Auto-Tag)' : 'Medium Priority'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Block *</label>
                <select className="form-control" value={block} onChange={e => setBlock(e.target.value)}>
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="Block D">Block D</option>
                </select>
              </div>

              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g., 204"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Complaint Description *</label>
              <textarea
                className="form-control"
                rows="4"
                required
                placeholder="Explain the maintenance problem in detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Evidence Photo (Camera Snap / Upload)</label>
              <div className="photo-slot" style={{ minHeight: '90px', padding: '1rem', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '6px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />

                {photoPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <img
                      src={photoPreview}
                      alt="Captured Evidence Preview"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #10B981', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                    />
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{photoName || 'Captured Photo'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '2px', fontWeight: 500 }}>Ready to attach to maintenance ticket</div>
                    </div>
                    <button
                      type="button"
                      className="btn-action"
                      style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => { setPhotoName(''); setPhotoPreview(''); }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => setIsCameraModalOpen(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Take Live Photo (Camera)
                    </button>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Browse Image File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn-action" onClick={() => setActiveTab('dashboard')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. MY COMPLAINTS PAGE */}
      {activeTab === 'my-complaints' && (
        <div className="queue-card">
          <div className="queue-header">
            <div className="queue-title-group">
              <h2>My Complaints</h2>
              <p>Manage and track all your submitted complaints</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                style={{ width: '200px' }}
                placeholder="Search complaint..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                className="filter-select"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Furniture">Furniture</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Internet">Internet</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Technician</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                      No complaints found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedComplaints.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: '#082B5C' }}>{item.id}</td>
                      <td>{item.category}</td>
                      <td>{item.locationShort || item.location}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStageBadgeClass(item.stage)}`}>
                          {item.stage}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{item.assignedTech || 'Pending Assignment'}</td>
                      <td style={{ fontSize: '0.82rem', color: '#64748B' }}>12 Sep 2026</td>
                      <td>
                        <button className="btn-action" onClick={() => setSelectedTicket(item)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B' }}>
            <div>Showing {Math.min(1, filteredComplaints.length)} to {Math.min(itemsPerPage * currentPage, filteredComplaints.length)} of {filteredComplaints.length} complaints</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                className="btn-action"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: '3px 10px' }}
              >
                Previous
              </button>
              <span style={{ fontWeight: 700, padding: '0 8px', color: '#0F172A' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-action"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '3px 10px' }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="queue-card">
          <div className="queue-header">
            <h2>Technician Chat</h2>
            <p>Direct message channel with assigned maintenance technician</p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ color: '#082B5C', marginBottom: '8px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '6px' }}>Direct Communication</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              Active technician: <strong>Anand Pillai (Plumbing Technician)</strong>
            </p>
            <button className="btn-primary" style={{ width: 'auto' }} onClick={() => onOpenChat(complaints[0])}>
              Open Chat Window
            </button>
          </div>
        </div>
      )}

      {/* 5. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="queue-card">
          <div className="queue-header">
            <h2>Notifications</h2>
            <p>System alerts and status update history</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>Complaint #CH1025 assigned to Anand Pillai</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Warden office assigned technician.</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>10 mins ago</span>
            </div>

            <div style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>Complaint #CH1025 status changed to In Progress</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Technician checked in at Block B Room 204.</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>25 mins ago</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="queue-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="queue-header">
            <h2>Student Profile</h2>
            <p>Student residence details</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>NAME</div>
              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>Suruthi T.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>REGISTER NUMBER</div>
              <div style={{ fontWeight: 700, color: '#082B5C', fontSize: '0.95rem' }}>21CS042</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>BLOCK & ROOM</div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>Block B · Room 204</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>DEPARTMENT</div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>Computer Science</div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS MODAL */}
      {selectedTicket && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Complaint #{selectedTicket.id}</h3>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Submitted on 12 Sep 2026</div>
              </div>
              <button className="btn-close" onClick={() => setSelectedTicket(null)}>×</button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginBottom: '12px' }}>
                <div>Category: <strong>{selectedTicket.category}</strong></div>
                <div>Location: <strong>{selectedTicket.location}</strong></div>
                <div>Priority: <span className={`badge ${getPriorityBadgeClass(selectedTicket.priority)}`}>{selectedTicket.priority}</span></div>
                <div>Assigned Technician: <strong>{selectedTicket.assignedTech || 'Unassigned'}</strong></div>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Description:</div>
              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', color: '#334155', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                {selectedTicket.description || selectedTicket.title}
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Uploaded Photo:</div>
              {selectedTicket.beforePhoto && selectedTicket.beforePhoto.startsWith('data:image') ? (
                <div style={{ marginBottom: '1rem' }}>
                  <img
                    src={selectedTicket.beforePhoto}
                    alt="Complaint Evidence"
                    style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'block' }}
                  />
                </div>
              ) : (
                <div className="file-badge" style={{ marginBottom: '1rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  {selectedTicket.beforePhoto || 'evidence_photo.jpg'}
                </div>
              )}
            </div>

            {/* Clean Status Timeline */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                RESOLUTION TIMELINE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', textAlign: 'center' }}>
                {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Completed', 'Closed'].map((st, idx) => {
                  const isDone = (idx + 1) <= selectedTicket.stageStep;
                  return (
                    <div key={st} style={{ background: isDone ? '#D1FAE5' : '#F1F5F9', border: `1px solid ${isDone ? '#6EE7B7' : '#CBD5E1'}`, padding: '6px 2px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDone ? '#065F46' : '#64748B' }}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: isDone ? '#065F46' : '#64748B' }}>
                        {st}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
              {(selectedTicket.stage === 'Completed' || selectedTicket.stage === 'Closed') && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: 'auto' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Rate:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        style={{ cursor: 'pointer', color: star <= (selectedTicket.rating || 5) ? '#F59E0B' : '#CBD5E1', fontSize: '1rem' }}
                        onClick={() => onRateComplaint(selectedTicket.id, star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <button className="btn-action" onClick={() => { onReopenComplaint(selectedTicket.id); setSelectedTicket(null); }}>
                    Reopen Complaint
                  </button>
                </>
              )}

              <button className="btn-action" onClick={() => { onOpenChat(selectedTicket); setSelectedTicket(null); }}>
                Chat with Technician
              </button>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => {
          setPhotoPreview(dataUrl);
          setPhotoName(`live_snap_${Date.now()}.jpg`);
        }}
        title="Take Live Complaint Photo"
      />
    </div>
  );
}
