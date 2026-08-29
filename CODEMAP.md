# CODEMAP.md — GTNI Website Navigation Index

Purpose: a fast lookup index so a future engineer/agent can find *where* to make a change
without re-reading the whole codebase. This is not a copy of the code — see STACK.md for
architecture/deployment context, and read the actual files before editing.

Conventions: paths are relative to repo root. "→" means "leads to / renders via / used by".

---

## 0. How to find things (cheat-sheet)

| I want to... | Go to |
|---|---|
| Change the homepage hero | `src/globals/Home.ts` (schema: `hero` group) → `src/app/(frontend)/page.tsx` (fetches `home` global) → `src/components/Hero.tsx` (`HeroClient`, renders video/slider) |
| Change the homepage welcome/announcement/testimonials/feature-cards sections | `src/globals/Home.ts` → `src/app/(frontend)/page.tsx` → `src/components/WelcomeSection.tsx` / `AnnouncementSection.tsx` / `StudentTestimonials.tsx`+`StudentTestimonialsClient.tsx` / `FeatureCardsSection.tsx` |
| Change the top nav / add a nav link | `src/globals/Header.ts` (schema, `navItems`/`loginLinks`) → `src/components/Nav.tsx` (server, fetches `header` global) → `src/components/NavClient.tsx` (renders it) |
| Change the footer | `src/globals/Footer.ts` → `src/components/Footer.tsx` (server fetch) → `src/components/FooterClient.tsx` (renders it) |
| Add a brand-new public page | Create a Payload global in `src/globals/`, register it in `src/payload.config.ts` (`globals: [...]`), add a route folder under `src/app/(frontend)/<slug>/page.tsx` that calls `payload.findGlobal({ slug })`, add a nav/footer link and a homepage `featureCards` entry if desired, add it to `src/app/sitemap.ts`, run `pnpm generate:types` |
| Add a field to an existing collection/global | Edit the collection/global file in `src/collections/` or `src/globals/`, run `pnpm generate:types`, then either create a migration (`payload migrate:create`, see §7) for production, or rely on `DATABASE_PUSH=true` for local dev schema sync |
| Change admin branding (logo/login screen/dashboard) | `src/elements/Logo/index.tsx` (admin nav logo/icon), `src/elements/BeforeLogin/index.tsx` (login screen banner), `src/elements/Dashboard/index.tsx` + `DashboardBanner/index.tsx` (dashboard home), `src/elements/Avatar/index.tsx` (topbar user chip) — all wired in `src/payload.config.ts` under `admin.components` |
| Change admin nav icons/grouping | `src/elements/Nav/navIconMap.ts` (icon per collection/global slug), `admin.group` field on each collection/global config |
| Change how email is sent (Resend vs SMTP) | `src/payload.config.ts` (`email:` block — auto-picks Resend if `RESEND_API_KEY` env is set, else Nodemailer/SMTP); NOTE: there is also an unused `src/globals/Settings.ts` global (SMTP/Resend fields) that is NOT registered in `payload.config.ts` — see §3 note |
| Change ISR/cache revalidation behavior | `src/utilities/revalidate.ts` (`withCollectionRevalidate`/`withGlobalRevalidate`, applied to every collection/global in `payload.config.ts`), `src/app/api/revalidate/route.ts` (manual `/api/revalidate?path=...` endpoint, needs `CACHE_REVALIDATION_TOKEN`) |
| Change SEO redirects / legacy URL mapping | `next.config.mjs` (`redirects()` array) |
| Change robots.txt / sitemap.xml | `src/app/robots.ts` / `src/app/sitemap.ts` |
| Change the News & Events page sections/layout | `src/globals/NewsEvents.ts` (Page Settings: hero + `sections` array w/ layoutType) → `src/app/(frontend)/news-events/page.tsx` (fetches global + resolves items) → `src/app/(frontend)/news-events/NewsEventsClient.tsx` (renders grid/featured/tabs layouts) → `src/collections/NewsEvents.ts` (individual post/event/video records) + `src/collections/NewsCategory.ts` (categories used as section filters/tabs) |
| Change the Media Library / add a new upload size | `src/collections/Media.ts` (`upload.imageSizes`, file-size/dimension validators) |
| Change Arabic translation overrides | `src/components/GoogleTranslate.tsx` (`LanguageProvider`, regex-based DOM text overrides) and `src/components/SmartText.tsx` (exact-phrase dictionary) |
| Change a custom Payload admin field's look | `src/components/payload/Fields/*.tsx` (one file per field type, all built on shadcn/ui), wired into collection/global `admin.components.Field` |
| Change the drag/drawer editing UX for array fields (testimonials, board members, etc.) | `src/components/payload/C_SectionDrawer.tsx` (the array field override) + `src/components/payload/C_RowLabel.tsx` (row preview) |

---

## 1. App Routes (`src/app/**`)

### 1.1 Public frontend — `src/app/(frontend)/`

All pages are Server Components that call `getPayload({ config })` then `payload.findGlobal(...)`, build a `generateMetadata()` for SEO/OG tags, and pass data to a presentational component.

| Path | URL | Data source | Renders via |
|---|---|---|---|
| `layout.tsx` | (wraps all frontend pages) | — | `LanguageProvider` (GoogleTranslate) + `JsonLd` (CollegeOrUniversity schema) + `Nav` + `Footer`; sets global `<html>`/metadata defaults |
| `page.tsx` | `/` | `home` global | `Hero` (`HeroClient`), `AnnouncementSection`, `WelcomeSection`, `FeatureCardsSection`, `FeaturedNewsEvents`, `StudentTestimonials` |
| `about-gtni/page.tsx` | `/about-gtni` | `about-gtni` global | `AboutHeroMedia`, `AboutPageContent` (mission/vision), `AboutPhilosophy`, `AlumniMap`, `GtniInNumbers`, `AboutLeadership` (board), `AboutOtherMembers`, `AboutFacultyMembers`, `AboutAdminMembers`, `PhysicsTriangle` (decorative) |
| `admission/page.tsx` | `/admission` | `admission` global | `AdmissionClient` (all sections: qualifications, requirements, application steps, professional domains) |
| `courses/page.tsx` | `/courses` | `courses` global | `CoursesContent` (overview, credit hours, semester tabs w/ course tables, competency section), `PhysicsTriangle` |
| `nursing-programs/page.tsx` | `/nursing-programs` | `nursing-programs` global | `NursingProgramsSection` (overview, EPSLOs, courses teaser), `PhysicsTriangle` |
| `scholarships/page.tsx` | `/scholarships` | `scholarships` global | `ScholarshipsClient` → `Scholarships/GtniScholarship`, `Scholarships/Accommodation` (+`AccommodationFacilities`), `Scholarships/Facilities` |
| `student-services/page.tsx` | `/student-services` | `student-services` global | `StudentServicesClient` (services list w/ optional data tables, policy/handbook section, approval footer) |
| `vacancies/page.tsx` | `/vacancies` | `vacancies` global | `VacanciesClient` (search/filter positions, apply-by-email CTA); NOTE: `src/components/VacanciesSection.tsx` is an older alternate renderer that is **not used anywhere** — orphaned |
| `news-events/page.tsx` | `/news-events` | `news-events-global` global + `news-events` collection (via `unstable_cache`, tag `news-events`) | `NewsEventsClient` (grid / featured-with-grid / tabs layouts per configured section) |
| `news-events/NewsEventsClient.tsx` | (client component, not a route) | — | Video modal, details modal, per-section layout components, paginated "tabs" section that calls `/api/custom-news-events` |
| `globals.css` | — | — | Tailwind v4 entry (`@theme` brand colors: `brand-dark`/`brand-light`/`brand-turquoise`), shadcn base import |

### 1.2 Payload admin route group — `src/app/(payload)/`

Mostly Payload-generated boilerplate (marked "DO NOT MODIFY" in the files) that wires the Next.js route handlers to `@payloadcms/next`.

| Path | Purpose |
|---|---|
| `layout.tsx` | Root layout for `/admin` — mounts `RootLayout` from `@payloadcms/next/layouts`, imports `custom.scss` + `@/styles/payloadStyles.css` |
| `admin/[[...segments]]/page.tsx` | Catch-all admin UI route → `RootPage` |
| `admin/[[...segments]]/not-found.tsx` | Admin 404 → `NotFoundPage` |
| `admin/importMap.js` | **Auto-generated** (`pnpm generate:importmap`) — maps custom component import paths used in `payload.config.ts`/collections/globals to their modules for the RSC import map. Regenerate after adding/removing any custom admin component reference. |
| `api/[...slug]/route.ts` | Payload REST API catch-all (GET/POST/PATCH/PUT/DELETE/OPTIONS) |
| `api/graphql/route.ts` | Payload GraphQL endpoint |
| `api/graphql-playground/route.ts` | GraphQL Playground UI (dev) |
| `custom.scss` | **Active** admin stylesheet — imports the partials in `styles/_*.scss` (variables, typography, sidebar, buttons, forms, components, utilities, focus-states, responsive) |
| `admin/custom.scss` | Not imported anywhere — appears to be an orphaned/duplicate stylesheet |
| `admin/[[...segments]]/custom.scss` | Not imported anywhere — appears to be an orphaned/duplicate stylesheet |
| `styles/_*.scss` | 9 SCSS partials consumed by `../custom.scss` (variables, typography, sidebar, buttons, forms, components, utilities, focus-states, responsive) — this is where most admin visual customization (cards, arrays, uploads, collapsibles) lives |

### 1.3 Other API routes — `src/app/api/`

| Path | Purpose |
|---|---|
| `custom-news-events/route.ts` | `GET` — paginated/filterable news-events fetch used by the "tabs" layout's client-side "Load More" and category/search filtering (query params: `page`, `limit`, `category`, `categories`, `search`) |
| `revalidate/route.ts` | `GET /api/revalidate?path=...&type=layout\|page` — manual on-demand ISR revalidation trigger (no auth check in code itself; protect at the reverse-proxy/token level per STACK.md's `CACHE_REVALIDATION_TOKEN`) |

### 1.4 Root-level special files — `src/app/`

| Path | Purpose |
|---|---|
| `robots.ts` | Generates `/robots.txt`; disallows `/admin` and `/api` |
| `sitemap.ts` | Generates `/sitemap.xml`; fetches `updatedAt` from every page-level global for accurate `lastModified` |

---

## 2. Payload Collections (`src/collections/*.ts`)

All collections are wrapped with `withCollectionRevalidate` in `payload.config.ts` (see §6 "Utilities").

| File | Slug | Purpose | Key fields | Access |
|---|---|---|---|---|
| `Users.ts` | `users` | Admin auth collection | (email/password via `auth`) | Default Payload auth access; custom `POST /api/users/force-reset-pd` endpoint (guarded by `CACHE_REVALIDATION_TOKEN` secret) to create/reset a user's password out-of-band; custom branded forgot-password email HTML |
| `Media.ts` | `media` | Central upload library (images/video/docs) | `alt`, `category` (relationship → `media-categories`, custom `CategoryCell` admin cell), `filesize`/`width`/`height` (read-only, validated) | `read: true` (public); upload dir `public/media`; image sizes: thumbnail/card/tablet; max 10MB images / 150MB video / 50MB other (enforced both client-side via `UploadLoader` and server-side via `beforeValidate` hook) |
| `MediaCategory.ts` | `media-categories` | "Folders" for organizing Media | `title` (unique) | Public read/write (`hidden: true` in admin nav — managed via `BeforeListMedia` UI instead) |
| `NewsCategory.ts` | `news-category` | Categories/tabs for news-events items | `name` (unique), `order`, `visible` | Public read/write; `hidden: true` in nav (managed via drawer in `NewsEvents.ts` global) |
| `NewsEvents.ts` | `news-events` | Individual news posts / events / videos | `_status` (published/draft), `title`, `type` (news/event/video), `publishedDate`, `videoUrl`, `thumbnail`, `excerpt`, `itemCategory` (relationship, required), `isPinned` | Public read/write; `orderable: true` (drag-sort, `_order` field); hooks: auto-assigns "General" category if none picked, un-pins other items in the same category when one is pinned |

---

## 3. Payload Globals (`src/globals/*.ts`)

All globals are wrapped with `withGlobalRevalidate` and registered in `src/payload.config.ts`. Each has `access.read: () => true` (public) and an `afterChange` hook that calls `revalidatePath()`.

| File | Slug | Label / Page | Key structure |
|---|---|---|---|
| `Header.ts` | `header` | Site Wide → Header | `logo` (upload, required), `navItems[]` (label + `globalPage` select), `loginLinks[]` (label + url) — drives `Nav`/`NavClient` |
| `Footer.ts` | `footer` | Site Wide → Footer | `logo`, `description`, `socialLinks[]` (platform+url), `quickLinks[]`, `contactInfo` group (address/phone/email), `copyrightText` — drives `Footer`/`FooterClient` |
| `Home.ts` | `home` | Pages → Homepage | `hero` group (video/slider type, local/external video, slider images, title/subtitle), `announcement` group (2 lines), `welcome` group (title, richText content, signature+image), `featureCards` group (`enabled` + up to 6 cards linking to other globals), `testimonials` group (`enabled`, title, `items[]` — image/studentName/jobTitle/quote, edited via `SectionDrawer`+`C_RowLabel`) |
| `AboutGTNI.ts` | `about-gtni` | Pages → About GTNI | Hero (image/video), Mission & Vision (richText, wrapped in `DrawerField`), Philosophy (title/content/image), Stats ("GTNI In Numbers", 1-4 items), Board Members / Leadership / Faculty Members / Admin Members — 4 parallel `leadershipMembers`/`otherMembers`/`facultyMembers`/`adminMembers` arrays (name/role/photo/bio), all edited via `SectionDrawer` |
| `Admission.ts` | `admission` | Pages → Admission | Tabs: Hero, Qualifications & Decision, Requirements & Submission, Application Steps (Visual — desktop/mobile images), Professional Domains (`domainsList[]`) |
| `Courses.ts` | `courses` | Pages → Courses | Collapsible sections: Hero, Curriculum Overview (richText), Credit Hours System, Semesters (`semesters[]` → nested `courses[]` table with code/title/hours/credit/prereqs — has a hidden auto-filled `courseName` field for DB compat), Competency-Based Curriculum (clinical hours stats) |
| `NewsEvents.ts` (globals) | `news-events-global` | News & Events → Page Settings | `hero` group, `sections[]` (title, description, `layoutType`: tabs/featured-with-grid/grid, `categories` relationship→`news-category`, auto-slugified `sectionId`) — edited via `SectionDrawer` |
| `NursingPrograms.ts` | `nursing-programs` | Pages → The Program | Hero, `overview` (richText), `epslos` group (`categories[]` — title/items-textarea/optional image), `coursesSection` group (teaser linking to `/courses`) |
| `Scholarships.ts` | `scholarships` | Pages → Scholarships | Hero, `pageBlocks` (blocks field, currently one block type: `GtniScholarshipBlock` = title/content/image, reorderable), Accommodation (static section: title/content/image + nested Accommodation Facilities image gallery, max 4), Facilities (`facilitiesSections[]` via `SectionDrawer`: title/richText description/mainImage), `buttonText`/`buttonLink` CTA |
| `StudentServices.ts` | `student-services` | Pages → Student Services | Hero, Overview (`purpose` richText), Services (`services[]` — name, up to 4 images, richText description, optional note, optional data table w/ configurable column headers + rows, custom `ServiceRowLabel`), Policy Information (title/richText/handbook upload/handbook URL), Approval Information (reviewed/approved by + dates) |
| `Vacancies.ts` | `vacancies` | Pages → Vacancies | Hero, `overview` (richText), `applicationEmail`, `positions[]` (title, status draft/published, department, type full/part/contract, richText description, requirements, deadline) |
| `Settings.ts` | `settings` | System → Settings | **Defined but NOT registered** in `payload.config.ts` `globals` array — dead code left over from a removed feature. Its DB table was created by migration `20260721_151000_add_settings` and later dropped by `20260811_170000_remove_settings_global`. If you want to re-enable per-tenant email settings, re-add it to `payload.config.ts` and re-create the table via a new migration (do not resurrect the old one). |

---

## 4. Components (`src/components/**`)

### 4.1 Layout shell
- `Nav.tsx` (server, fetches `header` global) / `NavClient.tsx` (client, renders desktop+mobile nav, login dropdown, language toggle)
- `Footer.tsx` (server, fetches `footer` global) / `FooterClient.tsx` (client render)
- `JsonLd.tsx` — generic `<script type="application/ld+json">` injector, used once in `layout.tsx` for the university schema
- `GoogleTranslate.tsx` — `LanguageProvider`/`useLanguage()` context; loads Google Translate widget, toggles EN/AR, plus a large regex-based DOM-text override list for correcting Google's Arabic translations (nursing terminology, phrase-level rewrites)
- `SmartText.tsx` — `<SmartText text="...">` wrapper; looks up exact-phrase translations in a hardcoded dictionary before falling back to Google Translate's DOM text, used everywhere a short label/heading needs a controlled Arabic translation

### 4.2 Homepage sections
- `Hero.tsx` (`HeroClient`) — video (local mp4 or YouTube embed w/ postMessage API control) or image slider hero
- `WelcomeSection.tsx` — chairman welcome message + richText + signature image
- `AnnouncementSection.tsx` — scrolling two-line announcement banner
- `FeatureCardsSection.tsx` — up to 6 image cards linking to other pages (driven by `Home.featureCards`)
- `FeaturedNewsEvents.tsx` (server, fetches `news-events-global`+`news-events`) / `FeaturedNewsEventsClient.tsx` (tabbed slider + video modal)
- `StudentTestimonials.tsx` (server, fetches `home.testimonials`) / `StudentTestimonialsClient.tsx` (2-up carousel)
- `GtniInNumbers.tsx` — stat cards with icon-keyword matching (used on About page, despite generic name)

### 4.3 About-GTNI page
`AboutHeroMedia.tsx`, `AboutPageContent.tsx` (mission/vision split), `AboutPhilosophy.tsx` (richText + "read more" modal), `AlumniMap.tsx` (react-simple-maps world map with animated pins, static hardcoded alumni locations), `AboutLeadership.tsx` (board members grid+modal), `AboutOtherMembers.tsx` / `AboutFacultyMembers.tsx` / `AboutAdminMembers.tsx` (near-identical slider+modal components, one per members array — high duplication, edit all four if changing the shared card/modal design), `PhysicsTriangle.tsx` (`RunawayTriangles` — decorative interactive floating triangles used as a hero background effect on several pages).
`AboutHistory.tsx` exists but is **not imported anywhere** — orphaned component (richText "Our History" timeline section).

### 4.4 Admission / Courses / Nursing Programs
- `AdmissionClient.tsx` — full page renderer for `/admission` (all sections in one file)
- `CoursesContent.tsx` — overview, credit hours, semester tabs w/ course table, competency stats
- `NursingProgramsSection.tsx` — overview, EPSLO categories, courses teaser + CTA

### 4.5 Scholarships (`Scholarships/`)
- `GtniScholarship.tsx` — renders one `scholarship-section` block (alternating image-left/right layout)
- `Accommodation.tsx` — static accommodation section + embeds `AccommodationFacilities.tsx` (swipeable image gallery)
- `Facilities.tsx` — renders `facilitiesSections[]` with a keyword→icon lookup
- `types.ts` — shared TS types derived from `payload-types.ts` (`ScholarshipSectionBlock`, `AccommodationBlock`)
- `ScholarshipsClient.tsx` (in `components/` root, not the subfolder) — top-level page assembly: hero + `pageBlocks` + Accommodation + Facilities + CTA

### 4.6 Student Services / Vacancies
- `StudentServicesClient.tsx` — services list (with optional per-service data table), policy/handbook section, approval footer
- `VacanciesClient.tsx` — search/filter open positions, mailto CTA (this is the one actually used by the page)
- `VacanciesSection.tsx` — an alternate/older full-section renderer for vacancies; **not referenced by any page** — orphaned, safe to ignore or delete

### 4.7 News & Events support
- Rendering lives in `src/app/(frontend)/news-events/` (see §1.1); `src/utilities/video.ts` provides `resolveItemThumbnails`/`verifyYoutubeThumbnail` used by the page, the homepage featured section, and the `/api/custom-news-events` route

### 4.8 RichText renderer (`RichText/`)
- `index.tsx` — `<RichText content={lexicalJSON} />` entry point, wraps output in a `prose` div
- `serialize.tsx` — hand-rolled Lexical → React serializer (headings, lists, links, quotes, text formatting bitmask, alignment incl. RTL-aware logical alignment, indentation); routes all text nodes through `SmartText`
- `nodeTypes.ts` — Lexical text-format bitmask constants (`IS_BOLD`, `IS_ITALIC`, etc.)

### 4.9 Small shared utilities
- `animations/AnimatedSection.tsx` — Framer Motion scroll-reveal wrapper (`variant`: fade/fade-up/fade-down/fade-left/fade-right/zoom/none), used throughout nearly every page section
- `PhysicsTriangle.tsx` — see §4.3
- `UploadLoader.tsx` — admin-only `ui` field component shown on `Media` collection; blocks upload if file exceeds size limits and shows a full-screen loading overlay during upload/processing
- `CategoryCell.tsx` — admin-only custom list-view cell for `Media.category`, renders an inline `<select>` that PATCHes the doc directly
- `BeforeListMedia.tsx` — admin-only "Folders" toolbar above the Media list/grid (create/delete folders, filter by folder, bulk-move selected files between folders) — uses `/api/media-categories` REST endpoints directly
- `ServiceRowLabel.tsx` — tiny `useRowLabel()` component for `StudentServices.services[]` array rows

### 4.10 UI primitives (`ui/*.tsx`)
shadcn/ui (style "new-york") components, thin Radix wrappers styled with Tailwind + `cn()` from `src/lib/utils.ts`: `accordion.tsx`, `badge.tsx`, `input.tsx`, `label.tsx`, `sheet.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`. Used both by the custom admin `payload/Fields/*` components and available for any future frontend UI.

### 4.11 Custom Payload admin field components (`payload/Fields/*.tsx`)
A full replacement set of Payload's default field renderers, all built on `src/components/ui/*` + `FieldWrapper` for a consistent card-style look. Registered per-field via each collection/global's `admin.components.Field` (e.g. `AboutGTNI.ts` uses `TextField`/`TextareaField`/`DrawerField`).

| File | Renders |
|---|---|
| `FieldWrapper.tsx` | Shared card wrapper (icon, label, char-count, description, error state) + `getLocalizedLabel`/`getLocalizedPlaceholder` helpers used by every other field in this folder |
| `TextField.tsx` | Single-line text input |
| `TextareaField.tsx` | Auto-resizing textarea |
| `NumberField.tsx` | Number input with +/- stepper buttons |
| `EmailField.tsx` | Email input with live regex validation icon |
| `PasswordField.tsx` | Password input with show/hide toggle |
| `SelectField.tsx` | Native `<select>` (single) or toggle-button chips (multi/`hasMany`) |
| `CheckboxField.tsx` | Renders as a shadcn `Switch` toggle |
| `RadioField.tsx` | Card-style radio buttons |
| `DateField.tsx` | Adaptive `<input type="date"/"time"/"datetime-local">` based on `pickerAppearance`, plus a formatted preview badge |
| `CodeField.tsx` | Monospace textarea w/ Tab-key indent support + language badge |
| `JSONField.tsx` | JSON textarea with format/copy/validate buttons |
| `PointField.tsx` | Separate lat/lng number inputs |
| `ColorField.tsx` | Color swatch + hex input + preset palette |
| `SlugField.tsx` | Auto-slugifies from a source field (default `title`) with lock/unlock + regenerate |
| `RichTextField.tsx` | Thin styled wrapper around Payload's own `RichTextField` |
| `CustomCollapsible.tsx` | Accordion-based collapsible section wrapper (alternative to `DrawerField`, not currently used by any collection/global — kept as an option) |
| `DrawerField.tsx` | Collapsible section whose fields open in a slide-out `Drawer` instead of inline (used by `AboutGTNI.ts` Mission & Vision) |
| `index.ts` | Barrel export of all of the above |

### 4.12 Custom Payload array-field editor (`payload/C_*.tsx`)
- `C_SectionDrawer.tsx` (`SectionDrawer`) — replaces Payload's default Array field UI: rows render as compact clickable cards, and both "add" and "edit" open a single shared `Drawer` (avoids default inline-expand flicker). Used by every "section" array across the globals (testimonials, board/faculty/admin members, EPSLO categories via plain array, facilities sections, news-events sections, etc.) via `admin.components.Field`.
- `C_RowLabel.tsx` (`C_RowLabel`) — the row preview card shown inside `SectionDrawer`'s array (thumbnail + name/title + subtitle), opens the shared drawer on click. Paired with `SectionDrawer` via `admin.components.RowLabel`.

---

## 5. Admin customizations (`src/elements/**`)

Wired into `src/payload.config.ts` under `admin.components` / `admin.avatar`.

| Path | Purpose |
|---|---|
| `Avatar/index.tsx` | Custom topbar user avatar/greeting ("Hi, {username}") — replaces default account icon |
| `BeforeLogin/index.tsx` | Full-bleed image banner shown beside/above the login form |
| `Dashboard/index.tsx` | Custom admin home dashboard — replaces default collection/global list with grouped card links (System / Site Wide / Pages) pointing at each collection/global |
| `Dashboard/DashboardBanner/index.tsx` | Hero image banner at the top of the custom dashboard |
| `Logo/index.tsx` | `Logo` (full nav logo) + `Icon` (compact icon for breadcrumbs/favicon) — both just render static images from `public/` |
| `Nav/index.tsx` (`Nav`, server) | Full replacement of Payload's default sidebar nav — groups collections/globals, loads per-user nav open/close preferences via `getNavPrefs.ts` |
| `Nav/index.client.tsx` (`NavClient`) | Client-side rendering of nav groups/links, resolves per-slug icon via `navIconMap.ts`, highlights active route |
| `Nav/NavWrapper/index.tsx` | `<aside>` wrapper handling open/animate/hydrated CSS state classes (via `useNav()`) |
| `Nav/NavHamburger/index.tsx` | Mobile nav close button |
| `Nav/getNavPrefs.ts` | Server-side cached fetch of the current user's saved nav group open/closed preferences from `payload-preferences` |
| `Nav/navIconMap.ts` | Maps each collection/global slug → a Lucide icon component for the sidebar |

---

## 6. Utilities & lib

| File | Exports | Purpose |
|---|---|---|
| `src/utilities/revalidate.ts` | `withCollectionRevalidate`, `withGlobalRevalidate` | Wraps every collection/global config (applied in `payload.config.ts`) with an `afterChange`/`afterDelete` hook that calls `revalidatePath`/`revalidateTag` for the routes that depend on that content type. **This is the map of "what content change busts which cache"** — check `getRevalidatePaths()` inside this file when adding a new collection/global that needs frontend cache invalidation. |
| `src/utilities/video.ts` | `resolveItemThumbnails`, `verifyYoutubeThumbnail`, type `NewsEventWithResolvedThumbnail` | Resolves a display thumbnail for a news-events item: uses the uploaded `thumbnail` media if present, otherwise probes YouTube's `maxresdefault.jpg` (HEAD request, falls back to `hqdefault.jpg`) for video-type items with no uploaded thumbnail |
| `src/utilities/formatSlug.ts` | `formatSlug`, `slugHook` | Generic slugify function + a Payload `FieldHook` that auto-slugifies a `title` field on create (not currently wired to any collection — the custom `SlugField` component in `payload/Fields/` is used instead where slugs exist) |
| `src/lib/utils.ts` | `cn` | `clsx` + `tailwind-merge` class-name combiner, used by every shadcn `ui/*` component and several field components |

---

## 7. Migrations (`src/migrations/*.ts`)

Payload/SQLite migration pairs (each `<timestamp>.ts` + matching `.json` snapshot). `src/migrations/index.ts` imports every migration file and exports them as an ordered `migrations` array, consumed by the Payload CLI (`pnpm payload migrate`).

**Local dev note:** fresh local development typically runs with `DATABASE_PUSH=true` (see `src/payload.config.ts` → `sqliteAdapter({ push: process.env.DATABASE_PUSH === 'true' })`), which pushes the current schema directly instead of replaying this migration chain — the incremental migrations here exist for production deploys where destructive/full pushes aren't safe (see CLAUDE.md for the full rationale, if present in this repo).

**⚠️ Known gap:** `src/migrations/index.ts` imports `20260811_170000_remove_settings_global` but does **not** include it in the exported `migrations` array — it currently never actually runs via `pnpm payload migrate`. Verify before assuming the `settings` table has been dropped in any given environment.

Changelog (one line each, oldest → newest):

| Migration | Change |
|---|---|
| `20260718_143700_rename_student_life_to_services` | Renamed the "Student Life" global/tables to "Student Services" |
| `20260718_153500_scholarships_blocks` | Added the `pageBlocks` blocks-field table structure to Scholarships |
| `20260718_180257` | Created the `news_events` collection table + indexes, linked into `payload_locked_documents_rels` |
| `20260718_180459` | Dropped the old `news_events_global_featured_items` table (superseded by the standalone `news-events` collection) |
| `20260718_183336_order_column` | Added the `_order` column enabling drag-sort (`orderable: true`) on `news-events` |
| `20260718_195906_dynamic_video_sections` | Added dynamic video-section support tables (precursor to the `sections[]` array on `NewsEvents` global) |
| `20260718_202015_restore_array_tables` | Restored array-field tables that a prior migration had inadvertently dropped |
| `20260718_203349_clean_news_events_global_rels` | Cleaned up stale relationship rows on the News & Events global |
| `20260720_171800_make_category_id_nullable` | Made `item_category_id` nullable on `news_events` (later made required again at the app layer) |
| `20260720_200829_add_category_tree` | Added category tree/hierarchy support to `news-category` |
| `20260721_103049_init_news_sections` | Initialized the `sections[]` array field on the News & Events global |
| `20260721_140000_remove_parent_category_column` | Removed the parent-category column (category tree was flattened back out) |
| `20260721_151000_add_settings` | Created the `settings` table (SMTP/Resend email config global) |
| `20260722_194500_news_events_drafts` | Added draft/published `_status` support to `news-events` |
| `20260810_134500_add_domains_image_title` | Added `domainsImage`/`domainsImageTitle` fields to the Admission global's Professional Domains section |
| `20260810_141500_add_testimonial_job_title` | Added `jobTitle` field to Home's testimonials array |
| `20260811_125300_add_epslo_category_image` | Added optional `image` field to Nursing Programs' EPSLO categories |
| `20260811_132000_remove_nursing_programs_courses_table` | Removed an old dedicated courses table from Nursing Programs (courses now live only on the `Courses` global) |
| `20260811_162000_add_admin_members` | Added the `adminMembers[]` array to the About GTNI global |
| `20260811_170000_remove_settings_global` | Drops the `settings` table — **not wired into `migrations/index.ts`'s exported array, so it does not currently run** (see gap note above) |

---

## 8. Root config files

| File | Purpose |
|---|---|
| `src/payload.config.ts` | Central Payload CMS config: registers all collections/globals (wrapped in revalidate HOCs), admin panel branding/components, SQLite adapter (`DATABASE_URL`, `DATABASE_PUSH`), email adapter (Resend if `RESEND_API_KEY` set, else Nodemailer/SMTP), Lexical editor, i18n label override |
| `next.config.mjs` | Wraps Next config with `withPayload()`; defines the legacy-site SEO 301 redirect map; raises server-action body limit to 100MB for uploads; webpack extension-alias tweaks; `serverExternalPackages` for `libsql` |
| `tsconfig.json` | TS compiler options; path aliases `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts` |
| `components.json` | shadcn/ui config (style "new-york", base color zinc, CSS vars, aliases for `components`/`ui`/`lib`/`utils`) |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin registration |
| `eslint.config.mjs` | ESLint flat config extending `next/core-web-vitals` + `next/typescript`; ignores `.next/` and `src/migrations/` |
| `ecosystem.config.cjs` | PM2 process definition for production (`pnpm start` equivalent, 1 fork instance, 2G memory restart limit) |
| `package.json` | Scripts (`dev`/`build`/`start`/`generate:types`/`generate:importmap`/`test:int`/`test:e2e`/`payload`) and dependency versions — see STACK.md for the full version table |
| `src/payload-types.ts` | **Auto-generated** (`pnpm generate:types`) — TypeScript types for every collection/global; regenerate after any schema change, never hand-edit |
| `src/app/(payload)/admin/importMap.js` | **Auto-generated** (`pnpm generate:importmap`) — regenerate after adding/removing/renaming any custom admin component reference |

---

## 9. Not covered above (styling/theming reference only)

- `src/app/(frontend)/globals.css` — Tailwind v4 entry for the public site; defines brand color theme tokens (`--color-brand-dark`, `--color-brand-light`, `--color-brand-turquoise`) consumed as `bg-brand-dark`/`text-brand-turquoise`/etc. utility classes throughout `components/`.
- `src/styles/payloadStyles.css` — Tailwind v4 theme/utilities layers scoped for the admin panel (imported by `src/app/(payload)/layout.tsx`), plus a lighter/higher-contrast override of Payload's default dark theme CSS variables.
- `src/app/(payload)/styles/_*.scss` — see §1.2; the actual source of most admin visual polish (cards, buttons, sidebar, forms, focus rings).
- `src/themes/theme1/app.scss` and `colors.scss` — a full alternate Payload admin SCSS theme (imports `@payloadcms/ui/scss`, redefines `--color-base-*` tokens). **Not imported anywhere in the app** — appears to be an abandoned/experimental theme kept for reference only.
