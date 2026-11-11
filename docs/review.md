# Prototype review

Running list from the step-by-step review of the prototype (http://localhost:5174). Notes are collected here first; fixes are made in batches after approval, then rechecked.

Status: **To fix** (approved for me to change) · **Designer** (question for the designer) · **OK** (reviewed, no change)

## Onboarding

| Screen | Layout | Note | Status |
| --- | --- | --- | --- |
| C02 Sign up / sign in | Web + mobile | Both layouts open on the email step ("Create your account"); the code step starts empty with no error. The Figma web frame's "That code didn't match" view is now the Error state in the toolbar. | Done |
| All screens | Web + mobile | Grey-filled input fields are correct. | OK |
| All steps | Web + mobile | Demo card (prototype only, not in Figma), like hub360: available on every step from a small tab in the top-left corner; starts closed and stays open or closed as you move between steps. No "Demo" text. Top to bottom: "Prototype shortcuts" header, theme switch (sun/moon icon animates with the mode), "Use Demo Account" at the bottom, always shown and disabled on steps with nothing to fill in. The screen’s own button moves on. | Done |
| All pages | Web + mobile | Bottom prototype toolbar removed from view (dark mode moved to the demo card). `?bar=1` in the address brings it back for the tab (device, screen states, Figma link); `?bar=0` hides it again. | Done |
| C02 Sign up / sign in | Web + mobile | Demo card "Use Demo Account" fills the email and mobile, then the code (123456). Only the demo code verifies; other codes show "That code didn’t match". | Done |
| C41 Agreements (step 3 of 6) | Web + mobile | Opens with nothing ticked and no error message (Figma ticks some items and the web frame shows the error on load). The error and the "These agreements are required" dialog appear only after "Agree and continue" with a required item unticked. Applies to the tenant version too. | Done |
| Sign-up steps 1–6 | Web + mobile | Main button disabled until the step's required inputs are filled: C02 Send code (valid email + 10-digit mobile, both start empty), C02 Verify (6 digits), C41 Agree and continue (every required agreement), C04 Continue (address, now starts empty; confirmed details can't be blank). C03 Language (English preselected), C06 and C07 have nothing required. "Use Demo Account" fills each one. | Done |
| C41 → C04 | Web + mobile | Homeowner "Agree and continue" goes straight to C04 Your home, skipping the journey's X08 Terms step (it has no forward button and the toolbar is gone; Terms still opens from the "Read" links). | Done |
| C41 Agreements (step 3 of 6) | Web + mobile | Demo card "Use Demo Account" ticks every required item and clears the error / blocked dialog. | Done |
| C39 + C01 (onboarding steps 1 and 2) | Web + mobile | Combined into one page: the C39 landing page now carries C01 Welcome’s three points (Know your home, Never miss upkeep, Pros booked for you, as an icon list in the hero) and "I have an account". The C01 step is removed from the journey, so Get started goes straight to C02 sign in (now onboarding/2; later steps moved up one). C76 Log out and C83 "This isn’t my home" now go to the landing page. | Done |
| C06 Agent intro (onboarding/7) | Web + mobile | The four agent abilities are cards (icon tile, title, description) instead of list rows: 2×2 grid on web, stacked on mobile. | Done |
| C39 Marketing landing page | Web | Content (hero, How it works, Plans, footer) sits in a centred 1024px column; the top nav bar stays full width. Figma uses the full 1440 with 80px side margins. | Done |
| C39 Marketing landing page | Web | "How it works" cards all the same height (they were sized to their text). | Done |
| C39 Marketing landing page | Web | Hero swapped: image on the left, "Your home, handled." text on the right (Figma has text left). | Done |
| C39 Marketing landing page | Web + mobile | Hero placeholder replaced with a photo of homes in the Tucson foothills (JC Cervantes, Unsplash free licence) and a phone showing a screenshot of C08 Home dashboard. Figma still has the grey placeholder; the designer may want the real asset. The phone screenshot is static, so it won't update if C08 changes, and it stays light in dark mode. | Done |

## Home and account

| Screen | Layout | Note | Status |
| --- | --- | --- | --- |
| Home switcher (mobile header, web side nav) | Web + mobile | Clicking "Home · address ▾" opens "Your homes": the account's four homes (from C38) as a radio list with role and plan. Picking one makes it the current home everywhere (header, side nav, C08 greeting) and is remembered; "Manage homes" opens C38. Mobile: bottom sheet in the phone; web: panel under the switcher. Before, it jumped straight to C38. Landlord / tenant switchers still open C38. | Done |

## All screens

| Screen | Layout | Note | Status |
| --- | --- | --- | --- |
| Side-menu web screens (75 incl. landlord + tenant) | Web | Content sits in one centred column, max 800px, to the right of the side menu. Big side-by-side columns (e.g. Home’s 400px side column) are stacked in reading order: main content first, then what sat beside it. Small cards may stay side by side (e.g. C14 quote cards 2-up). One shell rule covers every `hc-<code>-web__cols` wrapper (55 screen variants). Scanned all screens: content 800px, no sideways scroll, no big columns left. Figma uses the full 1192px content area. | Done |
| C11 Plan | Web | "This year" moved to the top, above the task list, as three Stat Tiles across the column (Done 12, Due this month 4, Skipped 1) with the numbers emphasised at Heading 1 size. Figma has a list card in the side column under the bundle banner. | Done |
| C11 Plan | Web + mobile | Month view cleaned up: November and December are each their own card inside the task card, side by side on web (one under the other on mobile), as compact calendars with 40px round day cells, task days highlighted with a dot and the overdue day in red. The month view itself isn’t in Figma (prototype addition). | Done |
| C11 Plan | Web | Header spans the 800px column: "Plan" on the left, List / Month on the right edge (lined up with the cards below). | Done |
| C40 My jobs | Web | Header: Upcoming / Active / Past chips now sit right next to "New request" (8px, same as between the chips); the title takes the spare width. | Done |
| C34 Settings (Account) | Web | Profile Edit / Change and "Who can see valuables" now open inline editors (Input or Select) with Save / Cancel; Enter saves, Esc cancels; Save is disabled until the email or phone is valid. Theme actually switches the prototype (Match my device / Light / Dark). Edits last until you leave the page. Shared piece: `_editable-row.tsx`. | Done |
| Every step | Web + mobile | Any button or link with nothing attached is disabled (greyed, not clickable). HC Button disables itself when it has no action; DetailRow has `actionDisabled` for actions Figma draws without a destination; text links, the top bar's "English ▾", BottomActions' secondary link and one-off links/mic buttons are disabled too. Scanned every journey step on web and mobile: no live control does nothing. C13 "Replace file" now opens the file picker instead. | Done |
| Every step | Web + mobile | Actions that modify a value say "Edit" instead of "Change" (Settings profile and privacy rows, Who will be home, Pay with / Billed to / Payment method, Plan, Spend limit, Estimate times, budget, device mapping, the dashboard agent spend, chat and request rows, and C89 "Edit payment method"). Domain terms stay: "Change order" and "Suggest a change". Differs from the Figma copy. | Done |
| Side nav (HC/Web Side Nav) | Web | Emergency moved from the bottom of the left menu to just above Home (under the home switcher), for homeowner, landlord and tenant. Differs from Figma, which pins it to the bottom. | Done |
| C34 Settings (Account) | Web + mobile | Added a full-width secondary "Log out" button at the bottom of the Account stack (under the cards on web, under "Delete account" on mobile). It returns to the landing page (C39). Not in Figma. | Done |
| C04 Home profile setup (onboarding step 4 of 6) | Web + mobile | The card is broken into numbered steps: 1 Home address, 2 Who is this home for?, 3 Is this right? (step 3 is the second screen on mobile). Step 1 has a "Confirm address" button (enabled once an address is typed); steps 2 and 3 are dimmed and not clickable until the address is confirmed. "Is this right?" stays empty until then and fills in from public records for the confirmed street. Editing the address un-confirms it. "Use Demo Account" fills and confirms the address. Rental-owner variant unchanged. | Done |
| Prototype URLs | Web + mobile | The URL now shows who you are playing: homeowner journeys stay at /homeowner/<journey>/<step>, landlord starts at /landlord/portfolio/1 and tenant at /tenant/home/1. Next, Back, menu links and screen jumps keep that user in the URL (a landlord opening Account goes to /landlord/settings-and-account/1). Old /homeowner/landlord-portfolio/… and /homeowner/tenant/… links redirect. Menus and screens are unchanged. | Done |
| Landlord journey | Web + mobile | The landlord journey now starts with the shared sign-up steps: 1 landing page (C39), 2 sign up (C02), 3 language (C03), 4 consents (C41), then 5 rental-owner home setup (C04, "Step 4 of 6") and the portfolio screens (13 steps in all, /landlord/portfolio/1–13). Figma’s J1 landlord section starts at C04. | Done |
