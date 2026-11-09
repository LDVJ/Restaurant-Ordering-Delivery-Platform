/**
 * Mock Orders Dataset
 * Conforms strictly to API_CONTRACT.md conventions:
 * - String IDs & ISO 8601 UTC dates
 * - Money formatted as strings (e.g. "249.00")
 * - Covers all 9 OrderStatus states and return/review combinations across 3 restaurants
 */

const RESTAURANTS = {
  SPICE_HUB: {
    id: 'res_spice',
    name: 'Spice Hub',
    address: '5 Market Street, Ghaziabad',
    phone: '+919123456780',
  },
  CAMPUS_BIRYANI: {
    id: 'res_biryani',
    name: 'Campus Biryani',
    address: 'Hostel 4 Food Court, Campus',
    phone: '+919123456781',
  },
  GREEN_BOWL: {
    id: 'res_green',
    name: 'Green Bowl Salad Co.',
    address: 'Student Activity Center, Campus',
    phone: '+919123456782',
  },
};

const PARTNERS = {
  RAMESH: {
    id: 'dp_ramesh',
    name: 'Ramesh Kumar',
    phone: '+919876501234',
  },
  PRIYA: {
    id: 'dp_priya',
    name: 'Priya Sharma',
    phone: '+919876505678',
  },
};

export const INITIAL_MOCK_ORDERS = [
  // 1. PLACED (can be cancelled by customer)
  {
    id: 'cb_ord_01',
    status: 'PLACED',
    payment_status: 'MOCK_PAID',
    bill_amount: '498.00',
    created_at: '2026-11-08T16:45:00Z',
    status_updated_at: '2026-11-08T16:45:00Z',
    delivered_at: null,
    delivery_address: 'Hostel B, Room 302, North Campus',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.SPICE_HUB,
    items: [
      { id: 'oi_01', menu_item_id: 'mi_01', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 },
    ],
    customer: null,
    delivery_partner: null,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 2. ACCEPTED
  {
    id: 'cb_ord_02',
    status: 'ACCEPTED',
    payment_status: 'MOCK_PAID',
    bill_amount: '380.00',
    created_at: '2026-11-08T16:30:00Z',
    status_updated_at: '2026-11-08T16:32:00Z',
    delivered_at: null,
    delivery_address: 'Faculty Quarters, Flat 4B',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.CAMPUS_BIRYANI,
    items: [
      { id: 'oi_02', menu_item_id: 'mi_04', item_name: 'Chicken Dum Biryani', unit_price: '280.00', quantity: 1 },
      { id: 'oi_03', menu_item_id: 'mi_05', item_name: 'Mirchi Ka Salan', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: null,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 3. PREPARING
  {
    id: 'cb_ord_03',
    status: 'PREPARING',
    payment_status: 'MOCK_PAID',
    bill_amount: '320.00',
    created_at: '2026-11-08T16:15:00Z',
    status_updated_at: '2026-11-08T16:20:00Z',
    delivered_at: null,
    delivery_address: 'Library Study Block, 2nd Floor',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.GREEN_BOWL,
    items: [
      { id: 'oi_04', menu_item_id: 'mi_08', item_name: 'Mediterranean Quinoa Bowl', unit_price: '220.00', quantity: 1 },
      { id: 'oi_05', menu_item_id: 'mi_09', item_name: 'Fresh Orange Juice', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: null,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 4. READY
  {
    id: 'cb_ord_04',
    status: 'READY',
    payment_status: 'MOCK_PAID',
    bill_amount: '299.00',
    created_at: '2026-11-08T16:00:00Z',
    status_updated_at: '2026-11-08T16:18:00Z',
    delivered_at: null,
    delivery_address: 'Hostel A, Room 104',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.SPICE_HUB,
    items: [
      { id: 'oi_06', menu_item_id: 'mi_02', item_name: 'Dal Makhani Combo', unit_price: '199.00', quantity: 1 },
      { id: 'oi_07', menu_item_id: 'mi_03', item_name: 'Garlic Naan (2 pcs)', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: null,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 5. ASSIGNED (partner assigned)
  {
    id: 'cb_ord_05',
    status: 'ASSIGNED',
    payment_status: 'MOCK_PAID',
    bill_amount: '450.00',
    created_at: '2026-11-08T15:40:00Z',
    status_updated_at: '2026-11-08T16:02:00Z',
    delivered_at: null,
    delivery_address: 'Hostel C, Common Room',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.CAMPUS_BIRYANI,
    items: [
      { id: 'oi_08', menu_item_id: 'mi_06', item_name: 'Mutton Seekh Kebab', unit_price: '350.00', quantity: 1 },
      { id: 'oi_09', menu_item_id: 'mi_07', item_name: 'Mint Lemonade', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: PARTNERS.RAMESH,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 6. OUT_FOR_DELIVERY (with partner)
  {
    id: 'cb_ord_06',
    status: 'OUT_FOR_DELIVERY',
    payment_status: 'MOCK_PAID',
    bill_amount: '260.00',
    created_at: '2026-11-08T15:20:00Z',
    status_updated_at: '2026-11-08T15:48:00Z',
    delivered_at: null,
    delivery_address: 'Main Administrative Gate, Security Desk',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.GREEN_BOWL,
    items: [
      { id: 'oi_10', menu_item_id: 'mi_10', item_name: 'Avocado Toast & Hummus', unit_price: '260.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: PARTNERS.PRIYA,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 7. DELIVERED (no review, no return)
  {
    id: 'cb_ord_07',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '510.00',
    created_at: '2026-11-08T14:00:00Z',
    status_updated_at: '2026-11-08T14:35:00Z',
    delivered_at: '2026-11-08T14:35:00Z',
    delivery_address: 'Hostel B, Room 210',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.SPICE_HUB,
    items: [
      { id: 'oi_11', menu_item_id: 'mi_01', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 1 },
      { id: 'oi_12', menu_item_id: 'mi_02', item_name: 'Dal Makhani Combo', unit_price: '199.00', quantity: 1 },
      { id: 'oi_13', menu_item_id: 'mi_11', item_name: 'Jeera Rice', unit_price: '62.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: PARTNERS.RAMESH,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 8. DELIVERED (with customer review)
  {
    id: 'cb_ord_08',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '380.00',
    created_at: '2026-11-08T12:30:00Z',
    status_updated_at: '2026-11-08T13:05:00Z',
    delivered_at: '2026-11-08T13:05:00Z',
    delivery_address: 'Hostel D, Room 12',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.CAMPUS_BIRYANI,
    items: [
      { id: 'oi_14', menu_item_id: 'mi_04', item_name: 'Chicken Dum Biryani', unit_price: '280.00', quantity: 1 },
      { id: 'oi_15', menu_item_id: 'mi_05', item_name: 'Mirchi Ka Salan', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: PARTNERS.PRIYA,
    review: {
      rating: 5,
      comment: 'Super fast delivery and the biryani was piping hot!',
      created_at: '2026-11-08T13:15:00Z',
    },
    return_request: null,
    return_status: null,
    has_review: true,
  },

  // 9. DELIVERED (with return REQUESTED)
  {
    id: 'cb_ord_09',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '220.00',
    created_at: '2026-11-07T18:00:00Z',
    status_updated_at: '2026-11-07T18:40:00Z',
    delivered_at: '2026-11-07T18:40:00Z',
    delivery_address: 'Girls Hostel 1, Wing C, Room 4',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.GREEN_BOWL,
    items: [
      { id: 'oi_16', menu_item_id: 'mi_08', item_name: 'Mediterranean Quinoa Bowl', unit_price: '220.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: PARTNERS.RAMESH,
    review: null,
    return_request: {
      id: 'ret_01',
      status: 'REQUESTED',
      reason: 'The packaging arrived crushed and the salad dressing leaked all over.',
      created_at: '2026-11-07T18:50:00Z',
      resolved_at: null,
    },
    return_status: 'REQUESTED',
    has_review: false,
  },

  // 10. DELIVERED (with return APPROVED)
  {
    id: 'cb_ord_10',
    status: 'REFUNDED',
    payment_status: 'REFUNDED',
    bill_amount: '350.00',
    created_at: '2026-11-06T19:00:00Z',
    status_updated_at: '2026-11-06T20:00:00Z',
    delivered_at: '2026-11-06T19:35:00Z',
    delivery_address: 'Hostel B, Room 405',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.CAMPUS_BIRYANI,
    items: [
      { id: 'oi_17', menu_item_id: 'mi_06', item_name: 'Mutton Seekh Kebab', unit_price: '350.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: PARTNERS.PRIYA,
    review: null,
    return_request: {
      id: 'ret_02',
      status: 'APPROVED',
      reason: 'Wrong food item was delivered by mistake.',
      created_at: '2026-11-06T19:45:00Z',
      resolved_at: '2026-11-06T20:00:00Z',
    },
    return_status: 'APPROVED',
    has_review: false,
  },

  // 11. DELIVERED (with return REJECTED, has review)
  {
    id: 'cb_ord_11',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '498.00',
    created_at: '2026-11-05T13:00:00Z',
    status_updated_at: '2026-11-05T14:10:00Z',
    delivered_at: '2026-11-05T13:40:00Z',
    delivery_address: 'Student Centre, Food Court Bench 3',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.SPICE_HUB,
    items: [
      { id: 'oi_18', menu_item_id: 'mi_01', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 },
    ],
    customer: null,
    delivery_partner: PARTNERS.RAMESH,
    review: {
      rating: 2,
      comment: 'Food portion was too small for two people.',
      created_at: '2026-11-05T14:15:00Z',
    },
    return_request: {
      id: 'ret_03',
      status: 'REJECTED',
      reason: 'Portion did not match expectation.',
      created_at: '2026-11-05T13:50:00Z',
      resolved_at: '2026-11-05T14:10:00Z',
    },
    return_status: 'REJECTED',
    has_review: true,
  },

  // 12. CANCELLED
  {
    id: 'cb_ord_12',
    status: 'CANCELLED',
    payment_status: 'REFUNDED',
    bill_amount: '299.00',
    created_at: '2026-11-04T11:00:00Z',
    status_updated_at: '2026-11-04T11:05:00Z',
    delivered_at: null,
    delivery_address: 'Hostel A, Room 22',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.SPICE_HUB,
    items: [
      { id: 'oi_19', menu_item_id: 'mi_02', item_name: 'Dal Makhani Combo', unit_price: '199.00', quantity: 1 },
      { id: 'oi_20', menu_item_id: 'mi_03', item_name: 'Garlic Naan (2 pcs)', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: null,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 13. REFUNDED
  {
    id: 'cb_ord_13',
    status: 'REFUNDED',
    payment_status: 'REFUNDED',
    bill_amount: '260.00',
    created_at: '2026-11-03T15:00:00Z',
    status_updated_at: '2026-11-03T15:30:00Z',
    delivered_at: null,
    delivery_address: 'Lab 3, Computer Centre',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.GREEN_BOWL,
    items: [
      { id: 'oi_21', menu_item_id: 'mi_10', item_name: 'Avocado Toast & Hummus', unit_price: '260.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: null,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 14. Additional PLACED order (Multi-item Campus Biryani)
  {
    id: 'cb_ord_14',
    status: 'PLACED',
    payment_status: 'MOCK_PAID',
    bill_amount: '730.00',
    created_at: '2026-11-08T17:00:00Z',
    status_updated_at: '2026-11-08T17:00:00Z',
    delivered_at: null,
    delivery_address: 'Hostel C, Room 512, 5th Floor',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.CAMPUS_BIRYANI,
    items: [
      { id: 'oi_22', menu_item_id: 'mi_04', item_name: 'Chicken Dum Biryani', unit_price: '280.00', quantity: 2 },
      { id: 'oi_23', menu_item_id: 'mi_06', item_name: 'Mutton Seekh Kebab', unit_price: '350.00', quantity: 1 },
      { id: 'oi_24', menu_item_id: 'mi_07', item_name: 'Mint Lemonade', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: null,
    review: null,
    return_request: null,
    return_status: null,
    has_review: false,
  },

  // 15. Additional DELIVERED order (Green Bowl)
  {
    id: 'cb_ord_15',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '320.00',
    created_at: '2026-11-02T12:00:00Z',
    status_updated_at: '2026-11-02T12:45:00Z',
    delivered_at: '2026-11-02T12:45:00Z',
    delivery_address: 'Faculty Guest House, Suite 101',
    contact_phone: '+919876543210',
    restaurant: RESTAURANTS.GREEN_BOWL,
    items: [
      { id: 'oi_25', menu_item_id: 'mi_08', item_name: 'Mediterranean Quinoa Bowl', unit_price: '220.00', quantity: 1 },
      { id: 'oi_26', menu_item_id: 'mi_09', item_name: 'Fresh Orange Juice', unit_price: '100.00', quantity: 1 },
    ],
    customer: null,
    delivery_partner: PARTNERS.RAMESH,
    review: {
      rating: 4,
      comment: 'Very healthy and fresh ingredients.',
      created_at: '2026-11-02T13:00:00Z',
    },
    return_request: null,
    return_status: null,
    has_review: true,
  },
];
