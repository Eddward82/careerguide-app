import { CareerGoal } from '@/types';

export interface FocusAreaOption {
  id: string;
  label: string;
  icon: string;
}

/**
 * Get focus area options based on selected career goal
 */
export function getFocusAreasForGoal(goal: CareerGoal): FocusAreaOption[] {
  switch (goal) {
    case 'Switching to Tech':
      return [
        { id: 'frontend', label: 'Frontend Development', icon: 'phone-portrait' },
        { id: 'backend', label: 'Backend Development', icon: 'server' },
        { id: 'fullstack', label: 'Full Stack', icon: 'layers' },
        { id: 'datascience', label: 'Data Science / ML', icon: 'analytics' },
        { id: 'devops', label: 'DevOps / Cloud', icon: 'cloud' },
        { id: 'mobile', label: 'Mobile Development', icon: 'phone-portrait' },
      ];

    case 'Moving to Management':
      return [
        { id: 'people', label: 'People Management', icon: 'people' },
        { id: 'project', label: 'Project Management', icon: 'file-tray-full' },
        { id: 'product', label: 'Product Management', icon: 'cube' },
        { id: 'strategy', label: 'Strategic Planning', icon: 'telescope' },
        { id: 'budgeting', label: 'Budgeting & Finance', icon: 'cash' },
        { id: 'stakeholder', label: 'Stakeholder Management', icon: 'handshake' },
      ];

    case 'Resume Refresh':
      return [
        { id: 'writing', label: 'Resume Writing', icon: 'document-text' },
        { id: 'linkedin', label: 'LinkedIn Optimization', icon: 'logo-linkedin' },
        { id: 'portfolio', label: 'Portfolio Building', icon: 'briefcase' },
        { id: 'interviewing', label: 'Interview Prep', icon: 'chatbubbles' },
        { id: 'networking', label: 'Networking Strategy', icon: 'people-circle' },
        { id: 'branding', label: 'Personal Branding', icon: 'sparkles' },
      ];

    case 'Career Pivot':
      return [
        { id: 'industry', label: 'Industry Research', icon: 'search' },
        { id: 'skills', label: 'Skill Gap Analysis', icon: 'stats-chart' },
        { id: 'networking', label: 'Networking', icon: 'people' },
        { id: 'portfolio', label: 'Portfolio Projects', icon: 'folder-open' },
        { id: 'storytelling', label: 'Career Storytelling', icon: 'book' },
        { id: 'mentorship', label: 'Finding Mentors', icon: 'person' },
      ];

    case 'Skill Development':
      return [
        { id: 'technical', label: 'Technical Skills', icon: 'code-slash' },
        { id: 'leadership', label: 'Leadership Skills', icon: 'trophy' },
        { id: 'communication', label: 'Communication', icon: 'megaphone' },
        { id: 'certifications', label: 'Certifications', icon: 'medal' },
        { id: 'softskills', label: 'Soft Skills', icon: 'heart' },
        { id: 'domain', label: 'Domain Expertise', icon: 'school' },
      ];

    case 'Freelance/Startup Path':
      return [
        { id: 'clientacquisition', label: 'Client Acquisition', icon: 'people' },
        { id: 'portfoliobuilding', label: 'Portfolio Building', icon: 'briefcase' },
        { id: 'pricingcontracts', label: 'Pricing & Contracts', icon: 'document-text' },
        { id: 'branding', label: 'Branding', icon: 'sparkles' },
        { id: 'nicheselection', label: 'Niche Selection', icon: 'compass' },
        { id: 'productmarketfit', label: 'Product-Market Fit', icon: 'analytics' },
      ];

    case 'Salary Negotiation & Promotion':
      return [
        { id: 'quantifyingimpact', label: 'Quantifying Impact', icon: 'trending-up' },
        { id: 'marketvalue', label: 'Market Value Analysis', icon: 'stats-chart' },
        { id: 'executivepresence', label: 'Executive Presence', icon: 'star' },
        { id: 'performancereviews', label: 'Performance Reviews', icon: 'clipboard' },
        { id: 'benefitnegotiation', label: 'Benefit Negotiation', icon: 'cash' },
        { id: 'internalnetworking', label: 'Internal Networking', icon: 'git-network' },
      ];

    default:
      return [
        { id: 'general1', label: 'Professional Growth', icon: 'trending-up' },
        { id: 'general2', label: 'Skill Building', icon: 'build' },
        { id: 'general3', label: 'Networking', icon: 'people' },
        { id: 'general4', label: 'Career Strategy', icon: 'map' },
        { id: 'general5', label: 'Personal Branding', icon: 'sparkles' },
        { id: 'general6', label: 'Interview Prep', icon: 'chatbubbles' },
      ];
  }
}

/**
 * Get icon for career goal (for roadmap visualization)
 */
export function getIconForGoal(goal: CareerGoal): string {
  switch (goal) {
    case 'Switching to Tech':
      return 'code-slash';
    case 'Moving to Management':
      return 'briefcase';
    case 'Resume Refresh':
      return 'document-text';
    case 'Career Pivot':
      return 'git-branch';
    case 'Skill Development':
      return 'school';
    case 'Freelance/Startup Path':
      return 'rocket';
    case 'Salary Negotiation & Promotion':
      return 'trending-up';
    default:
      return 'briefcase';
  }
}
