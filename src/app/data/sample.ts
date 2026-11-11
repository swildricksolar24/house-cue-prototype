/**
 * Shared placeholder data for the prototype, taken from the Figma screens (Phoenix/Tucson addresses, invented
 * sample pros — not real Arizona companies). Screen-specific data lives in the screen file; put things here only
 * when several screens show the same record.
 */

export const homeowner = {
  firstName: 'Jordan',
  lastName: 'Rivera',
  email: 'jordan@example.com',
  plan: 'Member' as 'Member' | 'Free',
};

export type Home = { id: string; address: string; city: string; label: string; role: 'owner' | 'landlord' | 'tenant' };

export const homes: Home[] = [
  { id: 'palm', address: '2218 W Palm Ln', city: 'Phoenix', label: 'Member home', role: 'owner' },
  { id: 'cactus', address: '4410 E Cactus Rd', city: 'Phoenix', label: 'Rental', role: 'landlord' },
  { id: 'speedway', address: '815 E Speedway Blvd', city: 'Tucson', label: 'Rental', role: 'landlord' },
];

export const currentHome = homes[0];

export type HomeSystem = { id: string; name: string; model: string; age: string };

export const systems: HomeSystem[] = [
  { id: 'ac', name: 'AC / heat pump', model: 'Trane XR14', age: '14 years' },
  { id: 'water-heater', name: 'Water heater', model: 'Rheem', age: '6 years' },
  { id: 'pool-pump', name: 'Pool pump', model: 'Pentair', age: '3 years' },
];

export type MaintenanceTask = { id: string; title: string; system: string; due: string; kind: 'DIY' | 'Pro' };

export const dueSoon: MaintenanceTask[] = [
  { id: 'hvac-filter', title: 'Replace HVAC filter', system: 'AC / heat pump', due: 'Nov 28', kind: 'DIY' },
  { id: 'pool-basket', title: 'Clean pool pump basket', system: 'Pool pump', due: 'Nov 30', kind: 'DIY' },
  { id: 'flush-wh', title: 'Flush water heater', system: 'Water heater', due: 'Dec 3', kind: 'Pro' },
];

export const setupChecklist = [
  { id: 'systems', label: 'Add systems and appliances', meta: 'Done', done: true },
  { id: 'agent-prefs', label: 'Set agent preferences', meta: '3 min', done: false },
  { id: 'calendar', label: 'Connect your calendar', meta: '2 min', done: false },
  { id: 'email', label: 'Import receipts from email', meta: '2 min', done: false },
  { id: 'rooms', label: 'Add rooms and materials', meta: '5 min', done: false },
  { id: 'documents', label: 'Upload documents', meta: 'Done', done: true },
  { id: 'devices', label: 'Connect devices', meta: '2 min', done: false },
  { id: 'household', label: 'Invite household', meta: '1 min', done: false },
  { id: 'payment', label: 'Add a payment method', meta: 'Done', done: true },
];

export const agent = {
  name: 'HouseCue agent',
  spendCap: 300,
  spentThisMonth: 0,
};

export type Vendor = {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  trust: number;
  inNetwork: boolean;
  nearbyJobs: number;
};

/** Invented sample pros (noted in Figma note cards, never real companies) */
export const vendors: Vendor[] = [
  { id: 'desert-air', name: 'Desert Air Comfort', trade: 'HVAC', rating: 4.9, reviews: 128, trust: 92, inNetwork: true, nearbyJobs: 6 },
  { id: 'saguaro', name: 'Saguaro Heating & Cooling', trade: 'HVAC', rating: 4.7, reviews: 86, trust: 88, inNetwork: true, nearbyJobs: 3 },
  { id: 'copper-state', name: 'Copper State Mechanical', trade: 'HVAC', rating: 4.6, reviews: 41, trust: 81, inNetwork: true, nearbyJobs: 2 },
  { id: 'valley-cool', name: 'Valley Cool Pros', trade: 'HVAC', rating: 4.4, reviews: 19, trust: 0, inNetwork: false, nearbyJobs: 1 },
];

export const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
