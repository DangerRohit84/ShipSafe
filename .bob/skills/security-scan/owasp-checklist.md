# OWASP Top 10 — ShipSafe Scanning Checklist

Reference: OWASP Top 10 2021 (https://owasp.org/Top10/)

---

## A01:2021 — Broken Access Control
**What to check:**
- [ ] Admin or sensitive routes have authentication middleware
- [ ] Resource endpoints verify requesting user owns the resource (anti-IDOR)
- [ ] No `SELECT * FROM table` without user ownership filter
- [ ] DELETE/UPDATE endpoints verify ownership before executing

**Code patterns that FAIL:**
```js
// FAIL — no auth check on admin route
router.get('/all', (req, res) => { db.all('SELECT * FROM users', ...) })

// FAIL — IDOR: returns any user's order by ID with no ownership check
router.get('/orders/:id', (req, res) => { db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], ...) })
```

---

## A02:2021 — Cryptographic Failures
**What to check:**
- [ ] Passwords stored with bcrypt/argon2 (NOT plain text, NOT md5/sha1)
- [ ] JWT secrets are environment variables, not string literals
- [ ] JWT tokens have `expiresIn` set
- [ ] No sensitive data returned in API responses (password hashes, tokens)
- [ ] HTTPS enforced (check for HTTP-only redirects or HSTS header)

**Code patterns that FAIL:**
```js
// FAIL — plain text password storage
db.run(`INSERT INTO users (password) VALUES ('${password}')`)

// FAIL — hardcoded JWT secret, no expiry
const token = jwt.sign({ userId }, 'supersecret123')

// FAIL — returns full user object including password
res.json({ token, user })
```

---

## A03:2021 — Injection
**What to check:**
- [ ] ALL SQL queries use parameterized queries / prepared statements
- [ ] No string concatenation or template literals in SQL queries
- [ ] No `eval()` with user input
- [ ] No `child_process.exec()` with user input
- [ ] File paths are sanitized (path.normalize + allowlist check)

**Code patterns that FAIL:**
```js
// FAIL — SQL injection (string concat)
const query = `SELECT * FROM users WHERE username = '${username}'`

// FAIL — SQL injection (template literal)
db.get(`SELECT * FROM products WHERE category = '${req.query.category}'`)

// FAIL — Path traversal
const filePath = path.join(__dirname, '../uploads/', req.query.file)
res.sendFile(filePath)
```

---

## A04:2021 — Insecure Design
**What to check:**
- [ ] Business logic validates all amounts are positive (financial operations)
- [ ] Stock is checked before order creation
- [ ] No negative pricing exploits possible
- [ ] Rate limiting on sensitive endpoints

---

## A05:2021 — Security Misconfiguration
**What to check:**
- [ ] `helmet` middleware is installed and used
- [ ] CORS is explicitly configured (not `*` in production)
- [ ] Error handlers do NOT send stack traces or DB error messages to client
- [ ] No default framework error pages exposed
- [ ] `X-Powered-By` header disabled

**Code patterns that FAIL:**
```js
// FAIL — exposes DB error to client
db.get(query, (err, row) => {
  if (err) return res.status(500).json({ error: err.message })
})

// FAIL — no helmet
const app = express()
app.use(express.json())
// missing: app.use(helmet())
```

---

## A06:2021 — Vulnerable and Outdated Components
**What to check:**
- [ ] `npm audit` — are there HIGH or CRITICAL CVEs?
- [ ] Dependencies are not severely outdated (> 2 major versions behind)
- [ ] No known-vulnerable package versions

---

## A07:2021 — Identification and Authentication Failures
**What to check:**
- [ ] Auth tokens expire (JWT expiresIn set)
- [ ] Login endpoint has rate limiting
- [ ] Failed login attempts are counted (brute force protection)
- [ ] Password strength requirements enforced

---

## A08:2021 — Software and Data Integrity Failures
**What to check:**
- [ ] No unsigned/unverified data deserialized as trusted
- [ ] JWT algorithm explicitly set (never `alg: none`)

---

## A09:2021 — Security Logging and Monitoring Failures
**What to check:**
- [ ] Auth failures are logged (with timestamp, IP — NOT password)
- [ ] Admin actions are logged
- [ ] Logs do NOT contain passwords, tokens, or secrets

**Code patterns that FAIL:**
```js
// FAIL — logs secret to console
console.log(`DB Password: ${DB_PASSWORD}`)
```

---

## A10:2021 — Server-Side Request Forgery
**What to check:**
- [ ] Any endpoint that fetches a URL: is the URL validated against an allowlist?
- [ ] Webhook URLs are validated
