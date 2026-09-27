# Critical Test Paths — ShipSafe Must-Have Test Catalogue

These tests MUST exist before any production release. Absence of any of these
is a HIGH or CRITICAL finding regardless of overall coverage percentage.

---

## SECURITY CRITICAL PATHS

### SEC-TEST-01: SQL Injection Rejection
**Endpoint:** POST /api/users/login (or any login endpoint)
**Input:** `{ "username": "' OR 1=1 --", "password": "anything" }`
**Expected:** 400 or 401, NO token in response
**Why:** If this returns 200 with a token, the app is exploitable in minutes

### SEC-TEST-02: Path Traversal Rejection
**Endpoint:** GET /api/products/image?file=../../etc/passwd
**Input:** `file=../../etc/passwd` or `file=..%2F..%2Fetc%2Fpasswd`
**Expected:** 400 or 403
**Why:** Directory traversal can expose server config, source code, or OS files

### SEC-TEST-03: Unauthenticated Admin Access Rejection
**Endpoint:** GET /api/users/all (or any admin route)
**Input:** No Authorization header
**Expected:** 401 Unauthorized
**Why:** Unprotected admin routes are one of the most common prod breaches

### SEC-TEST-04: Invalid JWT Rejection
**Endpoint:** Any authenticated endpoint
**Input:** Authorization: Bearer <random-string>
**Expected:** 401 Unauthorized
**Why:** Auth middleware must actually verify tokens

### SEC-TEST-05: Expired JWT Rejection
**Endpoint:** Any authenticated endpoint
**Input:** Authorization: Bearer <expired-token>
**Expected:** 401 Unauthorized

---

## BUSINESS LOGIC CRITICAL PATHS

### BIZ-TEST-01: Negative Order Amount Rejection
**Endpoint:** POST /api/orders
**Input:** `{ "totalAmount": -999, "items": [] }`
**Expected:** 400 Bad Request
**Why:** Without this, an attacker can create orders with negative amounts
(financial exploit — gets product for free or gets credit)

### BIZ-TEST-02: IDOR Protection
**Endpoint:** GET /api/orders/:id
**Setup:** Create order as User A, try to access as User B
**Expected:** 403 Forbidden
**Why:** Without ownership check, any user can see any other user's orders

### BIZ-TEST-03: Duplicate User Registration
**Endpoint:** POST /api/users/register
**Input:** Same username/email twice
**Expected:** 409 Conflict (not a 500 from DB constraint)
**Why:** Duplicate users corrupt data and can be used for account takeover

---

## INPUT VALIDATION CRITICAL PATHS

### VAL-TEST-01: Missing Required Fields
**Endpoint:** POST /api/users/login
**Input:** `{}` (empty body)
**Expected:** 400 with meaningful error message
**Why:** Null/undefined inputs crash unvalidated handlers

### VAL-TEST-02: Invalid Data Types
**Endpoint:** GET /api/products?minPrice=abc
**Input:** Non-numeric price filter
**Expected:** 400 or graceful ignore (not a 500 crash)

### VAL-TEST-03: Extremely Long Input
**Endpoint:** POST /api/users/register
**Input:** username = 10,000 character string
**Expected:** 400 (not a DB truncation error or crash)

---

## ERROR PATH CRITICAL PATHS

### ERR-TEST-01: 404 for Nonexistent Resources
**Endpoint:** GET /api/orders/999999
**Expected:** 404 Not Found (not 200 with null body)

### ERR-TEST-02: Server Error Does Not Leak Details
**Expected:** 500 responses must NOT include DB error messages or stack traces
**Test:** Trigger an intentional DB error, assert response body is generic

---

## MINIMUM TEST REQUIREMENTS FOR GREEN STATUS

For a project to score ≥ 70 (minimum GREEN), it MUST have:
- [ ] At least one SQL injection rejection test
- [ ] At least one unauthenticated access rejection test
- [ ] At least one input validation test (missing/invalid field)
- [ ] Overall line coverage ≥ 60%
- [ ] All source files > 0% coverage
