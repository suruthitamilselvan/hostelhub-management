// Mock initial state data matching exact tickets from Lovable reference design

export const initialMetrics = {
  openComplaints: 5,
  slaBreaches: 3,
  mergeSuggestions: 2,
  techniciansOnline: 4
};

export const initialDuplicateSuggestions = [
  {
    id: 1,
    block: 'Block B',
    category: 'Plumbing',
    ticketIds: ['#CH1025', '#CH1030'],
    targetTicket: '#CH1025'
  },
  {
    id: 2,
    block: 'Block B',
    category: 'Electrical',
    ticketIds: ['#CH1026', '#CH1027'],
    targetTicket: '#CH1026'
  }
];

export const initialComplaints = [
  {
    id: '#CH1025',
    title: 'Wash basin tap leaking continuously',
    location: 'Block B · 204',
    locationShort: 'Block B Room 204',
    category: 'Plumbing',
    priority: 'Medium',
    stage: 'In Progress',
    stageStep: 4,
    sla: '5h to SLA',
    slaBreached: false,
    studentName: 'Suruthi T.',
    assignedTech: 'Anand Pillai',
    beforePhoto: 'before-tap.jpg',
    afterPhoto: null,
    rating: 0,
    parts: [
      { id: 1, name: 'Tap washer set', qty: 2, unitCost: 45, lineTotal: 90 }
    ],
    totalCost: 90
  },
  {
    id: '#CH1026',
    title: 'Power socket sparking near study table',
    location: 'Block B · 207',
    locationShort: 'Block B Room 207',
    category: 'Electrical',
    priority: 'High',
    stage: 'Assigned',
    stageStep: 3,
    sla: 'SLA breached · 5h over',
    slaBreached: true,
    studentName: 'Rohan M.',
    assignedTech: 'K. Rajesh',
    beforePhoto: 'sparking-socket.jpg',
    afterPhoto: null,
    rating: 0,
    parts: [],
    totalCost: 0
  },
  {
    id: '#CH1027',
    title: 'Corridor lights not working on 2nd floor',
    location: 'Block B · Corridor',
    locationShort: 'Block B Corridor',
    category: 'Electrical',
    priority: 'High',
    stage: 'Under Review',
    stageStep: 2,
    sla: 'SLA breached · 2h over',
    slaBreached: true,
    studentName: 'Ananya P.',
    assignedTech: null,
    beforePhoto: 'dark-corridor.jpg',
    afterPhoto: null,
    rating: 0,
    parts: [],
    totalCost: 0
  },
  {
    id: '#CH1028',
    title: 'Wi-Fi drops every 10 minutes',
    location: 'Block C · 312',
    locationShort: 'Block C Room 312',
    category: 'Internet',
    priority: 'Medium',
    stage: 'Completed',
    stageStep: 5,
    sla: '18h to SLA',
    slaBreached: false,
    studentName: 'Divya S',
    assignedTech: 'Divya S',
    beforePhoto: null,
    afterPhoto: null,
    rating: 5,
    parts: [],
    totalCost: 0
  },
  {
    id: '#CH1029',
    title: 'Cupboard door hinge broken',
    location: 'Block A · 115',
    locationShort: 'Block A Room 115',
    category: 'Carpentry',
    priority: 'Low',
    stage: 'Closed',
    stageStep: 6,
    sla: '32h to SLA',
    slaBreached: false,
    studentName: 'Karthik K.',
    assignedTech: 'M. Senthil',
    beforePhoto: null,
    afterPhoto: null,
    rating: 4,
    parts: [],
    totalCost: 0
  },
  {
    id: '#CH1030',
    title: 'Bathroom drain blocked',
    location: 'Block B · 210',
    locationShort: 'Block B Room 210',
    category: 'Plumbing',
    priority: 'Medium',
    stage: 'Submitted',
    stageStep: 1,
    sla: 'SLA breached · 2h over',
    slaBreached: true,
    studentName: 'Suruthi T.',
    assignedTech: null,
    beforePhoto: null,
    afterPhoto: null,
    rating: 0,
    parts: [],
    totalCost: 0
  }
];

export const initialTechnicians = [
  { id: 1, name: 'Anand Pillai', specialty: 'Plumbing', completedJobs: 96, inProgressJobs: 1, rating: 4.4 },
  { id: 2, name: 'Divya S', specialty: 'Internet', completedJobs: 45, inProgressJobs: 0, rating: 4.8 },
  { id: 3, name: 'K. Rajesh', specialty: 'Electrical', completedJobs: 110, inProgressJobs: 2, rating: 4.6 },
  { id: 4, name: 'M. Senthil', specialty: 'Carpentry', completedJobs: 60, inProgressJobs: 0, rating: 4.5 }
];

export const initialChatMessages = [
  { id: 1, sender: 'technician', text: 'Hello Suruthi, I received your ticket regarding the wash basin tap leak in Room 204. I am grabbing spare washers and will reach your block in 15 minutes.' },
  { id: 2, sender: 'student', text: 'Thank you Anand! I will be in the room.' }
];
