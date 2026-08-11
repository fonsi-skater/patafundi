# Patakazi

Verified workers. Secure M-Pesa payments. Real reviews. Bringing structure to
Kenya's informal labor market.

## Where we are right now — Step 1 of the build order

This is the **static frontend homepage**, built against `lib/mock-data.ts`.
No database, no payments, no auth yet — that's intentional. We get the look
and feel locked in first, on the free stack, before wiring up anything real.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## What's built so far

- `app/page.tsx` — homepage, sections in the same order as the reference design
- `components/homepage/Hero.tsx` — hero + floating "find a worker" request form
- `components/homepage/TrustBadges.tsx` — verified/insured/secure trust strip
- `components/homepage/WhyDifferent.tsx` — "why Patakazi beats hiring a stranger"
- `components/homepage/Testimonials.tsx` — client review cards
- `components/homepage/ServiceAreaMap.tsx` — free Leaflet/OpenStreetMap coverage map
- `components/layout/Navbar.tsx`, `Footer.tsx`
- `prisma/schema.prisma` — **preview only**, not connected yet (that's Step 2)

## Next steps (see the tech doc for the full build order)

1. ✅ Static frontend against mock data
2. ⬜ Supabase Auth + Prisma schema wired to a real Postgres database
3. ⬜ Search & worker profile pages on real data
4. ⬜ Digital job contracts
5. ⬜ M-Pesa Daraja payment integration
6. ⬜ Reviews gated to completed, paid jobs
7. ⬜ Worker earnings dashboard
8. ⬜ Africa's Talking SMS notifications
9. ⬜ Admin verification/dispute tools
10. ⬜ Subscription tiers + featured listings (revenue features)

## Stack

Next.js 14 · Tailwind CSS · Supabase · Prisma · M-Pesa Daraja · Africa's
Talking · Cloudinary · Leaflet/OpenStreetMap · Vercel — all free tier.
