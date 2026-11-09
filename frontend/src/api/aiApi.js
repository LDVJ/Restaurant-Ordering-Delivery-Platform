/**
 * AI Insights API Module
 * Sourced from API_CONTRACT.md Customer AI insights section.
 * Automatically delegates to mock layer when 'ai' is in VITE_MOCK_GROUPS.
 */

import axiosClient from './axiosClient';
import { mockAi } from '../mocks/mockAi';

const mockGroups = (import.meta.env.VITE_MOCK_GROUPS || '')
  .split(',')
  .map((g) => g.trim().toLowerCase());

export function isMocked(group) {
  return mockGroups.includes(group.toLowerCase());
}

const USE_MOCK_AI = isMocked('ai');

/**
 * Ask a question to the AI assistant
 * Body: { question: string }
 * Empty question means "Summarize my last five orders".
 */
export async function askAi(question = '') {
  if (USE_MOCK_AI) {
    return mockAi.askAi(question);
  }
  const response = await axiosClient.post('/ai/insights', { question });
  return response.data;
}
