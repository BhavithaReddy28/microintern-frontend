export interface Task {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
  payment: number;
  description: string;
  requirements: string[];
  skills: string[];
  deadline: string;
  applicants: number;
  maxApplicants: number;
  verified: boolean;
  postedDate: string;
}

export interface User {
  id: string;
  name: string;
  university: string;
  major: string;
  skills: string[];
  xp: number;
  badges: string[];
  completedTasks: { difficulty: "Easy" | "Medium" | "Hard"; count: number };
  streak: number;
  hireableTalent: boolean;
  rating: number;
}

export interface Application {
  id: string;
  taskId: string;
  taskTitle: string;
  company: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  appliedDate: string;
  payment: number;
}

export interface Payment {
  id: string;
  taskTitle: string;
  company: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
  status: "completed" | "pending" | "processing";
}

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Social Media Content Creation",
    company: "TechStart Inc.",
    companyLogo: "TS",
    category: "Marketing",
    difficulty: "Medium",
    duration: "2 weeks",
    payment: 300,
    description:
      "Create engaging social media content for our product launch. You'll design posts, write captions, and schedule content across multiple platforms.",
    requirements: [
      "Experience with Canva or Adobe Creative Suite",
      "Understanding of social media trends",
      "Portfolio of previous work",
    ],
    skills: ["Social Media", "Content Creation", "Copywriting"],
    deadline: "2026-03-20",
    applicants: 3,
    maxApplicants: 12,
    verified: true,
    postedDate: "2026-03-01",
  },
  {
    id: "2",
    title: "Data Entry & Analysis",
    company: "Analytics Pro",
    companyLogo: "AP",
    category: "Data",
    difficulty: "Easy",
    duration: "1 week",
    payment: 200,
    description:
      "Help us organize and analyze customer data. Tasks include data cleaning, basic statistical analysis, and creating summary reports.",
    requirements: [
      "Proficiency in Excel or Google Sheets",
      "Attention to detail",
      "Basic statistics knowledge",
    ],
    skills: ["Excel", "Data Analysis", "Statistics"],
    deadline: "2026-03-15",
    applicants: 5,
    maxApplicants: 8,
    verified: true,
    postedDate: "2026-02-28",
  },
  {
    id: "3",
    title: "Mobile App UI/UX Research",
    company: "DesignHub",
    companyLogo: "DH",
    category: "Design",
    difficulty: "Medium",
    duration: "3 weeks",
    payment: 450,
    description:
      "Conduct user research for our new mobile app. Includes creating user surveys, conducting interviews, and compiling research findings.",
    requirements: [
      "Background in HCI or Design",
      "Experience with user research methods",
      "Strong communication skills",
    ],
    skills: ["UX Research", "User Testing", "Figma"],
    deadline: "2026-03-25",
    applicants: 2,
    maxApplicants: 15,
    verified: true,
    postedDate: "2026-03-02",
  },
  {
    id: "4",
    title: "Python Automation Script",
    company: "DevTools Co.",
    companyLogo: "DT",
    category: "Development",
    difficulty: "Hard",
    duration: "1 week",
    payment: 350,
    description:
      "Build a Python script to automate our daily reporting process. The script should fetch data from APIs, process it, and generate PDF reports.",
    requirements: [
      "Proficient in Python",
      "Experience with APIs",
      "Knowledge of pandas and reportlab",
    ],
    skills: ["Python", "API Integration", "Automation"],
    deadline: "2026-03-18",
    applicants: 1,
    maxApplicants: 20,
    verified: true,
    postedDate: "2026-03-01",
  },
  {
    id: "5",
    title: "Market Research Report",
    company: "Insight Analytics",
    companyLogo: "IA",
    category: "Research",
    difficulty: "Hard",
    duration: "2 weeks",
    payment: 400,
    description:
      "Conduct comprehensive market research on the EdTech industry. Deliver a detailed report with competitive analysis and market trends.",
    requirements: [
      "Research experience",
      "Excellent writing skills",
      "Understanding of business analysis",
    ],
    skills: ["Market Research", "Report Writing", "Analysis"],
    deadline: "2026-03-22",
    applicants: 2,
    maxApplicants: 10,
    verified: true,
    postedDate: "2026-02-29",
  },
  {
    id: "6",
    title: "Video Editing for YouTube",
    company: "Content Creators Hub",
    companyLogo: "CC",
    category: "Media",
    difficulty: "Medium",
    duration: "1 week",
    payment: 250,
    description:
      "Edit 5 YouTube videos with professional transitions, color grading, and audio enhancement. Videos are 10-15 minutes each.",
    requirements: [
      "Proficiency in Premiere Pro or Final Cut",
      "Portfolio of edited videos",
      "Understanding of YouTube content style",
    ],
    skills: ["Video Editing", "Premiere Pro", "Color Grading"],
    deadline: "2026-03-17",
    applicants: 3,
    maxApplicants: 18,
    verified: true,
    postedDate: "2026-03-02",
  },
];

export const mockApplications: Application[] = [
  {
    id: "app-1",
    taskId: "1",
    taskTitle: "Social Media Content Creation",
    company: "TechStart Inc.",
    status: "accepted",
    appliedDate: "2026-03-02",
    payment: 300,
  },
  {
    id: "app-2",
    taskId: "2",
    taskTitle: "Data Entry & Analysis",
    company: "Analytics Pro",
    status: "pending",
    appliedDate: "2026-03-01",
    payment: 200,
  },
  {
    id: "app-3",
    taskId: "4",
    taskTitle: "Python Automation Script",
    company: "DevTools Co.",
    status: "completed",
    appliedDate: "2026-02-25",
    payment: 350,
  },
  {
    id: "app-4",
    taskId: "3",
    taskTitle: "Mobile App UI/UX Research",
    company: "DesignHub",
    status: "rejected",
    appliedDate: "2026-03-03",
    payment: 450,
  },
];

export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    taskTitle: "Python Automation Script",
    company: "DevTools Co.",
    amount: 350,
    commission: 17.5,
    netAmount: 332.5,
    date: "2026-02-28",
    status: "completed",
  },
  {
    id: "pay-2",
    taskTitle: "Website Redesign Consultation",
    company: "WebDesign Pro",
    amount: 500,
    commission: 25,
    netAmount: 475,
    date: "2026-02-20",
    status: "completed",
  },
  {
    id: "pay-3",
    taskTitle: "Content Writing - Blog Posts",
    company: "Marketing Hub",
    amount: 200,
    commission: 10,
    netAmount: 190,
    date: "2026-02-15",
    status: "completed",
  },
  {
    id: "pay-4",
    taskTitle: "Social Media Content Creation",
    company: "TechStart Inc.",
    amount: 300,
    commission: 15,
    netAmount: 285,
    date: "2026-03-05",
    status: "processing",
  },
];

export const mockCompanyTasks: Task[] = [
  {
    id: "ct-1",
    title: "Social Media Content Creation",
    company: "TechStart Inc.",
    companyLogo: "TS",
    category: "Marketing",
    duration: "2 weeks",
    payment: 300,
    description:
      "Create engaging social media content for our product launch. You'll design posts, write captions, and schedule content across multiple platforms.",
    requirements: [
      "Experience with Canva or Adobe Creative Suite",
      "Understanding of social media trends",
      "Portfolio of previous work",
    ],
    skills: ["Social Media", "Content Creation", "Copywriting"],
    deadline: "2026-03-20",
    applicants: 3,
    maxApplicants: 12,
    verified: true,
    postedDate: "2026-03-01",
  },
  {
    id: "ct-2",
    title: "Customer Support - Weekend Shift",
    company: "TechStart Inc.",
    companyLogo: "TS",
    category: "Support",
    difficulty: "Easy",
    duration: "1 month",
    payment: 600,
    description:
      "Handle customer inquiries via email and chat during weekend hours. Requires excellent communication skills and problem-solving abilities.",
    requirements: [
      "Excellent written communication",
      "Problem-solving skills",
      "Available on weekends",
    ],
    skills: ["Customer Service", "Communication", "Problem Solving"],
    deadline: "2026-03-30",
    applicants: 2,
    maxApplicants: 5,
    verified: true,
    postedDate: "2026-03-01",
  },
];

export const mockUsers: User[] = [
  {
    id: "u-1",
    name: "Alex Rivera",
    university: "Stanford University",
    major: "Computer Science",
    skills: ["Python", "React", "Node.js", "AWS"],
    xp: 4500,
    badges: ["Hireable Talent", "Top Coder", "Fast Learner"],
    completedTasks: { Easy: 5, Medium: 12, Hard: 8 },
    streak: 14,
    hireableTalent: true,
    rating: 4.9,
  },
  {
    id: "u-2",
    name: "Samantha Lee",
    university: "MIT",
    major: "Data Science",
    skills: ["Python", "Machine Learning", "SQL", "Data Analysis"],
    xp: 3800,
    badges: ["Data Whiz", "Hireable Talent"],
    completedTasks: { Easy: 2, Medium: 8, Hard: 6 },
    streak: 5,
    hireableTalent: true,
    rating: 4.8,
  },
  {
    id: "u-3",
    name: "Jordan Smith",
    university: "UC Berkeley",
    major: "Marketing",
    skills: ["SEO", "Content Creation", "Copywriting", "Social Media"],
    xp: 2100,
    badges: ["Creative Mind"],
    completedTasks: { Easy: 8, Medium: 4, Hard: 1 },
    streak: 2,
    hireableTalent: false,
    rating: 4.5,
  },
  {
    id: "u-4",
    name: "Priya Patel",
    university: "Carnegie Mellon",
    major: "Design",
    skills: ["Figma", "UX Research", "Prototyping", "UI Design"],
    xp: 4200,
    badges: ["Design Guru", "Hireable Talent", "Perfect 5-Star"],
    completedTasks: { Easy: 3, Medium: 9, Hard: 5 },
    streak: 21,
    hireableTalent: true,
    rating: 5.0,
  }
];
