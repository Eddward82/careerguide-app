import { TransitionTimeline } from '@/types';

export interface RoadmapPlan {
  name: string;
  totalDays: number;
  strategy: 'sprint' | 'balanced' | 'sustainable' | 'strategic';
  phases: RoadmapPhase[];
}

export interface RoadmapPhase {
  number: number;
  title: string;
  weeks: string;
  description: string;
  objectives: string[];
}

/**
 * Get the dynamic roadmap plan based on the user's selected timeline
 */
export function getRoadmapPlan(timeline: TransitionTimeline): RoadmapPlan {
  switch (timeline) {
    case '1-3m':
      return {
        name: '90-Day Career Sprint',
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
          },
        ],
      };

    case '3-6m':
      return {
        name: '180-Day Career Transition Roadmap',
        totalDays: 180,
        strategy: 'balanced',
        phases: [
          {
            number: 1,
            title: 'Foundation',
            weeks: 'Weeks 1-6',
            description: 'Build your foundation and brand',
            objectives: [
              'Complete comprehensive skills gap analysis',
              'Update LinkedIn with professional headline and summary',
              'Research 10-15 target companies in your desired field',
              'Create a personalized career transition roadmap',
              'Build initial portfolio or personal website',
              'Identify and reach out to 3-5 potential mentors',
            ],
          },
          {
            number: 2,
            title: 'Skill Building',
            weeks: 'Weeks 7-16',
            description: 'Strategic upskilling and networking',
            objectives: [
              'Complete 2-3 relevant online courses or certifications',
              'Work on 2-3 portfolio projects demonstrating new skills',
              'Attend weekly networking events or industry meetups',
              'Conduct 10-15 informational interviews',
              'Start contributing to industry discussions on LinkedIn',
              'Join 2-3 professional communities or Slack groups',
              'Document your learning journey publicly',
            ],
          },
          {
            number: 3,
            title: 'Market Positioning',
            weeks: 'Weeks 17-24',
            description: 'Active job search and interviews',
            objectives: [
              'Launch active job search with 10-15 applications weekly',
              'Tailor resume and cover letter for each position',
              'Prepare comprehensive interview prep document',
              'Practice mock interviews with peers or mentors',
              'Build relationships with recruiters in target industry',
              'Showcase completed projects and certifications',
              'Negotiate multiple offers strategically',
            ],
          },
        ],
      };

    case '6-12m':
      return {
        name: '365-Day Mastery Plan',
        totalDays: 365,
        strategy: 'sustainable',
        phases: [
          {
            number: 1,
            title: 'Foundation',
            weeks: 'Weeks 1-12',
            description: 'Deep skill development and planning',
            objectives: [
              'Create detailed 12-month learning curriculum',
              'Enroll in comprehensive certification programs',
              'Set up structured learning schedule (10-15 hrs/week)',
              'Build foundational knowledge through courses and books',
              'Start documenting learning journey via blog or Medium',
              'Connect with 5-10 mentors and industry experts',
              'Establish clear success metrics for your transition',
            ],
          },
          {
            number: 2,
            title: 'Growth',
            weeks: 'Weeks 13-32',
            description: 'Certifications and portfolio building',
            objectives: [
              'Complete 3-5 professional certifications',
              'Build 5-7 substantial portfolio projects',
              'Contribute to open source or community projects',
              'Attend industry conferences and workshops',
              'Develop specialized expertise in niche area',
              'Create case studies showcasing your work',
              'Publish 1-2 articles or tutorials monthly',
            ],
          },
          {
            number: 3,
            title: 'Brand Building',
            weeks: 'Weeks 33-44',
            description: 'Thought leadership and community',
            objectives: [
              'Launch personal brand website or portfolio',
              'Speak at meetups or virtual events (2-3 times)',
              'Write comprehensive guides or tutorials',
              'Build engaged following on LinkedIn (500+ connections)',
              'Participate actively in industry communities',
              'Create video content or podcast appearances',
              'Establish yourself as go-to resource in your niche',
            ],
          },
          {
            number: 4,
            title: 'Transition',
            weeks: 'Weeks 45-52',
            description: 'Strategic job search and offers',
            objectives: [
              'Leverage network for warm introductions to opportunities',
              'Target senior or specialized roles matching expertise',
              'Showcase comprehensive portfolio during interviews',
              'Demonstrate thought leadership and industry knowledge',
              'Negotiate premium compensation packages',
              'Evaluate cultural fit and long-term growth potential',
              'Plan smooth transition and onboarding strategy',
            ],
          },
        ],
      };

    case '12m+':
      return {
        name: 'Long-term Growth Plan',
        totalDays: 540, // ~18 months
        strategy: 'strategic',
        phases: [
          {
            number: 1,
            title: 'Strategic Foundation',
            weeks: 'Months 1-4',
            description: 'Long-term skill mapping and planning',
            objectives: [
              'Conduct extensive market research and skill mapping',
              'Create comprehensive 18-month development plan',
              'Identify multiple career paths and specializations',
              'Build relationships with 10+ industry leaders',
              'Enroll in degree program or advanced certifications',
              'Establish long-term learning partnerships',
              'Set up systems for continuous skill development',
            ],
          },
          {
            number: 2,
            title: 'Deep Learning',
            weeks: 'Months 5-10',
            description: 'Advanced certifications and projects',
            objectives: [
              'Complete advanced degree or professional certifications',
              'Master specialized tools and methodologies',
              'Build 8-10 complex portfolio projects',
              'Publish research papers or in-depth case studies',
              'Mentor others in your previous field',
              'Develop proprietary frameworks or methodologies',
              'Create comprehensive body of work demonstrating expertise',
            ],
          },
          {
            number: 3,
            title: 'Industry Positioning',
            weeks: 'Months 11-14',
            description: 'Thought leadership and influence',
            objectives: [
              'Establish strong personal brand and online presence',
              'Speak at major industry conferences (3-5 times)',
              'Publish book, course, or comprehensive guide',
              'Build substantial LinkedIn following (1000+ connections)',
              'Appear on podcasts and industry publications',
              'Create viral content demonstrating expertise',
              'Build reputation as industry expert and innovator',
            ],
          },
          {
            number: 4,
            title: 'Strategic Transition',
            weeks: 'Months 15-18',
            description: 'Selective opportunities and offers',
            objectives: [
              'Receive inbound opportunities from reputation',
              'Target executive or specialist positions',
              'Negotiate exceptional compensation and benefits',
              'Choose opportunities aligned with long-term vision',
              'Leverage thought leadership in negotiations',
              'Ensure cultural alignment and growth trajectory',
              'Plan strategic entry and 90-day impact plan',
            ],
          },
        ],
      };

    default:
      return getRoadmapPlan('3-6m');
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
 * Get AI coaching context based on plan strategy
 */
export function getStrategyContext(strategy: RoadmapPlan['strategy']): string {
  switch (strategy) {
    case 'sprint':
      return 'This is a 90-day intensive sprint. Focus on immediate, high-impact actions. Suggest daily networking, rapid skill demonstrations, and aggressive timeline for applications. Emphasize quick wins and momentum.';

    case 'balanced':
      return 'This is a 180-day balanced transition. Balance immediate actions with strategic skill building. Suggest consistent weekly progress, networking, and portfolio development. Emphasize sustainable momentum.';

    case 'sustainable':
      return 'This is a 365-day mastery journey. Focus on deep skill development, certifications, and gradual brand building. Suggest long-term learning paths, community involvement, and strategic positioning. Emphasize quality over speed.';

    case 'strategic':
      return 'This is a long-term strategic growth plan (18+ months). Focus on comprehensive skill mastery, thought leadership, and industry positioning. Suggest advanced certifications, speaking opportunities, and building influence. Emphasize strategic career architecture.';

    default:
      return '';
  }
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
