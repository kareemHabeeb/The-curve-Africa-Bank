# Node.js Backend Agent Specification

Use this document to implement a **Node.js REST API** that replaces the in-browser Redux logic in `src/redux/usersSlice.js`. The React + Vite frontend (`class` project) currently stores users, accounts, balances, and transactions in **redux-persist** (localStorage). Your job is to persist that data on the server and expose endpoints the frontend can call instead of local reducers.

---

## 1. Project context

| Item | Detail |
|------|--------|
| Frontend | React 19, Redux Toolkit, react-router-dom, axios (already in `package.json`) |
| Current state | `usersSlice` — no real backend; passwords stored in plain text in persisted state |
| Currency UI | Nigerian Naira (`₦`) in dashboard |
| Goal | Backend folder (e.g. `server/` or sibling repo) with Express (or Fastify), database, JWT auth |

After the API exists, the frontend will be updated separately to use `axios` + async thunks; **match the contracts below** so that migration is straightforward.

---

## 2. Domain models

### 2.1 User

```ts
{
  id: number | string;        // frontend uses Date.now() on signup; use DB id or UUID on server
  fullName: string;
  email: string;              // unique
  password: string;           // NEVER return in API responses; hash with bcrypt
  amountAllowable?: number;   // optional cap for opening additional accounts (see §5.6)
  accounts: Account[];
  transactions: Transaction[]; // user-level ledger (see §5.4)
}
```

### 2.2 Account

```ts
{
  id: number | string;
  accountNumber: string;      // format: "ACC" + 6 digits, e.g. ACC482917 (9 chars total)
  accountName: string;
  balance: number;
}
```

### 2.3 Transaction

```ts
{
  id: number | string;
  type: "debit" | "credit";
  amount: number;
  memo: string;
  date: string;               // ISO 8601, e.g. new Date().toISOString()
}
```

### 2.4 Sign-up defaults (mirror `SignUp.jsx`)

On registration, create **one** account:

- `accountName`: `"Main Account"`
- `balance`: `200000`
- `accountNumber`: generate `ACC${random 6-digit}` (100000–999999)
- `transactions`: `[]`
- Do **not** set `amountAllowable` until the user adds a second account (see §5.6)

---

## 3. Validation rules (from frontend)

Reuse these rules on the server (Zod or express-validator):

**Sign up**

- `email`: valid email
- `password`: min 8 chars, must include uppercase, lowercase, digit, special char  
  Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/`
- `fullName`: min 2 characters
- `confirmPassword` must match `password` (validate on signup route only)

**Login**

- `email`, `password` required

**Transfer**

- `amount` > 0
- `recipientAccountNumber`: 9 characters (frontend only resolves recipient when length === 9)
- Sender must be authenticated; cannot transfer to own account if product forbids it (optional)

**Add account**

- `accountName`: non-empty string
- `amount`: number ≥ 0; subject to allowance rules in §5.6

---

## 4. API endpoints

Base path suggestion: `/api/v1`. All protected routes require `Authorization: Bearer <accessToken>`.

### 4.1 Auth

| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| `POST` | `/auth/signup` | No | `{ fullName, email, password, confirmPassword }` | `201` + user (no password) + tokens optional | `409` email exists, `400` validation |
| `POST` | `/auth/login` | No | `{ email, password }` | `200` + user + `accessToken` (and optional `refreshToken`) | `401` invalid credentials |
| `POST` | `/auth/logout` | Yes | — | `200` message | `401` |
| `GET` | `/auth/me` | Yes | — | `200` current user with accounts & transactions | `401` |

**Login behavior (mirror `logIn` reducer):**

- Find user by email; verify password with bcrypt.
- Return full user object the dashboard expects (accounts, transactions).
- Frontend today sets `loggedInUser` to the matched user and shows alert "Login successful" / "Invalid email or password" — return JSON messages instead of `alert()`.

**Logout behavior (mirror `logOut`):**

- Invalidate refresh token / session if used; client clears token and `loggedInUser`.

---

### 4.2 User lifecycle

| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| `DELETE` | `/users/:userId` | Yes (own user or admin) | — | `200` "Account deleted successfully" | `403`, `404` |

**Delete account (mirror `deleteAccount`):**

- Remove user and cascade delete accounts and transactions (or soft-delete).
- Frontend also dispatches `logOut` and navigates to `/signup` after delete.

---

### 4.3 Accounts

| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| `POST` | `/accounts` | Yes | `{ accountName, amount }` | `201` + new account | `400` allowance exceeded |
| `GET` | `/accounts` | Yes | — | `200` list for logged-in user | `401` |
| `GET` | `/accounts/:accountNumber` | Yes | — | `200` account + owner `fullName` (for transfer UI lookup) | `404` |

**Lookup by account number (mirror `DashBoardLeft.findUserbyAccountNumber`):**

- When recipient field reaches 9 characters, frontend resolves recipient name and account name.
- Expose: `GET /accounts/lookup/:accountNumber` → `{ userId, fullName, accountName, accountNumber }`  
  Do not expose balance to unauthenticated callers; authenticated sender may see masked info only if needed.

---

### 4.4 Transfers

| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| `POST` | `/transfers` | Yes | See below | `200` updated balances + transaction ids | `400` insufficient balance, `404` accounts |

**Request body (mirror `transferFunds` payload):**

```json
{
  "senderAccountId": 1,
  "recipientAccountNumber": "ACC123456",
  "recipientUserId": 2,
  "amount": 5000,
  "memo": "Rent"
}
```

Note: Redux uses typo `reciepientID` — accept `recipientUserId` in API (camelCase standard).

**Server-side transfer algorithm (mirror `transferFunds` reducer):**

1. Load sender user by JWT `userId` (ignore client-sent `userID` except for audit).
2. Find sender account by `senderAccountId`; ensure it belongs to sender.
3. If `senderAccount.balance <= amount` → `400` `{ message: "Insufficient balance" }` (frontend used `alert`).
4. Find recipient user by `recipientUserId` and account by `recipientAccountNumber`.
5. In a **DB transaction**:
   - Debit sender account balance.
   - Credit recipient account balance.
   - Append transaction on sender: `{ type: "debit", amount, memo, date }`.
   - Append transaction on recipient: `{ type: "credit", amount, memo, date }`.
6. Return `{ message: "Funds transferred successfully", senderAccount, recipientAccount }`.

**Frontend quirk:** Redux also decrements `state.loggedInUser.balance`, but signup never sets a top-level `balance` on the user — only per-account balances. The API should use **account-level balance only**; when returning `GET /auth/me`, optionally include `totalBalance` as sum of accounts for the dashboard.

**Transaction IDs:** Frontend uses `id: transactions.length + 1`. Use auto-increment or UUID in the database.

---

### 4.5 Transactions history

| Method | Path | Auth | Query | Success |
|--------|------|------|-------|---------|
| `GET` | `/transactions` | Yes | optional `accountId` | `200` array for logged-in user |

Mirror `DashBoardRight`: shows `user.transactions` (user-level array), not per-account. Store transactions at **user level** as in current Redux, unless you refactor to per-account ledgers (if so, document and return the same shape the UI expects).

---

## 5. Business logic details

### 5.1 Account number generation

```js
`ACC${Math.floor(100000 + Math.random() * 900000)}`
```

Ensure uniqueness in the database (unique index + retry on collision).

### 5.2 Insufficient balance

Same as reducer: transfer only if `senderAccount.balance > amount` (strictly greater in current code). Confirm with product; `>=` is more typical for exact balance transfers.

### 5.3 Recipient resolution

Frontend:

```js
users.find(user => user.accounts.some(a => a.accountNumber === accountNumber))
```

Backend: single query joining users and accounts by `accountNumber`.

### 5.4 Transaction ledger scope

Redux pushes debits to **sender user** and credits to **recipient user** `transactions` arrays. Both users get separate entries. Implement the same.

### 5.5 Delete user

`deleteAccount(userID)` removes user from `signedUpUsers` array. Cascade all related data.

### 5.6 Add new account — allowance rules (mirror `addNewAccount`)

Logic from `usersSlice.js`:

**Case A — `amountAllowable` is unset/falsy (first extra account after Main):**

1. Let `balance = user.accounts[0].balance` (first account).
2. `allowableValue = 500000 - balance`.
3. If `amount < allowableValue`:
   - Create account with given `accountName`, `balance: amount`, new `accountNumber`.
   - Set `user.amountAllowable = 500000 - (allowableValue + amount)`  
     (equivalently: `amountAllowable = balance + amount` after first add — verify against intended cap of ₦500,000 total across new-account deposits).
4. Else: reject with message `Your allowed amount is ${allowableValue}`.

**Case B — `amountAllowable` is set:**

1. If `amount < amountAllowable`: create account, decrement or update `amountAllowable` as appropriate.
2. Else: reject with allowance message.

**Bug in frontend:** second branch references undefined `allowableValue` in the alert. Backend should return a clear `400` with `{ message, amountAllowable }`.

Implement allowance atomically in a transaction to prevent race conditions.

---

## 6. Security requirements

1. **Passwords:** bcrypt (cost 10–12); never log or return passwords.
2. **Auth:** JWT access token (15m–1h) + optional refresh token; store refresh tokens hashed if persisted.
3. **Authorization:** Users can only transfer from their accounts, delete themselves, and add accounts to themselves.
4. **Rate limiting** on login and signup.
5. **CORS:** allow frontend origin (Vite dev: `http://localhost:5173`).
6. **Input sanitization** on `memo`, `accountName`, `fullName`.
7. **Idempotency** optional for `POST /transfers` (Idempotency-Key header).

---

## 7. Suggested stack

| Layer | Recommendation |
|-------|----------------|
| Runtime | Node 20+ |
| Framework | Express 4 or Fastify |
| DB | PostgreSQL + Prisma, or MongoDB + Mongoose |
| Auth | `jsonwebtoken`, `bcrypt` |
| Validation | Zod (align with frontend Zod rules) |
| Env | `dotenv` — `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` |

### Suggested folder structure

```
server/
  src/
    index.js
    app.js
    config/
    middleware/     # auth, errorHandler, validate
    routes/
      auth.routes.js
      users.routes.js
      accounts.routes.js
      transfers.routes.js
    controllers/
    services/       # transfer, allowance, accountNumber
    models/         # or prisma/schema.prisma
  package.json
  .env.example
```

---

## 8. Response shape examples

### Sign up / Login success

```json
{
  "message": "Login successful",
  "accessToken": "eyJ...",
  "user": {
    "id": 1,
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "accounts": [
      {
        "id": 1,
        "accountNumber": "ACC482917",
        "accountName": "Main Account",
        "balance": 200000
      }
    ],
    "transactions": []
  }
}
```

### Transfer success

```json
{
  "message": "Funds transferred successfully",
  "debitTransaction": { "id": 1, "type": "debit", "amount": 5000, "memo": "Rent", "date": "2026-05-22T12:00:00.000Z" },
  "senderAccount": { "id": 1, "balance": 195000 },
  "recipientAccount": { "accountNumber": "ACC111222", "balance": 105000 }
}
```

### Error (consistent envelope)

```json
{
  "message": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE"
}
```

---

## 9. Frontend integration map

When the API is ready, replace Redux reducers with API calls:

| Redux action | HTTP call | Frontend files |
|--------------|-----------|----------------|
| `signUp` | `POST /auth/signup` | `src/page/Auth/SignUp.jsx` |
| `logIn` | `POST /auth/login` | `src/page/Auth/Login.jsx` |
| `logOut` | `POST /auth/logout` | `src/components/Header.jsx` |
| `transferFunds` | `POST /transfers` | `src/components/DashBoardLeft.jsx` |
| `deleteAccount` | `DELETE /users/:id` | `src/components/DashBoardRight.jsx` |
| `addNewAccount` | `POST /accounts` | `src/page/Dashboard/AddAcount.jsx` |

Store `accessToken` in memory or httpOnly cookie; keep `loggedInUser` in Redux from API responses. Remove or reduce `redux-persist` for sensitive banking data once the server is source of truth.

**Recipient lookup:** add API call in `DashBoardLeft` when `recipientAccountNumber.length === 9` instead of scanning `signedUpUsers` client-side.

---

## 10. Reference: current Redux reducers

Source of truth for behavior: `src/redux/usersSlice.js`

| Reducer | Payload | Notes |
|---------|---------|-------|
| `signUp` | full `userDetails` object | Pushes to `signedUpUsers` |
| `logIn` | `{ email, password }` | Sets `loggedInUser` |
| `logOut` | — | Clears `loggedInUser` |
| `transferFunds` | `{ userID, senderAccountID, recipientAccountNumber, reciepientID, amount, memo }` | Debits/credits + transactions |
| `deleteAccount` | `userID` | Splices from `signedUpUsers` |
| `addNewAccount` | `{ accountName, amount }` | Uses `loggedInUser.id`; allowance logic |

Initial Redux state:

```js
{ signedUpUsers: [], loggedInUser: null }
```

---

## 11. Deliverables checklist

- [ ] Express (or Fastify) app with routes in §4
- [ ] Database schema for users, accounts, transactions
- [ ] Migrations / seed script (optional demo user)
- [ ] bcrypt + JWT middleware
- [ ] Transfer and add-account logic with transactions (ACID)
- [ ] `.env.example` and README in `server/` with run instructions
- [ ] Postman collection or OpenAPI (`swagger`) spec
- [ ] Basic integration tests for signup, login, transfer, add account, delete user

---

## 12. Agent instructions

1. Create the `server/` package in this repo (or ask if a separate repo is preferred).
2. Implement all endpoints and business rules above; fix frontend typos in API naming (`recipientUserId`, not `reciepientID`).
3. Do not change the React app unless asked; only document breaking differences in `server/README.md`.
4. Use Nigerian Naira semantics only in messages if mirroring frontend alerts; amounts are plain numbers.
5. After implementation, provide example `curl` commands for each endpoint and the exact env vars required.

---

*Generated from `src/redux/usersSlice.js` and related components for backend agent handoff.*
