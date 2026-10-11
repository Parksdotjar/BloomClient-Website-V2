# Bloom Client Website UI History

## October 2026 — Version 1.1.6 release notes

- Added the October 8, 2026 Version 1.1.6 entry as the current release and moved Version 1.1.5 into the normal timeline state.
- Expanded the initial partial entry into the complete user-facing release: Social and encryption verification, friend-only instance sharing and access management, Global File Sync, managed caching, Microsoft onboarding, the Modrinth detail and dependency workflow, compact navigation, interface refinements, and the major reliability fixes.
- Kept the website and Discord announcement aligned across New Features, Performance Improvements, Interface & Animation Improvements, and Fixes without exposing internal infrastructure or overstating security guarantees.

## October 2026 — compact neutral ticket conversations

- Replaced blue outgoing-message fills with the same neutral near-black surface used throughout the conversation, while preserving left/right alignment to distinguish participants.
- Changed message bubbles from a broad fixed column to content-sized bubbles with a restrained maximum width; author and timestamp metadata still have enough room to remain readable.
- Moved the user-thread back control to the right side of the subject bar and enlarged it into a centered rounded square with a stronger chevron.
- Replaced text-only reply actions with compact rounded-square paper-plane controls, matched the default reply field height to the control, and styled all ticket selects with a consistent Bloom chevron and surface treatment.

## October 2026 — minimal provider sign-in

- Removed the oversized account-capabilities panel, duplicate Bloom branding, eyebrow, and explanatory provider copy from the sign-in page.
- Recentered sign-in as one focused column with only the page title, two substantial provider actions, a short legal sentence, and the existing Home link.
- Replaced the boxed `G` and `GH` abbreviations with the real multicolor Google mark and monochrome GitHub mark on both sign-in and dashboard connection rows.
- Increased provider label and logo size while keeping the button padding slightly wider horizontally than vertically; there is no decorative icon tile inside either action.

## October 2026 — public privacy and terms pages

- Added complete standalone Privacy Policy and Terms of Service pages at the production OAuth URLs instead of leaving consent-screen links pointed at missing routes.
- The Privacy Policy documents the account fields Bloom receives, Google profile/email use, encrypted OAuth tokens, secure session metadata, local launcher data, server-backed submissions, service providers, retention, deletion, and user controls.
- The Terms distinguish the MIT software license from Bloom-hosted accounts and services, and cover account responsibility, acceptable use, third-party providers, user-submitted content, active-development availability, account deletion, and warranty limits.
- Added durable legal links to the homepage and sign-in consent copy. The legal layout uses a compact sticky contents index and long-form reading column without gradients, blur, decorative filler, or copied reference styling.

## October 2026 — Bloom account sign-in and dashboard

- Replaced the disabled Sign in placeholder across every website page with a real account entry point backed by the Bloom API.
- Added focused Google and GitHub sign-in using one asymmetrical solid-surface composition, retaining OLED black, restrained blue, Fredoka, fixed controls, and no gradients, glow, blur, or filler copy.
- Added a signed-in header control that uses the real provider avatar and opens Dashboard, Switch account, and Sign out without changing the navigation layout.
- Added a responsive account dashboard with distinct Overview, Profile, Connections, and Security areas. Every visible control performs a real backend action: update name, explicitly connect or disconnect providers, revoke other sessions, switch accounts, sign out, or delete the account.
- Used the approved structured-dashboard principles—separate global and local navigation, shared alignment edges, flat information rows, and one clear action per task—without copying the supplied Resend layout or inventing unrelated product metrics.
- Provider controls fail closed when production credentials are absent. The website states that configuration is incomplete instead of simulating a successful login.

## October 2026 — full Bloom support center

- Adopted the supplied Riot Support reference as a quality benchmark while keeping Bloom's dark visual system and real product destinations.
- Added a working client-side search that filters actual support tools and topic routes; it is not a decorative input.
- Added a current-release panel, compact quick destinations, a substantial three-column Support Tools workspace, and topic-based help for technical problems, releases, instances, content, Locker, and account questions.
- Kept tickets, account management, penalties, and other unavailable systems out of the page. Bloom must not imitate functional support infrastructure that its backend does not yet provide.
- Linked the real public Bloom API health endpoint for live service checks instead of displaying a hard-coded online status.

## October 2026 — routed support workspace

- Replaced the generic three-card Support page with three substantial rounded routes for reproducible bugs, community questions, and release files.
- Added a real bug-report preparation flow covering the current version, exact reproduction steps, Bloom's Logs area, expected behavior, and useful screenshots.
- Added a prominent credential-safety note so public GitHub and Discord reports do not include Microsoft tokens, passwords, signing information, or other secrets.
- Every visible support action points to an existing destination: the Bloom issue tracker, verified Discord invite, release archive, or local Changelog page.

## October 2026 — open release-detail rows

- Replaced the rejected internal branch and category container with the approved open three-column composition: bare category symbol, category name, and change text.
- Removed enclosing change surfaces, decorative node boxes, internal rails, and bullet markers. Release details now rely on alignment and whitespace while the main version timeline provides chronology.
- Widened the changelog working column for readable desktop rows and preserved a compact two-column mobile translation.

## October 2026 — connected Bloom branch for release details

- Removed the generic three-card category treatment and its boxed decorative icons after review showed it had no meaningful structure.
- Rebuilt each release as one rounded surface with a dotted internal branch connecting New, Improved, and Fixed through aligned nodes and short dotted connectors.
- The connected rail now communicates that every category belongs to one release; category color is restrained to the node and heading rather than separate tinted cards.

## October 2026 — independent change-category cards

- Replaced the reference-like single changelog slab and horizontal dividers with separate rounded New, Improved, and Fixed cards.
- Gave each category its own restrained solid surface, border tone, rounded symbol, and list markers while keeping all release text fully visible.
- Preserved rounded Bloom geometry and deliberately avoided reusing the flat underline treatment from the filter controls.

## October 2026 — Discord patch-note archive

- Replaced the partial release history with the seven real patch-note sets currently present in Bloom's Discord: 1.0.8, 1.0.9, 1.1.0, 1.1.1, 1.1.2, 1.1.4, and 1.1.5.
- Kept 1.1.3 out of the visible timeline because it was not included in the supplied Discord history; the website must not invent missing release notes.
- Normalized the Discord sections into the existing New, Improved, and Fixed filters while preserving the actual substance of each announcement.

## October 2026 — release-link icon treatment

- Replaced the thin text-glyph arrow beside View release with a bold round-capped northeast SVG arrow.
- Styled each release link as a compact rounded action with a solid dark surface and restrained border so it reads as intentional without competing with the main download button.

## October 2026 — Bloom-specific changelog controls

- Replaced the rounded segmented filter copied too closely from the reference with a flat Bloom toolbar: a left-side context label, independently spaced filter labels, and a restrained blue selection line.
- Removed the visible filter-status sentence below the controls while preserving it for screen-reader announcements.

## October 2026 — display-heading spacing

- Loosened the overly tight tracking on the main Bloom Client title, page titles, editorial feature headings, and other large headings across the website.
- Kept the adjustment restrained so Fredoka remains compact and recognizable without neighboring letters appearing to touch.

## October 2026 — structured release timeline

- Rebuilt Changelog as a focused reading page using the approved professional reference principles: a constrained column, a chronological spine, compact version metadata, and solid change surfaces.
- Added working All changes, New, Improved, and Fixed filters with pressed-state and live status feedback; release content is never hidden behind hover or decorative animation.
- Added the real v1.1.5 and v1.1.4 release dates, direct GitHub release links, and a quiet archive path for older builds.
- Kept Bloom's own blue accent, Fredoka typography, OLED page surface, header, spacing, and content categories rather than copying the reference's exact colors or dimensions.

## October 2026 — larger navigation and account action

- Increased primary navigation text, icon size, spacing, and header height after the initial header read too small.
- Replaced Get Bloom with a clearly styled Sign in action on every page. Because website OAuth is not implemented yet, the control is intentionally disabled instead of opening an unrelated route or pretending to authenticate.

## October 2026 — shared navigation icons and Fredoka

- Added consistent line icons to The client, Changelog, Support, Team, and Community across all standalone pages.
- Replaced the generic system display typography with a locally bundled Fredoka family. The website does not depend on Google Fonts or another runtime font service.

## October 2026 — standalone site pages

- Replaced the Releases and Source code header tabs with Changelog, Support, Team, and Community. Source and release destinations remain available in page content, footers, and download actions.
- Created real standalone pages for all four destinations instead of extending the Home one-pager.
- Team identifies Parks as the sole owner and transparently describes AI-assisted implementation and review. Community uses the verified Discord invite and does not guess an unverified Twitter/X handle.

## October 2026 — visual product stories

- The compact information rows were rejected as too documentation-like. Rebuilt the lower page into large editorial sections with substantial product copy and genuine client screenshots.
- Modrinth installation, instance separation, and Global File Sync now receive dedicated alternating sections. AutoTune, Locker, and pack sharing remain visible in one restrained supporting strip.
- Added an explicit rule against gradients, radial effects, blur, glow, glass surfaces, and invented UI. All section backgrounds remain solid black with simple borders.

## October 2026 — complete one-page product information

- The screenshot-only landing page was rejected because it did not explain the client. The approved navigation and compact hero remain unchanged.
- Added a factual one-page product section led by built-in Modrinth browsing and compatible installs, followed by instances, AutoTune, Global File Sync, Locker, modpack sharing, and Microsoft account handling.
- Used simple divided rows instead of fabricated launcher mockups, popularity claims, filler slogans, or a copied Modrinth content feed.

## October 2026 — screenshot-first hero

- The oversized `Bloom Client / for Minecraft.` split hero was rejected after the navigation was approved.
- Replaced it with a compact centered product name and one action row, then moved the real client screenshot closer so the application becomes the main visual.
- Removed the explanatory side paragraph and the competing two-column composition. Keep this hero factual and restrained.

## October 2026 — spacious icon navigation

- User requested a Modrinth-inspired top bar. Supersedes the earlier flower-only branding rule: original flower plus plain Bloom Client wordmark, central icon-and-text links, and a right-aligned unboxed download link.
- Removed the header divider and boxed download styling. Kept the OLED background and hero unchanged; no copied pattern, fake profile, or inactive dropdowns.
- Small screens wrap navigation into a second row rather than hiding destinations or squeezing the brand.

## October 2026 — Dawn-inspired proportion correction

- The previous centered giant title, ghost flower, connected borders, numbered panels, and repeated download section were rejected.
- Rebuilt the page around a left-aligned two-line product heading and a smaller adjacent download area. Use Bloom blue and original copy; do not copy Dawn's ranking claim, orange identity, promotional widgets, or navigation.
- The real screenshot now follows the introduction in normal document flow. Removed the fake three-dot window bar and fixed-height absolute placement that caused overlap.
- Kept one concise description, release notes, real GitHub destinations, a flower-only header, and a minimal footer. Check desktop and narrow widths before handoff.

## October 2026 — clean restart

- Created a completely new website folder instead of modifying the older Bloom website or converting the abandoned Delight Productions concept.
- The approved reference qualities are professional hierarchy, large product imagery, direct navigation, strong download placement, and controlled empty space. Reference-site Minecraft slogans, rankings, mini captions, feed cards, community clutter, and decorative game imagery are explicitly rejected.
- The global header uses the existing flower by itself. The hero contains only Bloom Client and real actions. The application visual is the real Home screenshot, not an HTML reconstruction or generated mockup.
- OLED black and Bloom blue remain the only visual direction. Hover changes color without movement, and the page contains no custom cursor, particles, parallax, looping animation, glow-heavy controls, or filler sections.
- Sign in is intentionally absent until the website-backed Google/GitHub account flow works end to end.
- Visual review caught the first hero frame touching the download row at a standard desktop viewport. The hero now preserves clear space between actions and the real client screenshot, and the feature heading uses a factual list instead of the rejected slogan-like wording.

## October 2026 — settings-style account dashboard

- Rebuilt Dashboard around the Bloom Client Settings model: a readable vertical account sidebar, one focused view at a time, restrained rounded setting surfaces, and the normal website navigation above it.
- Replaced the generic overview marketing cards with live account, provider, saved-account, and security summaries. Existing Google/GitHub linking, multi-account switching, session revocation, profile updates, sign-out, and account deletion remain real end-to-end actions.
- Added a shared full-width bottom notification bar for account flows. Informational work is blue, completed or saved work is green, and failures are red; messages use centered white text, enter from below, remain visible for about three seconds, and leave with an eased downward transition.
- Dashboard navigation labels must remain readable on small screens. Do not collapse the account tabs into unlabeled icon-only controls.

## October 2026 — account dashboard rail

- Replaced the rejected floating dashboard sidebar card with a restrained Resend-inspired account rail while keeping Bloom's own destinations and account controls.
- The rail now uses a compact account switcher at the top, unboxed icon-and-label navigation, one thin right divider, and switch-account/sign-out actions pinned to the bottom.
- Removed the duplicate Dashboard title block and blue active-navigation box. Active sections use weight and text contrast instead of a large filled pill.

## October 2026 — dashboard rail and content correction

- Made every sidebar navigation and account-action row use the full rail width with consistent left alignment; the rail no longer narrows at ordinary laptop widths.
- Turned the account name and chevron into a real dropdown with Profile and Manage accounts destinations instead of leaving a nonfunctional affordance.
- Centered each dashboard view title and removed the eyebrow and explanatory subtitle above the content.
- Changed dashboard content surfaces from charcoal fills to black interiors with outlines only.
- Replaced the persistent blue connected-account warning with a small white information control that opens a neutral outlined explanation on demand.

## October 2026 — dashboard rail alignment fix

- Explicitly override the website navigation's centered track alignment inside the dashboard rail. Sidebar tabs must stretch to the rail width and keep their icon and label anchored to the left, matching Switch account and Sign out.
- Reduced the desktop rail from 260 pixels to 220 pixels and added a full-width divider below the website header so the rail edge no longer ends without a horizontal boundary.

## October 2026 — account menu trigger and overlay

- Removed the solid rounded container behind the top-right account avatar. The larger chevron now sits close to the avatar, points right while closed, and rotates down while the menu is open.
- The account menu is the sole approved exception to the site's no-blur rule: it uses a translucent black surface with restrained background blur so overlapping page content remains legible. Do not extend this glass treatment to ordinary cards, navigation, or page sections.

## October 2026 — avatar-only account menu

- Removed the account identity control from the dashboard sidebar; account access remains in the shared website header.
- Removed the header avatar chevron entirely. The avatar alone opens the menu and retains its accessible account-menu label and expanded state.
- Replaced the blurred outlined overlay with a compact content-sized dark charcoal menu, no outer border, rounded corners, and a small upward pointer aimed at the avatar.

## October 2026 — account menu proportion correction

- Increased the shared header account avatar to 46 pixels and enlarged the menu pointer to match its visual weight.
- Centered the pointer from the avatar's actual midpoint while accounting for the menu's right offset; do not position it by eye from the menu edge.
- Darkened the menu surface from charcoal to near-black `#090a0b` while preserving enough separation from the OLED page background.

## October 2026 — factual homepage hero

- Removed the blue period after Bloom Client and added one concise factual line in a conventional bold interface font: manage instances, install content, tune performance, and launch from one place.
- Reduced the Windows download action, removed its trailing arrow, and replaced View releases with a gray Source action that opens the Bloom Client repository. Release links remain available elsewhere on the site.
- Added a small Scroll cue linked to the product-information section. Its arrow uses the only approved looping motion in the homepage hero and stops under reduced-motion preferences.
## 2026-10-06 — Real account support tickets

- Added a private ticket inbox, ticket creation form, and two-way support conversation view to the existing account dashboard.
- Added a server-authorized owner dashboard with queue filters, ticket status controls, and owner replies; the owner link is returned only for an immutable server-side staff account ID.
- Replaced public bug-report links on Support with the authenticated private ticket flow while keeping release, Discord, and service-status destinations.
- Ticket states use restrained blue, amber, and neutral markers inside the established OLED-black dashboard system. No gradients, glow, blur, or decorative card stacking were introduced.

## 2026-10-06 — Tickets replace the public support center

- Replaced Support in the primary navigation with Tickets and a purpose-built ticket-stub icon across the website.
- Added a real account-aware Tickets page: signed-out access guidance, live ticket history, an original Bloom rabbit empty state, and a progressive category, issue, and details submission flow backed by the existing private ticket API.
- Kept ticket conversations in the account dashboard and redirected the former Support URL to Tickets so old links do not break.
- Used Bloom-specific issue choices and an original mascot rather than copying Riot's artwork, labels, wallpaper, or page composition.

## 2026-10-06 — Final Team, Community, account hydration, and favicon pass

- Rebuilt Team around one substantial owner surface, a factual responsibility sequence, and a separate AI-transparency note. Parks remains the only named owner and release authority.
- Rebuilt Community around the two verified public destinations—Discord and GitHub—plus direct Changelog, release, and Tickets routes. Removed the empty social-account placeholder.
- Added a minimal local account preview containing only the display name and avatar URL. Signed-in pages render that preview immediately while the real secure session is checked, preventing the Sign in button from flashing between pages.
- Replaced the rough website PNG favicon with the real icon packaged by the Bloom Client desktop application.

## 2026-10-06 — Explicit Bloom Client Social approval

- Native Social sign-in now always stops on a focused website approval page instead of silently authorizing an existing browser session.
- The approval page shows every Bloom account saved in the browser, allows an explicit account switch, and displays the selected account's real provider avatar, name, and email before approval.
- The approved account's name and avatar travel through the one-time native authorization code and become the client Social identity; the launcher does not ask users to recreate provider profile information.
- The approval page completes the loopback callback in the background rather than navigating the complete browser tab to localhost. Successful handoff leaves a clear return-to-client state; a stale or restarted client listener produces an actionable retry message instead of the browser's connection-refused page.
### Native Social approval transport

- **Reported:** Account approval could remain indefinitely on “Finishing in Bloom Client” because a public HTTPS page attempted a CORS fetch to a random HTTP loopback port.
- **Fix:** Current clients receive approval by polling Bloom's HTTPS backend with their high-entropy state and PKCE challenge. The website completes immediately after recording approval. Older clients retain a top-level loopback redirect, which is browser-compatible and avoids private-network fetch restrictions. Cancellation now reaches the same pending native attempt.
- **Regression checks:** Current-client approve/cancel, legacy loopback approve/cancel, stale browser tab, expired approval, wrong state/challenge, repeated approval, browser refresh, client closed before approval, and account switching before approval.

### Dedicated Social connection confirmation

- **Reported:** A successful approval only replaced the small status line at the bottom of the account-selection form, leaving the completed flow visually mixed with controls that were no longer usable.
- **Fix:** Current clients now navigate to a standalone connected screen after the server records approval. It contains one clear confirmation and tells the user to return to Bloom Client; the account list, permissions, approval controls, and query parameters are no longer left visible. Legacy clients retain their required top-level loopback redirect.
- **Regression checks:** Current-client approval reaches `/connect/connected/`, browser Back cannot approve twice, refresh keeps the confirmation screen, and legacy approval still redirects to loopback.
