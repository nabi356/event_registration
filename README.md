# Eventra — Enterprise Campus Event Operations & Zero-Trust Check-in System

**Eventra** is an enterprise-grade digital event registration, dynamic verification, and biometric gate access operations platform designed for universities and academic institutions.

Built with an **Obsidian Glass** visual system, Eventra combines strict cryptographic verification, localized perimeter geofencing, hardware device binding, live browser facial biometric matching with liveness analysis, overlapping event clash detection, and sub-second multi-terminal synchronization.

> 📐 **Looking for how it all fits together?** See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the system overview, full tech stack, project structure, data model, the check-in decision ladder, and the security model — or open [`docs/Eventra-System-Overview.docx`](./docs/Eventra-System-Overview.docx) as a Word document. This README covers features and the demo walkthrough.

---

## Key Capabilities

### 1. Student Passholder Experience
* **Dynamic Holographic Pass**: Dual-sided digital ticket with hardware-accelerated 3D flip physics.
* **Rolling Cryptographic QR**: 10-second automatic token refresh with circular countdown timer preventing replay, screenshot, and duplication attacks.
* **Zero-Trust Perimeter Validation**: Localized 50m geofence validation confirming attendee proximity to the venue via GPS and Haversine calculations.
* **Hardware Device Lock**: Cryptographic device signature binding preventing multi-session badge duplication across phones.
* **First-Time Biometric Face Enrollment**: Privacy-preserving in-browser 128-dimensional biometric embedding generation using a real `@vladmandic/face-api` neural network, with a live webcam oval guide, genuine liveness analysis (68-point landmark Eye Aspect Ratio blink detection + head yaw turn detection), and a consent checkbox. **Only the mathematical embedding vector is stored — photographs or video feeds are never saved or transmitted.** Neural model weights are self-hosted from `/public/models`, so no face data leaves the browser.
* **Voluntary Face Scan Re-Enrollment**: Students can update their enrolled face scan at any time through their profile menu (requires password re-entry).
* **Biometric Consent Withdrawal**: Students can withdraw consent at any time from their profile menu, permanently deleting their facial template and vector embeddings while keeping their account, registrations, and dynamic QR pass fully active.
* **Real Event Registration**: Interactive event registration, pass cancellation, and wallet roster.

### 2. Operations & Gate Management Suite
* **Management Live Face Scan Gate**: Dedicated gate terminal screen with live webcam. Detects face, verifies liveness, matches embedding against enrolled students, and checks event registration in real time.
* **High-Visibility Result Panel**:
  * **VERIFIED (Green Tick)**: Attendee name, enrollment number, university, event name, entry timestamp. Automatically logs entry.
  * **UNVERIFIED (Red Cross)**: Identifies exact security reasons:
    * *"Face not recognised"*
    * *"Not registered for this event"*
    * *"Registered for a different event"*
    * *"Already checked in"*
    * *"Event not started / already ended"*
    * *"Spoof or fake face detected"*
    * *"Face does not match the ID presented"*
    * *"Same ID active in another overlapping event"*
  * **DUPLICATE ENTRY (Amber Warning)**: Attendee is already marked present for this event. The original attendance timestamp is preserved and no second record is written.
* **Extractor-Aware Matching**: Every stored template records which extractor produced it (`neural` or `heuristic`). The gate only ever compares like with like, and refuses cross-extractor comparisons outright rather than returning a random accept or reject. Untagged legacy records are treated as incompatible and require re-enrollment.
* **Pluggable Server-Side Face Providers**: The built-in `face-api` pipeline is the default, with optional Face++ (Megvii), Luxand.cloud, and AWS Rekognition integration for server-side image matching. All credentials are read from server-side environment variables and are never exposed to the browser.
* **Overlapping Event Clash Detection**: Identifies students attempting concurrent access to events with overlapping time windows. Blocks unauthorized access, makes live face scan mandatory, logs security alerts, and prevents simultaneous attendance.
* **Rapid Gate Check-in**: High-throughput gate terminal supporting live QR tokens, student enrollment numbers, and ticket references.
* **Live Verification Activity Stream**: Sub-second attendee check-in ingestion with instant status tags (All / Verified / Flagged filters).
* **Automated Data Retention (Auto-Clear)**: MongoDB TTL indexes automatically clear check-in records and security logs after event completion + grace period. Biometric embeddings are permanently deleted if an account is deleted.
* **Attendee CSV Export**: Complete roster export with real-time verification and attendance stamps.
* **Event Creation & Configuration**: Event parameters form with geofence coordinates (lat/lng/radius), capacity limits, and time windows.

---

## Environment Variables

Create a `.env.local` file in the root directory (refer to `.env.example`):

```bash
# MongoDB Connection String (MongoDB Atlas or Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/eventra

# JWT Authentication Secret Key
JWT_SECRET=eventra_super_secure_jwt_secret_key_2026_xyz987

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Face recognition provider: 'face-api' (default, built-in), 'facepp', 'luxand', or 'aws'
FACE_RECOGNITION_PROVIDER=face-api

# Optional cloud provider credentials (server-side only, leave empty for the default)
FACEPP_API_KEY=
FACEPP_API_SECRET=
LUXAND_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_REKOGNITION_COLLECTION_ID=eventra-attendees
```

---

## Getting Started

### Installation

```powershell
npm install
```

### Database Seeding

The application automatically seeds baseline demo data on first load if the database is empty, or you can invoke the seed endpoint directly:

```powershell
# Via API route
curl -X POST http://localhost:3000/api/seed
```

### Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```powershell
npm run build
npm run start
```

---

## Complete Demo Script & Testing Walkthrough

Follow this step-by-step walkthrough to test all features end-to-end:

### Step 1: User Signup & First-Time Face Enrollment
1. Open [http://localhost:3000](http://localhost:3000) and click **"Sign In"** in the top navigation bar.
2. Switch to the **"Sign Up"** tab.
3. Enter details:
   * **Full Name**: `Test Student`
   * **Enrollment ID**: `UNI-2026-9001`
   * **University**: `Apex Institute of Technology`
   * **Email**: `test.student@university.edu`
   * **Password**: `password123`
4. Click **"Create Account & Continue"**.
5. The **First-Time Face Biometric Enrollment** modal automatically opens:
   * Position your face inside the oval guide (status turns **Face Positioned**).
   * Follow the liveness checks: **Blink eyes** and **Slight head turn**.
   * Check the biometric privacy consent checkbox.
   * Click **"Enroll Biometric Face Scan"**.
   * Only the 128-d vector embedding is saved to the database.

### Step 2: Voluntary Face Scan Update
1. In the Student Portal header, click on your profile card.
2. Select **"Update face scan"**.
3. Re-enter your password (`password123`).
4. Re-scan your face with the oval guide and save. Notice that regular logins never ask for a face scan again unless voluntarily triggered.

### Step 3: Event Registration & Dynamic Pass Rotation
1. In the **Upcoming Events** carousel, click **"Register"** on *"AI & Future Technologies"*.
2. Select the event to view its **Campus Entry Token**.
3. Notice your real name, enrollment number, university, and ticket reference on the pass.
4. Click **"Show Secure QR"** to flip the 3D ticket:
   * Observe the 10-second circular countdown timer.
   * The server-signed cryptographic token updates every 10 seconds.
   * Device lock status shows *"Device Verified"*.
   * Location perimeter shows proximity status.

### Step 4: Management Live Face Scan Gate
1. Toggle the top navigation switch to **"Management"**.
2. Click **"Face Scan Entry"** (available in the Header, Sidebar, Live Check-in feed, or Terminal Tools).
3. Select *"AI & Future Technologies"*.
4. Align your face in the camera oval and click **"Live Face Scan"**:
   * The system computes your live embedding in the browser, matches it against enrolled students, and checks event registration.
   * The **VERIFIED (green tick)** panel displays your name, enrollment ID, institution, and entry time.
   * The entry is logged to the database and appears immediately in the **Live Check-ins** feed.
5. Try scanning again for the same event:
   * The system rejects with **UNVERIFIED (red cross)**: *"Already checked in"*.

### Step 5: Test Failure Scenarios & Spoof Detection
1. In the Face Scan Gate modal, click **"Test Spoof Reject"**:
   * The system blocks the scan with: *"Spoof or fake face detected"*, and logs a `spoof` alert.
2. Switch the active gate event to *"TechFest Hackathon"* (an event the student is not registered for) and click **"Live Face Scan"**:
   * The system rejects with: *"Not registered for this event"*.
3. Test dual verification mismatch:
   * In the "Dual Verification ID" field, enter an incorrect student ID (e.g. `UNI-2026-9999`) and scan:
   * The system rejects with: *"Face does not match the ID presented"*.

### Step 6: Overlapping Event Clash Detection
1. In the database seed, *"AI & Future Technologies"* and *"Quantum Computing Colloquium"* have overlapping time windows.
2. Student `K. Nabidul Hasan` is registered for both overlapping events.
3. Check in `K. Nabidul Hasan` to Event 1 (*"AI & Future Technologies"*).
4. Attempt to check in to Event 2 (*"Quantum Computing Colloquium"*):
   * The system detects the temporal clash and blocks the attempt with:
     **"Same ID active in another overlapping event"**.
   * A security alert is created and logged to the Security Activity telemetry.

### Step 7: Rapid Gate Check-in & CSV Export
1. Click **"Rapid Gate Check-in"** in the Gate Operations bar.
2. Enter an enrollment ID (e.g., `UNI-2026-8473`) or paste a scanned dynamic QR token.
3. Click **"Verify Gate Entry"** to verify attendee access.
4. Go to the **Attendees** tab in the sidebar and click **"Export CSV"**:
   * Downloads a CSV roster with attendee names, IDs, departments, ticket references, and check-in timestamps.

### Step 8: Auto-Clear (Data Retention)
* The system utilizes MongoDB TTL indexes on `CheckIn` and `SecurityAlert` collections (`expireAfterSeconds: 0`).
* Records expire automatically 2 hours after event `endTime`.
* You can also invoke the cleanup endpoint manually:
  ```powershell
  curl -X POST http://localhost:3000/api/events/cleanup
  ```
* Deleting a student account via the profile menu immediately purges the user, their registrations, and all biometric face embeddings.

---

## Design System: Obsidian Glass

* **Base Surface**: `#0B0F19` deep obsidian with subtle translucent glass layers.
* **Backdrop Filters**: High-performance backdrop blur (`backdrop-blur-xl`, `backdrop-blur-md`) with restrained micro-borders.
* **Accent Palette**: Sapphire Blue (`#3B82F6`), Deep Amethyst (`#8B5CF6`), Emerald Green (`#10B981`), Controlled Crimson (`#F43F5E`).
* **Typography**: Clean, restrained modern sans-serif hierarchy.
* **Motion**: Smooth spring physics via Framer Motion for 3D card flips, HUD reticles, and live feeds.
