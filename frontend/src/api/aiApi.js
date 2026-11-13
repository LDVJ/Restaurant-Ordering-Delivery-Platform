/**
 * AI Insights API Module
 * Sourced from API_CONTRACT.md Customer AI insights section.
 */

import axiosClient from './axiosClient';

/**
 * Ask a question to the AI assistant
 * Endpoint: POST /ai/insights
 * Body: { question: string }
 * Default fallback: "summarise my last five orders"
 */
export async function askAi(question = '') {
  const query = question && question.trim() ? question.trim() : 'summarise my last five orders';
  const response = await axiosClient.post('/ai/insights', { question: query });
  return response.data;
}
