# DONE — Request-to-Completion OS

> **Kisi se kuch karwana hai? Request bhejo. Track karo. Kaam complete karao.**
>
> *Stop chasing people for documents, payments, approvals and confirmations. Send one structured request, track it end-to-end, and get it DONE.*

DONE is a universal request-to-completion platform designed for client-facing SMBs (CA & accounting firms, agencies, consultants, freelancers, IT & service providers).

---

## The Core Primitive: REQUEST

A **Request** is a structured action that one person or business asks another person to complete.

The core product loop:
```
Create → Send → Recipient Opens → Completes → DONE
```

### The 4 Core Action Types in V1:
1. **Document**: Collect GST, PAN, bank statements, cancelled cheques, KYC with drag-and-drop upload and MIME validation.
2. **Payment**: Collect advance retainers, milestone payments, or invoices in Sandbox mode (Razorpay / Cashfree ready).
3. **Approval**: Get client sign-off on quotations, Figma designs, scope agreements, or contracts (Approve, Request Changes, Reject).
4. **Confirmation**: Confirm appointments, delivery receipts, or service milestones with one tap.
5. **Multi-Action**: Combine multiple items (e.g. *GST upload + Quote approval + ₹15,000 advance*) into a single unified request with live progress tracking (`0/3 → 1/3 → 2/3 → DONE`).

---

## Key Features

- **No-App Recipient Experience**: Recipients open an encrypted link in any browser. No login, no password, no app store download required.
- **Natural Language AI Composer**: Type in plain English or Hinglish (*"Rahul se GST certificate aur ₹15,000 advance 30 September tak chahiye"*) — DONE parses the recipient, actions, payment amounts, and deadline for review.
- **Product Validation Dashboard**: First-class tracking of the viral thesis loop: **Recipient → Sender Conversion** (`12.4%`).
- **Cryptographic Public Tokens**: 192-bit hex tokens eliminate predictable IDs and prevent enumeration attacks.
- **Tamper-Evident Audit Trails**: Every creation, view, submission, approval, and reminder is timestamped in an immutable audit ledger.
- **Automated & Manual Reminders**: Pre-configured schedules (48h before, on due date, 1 day overdue) with one-click dispatch.
- **Clean Provider Abstractions**: Modular interfaces for `PaymentService`, `MessagingService` (QSURA & Meta WhatsApp ready), `AIService`, and `StorageService`.

---

## Run Locally

Zero build or installation dependencies required. Simply run:

```bash
# Option A: Standard npm dev command
npm run dev

# Option B: Direct Python 3 execution
python3 server.py
```

Then open `http://localhost:3000` in your browser.

The application loads immediately in **DEMO MODE** populated with realistic seed data for **Northstar Consulting** (12 requests across all 4 action types, overdue requests, completed requests, audit logs, and viral metrics).

---

## Architecture & Technology Stack

- **Frontend Core**: **React 19** Virtual DOM architecture with `htm` tagged hyperscript bindings for zero-build ESM execution (no fragile `innerHTML` string templates).
- **Type Safety**: Full TypeScript definitions in `src/types/database.ts` covering all 16 database entities and RPC contracts.
- **State & Context**: Reactive `AuthContext` and `WorkspaceContext` with live session synchronization.
- **Frontend Hosting**: Cloudflare Pages / Vercel / Netlify (zero-config static deployment via `dist/`)
- **Backend Persistence**: Supabase PostgreSQL 15+ with 16 normalized tables and Row-Level Security (RLS) (`supabase/schema.sql`).
- **File Storage**: S3-compatible Supabase Storage bucket (`request-attachments`) with signed URLs and MIME-type verification.
- **Messaging Pipeline**: Provider abstraction ready for Meta WhatsApp Business Cloud API & QSURA.
- **Payments Engine**: Sandbox simulation engine with turnkey plug-in hooks for Razorpay and Cashfree.

### Supabase Connection

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Configure environment variables in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

When these keys are present, DONE transitions from local browser storage to live Supabase PostgreSQL persistence with Row-Level Security (RLS).

---

## End-to-End Demo Walkthrough

1. **Visit Landing Page** (`/`): Explore the problem/solution, live interactive preview, and pricing.
2. **Access Dashboard** (`/dashboard`): View 6 KPI cards, Priority Requests, live Activity Feed, and the viral loop thesis.
3. **Natural Language Creation** (`/requests/new`): Type *"Rahul se GST certificate aur ₹15,000 advance 30 September tak chahiye"* and click **Parse & Autofill**.
4. **Send Request**: Submit to open the pre-formatted WhatsApp share dialog.
5. **Open Recipient View** (`/r/:token`): Complete the upload, demo payment, and approval without logging in.
6. **Celebrate DONE**: Reach the **✓ DONE** completion screen and test the viral loop by clicking **Create Free Request**.
7. **Inspect Audit Trail** (`/requests/:id`): Observe the real-time timeline record of all recipient actions.
8. **View Analytics** (`/analytics`): Verify the Recipient → Sender conversion funnel.

---

## Security & Privacy by Design

- **Zero Secrets Ingestion**: Never collects or stores bank OTPs, UPI PINs, CVVs, or account passwords.
- **Row-Level Security (RLS)**: Organization-scoped isolation enforced at the PostgreSQL engine level.
- **Data Portability**: Full JSON export (`Download My Data`) and one-click data deletion under Settings.
© 2026 DONE. Engineered and Developed by Qsura India Pvt Ltd.
