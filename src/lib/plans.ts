import config from './config.json';

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  apiLimit: number;
  storageLimit: number; // in MB
  bandwidthLimit: number; // in GB
  description: string;
  popular?: boolean;
  color: string;
  gradient: string;
}

export const PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: config.plans.FREE,
    duration: 30,
    features: [
      '20 API calls per day',
      'Basic endpoints access',
      'Community support',
      'Rate limited'
    ],
    apiLimit: 20,
    storageLimit: 100,
    bandwidthLimit: 1,
    description: 'Perfect for trying out our API',
    color: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-700'
  },
  {
    id: 'CHEAP',
    name: 'Cheap',
    price: config.plans.CHEAP,
    duration: 30,
    features: [
      '1,000 API calls per day',
      'All endpoints access',
      'Email support',
      'Basic analytics',
      '99.9% uptime SLA'
    ],
    apiLimit: 1000,
    storageLimit: 500,
    bandwidthLimit: 5,
    description: 'Great for small projects and startups',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-700',
    popular: true
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: config.plans.PREMIUM,
    duration: 30,
    features: [
      '2,500 API calls per day',
      'All endpoints access',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      '99.95% uptime SLA'
    ],
    apiLimit: 2500,
    storageLimit: 2000,
    bandwidthLimit: 20,
    description: 'Perfect for growing businesses',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-700'
  },
  {
    id: 'VIP',
    name: 'VIP',
    price: config.plans.VIP,
    duration: 30,
    features: [
      '5,000 API calls per day',
      'All endpoints access',
      '24/7 phone support',
      'Real-time analytics',
      'Custom integrations',
      'White-label options',
      '99.99% uptime SLA'
    ],
    apiLimit: 5000,
    storageLimit: 5000,
    bandwidthLimit: 50,
    description: 'Ideal for established businesses',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-amber-700'
  },
  {
    id: 'VVIP',
    name: 'VVIP',
    price: config.plans.VVIP,
    duration: 30,
    features: [
      '10,000 API calls per day',
      'All endpoints access',
      'Dedicated support',
      'Real-time analytics',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
      'On-premise deployment option'
    ],
    apiLimit: 10000,
    storageLimit: 10000,
    bandwidthLimit: 100,
    description: 'For large-scale operations',
    color: 'text-red-600',
    gradient: 'from-red-500 to-red-700'
  },
  {
    id: 'SUPREME',
    name: 'Supreme',
    price: config.plans.SUPREME,
    duration: 30,
    features: [
      '20,000 API calls per day',
      'All endpoints access',
      'Dedicated support',
      'Real-time analytics',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
      'On-premise deployment option',
      'Unlimited storage'
    ],
    apiLimit: 20000,
    storageLimit: 20000,
    bandwidthLimit: 200,
    description: 'Ultimate plan for enterprise needs',
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-700'
  }
];

export const getPlanById = (id: string): PlanConfig | undefined => {
  return PLANS.find(plan => plan.id === id);
};

export const getPlanLimits = (planId: string): { apiLimit: number; storageLimit: number; bandwidthLimit: number } => {
  const plan = getPlanById(planId);
  if (!plan) {
    return { apiLimit: 20, storageLimit: 100, bandwidthLimit: 1 };
  }
  return {
    apiLimit: plan.apiLimit,
    storageLimit: plan.storageLimit,
    bandwidthLimit: plan.bandwidthLimit
  };
};

export const calculateUsagePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(config.currency.locale, {
    style: 'currency',
    currency: config.currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};