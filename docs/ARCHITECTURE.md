# Eventra — System Overview

> What the site is, what it is built from, and how the whole thing works end to end.
> For features and a click-by-click demo script, see [`README.md`](./README.md).

---

## 1. What Eventra Is

Eventra is a **campus event operations and zero-trust check-in system**. It has two audiences sharing one database:

| Portal | URL | Who | What they do |
|---|---|---|---|
| **Gateway** | `/` | Everyone | Sign up / sign in, pick a role (`student` or `management`) |
| **Student Portal** | `/student` | Students | Browse events, register, carry a rotating QR pass, enroll / update / withdraw their face scan |
| **Management Suite** | `/management` | Event staff | Create events, run the face-scan gate, watch a live check-in feed, review security alerts, export CSV |

The core problem it solves: **one person cannot be in two places at once, and a screenshot of a ticket cannot be reused.** Every check-in is backed by a live biometric scan, a time-boxed signed QR token, and a set of server-side rules that reject replay, spoofing, duplicate entry, and overlapping-event clashes.

---

## 2. Tech Stack

### Core

| Layer | Technology | Version | Why it is here |
|---|---|---|---|
| Framework | **Next.js** (App Router, Turbopack) | 16.4.0 | One codebase for React pages **and** server API routes; `cacheComponents` + partial prefetching for fast navigation |
| UI runtime | **React** + **React DOM** | 19.3.0 | Component model, hooks, `use client` islands |
| Language | **TypeScript** | 5 | Types across models, routes, and context |
| Styling | **Tailwind CSS** (via `@tailwindcss/turbopack`) | 4 | Utility-first styling for the *Obsidian Glass* design system |
| Database | **MongoDB Atlas** + **Mongoose** | 9.11.1 | Document store for users, events, registrations, check-ins, alerts |
| Authentication | **jsonwebtoken** + **bcryptjs** | 9 / 3 | Stateless JWT sessions (7 days), bcrypt password hashing (10 salt rounds) |

### Biometrics & Security

| Technology | Version | Role |
|---|---|---|
| **`@vladmandic/face-api`** | 1.7.15 | In-browser neural face detection, 68-point landmarks, and 128-D descriptors. Model weights are **self-hosted** under `/public/models` — no face data leaves the browser |
| **`@aws-sdk/client-rekognition`** | 3.1149.0 | Optional server-side matching (`IndexFaces` / `SearchFacesByImage`) when `FACE_RECOGNITION_PROVIDER=aws` |
| **Face++ / Luxand.cloud** | — | Two further optional server-side providers, selected by the same env var |
| Node `crypto` | built-in | HMAC-SHA256 signing of the rotating QR pass, nonce generation, Haversine geofence maths |

### Presentation

| Technology | Version | Role |
|---|---|---|
| **framer-motion** | 14 | Modal transitions, entrance animations, ticket flip |
| **lucide-react** | 1.53 | Icon set |
| **qrcode.react** | 4.2 | Renders the digital pass QR |
| **canvas-confetti** | 1.9.4 | Registration success celebration |

### Tooling

`typescript` · `eslint` 9 + `eslint-config-next` · `next dev` / `next build` / `next start`

---

## 3. Project Structure

```
event_registration/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Gateway: signup + login, role selector
│   │   ├── student/page.tsx      # Student portal shell
│   │   ├── management/page.tsx   # Management suite shell
│   │   └── api/                  # 22 route handlers (see §7)
│   │
│   ├── components/               # 26 components
│   │   ├── Biometrics/           #   2 camera modals (enroll + gate)
│   │   ├── StudentPortal/        #   7 — ticket, carousel, auth, headers
│   │   ├── ManagementDashboard/  #   13 — feed, security, metrics, forms
│   │   └── *.tsx                 #   Providers, toasts, nav, demo toolbar
│   │
│   ├── context/
│   │   └── EventSystemContext.tsx  # Single client-side store (714 lines)
│   │
│   ├── lib/                      # 9 modules
│   │   ├── auth.ts               #   JWT sign/verify, bcrypt, getAuthUser()
│   │   ├── db.ts                 #   connectToDatabase() singleton
│   │   ├── biometrics.ts         #   face-api loader, liveness, embedding extraction
│   │   ├── faceVerification.ts   #   cosine/euclidean match + terminal rate limiting
│   │   ├── cloudFaceProvider.ts  #   Face++ / Luxand / AWS adapter
│   │   ├── passToken.ts          #   rotating QR HMAC + Haversine
│   │   ├── types.ts              #   shared client types
│   │   ├── seed.ts               #   demo data generator
│   │   └── mockData.ts           #   initial UI constants
│   │
│   └── models/                   # 5 Mongoose schemas
│       ├── User.ts  Event.ts  Registration.ts
│       └── CheckIn.ts  SecurityAlert.ts
│
├── public/models/                # 12.9 MB face-api weights (14 files)
├── scripts/
│   ├── dns-override.cjs          # Preloaded DNS resolver fix (see §8)
│   └── test-biometrics.mjs       # End-to-end biometrics test (npm run test:biometrics)
├── next.config.ts
├── package.json
└── ARCHITECTURE.md               # ← this file
```

---

## 4. Data Model

Five collections. `User` is deliberately free of images — only a numeric vector.

### `User`
```
name, enrollmentNo*, university, email*, passwordHash, role        # student | management
faceEmbedding     [Number]   # 128-D vector, undefined until enrolled
embeddingSource   'neural' | 'heuristic' | 'legacy'                # which extractor produced it
faceProvider      'face-api' | 'facepp' | 'luxand' | 'aws'
faceProviderId    String     # external ID when a cloud provider is used
biometricConsent  Boolean, biometricConsentDate, faceUpdatedAt
deviceId          String     # hardware lock, bound on first pass request
department, enrolledYear                                                (* = unique index)
```

### `Event`
`name, category, startTime, endTime, venue, lat, lng, radiusMeters (default 50), capacity, accentColor, createdBy`

### `Registration`
`userId, eventId, status ('Registered' | 'Confirmed' | 'Cancelled'), ticketId* (unique), seatTier`

### `CheckIn` — append-only audit log
`userId, eventId, result ('verified' | 'flagged' | 'denied'), reason, method ('face' | 'qr' | 'rapid' | 'manual'), timestamp, expiresAt`

### `SecurityAlert` — append-only incident log
`userId?, eventId, type, note, timestamp, expiresAt`

> `expiresAt` on both logs is `event.endTime + 2h`, and `POST /api/events/cleanup` purges rows past it — automatic data retention.

---

## 5. How It Works — The Main Flows

### 5.1 Authentication

```
POST /api/auth/signup
  → validate name/enrollmentNo/university/email/password
  → uniqueness check on email (lowercased) and enrollmentNo (uppercased)
  → bcrypt.hash(password, 10)
  → User.create({ role })
  → signToken({ userId, enrollmentNo, email, role, name }, '7d')

POST /api/auth/login  { identifier, password }
  → findOne({ $or: [{ email: lower }, { enrollmentNo: upper }] })
  → bcrypt.compare
  → signToken(...)

Client stores JWT in localStorage['eventra_token']
Every protected call sends  Authorization: Bearer <jwt>
Route handlers read it with getAuthUser(req)  → TokenPayload | null
```

`getAuthUser` accepts the header **or** a `?token=` query param (used for CSV export links).

### 5.2 Student: register → get a pass

```
POST /api/registrations            → Registration{ status:'Registered', ticketId:'EVT-...' }
POST /api/pass/token               → the rotating QR pass
```

`/api/pass/token` runs three checks **before** issuing a token:

1. **Device lock** — if the user has no `deviceId`, bind this one; if it differs, return `deviceStatus: 'mismatch'`.
2. **Geofence** — `calculateHaversineDistance(userLat, userLng, event.lat, event.lng)` against `event.radiusMeters`; returns `verified` / `outside` / `unavailable`.
3. **Registration** — must be `Registered` or `Confirmed` for *this* event.

Then it mints the pass:

```
payload = userId:eventId:enrollmentNo:window:nonce
hmac    = HMAC-SHA256(payload, JWT_SECRET).base64url[0:16]
token   = EVTRA:userId:window:nonce:hmac
```

`window = floor(now / 10000)` — a **10-second bucket**. The client re-requests every 10 s with a countdown ring, so a screenshot is worthless within seconds. Verification allows **±1 window** for network jitter, and the nonce defeats replay.

### 5.3 Student: face enrollment (liveness-gated)

Everything happens **in the browser**; only a number vector is uploaded.

```
getUserMedia({ video: { facingMode:'user', 640x480 } })
   └─ stream attached by a use effect keyed on [stream], so the <video>
      inside AnimatePresence is mounted first          ← camera-preview fix

loadBiometricModels()          → face-api weights from /public/models
analyzeFaceWithNeuralNet()     → detection + 68 landmarks
   ├─ calculateEyeAspectRatio()   → blink (liveness)
   └─ calculateHeadYawRatio()     → head turn (liveness)
extractBiometricEmbedding()    → { embedding: number[128], source: 'neural' | 'heuristic' }
captureFrameAsBase64()         → only sent when a cloud provider is active

POST /api/auth/face-enroll
  body: { faceEmbedding, embeddingSource, imageBase64?, livenessVerified, biometricConsent }
  → validates embeddingSource is one of the known values
  → persists faceEmbedding, embeddingSource, faceProvider, faceUpdatedAt,
             biometricConsent, biometricConsentDate
  → if cloud provider active: enrollFaceWithCloudProvider() → faceProviderId
```

**The `embeddingSource` tag is load-bearing.** Neural descriptors and the older luminance-grid heuristic live in *different vector spaces* — comparing them produces meaningless numbers. The tag makes the gate refuse rather than guess (see §5.4).

**Consent withdrawal** — `DELETE /api/auth/consent` unsets `faceEmbedding`, `faceProviderId`, `faceProvider`, `embeddingSource`, `faceUpdatedAt`, `biometricConsentDate` and sets `biometricConsent: false`. Account, registrations, and QR pass all stay active.

### 5.4 Management: the face-scan gate

`POST /api/checkin/verify-face` is a **decision ladder** — the first failing rung returns, and *every* rejection is written to `CheckIn` (plus `SecurityAlert` for the serious ones).

```
 0. Auth: Bearer token AND role === 'management'        else 403
 1. Rate limit: terminal key, 5 failures → 60 s lockout   else 429
 2. Liveness failed?                      → flagged   "Spoof or fake face detected"        + alert
 3. Empty embedding?                      → denied    "Face not recognised"
 4. MATCH — two independent paths:
      A. cloud image mode  → verifyFaceWithCloudProvider(imageBase64, faceProviderId)
         for students whose faceProvider === active cloud provider
      B. local vector mode → isBiometricMatch(scan, stored) over students where
            faceProvider matches  AND  embeddingSource matches the scan's source
         no comparable students?            → denied  "Biometric template incompatible
                                                      with gate scanner"     ← refuses to guess
         no match?                          → denied  "Face not recognised"
 5. Presented an enrollment number?        must equal the matched face
                                          → flagged   "Face does not match the ID presented"  + alert
 6. Registered for THIS event?            → denied    "Registered for a different event"
                                                    / "Not registered for this event"
 7. Timing: within [start − 2h, end]?      → denied    "Event not started / already ended"
 8. Already verified for this event?       → alreadyCheckedIn  (no second row written)
 9. Overlapping event active?              → flagged   "Same ID active in another overlapping event" + alert
10. PASS → CheckIn{ result:'verified' }, Registration → 'Confirmed'
```

**Match thresholds** (`src/lib/faceVerification.ts`):
`cosine ≥ 0.62` **OR** `euclidean ≤ 0.60`.

**Cloud vs. local** is decided by `FACE_RECOGNITION_PROVIDER`. `usesCloudImageProvider()` returns true only for `facepp` / `luxand` / `aws`; the built-in `face-api` path stays available so mixed deployments never lock out existing enrollments. If no provider is configured, verification **fails closed** — it never defaults to `matched: true`.

### 5.5 Other gate inputs

| Route | Method | Purpose |
|---|---|---|
| `POST /api/checkin/rapid` | management | High-throughput entry by enrollment number / ticket reference, no camera needed |
| `POST /api/checkin/flag-exception` | management | Manually flag an exception for review |
| `GET /api/checkin/feed` | management | Live verification stream (all / verified / flagged filters) |
| `GET /api/reports/export-csv` | management | Attendee CSV download |

### 5.6 Client state

`src/context/EventSystemContext.tsx` is the single client-side store, provided by `Providers.tsx`. It owns:

- auth (`currentUser`, `token`, `loginUser`, `logoutUser`, `deleteAccount`, `withdrawBiometricConsent`)
- the selected event + `refreshEvents()` / `refreshMyRegistrations()` / `refreshCheckIns()` / `refreshSecurityTelemetry()`
- the QR value, countdown, and refresh key
- geofence + device-lock status, metrics, security settings
- all modal open/close state and the toast queue

On mount it fetches `/api/events`, `/api/registrations/my`, `/api/checkin/feed`, and `/api/security/alerts` and polls them to drive the live dashboard.

---

## 6. Security Model

| Concern | Mechanism | Where |
|---|---|---|
| Password storage | bcrypt, 10 salt rounds | `lib/auth.ts` |
| Session | JWT, 7-day expiry, `HS256` | `lib/auth.ts` |
| Authorization | Per-route `role !== 'management'` guard → `403` | every gate route |
| Pass integrity | HMAC-SHA256 over user+event+window+nonce | `lib/passToken.ts` |
| Pass replay | 10-second window, ±1 tolerance, random nonce | `lib/passToken.ts` |
| Geofence | Server-side Haversine vs `event.radiusMeters` | `api/pass/token` |
| Device lock | `deviceId` bound on first use, mismatch reported | `api/pass/token` |
| Spoofing | Landmark EAR blink + head-yaw liveness | `lib/biometrics.ts` |
| Brute force | 5 failed scans → 60-second terminal lockout (in-memory) | `lib/faceVerification.ts` |
| Cross-extractor fraud | `embeddingSource` tag; refuse instead of guessing | `api/checkin/verify-face` |
| Duplicate entry | Existing verified check-in short-circuits, no 2nd row | `api/checkin/verify-face` |
| Overlap clash | Cross-event active check-in detection → flagged + alert | `api/checkin/verify-face` |
| Data retention | `expiresAt = event.endTime + 2h`, purge on cleanup | `api/events/cleanup` |
| Privacy | Only a 128-D vector stored; images never persisted | `lib/biometrics.ts` |

---

## 7. API Reference

`auth` column: `public` = no token · `user` = any valid JWT · `mgmt` = `role === 'management'`

| Route | Methods | Auth | Purpose |
|---|---|---|---|
| `/api/auth/signup` | POST | public | Create account |
| `/api/auth/login` | POST | public | Issue JWT |
| `/api/auth/me` | GET | user | Current user profile |
| `/api/auth/face-enroll` | POST | user | Store first face template |
| `/api/auth/update-face` | POST | user | Re-enroll face (password re-entry) |
| `/api/auth/consent` | DELETE | user | Withdraw biometric consent |
| `/api/auth/account` | DELETE | user | Delete account |
| `/api/events` | GET, POST | public / mgmt | List events · create event |
| `/api/events/[id]` | GET, PUT, DELETE | public / mgmt | Read · update · delete an event |
| `/api/events/cleanup` | GET, POST | mgmt | Purge expired check-ins & alerts |
| `/api/registrations` | POST | user | Register for an event |
| `/api/registrations/my` | GET | user | My registrations |
| `/api/registrations/cancel` | POST | user | Cancel a registration |
| `/api/registrations/attendees` | GET | mgmt | Attendee list for an event |
| `/api/pass/token` | POST | user | Mint the rotating QR pass |
| `/api/checkin/verify-face` | POST | mgmt | Face-scan gate (§5.4) |
| `/api/checkin/rapid` | POST | mgmt | Rapid gate check-in |
| `/api/checkin/flag-exception` | POST | mgmt | Flag an exception |
| `/api/checkin/feed` | GET | mgmt | Live check-in stream |
| `/api/security/alerts` | GET | mgmt | Security alert feed |
| `/api/reports/export-csv` | GET | mgmt | Attendee CSV export |
| `/api/seed` | GET, POST | public | Load demo data |

---

## 8. Environment & Configuration

`.env.local` (git-ignored) — see `.env.example` for the template:

```bash
MONGODB_URI=mongodb+srv://...      # Atlas connection string
JWT_SECRET=...                     # signs both JWTs and QR pass HMACs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 'face-api' (default, built-in) | 'facepp' | 'luxand' | 'aws'
FACE_RECOGNITION_PROVIDER=face-api
FACEPP_API_KEY=  FACEPP_API_SECRET=  LUXAND_API_KEY=
AWS_ACCESS_KEY_ID=  AWS_SECRET_ACCESS_KEY=  AWS_REGION=
AWS_REKOGNIITION_COLLECTION_ID=eventra-attendees
```

### Commands

```bash
npm run dev              # development server (preloads the DNS fix)
npm run build            # production build
npm run start            # production server (preloads the DNS fix)
npm run lint             # eslint
npm run test:biometrics  # end-to-end DB + biometrics test suite
```

### The DNS preload — why `dev` is not just `next dev`

`scripts/dns-override.cjs` is loaded with `node --require` **before any module initialises**:

```jsonc
"dev": "node --require ./scripts/dns-override.cjs node_modules/next/dist/bin/next dev"
```

It calls `dns.setServers(['8.8.8.8', '1.1.1.1'])` so `mongodb+srv://` SRV lookups resolve on machines whose default resolver is `127.0.0.1` and refuses connections. Applying this from application code (`src/lib/db.ts`) does **not** work under Turbopack: the bundled driver gets its own `dns` instance, so the override never reaches mongoose. Running it as a process preload guarantees it lands on the real `node:dns` before anything else.

---

## 9. Request Lifecycle (one picture)

```
Browser ── React page (use client)
   │        EventSystemContext  ── localStorage JWT
   │
   ├─ GET  /api/events ─────────────────┐
   ├─ POST /api/pass/token              │
   ├─ POST /api/auth/face-enroll        │     Next.js route handler
   ├─ POST /api/checkin/verify-face ────┤  →  getAuthUser()      (JWT + role guard)
   │                                    │  →  connectToDatabase() (mongoose singleton)
   └─ ...                               │  →  business rules / biometric match
                                        │  →  CheckIn + SecurityAlert writes
                                        ▼
                                   MongoDB Atlas
```

---

## 10. Known Issues / Operational Notes

1. **Hardcoded Atlas credentials.** `src/lib/db.ts:6` contains a real `mongodb+srv://` URI with a username and password, committed in `ed605e2`. Rotate that database user's password before this repository is made public, then replace the fallback with a `MONGODB_URI`-only lookup and rewrite git history.
2. **Rate limiting is in-memory.** `faceVerification.ts` uses a `Map`, so lockout state resets on restart and is not shared across instances. Fine for a single-process dev server; needs Redis for horizontal scaling.
3. **JWT secret has a hardcoded fallback** in `auth.ts` and `passToken.ts`. Set `JWT_SECRET` explicitly in every environment.
4. **Face-api model weights are 12.9 MB** committed under `public/models/`. First page load fetches them lazily when a modal opens, not on initial paint.
5. **Camera preview** requires the browser to grant localhost camera access — check the padlock → Camera → Allow if the preview is black.
