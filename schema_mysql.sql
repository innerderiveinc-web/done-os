-- DONE — Request-to-Completion OS
-- MySQL Database Schema for GoDaddy Linux cPanel / phpMyAdmin
-- Compatible with MySQL 5.7+ and MySQL 8.0+

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS request_actions;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS recipients;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Organizations
CREATE TABLE organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  plan ENUM('free', 'starter', 'growth', 'business', 'enterprise') NOT NULL DEFAULT 'free',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users / Profiles
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Organization Memberships (RBAC)
CREATE TABLE organization_members (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  role ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_org_user (organization_id, user_id),
  CONSTRAINT fk_member_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Recipients (Client Directory)
CREATE TABLE recipients (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipients_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Requests
CREATE TABLE requests (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) DEFAULT NULL,
  recipient_id VARCHAR(36) DEFAULT NULL,
  reference_no VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  request_type ENUM('Document', 'Payment', 'Approval', 'Confirmation', 'Multi-Action') NOT NULL DEFAULT 'Multi-Action',
  status ENUM(
    'Draft', 'Sent', 'Opened', 'In Progress', 'Submitted', 
    'Needs Correction', 'Approved', 'Paid', 'Completed', 'Closed', 'Overdue'
  ) NOT NULL DEFAULT 'Draft',
  due_at DATE DEFAULT NULL,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  public_token VARCHAR(120) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_req_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_req_rec FOREIGN KEY (recipient_id) REFERENCES recipients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Request Actions
CREATE TABLE request_actions (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36) NOT NULL,
  type ENUM('Document', 'Payment', 'Approval', 'Confirmation') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  position INT NOT NULL DEFAULT 1,
  status ENUM(
    'Pending', 'Uploaded', 'Paid', 'Approved', 
    'Rejected', 'Confirmed', 'Rescheduled', 'Completed', 'Needs Correction'
  ) NOT NULL DEFAULT 'Pending',
  amount DECIMAL(14,2) DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  result JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_act_req FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Attachments
CREATE TABLE attachments (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36) NOT NULL,
  action_id VARCHAR(36) DEFAULT NULL,
  storage_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_by VARCHAR(50) DEFAULT 'recipient',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_att_req FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_act FOREIGN KEY (action_id) REFERENCES request_actions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Immutable Cryptographic Audit Logs
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  request_id VARCHAR(36) DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  actor_type ENUM('sender', 'recipient', 'system') NOT NULL,
  actor_identifier VARCHAR(150) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_req FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Request Templates
CREATE TABLE templates (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(300) DEFAULT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  type VARCHAR(50) NOT NULL DEFAULT 'Multi-Action',
  actions JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tmpl_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Organization & Admin Account
INSERT INTO organizations (id, name, slug, plan)
VALUES ('org-default-01', 'Northstar Consulting', 'northstar-consulting', 'growth');

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES ('usr-owner-01', 'Irfan Ashraf', 'irfan@northstar.in', 'password123', 'owner');

INSERT INTO organization_members (id, organization_id, user_id, role)
VALUES ('mem-01', 'org-default-01', 'usr-owner-01', 'owner');
