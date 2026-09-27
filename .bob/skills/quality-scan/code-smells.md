# Code Smells — Production Risk Catalogue

## 1. Duplicated Database Connection
**Risk:** Connection leak, inconsistent state
**Pattern:**
```js
// Every route creates its own DB connection inline
router.get('/products', (req, res) => {
  const db = new sqlite3.Database('./products.db')
  // ... forget to close → connection leak
})
```
**Penalty:** −5 per occurrence
**Fix:** Create a single shared db module with connection pooling

---

## 2. Dead Code — Unreachable Function
**Risk:** False sense of coverage, maintenance confusion
**Pattern:**
```js
// Function defined but never imported or called
function calculateDiscount(price, discountCode) { ... }
```
**Penalty:** −5 per dead block
**Fix:** Delete it or move to a utilities module and use it

---

## 3. Callback Hell / Nested Async
**Risk:** Error handling gaps, hard to trace bugs
**Pattern:**
```js
db.get(query, (err, user) => {
  if (user) {
    db.get(secondQuery, (err2, order) => {
      if (order) {
        db.run(thirdQuery, (err3) => {
          // error from err, err2, err3 can all be silently lost
        })
      }
    })
  }
})
```
**Penalty:** −5 per nesting depth > 2
**Fix:** Promisify db calls, use async/await with try/catch

---

## 4. Missing Return After Async Response
**Risk:** "Cannot set headers after they are sent" crash
**Pattern:**
```js
if (err) {
  res.status(500).json({ error: err.message })
  // MISSING: return
}
res.json(row) // this still runs! → crash
```
**Penalty:** −7 per occurrence
**Fix:** Always `return res.status(...).json(...)` in error branches

---

## 5. TODO/FIXME Comments
**Risk:** Known debt that never gets fixed
**Pattern:**
```js
// TODO: Add proper logging
// FIXME: This crashes with null input
// HACK: Temporary workaround for prod issue
```
**Penalty:** −1 per comment
**Note:** Record all for the release report

---

## 6. Magic Numbers
**Risk:** Intent is unclear, changes require hunting down all occurrences
**Pattern:**
```js
if (items.length > 500) { /* why 500? */ }
const fee = amount * 0.029 + 0.30 // Stripe fees hardcoded
```
**Penalty:** −2 per magic number in business logic
**Fix:** `const MAX_CART_ITEMS = 500`

---

## 7. Inconsistent Error Handling
**Risk:** Some errors silently swallowed, others crash the process
**Pattern:**
```js
db.get(query, (err, row) => {
  // err is never checked!
  res.json(row) // crashes if row is null
})
```
**Penalty:** −7 per missing error check at async boundary

---

## 8. Long Route Handler (>50 lines)
**Risk:** Hard to test, hard to understand, easy to miss bugs
**Penalty:** −3 per long function
**Fix:** Extract business logic to service layer functions

---

## 9. Direct require() Inside Route Handler
**Risk:** Module not cached properly, repeated instantiation, hard to mock in tests
**Pattern:**
```js
router.get('/products', (req, res) => {
  const db = require('sqlite3').verbose() // inside handler!
})
```
**Penalty:** −3 per occurrence
**Fix:** Require modules at the top of the file

---

## 10. console.log in Production Code
**Risk:** Sensitive data in logs, performance overhead, no log levels
**Pattern:**
```js
console.log(`Server running on port ${PORT}`)
console.log(`DB Password: ${DB_PASSWORD}`) // CRITICAL if secret
```
**Penalty:** −1 per log statement (−5 if logging a secret)
**Fix:** Use a proper logger (winston, pino) with log levels
