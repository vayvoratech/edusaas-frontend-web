



// Minimal in-repo question bank so the Skill Assessment supports Next / Skip flow
// until a real question table is wired into the backend.
export const assessmentBank = [
  {
    language: 'SQL',
    prompt: 'Write an SQL query to find the top 5 employees with the highest salary.',
    starter: `SELECT name, salary FROM\n  Employees\n  ORDER BY salary DESC\n  LIMIT 5;`,
    grade: (txt) => {
      const t = txt.toLowerCase();
      if (t.includes('order by') && t.includes('limit')) return 100;
      if (t.includes('order by') || t.includes('limit')) return 70;
      return 40;
    },
  },
  {
    language: 'Python',
    prompt: 'Write a Python function that returns the factorial of n using recursion.',
    starter: `def factorial(n):\n    # your code here\n    pass`,
    grade: (txt) => {
      const t = txt.toLowerCase();
      if (t.includes('def factorial') && t.includes('return') && t.includes('factorial(n')) return 100;
      if (t.includes('def factorial') && t.includes('return')) return 70;
      return 40;
    },
  },
  {
    language: 'JavaScript',
    prompt: 'Write a JS function that flattens a nested array one level deep.',
    starter: `function flatten(arr) {\n  // your code here\n}`,
    grade: (txt) => {
      const t = txt.toLowerCase();
      if ((t.includes('flat(') || t.includes('reduce(') || t.includes('concat')) && t.includes('return')) return 100;
      if (t.includes('return')) return 60;
      return 30;
    },
  },
  {
    language: 'SQL',
    prompt: 'Write an SQL query to count users grouped by their role.',
    starter: `SELECT role, COUNT(*)\n  FROM users\n  GROUP BY role;`,
    grade: (txt) => {
      const t = txt.toLowerCase();
      if (t.includes('group by') && t.includes('count')) return 100;
      if (t.includes('group by') || t.includes('count')) return 60;
      return 30;
    },
  },
];


export const notifications = [
  { id: 1, title: 'New assessment available: AWS Practitioner', time: '2h ago', unread: true },
  { id: 2, title: 'Acme Inc invited you for a Cloud Engineer role', time: '1d ago', unread: true },
  { id: 3, title: 'You earned the Excel Certification', time: '3d ago', unread: false },
];
