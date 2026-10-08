# Eventra — Enterprise Campus Event Operations & Zero-Trust Check-in System

**Eventra** is an enterprise-grade digital event registration, dynamic verification, and gate access operations platform designed for universities and academic institutions.

Built with an **Obsidian Glass** visual system, Eventra combines strict cryptographic verification, localized perimeter geofencing, and sub-second multi-terminal synchronization.

---

## Key Capabilities

### 1. Student Passholder Experience
* **Dynamic Holographic Pass**: Dual-sided digital ticket with hardware-accelerated 3D flip physics.
* **Rolling Cryptographic QR**: 10-second automatic token refresh with circular countdown timer preventing replay and screenshot attacks.
* **Zero-Trust Perimeter Validation**: Localized 50m geofence validation confirming attendee presence at the venue.
* **Hardware Binding**: Cryptographic device signature binding preventing multi-session badge duplication.
* **Event Carousel**: Real-time pass wallet with upcoming registered summits, hackathons, and keynotes.

### 2. Operations & Gate Management Suite
* **Real-Time Mechanical Roller Counter**: Animated mechanical odometer telemetry updating gate counts instantaneously without flicker.
* **Live Verification Activity Stream**: Sub-second attendee check-in ingestion with instant status tags (Verified vs Flagged).
* **Automated Exception Processing**: Flags device session mismatches and perimeter breaches in real time.
* **Zero-Trust Policy Enforcement**: Live configuration toggles for Strict Geo-Fence, Dynamic QR, and Single Device Session policies.
* **Venue Capacity Telemetry**: Granular occupancy tracking with sectional breakdowns (VIP, Tier 1, General).
* **Attendee Directory**: Comprehensive search and verification table with export capabilities.

---

## Technology Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router & Turbopack)
* **Library**: [React](https://react.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Motion & Physics**: [Framer Motion](https://www.framer.com/motion/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **QR Generation**: [qrcode.react](https://github.com/zpao/qrcode.react)

---

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## Design System: Obsidian Glass

* **Base Surface**: `#0B0F19` deep obsidian with subtle translucent glass layers.
* **Backdrop Filters**: High-performance backdrop blur with micro-borders.
* **Accent Palette**: Sapphire Blue, Deep Amethyst, Emerald Green, Controlled Crimson.
* **Typography**: Clean, restrained modern sans-serif hierarchy.
