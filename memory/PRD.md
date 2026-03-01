# Flow Consulting - PRD

## Original Problem Statement
Build a modern, premium single-page website for Flow Consulting — a company that sells large-scale industry reports and market research. Premium consulting firm aesthetic with dark theme, glassmorphism, Stripe payments, PDF sample generation, MongoDB storage.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async driver) + Stripe via emergentintegrations
- **Fonts**: Outfit (headings), Inter (body)
- **Theme**: Dark navy (#0A1628) + Electric blue (#00B4D8) accent + Gold (#F59E0B) CTAs

## Core Requirements
- Premium single-page storefront for industry reports
- Report catalog with filters (industry, category, price, search)
- Shopping cart with Stripe checkout
- Sample PDF download with email capture
- Newsletter, contact, and custom research forms
- Responsive design, canvas particle animations, scroll-triggered motion

## What's Been Implemented (March 1, 2026)
### Backend (server.py)
- 15 seeded reports across 12 industries
- GET /api/reports (filterable, paginated), GET /api/reports/{id}
- GET /api/industries (with report counts)
- GET /api/search (text search)
- POST /api/checkout (Stripe session), GET /api/checkout/status/{id}
- POST /api/webhook/stripe
- POST /api/newsletter, /api/contact, /api/custom-research
- POST /api/sample-download (email capture), GET /api/sample-download/{id}/pdf (PDF generation)

### Frontend Components
- Header (sticky, transparent-to-solid scroll behavior, cart badge)
- HeroSection (canvas particles, animated counters, dual CTAs)
- FeaturedReports (6 cards with glassmorphism)
- ReportCatalog (search, filters, grid/list toggle, pagination)
- ReportDetailModal (full detail, TOC, key findings, 3 license tiers)
- IndustriesSection (12 industry cards with icons, click-to-filter)
- HowItWorks (4-step process)
- WhyChooseUs (asymmetric layout, 6 feature cards)
- ClientLogos (marquee + 3 testimonials)
- CustomResearchCTA (form with validation)
- Newsletter (email subscription)
- Footer (nav columns, social, payment icons)
- CartDrawer (Sheet component, items, total, checkout)
- SearchOverlay (instant client-side search)
- SampleDownloadModal (email capture + PDF download)

## Test Results
- Backend: 100% pass rate
- Frontend: 95% pass rate (1 low-priority timing issue)

## Admin Panel (March 1, 2026)
- Password-protected admin at /admin (default: flowadmin2025)
- Dashboard: 8 stat cards (reports, revenue, orders, subscribers, etc.)
- Reports CRUD: table + full form (basic info, pricing, specs, key findings, TOC, methodology, keywords)
- Submissions: tabbed view for newsletter, contact, research requests, sample downloads
- Transactions: payment history with status, amounts, items
- Sidebar nav, collapsible, logout, view-site link

## Prioritized Backlog
### P0 (Done)
- [x] Full report catalog with CRUD
- [x] Stripe checkout integration
- [x] Shopping cart functionality
- [x] All form submissions (newsletter, contact, custom research)
- [x] Sample PDF generation and download
- [x] Canvas particle animations
- [x] Responsive design
- [x] Admin panel with full CRUD, stats, submissions, transactions

### P1 (Next)
- [ ] Order confirmation page after successful payment
- [ ] Contact Us section (separate form from footer)
- [ ] Report category/date filters enhancement

### P2 (Future)
- [ ] User accounts for order tracking
- [ ] Email notification integration (SendGrid/Resend)
- [ ] Analytics tracking (views, downloads, conversions)
- [ ] A/B testing on CTAs for conversion optimization
