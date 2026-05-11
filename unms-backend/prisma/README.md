# Prisma (UNMS)

## Files
- `schema.prisma` — datasource (MySQL) + generator + models. BE-0003 hanya berisi 2 model inti (`system_settings`, `system_counters`). Sisa schema masuk BE-0004.
- `seed.ts` — bootstrap data: `customer_global_sequence` counter (dipakai BE-0101) + default `system_settings`.
- `migrations/` — generated SQL migrations.

## Commands
```bash
# Generate Prisma Client (re-run setelah schema diubah)
npm run prisma:generate

# Buat & apply migration di development
npm run prisma:migrate:dev -- --name <nama_perubahan>

# Apply migration di production / CI (tidak generate baru, hanya apply yg sudah ada)
npm run prisma:migrate:deploy

# Seed
npm run prisma:seed
# atau via prisma cli (otomatis baca "prisma.seed" di package.json)
npx prisma db seed

# Studio (GUI inspeksi DB)
npm run prisma:studio
```

## Required env
```env
DATABASE_URL=mysql://USER:PASS@HOST:PORT/DBNAME
```

## Best practice (wajib diikuti di task berikutnya)
- **JANGAN** instantiate `new PrismaClient()` di tempat lain. Selalu inject `PrismaService`.
- Gunakan `select` spesifik di setiap query — hindari load semua kolom.
- Hindari `include` relasi berlebihan untuk endpoint list (N+1 risk).
- Semua endpoint list wajib pagination (`page`, `limit`), `limit` default ≤ 100.
- Counter atomik (mis. `customer_global_sequence`) wajib di-update di dalam transaksi dengan row lock:
  ```ts
  await prisma.runInTransaction(async (tx) => {
    const row = await tx.$queryRaw`SELECT current_value FROM system_counters WHERE \`key\`='customer_global_sequence' FOR UPDATE`;
    // ... compute next value, update, insert customer ...
  });
  ```
  Sudah di-implement: `CustomerCodeService` (BE-0101) — jangan duplikasi pola ini, inject service-nya saja.
  ```ts
  // BE-0301 contoh:
  await prisma.runInTransaction(async (tx) => {
    const code = await customerCodeService.generateCustomerCode(tx);
    await tx.customer.create({ data: { customerCode: code, /* ... */ } });
  });
  ```
