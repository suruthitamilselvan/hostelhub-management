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
  technicians
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

      {/* NOTIFICATIONS, USERS, SETTINGS TABS */}
      {(activeTab === 'notifications' || activeTab === 'users' || activeTab === 'settings') && (
        <div className="queue-card">
          <div className="queue-header">
            <h2>Warden Administration — {activeTab.toUpperCase()}</h2>
            <p>Configure residence portal options and staff access controls</p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#475569' }}>
            Administrative panel for {activeTab} is configured and active.
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
