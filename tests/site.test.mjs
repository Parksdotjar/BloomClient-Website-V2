import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the page uses the real Bloom product structure without filler", async () => {
  const html = await read("index.html");
  assert.match(html, /bloom-flower\.png/);
  assert.match(html, /client-home\.png/);
  assert.match(html, /Download for Windows/);
  assert.match(html, /Parksdotjar\/BloomClient-V2\/releases\/latest/);
  assert.match(html, /class="source-action" href="https:\/\/github\.com\/Parksdotjar\/BloomClient-V2"/);
  assert.match(html, /Manage instances, install content, tune performance, and launch from one place\./);
  assert.doesNotMatch(html, /Bloom Client<span|View releases|primary-action[^>]*>[\s\S]*M12 4v15/i);
  assert.doesNotMatch(html, /#1|best launcher|level up|adventure|community chat|testimonial|Coming soon/i);
  assert.match(html, /data-account-control/);
  assert.match(html, /href="\/signin\/"/);
  assert.doesNotMatch(html, /onclick=|javascript:/i);
});

test("the website has no moving hover treatment or remote font dependency", async () => {
  const [html, css] = await Promise.all([read("index.html"), read("src/style.css")]);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /src="\/src\/account-header\.js"/);
  assert.doesNotMatch(css, /:hover[^}]*transform\s*:/s);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /gradient\(|backdrop-filter|filter:\s*blur|box-shadow/i);
});

test("dashboard rail stays narrow and left aligned", async () => {
  const css = await read("src/style.css");
  assert.match(css, /grid-template-columns:\s*220px minmax\(0, 1fr\)/);
  assert.match(css, /\.dashboard-sidebar nav \{[^}]*justify-content:\s*stretch/s);
  assert.match(css, /\.dashboard-body \.site-header \{ border-bottom:/);
});

test("account menu pointer stays centered beneath the enlarged avatar", async () => {
  const css = await read("src/style.css");
  assert.match(css, /\.account-avatar \{ width:\s*46px; height:\s*46px/);
  assert.match(css, /\.account-menu::before \{[^}]*right:\s*29px[^}]*border-bottom:\s*8px solid #090a0b/s);
  assert.match(css, /\.account-menu \{[^}]*background:\s*#090a0b/s);
});

test("sign in and dashboard expose real account controls", async () => {
  const [signin, dashboard, authScript, dashboardScript, notificationScript] = await Promise.all([
    read("signin/index.html"),
    read("dashboard/index.html"),
    read("src/auth-client.js"),
    read("src/dashboard.js"),
    read("src/notification-bar.js"),
  ]);
  assert.match(signin, /data-provider="google"/);
  assert.match(signin, /data-provider="github"/);
  assert.match(signin, /google-mark\.svg/);
  assert.match(signin, /github-mark\.svg/);
  assert.doesNotMatch(signin, /Account capabilities|Your Bloom access|BLOOM ACCOUNT/);
  assert.match(dashboard, /Connected accounts/);
  assert.match(dashboard, /class="site-header"/);
  assert.match(dashboard, /data-site-notification/);
  assert.match(dashboard, /data-view-target="overview"/);
  assert.doesNotMatch(dashboard, /dashboard-account-switcher|data-sidebar-account-menu/);
  assert.match(dashboard, /data-connection-help-popover/);
  assert.match(dashboard, /data-revoke-sessions/);
  assert.match(dashboard, /data-delete-account/);
  assert.match(dashboard, /data-view-target="tickets"/);
  assert.match(dashboard, /data-ticket-create-form/);
  assert.match(authScript, /createAuthClient/);
  assert.match(dashboardScript, /linkSocial/);
  assert.match(dashboardScript, /unlinkAccount/);
  assert.match(dashboardScript, /revokeOtherSessions/);
  assert.match(dashboardScript, /deleteUser/);
  assert.match(dashboardScript, /notify\("Profile saved\."\s*,\s*"success"\)/);
  assert.match(dashboardScript, /"info"/);
  assert.match(dashboardScript, /"error"/);
  assert.doesNotMatch(dashboard, /dashboard-notice|Return to website/);
  assert.doesNotMatch(dashboard, /dashboard-sidebar-title/);
  assert.doesNotMatch(dashboard, /dashboard-information|<span class="eyebrow">DASHBOARD/);
  assert.match(notificationScript, /3000/);
});

test("the top-level destinations are real standalone pages", async () => {
  const pages = await Promise.all(["changelog/index.html", "tickets/index.html", "team/index.html", "community/index.html"].map(read));
  assert.match(pages[0], /Version 1\.1\.5|VERSION 1\.1\.5/);
  assert.match(pages[1], /My Tickets/);
  assert.match(pages[2], /AI assists/i);
  assert.match(pages[3], /discord\.gg\/9GbQxVCBhX/);
  for (const page of pages) assert.match(page, /Primary navigation/);
});

test("team and community use real structured destinations", async () => {
  const [team, community] = await Promise.all([read("team/index.html"), read("community/index.html")]);
  assert.match(team, /class="team-owner"/);
  assert.match(team, /class="team-work-list"/);
  assert.match(team, /A tool, not the owner/);
  assert.match(community, /class="community-routes"/);
  assert.match(community, /discord\.gg\/9GbQxVCBhX/);
  assert.match(community, /Parksdotjar\/BloomClient-V2/);
  assert.doesNotMatch(community, /TWITTER|Link pending/i);
});

test("signed-in account chrome hydrates without a Sign in flash", async () => {
  const [auth, header, css] = await Promise.all([read("src/auth-client.js"), read("src/account-header.js"), read("src/style.css")]);
  assert.match(auth, /bloom\.account-preview\.v1/);
  assert.match(auth, /cacheAccountPreview\(account\.user\)/);
  assert.match(header, /getCachedAccountPreview/);
  assert.match(header, /header-account-placeholder/);
  assert.match(css, /data-account-control[^}]*not\(\[data-account-ready\]\)[^}]*visibility:\s*hidden/s);
});

test("every page uses the packaged Bloom favicon", async () => {
  const paths = ["index.html", "changelog/index.html", "tickets/index.html", "team/index.html", "community/index.html", "signin/index.html", "connect/index.html", "connect/connected/index.html", "dashboard/index.html", "owner/index.html", "privacypolicy/index.html", "tos/index.html"];
  const pages = await Promise.all(paths.map(read));
  for (const page of pages) assert.match(page, /href="\/favicon\.ico" type="image\/x-icon"/);
});

test("native Social connection always requires explicit account approval", async () => {
  const [html, connected, script] = await Promise.all([read("connect/index.html"), read("connect/connected/index.html"), read("src/connect.js")]);
  assert.match(html, /Connect Bloom Client/);
  assert.match(html, /data-connect-accounts/);
  assert.match(html, /data-connect-approve/);
  assert.match(script, /listDeviceSessions|getSavedAccounts/);
  assert.match(script, /multiSession\.setActive/);
  assert.match(script, /v1\/social\/native\/approve/);
  assert.match(script, /location\.replace\("\/connect\/connected\/"\)/);
  assert.match(connected, /Connected to Bloom Client/);
  assert.match(connected, /return to Bloom Client now/);
  assert.match(script, /location\.replace\(result\.callbackUrl\)/);
  assert.match(script, /native\/cancel/);
});

test("the changelog is a real filterable release timeline", async () => {
  const [html, script] = await Promise.all([read("changelog/index.html"), read("src/changelog.js")]);
  assert.match(html, /class="release-timeline"/);
  assert.match(html, /Version 1\.1\.6/);
  assert.match(html, /datetime="2026-10-08"/);
  assert.match(html, /Version 1\.1\.5/);
  assert.match(html, /Version 1\.1\.4/);
  assert.match(html, /Version 1\.1\.2/);
  assert.match(html, /Version 1\.1\.1/);
  assert.match(html, /Version 1\.1\.0/);
  assert.match(html, /Version 1\.0\.9/);
  assert.match(html, /Version 1\.0\.8/);
  assert.match(html, /Filter updates/);
  assert.match(html, /data-filter="new"/);
  assert.match(html, /data-change-type="fixed"/);
  assert.match(script, /aria-pressed/);
  assert.match(script, /group\.hidden/);
});

test("tickets are account-backed with a progressive real submission flow", async () => {
  const [html, script, legacy] = await Promise.all([read("tickets/index.html"), read("src/tickets.js"), read("src/support-redirect.js")]);
  assert.match(html, /bloom-ticket-bunny\.png/);
  assert.match(html, /No ticket history|data-public-ticket-list/);
  assert.match(html, /data-form-step="category"/);
  assert.match(html, /data-form-step="issue"/);
  assert.match(html, /data-form-step="details"/);
  assert.match(script, /listTickets/);
  assert.match(script, /createTicket/);
  assert.match(script, /Issue: \$\{data\.get\("issue"\)\}/);
  assert.match(script, /Cape or cloak is missing/);
  assert.match(legacy, /location\.replace/);
});

test("primary navigation uses Tickets instead of Support", async () => {
  const pages = await Promise.all(["index.html", "changelog/index.html", "dashboard/index.html", "owner/index.html", "team/index.html", "community/index.html"].map(read));
  for (const page of pages) {
    assert.match(page, /href="\/tickets\/"/);
    assert.doesNotMatch(page, />Support<\/a>/);
  }
});

test("tickets have real user and owner surfaces", async () => {
  const [owner, ownerScript, ticketsScript, api, header] = await Promise.all([
    read("owner/index.html"), read("src/owner.js"), read("src/dashboard-tickets.js"), read("src/tickets-api.js"), read("src/account-header.js"),
  ]);
  assert.match(owner, /data-owner-panel="tickets"/);
  assert.match(owner, /data-owner-ticket-list/);
  assert.match(ownerScript, /listOwnerTickets/);
  assert.match(ownerScript, /replyToTicket/);
  assert.match(ownerScript, /setTicketStatus/);
  assert.match(ticketsScript, /createTicket/);
  assert.match(ticketsScript, /replyToTicket/);
  assert.match(api, /v1\/account\/capabilities/);
  assert.match(header, /capabilities\.owner/);
  assert.match(header, /Owner dashboard/);
});

test("ticket conversations use compact neutral controls", async () => {
  const [dashboard, ownerScript, css] = await Promise.all([read("dashboard/index.html"), read("src/owner.js"), read("src/style.css")]);
  assert.match(dashboard, /aria-label="Send reply"/);
  assert.match(dashboard, /m21 3-7\.6 18/);
  assert.match(dashboard, /<header><div><h2 data-ticket-subject/);
  assert.match(ownerScript, /aria-label\", \"Send reply/);
  assert.match(css, /\.ticket-message \{ width: fit-content;[^}]*max-width: min\(66%, 620px\)/s);
  assert.match(css, /\.ticket-message\[data-author="user"\] p \{ border-color: #2c3138;[^}]*background: #101214/s);
  assert.match(css, /\.ticket-reply textarea \{ min-height: 46px; height: 46px/);
  assert.match(css, /appearance: none;[^}]*background-image: url/s);
});

test("privacy and terms are complete standalone legal pages", async () => {
  const [home, signin, privacy, terms] = await Promise.all([
    read("index.html"),
    read("signin/index.html"),
    read("privacypolicy/index.html"),
    read("tos/index.html"),
  ]);
  assert.match(privacy, /Google user data/);
  assert.match(privacy, /encrypted at rest/);
  assert.match(privacy, /Retention and deletion/);
  assert.match(terms, /Acceptable use/);
  assert.match(terms, /MIT License/);
  assert.match(terms, /independent project/);
  assert.match(signin, /href="\/tos\/"/);
  assert.match(signin, /href="\/privacypolicy\/"/);
  assert.match(home, /href="\/privacypolicy\/"/);
});
