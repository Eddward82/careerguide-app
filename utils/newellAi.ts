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
  roadmapPlan?: { name: string; strategy: string; totalDays: number },
  focusAreas?: string[]
): Promise<string[]> => {
  try {
    // Import strategy context
    const { getStrategyContext } = require('./roadmap');

    // Create hyper-personalized prompt with driver and roadmap information
    const driverContext = transitionDriver
      ? `They are motivated by: ${transitionDriver}. Keep this motivation in mind when crafting your advice.`
      : '';

    const driverGuidance = transitionDriver
      ? getDriverSpecificGuidance(transitionDriver)
      : '';

    const roadmapContext = roadmapPlan
      ? `\n\nROADMAP CONTEXT: ${name} is following the "${roadmapPlan.name}" (${roadmapPlan.totalDays} days). ${getStrategyContext(roadmapPlan.strategy as any)}`
      : '';

    const focusAreasContext = focusAreas && focusAreas.length > 0
      ? `\n\nFOCUS AREAS: ${name} wants to prioritize these areas: ${focusAreas.join(', ')}. Tailor your advice to emphasize these specific focus areas.`
      : '';

    const prompt = `You are a professional career coach. Create a focused 3-step immediate action plan for ${name}, who is a ${currentRole} with ${yearsExperience} years of experience, transitioning to ${targetGoal} within ${timeline}.

${driverContext}${roadmapContext}${focusAreasContext}

Focus on:
1. Identifying and leveraging transferable skills
2. Immediate actionable steps they can take this week
3. Building momentum for their transition
${driverGuidance}

Return ONLY 3 specific, actionable steps as a numbered list. Each step should be:
- Concrete and immediately actionable
- Specific to their background and goal
- Achievable within 1-2 weeks
- Aligned with the roadmap strategy

Format your response as:
1. [First actionable step]
2. [Second actionable step]
3. [Third actionable step]`;

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

    // If parsing fails, return fallback steps
    if (steps.length === 0) {
      return getFallbackPlan(currentRole, targetGoal);
    }

    return steps;
  } catch (error) {
    console.error('Error generating initial plan with Newell AI:', error);
    // Return fallback plan if API fails
    return getFallbackPlan(currentRole, targetGoal);
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
 * Fallback plan if AI generation fails
 */
function getFallbackPlan(currentRole: string, targetGoal: string): string[] {
  return [
    `Audit your current skills from ${currentRole} and map them to ${targetGoal} requirements. Create a skills gap document.`,
    `Connect with 3 professionals already working in ${targetGoal}. Schedule informational interviews to learn about their transition journey.`,
    `Start building your professional brand: Update your LinkedIn profile highlighting transferable skills relevant to ${targetGoal}.`,
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
  }
): Promise<{ advice: string; actionPlan: string[] }> => {
  try {
    const { name, currentRole, targetGoal, yearsExperience } = userProfile;

    const prompt = `You are a professional career coach. ${name} is transitioning from ${currentRole} (${yearsExperience} years experience) to ${targetGoal}. They are facing this challenge:

"${challenge}"

Provide:
1. Brief empathetic response (2-3 sentences)
2. Three specific actionable steps they can take to address this challenge

Format your response as:
[Brief empathetic response]

Action Steps:
1. [First step]
2. [Second step]
3. [Third step]`;

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
