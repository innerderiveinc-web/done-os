// DONE — Realistic Seed Data for Northstar Consulting
// 12 diverse requests across Document, Payment, Approval, Confirmation & Multi-action

export const SEED_ORGANIZATION = {
  id: 'org-northstar-01',
  name: 'Northstar Consulting',
  slug: 'northstar-consulting',
  plan: 'growth',
  owner: 'Irfan Ashraf',
  created_at: '2026-08-01T09:00:00Z'
};

export const SEED_TEMPLATES = [
  {
    id: 'tmpl-gst',
    name: 'Collect GST Documents',
    type: 'Document',
    description: 'Collect GST certificate, PAN, cancelled cheque & 6 months bank statement.',
    actions: [
      { type: 'Document', title: 'GST Certificate (Form GST REG-06)', is_required: true },
      { type: 'Document', title: 'PAN Card of Entity', is_required: true },
      { type: 'Document', title: 'Bank Statement (Last 6 Months)', is_required: true }
    ]
  },
  {
    id: 'tmpl-payment',
    name: 'Collect Milestone Payment',
    type: 'Payment',
    description: 'Request project milestone payment with invoice attachment & due date.',
    actions: [
      { type: 'Payment', title: 'Milestone 2: Design Handover (40%)', amount: 45000, currency: 'INR', is_required: true }
    ]
  },
  {
    id: 'tmpl-approval',
    name: 'Quotation / Scope Approval',
    type: 'Approval',
    description: 'Get client sign-off on scope of work, budget, or architectural plans.',
    actions: [
      { type: 'Approval', title: 'FY27 Retainer Scope & Fee Approval', is_required: true }
    ]
  },
  {
    id: 'tmpl-confirm',
    name: 'Service / Appointment Confirmation',
    type: 'Confirmation',
    description: 'Confirm client briefing, on-site audit, or delivery schedule.',
    actions: [
      { type: 'Confirmation', title: 'On-site Financial Audit Visit (Friday 11:00 AM)', is_required: true }
    ]
  },
  {
    id: 'tmpl-onboarding',
    name: 'Client Onboarding Pack',
    type: 'Multi-Action',
    description: 'Full onboarding flow: KYC docs, agreement approval & initial retainer payment.',
    actions: [
      { type: 'Document', title: 'Certificate of Incorporation & GST', is_required: true },
      { type: 'Approval', title: 'Master Services Agreement (MSA)', is_required: true },
      { type: 'Payment', title: 'Onboarding Retainer Advance', amount: 25000, currency: 'INR', is_required: true }
    ]
  },
  {
    id: 'tmpl-vendor-kyc',
    name: 'Vendor KYC & Bank Verification',
    type: 'Document',
    description: 'Collect MSME certificate, cancelled cheque, and vendor registration form.',
    actions: [
      { type: 'Document', title: 'Cancelled Cheque for NEFT/RTGS', is_required: true },
      { type: 'Document', title: 'MSME / Udyam Registration Certificate', is_required: false }
    ]
  }
];

export const SEED_CONTACTS = [
  { id: 'c-1', name: 'Rahul Sharma', email: 'rahul@sharmalogistics.in', phone: '+91 98201 12345', requestsCount: 3, completedCount: 2, status: 'Active' },
  { id: 'c-2', name: 'Sara Mehta', email: 'sara@mehtadesign.co', phone: '+91 98110 54321', requestsCount: 2, completedCount: 1, status: 'Active' },
  { id: 'c-3', name: 'Amit Patel', email: 'amit@pateltech.com', phone: '+91 97234 88990', requestsCount: 2, completedCount: 2, status: 'Active' },
  { id: 'c-4', name: 'Northstar Retail', email: 'accounts@northstarretail.in', phone: '+91 98450 11223', requestsCount: 2, completedCount: 1, status: 'Active' },
  { id: 'c-5', name: 'Orbit Foods Ltd', email: 'procurement@orbitfoods.com', phone: '+91 99001 77665', requestsCount: 1, completedCount: 0, status: 'Needs Followup' },
  { id: 'c-6', name: 'Dr. Ravi Verma', email: 'ravi@vermaclinics.in', phone: '+91 94120 33445', requestsCount: 1, completedCount: 1, status: 'Active' },
  { id: 'c-7', name: 'Vikram Malhotra', email: 'vikram@malhotrainsurance.com', phone: '+91 98222 44556', requestsCount: 1, completedCount: 0, status: 'Pending' },
  { id: 'c-8', name: 'Ananya Singh', email: 'ananya@singhcreatives.org', phone: '+91 98333 99887', requestsCount: 1, completedCount: 1, status: 'Active' }
];

export const SEED_REQUESTS = [
  {
    id: 'req-1024',
    reference_no: 'REQ-1024',
    title: 'FY26 Tax Filing Documents & Advance',
    recipient_name: 'Rahul Sharma',
    recipient_email: 'rahul@sharmalogistics.in',
    recipient_phone: '+91 98201 12345',
    request_type: 'Multi-Action',
    status: 'In Progress',
    due_at: '2026-09-30',
    amount: 15000,
    currency: 'INR',
    public_token: 'tok_demo_rahul_1024',
    created_at: '2026-09-20T10:30:00Z',
    actions: [
      { id: 'act-1024-1', type: 'Document', title: 'GST Certificate (REG-06)', is_required: true, status: 'Uploaded', completed_at: '2026-09-22T14:10:00Z' },
      { id: 'act-1024-2', type: 'Approval', title: 'FY26 Audit Quotation & Scope', is_required: true, status: 'Approved', completed_at: '2026-09-23T09:40:00Z' },
      { id: 'act-1024-3', type: 'Payment', title: 'Tax Filing Advance Payment', amount: 15000, currency: 'INR', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Created by Irfan Ashraf', at: '2026-09-20T10:30:00Z' },
      { action: 'REQUEST_SENT', note: 'Dispatched via WhatsApp link', at: '2026-09-20T10:32:00Z' },
      { action: 'REQUEST_OPENED', note: 'Opened by Rahul on Chrome Mobile', at: '2026-09-21T08:15:00Z' },
      { action: 'DOCUMENT_UPLOADED', note: 'GST Certificate uploaded (PDF, 1.4 MB)', at: '2026-09-22T14:10:00Z' },
      { action: 'APPROVAL_GRANTED', note: 'Quotation approved without alterations', at: '2026-09-23T09:40:00Z' }
    ]
  },
  {
    id: 'req-1025',
    reference_no: 'REQ-1025',
    title: 'Website Milestone 2 Payment',
    recipient_name: 'Northstar Retail',
    recipient_email: 'accounts@northstarretail.in',
    recipient_phone: '+91 98450 11223',
    request_type: 'Payment',
    status: 'Sent',
    due_at: '2026-09-27',
    amount: 40000,
    currency: 'INR',
    public_token: 'tok_demo_northstar_1025',
    created_at: '2026-09-22T11:00:00Z',
    actions: [
      { id: 'act-1025-1', type: 'Payment', title: 'Milestone 2: Frontend Implementation (₹40,000)', amount: 40000, currency: 'INR', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Created milestone request', at: '2026-09-22T11:00:00Z' },
      { action: 'REQUEST_SENT', note: 'Shared link with Accounts Dept', at: '2026-09-22T11:05:00Z' }
    ]
  },
  {
    id: 'req-1026',
    reference_no: 'REQ-1026',
    title: 'Homepage Redesign Final Approval',
    recipient_name: 'Sara Mehta',
    recipient_email: 'sara@mehtadesign.co',
    recipient_phone: '+91 98110 54321',
    request_type: 'Approval',
    status: 'Opened',
    due_at: '2026-09-26',
    amount: 0,
    currency: 'INR',
    public_token: 'tok_demo_sara_1026',
    created_at: '2026-09-22T15:20:00Z',
    actions: [
      { id: 'act-1026-1', type: 'Approval', title: 'UI/UX Design Mockup v3 Sign-off', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Design approval request created', at: '2026-09-22T15:20:00Z' },
      { action: 'REQUEST_SENT', note: 'Link sent via WhatsApp', at: '2026-09-22T15:25:00Z' },
      { action: 'REQUEST_OPENED', note: 'Recipient reviewed design mockup', at: '2026-09-23T11:45:00Z' }
    ]
  },
  {
    id: 'req-1027',
    reference_no: 'REQ-1027',
    title: 'Q3 Business Review Meeting Confirmation',
    recipient_name: 'Amit Patel',
    recipient_email: 'amit@pateltech.com',
    recipient_phone: '+91 97234 88990',
    request_type: 'Confirmation',
    status: 'Completed',
    due_at: '2026-09-24',
    amount: 0,
    currency: 'INR',
    public_token: 'tok_demo_amit_1027',
    created_at: '2026-09-21T09:00:00Z',
    completed_at: '2026-09-24T10:15:00Z',
    actions: [
      { id: 'act-1027-1', type: 'Confirmation', title: 'Confirm 2:00 PM Strategy Session', is_required: true, status: 'Confirmed', completed_at: '2026-09-24T10:15:00Z' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Meeting invite created', at: '2026-09-21T09:00:00Z' },
      { action: 'REQUEST_SENT', note: 'Sent link', at: '2026-09-21T09:02:00Z' },
      { action: 'REQUEST_OPENED', note: 'Opened by Amit', at: '2026-09-24T10:10:00Z' },
      { action: 'REQUEST_COMPLETED', note: 'Confirmed with note: "Looking forward to it"', at: '2026-09-24T10:15:00Z' }
    ]
  },
  {
    id: 'req-1028',
    reference_no: 'REQ-1028',
    title: 'Vendor Onboarding KYC & Bank Cheque',
    recipient_name: 'Orbit Foods Ltd',
    recipient_email: 'procurement@orbitfoods.com',
    recipient_phone: '+91 99001 77665',
    request_type: 'Document',
    status: 'Overdue',
    due_at: '2026-09-18',
    amount: 0,
    currency: 'INR',
    public_token: 'tok_demo_orbit_1028',
    created_at: '2026-09-10T14:00:00Z',
    actions: [
      { id: 'act-1028-1', type: 'Document', title: 'Cancelled Cheque (for NEFT vendor payments)', is_required: true, status: 'Pending' },
      { id: 'act-1028-2', type: 'Document', title: 'Company PAN & Certificate of Incorporation', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Created onboarding request', at: '2026-09-10T14:00:00Z' },
      { action: 'REQUEST_SENT', note: 'Sent to procurement', at: '2026-09-10T14:05:00Z' },
      { action: 'REMINDER_SENT', note: 'Automated 48h deadline reminder', at: '2026-09-16T09:00:00Z' },
      { action: 'REMINDER_SENT', note: 'Overdue notification dispatched', at: '2026-09-19T09:00:00Z' }
    ]
  },
  {
    id: 'req-1029',
    reference_no: 'REQ-1029',
    title: 'Consultancy Retainer Invoice #1042',
    recipient_name: 'Dr. Ravi Verma',
    recipient_email: 'ravi@vermaclinics.in',
    recipient_phone: '+91 94120 33445',
    request_type: 'Payment',
    status: 'Completed',
    due_at: '2026-09-22',
    amount: 55000,
    currency: 'INR',
    public_token: 'tok_demo_ravi_1029',
    created_at: '2026-09-15T12:00:00Z',
    completed_at: '2026-09-21T16:30:00Z',
    actions: [
      { id: 'act-1029-1', type: 'Payment', title: 'Monthly Advisory Retainer (₹55,000)', amount: 55000, currency: 'INR', is_required: true, status: 'Paid', completed_at: '2026-09-21T16:30:00Z' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Retainer request generated', at: '2026-09-15T12:00:00Z' },
      { action: 'REQUEST_SENT', note: 'Sent via WhatsApp', at: '2026-09-15T12:05:00Z' },
      { action: 'REQUEST_OPENED', note: 'Recipient opened on mobile', at: '2026-09-21T16:20:00Z' },
      { action: 'PAYMENT_CONFIRMED', note: 'Payment of ₹55,000 verified via NetBanking demo', at: '2026-09-21T16:30:00Z' },
      { action: 'REQUEST_COMPLETED', note: 'Marked DONE automatically', at: '2026-09-21T16:30:00Z' }
    ]
  },
  {
    id: 'req-1030',
    reference_no: 'REQ-1030',
    title: 'Commercial Lease Agreement Sign-off',
    recipient_name: 'Vikram Malhotra',
    recipient_email: 'vikram@malhotrainsurance.com',
    recipient_phone: '+91 98222 44556',
    request_type: 'Approval',
    status: 'Sent',
    due_at: '2026-09-28',
    amount: 0,
    currency: 'INR',
    public_token: 'tok_demo_vikram_1030',
    created_at: '2026-09-23T16:00:00Z',
    actions: [
      { id: 'act-1030-1', type: 'Approval', title: 'Review Lease Clause 14 & Indemnity', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Legal contract review created', at: '2026-09-23T16:00:00Z' },
      { action: 'REQUEST_SENT', note: 'Dispatched to legal counsel', at: '2026-09-23T16:02:00Z' }
    ]
  },
  {
    id: 'req-1031',
    reference_no: 'REQ-1031',
    title: 'Brand Identity Assets & Styleguide Handoff',
    recipient_name: 'Ananya Singh',
    recipient_email: 'ananya@singhcreatives.org',
    recipient_phone: '+91 98333 99887',
    request_type: 'Multi-Action',
    status: 'Completed',
    due_at: '2026-09-23',
    amount: 22000,
    currency: 'INR',
    public_token: 'tok_demo_ananya_1031',
    created_at: '2026-09-18T10:00:00Z',
    completed_at: '2026-09-23T14:45:00Z',
    actions: [
      { id: 'act-1031-1', type: 'Approval', title: 'Primary Logo & Typography Kit', is_required: true, status: 'Approved', completed_at: '2026-09-22T11:00:00Z' },
      { id: 'act-1031-2', type: 'Payment', title: 'Final Handover Balance (₹22,000)', amount: 22000, currency: 'INR', is_required: true, status: 'Paid', completed_at: '2026-09-23T14:45:00Z' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Created handoff request', at: '2026-09-18T10:00:00Z' },
      { action: 'REQUEST_SENT', note: 'Dispatched link', at: '2026-09-18T10:05:00Z' },
      { action: 'APPROVAL_GRANTED', note: 'Assets approved', at: '2026-09-22T11:00:00Z' },
      { action: 'PAYMENT_CONFIRMED', note: 'UPI demo payment received', at: '2026-09-23T14:45:00Z' },
      { action: 'REQUEST_COMPLETED', note: 'Marked DONE. Recipient clicked "Create Free Request"!', at: '2026-09-23T14:50:00Z' }
    ]
  },
  {
    id: 'req-1032',
    reference_no: 'REQ-1032',
    title: 'Annual Statutory Audit Checklist',
    recipient_name: 'Rahul Sharma',
    recipient_email: 'rahul@sharmalogistics.in',
    recipient_phone: '+91 98201 12345',
    request_type: 'Document',
    status: 'Sent',
    due_at: '2026-10-05',
    amount: 0,
    currency: 'INR',
    public_token: 'tok_demo_rahul_1032',
    created_at: '2026-09-24T09:15:00Z',
    actions: [
      { id: 'act-1032-1', type: 'Document', title: 'Director DIN & PAN Details', is_required: true, status: 'Pending' },
      { id: 'act-1032-2', type: 'Document', title: 'Fixed Asset Register (Excel/PDF)', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Created by Irfan Ashraf', at: '2026-09-24T09:15:00Z' },
      { action: 'REQUEST_SENT', note: 'Sent via email + WhatsApp', at: '2026-09-24T09:20:00Z' }
    ]
  },
  {
    id: 'req-1033',
    reference_no: 'REQ-1033',
    title: 'Cloud Infrastructure Migration Sign-off',
    recipient_name: 'Amit Patel',
    recipient_email: 'amit@pateltech.com',
    recipient_phone: '+91 97234 88990',
    request_type: 'Approval',
    status: 'Draft',
    due_at: '2026-10-01',
    amount: 0,
    currency: 'INR',
    public_token: 'tok_demo_amit_1033',
    created_at: '2026-09-24T11:00:00Z',
    actions: [
      { id: 'act-1033-1', type: 'Approval', title: 'AWS Cloud Architecture Review', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Draft prepared, awaiting client call before dispatch', at: '2026-09-24T11:00:00Z' }
    ]
  },
  {
    id: 'req-1034',
    reference_no: 'REQ-1034',
    title: 'Q4 ERP Software License Renewal',
    recipient_name: 'Sara Mehta',
    recipient_email: 'sara@mehtadesign.co',
    recipient_phone: '+91 98110 54321',
    request_type: 'Payment',
    status: 'Overdue',
    due_at: '2026-09-20',
    amount: 18500,
    currency: 'INR',
    public_token: 'tok_demo_sara_1034',
    created_at: '2026-09-12T14:30:00Z',
    actions: [
      { id: 'act-1034-1', type: 'Payment', title: 'Annual License Fee (₹18,500)', amount: 18500, currency: 'INR', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'License renewal created', at: '2026-09-12T14:30:00Z' },
      { action: 'REQUEST_SENT', note: 'Sent to Accounts', at: '2026-09-12T14:35:00Z' },
      { action: 'REMINDER_SENT', note: 'Overdue alert dispatched', at: '2026-09-21T09:00:00Z' }
    ]
  },
  {
    id: 'req-1035',
    reference_no: 'REQ-1035',
    title: 'Office Relocation Inventory Delivery Sign-off',
    recipient_name: 'Northstar Retail',
    recipient_email: 'accounts@northstarretail.in',
    recipient_phone: '+91 98450 11223',
    request_type: 'Confirmation',
    status: 'In Progress',
    due_at: '2026-09-25',
    amount: 0,
    currency: 'INR',
    public_token: 'tok_demo_northstar_1035',
    created_at: '2026-09-23T12:00:00Z',
    actions: [
      { id: 'act-1035-1', type: 'Confirmation', title: 'Confirm Delivery of 14 Ergonomic Chairs & Desks', is_required: true, status: 'Pending' }
    ],
    timeline: [
      { action: 'REQUEST_CREATED', note: 'Delivery confirmation created', at: '2026-09-23T12:00:00Z' },
      { action: 'REQUEST_SENT', note: 'Dispatched to facilities lead', at: '2026-09-23T12:05:00Z' },
      { action: 'REQUEST_OPENED', note: 'Opened on mobile', at: '2026-09-24T08:30:00Z' }
    ]
  }
];

export const SEED_VALIDATION_METRICS = {
  totalRequestsCreated: 148,
  totalRequestsSent: 142,
  totalRequestsOpened: 129,
  totalRequestsCompleted: 104,
  overdueRequests: 8,
  recipientToSenderConversionRate: 12.4, // %
  recipientsConvertedToNewSenders: 16,
  medianTimeToCompletionHours: 18.5,
  repeatRequestRate: 68.2, // %
  requestsPerActiveBusiness: 9.2,
  viralCoefficientK: 0.38
};
