import type { IconName } from '../../components/Icon/Icon';
import { stepPath } from './journeys';

/** The people HouseCue is designed for (Figma cover page and journey pages J1–J4). */
export type UserType = {
  id: string;
  name: string;
  icon: IconName;
  summary: string;
  /** Sub-roles or plan differences worth knowing */
  includes?: string;
  /** Where this user's prototype starts, when built */
  start?: string;
  /** Figma journey page for the user */
  figma: { label: string; node: string };
  surfaces: string;
};

export const userTypes: UserType[] = [
  {
    id: 'homeowner',
    name: 'Homeowner',
    icon: 'home',
    summary: 'Keeps the home record, plans upkeep, and gets quotes and books pros through the AI agent, always with their OK.',
    includes: 'Household members and caregivers share access with permissions the owner sets. Free and Member plans.',
    start: stepPath('homeowner', 'onboarding', 1),
    figma: { label: 'J1 Homeowner Journey', node: '213:2' },
    surfaces: 'Mobile app + web',
  },
  {
    id: 'landlord',
    name: 'Landlord',
    icon: 'dashboard',
    summary: 'Runs a portfolio of rentals: property rules, tenant invites, approval queue, billing and move-out turnover.',
    includes: 'Portfolio managers can run properties on the landlord’s behalf.',
    start: stepPath('homeowner', 'landlord-portfolio', 1),
    figma: { label: 'J1 · Landlord portfolio', node: '213:2' },
    surfaces: 'Mobile app + web',
  },
  {
    id: 'tenant',
    name: 'Tenant',
    icon: 'users',
    summary: 'Reports issues, sets access windows for pros and confirms finished work. Costs stay hidden unless the landlord shows them.',
    start: stepPath('homeowner', 'tenant', 1),
    figma: { label: 'J1 · Tenant', node: '213:2' },
    surfaces: 'Mobile app + web',
  },
  {
    id: 'vendor',
    name: 'Vendor (pro)',
    icon: 'service',
    summary: 'Gets job requests, sends quotes, runs jobs and gets paid. Pro members also see how their quote stands.',
    includes: 'Free and Pro plans.',
    figma: { label: 'J2 Vendor Journey', node: '213:3' },
    surfaces: 'Mobile app + web',
  },
  {
    id: 'support',
    name: 'Support agent',
    icon: 'help',
    summary: 'HouseCue staff working the support console: queue, conversations, people, jobs, disputes, money and the AI agent.',
    figma: { label: 'J3 Support Journey', node: '213:4' },
    surfaces: 'Web console',
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: 'shield',
    summary: 'Runs the platform: settings, vendors, money, disputes, the AI agent’s rules and the safety kill switches.',
    includes: 'Role templates, including the portfolio manager role.',
    figma: { label: 'J4 Admin Journey', node: '213:5' },
    surfaces: 'Web console',
  },
];
