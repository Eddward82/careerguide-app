import { SuccessStory, Resource, CareerGoal } from '@/types';

export const successStories: SuccessStory[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    fromRole: 'Marketing Manager',
    toRole: 'Product Manager',
    duration: '90 days',
    quote:
      'Careerguide helped me identify my transferable skills and land my dream PM role at a tech startup!',
    milestones: [
      'Completed Google PM certificate',
      'Built first product mockup',
      'Networked with 15 PMs',
      'Aced behavioral interviews',
      'Received 3 offers',
    ],
    avatar: '👩‍💼',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    fromRole: 'Sales Rep',
    toRole: 'Software Engineer',
    duration: '6 months',
    quote:
      'The daily coaching kept me accountable. I went from zero coding to my first dev job!',
    milestones: [
      'Learned JavaScript & React',
      'Built 5 portfolio projects',
      'Contributed to open source',
      'Passed technical interviews',
      'Landed junior dev role',
    ],
    avatar: '👨‍💻',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    fromRole: 'Junior Designer',
    toRole: 'Design Lead',
    duration: '4 months',
    quote:
      'The action plans were specific and achievable. I gained confidence and leadership skills!',
    milestones: [
      'Led team redesign project',
      'Mentored 2 junior designers',
      'Presented at design conference',
      'Built leadership portfolio',
      'Promoted to Lead Designer',
    ],
    avatar: '👩‍🎨',
  },
  {
    id: '4',
    name: 'David Park',
    fromRole: 'Accountant',
    toRole: 'Data Analyst',
    duration: '5 months',
    quote:
      'Careerguide showed me how my analytical skills translated perfectly to data science!',
    milestones: [
      'Learned Python & SQL',
      'Completed data bootcamp',
      'Built analytics dashboard',
      'Networked at data meetups',
      'Secured analyst position',
    ],
    avatar: '👨‍💼',
  },
];

export const resources: Resource[] = [
  // LinkedIn Articles
  {
    id: 'l1',
    title: 'Breaking into Tech: A Complete Roadmap',
    category: 'LinkedIn Articles',
    url: 'https://www.linkedin.com/pulse/breaking-into-tech-complete-roadmap/',
    description: 'Step-by-step guide for transitioning to tech roles',
    relevantTo: ['Switching to Tech', 'Career Pivot'],
  },
  {
    id: 'l2',
    title: 'From IC to Manager: Essential Leadership Skills',
    category: 'LinkedIn Articles',
    url: 'https://www.linkedin.com/pulse/ic-manager-leadership-skills/',
    description: 'Key competencies for first-time managers',
    relevantTo: ['Moving to Management'],
  },
  {
    id: 'l3',
    title: 'Resume That Gets You Interviews in 2024',
    category: 'LinkedIn Articles',
    url: 'https://www.linkedin.com/pulse/resume-that-gets-interviews-2024/',
    description: 'Modern resume strategies and ATS optimization',
    relevantTo: ['Resume Refresh', 'Career Pivot', 'Switching to Tech'],
  },

  // Top Courses
  {
    id: 'c1',
    title: 'Google Project Management Certificate',
    category: 'Top Courses',
    url: 'https://www.coursera.org/professional-certificates/google-project-management',
    description: 'Industry-recognized PM certification from Google',
    relevantTo: ['Moving to Management', 'Career Pivot'],
  },
  {
    id: 'c2',
    title: 'CS50: Introduction to Computer Science',
    category: 'Top Courses',
    url: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science',
    description: 'Harvard\'s famous intro to programming (free)',
    relevantTo: ['Switching to Tech'],
  },
  {
    id: 'c3',
    title: 'The Complete Web Developer Bootcamp',
    category: 'Top Courses',
    url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    description: 'Full-stack development from zero to job-ready',
    relevantTo: ['Switching to Tech', 'Skill Development'],
  },
  {
    id: 'c4',
    title: 'Leadership and Management Fundamentals',
    category: 'Top Courses',
    url: 'https://www.linkedin.com/learning/leadership-fundamentals',
    description: 'Core leadership principles for new managers',
    relevantTo: ['Moving to Management'],
  },
  {
    id: 'c5',
    title: 'Data Science Career Track',
    category: 'Top Courses',
    url: 'https://www.datacamp.com/tracks/data-scientist-with-python',
    description: 'Hands-on Python data science training',
    relevantTo: ['Switching to Tech', 'Career Pivot', 'Skill Development'],
  },

  // Networking Groups
  {
    id: 'n1',
    title: 'Tech Career Changers Slack',
    category: 'Networking Groups',
    url: 'https://techcareerchangers.slack.com',
    description: '10K+ members supporting tech transitions',
    relevantTo: ['Switching to Tech', 'Career Pivot'],
  },
  {
    id: 'n2',
    title: 'Women in Product (WIP)',
    category: 'Networking Groups',
    url: 'https://www.womenin product.com/',
    description: 'Global community for women in product management',
    relevantTo: ['Moving to Management', 'Career Pivot'],
  },
  {
    id: 'n3',
    title: 'Dev.to Community',
    category: 'Networking Groups',
    url: 'https://dev.to/',
    description: 'Friendly developer community for all levels',
    relevantTo: ['Switching to Tech', 'Skill Development'],
  },
  {
    id: 'n4',
    title: 'Product Management Discord',
    category: 'Networking Groups',
    url: 'https://discord.gg/productmanagement',
    description: 'Active PM community with job postings',
    relevantTo: ['Moving to Management', 'Career Pivot'],
  },
  {
    id: 'n5',
    title: 'Career Pivot Network (LinkedIn Group)',
    category: 'Networking Groups',
    url: 'https://www.linkedin.com/groups/career-pivot-network',
    description: '50K+ professionals navigating career changes',
    relevantTo: ['Career Pivot', 'Resume Refresh', 'Skill Development'],
  },
];

// Community stats (simulated live data)
export const getCommunityStats = () => {
  const baseTransitions = 2800;
  const baseStickRate = 92;

  // Add some randomness to make it feel "live"
  const transitions = baseTransitions + Math.floor(Math.random() * 100);
  const stickRate = baseStickRate + Math.floor(Math.random() * 3);

  return {
    transitions,
    stickRate,
    activeUsers: Math.floor(transitions * 0.6),
  };
};
