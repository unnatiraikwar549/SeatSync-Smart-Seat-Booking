# 🏛️ SeatSync — Smart Library Seat Finder (3D Edition)

**Real-Time University Library Seat Availability, Anti-Bag-Hogging Enforcement & 3D Spatial QR Pass System**

Designed and built for university libraries during exam rush seasons to eliminate the chaos of seat-hunting and stop students from reserving desks with unattended backpacks for hours. Features **Light & Dark Mode** switching and an interactive **3D Spatial Web Experience** with isometric campus models and volumetric desk maps.

---

## 🌟 Quick Start / Instant Live Demo

SeatSync is currently running live on the local HTTP server:

1. Open your browser and navigate to:
   ```text
   http://localhost:3000/
   ```
2. Or open the standalone zero-dependency file directly:
   ```text
   C:\Users\ABC\.gemini\antigravity\scratch\seatsync\index.html
   ```

*(Alternatively, run `npm install` and `npm run dev` to launch with Vite).*

---

## 🎨 Dual Theme System (Light & Dark Mode)
- **One-Click Navbar Toggle**: Instant switching via the `☀️ Light` / `🌙 Dark` button in the header.
- **Dark Mode**: Deep Navy canvas (`#070c1d` / `#0d1633`), Ice White typography (`#ffffff`), and glowing Electric Blue accents (`#38bdf8` / `#00f0ff`).
- **Light Mode**: Crisp Ice White canvas (`#f8fafc`), deep navy text (`#0f172a`), soft clean borders (`#e2e8f0`), subtle diffuse shadows, and vibrant electric blue accents.
- **Persistence**: Automatically saved to `localStorage` (`SEATSYNC_THEME`) so your theme preference persists across page reloads.

---

## 🏢 3D Spatial Web Experience

### 1. 🌐 Interactive 3D Holographic Campus Building (Landing Page)
- 3D isometric representation of the 3 library floors stacked in real perspective (`rotateX`, `rotateZ`).
- **Mouse Parallax Dynamics**: Moving your mouse over the building tilts the model in 3D space.
- Shows live floor status LEDs and free seat counts (`Level 2: Research Pods`, `Level 1: Silent Vista`, `Level 0: Commons`).
- Clicking any floor plate in the 3D building navigates directly to that floor.

### 2. 🪑 Volumetric 3D Interactive Floor Map
- Toggle between **"🏢 3D Spatial View"** and **"▦ 2D Plan View"**.
- **Interactive 3D Camera Controls**:
  - **Presets**: 📐 Isometric (54°), 🦅 Top-Down (18°), 🚶 Eye-Level (68°).
  - **Tilt Slider**: Adjust camera elevation from 15° to 75°.
  - **Rotate Slider**: Rotate the library floor plan around its axis from -60° to +60°.
  - **Zoom Steppers**: Scale scene from 70% to 140% with 1-click camera reset.
- **Volumetric 3D Desks**:
  - 3D elevated tabletop with realistic depth (`translateZ(18px)`).
  - 3D desktop computer screen on a pedestal stand tilted back (`translateZ(26px) rotateX(-10deg)`).
  - 3D ergonomic office chair positioned behind the workstation.
  - **3D Status Beacons**:
    - 🟢 Emerald Green: Available for reservation
    - 🔴 Rose Red: Occupied with verified student presence
    - 🟡 Amber Yellow: 20-minute away grace active with **pulsing animated ring**
    - 🔵 Electric Blue: Your reserved seat
  - **3D Hover & Select**: Hovering elevates the desk to `translateZ(34px)` with shadow depth; clicking opens the 3D desk inspector drawer with specs and 1-click booking.

### 3. 🎫 3D Holographic Boarding Pass
- In the Student Dashboard, the digital QR boarding pass features a realistic 3D gyroscope/cursor tilt effect (`rotateX`, `rotateY`) with a glossy holographic reflection layer.

---

## 🚀 Key Features & Architectural Breakdown

### 1. 🏢 Interactive 3-Floor Library Map
- **Ground Floor (Level 0)**: Collaborative Learning Commons & Cafe Hub (20 seats, G-01 to G-20).
- **First Floor (Level 1)**: Silent Study & Window Vista Desks (20 seats, F-01 to F-20).
- **Second Floor (Level 2)**: Deep Focus & Postgraduate Research Pods (20 seats, S-01 to S-20).
- **Visual Color Statuses**:
  - 🟢 **Emerald Green**: Available for instant reservation
  - 🔴 **Rose Red**: Occupied with verified student presence
  - 🔵 **Indigo Blue**: Reserved by current user (pending check-in)
  - 🟡 **Amber Yellow**: Temporarily away (20-minute grace timer active)
- **Micro-Climate Desk Filters**:
  - Floor switcher tabs with live vacancy badges
  - Search by seat number (`G-04`, `F-12`) or zone
  - Filters for: Available only, Window light (🪟), Power outlets (⚡), Silent zone (🤫), Dual monitor workstations (🖥️)
  - Click-to-inspect drawer showing decibel noise rating, power outlets, student info, and 1-click booking.

### 2. ⚡ Concurrency-Safe Seat Booking
- Instant desk reservation with real-time double-booking prevention.
- Generates a unique booking reference ID (e.g., `BK-8931-G04`) and cryptographic QR payload.
- Pre-fills student credentials from active demo persona.
- Configurable study durations (1h, 2h, 4h, or 8h all-day sprint).
- Real-time broadcast synchronization across multiple browser tabs simultaneously!

### 3. 📷 QR Code Check-in Verification
- Dynamic QR code generation for every reserved desk.
- **Dual-Mode Scanner**:
  - **Camera Scanner**: Real-time camera viewfinder via WebRTC (`getUserMedia`) with scanning reticle.
  - **Simulated Scanner**: One-click "Simulate Physical QR Scan" for desktop hackathon presentations without requiring a webcam.
- Cryptographic verification against active database records.
- Prevents duplicate check-ins and transitions seat state from Reserved (Blue) to Occupied (Red).

### 4. ⏱️ 20-Minute Away Grace Timer (Anti-Bag-Hogging Engine)
- **The Problem**: Students leave backpacks, jackets, and notebooks on desks to hoard seats for hours.
- **The SeatSync Solution**:
  - When taking a break (coffee, restroom, discussion), students click **"Step Away (Start 20-Min Break)"**.
  - Seat transitions to Yellow ("Temporarily Away") with public countdown badge on the library map.
  - **Epoch Timestamp Persistence**: Stored with absolute UTC timestamps (`awayStartTime` and `awayExpiresAt`), meaning **refreshing the page, switching tabs, or network glitches will NEVER reset or break the timer!**
  - **Auto-Release Trigger**: If the student fails to return within 20 minutes (00:00), the seat is **automatically released** back to Green ("Available"), booking status set to `auto_released`, and an alert chime sounds.
  - **Early Warning**: Audio chime and amber warning banner activate when < 3 minutes remain.
  - **"I'm Back" Button**: Instantly restores seat status to Occupied and clears break timer.
  - **Judge Demo Fast-Forward**: Includes both a **30-Second Fast-Timer Mode** and a **⏩ Fast-Forward (15s Left)** button to demonstrate the auto-release live in seconds!

### 5. 🎓 Student Dashboard & Digital Boarding Pass
- Active booking overview with live status badge and remaining session time.
- Dynamic high-resolution QR pass card with student avatar, university ID, and scannable barcode.
- Real-time Away Timer circular progress indicator and quick-action controls.
- Comprehensive study session history table with past timestamps, durations, and departure statuses.

### 6. 📊 Admin Dashboard & Operational Analytics
- **Executive KPI Cards**: Total Desks (60+), Available, Occupied, Reserved, Away, and Overall Occupancy %.
- **Visual Analytics**:
  - Floor-by-floor occupancy comparison bar chart
  - 24-hour peak library hours distribution histogram (highlighting 2:00 PM – 6:00 PM exam rush)
- **Seat Administration Grid & Table**:
  - Filter by floor level and seat status
  - Force release abandoned seats
  - Toggle seat status
  - Add new library study desks dynamically
- **Live Activity Audit Feed**: Timestamped real-time log of campus check-ins, reservations, and auto-releases.

### 7. 🎭 Persona & Demo Switcher
- Switch seamlessly between realistic personas:
  - **Alex Chen**: Senior Computer Science Student (`STU-2024-9182`)
  - **Maya Patel**: Junior Biomedical Science Student (`STU-2024-7431`)
  - **Dr. Sarah Vance**: Head Librarian & Operations Administrator (`LIB-ADMIN-01`)
- **Factory Reset**: One-click restore to clean default state at any time.

---

## 🗄️ Supabase PostgreSQL Schema & Realtime

Located at `supabase/schema.sql`:

- **Tables**: `floors`, `seats`, `bookings`, `check_ins`, `away_timers`
- **Unique Constraint**:
  ```sql
  CREATE UNIQUE INDEX unique_active_seat_booking 
  ON public.bookings (seat_id) 
  WHERE status IN ('reserved', 'checked_in', 'away');
  ```
  Guarantees zero double bookings at the database level.
- **Row Level Security (RLS)**: Public read policies for real-time map updates + authenticated updates for bookings and check-ins.
- **Database Trigger & Function**:
  `release_expired_away_seats()` automatically clears expired away seats.
- **Realtime Replication**:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  ```

---

## 💻 Tech Stack

| Technology | Purpose |
|---|---|
| **React 18 & TypeScript** | Component hierarchy, state machines, and type safety |
| **Tailwind CSS** | Premium modern UI, responsive grids, and soft shadow aesthetics |
| **Supabase** | Cloud PostgreSQL database, auth, and real-time subscriptions |
| **Web Audio API** | Zero-dependency synthesized audio chimes for booking, check-in, and auto-release |
| **WebRTC MediaDevices** | Live camera video feed for mobile QR code scanning |
| **LocalStorage & BroadcastChannel** | Multi-tab synchronized state persistence with zero-configuration demo mode |

---

## 🏆 Presentation Walkthrough for Hackathon Judges

1. **Open the Landing Page**: Show the live counter (e.g., `42 / 60 Seats Free`), the 70% occupancy meter, and the three floor cards.
2. **Jump to Library Map**:
   - Filter by **Window Seats** (🪟) or **Power Outlets** (⚡).
   - Click on an available green seat (e.g. `G-01`).
   - Highlight the desk inspector: noise decibel rating (<60dB collaborative), dual monitors, AC plugs.
3. **Book the Desk**:
   - Click "Reserve Seat", select a 2-hour duration, and confirm.
   - Listen to the pleasant confirmation chime!
4. **QR Check-in**:
   - Show the generated QR Pass on the Student Dashboard.
   - Click "Scan Desk QR Code" and hit "Simulate Physical QR Scan" to verify.
   - Observe status change from "Reserved" to "Verified & Checked In" (Seat turns from Blue to Red).
5. **Demonstrate 20-Minute Away Timer (The Showstopper)**:
   - Click "Step Away (Start 20-Min Break)".
   - Show that the seat turns **Yellow** on the floor map with a live countdown.
   - Click **"⏩ Fast-Forward (15s Left)"** to jump directly to the final 15 seconds.
   - Watch the timer count down to 00:00:
     - Warning chime plays
     - Seat is **automatically released** back to Green ("Available")
     - Booking marked as "Auto-Released (Inactivity)"
     - Backpack seat-hogging prevented!
6. **Admin Panel**:
   - Show the peak hours bell curve (highlighting the 2 PM - 6 PM exam rush).
   - Demonstrate the "Force Release" button in the seat management table.
   - Show the real-time activity audit feed recording all actions.
