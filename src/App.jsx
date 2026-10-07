import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StudentModule from './components/StudentModule';
import WardenModule from './components/WardenModule';
import TechnicianModule from './components/TechnicianModule';
import FaceVerificationModal from './components/FaceVerificationModal';
import LoginModal from './components/LoginModal';
import ChatDrawer from './components/ChatDrawer';
import { apiService } from './api/apiService';
import { initialMetrics, initialComplaints, initialDuplicateSuggestions, initialTechnicians, initialChatMessages } from './data/initialData';

export default function App() {
  const [activeRole, setActiveRole] = useState('warden');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Global State Synchronized across all 3 Role Views & Spring Boot REST API
  const [metrics, setMetrics] = useState(initialMetrics);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [duplicateSuggestions, setDuplicateSuggestions] = useState(initialDuplicateSuggestions);
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatTicket, setActiveChatTicket] = useState(null);

  // Handle Role Switching and reset tab to dashboard
  const handleRoleSwitch = (newRole) => {
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
    handleRoleSwitch(userObj.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  const handleVerifySuccess = async () => {
    await apiService.verifyFace(1, "[0.1248, -0.4512, 0.8819, 0.0412, ...]", "192.168.1.42");
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

  const handleSubmitNewComplaint = async (formData) => {
    const apiRes = await apiService.createComplaint({
      studentId: 1,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      locationBlock: formData.locationBlock,
      locationRoom: formData.locationRoom,
      photoName: formData.photoName
    });

    const newId = apiRes ? apiRes.id : `#CH${1031 + Math.floor(Math.random() * 8000)}`;
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
      studentName: 'Suruthi T.',
      assignedTech: null,
      beforePhoto: formData.photoName || 'evidence.jpg',
      afterPhoto: null,
      rating: 0,
      parts: [],
      totalCost: 0
    };

    setComplaints(prev => [newTicket, ...prev]);
    setMetrics(prev => ({ ...prev, openComplaints: prev.openComplaints + 1 }));
  };

  const handleOpenChat = (ticket) => {
    setActiveChatTicket(ticket);
    setIsChatOpen(true);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      sender: activeRole === 'technician' ? 'technician' : 'student',
      text
    };
    setChatMessages(prev => [...prev, newMsg]);
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

  const activeTechnicianJob = complaints.find(c => c.id === '#CH1025') || complaints[0];

  const handleAddSparePart = async (partData) => {
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
    setComplaints(prev => prev.map(c => {
      if (c.id === activeTechnicianJob.id) {
        return { ...c, afterPhoto: photoName };
      }
      return c;
    }));
  };

  const handleMarkJobCompleted = async () => {
    const cleanId = activeTechnicianJob.id.replace('#', '');
    await apiService.markJobCompleted(cleanId, activeTechnicianJob.afterPhoto || 'after-tap.jpg');

    setComplaints(prev => prev.map(c => {
      if (c.id === activeTechnicianJob.id) {
        return {
          ...c,
          stage: 'Completed',
          stageStep: 5,
          afterPhoto: c.afterPhoto || 'after-tap.jpg'
        };
      }
      return c;
    }));

    setMetrics(prev => ({
      ...prev,
      openComplaints: Math.max(0, prev.openComplaints - 1)
    }));
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

      {/* Single Sign-On Access Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Face Biometric Verification Modal */}
      <FaceVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerifySuccess={handleVerifySuccess}
      />

      {/* Real-time Live Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeTicket={activeChatTicket}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
