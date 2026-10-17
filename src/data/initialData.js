// Clean initial state data — ready for real student complaint registration

export const initialMetrics = {
  openComplaints: 0,
  slaBreaches: 0,
  mergeSuggestions: 0,
  techniciansOnline: 4
};

export const initialDuplicateSuggestions = [];

export const initialComplaints = [];

export const initialTechnicians = [
  { id: 1, name: 'Anand Pillai', specialty: 'Plumbing', completedJobs: 0, inProgressJobs: 0, rating: 5.0 },
  { id: 2, name: 'Divya S', specialty: 'Internet', completedJobs: 0, inProgressJobs: 0, rating: 5.0 },
  { id: 3, name: 'K. Rajesh', specialty: 'Electrical', completedJobs: 0, inProgressJobs: 0, rating: 5.0 },
  { id: 4, name: 'M. Senthil', specialty: 'Carpentry', completedJobs: 0, inProgressJobs: 0, rating: 5.0 }
];

export const initialChatMessages = [];

