/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Permission catalog
// Group naming: <domain>.<action>
// ----------------------------------------------------------------------------
type PermissionDef = { code: string; group: string; description: string };

const PERMISSIONS: PermissionDef[] = [
  // Customer
  { code: 'customer.read', group: 'customer', description: 'View customer list & detail' },
  { code: 'customer.create', group: 'customer', description: 'Create a new customer (auto-generate customer code)' },
  { code: 'customer.update', group: 'customer', description: 'Edit customer profile' },
  { code: 'customer.delete', group: 'customer', description: 'Soft-delete customer' },
  { code: 'customer.export', group: 'customer', description: 'Export customer list (CSV/Excel)' },

  // Service
  { code: 'service.read', group: 'service', description: 'View service list & detail' },
  { code: 'service.create', group: 'service', description: 'Create service (auto-generate service secret)' },
  { code: 'service.update', group: 'service', description: 'Edit service (package, router, etc.)' },
  { code: 'service.delete', group: 'service', description: 'Soft-delete service' },
  { code: 'service.provision', group: 'service', description: 'Trigger provisioning to router/radius' },
  { code: 'service.activate', group: 'service', description: 'Activate service' },
  { code: 'service.suspend', group: 'service', description: 'Suspend service (overdue / manual)' },
  { code: 'service.terminate', group: 'service', description: 'Terminate service permanently' },
  { code: 'service.view_password', group: 'service', description: 'View PPPoE/Radius password in clear (sensitive!)' },

  // Package
  { code: 'package.read', group: 'package', description: 'View packages' },
  { code: 'package.create', group: 'package', description: 'Create package' },
  { code: 'package.update', group: 'package', description: 'Update package' },
  { code: 'package.delete', group: 'package', description: 'Delete package' },

  // Invoice
  { code: 'invoice.read', group: 'invoice', description: 'View invoices' },
  { code: 'invoice.create', group: 'invoice', description: 'Create invoice manually' },
  { code: 'invoice.update', group: 'invoice', description: 'Edit invoice (before paid)' },
  { code: 'invoice.cancel', group: 'invoice', description: 'Cancel invoice' },
  { code: 'invoice.generate_batch', group: 'invoice', description: 'Trigger batch monthly invoice generation' },

  // Payment / Transaction
  { code: 'payment.read', group: 'payment', description: 'View payments / transactions' },
  { code: 'payment.create', group: 'payment', description: 'Record manual payment' },
  { code: 'payment.reverse', group: 'payment', description: 'Reverse a payment (refund)' },
  { code: 'payment_channel.manage', group: 'payment', description: 'Manage payment channels' },

  // Router / Network
  { code: 'router.read', group: 'network', description: 'View routers' },
  { code: 'router.create', group: 'network', description: 'Add router' },
  { code: 'router.update', group: 'network', description: 'Update router config' },
  { code: 'router.delete', group: 'network', description: 'Delete router' },

  // Radius
  { code: 'radius.read', group: 'radius', description: 'View radius users / accounting' },
  { code: 'radius.sync', group: 'radius', description: 'Sync service ⇄ radcheck/radusergroup' },
  { code: 'radius.disconnect', group: 'radius', description: 'Disconnect active radius session (CoA)' },
  { code: 'radius_profile.manage', group: 'radius', description: 'Manage radius profiles / groups' },

  // Ticket
  { code: 'ticket.read', group: 'ticket', description: 'View tickets' },
  { code: 'ticket.create', group: 'ticket', description: 'Create ticket' },
  { code: 'ticket.update', group: 'ticket', description: 'Update ticket' },
  { code: 'ticket.assign', group: 'ticket', description: 'Assign ticket to user' },
  { code: 'ticket.close', group: 'ticket', description: 'Close / resolve ticket' },

  // User / RBAC
  { code: 'user.read', group: 'user', description: 'View users' },
  { code: 'user.create', group: 'user', description: 'Create user' },
  { code: 'user.update', group: 'user', description: 'Update user' },
  { code: 'user.delete', group: 'user', description: 'Soft-delete user' },
  { code: 'user.lock', group: 'user', description: 'Lock / unlock user' },

  { code: 'role.read', group: 'role', description: 'View roles' },
  { code: 'role.manage', group: 'role', description: 'Create/update/delete roles & permission assignment' },

  // Audit / Report / Dashboard / Settings
  { code: 'audit.read', group: 'audit', description: 'View audit logs' },
  { code: 'report.read', group: 'report', description: 'View reports' },
  { code: 'report.export', group: 'report', description: 'Export reports' },
  { code: 'dashboard.read', group: 'dashboard', description: 'View dashboard widgets' },
  { code: 'settings.read', group: 'settings', description: 'View system settings' },
  { code: 'settings.update', group: 'settings', description: 'Update system settings' },
];

// ----------------------------------------------------------------------------
// Roles (system roles — name must be unique and stable)
// ----------------------------------------------------------------------------
type RoleDef = {
  name: string;
  description: string;
  permissions: string[] | 'ALL';
};

const ROLES: RoleDef[] = [
  {
    name: 'superadmin',
    description: 'Full access to all features (system role, cannot be edited)',
    permissions: 'ALL',
  },
  {
    name: 'admin',
    description: 'Operational admin — manages day-to-day data, no destructive system actions',
    permissions: [
      'customer.read',
      'customer.create',
      'customer.update',
      'customer.export',
      'service.read',
      'service.create',
      'service.update',
      'service.provision',
      'service.activate',
      'service.suspend',
      'service.terminate',
      'package.read',
      'package.create',
      'package.update',
      'invoice.read',
      'invoice.create',
      'invoice.update',
      'invoice.cancel',
      'invoice.generate_batch',
      'payment.read',
      'payment.create',
      'router.read',
      'router.update',
      'radius.read',
      'radius.sync',
      'radius_profile.manage',
      'ticket.read',
      'ticket.create',
      'ticket.update',
      'ticket.assign',
      'ticket.close',
      'user.read',
      'role.read',
      'audit.read',
      'report.read',
      'report.export',
      'dashboard.read',
      'settings.read',
    ],
  },
  {
    name: 'finance',
    description: 'Finance / billing — full access to invoice & payment, read customers',
    permissions: [
      'customer.read',
      'customer.export',
      'service.read',
      'invoice.read',
      'invoice.create',
      'invoice.update',
      'invoice.cancel',
      'invoice.generate_batch',
      'payment.read',
      'payment.create',
      'payment.reverse',
      'payment_channel.manage',
      'report.read',
      'report.export',
      'dashboard.read',
    ],
  },
  {
    name: 'technician',
    description: 'Field / NOC — service provisioning, router & radius management, ticket work',
    permissions: [
      'customer.read',
      'service.read',
      'service.update',
      'service.provision',
      'service.activate',
      'service.suspend',
      'service.view_password',
      'router.read',
      'router.update',
      'radius.read',
      'radius.sync',
      'radius.disconnect',
      'ticket.read',
      'ticket.create',
      'ticket.update',
      'ticket.assign',
      'ticket.close',
      'dashboard.read',
    ],
  },
  {
    name: 'csr',
    description: 'Customer Service Rep — front-line: customer & ticket management',
    permissions: [
      'customer.read',
      'customer.create',
      'customer.update',
      'service.read',
      'invoice.read',
      'payment.read',
      'ticket.read',
      'ticket.create',
      'ticket.update',
      'ticket.close',
      'dashboard.read',
    ],
  },
];

// ----------------------------------------------------------------------------
// Default system settings
// ----------------------------------------------------------------------------
const SETTINGS: Array<{ key: string; value: string; group: string }> = [
  { key: 'system.timezone', value: 'Asia/Jakarta', group: 'system' },
  { key: 'system.currency', value: 'IDR', group: 'system' },
  { key: 'customer_code.prefix', value: 'REG', group: 'customer' },
  { key: 'service.provisioning_mode.default', value: 'radius', group: 'service' },
  { key: 'service.secret.random_length', value: '4', group: 'service' },
  { key: 'invoice.due_day_offset', value: '7', group: 'invoice' },
  { key: 'invoice.overdue_grace_days', value: '3', group: 'invoice' },
  { key: 'auth.max_failed_attempts', value: '5', group: 'auth' },
  { key: 'auth.lockout_minutes', value: '15', group: 'auth' },
];

// ----------------------------------------------------------------------------
// Default superadmin user (login: superadmin / admin123 — MUST be rotated)
// ----------------------------------------------------------------------------
const SUPERADMIN = {
  email: 'admin@unms.local',
  username: 'superadmin',
  password: 'admin123',
  fullName: 'Super Administrator',
};

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('[seed] starting…');

  // 1. Counters
  await prisma.systemCounter.upsert({
    where: { key: 'customer_global_sequence' },
    create: { key: 'customer_global_sequence', currentValue: 0n },
    update: {},
  });

  // 2. System settings
  for (const s of SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }

  // 3. Permissions
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      create: p,
      update: { description: p.description, group: p.group },
    });
  }

  // 4. Roles + role_permissions
  const allPermissions = await prisma.permission.findMany({ select: { id: true, code: true } });
  const permIdByCode = new Map(allPermissions.map((p) => [p.code, p.id]));

  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      create: { name: r.name, description: r.description, isSystem: true },
      update: { description: r.description, isSystem: true },
    });

    const wantedCodes = r.permissions === 'ALL' ? PERMISSIONS.map((p) => p.code) : r.permissions;
    const wantedIds = new Set(
      wantedCodes.map((code) => permIdByCode.get(code)).filter((id): id is number => typeof id === 'number'),
    );

    // Diff current vs wanted (idempotent)
    const current = await prisma.rolePermission.findMany({
      where: { roleId: role.id },
      select: { permissionId: true },
    });
    const currentIds = new Set(current.map((rp) => rp.permissionId));

    const toAdd = [...wantedIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !wantedIds.has(id));

    if (toAdd.length > 0) {
      await prisma.rolePermission.createMany({
        data: toAdd.map((permissionId) => ({ roleId: role.id, permissionId })),
        skipDuplicates: true,
      });
    }
    if (toRemove.length > 0) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id, permissionId: { in: toRemove } },
      });
    }
  }

  // 5. Superadmin user (only seed if no superadmin yet — never overwrite an existing one)
  const superRole = await prisma.role.findUnique({ where: { name: 'superadmin' } });
  if (!superRole) {
    throw new Error('superadmin role not found — seed order is wrong');
  }

  const existing = await prisma.user.findUnique({ where: { email: SUPERADMIN.email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(SUPERADMIN.password, 10);
    const user = await prisma.user.create({
      data: {
        email: SUPERADMIN.email,
        username: SUPERADMIN.username,
        passwordHash,
        fullName: SUPERADMIN.fullName,
        status: 'active',
      },
    });
    await prisma.userRole.create({
      data: { userId: user.id, roleId: superRole.id },
    });
    console.log(
      `[seed] superadmin created — email=${SUPERADMIN.email}, password=${SUPERADMIN.password} (ROTATE in prod!)`,
    );
  } else {
    console.log(`[seed] superadmin user already exists (id=${existing.id}); not overwritten`);
  }

  // ----- Report -----
  const [counterCnt, settingCnt, permCnt, roleCnt, rolePermCnt, userCnt] = await Promise.all([
    prisma.systemCounter.count(),
    prisma.systemSetting.count(),
    prisma.permission.count(),
    prisma.role.count(),
    prisma.rolePermission.count(),
    prisma.user.count(),
  ]);

  console.log(
    `[seed] done. counters=${counterCnt}, settings=${settingCnt}, permissions=${permCnt}, roles=${roleCnt}, role_permissions=${rolePermCnt}, users=${userCnt}`,
  );
}

main()
  .catch((err: unknown) => {
    console.error('[seed] failed', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
