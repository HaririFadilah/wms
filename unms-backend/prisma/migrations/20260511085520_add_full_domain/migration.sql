-- CreateTable
CREATE TABLE `job_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `queue` VARCHAR(60) NOT NULL,
    `job_name` VARCHAR(120) NOT NULL,
    `idempotency_key` VARCHAR(160) NULL,
    `status` ENUM('pending', 'running', 'success', 'failed', 'retrying', 'cancelled') NOT NULL DEFAULT 'pending',
    `attempt` INTEGER NOT NULL DEFAULT 0,
    `payload` JSON NULL,
    `error` TEXT NULL,
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `job_logs_idempotency_key_key`(`idempotency_key`),
    INDEX `job_logs_queue_status_idx`(`queue`, `status`),
    INDEX `job_logs_job_name_status_idx`(`job_name`, `status`),
    INDEX `job_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `actor_user_id` BIGINT NULL,
    `actor_label` VARCHAR(120) NULL,
    `action` ENUM('create', 'update', 'delete', 'read', 'login', 'logout', 'permission_change', 'password_change', 'provisioning', 'payment', 'manual_override') NOT NULL,
    `entity_type` VARCHAR(80) NOT NULL,
    `entity_id` VARCHAR(120) NULL,
    `ip_address` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `changes` JSON NULL,
    `metadata` JSON NULL,
    `request_id` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_actor_user_id_created_at_idx`(`actor_user_id`, `created_at`),
    INDEX `audit_logs_action_created_at_idx`(`action`, `created_at`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `channel` ENUM('email', 'whatsapp', 'sms', 'in_app', 'webhook') NOT NULL,
    `template` VARCHAR(120) NOT NULL,
    `target` VARCHAR(160) NOT NULL,
    `customer_id` BIGINT NULL,
    `service_id` BIGINT NULL,
    `invoice_id` BIGINT NULL,
    `ticket_id` BIGINT NULL,
    `status` ENUM('queued', 'sent', 'failed', 'delivered', 'read') NOT NULL DEFAULT 'queued',
    `payload` JSON NULL,
    `provider_ref` VARCHAR(160) NULL,
    `error` TEXT NULL,
    `sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notification_logs_channel_status_idx`(`channel`, `status`),
    INDEX `notification_logs_customer_id_created_at_idx`(`customer_id`, `created_at`),
    INDEX `notification_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(160) NOT NULL,
    `username` VARCHAR(80) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(160) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    `last_login_at` DATETIME(3) NULL,
    `failed_login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(120) NOT NULL,
    `description` VARCHAR(255) NULL,
    `group` VARCHAR(60) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_code_key`(`code`),
    INDEX `permissions_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `user_id` BIGINT NOT NULL,
    `role_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_roles_role_id_idx`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_permissions_permission_id_idx`(`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token_hash` VARCHAR(128) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_hash_key`(`token_hash`),
    INDEX `password_reset_tokens_user_id_idx`(`user_id`),
    INDEX `password_reset_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `customer_code` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(160) NOT NULL,
    `email` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NOT NULL,
    `whatsapp` VARCHAR(40) NULL,
    `national_id` VARCHAR(40) NULL,
    `status` ENUM('active', 'inactive', 'prospect', 'banned') NOT NULL DEFAULT 'active',
    `segment` ENUM('residential', 'smb', 'corporate', 'reseller') NOT NULL DEFAULT 'residential',
    `owner_user_id` BIGINT NULL,
    `joined_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `customers_customer_code_key`(`customer_code`),
    INDEX `customers_status_idx`(`status`),
    INDEX `customers_phone_idx`(`phone`),
    INDEX `customers_email_idx`(`email`),
    INDEX `customers_created_at_idx`(`created_at`),
    INDEX `customers_segment_status_idx`(`segment`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_addresses` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT NOT NULL,
    `label` VARCHAR(60) NOT NULL,
    `address_line` VARCHAR(255) NOT NULL,
    `rt` VARCHAR(10) NULL,
    `rw` VARCHAR(10) NULL,
    `village` VARCHAR(80) NULL,
    `district` VARCHAR(80) NULL,
    `city` VARCHAR(80) NULL,
    `province` VARCHAR(80) NULL,
    `postal_code` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `customer_addresses_customer_id_is_primary_idx`(`customer_id`, `is_primary`),
    INDEX `customer_addresses_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `speed_up_mbps` INTEGER NOT NULL,
    `speed_down_mbps` INTEGER NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `tax_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `radius_profile_id` INTEGER NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `packages_code_key`(`code`),
    INDEX `packages_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_channels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(60) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `type` ENUM('va', 'qris', 'ewallet', 'bank_transfer', 'cash', 'other') NOT NULL,
    `provider` VARCHAR(80) NULL,
    `fee_flat` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `fee_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `config` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_channels_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT NOT NULL,
    `package_id` INTEGER NOT NULL,
    `router_id` INTEGER NULL,
    `pppoe_username` VARCHAR(120) NOT NULL,
    `pppoe_password_hash` VARCHAR(255) NOT NULL,
    `provisioning_mode` ENUM('api', 'radius') NOT NULL DEFAULT 'radius',
    `provisioning_status` ENUM('pending', 'success', 'failed', 'retrying', 'skipped') NOT NULL DEFAULT 'pending',
    `status` ENUM('draft', 'pending_activation', 'active', 'suspended', 'expired', 'terminated', 'failed_provisioning') NOT NULL DEFAULT 'draft',
    `installation_address_id` BIGINT NULL,
    `ip_address` VARCHAR(64) NULL,
    `mac_address` VARCHAR(40) NULL,
    `activated_at` DATETIME(3) NULL,
    `expired_at` DATETIME(3) NULL,
    `suspended_at` DATETIME(3) NULL,
    `terminated_at` DATETIME(3) NULL,
    `due_day` INTEGER NOT NULL DEFAULT 1,
    `base_price` DECIMAL(12, 2) NOT NULL,
    `notes` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `services_pppoe_username_key`(`pppoe_username`),
    INDEX `services_customer_id_idx`(`customer_id`),
    INDEX `services_status_idx`(`status`),
    INDEX `services_router_id_idx`(`router_id`),
    INDEX `services_package_id_idx`(`package_id`),
    INDEX `services_expired_at_idx`(`expired_at`),
    INDEX `services_due_day_idx`(`due_day`),
    INDEX `services_provisioning_status_idx`(`provisioning_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_provisioning_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT NOT NULL,
    `action` VARCHAR(80) NOT NULL,
    `mode` ENUM('api', 'radius') NOT NULL,
    `status` ENUM('pending', 'success', 'failed', 'retrying', 'skipped') NOT NULL,
    `attempt` INTEGER NOT NULL DEFAULT 1,
    `payload` JSON NULL,
    `response` JSON NULL,
    `error` TEXT NULL,
    `duration_ms` INTEGER NULL,
    `triggered_by` BIGINT NULL,
    `job_id` VARCHAR(120) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_provisioning_logs_service_id_created_at_idx`(`service_id`, `created_at`),
    INDEX `service_provisioning_logs_status_created_at_idx`(`status`, `created_at`),
    INDEX `service_provisioning_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `invoice_number` VARCHAR(40) NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `service_id` BIGINT NULL,
    `period_month` INTEGER NOT NULL,
    `period_year` INTEGER NOT NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL,
    `discount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(14, 2) NOT NULL,
    `amount_paid` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'unpaid', 'partially_paid', 'paid', 'cancelled', 'overdue') NOT NULL DEFAULT 'unpaid',
    `notes` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `paid_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    INDEX `invoices_customer_id_status_idx`(`customer_id`, `status`),
    INDEX `invoices_service_id_idx`(`service_id`),
    INDEX `invoices_status_due_date_idx`(`status`, `due_date`),
    INDEX `invoices_due_date_idx`(`due_date`),
    INDEX `invoices_period_year_period_month_idx`(`period_year`, `period_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `invoice_id` BIGINT NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(14, 2) NOT NULL,
    `discount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(14, 2) NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `invoice_items_invoice_id_idx`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `transaction_code` VARCHAR(60) NOT NULL,
    `customer_id` BIGINT NULL,
    `invoice_id` BIGINT NULL,
    `payment_channel_id` INTEGER NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `fee` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `net_amount` DECIMAL(14, 2) NOT NULL,
    `status` ENUM('pending', 'success', 'failed', 'reversed', 'expired') NOT NULL DEFAULT 'pending',
    `gateway_ref` VARCHAR(160) NULL,
    `raw_payload` JSON NULL,
    `paid_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `reversed_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transactions_transaction_code_key`(`transaction_code`),
    UNIQUE INDEX `transactions_gateway_ref_key`(`gateway_ref`),
    INDEX `transactions_customer_id_status_idx`(`customer_id`, `status`),
    INDEX `transactions_invoice_id_idx`(`invoice_id`),
    INDEX `transactions_status_created_at_idx`(`status`, `created_at`),
    INDEX `transactions_paid_at_idx`(`paid_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `routers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `identifier` VARCHAR(120) NOT NULL,
    `host` VARCHAR(120) NOT NULL,
    `api_port` INTEGER NOT NULL DEFAULT 8728,
    `username` VARCHAR(80) NOT NULL,
    `password_encrypted` VARCHAR(500) NOT NULL,
    `location` VARCHAR(160) NULL,
    `status` ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `routers_identifier_key`(`identifier`),
    INDEX `routers_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radius_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `groupname` VARCHAR(80) NOT NULL,
    `speed_up_mbps` INTEGER NOT NULL,
    `speed_down_mbps` INTEGER NOT NULL,
    `pool` VARCHAR(80) NULL,
    `session_timeout` INTEGER NULL,
    `idle_timeout` INTEGER NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `radius_profiles_name_key`(`name`),
    UNIQUE INDEX `radius_profiles_groupname_key`(`groupname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radius_users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT NOT NULL,
    `username` VARCHAR(120) NOT NULL,
    `groupname` VARCHAR(80) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `last_sync_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `radius_users_service_id_key`(`service_id`),
    UNIQUE INDEX `radius_users_username_key`(`username`),
    INDEX `radius_users_groupname_idx`(`groupname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radcheck` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL DEFAULT '',
    `attribute` VARCHAR(64) NOT NULL DEFAULT '',
    `op` CHAR(2) NOT NULL DEFAULT '==',
    `value` VARCHAR(253) NOT NULL DEFAULT '',

    INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radreply` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL DEFAULT '',
    `attribute` VARCHAR(64) NOT NULL DEFAULT '',
    `op` CHAR(2) NOT NULL DEFAULT '=',
    `value` VARCHAR(253) NOT NULL DEFAULT '',

    INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radusergroup` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL DEFAULT '',
    `groupname` VARCHAR(64) NOT NULL DEFAULT '',
    `priority` INTEGER NOT NULL DEFAULT 1,

    INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radgroupcheck` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `groupname` VARCHAR(64) NOT NULL DEFAULT '',
    `attribute` VARCHAR(64) NOT NULL DEFAULT '',
    `op` CHAR(2) NOT NULL DEFAULT '==',
    `value` VARCHAR(253) NOT NULL DEFAULT '',

    INDEX `groupname`(`groupname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radgroupreply` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `groupname` VARCHAR(64) NOT NULL DEFAULT '',
    `attribute` VARCHAR(64) NOT NULL DEFAULT '',
    `op` CHAR(2) NOT NULL DEFAULT '=',
    `value` VARCHAR(253) NOT NULL DEFAULT '',

    INDEX `groupname`(`groupname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radacct` (
    `radacctid` BIGINT NOT NULL AUTO_INCREMENT,
    `acctsessionid` VARCHAR(64) NOT NULL DEFAULT '',
    `acctuniqueid` VARCHAR(32) NOT NULL DEFAULT '',
    `username` VARCHAR(64) NOT NULL DEFAULT '',
    `groupname` VARCHAR(64) NOT NULL DEFAULT '',
    `realm` VARCHAR(64) NULL,
    `nasipaddress` VARCHAR(15) NOT NULL DEFAULT '',
    `nasportid` VARCHAR(15) NULL,
    `nasporttype` VARCHAR(32) NULL,
    `acctstarttime` DATETIME(0) NULL,
    `acctupdatetime` DATETIME(0) NULL,
    `acctstoptime` DATETIME(0) NULL,
    `acctinterval` INTEGER NULL,
    `acctsessiontime` INTEGER UNSIGNED NULL,
    `acctauthentic` VARCHAR(32) NULL,
    `connectinfo_start` VARCHAR(50) NULL,
    `connectinfo_stop` VARCHAR(50) NULL,
    `acctinputoctets` BIGINT NULL,
    `acctoutputoctets` BIGINT NULL,
    `calledstationid` VARCHAR(50) NOT NULL DEFAULT '',
    `callingstationid` VARCHAR(50) NOT NULL DEFAULT '',
    `acctterminatecause` VARCHAR(32) NOT NULL DEFAULT '',
    `servicetype` VARCHAR(32) NULL,
    `framedprotocol` VARCHAR(32) NULL,
    `framedipaddress` VARCHAR(15) NOT NULL DEFAULT '',
    `framedipv6address` VARCHAR(45) NOT NULL DEFAULT '',
    `framedipv6prefix` VARCHAR(45) NOT NULL DEFAULT '',
    `framedinterfaceid` VARCHAR(44) NOT NULL DEFAULT '',
    `delegatedipv6prefix` VARCHAR(45) NOT NULL DEFAULT '',
    `class` VARCHAR(64) NULL,

    UNIQUE INDEX `radacct_acctuniqueid_key`(`acctuniqueid`),
    INDEX `username`(`username`, `acctstarttime`),
    INDEX `framedipaddress`(`framedipaddress`),
    INDEX `framedipv6address`(`framedipv6address`),
    INDEX `framedipv6prefix`(`framedipv6prefix`),
    INDEX `framedinterfaceid`(`framedinterfaceid`),
    INDEX `delegatedipv6prefix`(`delegatedipv6prefix`),
    INDEX `acctsessionid`(`acctsessionid`),
    INDEX `acctstoptime`(`acctstoptime`, `nasipaddress`, `acctuniqueid`),
    INDEX `acctstarttime`(`acctstarttime`),
    INDEX `acctinterval`(`acctinterval`),
    INDEX `acctstoptime_idx`(`acctstoptime`),
    INDEX `nasipaddress`(`nasipaddress`),
    PRIMARY KEY (`radacctid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radpostauth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL DEFAULT '',
    `pass` VARCHAR(64) NOT NULL DEFAULT '',
    `reply` VARCHAR(32) NOT NULL DEFAULT '',
    `authdate` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `class` VARCHAR(64) NULL,

    INDEX `username`(`username`, `authdate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nasname` VARCHAR(128) NOT NULL DEFAULT '',
    `shortname` VARCHAR(32) NULL,
    `type` VARCHAR(30) NOT NULL DEFAULT 'other',
    `ports` INTEGER NULL,
    `secret` VARCHAR(60) NOT NULL DEFAULT 'secret',
    `server` VARCHAR(64) NULL,
    `community` VARCHAR(50) NULL,
    `description` VARCHAR(200) NULL DEFAULT 'RADIUS Client',
    `router_id` INTEGER NULL,

    INDEX `nasname`(`nasname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ticket_number` VARCHAR(40) NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `service_id` BIGINT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `category` ENUM('installation', 'network_issue', 'billing_inquiry', 'service_change', 'termination', 'other') NOT NULL,
    `priority` ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    `status` ENUM('open', 'in_progress', 'pending_customer', 'resolved', 'closed', 'cancelled') NOT NULL DEFAULT 'open',
    `assignee_id` BIGINT NULL,
    `created_by_id` BIGINT NULL,
    `resolved_at` DATETIME(3) NULL,
    `closed_at` DATETIME(3) NULL,
    `sla_due_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tickets_ticket_number_key`(`ticket_number`),
    INDEX `tickets_customer_id_status_idx`(`customer_id`, `status`),
    INDEX `tickets_service_id_idx`(`service_id`),
    INDEX `tickets_status_priority_idx`(`status`, `priority`),
    INDEX `tickets_assignee_id_status_idx`(`assignee_id`, `status`),
    INDEX `tickets_sla_due_at_idx`(`sla_due_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_updates` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ticket_id` BIGINT NOT NULL,
    `author_id` BIGINT NULL,
    `type` ENUM('comment', 'status_change', 'assignment_change', 'attachment', 'internal_note') NOT NULL DEFAULT 'comment',
    `body` TEXT NULL,
    `from_value` VARCHAR(120) NULL,
    `to_value` VARCHAR(120) NULL,
    `visibility` VARCHAR(20) NOT NULL DEFAULT 'public',
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_updates_ticket_id_created_at_idx`(`ticket_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_search_index` (
    `customer_id` BIGINT NOT NULL,
    `customer_code` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(160) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `email` VARCHAR(160) NULL,
    `status` VARCHAR(20) NOT NULL,
    `segment` VARCHAR(20) NOT NULL,
    `city` VARCHAR(80) NULL,
    `active_service_count` INTEGER NOT NULL DEFAULT 0,
    `total_outstanding` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `last_invoice_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `customer_search_index_customer_code_idx`(`customer_code`),
    INDEX `customer_search_index_phone_idx`(`phone`),
    INDEX `customer_search_index_status_city_idx`(`status`, `city`),
    INDEX `customer_search_index_updated_at_idx`(`updated_at`),
    FULLTEXT INDEX `customer_search_index_full_name_phone_email_customer_code_idx`(`full_name`, `phone`, `email`, `customer_code`),
    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_status_snapshots` (
    `service_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `provisioning_status` VARCHAR(30) NOT NULL,
    `pppoe_username` VARCHAR(120) NOT NULL,
    `package_id` INTEGER NOT NULL,
    `router_id` INTEGER NULL,
    `last_online_at` DATETIME(3) NULL,
    `last_offline_at` DATETIME(3) NULL,
    `expired_at` DATETIME(3) NULL,
    `unpaid_invoice_count` INTEGER NOT NULL DEFAULT 0,
    `unpaid_total` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `service_status_snapshots_customer_id_idx`(`customer_id`),
    INDEX `service_status_snapshots_status_idx`(`status`),
    INDEX `service_status_snapshots_router_id_status_idx`(`router_id`, `status`),
    INDEX `service_status_snapshots_expired_at_idx`(`expired_at`),
    PRIMARY KEY (`service_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_summary_monthly` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NOT NULL,
    `total_invoices` INTEGER NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(16, 2) NOT NULL DEFAULT 0,
    `total_paid` DECIMAL(16, 2) NOT NULL DEFAULT 0,
    `total_outstanding` DECIMAL(16, 2) NOT NULL DEFAULT 0,
    `paid_invoices` INTEGER NOT NULL DEFAULT 0,
    `overdue_invoices` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `invoice_summary_monthly_period_year_idx`(`period_year`),
    UNIQUE INDEX `invoice_summary_monthly_period_year_period_month_key`(`period_year`, `period_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revenue_summary_daily` (
    `date` DATE NOT NULL,
    `total_revenue` DECIMAL(16, 2) NOT NULL DEFAULT 0,
    `transaction_count` INTEGER NOT NULL DEFAULT 0,
    `fee_total` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `net_revenue` DECIMAL(16, 2) NOT NULL DEFAULT 0,
    `new_customers` INTEGER NOT NULL DEFAULT 0,
    `new_services` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radius_usage_daily` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `upload_bytes` BIGINT NOT NULL DEFAULT 0,
    `download_bytes` BIGINT NOT NULL DEFAULT 0,
    `session_count` INTEGER NOT NULL DEFAULT 0,
    `total_session_sec` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `radius_usage_daily_date_idx`(`date`),
    UNIQUE INDEX `radius_usage_daily_service_id_date_key`(`service_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radius_active_sessions_snapshot` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `router_id` INTEGER NULL,
    `total_sessions` INTEGER NOT NULL DEFAULT 0,
    `unique_users` INTEGER NOT NULL DEFAULT 0,
    `captured_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `radius_active_sessions_snapshot_router_id_captured_at_idx`(`router_id`, `captured_at`),
    INDEX `radius_active_sessions_snapshot_captured_at_idx`(`captured_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radius_nas_summary` (
    `nas_ip` VARCHAR(45) NOT NULL,
    `shortname` VARCHAR(32) NULL,
    `active_sessions` INTEGER NOT NULL DEFAULT 0,
    `unique_users` INTEGER NOT NULL DEFAULT 0,
    `total_sessions_today` INTEGER NOT NULL DEFAULT 0,
    `last_seen_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`nas_ip`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_owner_user_id_fkey` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_radius_profile_id_fkey` FOREIGN KEY (`radius_profile_id`) REFERENCES `radius_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_router_id_fkey` FOREIGN KEY (`router_id`) REFERENCES `routers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_provisioning_logs` ADD CONSTRAINT `service_provisioning_logs_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_payment_channel_id_fkey` FOREIGN KEY (`payment_channel_id`) REFERENCES `payment_channels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `radius_users` ADD CONSTRAINT `radius_users_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nas` ADD CONSTRAINT `nas_router_id_fkey` FOREIGN KEY (`router_id`) REFERENCES `routers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assignee_id_fkey` FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_updates` ADD CONSTRAINT `ticket_updates_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_updates` ADD CONSTRAINT `ticket_updates_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_search_index` ADD CONSTRAINT `customer_search_index_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_status_snapshots` ADD CONSTRAINT `service_status_snapshots_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
