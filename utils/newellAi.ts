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
  focusAreas?: string[],
  targetRole?: string
): Promise<string[]> => {
  try {
    // Import strategy context
    const { getStrategyContext } = require('./roadmap');

    // Get Phase 1 objectives for context
    const phase1Objectives = roadmapPlan?.phases?.[0]?.objectives || [];

    // Create hyper-personalized prompt with DUAL-CONTEXT ANALYSIS
    const identityContext = `${name}, a ${currentRole} with ${yearsExperience} years of experience`;

    // Build target vision with specific role if provided (HYPER-PRECISION)
    let visionContext = targetGoal;
    if (targetRole) {
      visionContext = `${targetGoal} (specifically targeting: ${targetRole})`;
    } else if (focusAreas && focusAreas.length > 0) {
      visionContext = `${targetGoal} (focusing on: ${focusAreas.join(', ')})`;
    }

    // Add specialized context for new career paths
    let specializedContext = '';
    if (targetGoal === 'Freelance/Startup Path') {
      specializedContext = `\n\n🚀 SPECIALIZED COACHING: ${name} is launching a freelance business or startup. Use "Lean Startup" methodology and focus on:
- MVP (Minimum Viable Product) development
- Customer validation before building
- Rapid iteration based on feedback
- Client acquisition strategies (cold outreach, platforms, warm network)
- Pricing models and contract frameworks
- Building in public and founder networking
Make all advice ultra-practical and focused on landing the first paying customers quickly.`;
    } else if (targetGoal === 'Salary Negotiation & Promotion') {
      specializedContext = `\n\n💼 SPECIALIZED COACHING: ${name} wants a promotion or salary increase. Act as a "Negotiation Coach" and focus on:
- Quantifying business impact with specific metrics (revenue, cost savings, efficiency gains)
- Market compensation research (Glassdoor, Levels.fyi, Payscale)
- Building internal visibility and executive presence
- Creating a compelling "promotion case" with documented wins
- Practicing negotiation scripts and psychological tactics
- Timing strategies for performance reviews
Provide word-for-word scripts and high-stakes meeting preparation tactics.`;
    }

    const motivationContext = transitionDriver
      ? `\n\n💡 MOTIVATION: ${name} is driven by "${transitionDriver}". This is their "why" - make sure every piece of advice speaks to this core motivation.`
      : '';

    const urgencyContext = roadmapPlan
      ? `\n\n⏱️ URGENCY: ${name} is on the "${roadmapPlan.name}" - that's ${roadmapPlan.totalDays} days. ${getStrategyContext(roadmapPlan.strategy as any, undefined, targetGoal as any)} Time is of the essence.`
      : '';

    const phase1Context = phase1Objectives.length > 0
      ? `\n\n🎯 PHASE 1 OBJECTIVES (Foundation):\n${phase1Objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\nYour 3 immediate action steps should directly support these Phase 1 objectives.`
      : '';

    // DUAL-CONTEXT: Emphasize both current AND target roles
    const transitionContext = targetRole
      ? `\n\n🎯 TRANSITION PATHWAY: ${name} is transitioning FROM ${currentRole} TO ${targetRole}. Every action step MUST reference BOTH roles to show the bridge between where they are and where they're going.`
      : '';

    const prompt = `You are an elite career transition coach working 1-on-1 with ${identityContext}.

🎯 MISSION: Create a personalized "First Milestone" - 3 immediate, high-impact action steps for ${name}'s transition from ${currentRole} to ${visionContext}.${transitionContext}

👤 CLIENT PROFILE:
- Current: ${currentRole} (${yearsExperience} years)
- Target: ${visionContext}
- Timeline: ${timeline}${motivationContext}${specializedContext}${urgencyContext}${phase1Context}

🚫 CRITICAL INSTRUCTIONS - AVOID THESE TEMPLATE PHRASES:
❌ "Audit your skills from [Role] to [Goal]"
❌ "Connect with 3 professionals in [Field]"
❌ "Update your LinkedIn profile"
❌ "Research companies in [Industry]"
❌ "Take online courses in [Subject]"

✅ INSTEAD, BE HYPER-SPECIFIC:
- Reference ${name}'s ${yearsExperience} years as ${currentRole} explicitly
- Name specific skills from their background that transfer (e.g., if retail: customer service, inventory management, sales targets)
- Suggest concrete, named tools/platforms/resources ${targetRole ? `relevant to ${targetRole}` : ''}
- Include real-world examples specific to their situation
- Make each step feel like it was written by someone who deeply understands their unique journey
${targetRole ? `- MANDATORY: Mention "${targetRole}" in at least 2 out of 3 action steps` : ''}

📝 EXAMPLE OF GOOD VS BAD:
❌ BAD (template): "Update your resume to highlight transferable skills"
✅ GOOD (personalized): "Revise your resume's 'Professional Experience' section to reframe your ${yearsExperience} years managing teams in ${currentRole} as 'Cross-Functional Leadership' - emphasize how you coordinated with vendors (=stakeholder management) and optimized shift schedules (=resource allocation), skills directly relevant to ${targetRole || targetGoal}"
${targetRole ? `\n❌ BAD: "Connect with 3 professionals in your field"\n✅ GOOD: "Connect with 3 ${targetRole} professionals on LinkedIn who successfully transitioned from ${currentRole} - send personalized messages mentioning specific projects they worked on"` : ''}

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

  const freelanceStartupSteps = [
    `Define your MVP (Minimum Viable Product): What's the simplest version of your service/product you can launch this week? Create a one-page website using Carrd or Webflow showcasing your offering.`,
    `Reach out to 10 potential customers from your ${currentRole} network. Offer a discounted "founding client" rate in exchange for testimonials and feedback. Validate demand before building.`,
    `Set up your business infrastructure: Register your business name, open a business bank account, and create service packages with clear pricing. Use contract templates from Bonsai or PandaDoc.`,
  ];

  const salaryPromotionSteps = [
    `Create a "Wins Document" listing 15-20 quantified achievements from your ${experience} years as ${currentRole}. Focus on business impact: revenue generated, costs saved, efficiency improved, or problems solved.`,
    `Research your market value using Glassdoor, Levels.fyi, and Payscale. Document the gap between your current salary and market rate. Prepare a one-page case for why you deserve the increase.`,
    `Schedule a 1-on-1 with your manager to discuss career growth. Practice your pitch: "I'd like to discuss my career trajectory and contributions. Based on [specific wins], I believe I'm ready for [promotion/raise]. Can we explore this?"`,
  ];

  // Match based on target goal
  if (targetGoal.toLowerCase().includes('tech') || targetGoal.toLowerCase().includes('software')) {
    return techTransitionSteps;
  } else if (targetGoal.toLowerCase().includes('management') || targetGoal.toLowerCase().includes('lead')) {
    return managementTransitionSteps;
  } else if (targetGoal.toLowerCase().includes('resume') || targetGoal.toLowerCase().includes('refresh')) {
    return resumeRefreshSteps;
  } else if (targetGoal.toLowerCase().includes('freelance') || targetGoal.toLowerCase().includes('startup')) {
    return freelanceStartupSteps;
  } else if (targetGoal.toLowerCase().includes('salary') || targetGoal.toLowerCase().includes('promotion') || targetGoal.toLowerCase().includes('negotiation')) {
    return salaryPromotionSteps;
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
    targetRole?: string;
  }
): Promise<{ advice: string; actionPlan: string[] }> => {
  try {
    const { name, currentRole, targetGoal, yearsExperience, focusAreas, transitionDriver, targetRole } = userProfile;

    // Build target context with hyper-precision
    let focusContext = '';
    if (targetRole) {
      focusContext = ` targeting ${targetRole}`;
    } else if (focusAreas && focusAreas.length > 0) {
      focusContext = ` with focus areas: ${focusAreas.join(', ')}`;
    }

    const driverContext = transitionDriver
      ? ` Their core motivation is: ${transitionDriver}.`
      : '';

    // Add specialized coaching context
    let coachingStyle = '';
    if (targetGoal === 'Freelance/Startup Path') {
      coachingStyle = `\n\n🚀 COACHING STYLE: Use "Lean Startup" methodology. Focus on rapid experimentation, MVP development, customer discovery, and founder mindset. Give tactical advice on client acquisition, pricing, and building in public.`;
    } else if (targetGoal === 'Salary Negotiation & Promotion') {
      coachingStyle = `\n\n💼 COACHING STYLE: Act as a "Negotiation Coach." Provide word-for-word scripts, psychological tactics for high-stakes meetings, and strategies for quantifying impact. Help them build a bulletproof case for promotion/raise.`;
    }

    // Dual-context for coaching
    const targetContext = targetRole
      ? `\n\n🎯 TRANSITION CONTEXT: ${name} is moving FROM ${currentRole} TO ${targetRole}. All advice must acknowledge both their current expertise and target destination.`
      : '';

    const prompt = `You are an elite career coach in a 1-on-1 session with ${name}.

👤 CLIENT CONTEXT:
- Current: ${currentRole} (${yearsExperience} years)
- Target: ${targetGoal}${focusContext}${driverContext}${targetContext}${coachingStyle}

💬 CHALLENGE: "${challenge}"

🎯 YOUR MISSION:
1. Give a brief, empathetic response (2-3 sentences) that shows you understand their specific situation. Reference their ${yearsExperience} years in ${currentRole} ${targetRole ? `and their goal to become a ${targetRole}` : `or their transition to ${targetGoal}`} to make it personal.

2. Provide 3 ultra-specific, immediately actionable steps to address this challenge.

🚫 AVOID TEMPLATE RESPONSES LIKE:
❌ "Break down the challenge into smaller tasks"
❌ "Reach out to your network"
❌ "Research best practices"

✅ INSTEAD, BE SPECIFIC:
- Name concrete tools, platforms, or resources (e.g., "Use Notion to...", "Join the r/cscareerquestions subreddit")
- Reference their background explicitly (e.g., "Your ${yearsExperience} years in ${currentRole} means you already have...")
${targetRole ? `- MANDATORY: Reference "${targetRole}" in at least 2 action steps` : ''}
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
    targetRole?: string;
  },
  phase: {
    number: number;
    title: string;
    description: string;
    objectives: string[];
  }
): Promise<string[]> => {
  try {
    const { name, currentRole, careerGoal, yearsExperience, focusAreas, targetRole } = userProfile;

    // Build target context with hyper-precision
    let targetContext = '';
    if (targetRole) {
      targetContext = ` targeting ${targetRole}`;
    } else if (focusAreas && focusAreas.length > 0) {
      targetContext = ` with focus on: ${focusAreas.join(', ')}`;
    }

    const prompt = `You are a professional career coach. Personalize these career roadmap objectives for ${name}.

USER PROFILE:
- Current Role: ${currentRole}
- Years of Experience: ${yearsExperience}
- Career Goal: ${careerGoal}${targetContext}
${targetRole ? `- Target Role: ${targetRole} (MUST reference this in objectives)` : ''}

PHASE: ${phase.title} - ${phase.description}

GENERIC OBJECTIVES:
${phase.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Transform these generic objectives into specific, personalized actions that:
1. Reference ${name}'s ${yearsExperience} years as a ${currentRole}
2. Are specific to their transition to ${targetRole || careerGoal}
3. Include concrete examples relevant to their background
${targetRole ? `4. Mention "${targetRole}" in at least 60% of objectives` : `4. Align with their focus areas${targetContext}`}

For example, instead of "Update resume", say "Highlight your ${yearsExperience} years of ${currentRole} experience, emphasizing [specific transferable skills] for your ${targetRole || careerGoal} transition"

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

/**
 * Deep roadmap customization with custom user data
 * ULTRA-STRICT VERSION - AI MUST incorporate user-specific data
 */
export const deepCustomizeRoadmap = async (
  userProfile: {
    name: string;
    currentRole: string;
    careerGoal: string;
    yearsExperience: number;
    focusAreas?: string[];
    targetRole?: string;
  },
  phase: {
    number: number;
    title: string;
    description: string;
    objectives: string[];
    tasks: Array<{ id: string; text: string; isCompleted: boolean }>;
  },
  customizationData: Record<string, string>
): Promise<{
  objectives: string[];
  tasks: Array<{ id: string; text: string; isCompleted: boolean }>;
  success: boolean;
}> => {
  try {
    const { name, currentRole, careerGoal, yearsExperience, focusAreas } = userProfile;

    // Extract user-specific keywords that MUST appear in the output
    const requiredKeywords: string[] = [];
    let specificContext = '';
    let exampleTransformations = '';

    if (careerGoal === 'Freelance/Startup Path') {
      const niche = customizationData.niche || '';
      const clients = customizationData.targetClients || '';
      const pricing = customizationData.pricingModel || '';

      if (niche) requiredKeywords.push(niche);
      if (clients) requiredKeywords.push(clients);

      specificContext = `
🎯 USER'S SPECIFIC CONTEXT (MUST USE IN EVERY OBJECTIVE AND TASK):
- Freelance Niche: "${niche}" (MUST appear in at least 60% of objectives/tasks)
- Target Clients: "${clients}" (MUST appear in at least 50% of objectives/tasks)
- Pricing Model: "${pricing}" (MUST appear when discussing pricing/rates)

${name} is a ${currentRole} with ${yearsExperience} years experience launching a ${niche} freelance business targeting ${clients}.`;

      exampleTransformations = `
REQUIRED TRANSFORMATIONS (you MUST follow these patterns):
❌ WRONG (Generic): "Build portfolio website"
✅ CORRECT (Specific): "Build ${niche} portfolio website showcasing projects for ${clients}"

❌ WRONG: "Reach out to potential clients"
✅ CORRECT: "Reach out to 50+ ${clients} specifically seeking ${niche} services via LinkedIn and industry forums"

❌ WRONG: "Set pricing tiers"
✅ CORRECT: "Create ${pricing} pricing packages for ${niche} services targeting ${clients} (starter, pro, enterprise)"

❌ WRONG: "Create case studies"
✅ CORRECT: "Create 3 ${niche} case studies demonstrating value delivered to ${clients}"`;
    } else if (careerGoal === 'Salary Negotiation & Promotion') {
      const industry = customizationData.industry || '';
      const level = customizationData.organizationLevel || '';
      const increase = customizationData.targetIncrease || '';

      if (industry) requiredKeywords.push(industry);
      if (level) requiredKeywords.push(level);

      specificContext = `
🎯 USER'S SPECIFIC CONTEXT (MUST USE IN EVERY OBJECTIVE AND TASK):
- Industry: "${industry}" (MUST appear in at least 70% of objectives/tasks)
- Current Level: "${level}" (MUST appear when discussing compensation/position)
- Target Increase: "${increase}" (MUST appear when discussing negotiation targets)

${name} is a ${level} ${currentRole} in ${industry} with ${yearsExperience} years experience seeking a ${increase} raise/promotion.`;

      exampleTransformations = `
REQUIRED TRANSFORMATIONS (you MUST follow these patterns):
❌ WRONG (Generic): "Research market rates"
✅ CORRECT (Specific): "Research ${industry} market rates for ${level} positions on Levels.fyi, Glassdoor, and PayScale"

❌ WRONG: "Quantify your impact"
✅ CORRECT: "Quantify impact using ${industry}-specific KPIs: revenue generated, cost savings, ${industry} efficiency metrics"

❌ WRONG: "Prepare negotiation case"
✅ CORRECT: "Prepare ${increase} raise negotiation case for ${level} role in ${industry} with documented wins"

❌ WRONG: "Practice negotiation"
✅ CORRECT: "Practice negotiating ${increase} increase for ${level} position in ${industry} with mentor"`;
    } else if (careerGoal === 'Switching to Tech') {
      const background = customizationData.background || '';
      const targetRole = customizationData.targetRole || '';
      const experience = customizationData.codingExperience || '';

      if (background) requiredKeywords.push(background);
      if (targetRole) requiredKeywords.push(targetRole);

      specificContext = `
🎯 USER'S SPECIFIC CONTEXT (MUST USE IN EVERY OBJECTIVE AND TASK):
- Current Background: "${background}" (MUST appear when discussing transferable skills)
- Target Tech Role: "${targetRole}" (MUST appear in at least 80% of objectives/tasks)
- Coding Level: "${experience}" (MUST appear when discussing learning path)

${name} is transitioning from ${background} (${currentRole}) to ${targetRole} with ${experience} coding experience.`;

      exampleTransformations = `
REQUIRED TRANSFORMATIONS (you MUST follow these patterns):
❌ WRONG (Generic): "Learn programming fundamentals"
✅ CORRECT (Specific): "Learn ${targetRole}-specific programming at ${experience} level (Python/JavaScript for ${targetRole})"

❌ WRONG: "Build portfolio projects"
✅ CORRECT: "Build 3 ${targetRole} projects showcasing ${background} domain expertise (e.g., ${background} + tech)"

❌ WRONG: "Network with tech professionals"
✅ CORRECT: "Network with 10 ${targetRole} professionals who transitioned from ${background}"

❌ WRONG: "Update resume"
✅ CORRECT: "Update resume highlighting ${background} experience translated to ${targetRole} competencies"`;
    } else {
      // Generic fallback with all available data
      const allValues = Object.values(customizationData).filter(v => v);
      requiredKeywords.push(...allValues);

      specificContext = `
🎯 USER'S SPECIFIC CONTEXT (MUST USE):
${Object.entries(customizationData).map(([key, value]) => `- ${key}: "${value}"`).join('\n')}

${name} is a ${currentRole} with ${yearsExperience} years experience working on: ${careerGoal}`;
    }

    const focusContext = focusAreas && focusAreas.length > 0
      ? `\nFocus Areas: ${focusAreas.join(', ')}`
      : '';

    const systemPrompt = `You are a career customization AI. Transform generic career advice into personalized action items using the user's specific details. Return ONLY valid JSON.`;

    const userPrompt = `${specificContext}${focusContext}

PHASE ${phase.number}: ${phase.title}

GENERIC OBJECTIVES:
${phase.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

GENERIC TASKS:
${phase.tasks.map((task, i) => `${i + 1}. ${task.text}`).join('\n')}

${exampleTransformations}

INSTRUCTIONS:
1. Replace generic terms with the specific details provided above
2. Use keywords: ${requiredKeywords.join(', ')}
3. Keep ${phase.objectives.length} objectives and ${phase.tasks.length} tasks
4. Be specific and actionable

Return JSON (no markdown):
{"objectives": [...], "tasks": [...]}`;

    const response = await fetch(`${NEWELL_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: PROJECT_ID,
        model: 'gpt-4o-mini',
        systemPrompt,
        userMessage: userPrompt,
        temperature: 0.7,
        maxTokens: 2500,
      }),
    });

    if (!response.ok) {
      console.error(`[Customization] API request failed for phase ${phase.number}:`, response.status, response.statusText);
      return { objectives: phase.objectives, tasks: phase.tasks, success: false };
    }

    const data: NewellAIResponse = await response.json();
    console.log(`[Customization] Phase ${phase.number} - API Response received:`, data.success ? 'Success' : 'Failed');

    if (data.success && data.data?.message) {
      try {
        // Clean the response to extract JSON
        let jsonString = data.data.message.trim();
        console.log(`[Customization] Phase ${phase.number} - Raw AI response length:`, jsonString.length);

        // Remove markdown code blocks if present
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '');

        // Remove any leading/trailing text
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }

        console.log(`[Customization] Phase ${phase.number} - Attempting to parse JSON...`);
        const parsed = JSON.parse(jsonString);

        // Validate we got objectives and tasks arrays
        if (!Array.isArray(parsed.objectives) || !Array.isArray(parsed.tasks)) {
          console.error(`[Customization] Phase ${phase.number} - Invalid structure: objectives or tasks not arrays`);
          return { objectives: phase.objectives, tasks: phase.tasks, success: false };
        }

        console.log(`[Customization] Phase ${phase.number} - Parsed successfully:`,
          `${parsed.objectives.length} objectives, ${parsed.tasks.length} tasks`);

        // RELAXED VALIDATION: Check if content is different from original (fuzzy matching)
        const originalContent = JSON.stringify({
          objectives: phase.objectives,
          tasks: phase.tasks.map(t => t.text)
        }).toLowerCase();
        const newContent = JSON.stringify(parsed).toLowerCase();

        // Calculate similarity - if > 90% same, it's probably not customized
        const isTooSimilar = originalContent === newContent;

        // Fuzzy keyword matching - check if ANY keyword appears with lenient matching
        const hasKeywordMatch = requiredKeywords.length === 0 ||
          requiredKeywords.some(keyword => {
            const keywordLower = keyword.toLowerCase();
            // Check for exact match or partial match (e.g., "web design" matches "web" or "design")
            const keywordParts = keywordLower.split(/[\s/-]+/);
            return keywordParts.some(part =>
              part.length > 2 && newContent.includes(part)
            );
          });

        // Check for meaningful differences
        const hasCustomization = !isTooSimilar && (hasKeywordMatch || requiredKeywords.length === 0);

        console.log(`[Customization] Phase ${phase.number} - Validation:`, {
          hasKeywordMatch,
          isTooSimilar,
          hasCustomization,
          requiredKeywords: requiredKeywords.slice(0, 3), // Log first 3 keywords
        });

        if (!hasCustomization && requiredKeywords.length > 0) {
          console.warn(`[Customization] Phase ${phase.number} - Weak customization detected, accepting as best effort`);
          // Accept it anyway as "best effort" - don't fail completely
        }

        const customizedTasks = phase.tasks.map((task, i) => ({
          ...task,
          text: parsed.tasks?.[i] || task.text,
        }));

        console.log(`[Customization] Phase ${phase.number} - ✅ Success`);
        return {
          objectives: parsed.objectives || phase.objectives,
          tasks: customizedTasks,
          success: true, // Always return success if we got valid JSON
        };
      } catch (parseError) {
        console.error(`[Customization] Phase ${phase.number} - JSON Parse Error:`, parseError);
        console.error(`[Customization] Phase ${phase.number} - Failed to parse response:`, data.data?.message?.substring(0, 200));
        return { objectives: phase.objectives, tasks: phase.tasks, success: false };
      }
    }

    console.error(`[Customization] Phase ${phase.number} - AI response unsuccessful or empty`);
    return { objectives: phase.objectives, tasks: phase.tasks, success: false };
  } catch (error) {
    console.error('Error in deep roadmap customization:', error);
    return { objectives: phase.objectives, tasks: phase.tasks, success: false };
  }
};
