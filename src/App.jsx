import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StudentModule from './components/StudentModule';
import WardenModule from './components/WardenModule';
import TechnicianModule from './components/TechnicianModule';
import FaceVerificationModal from './components/FaceVerificationModal';
import LoginModal from './components/LoginModal';
import AccessDeniedModal from './components/AccessDeniedModal';
import ChatDrawer from './components/ChatDrawer';
import { apiService } from './api/apiService';
import { initialMetrics, initialComplaints, initialDuplicateSuggestions, initialTechnicians, initialChatMessages } from './data/initialData';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hostelhub_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 1,
      name: 'Suruthi T.',
      email: 'suruthi@hostel.edu',
      role: 'student'
    };
  });

  const [activeRole, setActiveRole] = useState(() => {
    try {
      const saved = localStorage.getItem('hostelhub_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch (e) {}
    return 'student';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState('student');
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    isOpen: false,
    targetRole: 'warden'
  });

  // Persist user session to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hostelhub_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hostelhub_user');
    }
  }, [currentUser]);

  // Global State Synchronized across all 3 Role Views & Spring Boot REST API
  const [metrics, setMetrics] = useState(initialMetrics);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [duplicateSuggestions, setDuplicateSuggestions] = useState(initialDuplicateSuggestions);
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatTicket, setActiveChatTicket] = useState(null);

  // Handle Role Switching with Strict RBAC Role Guard
  const handleRoleSwitch = (newRole) => {
    if (currentUser && currentUser.role !== newRole) {
      setAccessDeniedModal({
        isOpen: true,
        targetRole: newRole
      });
      return;
    }
    setActiveRole(newRole);
    setActiveTab('dashboard');
  };

  // Load Live Data from Spring Boot Backend on Mount
  useEffect(() => {
    async function loadBackendData() {
      const liveComplaints = await apiService.getAllComplaints();
      if (liveComplaints && liveComplaints.length > 0) {
        const formatted = liveComplaints.map(c => ({
          id: c.id,
          title: c.title,
          location: `${c.locationBlock} · ${c.locationRoom}`,
          locationShort: `${c.locationBlock} Room ${c.locationRoom}`,
          category: c.category ? c.category.charAt(0) + c.category.slice(1).toLowerCase() : 'Plumbing',
          priority: c.priority ? c.priority.charAt(0) + c.priority.slice(1).toLowerCase() : 'Medium',
          stage: c.stage === 'IN_PROGRESS' ? 'In Progress' : c.stage === 'UNDER_REVIEW' ? 'Under Review' : c.stage ? c.stage.charAt(0) + c.stage.slice(1).toLowerCase() : 'Submitted',
          stageStep: c.stage === 'SUBMITTED' ? 1 : c.stage === 'UNDER_REVIEW' ? 2 : c.stage === 'ASSIGNED' ? 3 : c.stage === 'IN_PROGRESS' ? 4 : c.stage === 'COMPLETED' ? 5 : 6,
          sla: c.slaDeadlineText || '24h to SLA',
          slaBreached: c.slaBreached || false,
          studentName: c.student ? c.student.name : 'Suruthi T.',
          assignedTech: c.assignedTechnician ? c.assignedTechnician.name : null,
          beforePhoto: c.beforePhotoUrl || 'before-tap.jpg',
          afterPhoto: c.afterPhotoUrl,
          rating: c.rating || 0,
          parts: c.spareParts ? c.spareParts.map(p => ({
            id: p.id,
            name: p.partName,
            qty: p.quantity,
            unitCost: p.unitCost,
            lineTotal: p.lineTotal
          })) : [],
          totalCost: c.totalCost || 0
        }));
        setComplaints(formatted);
      }

      const liveMetrics = await apiService.getWardenMetrics();
      if (liveMetrics) {
        setMetrics(prev => ({
          ...prev,
          openComplaints: liveMetrics.openComplaints !== undefined ? liveMetrics.openComplaints : prev.openComplaints,
          slaBreaches: liveMetrics.slaBreaches !== undefined ? liveMetrics.slaBreaches : prev.slaBreaches,
          mergeSuggestions: liveMetrics.mergeSuggestions !== undefined ? liveMetrics.mergeSuggestions : prev.mergeSuggestions,
          techniciansOnline: liveMetrics.techniciansOnline !== undefined ? liveMetrics.techniciansOnline : prev.techniciansOnline
        }));
      }

      const liveDuplicates = await apiService.getDuplicateSuggestions();
      if (liveDuplicates && liveDuplicates.length > 0) {
        const formattedDupes = liveDuplicates.map((d, idx) => ({
          id: idx + 1,
          block: d.block,
          category: d.category ? d.category.charAt(0) + d.category.slice(1).toLowerCase() : 'Plumbing',
          ticketIds: d.tickets,
          targetTicket: d.targetTicket
        }));
        setDuplicateSuggestions(formattedDupes);
      }
    }

    loadBackendData();
  }, []);

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    setIsVerified(false);
    setActiveRole(userObj.role);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginInitialRole(activeRole);
    setIsLoginModalOpen(true);
  };

  const handleVerifySuccess = () => {
    setIsVerified(true);
    setIsVerifyModalOpen(false);
  };

  const handleMergeDuplicate = async (suggestionId, targetTicketId, sourceTicketId) => {
    await apiService.mergeComplaints(targetTicketId.replace('#', ''), sourceTicketId.replace('#', ''));

    setComplaints(prev => prev.map(c => {
      if (c.id === sourceTicketId) {
        return { ...c, stage: 'Closed', stageStep: 6, isMerged: true, parentTicket: targetTicketId };
      }
      return c;
    }));

    setDuplicateSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    setMetrics(prev => ({ ...prev, mergeSuggestions: Math.max(0, prev.mergeSuggestions - 1) }));
  };

  const handleAssignTechnician = async (ticketId, techName) => {
    const cleanId = ticketId.replace('#', '');
    const apiRes = await apiService.autoAssignTechnician(cleanId, 'leastLoaded');

    setComplaints(prev => prev.map(c => {
      if (c.id === ticketId) {
        return {
          ...c,
          assignedTech: apiRes && apiRes.assignedTechnician ? apiRes.assignedTechnician.name : techName,
          stage: 'Assigned',
          stageStep: 3
        };
      }
      return c;
    }));
  };

  const updateDuplicatesFromList = (list) => {
    const groups = {};
    list.forEach(c => {
      const block = c.locationShort ? c.locationShort.split(' ')[0] + ' ' + (c.locationShort.split(' ')[1] || 'B') : (c.location ? c.location.split('·')[0].trim() : 'Block B');
      const key = `${block}_${c.category}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    const dupes = [];
    let dupeId = 1;
    Object.entries(groups).forEach(([key, items]) => {
      if (items.length >= 2) {
        const [block, category] = key.split('_');
        dupes.push({
          id: dupeId++,
          block,
          category,
          ticketIds: items.map(i => i.id),
          targetTicket: items[0].id
        });
      }
    });
    setDuplicateSuggestions(dupes);
    setMetrics(prev => ({ ...prev, mergeSuggestions: dupes.length }));
  };

  const handleSubmitNewComplaint = async (formData) => {
    if (!isVerified) {
      setIsVerifyModalOpen(true);
      return;
    }

    const activeStudentId = currentUser?.id || 1;
    const activeStudentName = currentUser?.name || 'Suruthi T.';

    const apiRes = await apiService.createComplaint({
      studentId: activeStudentId,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      locationBlock: formData.locationBlock,
      locationRoom: formData.locationRoom,
      photoName: formData.photoName
    });

    const newId = apiRes ? apiRes.id : `#CH${1001 + complaints.length}`;
    const isElectrical = formData.category === 'Electrical';

    const newTicket = {
      id: newId,
      title: formData.title,
      location: `${formData.locationBlock} · ${formData.locationRoom}`,
      locationShort: `${formData.locationBlock} Room ${formData.locationRoom}`,
      category: formData.category,
      priority: isElectrical ? 'High' : 'Medium',
      stage: 'Submitted',
      stageStep: 1,
      sla: '24h to SLA',
      slaBreached: false,
      studentName: activeStudentName,
      assignedTech: null,
      beforePhoto: formData.photoName || 'evidence.jpg',
      afterPhoto: null,
      rating: 0,
      parts: [],
      totalCost: 0
    };

    const updatedComplaints = [newTicket, ...complaints];
    setComplaints(updatedComplaints);
    setMetrics(prev => ({ ...prev, openComplaints: updatedComplaints.filter(c => c.stage !== 'Closed').length }));
    updateDuplicatesFromList(updatedComplaints);
  };

  const handleOpenChat = (ticket) => {
    setActiveChatTicket(ticket);
    setIsChatOpen(true);
  };

  const handleSendMessage = (text) => {
    const sender = activeRole === 'technician' ? 'technician' : 'student';
    const newMsg = {
      id: Date.now(),
      sender,
      text
    };
    setChatMessages(prev => [...prev, newMsg]);

    // Simulated automated conversational reply
    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        sender: sender === 'student' ? 'technician' : 'student',
        text: sender === 'student'
          ? 'Noted! On my way to your room with replacement parts now.'
          : 'Thanks for the quick turnaround! The fixture is ready for inspection.'
      };
      setChatMessages(prev => [...prev, replyMsg]);
    }, 1200);
  };

  const handleRateComplaint = async (ticketId, rating) => {
    const cleanId = ticketId.replace('#', '');
    await apiService.rateComplaint(cleanId, rating);

    setComplaints(prev => prev.map(c => {
      if (c.id === ticketId) {
        return { ...c, rating };
      }
      return c;
    }));
  };

  const handleReopenComplaint = async (ticketId) => {
    const cleanId = ticketId.replace('#', '');
    await apiService.updateStage(cleanId, 'UNDER_REVIEW');

    setComplaints(prev => prev.map(c => {
      if (c.id === ticketId) {
        return {
          ...c,
          stage: 'Under Review',
          stageStep: 2,
          sla: '12h to SLA',
          slaBreached: false
        };
      }
      return c;
    }));
  };

  const activeTechnicianJob = complaints.find(c => c.assignedTech === 'Anand Pillai' || (c.assignedTech && c.stage !== 'Closed')) || complaints.find(c => c.stage === 'In Progress' || c.stage === 'Assigned') || complaints[0] || null;

  const handleAddSparePart = async (partData) => {
    if (!activeTechnicianJob) return;
    const cleanId = activeTechnicianJob.id.replace('#', '');
    await apiService.addSparePart(cleanId, partData);

    const lineTotal = partData.qty * partData.unitCost;
    setComplaints(prev => prev.map(c => {
      if (c.id === activeTechnicianJob.id) {
        const newPart = {
          id: Date.now(),
          name: partData.name,
          qty: partData.qty,
          unitCost: partData.unitCost,
          lineTotal
        };
        const updatedParts = [...(c.parts || []), newPart];
        const newTotalCost = updatedParts.reduce((sum, p) => sum + p.lineTotal, 0);

        return {
          ...c,
          parts: updatedParts,
          totalCost: newTotalCost
        };
      }
      return c;
    }));
  };

  const handleDeleteSparePart = (partId) => {
    if (!activeTechnicianJob) return;
    setComplaints(prev => prev.map(c => {
      if (c.id === activeTechnicianJob.id) {
        const updatedParts = (c.parts || []).filter(p => p.id !== partId);
        const newTotalCost = updatedParts.reduce((sum, p) => sum + p.lineTotal, 0);

        return {
          ...c,
          parts: updatedParts,
          totalCost: newTotalCost
        };
      }
      return c;
    }));
  };

  const handleUploadAfterPhoto = (photoName) => {
    if (!activeTechnicianJob) return;
    setComplaints(prev => prev.map(c => {
      if (c.id === activeTechnicianJob.id) {
        return { ...c, afterPhoto: photoName };
      }
      return c;
    }));
  };

  const handleMarkJobCompleted = async () => {
    if (!activeTechnicianJob) return;
    const targetId = activeTechnicianJob.id;
    const cleanId = targetId.replace('#', '');
    const finalAfterPhoto = activeTechnicianJob.afterPhoto || 'after-repair.jpg';

    // 1. Immediate reactive state update for instant UI feedback
    setComplaints(prev => prev.map(c => {
      if (c.id === targetId) {
        return {
          ...c,
          stage: 'Completed',
          stageStep: 5,
          afterPhoto: finalAfterPhoto
        };
      }
      return c;
    }));

    setMetrics(prev => ({
      ...prev,
      openComplaints: Math.max(0, prev.openComplaints - 1)
    }));

    // 2. Sync to Spring Boot backend
    try {
      await apiService.markJobCompleted(cleanId, finalAfterPhoto.startsWith('data:image') ? 'camera-proof.jpg' : finalAfterPhoto);
    } catch (e) {
      console.warn('Backend mark completed note:', e.message);
    }
  };

  return (
    <div className="app-container">
      {/* 1. Persistent Top Application Header */}
      <Header
        activeRole={activeRole}
        setActiveRole={handleRoleSwitch}
        isVerified={isVerified}
        onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        unreadCount={2}
        onOpenNotifications={() => setActiveTab('notifications')}
      />

      {/* 2. Main Portal Layout: Left Sidebar + Main Content Area */}
      <div id="live-workspace" className="erp-body-layout">
        <Sidebar
          activeRole={activeRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          currentUser={currentUser}
          isVerified={isVerified}
        />

        <main className="erp-main-area">
          {activeRole === 'student' && (
            <StudentModule
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              complaints={complaints}
              onSubmitNewComplaint={handleSubmitNewComplaint}
              onOpenChat={handleOpenChat}
              onRateComplaint={handleRateComplaint}
              onReopenComplaint={handleReopenComplaint}
              isVerified={isVerified}
              onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeRole === 'warden' && (
            <WardenModule
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              metrics={metrics}
              complaints={complaints}
              duplicateSuggestions={duplicateSuggestions}
              onMergeDuplicate={handleMergeDuplicate}
              onAssignTechnician={handleAssignTechnician}
              technicians={technicians}
            />
          )}

          {activeRole === 'technician' && (
            <TechnicianModule
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeTask={activeTechnicianJob}
              onAddSparePart={handleAddSparePart}
              onDeleteSparePart={handleDeleteSparePart}
              onUploadAfterPhoto={handleUploadAfterPhoto}
              onMarkJobCompleted={handleMarkJobCompleted}
            />
          )}
        </main>
      </div>

      {/* Access Denied Modal for Strict Role Guard */}
      <AccessDeniedModal
        isOpen={accessDeniedModal.isOpen}
        onClose={() => setAccessDeniedModal(prev => ({ ...prev, isOpen: false }))}
        targetRole={accessDeniedModal.targetRole}
        currentUser={currentUser}
        onSwitchAccount={(targetRole) => {
          setLoginInitialRole(targetRole);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Single Sign-On Access Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={loginInitialRole}
      />

      {/* Face Biometric Verification Modal */}
      <FaceVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerifySuccess={handleVerifySuccess}
        currentUser={currentUser}
      />

      {/* Real-time Live Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeTicket={activeChatTicket}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessage}
        activeRole={activeRole}
      />
    </div>
  );
}
