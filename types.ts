
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface PresetPrompt {
  title: string;
  prompt: string;
}

export const PRESET_PROMPTS: PresetPrompt[] = [
  { title: 'Royal Decree', prompt: 'Draft a royal decree for a fictional kingdom about a grand celebration.' },
  { title: 'Quantum Physics', prompt: 'Explain quantum entanglement in 2 sentences for a layman.' },
  { title: 'React Expert', prompt: 'Optimize this React component for maximum performance and reusability.' },
  { title: 'Royal History', prompt: 'Tell me about the history and significance of the color Royal Blue.' },
  { title: 'SQL Optimizer', prompt: 'Show me how to optimize a SQL query that uses multiple joins and subqueries.' },
  { title: 'Python Scraper', prompt: 'Write a Python script using BeautifulSoup to extract news headlines from a website.' },
  { title: 'Docker Basics', prompt: 'Explain the difference between a Docker Image and a Container using a metaphor.' },
  { title: 'Blog Architect', prompt: 'Draft a 500-word blog post outline about the ethical implications of AGI.' },
  { title: 'Email Refiner', prompt: 'Rewrite this casual email to a client to sound more professional and authoritative.' },
  { title: 'Keto Planner', prompt: 'Create a 7-day keto-friendly meal plan with a focus on high-protein options.' },
  { title: 'Mars Odyssey', prompt: 'Write the opening paragraph of a hard sci-fi novel set in a colony on Mars.' },
  { title: 'Project Lead', prompt: 'Create a project timeline for launching a mobile app in exactly 12 weeks.' },
  { title: 'Interview Prep', prompt: 'Generate 10 challenging interview questions for a Senior Product Manager role.' },
  { title: 'Coffee Naming', prompt: 'Suggest 5 creative names for a new high-end boutique coffee shop in London.' },
  { title: 'Tokyo Guide', prompt: 'Plan a 3-day cultural itinerary for a first-time visitor to Tokyo.' },
  { title: 'Black Hole Theory', prompt: 'Explain what happens at the event horizon of a black hole.' },
  { title: 'Math Solver', prompt: 'Show the step-by-step solution for the quadratic equation: x^2 + 5x + 6 = 0.' },
  { title: 'Marketing Script', prompt: 'Write a 30-second radio ad script for a luxury watch brand.' },
  { title: 'Code Refactor', prompt: 'Refactor a standard JavaScript for-loop into a more modern functional approach.' },
  { title: 'History Lesson', prompt: 'Summarize the primary causes of the French Revolution in three bullet points.' },
  { title: 'AI vs ML', prompt: 'Explain the relationship between AI, Machine Learning, and Deep Learning.' },
  { title: 'Time Master', prompt: 'Give me 5 actionable tips for using the Pomodoro technique effectively at work.' },
  { title: 'Unit Tester', prompt: 'Write a Jest unit test for a function that validates a user password.' },
  { title: 'Cover Letter', prompt: 'Draft a compelling cover letter for a creative director position at a tech firm.' },
  { title: 'Cocktail Craft', prompt: 'Give me a recipe for a "Royal Blue" themed cocktail using gin and violet liqueur.' },
  { title: 'Poetry Corner', prompt: 'Compose a short poem about the silence of a snowy winter forest.' },
  { title: 'Bug Hunter', prompt: 'Identify common pitfalls in JavaScript that lead to memory leaks in browsers.' },
  { title: 'Team Sync', prompt: 'Draft a meeting agenda for a cross-functional team sync on quarterly goals.' },
  { title: 'Language Tutor', prompt: 'Translate the phrase "Intelligence is the ultimate power" into 5 different languages.' },
  { title: 'Review Drafter', prompt: 'Write a constructive performance review for a developer who is technically strong but needs better communication.' }
];

export const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast and responsive' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Advanced reasoning' },
];

export const VOICE_NAMES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'] as const;
export type VoiceName = (typeof VOICE_NAMES)[number];
