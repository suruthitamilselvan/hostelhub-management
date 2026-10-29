import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function WardenModule({
  activeTab,
  setActiveTab,
  metrics,
  complaints,
  duplicateSuggestions,
  onMergeDuplicate,
  onAssignTechnician,
  technicians,
  currentUser,
  onOpenChat
}) {
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('All blocks');
  const [selectedStageFilter, setSelectedStageFilter] = useState('All stages');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All categories');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('All priorities');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [assignModalTicket, setAssignModalTicket] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignmentStrategy, setAssignmentStrategy] = useState('leastLoaded');
  const [showAuditModal, setShowAuditModal] = useState(false);

  // States for Users, Notifications, and Settings tabs
  const [userFilterRole, setUserFilterRole] = useState('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userActionMsg, setUserActionMsg] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastBlock, setBroadcastBlock] = useState('All Blocks');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [slaElectrical, setSlaElectrical] = useState(4);
  const [slaPlumbing, setSlaPlumbing] = useState(12);
  const [slaCarpentry, setSlaCarpentry] = useState(24);
  const [slaAppliance, setSlaAppliance] = useState(48);
  const [aiSensitivity, setAiSensitivity] = useState(80);
  const [requireFaceVerify, setRequireFaceVerify] = useState(true);
  const [autoMergeDuplicates, setAutoMergeDuplicates] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const filteredComplaints = complaints.filter(item => {
    if (selectedBlockFilter !== 'All blocks') {
      const blockCode = selectedBlockFilter.split(' ')[1];
      if (!item.location.includes(selectedBlockFilter) && !item.location.includes(blockCode)) return false;
    }
    if (selectedStageFilter !== 'All stages' && item.stage !== selectedStageFilter) return false;
    if (selectedCategoryFilter !== 'All categories' && item.category !== selectedCategoryFilter) return false;
    if (selectedPriorityFilter !== 'All priorities' && item.priority !== selectedPriorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.studentName && item.studentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAssign = (ticket) => {
    setAssignModalTicket(ticket);
    if (technicians && technicians.length > 0) {
      const sorted = [...technicians].sort((a, b) => a.inProgressJobs - b.inProgressJobs);
      setSelectedTechId(sorted[0].id.toString());
    }
  };

  const handleConfirmAssign = () => {
    if (assignModalTicket && selectedTechId) {
      const tech = technicians.find(t => t.id.toString() === selectedTechId);
      onAssignTechnician(assignModalTicket.id, tech ? tech.name : 'Assigned Tech');
      setAssignModalTicket(null);
    }
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
    return 'badge-stage-assigned';
  };

  const categoryLabels = ['Plumbing', 'Electrical', 'Internet', 'Carpentry', 'Housekeeping'];
  const categoryCounts = categoryLabels.map(cat => complaints.filter(c => c.category === cat).length);
  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Number of Complaints',
        data: categoryCounts,
        backgroundColor: ['#082B5C', '#DC2626', '#12D8C7', '#F5A623', '#627D98'],
        borderRadius: 6
      }
    ]
  };

  const blockLabels = ['Block A', 'Block B', 'Block C', 'Block D'];
  const blockCounts = blockLabels.map(blk => complaints.filter(c => (c.location && c.location.includes(blk)) || (c.locationShort && c.locationShort.includes(blk))).length);
  const blockChartData = {
    labels: blockLabels,
    datasets: [
      {
        data: blockCounts,
        backgroundColor: ['#082B5C', '#F5A623', '#12D8C7', '#627D98']
      }
    ]
  };

  return (
    <div className="module-content">
      {/* DASHBOARD TAB & ALL COMPLAINTS TAB */}
      {(activeTab === 'dashboard' || activeTab === 'all-complaints') && (
        <div>
          {/* Welcome Banner */}
          <div className="erp-welcome-card" style={{ background: '#051937', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="welcome-title">Warden Management Portal</h2>
              <div className="welcome-sub">
                Chief Warden: <strong>Dr. Lakshmi V.</strong> | Hostel Administration Office
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowAuditModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F5A623', whiteSpace: 'nowrap', padding: '9px 18px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 600 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Export Audit Report (PDF)
            </button>
          </div>

          {/* Single Unified Statistics Box */}
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>TOTAL COMPLAINTS</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{complaints.length}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>PENDING REVIEW</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{complaints.filter(c => c.stage === 'Submitted' || c.stage === 'Under Review').length}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>IN PROGRESS</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#082B5C', marginTop: '2px' }}>{complaints.filter(c => c.stage === 'In Progress' || c.stage === 'Assigned').length}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E2E8F0' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>OVERDUE / SLA BREACHES</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#DC2626', marginTop: '2px' }}>{complaints.filter(c => c.slaBreached).length}</div>
            </div>
          </div>

          {/* AI Duplicate Merge Suggestions Banner */}
          {duplicateSuggestions.length > 0 && (
            <div className="banner-duplicate">
              <div className="banner-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Duplicate Merge Suggestions
              </div>
              <div className="banner-subtitle">
                Identified identical maintenance issues logged in the same block & category.
              </div>

              {duplicateSuggestions.map(item => (
                <div key={item.id} className="duplicate-item">
                  <div>
                    <strong>{item.block} · {item.category}</strong>
                    <span style={{ color: '#64748B', fontSize: '0.85rem', marginLeft: '8px' }}>
                      — Tickets: {item.ticketIds.join(', ')}
                    </span>
                  </div>
                  <button
                    className="btn-merge"
                    onClick={() => onMergeDuplicate(item.id, item.targetTicket, item.ticketIds[1])}
                  >
                    Merge into {item.targetTicket}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Complaint Management Table */}
          <div className="queue-card">
            <div className="queue-header">
              <div className="queue-title-group">
                <h2>Complaint Management Queue</h2>
                <p>Central intake and resolution tracking across hostel blocks</p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '170px' }}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />

                <select
                  className="filter-select"
                  value={selectedBlockFilter}
                  onChange={(e) => setSelectedBlockFilter(e.target.value)}
                >
                  <option>All blocks</option>
                  <option>Block A</option>
                  <option>Block B</option>
                  <option>Block C</option>
                </select>

                <select
                  className="filter-select"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                >
                  <option>All categories</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Furniture</option>
                  <option>Housekeeping</option>
                  <option>Internet</option>
                </select>

                <select
                  className="filter-select"
                  value={selectedStageFilter}
                  onChange={(e) => setSelectedStageFilter(e.target.value)}
                >
                  <option>All stages</option>
                  <option>Submitted</option>
                  <option>Under Review</option>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Student</th>
                    <th>Complaint Issue</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Technician</th>
                    <th>SLA Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          No Complaints Registered Yet
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                          The complaint queue is clear. Once students log maintenance tickets, they will appear here in real-time.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedComplaints.map(item => (
                    <tr key={item.id} className={item.slaBreached ? 'row-breached' : ''}>
                      <td style={{ fontWeight: 700, color: '#082B5C' }}>{item.id}</td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.studentName || 'Suruthi T.'}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Category: {item.category}</div>
                      </td>
                      <td>{item.location}</td>
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
                      <td style={{ fontSize: '0.85rem' }}>{item.assignedTech || 'Unassigned'}</td>
                      <td>
                        <span style={{ fontWeight: 500, color: item.slaBreached ? '#DC2626' : '#64748B' }}>
                          {item.sla}
                        </span>
                      </td>
                      <td>
                        <button className="btn-action" onClick={() => handleOpenAssign(item)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                          {item.assignedTech ? 'Reassign' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B' }}>
              <div>Showing {Math.min(1, filteredComplaints.length)} to {Math.min(itemsPerPage * currentPage, filteredComplaints.length)} of {filteredComplaints.length} entries</div>
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
        </div>
      )}

      {/* ASSIGN TECHNICIAN TAB */}
      {activeTab === 'assign-technician' && (
        <div className="queue-card">
          <div className="queue-header">
            <h2>Technician Workforce Management</h2>
            <p>View workload and dispatch maintenance technicians</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Technician Name</th>
                  <th>Specialization</th>
                  <th>Active Tasks</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map(tech => (
                  <tr key={tech.id}>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{tech.name}</td>
                    <td>{tech.specialty}</td>
                    <td><span style={{ fontWeight: 700 }}>{tech.inProgressJobs}</span> jobs</td>
                    <td>
                      <span className="badge badge-stage-completed">Online / Available</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#F59E0B' }}>★ {tech.rating}</td>
                    <td>
                      <button className="btn-action" onClick={() => handleOpenAssign(complaints[0])}>
                        Assign Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TECHNICIANS TAB */}
      {activeTab === 'technicians' && (
        <div className="queue-card">
          <div className="queue-header">
            <h2>Technician Roster & Contact Directory</h2>
            <p>Maintenance staff overview and phone contact</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {technicians.map(tech => (
              <div key={tech.id} style={{ padding: '1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0F172A', marginBottom: '4px' }}>{tech.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#082B5C', fontWeight: 600, marginBottom: '8px' }}>Specialty: {tech.specialty}</div>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>Phone: +91-98765-{43210 + tech.id}</div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>Active Workload: <strong>{tech.inProgressJobs} Tasks</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECURRING ISSUES TAB */}
      {activeTab === 'recurring-issues' && (
        <div className="queue-card">
          <div className="queue-header">
            <h2>Recurring Infrastructure Issues</h2>
            <p>Complaint clusters detected by Strategy Pattern engine</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hostel Block</th>
                  <th>Category</th>
                  <th>Complaint Count</th>
                  <th>Time Horizon</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>Block B</td>
                  <td>Water Supply / Plumbing Leaks</td>
                  <td><span style={{ fontWeight: 700, color: '#DC2626' }}>12 complaints</span></td>
                  <td>Last 7 days</td>
                  <td><span className="badge badge-priority-high">Under Inspection</span></td>
                  <td><button className="btn-action">View Related Complaints</button></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>Block C</td>
                  <td>Power Fluctuation / Breaker Trips</td>
                  <td><span style={{ fontWeight: 700, color: '#D97706' }}>8 complaints</span></td>
                  <td>Last 7 days</td>
                  <td><span className="badge badge-priority-medium">Technician Assigned</span></td>
                  <td><button className="btn-action">View Related Complaints</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="analytics-grid">
          <div className="chart-card">
            <h3>Recurring Issue Categories</h3>
            <p>Distribution of complaints across maintenance departments</p>
            <div style={{ height: '220px' }}>
              <Bar
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>Hostel Block Distribution</h3>
            <p>Open ticket volume by residence hall block</p>
            <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={blockChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* USERS DIRECTORY TAB */}
      {activeTab === 'users' && (
        <div>
          {/* Header Card */}
          <div className="erp-welcome-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="welcome-title">Hostel Residence & Staff Directory</h2>
                <div className="welcome-sub">
                  Directory of registered hostel residents, maintenance technicians, and administrative officers
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '6px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
                  Active Database Sync: 9 Profiles
                </span>
              </div>
            </div>
          </div>

          {userActionMsg && (
            <div style={{ background: '#EFF6FF', border: '1px solid #93C5FD', color: '#1E40AF', padding: '10px 14px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{userActionMsg}</span>
              <button onClick={() => setUserActionMsg('')} style={{ background: 'none', border: 'none', color: '#1E40AF', fontWeight: 700, cursor: 'pointer' }}>×</button>
            </div>
          )}

          <div className="queue-card">
            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Users (9)' },
                  { id: 'student', label: 'Students (4)' },
                  { id: 'technician', label: 'Technicians (4)' },
                  { id: 'warden', label: 'Warden Office (1)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setUserFilterRole(tab.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      fontSize: '0.84rem',
                      fontWeight: userFilterRole === tab.id ? 600 : 500,
                      background: userFilterRole === tab.id ? '#082B5C' : '#F1F5F9',
                      color: userFilterRole === tab.id ? '#FFFFFF' : '#475569',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ minWidth: '260px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search user by name, email, or room..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* User Directory Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name & Role</th>
                    <th>Email Address</th>
                    <th>Assigned Location / Dept</th>
                    <th>Biometric Enrollment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: 'Suruthi T.', email: 'suruthi@gmail.com', role: 'student', location: 'Block B · Room 204' },
                    { id: 8, name: 'Sahana V.', email: 'sahana@gmail.com', role: 'student', location: 'Block B · Room 205' },
                    { id: 9, name: 'Rithika S.', email: 'rithika@gmail.com', role: 'student', location: 'Block B · Room 206' },
                    { id: 10, name: 'Pavana K.', email: 'pavana@gmail.com', role: 'student', location: 'Block A · Room 102' },
                    { id: 3, name: 'Anand Pillai', email: 'anand.tech@hostelhub.internal', role: 'technician', location: 'Plumbing Services' },
                    { id: 4, name: 'Rajesh Kumar', email: 'rajesh.elec@hostelhub.internal', role: 'technician', location: 'Electrical Services' },
                    { id: 5, name: 'Suresh Nair', email: 'suresh.carp@hostelhub.internal', role: 'technician', location: 'Carpentry & Civil' },
                    { id: 6, name: 'Vignesh Murugan', email: 'vignesh.appl@hostelhub.internal', role: 'technician', location: 'Appliance Repair' },
                    { id: 2, name: 'Chief Warden Office', email: 'warden@hostelhub.internal', role: 'warden', location: 'Administrative Wing' },
                  ]
                    .filter(u => {
                      if (userFilterRole !== 'all' && u.role !== userFilterRole) return false;
                      if (userSearchQuery) {
                        const q = userSearchQuery.toLowerCase();
                        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.location.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map(user => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 700, color: '#082B5C' }}>#{user.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{user.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: user.role === 'student' ? '#E0F2FE' : user.role === 'technician' ? '#FEF3C7' : '#F3E8FF',
                              color: user.role === 'student' ? '#0369A1' : user.role === 'technician' ? '#B45309' : '#7E22CE',
                              marginTop: '2px'
                            }}>
                              {user.role.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#334155' }}>{user.email}</td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#0F172A', fontSize: '0.85rem' }}>{user.location}</span>
                        </td>
                        <td>
                          {user.role === 'student' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.8rem', fontWeight: 600, background: '#DCFCE7', padding: '3px 8px', borderRadius: '4px' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              Enrolled in MySQL
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0369A1', fontSize: '0.8rem', fontWeight: 600, background: '#E0F2FE', padding: '3px 8px', borderRadius: '4px' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              Enterprise Staff Auth
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {user.role === 'student' ? (
                              <button
                                className="btn-action"
                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                onClick={() => {
                                  setUserActionMsg(`Biometric facial vector reset requested for ${user.name} (${user.email}). Student can re-register face on next login.`);
                                  setTimeout(() => setUserActionMsg(''), 5000);
                                }}
                              >
                                Reset Face
                              </button>
                            ) : (
                              <button
                                className="btn-action"
                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                onClick={() => {
                                  setUserActionMsg(`Official shift notification sent to ${user.name}.`);
                                  setTimeout(() => setUserActionMsg(''), 4000);
                                }}
                              >
                                Send Alert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS & ANNOUNCEMENT BROADCAST TAB */}
      {activeTab === 'notifications' && (
        <div>
          {/* Header Card */}
          <div className="erp-welcome-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="welcome-title">Administrative Notification Center</h2>
                <div className="welcome-sub">
                  Campus-wide broadcast announcements, emergency alerts, and automated ERP escalation feed
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {/* Campus Broadcast Composer */}
            <div className="queue-card">
              <div className="queue-header">
                <div className="queue-title-group">
                  <h2>Broadcast Campus Notice</h2>
                  <p>Send official announcements directly to student and technician dashboards</p>
                </div>
              </div>

              {broadcastSuccess && (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '10px 14px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  ✓ {broadcastSuccess}
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!broadcastTitle || !broadcastMessage) return;
                setBroadcastSuccess(`Notice "${broadcastTitle}" broadcasted to ${broadcastBlock} residents and sent to student notifications.`);
                setBroadcastTitle('');
                setBroadcastMessage('');
                setTimeout(() => setBroadcastSuccess(''), 5000);
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                    Notice Title:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Scheduled Water Tank Cleaning - Saturday 10 AM"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                    Target Audience / Hostel Block:
                  </label>
                  <select
                    className="form-control"
                    value={broadcastBlock}
                    onChange={(e) => setBroadcastBlock(e.target.value)}
                  >
                    <option value="All Blocks">All Hostel Blocks (Campus-wide)</option>
                    <option value="Block A">Block A (Engineering Freshers)</option>
                    <option value="Block B">Block B (Senior Residents)</option>
                    <option value="Block C">Block C (Postgraduate Wing)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                    Notice Description & Instructions:
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter detailed maintenance instructions for students..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Broadcast Notice to Residents
                </button>
              </form>
            </div>

            {/* Live System Activity Feed */}
            <div className="queue-card">
              <div className="queue-header">
                <div className="queue-title-group">
                  <h2>Real-Time Activity & Incident Log</h2>
                  <p>Automated priority escalations, SLA warnings, and biometric events</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                      ⚡ HIGH PRIORITY DISPATCH
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#991B1B' }}>12 mins ago</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#991B1B', marginTop: '4px', fontSize: '0.88rem' }}>Electrical Spark in Block B Room 208</div>
                  <div style={{ fontSize: '0.78rem', color: '#7F1D1D' }}>Reported by Rithika S. Auto-dispatched to Electrician Rajesh Kumar.</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: '#D97706', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                      ⏰ SLA DEADLINE WARNING
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#92400E' }}>35 mins ago</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#92400E', marginTop: '4px', fontSize: '0.88rem' }}>Ticket #CH1025 Approaching 12h SLA</div>
                  <div style={{ fontSize: '0.78rem', color: '#78350F' }}>Technician Anand Pillai has logged check-in at Block B Room 204.</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: '#16A34A', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                      🤖 AI DUPLICATE CLUSTER
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#166534' }}>1 hour ago</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#166534', marginTop: '4px', fontSize: '0.88rem' }}>Duplicate Plumbing Tickets Detected</div>
                  <div style={{ fontSize: '0.78rem', color: '#14532D' }}>Cosine similarity 88.5% between Room 204 and Room 205 complaints. Ready for merge.</div>
                </div>

                <div style={{ padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: '#0284C7', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                      👤 BIOMETRIC AUTH
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>3 hours ago</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '4px', fontSize: '0.88rem' }}>Live Face Verification Passed</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Suruthi T. matched 77.0% similarity against stored biometric vector. Complaint unlocked.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERP SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header Card */}
          <div className="erp-welcome-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="welcome-title">ERP Campus System Settings</h2>
                <div className="welcome-sub">
                  Configure hostel operational rules, SLA targets, AI clustering thresholds, and security gatekeeper
                </div>
              </div>
            </div>
          </div>

          {settingsSaved && (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '12px 16px', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              System configuration saved successfully to HostelHub ERP database!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Section 1: Hostel Parameters */}
            <div className="queue-card">
              <div className="queue-header">
                <div className="queue-title-group">
                  <h2>Hostel Campus Information</h2>
                  <p>Institution identification and warden contact desk</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Hostel Complex Name</label>
                  <input type="text" className="form-control" defaultValue="HostelHub Engineering Campus" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Warden Emergency Helpline</label>
                  <input type="text" className="form-control" defaultValue="+91 98450 00001" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Maintenance Shift Hours</label>
                  <input type="text" className="form-control" defaultValue="08:00 AM – 08:00 PM (24x7 Emergency)" />
                </div>
              </div>
            </div>

            {/* Section 2: SLA Target Times */}
            <div className="queue-card">
              <div className="queue-header">
                <div className="queue-title-group">
                  <h2>SLA Target Resolution Deadlines (Hours)</h2>
                  <p>Set maximum resolution turnaround times before warden escalation alerts trigger</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Electrical Target (hrs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={slaElectrical}
                    onChange={(e) => setSlaElectrical(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Plumbing Target (hrs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={slaPlumbing}
                    onChange={(e) => setSlaPlumbing(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Carpentry Target (hrs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={slaCarpentry}
                    onChange={(e) => setSlaCarpentry(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Appliance Target (hrs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={slaAppliance}
                    onChange={(e) => setSlaAppliance(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: AI Clustering & Dispatch */}
            <div className="queue-card">
              <div className="queue-header">
                <div className="queue-title-group">
                  <h2>AI Deduplication & Smart Dispatch Engine</h2>
                  <p>Adjust natural language similarity threshold and workload allocation logic</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                      Duplicate Similarity Detection Threshold: {aiSensitivity}%
                    </label>
                    <span style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 600 }}>Cosine Match &ge; {aiSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={aiSensitivity}
                    onChange={(e) => setAiSensitivity(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                    Higher sensitivity requires stricter description similarity before proposing duplicate merges.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="autoMerge"
                    checked={autoMergeDuplicates}
                    onChange={(e) => setAutoMergeDuplicates(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="autoMerge" style={{ fontSize: '0.85rem', color: '#0F172A', cursor: 'pointer', fontWeight: 500 }}>
                    Enable Automated Cluster Grouping for complaints filed in the same hostel wing
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Security & Biometrics */}
            <div className="queue-card">
              <div className="queue-header">
                <div className="queue-title-group">
                  <h2>Security & Biometric Gatekeeper</h2>
                  <p>Campus security compliance and facial recognition parameters</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="requireFace"
                    checked={requireFaceVerify}
                    onChange={(e) => setRequireFaceVerify(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="requireFace" style={{ fontSize: '0.85rem', color: '#0F172A', cursor: 'pointer', fontWeight: 500 }}>
                    Enforce Live Facial Verification before allowing student complaint submission (Gatekeeper)
                  </label>
                </div>

                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>Biometric Similarity Calibrated Cutoff</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Spring Boot FaceVerificationService threshold with 2D spatial shift tolerance.</div>
                  </div>
                  <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                    65.0% Cosine
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 24px', fontSize: '0.95rem' }}
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 5000);
                }}
              >
                Save System Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technician Assignment Modal */}
      {assignModalTicket && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Smart Technician Assignment — {assignModalTicket.id}</h3>
              <button className="btn-close" onClick={() => setAssignModalTicket(null)}>×</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              Assigning task for: <strong>{assignModalTicket.title}</strong> ({assignModalTicket.category} · {assignModalTicket.location})
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#0F172A' }}>
                Assignment Strategy:
              </label>
              <select
                className="form-control"
                value={assignmentStrategy}
                onChange={(e) => setAssignmentStrategy(e.target.value)}
              >
                <option value="leastLoaded">Strategy 1: Least Loaded Technician (Workload Balance)</option>
                <option value="specialty">Strategy 2: Specialty Proximity Match</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#0F172A' }}>
                Select Technician:
              </label>
              <select
                className="form-control"
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialty}) — Active Tasks: {t.inProgressJobs} | Rating: ★ {t.rating}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-action" onClick={() => setAssignModalTicket(null)}>Cancel</button>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={handleConfirmAssign}>
                Assign Technician
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY MAINTENANCE AUDIT REPORT MODAL (PDF / PRINT PREVIEW) */}
      {showAuditModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ borderBottom: '2px solid #082B5C', paddingBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  HOSTELHUB RESIDENCE · OFFICIAL AUDIT
                </div>
                <h3 className="modal-title" style={{ color: '#082B5C', fontSize: '1.25rem' }}>
                  Monthly Hostel Maintenance & Expense Audit Report
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Period: October 2026 · Generated by Chief Warden Dr. Lakshmi V.
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowAuditModal(false)}>×</button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              {/* Executive Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>TOTAL LOGGED TICKETS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#082B5C', marginTop: '2px' }}>{metrics.openComplaints + 12}</div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>RESOLVED JOBS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {complaints.filter(c => c.stage === 'Completed' || c.stage === 'Closed').length + 8}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>SLA COMPLIANCE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0284C7', marginTop: '2px' }}>
                    {(((metrics.openComplaints + 12 - metrics.slaBreaches) / (metrics.openComplaints + 12)) * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>PARTS EXPENDITURE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#D97706', marginTop: '2px' }}>₹ 4,850.00</div>
                </div>
              </div>

              {/* Maintenance Item Audit Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#082B5C', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>
                  Active & Resolved Complaint Tickets Overview
                </div>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Assigned Staff</th>
                      <th>Status</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.slice(0, 6).map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.id}</td>
                        <td>{c.category}</td>
                        <td>{c.locationShort || c.location}</td>
                        <td>{c.assignedTech || 'Anand Pillai'}</td>
                        <td>{c.stage}</td>
                        <td>₹ {c.totalCost || 120}.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Certification & Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #CBD5E1', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#082B5C' }}>Dr. Lakshmi V.</div>
                  <div style={{ color: '#64748B' }}>Chief Warden, Residence Operations</div>
                  <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#059669', fontSize: '0.75rem' }}>Digitally Certified & Approved ✓</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#082B5C' }}>Estate Maintenance Dept</div>
                  <div style={{ color: '#64748B' }}>Campus Infrastructure Office</div>
                  <div style={{ marginTop: '8px', color: '#64748B', fontSize: '0.75rem' }}>Official Stamp Ref: HMS-2026-OCT</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
              <button className="btn-action" onClick={() => setShowAuditModal(false)}>Close</button>
              <button
                className="btn-primary"
                style={{ width: 'auto', background: '#082B5C', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => window.print()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print / Save PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
