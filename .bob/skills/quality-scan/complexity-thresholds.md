# Cyclomatic Complexity — ShipSafe Thresholds

## What is Cyclomatic Complexity?
Cyclomatic complexity measures the number of independent paths through a function.
Higher complexity = more test cases needed = higher chance of untested bugs.

## How to Count (Manual Method)
Start with 1. Add 1 for each:
- `if` statement
- `else if` clause
- `for` / `while` / `do while` loop
- `case` in switch statement
- `&&` operator in condition
- `||` operator in condition
- ternary `? :` expression
- `catch` block

## Thresholds

| Complexity | Rating | ShipSafe Action |
|---|---|---|
| 1–5 | ✅ Excellent | No finding |
| 6–10 | ✅ Acceptable | No finding |
| 11–15 | ⚠️ HIGH | Finding + −8 penalty |
| 16–20 | 🔴 CRITICAL | Finding + −15 penalty |
| 21+ | 🔴 CRITICAL | Finding + −15 penalty + mandatory refactor note |

## Real Example — Demo App products.js GET /
```js
router.get('/', (req, res) => {                    // +1 base
  if (category) {                                  // +1
    query += ` AND category = '${category}'`
  }
  if (minPrice) {                                  // +1
    if (!isNaN(minPrice)) {                        // +1
      query += ` AND price >= ${minPrice}`
    }
  }
  if (maxPrice) {                                  // +1
    if (!isNaN(maxPrice)) {                        // +1
      query += ` AND price <= ${maxPrice}`
    }
  }
  if (inStock === 'true') {                        // +1
    query += ' AND stock > 0'
  }
  if (search) {                                    // +1
    query += ` AND name LIKE '%${search}%'`
  }
  if (brand) {                                     // +1
    query += ` AND brand = '${brand}'`
  }
  if (rating) {                                    // +1
    if (!isNaN(rating)) {                          // +1
      query += ` AND rating >= ${rating}`
    }
  }
  if (sort === 'price_asc') {                      // +1
    query += ' ORDER BY price ASC'
  } else if (sort === 'price_desc') {              // +1
    query += ' ORDER BY price DESC'
  } else if (sort === 'rating') {                  // +1
    query += ' ORDER BY rating DESC'
  }
  // Total: 14 → HIGH finding, −8 penalty
})
```

## Refactoring Guidance for HIGH/CRITICAL Functions

### Strategy 1: Extract filter builders
```js
// Before: one massive function
// After:
function buildPriceFilter(query, minPrice, maxPrice) { ... }
function buildSearchFilter(query, search, brand) { ... }
function buildSortClause(sort) { ... }
```

### Strategy 2: Use strategy/lookup pattern
```js
const sortMap = {
  price_asc: 'ORDER BY price ASC',
  price_desc: 'ORDER BY price DESC',
  rating: 'ORDER BY rating DESC'
}
query += sortMap[sort] || ''
```
