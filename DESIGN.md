# Bloom Client Website Design

For the approved breakdowns of polished content-heavy and dashboard interfaces, read [`PROFESSIONAL_INTERFACE_REFERENCE.md`](PROFESSIONAL_INTERFACE_REFERENCE.md). It is a reasoning library, not a set of templates to copy.

## Direction

The site is a direct product page. The current reference is Dawn's balance of heading, download area, and application screenshot. Use that balance with Bloom's own typography, blue accent, flower, wording, and real screenshot.

## Rules

- The header pairs the original Bloom flower with a plain Bloom Client wordmark. Use spacious icon-and-text navigation inspired by the user's Modrinth header reference, without copying its wallpaper or unrelated destinations.
- The hero uses the product name alone, centered and compact, with a blue period. Do not turn it into an oversized slogan or split it into a competing two-column poster.
- Download points to the current GitHub Releases destination until the backend owns a verified direct installer route.
- Use the real Home screenshot in `public/client-home.png`. Never build a fake client mockup in HTML or generate one with AI.
- OLED black is the page surface. Bloom blue is reserved for actions, small labels, and restrained background depth.
- Let the genuine launcher screenshot explain the product. Do not add a descriptive mini-paragraph beside the heading or repeat capabilities in numbered feature panels.
- The screenshot is followed by large editorial feature sections. Give built-in Modrinth installation prominent treatment, then show instances and Global File Sync with genuine client screenshots.
- Supporting features use one clean three-column strip. Avoid small documentation-like rows, fake product previews, marketing statistics, auto-scrolling project feeds, or claims that are not implemented.
- Surfaces are solid OLED black or near-black with simple borders. Do not use gradients, radial backgrounds, blur, glow, glass effects, or ambient light effects.
- Use locally bundled Fredoka across the website to match Bloom Client’s rounded typography. Do not fetch fonts from a third-party CDN at runtime.
- No statistics, testimonials, Discord counters, ads, staff notices, fake news bars, or floating support widgets.
- No Minecraft blocks, characters, landscapes, pixel fonts, or game screenshots as decoration.
- Interactions change color only. Nothing lifts, scales, bounces, follows the pointer, or animates without a functional reason.
- The header reserves a visible Sign in action that opens Bloom's own account page. Google and GitHub controls must fail closed when their server credentials are unavailable and must never redirect to an unrelated destination or simulate a session.

## Account surfaces

- Sign in uses one focused Google/GitHub choice with no Bloom password field, marketing carousel, gradients, or decorative blur.
- A signed-in header replaces Sign in with the provider avatar and a small disclosure. Its menu contains only Dashboard, Switch account, and Sign out.
- The dashboard separates global website navigation from local account navigation. Overview, Profile, Connections, and Security are durable peers; do not invent analytics, billing, teams, or metrics to make the workspace look fuller.
- Account sections use aligned flat rows and a small number of raised identity surfaces. The current action—not every card—gets visual emphasis.
- Provider linking is explicit. Never visually imply that matching emails were merged, and never expose a disconnect action that can remove the final sign-in method.

## Page structure

1. Wide, unboxed header with Bloom branding left, The client / Releases / Source code centrally, and Get Bloom right. On narrow screens the navigation gets its own row; no dead account controls.
2. Compact centered product name with the Windows download and releases link directly beneath it.
3. Full-width real Bloom Home screenshot in normal document flow with one quiet rounded edge. No invented window bar.
4. Alternating screenshot-and-copy sections for Modrinth, instances, and Global File Sync.
5. A restrained supporting-feature strip for AutoTune, Locker, and pack sharing.
6. Minimal copyright and support footer.

## Site pages

- The approved header is shared by every page. Its larger primary links are The client, Changelog, Tickets, Team, and Community; release files remain available from download actions and the Changelog page rather than a Releases tab. Sign in owns the far-right account-action position.
- Every primary navigation item includes a simple line icon with consistent size and stroke. Icons identify destinations; they do not sit in tiles or decorative containers.
- Changelog, Tickets, Team, and Community are separate pages, not appended sections on Home. Tickets is account-backed and uses real private conversations rather than generic support-directory filler.
- Team states plainly that Parks is the sole project owner and that AI assists implementation, debugging, documentation, and review under Parks's direction and release control.
- Community links the verified Bloom Discord and GitHub. Do not invent a Twitter/X handle; show it as pending until Parks supplies the official URL.

Avoid background flowers, grid wallpaper, vertical page borders, repeated download hero sections, and oversized centered titles. Responsive layouts stack the introduction before the screenshot; never absolutely position the screenshot beneath a fixed-height hero.
