
export interface CompanyPriority {
  topic: string;
  weight: number;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  priorityTopics: CompanyPriority[];
}

export const COMPANIES: Company[] = [
  {
    id: 'google',
    name: 'Google',
    description: 'Focuses heavily on algorithmic complexity, graph theory, and dynamic programming.',
    logo: 'https://placehold.co/100x100?text=G',
    color: 'from-blue-500 via-red-500 to-yellow-500',
    priorityTopics: [
      { topic: 'Graphs', weight: 0.95 },
      { topic: 'Dynamic Programming', weight: 0.9 },
      { topic: 'Arrays', weight: 0.7 },
      { topic: 'Trees', weight: 0.85 }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Emphasizes scalability, data structure efficiency, and customer-centric problem solving.',
    logo: 'https://placehold.co/100x100?text=A',
    color: 'from-orange-400 to-orange-600',
    priorityTopics: [
      { topic: 'Arrays', weight: 0.9 },
      { topic: 'Strings', weight: 0.85 },
      { topic: 'Searching', weight: 0.8 },
      { topic: 'Graphs', weight: 0.75 }
    ]
  },
  {
    id: 'meta',
    name: 'Meta',
    description: 'Prioritizes rapid problem solving in systems architecture and product-focused DSA.',
    logo: 'https://placehold.co/100x100?text=M',
    color: 'from-blue-600 to-indigo-700',
    priorityTopics: [
      { topic: 'Arrays', weight: 0.95 },
      { topic: 'Strings', weight: 0.9 },
      { topic: 'Sorting', weight: 0.7 },
      { topic: 'Trees', weight: 0.8 }
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    description: 'Tests clean coding practices, efficient data manipulation, and systems logic.',
    logo: 'https://placehold.co/100x100?text=MS',
    color: 'from-blue-400 to-emerald-500',
    priorityTopics: [
      { topic: 'Trees', weight: 0.9 },
      { topic: 'Strings', weight: 0.8 },
      { topic: 'Searching', weight: 0.85 },
      { topic: 'Arrays', weight: 0.75 }
    ]
  }
];
