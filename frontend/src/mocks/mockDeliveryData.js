/**
 * Mock Delivery Partner Orders Data
 * Sourced from API_CONTRACT.md - Delivery Partner Endpoints
 */

const now = Date.now();
const minutesAgo = (m) => new Date(now - m * 60 * 1000).toISOString();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

export const INITIAL_DELIVERY_ORDERS = [
  // 1. ASSIGNED (Active - ready for pickup)
  {
    id: 'del_ord_01',
    status: 'ASSIGNED',
    payment_status: 'MOCK_PAID',
    bill_amount: '498.00',
    created_at: minutesAgo(25),
    status_updated_at: minutesAgo(6),
    delivered_at: null,
    customer_name: 'Asha Verma',
    contact_phone: '+919876543210',
    delivery_address: 'Room 302, Hostel B, North Campus',
    restaurant: {
      id: 'res_spice',
      name: 'Spice Hub',
      address: '5 Market Street, Ghaziabad',
      phone: '+919123456780',
    },
    items: [
      { id: 'di_1', menu_item_id: 'mi_1', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 },
    ],
    customer: { name: 'Asha Verma', phone: '+919876543210' },
    delivery_partner: { id: 'dp_current', name: 'Rider Partner', phone: '+919876501234' },
    return_status: null,
    has_review: false,
  },

  // 2. ASSIGNED (Active - ready for pickup)
  {
    id: 'del_ord_02',
    status: 'ASSIGNED',
    payment_status: 'MOCK_PAID',
    bill_amount: '320.00',
    created_at: minutesAgo(20),
    status_updated_at: minutesAgo(3),
    delivered_at: null,
    customer_name: 'Rohan Gupta',
    contact_phone: '+919876543211',
    delivery_address: 'Staff Quarters Q-14, West Campus',
    restaurant: {
      id: 'res_green',
      name: 'Green Bowls',
      address: 'Shop 12, Student Activity Center',
      phone: '+919123456781',
    },
    items: [
      { id: 'di_2', menu_item_id: 'mi_2', item_name: 'Falafel Wrap', unit_price: '220.00', quantity: 1 },
      { id: 'di_3', menu_item_id: 'mi_3', item_name: 'Fresh Lime Soda', unit_price: '100.00', quantity: 1 },
    ],
    customer: { name: 'Rohan Gupta', phone: '+919876543211' },
    delivery_partner: { id: 'dp_current', name: 'Rider Partner', phone: '+919876501234' },
    return_status: null,
    has_review: false,
  },

  // 3. OUT_FOR_DELIVERY (Active - on the way to customer)
  {
    id: 'del_ord_03',
    status: 'OUT_FOR_DELIVERY',
    payment_status: 'MOCK_PAID',
    bill_amount: '350.00',
    created_at: minutesAgo(40),
    status_updated_at: minutesAgo(12),
    delivered_at: null,
    customer_name: 'Pooja Nair',
    contact_phone: '+919876543212',
    delivery_address: 'Library Study Block 2, East Campus',
    restaurant: {
      id: 'res_spice',
      name: 'Spice Hub',
      address: '5 Market Street, Ghaziabad',
      phone: '+919123456780',
    },
    items: [
      { id: 'di_4', menu_item_id: 'mi_4', item_name: 'Veg Biryani', unit_price: '250.00', quantity: 1 },
      { id: 'di_5', menu_item_id: 'mi_5', item_name: 'Gulab Jamun', unit_price: '50.00', quantity: 2 },
    ],
    customer: { name: 'Pooja Nair', phone: '+919876543212' },
    delivery_partner: { id: 'dp_current', name: 'Rider Partner', phone: '+919876501234' },
    return_status: null,
    has_review: false,
  },

  // 4. DELIVERED (History)
  {
    id: 'del_ord_04',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '500.00',
    created_at: hoursAgo(2),
    status_updated_at: hoursAgo(1.2),
    delivered_at: hoursAgo(1.2),
    customer_name: 'Karan Mehra',
    contact_phone: '+919876543219',
    delivery_address: 'Wing C, Tech Hub, South Campus',
    restaurant: {
      id: 'res_spice',
      name: 'Spice Hub',
      address: '5 Market Street, Ghaziabad',
      phone: '+919123456780',
    },
    items: [
      { id: 'di_6', menu_item_id: 'mi_4', item_name: 'Veg Biryani', unit_price: '250.00', quantity: 2 },
    ],
    customer: { name: 'Karan Mehra', phone: '+919876543219' },
    delivery_partner: { id: 'dp_current', name: 'Rider Partner', phone: '+919876501234' },
    return_status: null,
    has_review: true,
  },

  // 5. DELIVERED (History)
  {
    id: 'del_ord_05',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '180.00',
    created_at: hoursAgo(3.5),
    status_updated_at: hoursAgo(2.8),
    delivered_at: hoursAgo(2.8),
    customer_name: 'Vikram Malhotra',
    contact_phone: '+919876543213',
    delivery_address: 'Faculty Enclave House 10',
    restaurant: {
      id: 'res_green',
      name: 'Green Bowls',
      address: 'Shop 12, Student Activity Center',
      phone: '+919123456781',
    },
    items: [
      { id: 'di_7', menu_item_id: 'mi_2', item_name: 'Dal Makhani', unit_price: '180.00', quantity: 1 },
    ],
    customer: { name: 'Vikram Malhotra', phone: '+919876543213' },
    delivery_partner: { id: 'dp_current', name: 'Rider Partner', phone: '+919876501234' },
    return_status: null,
    has_review: false,
  },

  // 6. DELIVERED (History)
  {
    id: 'del_ord_06',
    status: 'DELIVERED',
    payment_status: 'MOCK_PAID',
    bill_amount: '598.00',
    created_at: hoursAgo(5),
    status_updated_at: hoursAgo(4.2),
    delivered_at: hoursAgo(4.2),
    customer_name: 'Kavita Joshi',
    contact_phone: '+919876543214',
    delivery_address: 'Hostel A, Room 108',
    restaurant: {
      id: 'res_spice',
      name: 'Spice Hub',
      address: '5 Market Street, Ghaziabad',
      phone: '+919123456780',
    },
    items: [
      { id: 'di_8', menu_item_id: 'mi_1', item_name: 'Paneer Butter Masala', unit_price: '249.00', quantity: 2 },
      { id: 'di_9', menu_item_id: 'mi_6', item_name: 'Garlic Naan', unit_price: '50.00', quantity: 2 },
    ],
    customer: { name: 'Kavita Joshi', phone: '+919876543214' },
    delivery_partner: { id: 'dp_current', name: 'Rider Partner', phone: '+919876501234' },
    return_status: null,
    has_review: false,
  },
];
