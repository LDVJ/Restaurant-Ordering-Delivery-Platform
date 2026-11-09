/**
 * Mock AI Module
 * MOCK-ONLY CODE: Simulates CampusBite AI Insights assistant with ~800ms delay,
 * dynamic answers generated from the user's mock orders, and keyword-based error simulation.
 */

import { mockDb } from './mockDb';
import { formatCurrency, formatOrderNumber, formatDateTime } from '../utils/format';

const SIMULATED_AI_DELAY_MS = 800;

function sleep(ms = SIMULATED_AI_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createAxiosError(status, detail) {
  const error = new Error(detail);
  error.response = {
    status,
    data: { detail },
  };
  return error;
}

export const mockAi = {
  async askAi(question = '') {
    await sleep();

    const q = (question || '').trim().toLowerCase();

    // 1. Error simulation triggers for testing resilience
    if (q.includes('ratelimit')) {
      throw createAxiosError(429, 'Too many requests. Please wait a minute and try again.');
    }
    if (q.includes('unavailable')) {
      throw createAxiosError(503, 'The AI assistant is not available right now.');
    }
    if (q.includes('timeout')) {
      throw createAxiosError(504, 'The AI assistant took too long. Please try again.');
    }

    const orders = mockDb.getRawOrders() || [];

    // 2. Query 1: Empty question or "summarize" -> Summarize last 5 orders
    if (!q || q.includes('summarize') || q.includes('last five') || q.includes('last 5')) {
      const lastFive = orders.slice(0, 5);

      if (lastFive.length === 0) {
        return {
          answer: "You haven't placed any orders yet on CampusBite. Once you place orders, I can summarize your activity and spending!",
        };
      }

      let totalSpend = 0;
      const orderLines = lastFive.map((order, idx) => {
        totalSpend += Number(order.bill_amount) || 0;
        const itemsText = order.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ');
        return `${idx + 1}. ${formatOrderNumber(order.id)} (${order.restaurant?.name || 'Kitchen'}) • ${formatCurrency(order.bill_amount)}\n   Items: ${itemsText}\n   Status: ${order.status} (${formatDateTime(order.created_at)})`;
      });

      return {
        answer: `Here is a summary of your last ${lastFive.length} order(s):\n\n${orderLines.join('\n\n')}\n\nTotal spend on these orders: ${formatCurrency(totalSpend)}.`,
      };
    }

    // 3. Query 2: Active / undelivered orders
    if (q.includes('not delivered') || q.includes('undelivered') || q.includes('active') || q.includes('progress')) {
      const activeOrders = orders.filter(
        (o) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)
      );

      if (activeOrders.length === 0) {
        return {
          answer: 'All your orders have reached a final status (delivered, cancelled, or refunded). You currently have no active orders in progress!',
        };
      }

      const activeLines = activeOrders.map((o) => {
        const items = o.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ');
        return `• ${formatOrderNumber(o.id)} from ${o.restaurant?.name} — Status: ${o.status}\n  Items: ${items}`;
      });

      return {
        answer: `You have ${activeOrders.length} order(s) currently active:\n\n${activeLines.join('\n\n')}\n\nYou can track real-time progress from your My Orders dashboard.`,
      };
    }

    // 4. Query 3: Spending this week
    if (q.includes('spend') || q.includes('spent') || q.includes('cost') || q.includes('money')) {
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      const weekOrders = orders.filter(
        (o) => new Date(o.created_at).getTime() >= sevenDaysAgo && o.status !== 'CANCELLED'
      );

      const targetOrders = weekOrders.length > 0 ? weekOrders : orders.filter((o) => o.status !== 'CANCELLED');
      const totalAmount = targetOrders.reduce((sum, o) => sum + (Number(o.bill_amount) || 0), 0);

      const highestOrder = [...targetOrders].sort(
        (a, b) => Number(b.bill_amount) - Number(a.bill_amount)
      )[0];

      return {
        answer: `Over the past 7 days, you placed ${targetOrders.length} order(s) totaling ${formatCurrency(totalAmount)} across campus eateries.\n\nYour largest single order was ${formatOrderNumber(highestOrder?.id)} at ${highestOrder?.restaurant?.name || 'Campus Kitchen'} for ${formatCurrency(highestOrder?.bill_amount || 0)}.`,
      };
    }

    // 5. Query 4: Most ordered dishes
    if (q.includes('most') || q.includes('favorite') || q.includes('favourite') || q.includes('dish') || q.includes('item')) {
      const itemCounts = {};

      orders.forEach((order) => {
        if (order.status !== 'CANCELLED') {
          order.items?.forEach((item) => {
            const name = item.item_name;
            itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
          });
        }
      });

      const sortedItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      if (sortedItems.length === 0) {
        return {
          answer: "You haven't ordered any items yet! Once you start ordering, I will keep track of your top dishes.",
        };
      }

      const leaderboard = sortedItems.map(
        ([name, count], index) => `${index + 1}. ${name} — ordered ${count} time${count > 1 ? 's' : ''}`
      );

      return {
        answer: `Here are your most frequently ordered dishes:\n\n${leaderboard.join('\n')}\n\nLooks like ${sortedItems[0][0]} is your top campus favorite!`,
      };
    }

    // 6. Generic query fallback
    return {
      answer: `Based on your CampusBite order history (${orders.length} total orders):\n\nYou regularly order from popular campus kitchens including Spice Hub and Campus Biryani. If you want specific details, try asking:\n• "Summarize my last five orders"\n• "Which of my orders are still not delivered?"\n• "How much did I spend this week?"\n• "Which food items have I ordered most?"`,
    };
  },
};
