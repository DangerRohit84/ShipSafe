# ShipSafe — Dangerous Code Pattern Library
# (Semgrep-style rules expressed as readable patterns for Bob's analysis)

---

## RULE: sql-injection-string-concat
**Severity:** CRITICAL
**Pattern (JavaScript):**
```
$VAR = `... ${$USER_INPUT} ...`
db.get($VAR, ...)
db.run($VAR, ...)
db.all($VAR, ...)
```
**Also catches:**
```
"SELECT * FROM " + variable
'WHERE id = ' + req.params.id
`WHERE username = '${req.body.username}'`
```
**Safe pattern:**
```js
db.get('SELECT * FROM users WHERE username = ?', [username], callback)
```

---

## RULE: hardcoded-secret
**Severity:** CRITICAL
**Pattern:**
```
const JWT_SECRET = '<string literal>'
const DB_PASSWORD = '<string literal>'
const API_KEY = '<string literal>'
const SECRET = '<string literal>'
```
**Triggers if** value is a string literal (not `process.env.X`)
**Safe pattern:**
```js
const JWT_SECRET = process.env.JWT_SECRET
```

---

## RULE: path-traversal
**Severity:** HIGH
**Pattern:**
```js
path.join(__dirname, <path>, req.query.<field>)
path.join(__dirname, <path>, req.params.<field>)
path.resolve(<path>, userInput)
fs.readFile(req.query.file, ...)
```
**Safe pattern:**
```js
const safeName = path.basename(req.query.file)
const allowedDir = path.resolve(__dirname, '../uploads')
const filePath = path.join(allowedDir, safeName)
if (!filePath.startsWith(allowedDir)) return res.status(403).send('Forbidden')
```

---

## RULE: jwt-no-expiry
**Severity:** HIGH
**Pattern:**
```js
jwt.sign(payload, secret)
jwt.sign(payload, secret, {})
```
**Triggers when** no `expiresIn` option is present
**Safe pattern:**
```js
jwt.sign(payload, secret, { expiresIn: '1h', algorithm: 'HS256' })
```

---

## RULE: error-detail-leakage
**Severity:** MEDIUM
**Pattern:**
```js
res.status(500).json({ error: err.message })
res.status(500).json({ error: err.stack })
res.send(err.toString())
```
**Safe pattern:**
```js
console.error('DB error:', err)
res.status(500).json({ error: 'Internal server error' })
```

---

## RULE: secret-in-log
**Severity:** MEDIUM
**Pattern:**
```js
console.log(`... ${DB_PASSWORD} ...`)
console.log(`... ${JWT_SECRET} ...`)
console.log(`... ${API_KEY} ...`)
console.log(password)
```

---

## RULE: missing-auth-middleware
**Severity:** HIGH
**Heuristic:** Routes matching these patterns with NO auth middleware call above them:
```
router.get('/admin', ...)
router.get('/all', ...)
router.delete('/', ...)
router.put('/:id', ...)
```
**Safe pattern:**
```js
router.get('/all', authenticate, authorize('admin'), (req, res) => { ... })
```

---

## RULE: plain-text-password-storage
**Severity:** CRITICAL
**Pattern:**
```js
INSERT INTO users ... VALUES (... password ...)
// where password is NOT the result of bcrypt.hash()
```

---

## RULE: returned-sensitive-fields
**Severity:** HIGH
**Pattern:**
```js
res.json(user)          // full DB row with password hash
res.json({ token, user }) // token + full user object
```
**Safe pattern:**
```js
const { password, ...safeUser } = user
res.json({ token, user: safeUser })
```

---

## RULE: missing-input-validation
**Severity:** MEDIUM
**Pattern:**
```js
const { username, email, password } = req.body
// No validation before use
db.run(...)
```
