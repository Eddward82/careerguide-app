import Constants from 'expo-constants';

// Access environment variables from both Constants.expoConfig and process.env
const NEWELL_API_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_NEWELL_API_URL ||
  process.env.EXPO_PUBLIC_NEWELL_API_URL ||
  'https://newell.fastshot.ai';

const PROJECT_ID =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_PROJECT_ID ||
  process.env.EXPO_PUBLIC_PROJECT_ID;

interface NewellAIResponse {
  success: boolean;
  data?: {
    message?: string;
    steps?: string[];
  };
  error?: string;
}

/**
 * Get driver-specific guidance for the AI prompt
 */
function getDriverSpecificGuidance(driver: string): string {
  const guidanceMap: Record<string, string> = {
    'Escape': '4. Prioritize quick wins and immediate relief from current situation while building long-term foundation',
    'Better Pay': '4. Focus on highlighting high-value skills and salary negotiation strategies',
    'Career Growth': '4. Emphasize leadership development and advancement opportunities',
    'Passion': '4. Help align daily actions with their core interests and values',
    'Work-Life Balance': '4. Recommend sustainable career moves that prioritize flexibility and boundaries',
    'Personal Development': '4. Include learning opportunities and skill-building activities',
  };
  return guidanceMap[driver] || '';
}

/**
 * Generate initial career transition plan using Newell AI
 */
export const generateInitialPlan = async (
  name: string,
  currentRole: string,
  targetGoal: string,
  yearsExperience: number,
  timeline: string,
  transitionDriver?: string,
  roadmapPlan?: { name: string; strategy: string; totalDays: number; phases?: Array<{ number: number; title: string; objectives: string[] }> },
  focusAreas?: string[]
): Promise<string[]> => {
  try {
    // Import strategy context
    const { getStrategyContext } = require('./roadmap');

    // Get Phase 1 objectives for context
    const phase1Objectives = roadmapPlan?.phases?.[0]?.objectives || [];

    // Create hyper-personalized prompt
    const identityContext = `${name}, a ${currentRole} with ${yearsExperience} years of experience`;

    const visionContext = targetGoal + (focusAreas && focusAreas.length > 0
      ? ` (specifically focusing on: ${focusAreas.join(', ')})`
      : '');

    const motivationContext = transitionDriver
      ? `\n\n💡 MOTIVATION: ${name} is driven by "${transitionDriver}". This is their "why" - make sure every piece of advice speaks to this core motivation.`
      : '';

    const urgencyContext = roadmapPlan
      ? `\n\n⏱️ URGENCY: ${name} is on the "${roadmapPlan.name}" - that's ${roadmapPlan.totalDays} days. ${getStrategyContext(roadmapPlan.strategy as any)} Time is of the essence.`
      : '';

    const phase1Context = phase1Objectives.length > 0
      ? `\n\n🎯 PHASE 1 OBJECTIVES (Foundation):\n${phase1Objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\nYour 3 immediate action steps should directly support these Phase 1 objectives.`
      : '';

    const prompt = `You are an elite career transition coach working 1-on-1 with ${identityContext}.

🎯 MISSION: Create a personalized "First Milestone" - 3 immediate, high-impact action steps for ${name}'s transition from ${currentRole} to ${visionContext}.

👤 CLIENT PROFILE:
- Current: ${currentRole} (${yearsExperience} years)
- Target: ${visionContext}
- Timeline: ${timeline}${motivationContext}${urgencyContext}${phase1Context}

🚫 CRITICAL INSTRUCTIONS - AVOID THESE TEMPLATE PHRASES:
❌ "Audit your skills from [Role] to [Goal]"
❌ "Connect with 3 professionals in [Field]"
❌ "Update your LinkedIn profile"
❌ "Research companies in [Industry]"
❌ "Take online courses in [Subject]"

✅ INSTEAD, BE HYPER-SPECIFIC:
- Reference ${name}'s ${yearsExperience} years as ${currentRole} explicitly
- Name specific skills from their background that transfer (e.g., if retail: customer service, inventory management, sales targets)
- Suggest concrete, named tools/platforms/resources
- Include real-world examples specific to their situation
- Make each step feel like it was written by someone who deeply understands their unique journey

📝 EXAMPLE OF GOOD VS BAD:
❌ BAD (template): "Update your resume to highlight transferable skills"
✅ GOOD (personalized): "Revise your resume's 'Professional Experience' section to reframe your ${yearsExperience} years managing teams in ${currentRole} as 'Cross-Functional Leadership' - emphasize how you coordinated with vendors (=stakeholder management) and optimized shift schedules (=resource allocation), skills directly relevant to ${targetGoal}"

Return EXACTLY 3 action steps numbered 1-3. Each should be 2-3 sentences long, ultra-specific, and immediately actionable THIS WEEK.`;

    const response = await fetch(`${NEWELL_API_URL}/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-ID': PROJECT_ID || '',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'gpt-4o-mini', // Fast and cost-effective for plan generation
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Newell AI API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the AI response
    const aiMessage = data.choices?.[0]?.message?.content || '';

    // Parse the numbered list into an array
    const steps = parseActionSteps(aiMessage);

    // If parsing fails, return smart fallback steps
    if (steps.length === 0) {
      return getFallbackPlan(currentRole, targetGoal, name, yearsExperience, focusAreas);
    }

    return steps;
  } catch (error) {
    console.error('Error generating initial plan with Newell AI:', error);
    // Return smart fallback plan if API fails
    return getFallbackPlan(currentRole, targetGoal, name, yearsExperience, focusAreas);
  }
};

/**
 * Parse AI response into action steps
 */
function parseActionSteps(aiResponse: string): string[] {
  const steps: string[] = [];

  // Split by lines and filter numbered items
  const lines = aiResponse.split('\n').filter(line => line.trim().length > 0);

  for (const line of lines) {
    // Match patterns like "1. ", "1) ", or "Step 1: "
    const match = line.match(/^(?:\d+[\.)]\s*|Step\s+\d+:\s*)(.*)/i);
    if (match && match[1]) {
      const step = match[1].trim();
      if (step.length > 0) {
        steps.push(step);
      }
    }
  }

  // If we found steps, return the first 3
  if (steps.length > 0) {
    return steps.slice(0, 3);
  }

  // Alternative: try to split by numbers at the start of lines
  const numberedLines = aiResponse
    .split('\n')
    .filter(line => /^\d+/.test(line.trim()))
    .map(line => line.replace(/^\d+[\.)]\s*/, '').trim())
    .filter(line => line.length > 0);

  if (numberedLines.length > 0) {
    return numberedLines.slice(0, 3);
  }

  return [];
}

/**
 * Smart fallback plan with role-specific intelligence
 */
function getFallbackPlan(
  currentRole: string,
  targetGoal: string,
  name?: string,
  yearsExperience?: number,
  focusAreas?: string[]
): string[] {
  const experience = yearsExperience || 2;
  const userName = name || 'you';
  const focusText = focusAreas && focusAreas.length > 0 ? ` focusing on ${focusAreas[0]}` : '';

  // Provide intelligent, role-specific fallbacks based on common transition patterns
  const techTransitionSteps = [
    `Create a technical portfolio on GitHub showcasing 2-3 projects${focusText}. Start with a simple project that demonstrates your problem-solving skills from your ${experience} years in ${currentRole}.`,
    `Join tech communities on Discord or Reddit (r/cscareerquestions, r/learnprogramming) and engage with 5 experienced developers. Ask specific questions about transitioning from ${currentRole} to tech roles.`,
    `Dedicate 1 hour daily to hands-on coding practice on platforms like LeetCode Easy problems or freeCodeCamp. Document your learning journey on LinkedIn to build visibility.`,
  ];

  const managementTransitionSteps = [
    `Document 3-5 leadership moments from your ${experience} years as ${currentRole} where you influenced outcomes, resolved conflicts, or drove team results. Frame these as "Leadership Portfolio" case studies.`,
    `Reach out to 3 current managers in your target industry on LinkedIn. Ask for 15-minute informational interviews about their transition journey and what skills mattered most.`,
    `Enroll in a free management fundamentals course (Coursera, LinkedIn Learning) and apply one framework from each module to a real scenario in your current role. Share insights on LinkedIn.`,
  ];

  const resumeRefreshSteps = [
    `Rewrite your top 3 job descriptions using the "CAR" method: Challenge you faced, Action you took, Result you achieved. Quantify results wherever possible (e.g., "increased efficiency by 20%").`,
    `Research 5 job postings for your target role and identify the top 10 keywords/skills they mention. Update your resume and LinkedIn profile to include these exact terms where truthful.`,
    `Get your resume reviewed by 2-3 peers or use a free ATS scanner tool. Make revisions based on feedback, focusing on clarity and impact rather than length.`,
  ];

  // Match based on target goal
  if (targetGoal.toLowerCase().includes('tech') || targetGoal.toLowerCase().includes('software')) {
    return techTransitionSteps;
  } else if (targetGoal.toLowerCase().includes('management') || targetGoal.toLowerCase().includes('lead')) {
    return managementTransitionSteps;
  } else if (targetGoal.toLowerCase().includes('resume') || targetGoal.toLowerCase().includes('refresh')) {
    return resumeRefreshSteps;
  }

  // Generic but still personalized fallback
  return [
    `Document your ${experience} years of ${currentRole} experience: Create a "Wins Document" listing 10-15 major accomplishments with quantifiable results. This becomes your foundation for resumes, interviews, and LinkedIn.`,
    `Identify 5-10 people currently working in ${targetGoal} roles via LinkedIn. Send personalized connection requests mentioning a specific post they made or achievement you admire. Request brief informational interviews.`,
    `Set up job alerts on LinkedIn, Indeed, and Glassdoor for "${targetGoal}" roles. Review 10 job descriptions to identify common requirements, then create a skills development plan targeting your top 3 gaps.`,
  ];
}

/**
 * Generate coaching advice for a specific challenge
 */
export const generateCoachingAdvice = async (
  challenge: string,
  userProfile: {
    name: string;
    currentRole: string;
    targetGoal: string;
    yearsExperience: number;
    focusAreas?: string[];
    transitionDriver?: string;
  }
): Promise<{ advice: string; actionPlan: string[] }> => {
  try {
    const { name, currentRole, targetGoal, yearsExperience, focusAreas, transitionDriver } = userProfile;

    const focusContext = focusAreas && focusAreas.length > 0
      ? ` with focus areas: ${focusAreas.join(', ')}`
      : '';

    const driverContext = transitionDriver
      ? ` Their core motivation is: ${transitionDriver}.`
      : '';

    const prompt = `You are an elite career coach in a 1-on-1 session with ${name}.

👤 CLIENT CONTEXT:
- Current: ${currentRole} (${yearsExperience} years)
- Target: ${targetGoal}${focusContext}${driverContext}

💬 CHALLENGE: "${challenge}"

🎯 YOUR MISSION:
1. Give a brief, empathetic response (2-3 sentences) that shows you understand their specific situation. Reference their ${yearsExperience} years in ${currentRole} or their transition to ${targetGoal} to make it personal.

2. Provide 3 ultra-specific, immediately actionable steps to address this challenge.

🚫 AVOID TEMPLATE RESPONSES LIKE:
❌ "Break down the challenge into smaller tasks"
❌ "Reach out to your network"
❌ "Research best practices"

✅ INSTEAD, BE SPECIFIC:
- Name concrete tools, platforms, or resources (e.g., "Use Notion to...", "Join the r/cscareerquestions subreddit")
- Reference their background explicitly (e.g., "Your ${yearsExperience} years in ${currentRole} means you already have...")
- Give exact time allocations (e.g., "Spend 30 minutes today...")
- Include real-world examples relevant to their situation

Format your response as:
[Empathetic response]

Action Steps:
1. [First ultra-specific step]
2. [Second ultra-specific step]
3. [Third ultra-specific step]`;

    const response = await fetch(`${NEWELL_API_URL}/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-ID': PROJECT_ID || '',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Newell AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';

    // Split response into advice and action steps
    const parts = aiMessage.split(/Action Steps?:/i);
    const advice = parts[0]?.trim() || 'I understand your challenge. Let\'s work through this together.';
    const actionStepsText = parts[1] || '';

    const actionSteps = parseActionSteps(actionStepsText);

    return {
      advice,
      actionPlan: actionSteps.length > 0 ? actionSteps : [
        'Break down the challenge into smaller, manageable tasks',
        'Seek advice from someone who has overcome similar obstacles',
        'Take one concrete action today, no matter how small',
      ],
    };
  } catch (error) {
    console.error('Error generating coaching advice:', error);
    return {
      advice: 'I understand your challenge. Let\'s work through this together with a structured approach.',
      actionPlan: [
        'Break down the challenge into smaller, manageable tasks',
        'Seek advice from someone who has overcome similar obstacles',
        'Take one concrete action today, no matter how small',
      ],
    };
  }
};

/**
 * Refine roadmap with AI to create hyper-personalized objectives
 */
export const refineRoadmapWithAI = async (
  userProfile: {
    name: string;
    currentRole: string;
    careerGoal: string;
    yearsExperience: number;
    focusAreas?: string[];
  },
  phase: {
    number: number;
    title: string;
    description: string;
    objectives: string[];
  }
): Promise<string[]> => {
  try {
    const { name, currentRole, careerGoal, yearsExperience, focusAreas } = userProfile;

    const focusAreasText = focusAreas && focusAreas.length > 0
      ? ` with focus on: ${focusAreas.join(', ')}`
      : '';

    const prompt = `You are a professional career coach. Personalize these career roadmap objectives for ${name}.

USER PROFILE:
- Current Role: ${currentRole}
- Years of Experience: ${yearsExperience}
- Career Goal: ${careerGoal}${focusAreasText}

PHASE: ${phase.title} - ${phase.description}

GENERIC OBJECTIVES:
${phase.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Transform these generic objectives into specific, personalized actions that:
1. Reference ${name}'s ${yearsExperience} years as a ${currentRole}
2. Are specific to their transition to ${careerGoal}
3. Include concrete examples relevant to their background
4. Align with their focus areas${focusAreasText}

For example, instead of "Update resume", say "Highlight your ${yearsExperience} years of ${currentRole} experience, emphasizing [specific transferable skills] for your ${careerGoal} transition"

Return EXACTLY ${phase.objectives.length} personalized objectives, numbered 1-${phase.objectives.length}.`;

    const response = await fetch(`${NEWELL_API_URL}/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-ID': PROJECT_ID || '',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'gpt-4o-mini',
        temperature: 0.8, // Higher temperature for more creative personalization
      }),
    });

    if (!response.ok) {
      throw new Error(`Newell AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';

    // Parse the numbered objectives
    const refinedObjectives = parseActionSteps(aiMessage);

    // If we got the right number of objectives, return them
    if (refinedObjectives.length >= phase.objectives.length) {
      return refinedObjectives.slice(0, phase.objectives.length);
    }

    // Otherwise, return the original objectives
    return phase.objectives;
  } catch (error) {
    console.error('Error refining roadmap with AI:', error);
    // Return original objectives if AI refinement fails
    return phase.objectives;
  }
};
