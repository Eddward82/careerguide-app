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
          },
          {
            number: 2,
            title: 'Acceleration',
            weeks: 'Weeks 4-8',
            description: 'Daily networking and skill showcase',
          },
          {
            number: 3,
            title: 'Launch',
            weeks: 'Weeks 9-12',
            description: 'Active applications and interviews',
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
          },
          {
            number: 2,
            title: 'Skill Building',
            weeks: 'Weeks 7-16',
            description: 'Strategic upskilling and networking',
          },
          {
            number: 3,
            title: 'Market Positioning',
            weeks: 'Weeks 17-24',
            description: 'Active job search and interviews',
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
          },
          {
            number: 2,
            title: 'Growth',
            weeks: 'Weeks 13-32',
            description: 'Certifications and portfolio building',
          },
          {
            number: 3,
            title: 'Brand Building',
            weeks: 'Weeks 33-44',
            description: 'Thought leadership and community',
          },
          {
            number: 4,
            title: 'Transition',
            weeks: 'Weeks 45-52',
            description: 'Strategic job search and offers',
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
          },
          {
            number: 2,
            title: 'Deep Learning',
            weeks: 'Months 5-10',
            description: 'Advanced certifications and projects',
          },
          {
            number: 3,
            title: 'Industry Positioning',
            weeks: 'Months 11-14',
            description: 'Thought leadership and influence',
          },
          {
            number: 4,
            title: 'Strategic Transition',
            weeks: 'Months 15-18',
            description: 'Selective opportunities and offers',
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
