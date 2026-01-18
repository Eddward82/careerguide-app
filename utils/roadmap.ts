import { TransitionTimeline, CareerGoal } from '@/types';

export interface RoadmapPlan {
  name: string;
  totalDays: number;
  strategy: 'sprint' | 'balanced' | 'sustainable' | 'strategic';
  phases: RoadmapPhase[];
}

export interface PhaseTask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface RoadmapPhase {
  number: number;
  title: string;
  weeks: string;
  description: string;
  objectives: string[];
  tasks: PhaseTask[];
  motivationalMessage: string;
}

/**
 * Get Freelance/Startup specialized roadmap (adapts to timeline)
 */
function getFreelanceStartupRoadmap(timeline: TransitionTimeline): RoadmapPlan {
  const isQuick = timeline === '1-3m' || timeline === '3-6m';

  if (isQuick) {
    // Faster launch roadmap
    return {
      name: 'Freelance Launch Plan',
      totalDays: timeline === '1-3m' ? 90 : 180,
      strategy: timeline === '1-3m' ? 'sprint' : 'balanced',
      phases: [
        {
          number: 1,
          title: 'Foundation',
          weeks: 'Weeks 1-3',
          description: 'Legal setup and brand foundation',
          objectives: [
            'Register your business entity (LLC, sole proprietorship) and get EIN',
            'Set up business banking and accounting system (QuickBooks, Wave)',
            'Define your service offering and ideal client profile',
            'Create brand identity: name, logo, color palette',
            'Set up professional email and basic website (Carrd, Webflow)',
          ],
          tasks: [
            { id: 'freelance-p1-t1', text: 'Register business and obtain EIN', isCompleted: false },
            { id: 'freelance-p1-t2', text: 'Open business bank account', isCompleted: false },
            { id: 'freelance-p1-t3', text: 'Define 3 core service offerings', isCompleted: false },
            { id: 'freelance-p1-t4', text: 'Create brand assets and style guide', isCompleted: false },
            { id: 'freelance-p1-t5', text: 'Launch one-page professional website', isCompleted: false },
          ],
          motivationalMessage: "🚀 You're building the foundation of your empire! Every business starts with these critical first steps.",
        },
        {
          number: 2,
          title: 'Portfolio & Presence',
          weeks: 'Weeks 4-6',
          description: 'Build credibility and showcase work',
          objectives: [
            'Create 3-5 case studies from past work or pro-bono projects',
            'Build portfolio website with client testimonials',
            'Set up LinkedIn profile optimized for freelance services',
            'Create service packages with clear pricing tiers',
            'Draft contract templates and proposal frameworks',
          ],
          tasks: [
            { id: 'freelance-p2-t1', text: 'Complete 3 detailed case studies', isCompleted: false },
            { id: 'freelance-p2-t2', text: 'Launch full portfolio website', isCompleted: false },
            { id: 'freelance-p2-t3', text: 'Create 3 service package tiers', isCompleted: false },
            { id: 'freelance-p2-t4', text: 'Design contract and proposal templates', isCompleted: false },
          ],
          motivationalMessage: "💼 Your portfolio is your storefront. Make it impossible for clients to say no!",
        },
        {
          number: 3,
          title: 'Client Acquisition',
          weeks: 'Weeks 7-12',
          description: 'Land first paying clients',
          objectives: [
            'Reach out to 50+ potential clients via cold outreach',
            'Join 5 freelance platforms (Upwork, Fiverr, Toptal)',
            'Leverage warm network: inform 20 contacts about your services',
            'Attend 3 virtual networking events in your niche',
            'Create content marketing strategy (LinkedIn posts, blog)',
            'Land first 3-5 paying clients',
          ],
          tasks: [
            { id: 'freelance-p3-t1', text: 'Send 50 personalized cold outreach emails', isCompleted: false },
            { id: 'freelance-p3-t2', text: 'Set up profiles on 5 freelance platforms', isCompleted: false },
            { id: 'freelance-p3-t3', text: 'Announce launch to personal network', isCompleted: false },
            { id: 'freelance-p3-t4', text: 'Publish 8 LinkedIn posts showcasing expertise', isCompleted: false },
            { id: 'freelance-p3-t5', text: 'Secure and deliver 3 client projects', isCompleted: false },
          ],
          motivationalMessage: "🎯 The hustle is real, but so are the rewards! Every 'no' brings you closer to your 'yes'.",
        },
      ],
    };
  } else {
    // Longer, sustainable startup roadmap
    return {
      name: 'Startup Mastery Plan',
      totalDays: timeline === '6-12m' ? 365 : 540,
      strategy: timeline === '6-12m' ? 'sustainable' : 'strategic',
      phases: [
        {
          number: 1,
          title: 'Foundation & Validation',
          weeks: 'Weeks 1-8',
          description: 'Legal setup and market validation',
          objectives: [
            'Register business, get EIN, set up business banking',
            'Conduct market research: survey 50+ potential customers',
            'Define MVP (Minimum Viable Product) features',
            'Create business model canvas and financial projections',
            'Build initial brand identity and landing page',
          ],
          tasks: [
            { id: 'startup-p1-t1', text: 'Complete business registration and banking', isCompleted: false },
            { id: 'startup-p1-t2', text: 'Survey 50 potential customers', isCompleted: false },
            { id: 'startup-p1-t3', text: 'Define MVP feature list', isCompleted: false },
            { id: 'startup-p1-t4', text: 'Create financial projections', isCompleted: false },
          ],
          motivationalMessage: "🌱 Every great company started with thorough research. You're building on solid ground!",
        },
        {
          number: 2,
          title: 'MVP Development',
          weeks: 'Weeks 9-16',
          description: 'Build and test your product',
          objectives: [
            'Build MVP using lean startup methodology',
            'Recruit 10-20 beta testers from target market',
            'Collect feedback and iterate rapidly',
            'Set up analytics and customer feedback systems',
            'Create pricing strategy based on value proposition',
          ],
          tasks: [
            { id: 'startup-p2-t1', text: 'Launch functional MVP', isCompleted: false },
            { id: 'startup-p2-t2', text: 'Onboard 20 beta testers', isCompleted: false },
            { id: 'startup-p2-t3', text: 'Conduct 10 user interviews', isCompleted: false },
            { id: 'startup-p2-t4', text: 'Iterate based on feedback', isCompleted: false },
          ],
          motivationalMessage: "🛠️ Your MVP is the start of something amazing. Ship it, learn, iterate!",
        },
        {
          number: 3,
          title: 'Go-to-Market',
          weeks: 'Weeks 17-26',
          description: 'Launch and acquire customers',
          objectives: [
            'Launch marketing website and social channels',
            'Execute content marketing strategy (blog, SEO, social)',
            'Run paid acquisition experiments (Facebook, Google Ads)',
            'Build email list and nurture sequence',
            'Attend industry conferences and pitch competitions',
            'Secure first 50-100 paying customers',
          ],
          tasks: [
            { id: 'startup-p3-t1', text: 'Launch marketing website', isCompleted: false },
            { id: 'startup-p3-t2', text: 'Publish 12 SEO-optimized articles', isCompleted: false },
            { id: 'startup-p3-t3', text: 'Run $500 ad experiment', isCompleted: false },
            { id: 'startup-p3-t4', text: 'Acquire 50 paying customers', isCompleted: false },
          ],
          motivationalMessage: "📣 This is where the magic happens! Your startup is gaining traction!",
        },
        {
          number: 4,
          title: 'Product-Market Fit',
          weeks: 'Weeks 27-40',
          description: 'Achieve product-market fit',
          objectives: [
            'Measure and optimize key metrics (CAC, LTV, churn)',
            'Build customer success and support system',
            'Iterate product based on user data',
            'Establish repeatable customer acquisition channels',
            'Reach $10K+ MRR (Monthly Recurring Revenue)',
          ],
          tasks: [
            { id: 'startup-p4-t1', text: 'Set up analytics dashboard', isCompleted: false },
            { id: 'startup-p4-t2', text: 'Hire or onboard support system', isCompleted: false },
            { id: 'startup-p4-t3', text: 'Achieve $10K MRR', isCompleted: false },
            { id: 'startup-p4-t4', text: 'Document repeatable growth playbook', isCompleted: false },
          ],
          motivationalMessage: "🎊 Product-market fit achieved! You've built something people truly want!",
        },
      ],
    };
  }
}

/**
 * Get Salary/Promotion specialized roadmap
 */
function getSalaryPromotionRoadmap(timeline: TransitionTimeline): RoadmapPlan {
  const isQuick = timeline === '1-3m' || timeline === '3-6m';

  return {
    name: isQuick ? 'Promotion Sprint' : 'Executive Advancement Plan',
    totalDays: timeline === '1-3m' ? 90 : timeline === '3-6m' ? 180 : timeline === '6-12m' ? 365 : 540,
    strategy: timeline === '1-3m' ? 'sprint' : timeline === '3-6m' ? 'balanced' : timeline === '6-12m' ? 'sustainable' : 'strategic',
    phases: [
      {
        number: 1,
        title: 'Impact Audit',
        weeks: 'Weeks 1-3',
        description: 'Document and quantify your value',
        objectives: [
          'Create comprehensive "Wins Document" with 20+ quantified achievements',
          'Research market compensation for your role and seniority (Glassdoor, Levels.fyi, Payscale)',
          'Identify salary gap between current pay and market rate',
          'Document specific business outcomes you\'ve driven (revenue, cost savings, efficiency)',
          'Map your expanded responsibilities beyond job description',
        ],
        tasks: [
          { id: 'salary-p1-t1', text: 'Document 20 quantified wins from past year', isCompleted: false },
          { id: 'salary-p1-t2', text: 'Research market rates for your role', isCompleted: false },
          { id: 'salary-p1-t3', text: 'Calculate your compensation gap', isCompleted: false },
          { id: 'salary-p1-t4', text: 'Create business impact summary', isCompleted: false },
        ],
        motivationalMessage: "💰 Knowledge is power! Understanding your true market value is the first step to claiming it.",
      },
      {
        number: 2,
        title: 'Strategic Positioning',
        weeks: 'Weeks 4-6',
        description: 'Build visibility and executive presence',
        objectives: [
          'Schedule 1-on-1s with key decision makers (your boss, skip-level manager)',
          'Share your career goals and aspirations explicitly',
          'Volunteer for high-visibility projects aligned with company priorities',
          'Build relationships with 5 internal advocates or sponsors',
          'Document weekly impact in shared "progress tracker" (email, Slack)',
        ],
        tasks: [
          { id: 'salary-p2-t1', text: 'Book 1-on-1 with manager and skip-level', isCompleted: false },
          { id: 'salary-p2-t2', text: 'Communicate promotion/raise aspirations', isCompleted: false },
          { id: 'salary-p2-t3', text: 'Volunteer for 2 high-impact projects', isCompleted: false },
          { id: 'salary-p2-t4', text: 'Build relationships with 5 sponsors', isCompleted: false },
        ],
        motivationalMessage: "⭐ Visibility = Opportunity. Make sure the right people see your greatness!",
      },
      {
        number: 3,
        title: 'Negotiation Execution',
        weeks: 'Weeks 7-12',
        description: 'Execute the ask',
        objectives: [
          'Prepare negotiation script with specific salary/title ask',
          'Create one-page "Promotion Case" document with metrics',
          'Research comparable job offers as leverage (apply externally if needed)',
          'Practice negotiation with mentor or friend (role-play)',
          'Schedule formal review meeting with manager',
          'Execute negotiation with confidence and backup plan',
        ],
        tasks: [
          { id: 'salary-p3-t1', text: 'Draft negotiation script and case document', isCompleted: false },
          { id: 'salary-p3-t2', text: 'Research 3 external comparable offers', isCompleted: false },
          { id: 'salary-p3-t3', text: 'Practice negotiation 3 times', isCompleted: false },
          { id: 'salary-p3-t4', text: 'Schedule and execute negotiation meeting', isCompleted: false },
          { id: 'salary-p3-t5', text: 'Secure promotion or raise offer', isCompleted: false },
        ],
        motivationalMessage: "🎯 You've prepared, you've earned it—now claim what's yours with confidence!",
      },
    ],
  };
}

/**
 * Customize roadmap objectives based on career goal
 */
function customizeObjectivesForGoal(objectives: string[], goal: CareerGoal): string[] {
  return objectives.map(obj => {
    // Replace generic terms with goal-specific ones
    if (goal === 'Switching to Tech') {
      return obj
        .replace('transferable skills', 'technical skills and projects')
        .replace('target role', 'tech role')
        .replace('portfolio or personal website', 'GitHub profile and technical portfolio');
    } else if (goal === 'Moving to Management') {
      return obj
        .replace('transferable skills', 'leadership experience')
        .replace('portfolio or personal website', 'leadership portfolio and case studies')
        .replace('target role', 'management position');
    } else if (goal === 'Resume Refresh') {
      return obj
        .replace('portfolio or personal website', 'resume portfolio and LinkedIn showcase')
        .replace('target role', 'desired position');
    } else if (goal === 'Freelance/Startup Path') {
      return obj
        .replace('transferable skills', 'entrepreneurial capabilities and service offerings')
        .replace('portfolio or personal website', 'client-ready portfolio and service website')
        .replace('target role', 'freelance business or startup venture');
    } else if (goal === 'Salary Negotiation & Promotion') {
      return obj
        .replace('transferable skills', 'quantifiable achievements and leadership impact')
        .replace('portfolio or personal website', 'achievement portfolio and executive presence')
        .replace('target role', 'promoted position or market-rate compensation');
    }
    return obj;
  });
}

/**
 * Get the dynamic roadmap plan based on the user's selected timeline and career goal
 */
export function getRoadmapPlan(timeline: TransitionTimeline, goal?: CareerGoal, targetRole?: string): RoadmapPlan {
  const customizePhases = (phases: RoadmapPhase[]): RoadmapPhase[] => {
    if (!goal) return phases;
    return phases.map(phase => ({
      ...phase,
      objectives: customizeObjectivesForGoal(phase.objectives, goal),
    }));
  };

  // Helper function to customize plan name with target role (HYPER-PRECISION)
  const customizePlanName = (baseName: string): string => {
    if (targetRole) {
      // Replace generic terms with target role
      // e.g., "90-Day Career Sprint" → "90-Day Frontend Developer Sprint"
      return baseName.replace('Career', targetRole);
    }
    return baseName;
  };

  // Special roadmaps for specific career goals
  if (goal === 'Freelance/Startup Path') {
    const plan = getFreelanceStartupRoadmap(timeline);
    return {
      ...plan,
      name: customizePlanName(plan.name),
    };
  }

  if (goal === 'Salary Negotiation & Promotion') {
    const plan = getSalaryPromotionRoadmap(timeline);
    return {
      ...plan,
      name: customizePlanName(plan.name),
    };
  }

  switch (timeline) {
    case '1-3m':
      const sprint: RoadmapPlan = {
        name: customizePlanName('90-Day Career Sprint'),
        totalDays: 90,
        strategy: 'sprint',
        phases: [
          {
            number: 1,
            title: 'Foundation',
            weeks: 'Weeks 1-3',
            description: 'Resume overhaul and immediate wins',
            objectives: [
              'Audit your LinkedIn profile and update with transferable skills',
              'Rewrite resume highlighting achievements relevant to target role',
              'Identify 3-5 key skills needed for your transition',
              'Create a compelling elevator pitch for your career pivot',
              'Set up job search alerts on 3+ platforms',
            ],
            tasks: [
              { id: '1-3m-p1-t1', text: 'Complete LinkedIn profile audit and update headline', isCompleted: false },
              { id: '1-3m-p1-t2', text: 'Rewrite resume with quantified achievements', isCompleted: false },
              { id: '1-3m-p1-t3', text: 'Identify 3-5 target companies and research their culture', isCompleted: false },
              { id: '1-3m-p1-t4', text: 'Practice 60-second elevator pitch 10 times', isCompleted: false },
              { id: '1-3m-p1-t5', text: 'Set up job alerts on LinkedIn, Indeed, and Glassdoor', isCompleted: false },
            ],
            motivationalMessage: "🚀 This is your launch week! You're laying the groundwork for an incredible transformation. Every small step you take now compounds into massive results.",
          },
          {
            number: 2,
            title: 'Acceleration',
            weeks: 'Weeks 4-8',
            description: 'Daily networking and skill showcase',
            objectives: [
              'Connect with 5-10 professionals in your target field weekly',
              'Attend 2-3 virtual industry events or webinars',
              'Complete at least one micro-certification or online course',
              'Start building a portfolio or case study project',
              'Conduct 3-5 informational interviews',
              'Publish 1-2 LinkedIn posts showcasing your expertise',
            ],
            tasks: [
              { id: '1-3m-p2-t1', text: 'Reach out to 20+ professionals with personalized messages', isCompleted: false },
              { id: '1-3m-p2-t2', text: 'Complete one industry-relevant certification', isCompleted: false },
              { id: '1-3m-p2-t3', text: 'Build one portfolio project showcasing key skills', isCompleted: false },
              { id: '1-3m-p2-t4', text: 'Conduct 3 informational interviews', isCompleted: false },
            ],
            motivationalMessage: "💪 You're building momentum! Each connection, each skill learned, each project completed is adding to your career capital. Keep pushing forward!",
          },
          {
            number: 3,
            title: 'Launch',
            weeks: 'Weeks 9-12',
            description: 'Active applications and interviews',
            objectives: [
              'Apply to 15-20 targeted positions per week',
              'Customize cover letters for each application',
              'Practice interview responses for common questions',
              'Prepare 2-3 success stories demonstrating key skills',
              'Follow up with all networking contacts',
              'Negotiate offers and evaluate opportunities',
            ],
            tasks: [
              { id: '1-3m-p3-t1', text: 'Apply to 50+ targeted positions with customized materials', isCompleted: false },
              { id: '1-3m-p3-t2', text: 'Practice answers to 20 common interview questions', isCompleted: false },
              { id: '1-3m-p3-t3', text: 'Prepare 3 STAR method success stories', isCompleted: false },
              { id: '1-3m-p3-t4', text: 'Follow up with all connections and informational interviewees', isCompleted: false },
              { id: '1-3m-p3-t5', text: 'Secure at least 2 interviews', isCompleted: false },
            ],
            motivationalMessage: "🎯 The finish line is in sight! Your hard work is about to pay off. Stay focused, stay confident, and remember: you've earned your place at the table.",
          },
        ],
      };
      return { ...sprint, phases: customizePhases(sprint.phases) };

    case '3-6m':
      const balanced: RoadmapPlan = {
        name: customizePlanName('180-Day Career Transition Roadmap'),
        totalDays: 180,
        strategy: 'balanced',
        phases: [
          {
            number: 1,
            title: 'Foundation & Assessment',
            weeks: 'Weeks 1-4',
            description: 'Build your foundation and brand',
            objectives: [
              'Complete comprehensive skills gap analysis',
              'Update LinkedIn with professional headline and summary',
              'Research 10-15 target companies in your desired field',
            ],
            tasks: [
              { id: '3-6m-p1-t1', text: 'Complete skills gap analysis worksheet', isCompleted: false },
              { id: '3-6m-p1-t2', text: 'Revamp LinkedIn profile with compelling headline and summary', isCompleted: false },
              { id: '3-6m-p1-t3', text: 'Research and document 10 target companies', isCompleted: false },
              { id: '3-6m-p1-t4', text: 'Create career transition vision board', isCompleted: false },
            ],
            motivationalMessage: "🎯 You're starting strong! Taking time to assess and plan is the hallmark of successful career transitions. This foundation will guide everything that follows.",
          },
          {
            number: 2,
            title: 'Brand Building',
            weeks: 'Weeks 5-8',
            description: 'Establish your personal brand',
            objectives: [
              'Build initial portfolio or personal website',
              'Identify and reach out to 3-5 potential mentors',
              'Start documenting your transition journey',
            ],
            tasks: [
              { id: '3-6m-p2-t1', text: 'Launch personal website or portfolio', isCompleted: false },
              { id: '3-6m-p2-t2', text: 'Write and publish first LinkedIn article about your transition', isCompleted: false },
              { id: '3-6m-p2-t3', text: 'Connect with 5 potential mentors', isCompleted: false },
              { id: '3-6m-p2-t4', text: 'Develop personal brand statement', isCompleted: false },
            ],
            motivationalMessage: "✨ Your brand is taking shape! Every piece of content you create, every connection you make is building your reputation in your new field.",
          },
          {
            number: 3,
            title: 'Skill Development',
            weeks: 'Weeks 9-14',
            description: 'Strategic upskilling and learning',
            objectives: [
              'Complete 2-3 relevant online courses or certifications',
              'Work on 2-3 portfolio projects demonstrating new skills',
              'Join 2-3 professional communities or Slack groups',
            ],
            tasks: [
              { id: '3-6m-p3-t1', text: 'Complete 2 industry certifications', isCompleted: false },
              { id: '3-6m-p3-t2', text: 'Build 2 portfolio projects', isCompleted: false },
              { id: '3-6m-p3-t3', text: 'Join 3 professional communities', isCompleted: false },
              { id: '3-6m-p3-t4', text: 'Document learning journey with weekly posts', isCompleted: false },
            ],
            motivationalMessage: "📚 You're in the growth zone! This is where the magic happens. Every skill you master brings you closer to your dream role.",
          },
          {
            number: 4,
            title: 'Network Expansion',
            weeks: 'Weeks 15-18',
            description: 'Active networking and relationship building',
            objectives: [
              'Attend weekly networking events or industry meetups',
              'Conduct 10-15 informational interviews',
              'Start contributing to industry discussions on LinkedIn',
            ],
            tasks: [
              { id: '3-6m-p4-t1', text: 'Attend 8+ industry events or webinars', isCompleted: false },
              { id: '3-6m-p4-t2', text: 'Complete 10 informational interviews', isCompleted: false },
              { id: '3-6m-p4-t3', text: 'Publish 8 LinkedIn posts/comments', isCompleted: false },
              { id: '3-6m-p4-t4', text: 'Build list of 50+ warm connections', isCompleted: false },
            ],
            motivationalMessage: "🤝 Your network is your net worth! The relationships you're building now will open doors you didn't even know existed.",
          },
          {
            number: 5,
            title: 'Market Positioning',
            weeks: 'Weeks 19-22',
            description: 'Prepare for job market entry',
            objectives: [
              'Prepare comprehensive interview prep document',
              'Practice mock interviews with peers or mentors',
              'Build relationships with recruiters in target industry',
            ],
            tasks: [
              { id: '3-6m-p5-t1', text: 'Create master interview prep document', isCompleted: false },
              { id: '3-6m-p5-t2', text: 'Complete 3 mock interviews', isCompleted: false },
              { id: '3-6m-p5-t3', text: 'Connect with 10 recruiters', isCompleted: false },
              { id: '3-6m-p5-t4', text: 'Prepare portfolio presentation', isCompleted: false },
            ],
            motivationalMessage: "💼 You're ready for this! All your preparation has led to this moment. Walk into every conversation with confidence—you've earned it.",
          },
          {
            number: 6,
            title: 'Active Job Search',
            weeks: 'Weeks 23-26',
            description: 'Launch applications and secure offers',
            objectives: [
              'Launch active job search with 10-15 applications weekly',
              'Tailor resume and cover letter for each position',
              'Showcase completed projects and certifications',
              'Negotiate multiple offers strategically',
            ],
            tasks: [
              { id: '3-6m-p6-t1', text: 'Submit 40+ targeted applications', isCompleted: false },
              { id: '3-6m-p6-t2', text: 'Customize materials for each application', isCompleted: false },
              { id: '3-6m-p6-t3', text: 'Secure 5+ interviews', isCompleted: false },
              { id: '3-6m-p6-t4', text: 'Practice salary negotiation tactics', isCompleted: false },
              { id: '3-6m-p6-t5', text: 'Evaluate and accept best offer', isCompleted: false },
            ],
            motivationalMessage: "🏆 This is it—your moment to shine! Trust your preparation, showcase your value, and step into the career you've worked so hard to build.",
          },
        ],
      };
      return { ...balanced, phases: customizePhases(balanced.phases) };

    case '6-12m':
      const sustainable: RoadmapPlan = {
        name: customizePlanName('365-Day Career Mastery Plan'),
        totalDays: 365,
        strategy: 'sustainable',
        phases: [
          {
            number: 1,
            title: 'Deep Foundation',
            weeks: 'Weeks 1-8',
            description: 'Strategic planning and foundation',
            objectives: [
              'Create detailed 12-month learning curriculum',
              'Enroll in comprehensive certification programs',
              'Set up structured learning schedule (10-15 hrs/week)',
            ],
            tasks: [
              { id: '6-12m-p1-t1', text: 'Design comprehensive 12-month learning plan', isCompleted: false },
              { id: '6-12m-p1-t2', text: 'Enroll in 3-4 certification programs', isCompleted: false },
              { id: '6-12m-p1-t3', text: 'Block out 10-15 hours weekly for learning', isCompleted: false },
              { id: '6-12m-p1-t4', text: 'Set measurable success milestones', isCompleted: false },
            ],
            motivationalMessage: "🌱 You're planting seeds for long-term success. This deep work now will compound into extraordinary results. Trust the process.",
          },
          {
            number: 2,
            title: 'Knowledge Building',
            weeks: 'Weeks 9-16',
            description: 'Intensive learning and skill acquisition',
            objectives: [
              'Build foundational knowledge through courses and books',
              'Start documenting learning journey via blog or Medium',
              'Connect with 5-10 mentors and industry experts',
            ],
            tasks: [
              { id: '6-12m-p2-t1', text: 'Complete 2 foundational courses', isCompleted: false },
              { id: '6-12m-p2-t2', text: 'Read 5 industry-relevant books', isCompleted: false },
              { id: '6-12m-p2-t3', text: 'Start weekly blog documenting journey', isCompleted: false },
              { id: '6-12m-p2-t4', text: 'Connect with 10 industry mentors', isCompleted: false },
            ],
            motivationalMessage: "📖 Knowledge is power! Every hour invested in learning is multiplying your career capital exponentially.",
          },
          {
            number: 3,
            title: 'Certification Sprint',
            weeks: 'Weeks 17-24',
            description: 'Professional certifications and credentials',
            objectives: [
              'Complete 3-5 professional certifications',
              'Develop specialized expertise in niche area',
            ],
            tasks: [
              { id: '6-12m-p3-t1', text: 'Complete 3 professional certifications', isCompleted: false },
              { id: '6-12m-p3-t2', text: 'Pass all certification exams', isCompleted: false },
              { id: '6-12m-p3-t3', text: 'Update LinkedIn with credentials', isCompleted: false },
              { id: '6-12m-p3-t4', text: 'Identify specialization niche', isCompleted: false },
            ],
            motivationalMessage: "🏅 Your credentials are stacking up! Each certification validates your expertise and opens new doors.",
          },
          {
            number: 4,
            title: 'Portfolio Development',
            weeks: 'Weeks 25-32',
            description: 'Build substantial project portfolio',
            objectives: [
              'Build 5-7 substantial portfolio projects',
              'Contribute to open source or community projects',
              'Create case studies showcasing your work',
            ],
            tasks: [
              { id: '6-12m-p4-t1', text: 'Complete 5 portfolio projects', isCompleted: false },
              { id: '6-12m-p4-t2', text: 'Contribute to 3 open source projects', isCompleted: false },
              { id: '6-12m-p4-t3', text: 'Write 3 detailed case studies', isCompleted: false },
              { id: '6-12m-p4-t4', text: 'Publish projects on GitHub/portfolio site', isCompleted: false },
            ],
            motivationalMessage: "🛠️ You're building proof of your abilities! These projects are your ticket to standout applications.",
          },
          {
            number: 5,
            title: 'Community Engagement',
            weeks: 'Weeks 33-40',
            description: 'Networking and content creation',
            objectives: [
              'Attend industry conferences and workshops',
              'Publish 1-2 articles or tutorials monthly',
              'Participate actively in industry communities',
            ],
            tasks: [
              { id: '6-12m-p5-t1', text: 'Attend 4 conferences or workshops', isCompleted: false },
              { id: '6-12m-p5-t2', text: 'Publish 8 articles or tutorials', isCompleted: false },
              { id: '6-12m-p5-t3', text: 'Join and contribute to 5 communities', isCompleted: false },
              { id: '6-12m-p5-t4', text: 'Build network of 100+ connections', isCompleted: false },
            ],
            motivationalMessage: "🌐 You're becoming a recognized voice! Your contributions are building your reputation as an expert.",
          },
          {
            number: 6,
            title: 'Brand Establishment',
            weeks: 'Weeks 41-46',
            description: 'Thought leadership and visibility',
            objectives: [
              'Launch personal brand website or portfolio',
              'Speak at meetups or virtual events (2-3 times)',
              'Build engaged following on LinkedIn (500+ connections)',
            ],
            tasks: [
              { id: '6-12m-p6-t1', text: 'Launch professional portfolio website', isCompleted: false },
              { id: '6-12m-p6-t2', text: 'Deliver 3 talks or presentations', isCompleted: false },
              { id: '6-12m-p6-t3', text: 'Grow LinkedIn to 500+ connections', isCompleted: false },
              { id: '6-12m-p6-t4', text: 'Create signature content series', isCompleted: false },
            ],
            motivationalMessage: "💫 Your brand is shining! People are starting to recognize your name and expertise in the field.",
          },
          {
            number: 7,
            title: 'Thought Leadership',
            weeks: 'Weeks 47-50',
            description: 'Advanced content and influence',
            objectives: [
              'Write comprehensive guides or tutorials',
              'Create video content or podcast appearances',
              'Establish yourself as go-to resource in your niche',
            ],
            tasks: [
              { id: '6-12m-p7-t1', text: 'Publish comprehensive guide or mini-course', isCompleted: false },
              { id: '6-12m-p7-t2', text: 'Appear on 2 podcasts or webinars', isCompleted: false },
              { id: '6-12m-p7-t3', text: 'Create video tutorial series', isCompleted: false },
              { id: '6-12m-p7-t4', text: 'Get featured in industry publication', isCompleted: false },
            ],
            motivationalMessage: "🎤 You're a thought leader now! Your insights are shaping conversations in your industry.",
          },
          {
            number: 8,
            title: 'Strategic Transition',
            weeks: 'Weeks 51-52',
            description: 'Leverage expertise for premium opportunities',
            objectives: [
              'Leverage network for warm introductions to opportunities',
              'Target senior or specialized roles matching expertise',
              'Showcase comprehensive portfolio during interviews',
              'Negotiate premium compensation packages',
            ],
            tasks: [
              { id: '6-12m-p8-t1', text: 'Activate network for warm introductions', isCompleted: false },
              { id: '6-12m-p8-t2', text: 'Apply to 20 premium positions', isCompleted: false },
              { id: '6-12m-p8-t3', text: 'Secure 5+ interviews at target companies', isCompleted: false },
              { id: '6-12m-p8-t4', text: 'Negotiate and accept optimal offer', isCompleted: false },
              { id: '6-12m-p8-t5', text: 'Plan 90-day impact strategy for new role', isCompleted: false },
            ],
            motivationalMessage: "👑 You've earned this! Walk into these conversations as the expert you've become. Your year of dedication has prepared you for this moment.",
          },
        ],
      };
      return { ...sustainable, phases: customizePhases(sustainable.phases) };

    case '12m+':
      const strategic: RoadmapPlan = {
        name: customizePlanName('Long-term Career Growth Plan'),
        totalDays: 540, // ~18 months
        strategy: 'strategic',
        phases: [
          {
            number: 1,
            title: 'Strategic Vision',
            weeks: 'Months 1-2',
            description: 'Comprehensive career architecture',
            objectives: [
              'Conduct extensive market research and skill mapping',
              'Create comprehensive 18-month development plan',
              'Identify multiple career paths and specializations',
            ],
            tasks: [
              { id: '12m+-p1-t1', text: 'Complete extensive industry research and skill gap analysis', isCompleted: false },
              { id: '12m+-p1-t2', text: 'Design 18-month strategic roadmap', isCompleted: false },
              { id: '12m+-p1-t3', text: 'Identify 3 potential career paths', isCompleted: false },
              { id: '12m+-p1-t4', text: 'Set quarterly success metrics', isCompleted: false },
            ],
            motivationalMessage: "🎯 You're thinking long-term—that's the mindset of winners! This strategic approach will position you for extraordinary success.",
          },
          {
            number: 2,
            title: 'Relationship Foundation',
            weeks: 'Months 3-4',
            description: 'Build influential network',
            objectives: [
              'Build relationships with 10+ industry leaders',
              'Establish long-term learning partnerships',
            ],
            tasks: [
              { id: '12m+-p2-t1', text: 'Connect with 15 industry leaders', isCompleted: false },
              { id: '12m+-p2-t2', text: 'Secure 2-3 long-term mentors', isCompleted: false },
              { id: '12m+-p2-t3', text: 'Join 5 professional associations', isCompleted: false },
              { id: '12m+-p2-t4', text: 'Attend 3 exclusive networking events', isCompleted: false },
            ],
            motivationalMessage: "🤝 The relationships you're building now are the foundation of your future success. Invest deeply in authentic connections.",
          },
          {
            number: 3,
            title: 'Academic Excellence',
            weeks: 'Months 5-7',
            description: 'Advanced education and credentials',
            objectives: [
              'Enroll in degree program or advanced certifications',
              'Set up systems for continuous skill development',
            ],
            tasks: [
              { id: '12m+-p3-t1', text: 'Enroll in advanced degree or certificate program', isCompleted: false },
              { id: '12m+-p3-t2', text: 'Complete first semester/module with excellence', isCompleted: false },
              { id: '12m+-p3-t3', text: 'Build structured learning system (15+ hrs/week)', isCompleted: false },
              { id: '12m+-p3-t4', text: 'Achieve top 10% performance in courses', isCompleted: false },
            ],
            motivationalMessage: "📚 Academic excellence is your competitive advantage! You're building credentials that will set you apart for decades.",
          },
          {
            number: 4,
            title: 'Mastery Development',
            weeks: 'Months 8-10',
            description: 'Deep skill mastery',
            objectives: [
              'Master specialized tools and methodologies',
              'Develop proprietary frameworks or methodologies',
            ],
            tasks: [
              { id: '12m+-p4-t1', text: 'Master 5 specialized tools/platforms', isCompleted: false },
              { id: '12m+-p4-t2', text: 'Develop unique methodology or framework', isCompleted: false },
              { id: '12m+-p4-t3', text: 'Document mastery through tutorials', isCompleted: false },
              { id: '12m+-p4-t4', text: 'Receive recognition from peers', isCompleted: false },
            ],
            motivationalMessage: "⚡ You're reaching mastery level! This depth of expertise is what transforms careers from good to exceptional.",
          },
          {
            number: 5,
            title: 'Portfolio Excellence',
            weeks: 'Months 11-13',
            description: 'Build world-class portfolio',
            objectives: [
              'Build 8-10 complex portfolio projects',
              'Create comprehensive body of work demonstrating expertise',
            ],
            tasks: [
              { id: '12m+-p5-t1', text: 'Complete 8 advanced portfolio projects', isCompleted: false },
              { id: '12m+-p5-t2', text: 'Publish projects with detailed documentation', isCompleted: false },
              { id: '12m+-p5-t3', text: 'Get projects featured in industry publications', isCompleted: false },
              { id: '12m+-p5-t4', text: 'Create video walkthroughs of key projects', isCompleted: false },
            ],
            motivationalMessage: "🏗️ Your portfolio is becoming legendary! This body of work will speak louder than any resume ever could.",
          },
          {
            number: 6,
            title: 'Thought Leadership Launch',
            weeks: 'Months 14-15',
            description: 'Publish original insights',
            objectives: [
              'Publish research papers or in-depth case studies',
              'Publish book, course, or comprehensive guide',
            ],
            tasks: [
              { id: '12m+-p6-t1', text: 'Publish 3 in-depth research articles', isCompleted: false },
              { id: '12m+-p6-t2', text: 'Launch comprehensive online course or guide', isCompleted: false },
              { id: '12m+-p6-t3', text: 'Get published in major industry publication', isCompleted: false },
              { id: '12m+-p6-t4', text: 'Receive 1000+ views on published content', isCompleted: false },
            ],
            motivationalMessage: "✍️ Your voice matters! The insights you're sharing are positioning you as a true industry authority.",
          },
          {
            number: 7,
            title: 'Public Speaking & Visibility',
            weeks: 'Months 16',
            description: 'Stage presence and influence',
            objectives: [
              'Speak at major industry conferences (3-5 times)',
              'Appear on podcasts and industry publications',
            ],
            tasks: [
              { id: '12m+-p7-t1', text: 'Deliver 4 conference talks', isCompleted: false },
              { id: '12m+-p7-t2', text: 'Appear on 5 industry podcasts', isCompleted: false },
              { id: '12m+-p7-t3', text: 'Get interviewed by major publications', isCompleted: false },
              { id: '12m+-p7-t4', text: 'Build personal speaking brand', isCompleted: false },
            ],
            motivationalMessage: "🎤 You're on stage now! Your ideas are reaching thousands. This is the impact you were meant to have.",
          },
          {
            number: 8,
            title: 'Influence & Brand',
            weeks: 'Months 17',
            description: 'Establish market presence',
            objectives: [
              'Establish strong personal brand and online presence',
              'Build substantial LinkedIn following (1000+ connections)',
              'Create viral content demonstrating expertise',
            ],
            tasks: [
              { id: '12m+-p8-t1', text: 'Launch premium personal brand website', isCompleted: false },
              { id: '12m+-p8-t2', text: 'Grow to 1000+ LinkedIn connections', isCompleted: false },
              { id: '12m+-p8-t3', text: 'Create viral content (10k+ impressions)', isCompleted: false },
              { id: '12m+-p8-t4', text: 'Establish email list of 500+ subscribers', isCompleted: false },
            ],
            motivationalMessage: "🌟 You're a recognized brand now! People seek YOU out for your expertise. You've built something remarkable.",
          },
          {
            number: 9,
            title: 'Community Leadership',
            weeks: 'Months 18',
            description: 'Give back and mentor',
            objectives: [
              'Mentor others in your previous field',
              'Build reputation as industry expert and innovator',
            ],
            tasks: [
              { id: '12m+-p9-t1', text: 'Mentor 3-5 career transitioners', isCompleted: false },
              { id: '12m+-p9-t2', text: 'Lead community initiative or project', isCompleted: false },
              { id: '12m+-p9-t3', text: 'Organize industry meetup or workshop', isCompleted: false },
              { id: '12m+-p9-t4', text: 'Receive community recognition award', isCompleted: false },
            ],
            motivationalMessage: "🌱 You're lifting others as you rise—the mark of true leadership. Your impact is multiplying through others.",
          },
          {
            number: 10,
            title: 'Elite Transition',
            weeks: 'Months 18+',
            description: 'Command your position',
            objectives: [
              'Receive inbound opportunities from reputation',
              'Target executive or specialist positions',
              'Negotiate exceptional compensation and benefits',
              'Choose opportunities aligned with long-term vision',
            ],
            tasks: [
              { id: '12m+-p10-t1', text: 'Field inbound opportunities from reputation', isCompleted: false },
              { id: '12m+-p10-t2', text: 'Interview at 10+ elite companies', isCompleted: false },
              { id: '12m+-p10-t3', text: 'Negotiate multiple 6-figure offers', isCompleted: false },
              { id: '12m+-p10-t4', text: 'Accept optimal role aligned with vision', isCompleted: false },
              { id: '12m+-p10-t5', text: 'Execute flawless 90-day entry plan', isCompleted: false },
            ],
            motivationalMessage: "👑 You've become extraordinary! Companies compete for YOU now. Walk into this next chapter knowing you've earned every bit of it.",
          },
        ],
      };
      return { ...strategic, phases: customizePhases(strategic.phases) };

    default:
      return getRoadmapPlan('3-6m', goal);
  }
}

/**
 * Calculate the current day of the plan based on start date
 */
export function calculateCurrentDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get the current phase based on day and total plan length
 */
export function getCurrentPhase(currentDay: number, plan: RoadmapPlan): RoadmapPhase {
  const daysPerPhase = plan.totalDays / plan.phases.length;
  const phaseIndex = Math.min(
    Math.floor(currentDay / daysPerPhase),
    plan.phases.length - 1
  );
  return plan.phases[phaseIndex];
}

/**
 * Get current week number within the plan
 */
export function getCurrentWeek(startDate: string): number {
  const currentDay = calculateCurrentDay(startDate);
  return Math.ceil(currentDay / 7);
}

/**
 * Get current week within a specific phase
 */
export function getCurrentWeekInPhase(currentDay: number, phase: RoadmapPhase, plan: RoadmapPlan): number {
  const daysPerPhase = plan.totalDays / plan.phases.length;
  const phaseStartDay = (phase.number - 1) * daysPerPhase;
  const dayInPhase = currentDay - phaseStartDay;
  return Math.max(1, Math.ceil(dayInPhase / 7));
}

/**
 * Check if a phase is completed (all tasks done)
 */
export function isPhaseCompleted(phase: RoadmapPhase): boolean {
  return phase.tasks.every(task => task.isCompleted);
}

/**
 * Get phase completion percentage
 */
export function getPhaseCompletionPercentage(phase: RoadmapPhase): number {
  if (phase.tasks.length === 0) return 0;
  const completedTasks = phase.tasks.filter(task => task.isCompleted).length;
  return Math.round((completedTasks / phase.tasks.length) * 100);
}

/**
 * Get overall roadmap completion percentage
 */
export function getRoadmapCompletionPercentage(plan: RoadmapPlan): number {
  const totalTasks = plan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  if (totalTasks === 0) return 0;
  const completedTasks = plan.phases.reduce((sum, phase) =>
    sum + phase.tasks.filter(task => task.isCompleted).length, 0
  );
  return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Get AI coaching context based on plan strategy and current phase
 */
export function getStrategyContext(strategy: RoadmapPlan['strategy'], currentPhase?: RoadmapPhase, goal?: CareerGoal): string {
  let baseContext = '';

  // Add specialized context for Freelance/Startup and Salary/Promotion paths
  if (goal === 'Freelance/Startup Path') {
    baseContext = 'This user is launching a freelance business or startup. Use Lean Startup methodology: focus on MVP development, customer validation, rapid iteration, and landing first paying clients. Emphasize building in public, founder networking, and practical client acquisition strategies. ';
  } else if (goal === 'Salary Negotiation & Promotion') {
    baseContext = 'This user is seeking a promotion or salary increase. Act as a negotiation coach: help them quantify impact, research market rates, build executive presence, and prepare for high-stakes meetings. Provide word-for-word scripts and psychological tactics. ';
  }

  switch (strategy) {
    case 'sprint':
      baseContext += 'This is a 90-day intensive sprint. Focus on immediate, high-impact actions. Suggest daily networking, rapid skill demonstrations, and aggressive timeline for applications. Emphasize quick wins and momentum.';
      break;

    case 'balanced':
      baseContext += 'This is a 180-day balanced transition. Balance immediate actions with strategic skill building. Suggest consistent weekly progress, networking, and portfolio development. Emphasize sustainable momentum.';
      break;

    case 'sustainable':
      baseContext += 'This is a 365-day mastery journey. Focus on deep skill development, certifications, and gradual brand building. Suggest long-term learning paths, community involvement, and strategic positioning. Emphasize quality over speed.';
      break;

    case 'strategic':
      baseContext += 'This is a long-term strategic growth plan (18+ months). Focus on comprehensive skill mastery, thought leadership, and industry positioning. Suggest advanced certifications, speaking opportunities, and building influence. Emphasize strategic career architecture.';
      break;

    default:
      baseContext = '';
  }

  if (currentPhase) {
    baseContext += ` The user is currently in Phase ${currentPhase.number}: ${currentPhase.title} (${currentPhase.weeks}). ${currentPhase.description}. Focus your advice on helping them with the following objectives: ${currentPhase.objectives.join(', ')}.`;
  }

  return baseContext;
}

/**
 * Get motivational message based on progress
 */
export function getProgressMessage(
  currentDay: number,
  totalDays: number,
  planName: string
): string {
  const percentComplete = (currentDay / totalDays) * 100;

  if (percentComplete < 25) {
    return `You are ${currentDay} days into your ${planName}. Strong start!`;
  } else if (percentComplete < 50) {
    return `You are ${currentDay} days closer to your ${planName} goal. Keep going!`;
  } else if (percentComplete < 75) {
    return `You are ${currentDay} days closer to your ${planName} goal. You're over halfway!`;
  } else if (percentComplete < 100) {
    return `You are ${currentDay} days closer to your ${planName} goal. The finish line is near!`;
  } else {
    return `You've completed your ${planName}! Time to reflect and plan next steps.`;
  }
}
