/**
 * Mock Owner Data
 * Sourced from API_CONTRACT.md Owner Endpoints.
 * 17 orders covering all statuses, return scenarios, 3 delivery partners, and seeded reminders.
 */

export const MOCK_DELIVERY_PARTNERS = [
  { id: 'dp_ramesh', name: 'Ramesh Kumar', phone: '+919876501234' },
  { id: 'dp_priya', name: 'Priya Sharma', phone: '+919876505678' },
  { id: 'dp_vikram', name: 'Vikram Singh', phone: '+919876509012' },
];

const now = Date.now();
const minutesAgo = (m) => new Date(now - m * 60 * 1000).toISOString();
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

function createOrder({
  id, status, payment_status = 'MOCK_PAID', bill_amount, created_mins, updated_mins = created_mins,
  customer_name, customer_phone = '+919876543210', items, partner = null, return_request = null, review = null,
}) {
  return {
    id, status, payment_status, bill_amount,
    created_at: typeof created_mins === 'number' ? minutesAgo(created_mins) : created_mins,
    status_updated_at: typeof updated_mins === 'number' ? minutesAgo(updated_mins) : updated_mins,
    delivered_at: status === 'DELIVERED' || status === 'REFUNDED' ? minutesAgo(updated_mins || 60) : null,
    delivery_address: 'Room 302, Hostel B, North Campus', contact_phone: customer_phone,
    restaurant: { id: 'res_spice', name: 'Spice Hub', address: '5 Market Street, Ghaziabad', phone: '+919123456780' },
    items, customer: { name: customer_name, phone: customer_phone }, customer_name,
    delivery_partner: partner, review, return_request,
    return_status: return_request?.status || null, has_review: Boolean(review),
  };
}

export const INITIAL_OWNER_ORDERS = [
  // 1. PLACED (>15m delayed, has reminder)
  createOrder({
    id: 'cb_own_01', status: 'PLACED', bill_amount: '498.00', created_mins: 25, updated_mins: 25,
    customer_name: 'Asha Verma', customer_phone: '+919876543210',
    items: [{ id: 'oi_1', menu_item_id: 'mi_1', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 }],
  }),
  // 2. PLACED (fresh)
  createOrder({
    id: 'cb_own_02', status: 'PLACED', bill_amount: '220.00', created_mins: 5, updated_mins: 5,
    customer_name: 'Rahul Sen', customer_phone: '+919876543211',
    items: [{ id: 'oi_2', menu_item_id: 'mi_2', item_name: 'Dal Makhani', unit_price: '180.00', quantity: 1 }, { id: 'oi_3', menu_item_id: 'mi_3', item_name: 'Butter Roti', unit_price: '20.00', quantity: 2 }],
  }),
  // 3. ACCEPTED (>15m delayed in accepted, has reminder)
  createOrder({
    id: 'cb_own_03', status: 'ACCEPTED', bill_amount: '350.00', created_mins: 35, updated_mins: 22,
    customer_name: 'Pooja Nair', customer_phone: '+919876543212',
    items: [{ id: 'oi_4', menu_item_id: 'mi_4', item_name: 'Veg Biryani', unit_price: '250.00', quantity: 1 }, { id: 'oi_5', menu_item_id: 'mi_5', item_name: 'Gulab Jamun', unit_price: '50.00', quantity: 2 }],
  }),
  // 4. ACCEPTED (fresh)
  createOrder({
    id: 'cb_own_04', status: 'ACCEPTED', bill_amount: '180.00', created_mins: 10, updated_mins: 8,
    customer_name: 'Vikram Malhotra', customer_phone: '+919876543213',
    items: [{ id: 'oi_6', menu_item_id: 'mi_2', item_name: 'Dal Makhani', unit_price: '180.00', quantity: 1 }],
  }),
  // 5. PREPARING
  createOrder({
    id: 'cb_own_05', status: 'PREPARING', bill_amount: '598.00', created_mins: 20, updated_mins: 10,
    customer_name: 'Kavita Joshi', customer_phone: '+919876543214',
    items: [{ id: 'oi_7', menu_item_id: 'mi_1', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 }, { id: 'oi_8', menu_item_id: 'mi_6', item_name: 'Garlic Naan', unit_price: '50.00', quantity: 2 }],
  }),
  // 6. READY (ready for partner assignment)
  createOrder({
    id: 'cb_own_06', status: 'READY', bill_amount: '400.00', created_mins: 30, updated_mins: 5,
    customer_name: 'Amit Patel', customer_phone: '+919876543215',
    items: [{ id: 'oi_9', menu_item_id: 'mi_7', item_name: 'Kadai Paneer', unit_price: '260.00', quantity: 1 }, { id: 'oi_10', menu_item_id: 'mi_8', item_name: 'Jeera Rice', unit_price: '140.00', quantity: 1 }],
  }),
  // 7. READY (ready for partner assignment)
  createOrder({
    id: 'cb_own_07', status: 'READY', bill_amount: '290.00', created_mins: 25, updated_mins: 2,
    customer_name: 'Neha Singhal', customer_phone: '+919876543216',
    items: [{ id: 'oi_11', menu_item_id: 'mi_4', item_name: 'Veg Biryani', unit_price: '250.00', quantity: 1 }, { id: 'oi_12', menu_item_id: 'mi_9', item_name: 'Raita', unit_price: '40.00', quantity: 1 }],
  }),
  // 8. ASSIGNED
  createOrder({
    id: 'cb_own_08', status: 'ASSIGNED', bill_amount: '498.00', created_mins: 40, updated_mins: 12,
    customer_name: 'Siddharth Rao', customer_phone: '+919876543217', partner: MOCK_DELIVERY_PARTNERS[0],
    items: [{ id: 'oi_13', menu_item_id: 'mi_1', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 }],
  }),
  // 9. OUT_FOR_DELIVERY
  createOrder({
    id: 'cb_own_09', status: 'OUT_FOR_DELIVERY', bill_amount: '310.00', created_mins: 50, updated_mins: 15,
    customer_name: 'Simran Kaur', customer_phone: '+919876543218', partner: MOCK_DELIVERY_PARTNERS[1],
    items: [{ id: 'oi_14', menu_item_id: 'mi_7', item_name: 'Kadai Paneer', unit_price: '260.00', quantity: 1 }, { id: 'oi_15', menu_item_id: 'mi_6', item_name: 'Garlic Naan', unit_price: '50.00', quantity: 1 }],
  }),
  // 10. DELIVERED (no return, reviewed)
  createOrder({
    id: 'cb_own_10', status: 'DELIVERED', bill_amount: '500.00', created_mins: 120, updated_mins: 60,
    customer_name: 'Karan Mehra', customer_phone: '+919876543219', partner: MOCK_DELIVERY_PARTNERS[0],
    items: [{ id: 'oi_16', menu_item_id: 'mi_4', item_name: 'Veg Biryani', unit_price: '250.00', quantity: 2 }],
    review: { rating: 5, comment: 'Super tasty and piping hot delivery!', created_at: minutesAgo(50) },
  }),
  // 11. DELIVERED (Return REQUESTED)
  createOrder({
    id: 'cb_own_11', status: 'DELIVERED', bill_amount: '398.00', created_mins: 180, updated_mins: 90,
    customer_name: 'Tanvi Shah', customer_phone: '+919876543220', partner: MOCK_DELIVERY_PARTNERS[1],
    items: [{ id: 'oi_17', menu_item_id: 'mi_1', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 1 }, { id: 'oi_18', menu_item_id: 'mi_8', item_name: 'Jeera Rice', unit_price: '140.00', quantity: 1 }],
    return_request: { id: 'ret_01', status: 'REQUESTED', reason: 'Food was delivered completely cold and spilled.', created_at: minutesAgo(30), resolved_at: null },
  }),
  // 12. DELIVERED (Return REJECTED)
  createOrder({
    id: 'cb_own_12', status: 'DELIVERED', bill_amount: '250.00', created_mins: daysAgo(1), updated_mins: daysAgo(1),
    customer_name: 'Rohan Gupta', customer_phone: '+919876543221', partner: MOCK_DELIVERY_PARTNERS[2],
    items: [{ id: 'oi_19', menu_item_id: 'mi_4', item_name: 'Veg Biryani', unit_price: '250.00', quantity: 1 }],
    return_request: { id: 'ret_02', status: 'REJECTED', reason: 'I changed my mind after eating half the portion.', created_at: daysAgo(1), resolved_at: daysAgo(1) },
  }),
  // 13. REFUNDED (Return APPROVED)
  createOrder({
    id: 'cb_own_13', status: 'REFUNDED', payment_status: 'REFUNDED', bill_amount: '498.00', created_mins: daysAgo(2), updated_mins: daysAgo(2),
    customer_name: 'Ananya Roy', customer_phone: '+919876543222', partner: MOCK_DELIVERY_PARTNERS[0],
    items: [{ id: 'oi_20', menu_item_id: 'mi_1', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 }],
    return_request: { id: 'ret_03', status: 'APPROVED', reason: 'Order was missing the main dish container.', created_at: daysAgo(2), resolved_at: daysAgo(2) },
  }),
  // 14. CANCELLED (Customer cancelled while in PLACED)
  createOrder({
    id: 'cb_own_14', status: 'CANCELLED', payment_status: 'REFUNDED', bill_amount: '220.00', created_mins: 75, updated_mins: 70,
    customer_name: 'Devansh Roy', customer_phone: '+919876543223',
    items: [{ id: 'oi_21', menu_item_id: 'mi_2', item_name: 'Dal Makhani', unit_price: '180.00', quantity: 1 }, { id: 'oi_22', menu_item_id: 'mi_9', item_name: 'Raita', unit_price: '40.00', quantity: 1 }],
  }),
  // 15. DELIVERED (Return REQUESTED #2)
  createOrder({
    id: 'cb_own_15', status: 'DELIVERED', bill_amount: '520.00', created_mins: 140, updated_mins: 60,
    customer_name: 'Ishaan Reddy', customer_phone: '+919876543224', partner: MOCK_DELIVERY_PARTNERS[2],
    items: [{ id: 'oi_23', menu_item_id: 'mi_7', item_name: 'Kadai Paneer', unit_price: '260.00', quantity: 2 }],
    return_request: { id: 'ret_04', status: 'REQUESTED', reason: 'Gravy was completely burnt and tasted bitter.', created_at: minutesAgo(20), resolved_at: null },
  }),
  // 16. DELIVERED (Reviewed 4 stars)
  createOrder({
    id: 'cb_own_16', status: 'DELIVERED', bill_amount: '340.00', created_mins: 200, updated_mins: 150,
    customer_name: 'Zoya Khan', customer_phone: '+919876543225', partner: MOCK_DELIVERY_PARTNERS[1],
    items: [{ id: 'oi_24', menu_item_id: 'mi_2', item_name: 'Dal Makhani', unit_price: '180.00', quantity: 1 }, { id: 'oi_25', menu_item_id: 'mi_8', item_name: 'Jeera Rice', unit_price: '140.00', quantity: 1 }],
    review: { rating: 4, comment: 'Good food, delivery was slightly delayed.', created_at: minutesAgo(130) },
  }),
];

export const INITIAL_OWNER_REMINDERS = [
  {
    id: 'rem_01', order_id: 'cb_own_01', order_status: 'PLACED',
    message: 'Order has been waiting for acceptance for over 15 minutes.',
    is_read: false, created_at: minutesAgo(10),
  },
  {
    id: 'rem_02', order_id: 'cb_own_03', order_status: 'ACCEPTED',
    message: 'Order has been in accepted status without preparation for over 15 minutes.',
    is_read: false, created_at: minutesAgo(7),
  },
];
