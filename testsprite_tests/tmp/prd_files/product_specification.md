# Product Specification Document: Klolakelas (EduLMS / Math-LMS)

## 1. Project Overview
**Klolakelas** is a next-generation Learning Management System (LMS) designed for modern classrooms, with a specific focus on student engagement through gamification, real-time analytics for teachers, and community-driven features like social bulletin boards and collaborative financial tracking.

- **Vision**: To bridge the gap between traditional education and modern digital engagement.
- **Core Value Proposition**: A "one-stop-shop" for classroom management that is as engaging for students as it is efficient for teachers.

---

## 2. Target Audience
- **Teachers (Guru)**: Primary users who manage class content, track attendance, perform grading, and analyze performance data.
- **Students (Siswa)**: Active participants who consume materials, submit assignments, track their own gamified rewards, and interact with the class community.
- **Administrators**: Users responsible for high-level management (often integrated into the Guru role in smaller deployments).

---

## 3. Core Modules & Features

### 3.1 Authentication & Authorization
- **Role-Based Access Control (RBAC)**: Distinct workflows for Guru and Siswa.
- **Secure Sessions**: Supabase Auth integrated with SSR for secure, server-side-protected routes.
- **Onboarding**: Tailored onboarding flows for new users to set up classes or join existing ones.

### 3.2 Teacher Management Suite (Guru Dashboard)
- **Classroom Orchestration**:
    - Create, modify, and archive classes.
    - Bulk student management (Import via CSV/Excel).
- **Attendance System**:
    - **QR-Driven Attendance**: Generate unique QR codes for classes for student scanning.
    - **Real-Time Tracking**: Immediate status updates (Present, Absent, Late, etc.).
    - **Reporting**: Exportable attendance logs in PDF and Excel formats.
- **Grading & Assessment**:
    - **Unified Gradebook**: Centrally manage scores for assignments, quizzes, and "Keaktifan" (class participation).
    - **Peer Review**: Integrated peer assessment mechanisms.
    - **Digital Rapor**: Automatic generation of progress reports for parents/students.
- **Strategic Analytics**:
    - High-fidelity charts showing grade trends and distribution.
    - Identification of struggling students via performance tracking.
    - Class-wide statistics (Average scores, attendance rates).
- **Utility Tools**:
    - **Buku Kas**: A financial ledger for tracking class funds and expenditures.
    - **Archive System**: "Nuclear" reset and soft-delete capabilities for managing historical data.

### 3.3 Student Engagement Suite (Siswa Dashboard)
- **Learning Experience**:
    - Streamlined access to learning materials and interactive assignments.
    - **Interactive Quizzes**: Gamified assessment modules with real-time feedback.
- **Gamification (Reward System)**:
    - **Badges & Points**: Earn experience points (XP) for positive behaviors (attendance, top grades).
    - **Leaderboards**: Friendly competition via class-wide and plateau-wide rankings.
- **Social & Personalization**:
    - **E-Mading (Digital Bulletin Board)**: A space for students to submit and view creative works.
    - **Time Capsule**: Feature to leave messages or reflections to be "unlocked" at a future date.
    - **Discussion Boards**: Threaded conversations for peer learning.
    - **Student Goals**: Personal milestone tracking.

---

## 4. Technical Architecture

### 4.1 Frontend Stack
- **Framework**: [Next.js](https://nextjs.org) (App Router for optimized routing).
- **Language**: [TypeScript](https://www.typescriptlang.org) (Ensures type safety across complex data flows).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (Modern utility-first styling).
- **Animations**: [GSAP](https://greensock.com/gsap/) (For fluid transitions and a premium feel).
- **Charts**: [Recharts](https://recharts.org) (For responsive, SVG-based data visualization).

### 4.2 Backend & Infrastructure
- **Database**: [Supabase](https://supabase.com) (PostgreSQL) with Row-Level Security (RLS).
- **Real-time**: Supabase Realtime for instant dashboard updates.
- **Storage**: Supabase Storage for student file submissions and class materials.
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query) for robust server-state management.
- **Middleware**: [Upstash Redis](https://upstash.com) for rate-limiting and performance caching.
- **Error Tracking**: [Sentry](https://sentry.io) for comprehensive runtime monitoring.

---

## 5. UI/UX Design Philosophy
- **Aesthetic**: "Neo-SaaS" – Clean, modern, and high-contrast, with vibrant accents to appeal to younger audiences.
- **Responsiveness**: Fully optimized for mobile (crucial for student usage) and desktop (optimized for teacher productivity).
- **Interactivity**: Micro-animations on hover/click to provide tactile feedback and improve UX engagement.

---

## 6. Future Roadmap
- **AI Integration**: Automatic grading assist and personalized student learning paths.
- **Parent Portal**: Dedicated interface for parents to monitor attendance and grading in real-time.
- **Offline Mode**: Enhanced progressive web app (PWA) features for low-connectivity environments.
- **Video Learning**: Integrated video conferencing or asynchronous video material support.
