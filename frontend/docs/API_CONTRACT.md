# CampusBite API Contract

This file is the single source of truth for the frontend and the backend.
If an endpoint is not in this file, it does not exist. Do not invent endpoints or fields.
If something is missing, stop and ask.

Base URL (local): `http://localhost:8000`
Interactive docs from FastAPI: `http://localhost:8000/docs`

## Build status (update this as the backend gets finished)

Only build frontend pages for groups marked `[x]`.

- [x] Auth: register and login (GET /auth/me is still to be added)
- [x] Customer: restaurants and menu (includes `GET /restaurants/cuisines`; build it before running the cuisine chip step)
- [x] Owner: restaurant setup and menu management (`PATCH /owner/menu/{id}` is still to be added)
- [ ] Customer: orders (place, list, detail, cancel)
- [ ] Owner: orders, status updates, assign delivery partner
- [ ] Delivery partner: orders and status updates
- [ ] Customer: reviews and returns
- [ ] Owner: stats, returns, reminders
- [ ] AI insights

## Conventions (apply to every endpoint)

- Protected endpoints need the header `Authorization: Bearer <access_token>`.
- JSON in, JSON out. Keys are `snake_case`. Ids are strings.
- Money is returned as a **string**, for example `"249.00"`. Convert with `Number()` before doing math. Currency is INR (₹).
- Dates and times are ISO 8601 strings in UTC. The frontend converts them to local time for display.
- Date filters use `YYYY-MM-DD` and are inclusive (UTC).
- Lists accept `?page=1&page_size=10` (page starts at 1, `page_size` max 50) and return:

```json
{ "items": [], "total": 0, "page": 1, "page_size": 10, "total_pages": 0 }
```

### Errors

Every error looks like `{ "detail": "..." }`. Status codes:

| Code | Meaning |
|------|---------|
| 400 | A business rule was broken (invalid status move, dish unavailable, cancel not allowed) |
| 401 | Missing, invalid, or expired token |
| 403 | Logged in, but the role is not allowed |
| 404 | Not found, or it belongs to someone else |
| 409 | Duplicate (email already used, review exists, return exists, restaurant exists) |
| 422 | Validation failed. The body is `{ "detail": "Validation failed", "errors": [ { "field": "email", "message": "..." } ] }`. Show the first `message` |
| 500 | Server or database problem. `detail` is a generic readable message |
| 429 | Too many requests (AI feature) |
| 503 | A service is unavailable or not configured (AI feature) |

## Enums

- Role: `CUSTOMER`, `RESTAURANT_OWNER`, `DELIVERY_PARTNER`
- OrderStatus: `PLACED`, `ACCEPTED`, `PREPARING`, `READY`, `ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- PaymentStatus: `PENDING`, `MOCK_PAID`, `REFUNDED`
- ReturnStatus: `REQUESTED`, `APPROVED`, `REJECTED`

## Business rules the backend enforces (the frontend only mirrors them)

- A new order starts as `PLACED` with payment status `MOCK_PAID`, and one `PAYMENT` ledger entry is created.
- Normal flow: `PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `ASSIGNED` → `OUT_FOR_DELIVERY` → `DELIVERED`.
- Customer can cancel only in `PLACED`. Cancel sets the order to `CANCELLED`, the payment to `REFUNDED`, and adds a `REFUND` ledger entry.
- Owner moves `PLACED → ACCEPTED → PREPARING → READY`, then assigns a delivery partner (only when `READY`).
- Delivery partner moves `ASSIGNED → OUT_FOR_DELIVERY → DELIVERED`, only on orders assigned to them.
- Every other status move returns 400.
- Review: only the order's customer, only when `DELIVERED`, one per order (409 if it exists).
- Return request: only the order's customer, only when `DELIVERED`, one per order (409 if it exists).
- Approving a return sets the payment to `REFUNDED`, adds a `REFUND` ledger entry, and sets the order to `REFUNDED`. Rejecting sets the return to `REJECTED`.
- An order contains dishes from exactly one restaurant. Prices come from the database, never from the request.
- Order total = sum of (unit price × quantity). There are no taxes or delivery fees.

## Field limits (use for `maxLength` and validation in forms)

- name 2–100, email up to 200, password 8–72 bytes with at least one uppercase letter, one lowercase letter, one digit and one special character
- country_code like `+91`, phone_number digits only, 6–15 digits, and country code plus number at most 15 digits in total
- restaurant name up to 100, description up to 300, cuisine up to 100, house, city, state and country up to 100 each
- dish name up to 100, dish description up to 200, price greater than 0 and up to 99999.99
- quantity 1–20 per dish, up to 30 different dishes per order
- delivery_address up to 500, contact_phone up to 20
- rating 1–5, review comment up to 500, return reason 10–500
- AI question up to 300

## Shared shapes

**User**

```json
{ "id": "…", "name": "Asha", "email": "asha@example.com", "role": "CUSTOMER",
  "country_code": "+91", "phone_number": "9876543210", "phone_e164": "+919876543210" }
```

**Order summary** (used in lists)

```json
{ "id": "…", "status": "PLACED", "payment_status": "MOCK_PAID", "bill_amount": "498.00",
  "created_at": "2026-11-05T10:15:00Z",
  "restaurant": { "id": "…", "name": "Spice Hub" },
  "items": [ { "item_name": "Paneer Tikka", "quantity": 2 } ],
  "return_status": null, "has_review": false }
```

`return_status` is `null` or a ReturnStatus (`REQUESTED`, `APPROVED`, `REJECTED`), and `has_review` is `true` when the order already has a review. The customer dashboard needs them for the return badge and the "Rate your order" button. Owner lists add `customer_name`. Delivery lists add `customer_name`, `delivery_address`, `contact_phone`, and `restaurant.address` and `restaurant.phone`.

**Order detail**

```json
{
  "id": "…", "status": "PLACED", "payment_status": "MOCK_PAID", "bill_amount": "498.00",
  "created_at": "2026-11-05T10:15:00Z", "status_updated_at": "2026-11-05T10:15:00Z", "delivered_at": null,
  "delivery_address": "12 MG Road, Ghaziabad, Uttar Pradesh",
  "contact_phone": "+919876543210",
  "restaurant": { "id": "…", "name": "Spice Hub", "address": "5 Market Street, Ghaziabad", "phone": "+919123456780" },
  "items": [ { "id": "…", "menu_item_id": "…", "item_name": "Paneer Tikka", "unit_price": "249.00", "quantity": 2 } ],
  "customer": null,
  "delivery_partner": null,
  "review": null,
  "return_request": null
}
```

- `customer` is `{ "name", "phone" }`. Only owner and delivery partner responses include it. For the customer it is `null`.
- `delivery_partner` is `{ "id", "name", "phone" }` once assigned, else `null`. Customer and owner responses include it.
- `review` is `{ "rating", "comment", "created_at" }` or `null`.
- `return_request` is `{ "id", "status", "reason", "created_at", "resolved_at" }` or `null`.

**Order timeline:** there is no status history. The frontend draws the steps from the current `status`: steps up to the current one are done, later steps are pending.

---

## Auth

| Method | Path | Body | Success |
|--------|------|------|---------|
| POST | `/auth/register` | `{ name, email, password, role, country_code, phone_number }` | 201 → User. 409 `"Email already registered"` if the email exists |
| POST | `/auth/login` | **Form data** (`application/x-www-form-urlencoded`): `username` (the email) and `password` | 200 → `{ access_token, token_type, user }`. 401 `"Invalid email or password"` |
| GET | `/auth/me` | – | 200 → User |

## Customer: restaurants and menu (role CUSTOMER)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/restaurants/cuisines` | Returns a sorted list of the distinct cuisines of active restaurants that appear in the restaurant list, for example `["North Indian", "Pizza"]`. The frontend builds the cuisine chips from it (with "All" first). No pagination: it returns the full list, and the frontend shows only the first few chips plus a "More" button. Cuisines are saved in Title Case |
| GET | `/restaurants?search=&cuisine=&page=&page_size=` | Active restaurants only. Item: `{ id, name, description, cuisine, city, avg_rating, review_count }`. `avg_rating` is `null` when there are no reviews |
| GET | `/restaurants/{id}` | Same fields plus `address` (one string). The restaurant phone number is **not** included: like Swiggy and Zomato, it is only visible after an order is placed (see Order detail) |
| GET | `/restaurants/{id}/menu?search=&min_price=&max_price=&page=&page_size=` | Item: `{ id, name, description, price, is_available }`. Unavailable dishes are included. The frontend greys them out and disables adding |

## Customer: orders (role CUSTOMER)

| Method | Path | Body / Query | Success |
|--------|------|--------------|---------|
| POST | `/orders` | `{ restaurant_id, items: [{ menu_item_id, quantity }], delivery_address, contact_phone }` | 201 → Order detail. 400 if a dish is unavailable or from another restaurant |
| GET | `/orders?status=&date_from=&date_to=&page=&page_size=` | – | Paginated Order summary (own orders only) |
| GET | `/orders/{id}` | – | Order detail (404 if not own) |
| POST | `/orders/{id}/cancel` | – | 200 → Order detail. 400 unless `PLACED` |
| POST | `/orders/{id}/review` | `{ rating, comment? }` | 201 → review. 400 unless `DELIVERED`. 409 if it exists |
| POST | `/orders/{id}/return` | `{ reason }` | 201 → return request. 400 unless `DELIVERED`. 409 if it exists |

## Customer: AI insights (role CUSTOMER)

| Method | Path | Body | Success |
|--------|------|------|---------|
| POST | `/ai/insights` | `{ question }` | 200 → `{ answer }` |

- An empty `question` means "Summarize my last five orders".
- Errors: 429 (too many requests, wait and retry), 503 (AI not configured or unavailable), 504 (timeout). `detail` is always readable and can be shown as is.
- Example questions for suggestion chips: "Summarize my last five orders", "Which of my orders are still not delivered?", "How much did I spend this week?", "Which food items have I ordered most?".

## Owner (role RESTAURANT_OWNER, every path starts with `/owner`)

**Restaurant** (one restaurant per owner; the address is part of it and is never fetched separately)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/owner/restaurant` | Returns the Restaurant shape below. 404 if the owner has no restaurant yet. The frontend then shows the setup form |
| POST | `/owner/restaurant` | Body `{ name, description, cuisine, country_code, phone_number, address: { house, city, state, country, country_code, phone_number } }`. 201 → Restaurant shape. 409 if the owner already has a restaurant, if the owner contact number belongs to another restaurant, or if the restaurant contact number belongs to another restaurant |
| PUT | `/owner/restaurant` | Replaces the details. Body `{ name, description, cuisine, country_code, phone_number }`, all required (`phone_number` here is the **owner contact number**). 200 → Restaurant shape. 409 if that number belongs to another restaurant |
| PUT | `/owner/restaurant/address` | Replaces the address and the restaurant contact number. Body `{ house, city, state, country, country_code, phone_number }`, all required. 200 → Restaurant shape. 409 if the restaurant contact number belongs to another restaurant |

Restaurant shape (returned by all four endpoints above):

```json
{ "id": "…", "name": "Spice Hub", "description": "…", "cuisine": "North Indian",
  "country_code": "+91", "phone_number": "9876543210", "phone_e164": "+919876543210",
  "address": { "house": "5 Market Street", "city": "Ghaziabad", "state": "Uttar Pradesh", "country": "India",
                "country_code": "+91", "phone_number": "9123456780", "phone_e164": "+919123456780" } }
```

**Two different phone numbers.** The top-level `country_code` and `phone_number` are the **owner contact number** (private; never shown to customers or delivery partners). The `address` phone is the **restaurant contact number** (hidden while browsing; it appears only as `restaurant.phone` in the Order detail, so the customer and the delivery partner can call the restaurant once an order exists). They may be the same number or different. Each must be unique among restaurants. The owner forms must label them clearly.

The frontend replaces its saved restaurant with whatever these endpoints return. Opening and closing a restaurant (`is_active`) is not part of the API for now.

**Menu** (no delete; "removing" a dish means `is_available = false`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/owner/menu?search=&is_available=&page=&page_size=` | Item: `{ id, name, description, price, is_available }` |
| POST | `/owner/menu` | Body `{ name, description, price }`. 201 |
| PATCH | `/owner/menu/{id}` | Any of `{ name, description, price, is_available }` |

**Orders**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/owner/orders?status=&date_from=&date_to=&page=&page_size=` | Paginated Order summary with `customer_name` |
| GET | `/owner/orders/{id}` | Order detail |
| POST | `/owner/orders/{id}/status` | Body `{ status }`. Allowed: `ACCEPTED`, `PREPARING`, `READY` (in order) |
| GET | `/owner/delivery-partners` | `[ { id, name, phone } ]` for the assign dropdown |
| POST | `/owner/orders/{id}/assign` | Body `{ delivery_partner_id }`. Only when `READY`. Result status `ASSIGNED` |

**Stats**

`GET /owner/stats` returns:

```json
{ "total_orders": 0, "today_orders": 0,
  "orders_by_status": { "PLACED": 0, "ACCEPTED": 0, "PREPARING": 0, "READY": 0, "ASSIGNED": 0,
                        "OUT_FOR_DELIVERY": 0, "DELIVERED": 0, "CANCELLED": 0, "REFUNDED": 0 },
  "revenue": "0.00", "avg_rating": null, "review_count": 0, "pending_returns": 0,
  "top_items": [ { "item_name": "Paneer Tikka", "quantity": 12 } ] }
```

`revenue` = total of delivered orders that were not refunded.

**Returns**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/owner/returns?status=&page=&page_size=` | Item: `{ id, order_id, customer_name, reason, status, created_at, resolved_at, bill_amount }` |
| POST | `/owner/returns/{id}/approve` | 200. 400 if it is not `REQUESTED` |
| POST | `/owner/returns/{id}/reject` | 200. 400 if it is not `REQUESTED` |

**Reminders** (orders stuck in `PLACED` or `ACCEPTED` for more than 15 minutes)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/owner/reminders?unread_only=&page=&page_size=` | Item: `{ id, order_id, order_status, message, is_read, created_at }` |
| POST | `/owner/reminders/{id}/read` | 200 |

## Delivery partner (role DELIVERY_PARTNER, every path starts with `/delivery`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/delivery/orders?status=&page=&page_size=` | Only orders assigned to the caller. No `status` means active (`ASSIGNED` and `OUT_FOR_DELIVERY`). `status=DELIVERED` is the history |
| GET | `/delivery/orders/{id}` | Order detail including `customer` and `restaurant.address` |
| POST | `/delivery/orders/{id}/status` | Body `{ status }`. Allowed: `OUT_FOR_DELIVERY`, then `DELIVERED` |
