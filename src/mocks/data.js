export const currentUser = {
  name: 'Priya Sharma',
  firstName: 'Priya',
  role: 'Student',
  institution: 'XYZ University',
  location: 'Bengaluru, India',
  email: 'priya.sharma@email.com',
  careerGoal: 'Cloud Engineer',
  avatar: 'https://i.pravatar.cc/120?img=47',
  readiness: 68,
  coursesCompleted: 4,
};

export const skills = [
  { name: 'Python', level: 'Intermediate', value: 80, color: '#ef4444' },
  { name: 'AWS', level: 'Basic', value: 35, color: '#2563eb' },
  { name: 'SQL', level: 'Intermediate', value: 75, color: '#10b981' },
  { name: 'Communication', level: 'Strong', value: 90, color: '#f97316' },
];

export const learningHistory = {
  completed: [
    { title: 'Intro to Python', provider: 'Coursera' },
    { title: 'SQL Basics', provider: 'Udemy' },
  ],
  inProgress: [
    { title: 'AWS Cloud Practitioner', percent: 50 },
  ],
  achieved: [
    { title: 'Excel Certification' },
  ],
};

export const missingSkills = ['Advanced AWS', 'DevOps Fundamentals', 'Kubernetes'];

export const recommendations = [
  { kind: 'Take', title: 'AWS Solutions Architect' },
  { kind: 'Learn', title: 'DevOps Foundations Course' },
  { kind: 'Project', title: 'Deploy App on AWS' },
];

export const recentScores = [
  { subject: 'Python', score: 85 },
  { subject: 'SQL', score: 75 },
];

export const gapReport = {
  readiness: 68,
  strengths: [
    { name: 'Excel (Advanced)' },
    { name: 'Communication' },
  ],
  needsImprovement: [
    { name: 'Advanced AWS' },
    { name: 'DevOps Fundamentals' },
    { name: 'Kubernetes' },
  ],
  breakdown: [
    { skill: 'Python', value: 80 },
    { skill: 'AWS', value: 35 },
    { skill: 'DevOps', value: 30 },
  ],
};

export const learningPath = {
  targetRole: 'Cloud Engineer',
  steps: [
    {
      title: 'AWS Solutions Architect',
      provider: 'AWS',
      status: 'enrolled',
      duration: '40h',
      icon: 'aws',
    },
    {
      title: 'DevOps Foundations',
      provider: 'Coursera',
      status: 'available',
      duration: '24h',
      icon: 'devops',
    },
    {
      title: 'Kubernetes Essentials',
      provider: 'Udemy',
      status: 'available',
      duration: '18h',
      icon: 'k8s',
    },
  ],
  suggestedProject: 'Deploy an App on AWS',
};

export const assessmentQuestion = {
  number: 8,
  total: 12,
  prompt: 'Write an SQL query to find the top 5 employees with the highest salary.',
  starter: `SELECT name, salary FROM\n  Employees\n  ORDER BY salary DESC\n  LIMIT 5;`,
  language: 'SQL',
};

export const jobOpportunities = [
  { role: 'Cloud Engineer Positions', count: 12, action: 'Invite for Assessment' },
  { role: 'Data Analyst Roles', count: 8, action: 'Invite for Assessment' },
];

export const skillGapTrend = [
  { month: 'Jan', python: 60, aws: 25, devops: 18 },
  { month: 'Feb', python: 64, aws: 28, devops: 20 },
  { month: 'Mar', python: 70, aws: 30, devops: 24 },
  { month: 'Apr', python: 74, aws: 33, devops: 27 },
  { month: 'May', python: 80, aws: 35, devops: 30 },
];

export const batchPerformance = [
  { name: 'Batch 2022', value: 72, color: '#10b981' },
  { name: 'Batch 2023', value: 72, color: '#10b981' },
  { name: 'Batch 2024', value: 58, color: '#f97316' },
];

export const topSkillGaps = [
  { name: 'Advanced Cloud', value: 42, color: '#f97316' },
  { name: 'Cybersecurity', value: 35, color: '#10b981' },
];

export const notifications = [
  { id: 1, title: 'New assessment available: AWS Practitioner', time: '2h ago', unread: true },
  { id: 2, title: 'Acme Inc invited you for a Cloud Engineer role', time: '1d ago', unread: true },
  { id: 3, title: 'You earned the Excel Certification', time: '3d ago', unread: false },
];
