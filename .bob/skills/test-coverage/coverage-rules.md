# Coverage Rules — ShipSafe Scoring Model

## Coverage Percentage Thresholds

| Coverage % | Base Contribution | Rating |
|---|---|---|
| 90–100% | 63–70 pts | ✅ Excellent |
| 75–89% | 52–62 pts | ✅ Good |
| 60–74% | 42–51 pts | ⚠️ Acceptable |
| 40–59% | 28–41 pts | ⚠️ Concerning |
| 20–39% | 14–27 pts | 🔴 Poor |
| 0–19% | 0–13 pts | 🔴 Critical Gap |

Coverage contribution = `coverage_percent × 0.70`

## Completeness Bonus (max +30 points)

### Security Tests (+5 each, max 15)
1. SQL injection attempt rejected (login endpoint)
2. Path traversal attempt rejected (file endpoint)
3. Authentication bypass attempt rejected
4. Unauthenticated access to protected route returns 401/403
5. Invalid/expired JWT returns 401

### Business Logic Tests (+3 each, max 9)
1. Negative amount in order creation rejected
2. Out-of-stock product cannot be ordered
3. Duplicate registration returns appropriate error

### Error Path Tests (+2 each, max 6)
1. Missing required fields return 400
2. Invalid ID returns 404
3. Malformed JSON body returns 400

## What Makes a Good Test (vs. Worthless Test)

### ✅ Good Test
```js
test('SQL injection in login is rejected', async () => {
  const res = await request(app)
    .post('/api/users/login')
    .send({ username: "' OR 1=1 --", password: 'x' })
  expect(res.status).toBe(400)         // specific status
  expect(res.body.token).toBeUndefined() // no token issued
})
```

### ❌ Worthless Test
```js
test('login works', async () => {
  const res = await request(app).post('/api/users/login').send({})
  expect(res.status).toBeDefined()  // status is ALWAYS defined — tests nothing
})
```

## Untested Files
Any source file with 0% test coverage is a HIGH finding.
List each file with its estimated risk (based on what it does):
- Auth/login routes with 0% = CRITICAL
- Admin routes with 0% = CRITICAL  
- Financial routes with 0% = HIGH
- Utility/helper files with 0% = MEDIUM
