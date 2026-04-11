# Mobile-Specific Audit Checklist

Use this checklist during Step 5 of the site-audit-v2 walkthrough. Resize the browser to mobile viewport (375px width) or use Chrome device emulation. Walk through the same flow: homepage > collection > product page > cart > checkout.

**Context:** Over 60% of ecommerce traffic is mobile. Desktop CVR is typically 1.6-2.1x higher than mobile. A gap >2.5x signals a mobile UX problem (per benchmarks.md). The goal of this checklist is to identify mobile-specific friction that explains (or would explain) that gap.

---

## Mobile Navigation

| Element | What to Check | Strong | Weak |
|---------|--------------|--------|------|
| Hamburger menu | Is it easy to find and tap? Does it open smoothly? | Top-left or top-right, opens instantly, full category tree | Hidden, slow to open, only shows top-level categories |
| Menu depth | Can users reach products within 2 taps from the menu? | Categories > subcategories > products accessible | Deep nesting (3+ levels) requiring excessive taps |
| Search accessibility | Can users search from any page on mobile? | Persistent search icon in header, opens full-screen search with autocomplete | Search only on homepage, or hidden in hamburger menu |
| Back navigation | Can users navigate back intuitively? | Browser back works correctly, breadcrumbs present, sticky header with nav | Back button breaks (reloads page, jumps to wrong location) |
| Sticky header | Is the header always accessible while scrolling? | Slim sticky header with cart, search, menu — doesn't eat too much screen | Header scrolls away, or sticky header is too tall (>60px) |
| Cart access | Can users reach the cart from anywhere? | Persistent cart icon with item count in sticky header | Cart only accessible from certain pages |

---

## Mobile Homepage

| Element | What to Check | Strong | Weak |
|---------|--------------|--------|------|
| Hero on mobile | Does the hero image/text adapt to mobile? | Responsive image, readable text, CTA visible without scrolling | Desktop image cropped badly, text unreadable, CTA below fold |
| Value prop readability | Can the headline be read at mobile size? | Font size 18px+, high contrast, short enough for mobile width | Tiny text, low contrast, or headline wraps to 4+ lines |
| CTA size on mobile | Is the primary CTA tappable? | Full-width or near-full-width button, 44px+ height | Small button, hard to tap, competing with other elements |
| Content prioritization | Is mobile content ordered by importance? | Hero > products/collections > social proof (most important first) | Same desktop layout squeezed into mobile, non-essential content first |
| Announcement bar on mobile | Does it work on small screens? | 1-2 lines, dismissible, doesn't push content too far down | Wraps to 3+ lines, can't dismiss, pushes hero below fold |

---

## Mobile Collection Pages

| Element | What to Check | Strong | Weak |
|---------|--------------|--------|------|
| Grid layout | Product grid adapts to mobile? | 2-column grid with adequate spacing, consistent image ratios | 1-column (wastes space) or 3-column (too cramped) |
| Filter/sort accessibility | Can users filter and sort on mobile? | Sticky filter bar or floating filter button, full-screen filter overlay | Filters above grid (pushes products down) or not available on mobile |
| Product card tappability | Can users tap into products easily? | Cards have adequate spacing, tap target covers the full card | Cards too close together, accidental taps on wrong product |
| Infinite scroll on mobile | Does scrolling work smoothly? | Smooth loading, "load more" button as fallback, scroll position preserved | Janky loading, loses scroll position, no loading indicator |
| Quick add on mobile | Can users add to cart from the collection page? | Quick-add button on product card (especially for simple products) | Must tap into PDP for every product |

---

## Mobile Product Pages

| Element | What to Check | Strong | Weak |
|---------|--------------|--------|------|
| Image carousel | Swipeable, responsive, fast-loading? | Smooth swipe, dot indicators, pinch-to-zoom, images load progressively | Broken swipe, no zoom, images load slowly, no progress indicator |
| ATC button accessibility | Can users add to cart without excessive scrolling? | Sticky ATC button at bottom of screen, always visible | ATC only visible after scrolling past all content |
| Variant selection on mobile | Can users select size/color easily? | Large tappable swatches/buttons (44px+ tap targets), clear selected state | Tiny dropdown menus, hard to select on touch |
| Price visibility | Is the price always visible? | Price near title, stays visible as user scrolls | Price scrolls out of view before reaching ATC |
| Reviews on mobile | Can users read reviews without pain? | Scrollable reviews section, star summary at top, filter by rating | Full-page-length reviews section pushing other content far down |
| Description on mobile | Is product info scannable? | Accordion/tabs for description, specs, shipping — collapsed by default | Full desktop description displayed, requiring excessive scroll |
| BNPL on mobile | Is financing info visible on mobile? | Monthly payment callout near price, BNPL logo visible | BNPL info hidden on mobile or only at checkout |
| Trust signals on mobile | Are they present near the ATC? | Guarantee, shipping info, review stars visible near sticky ATC | Trust signals far above or below the purchase area |

---

## Mobile Cart & Checkout

| Element | What to Check | Strong | Weak |
|---------|--------------|--------|------|
| Cart drawer on mobile | Does the cart drawer work well on mobile? | Full-screen slide-out, easy to scroll, easy to dismiss | Partial overlay with scroll issues, hard to close |
| Checkout button size | Is the checkout CTA prominent? | Full-width button, high contrast, 48px+ height | Small button, below fold, low contrast |
| Express checkout on mobile | Are mobile-native payment options prominent? | Apple Pay / Google Pay / Shop Pay buttons above standard checkout | Express options hidden or only available at final step |
| Form fields on mobile | Are forms optimized for touch? | Large input fields, appropriate keyboard types (numeric for phone/zip), autofill | Tiny fields, wrong keyboard types, no autofill support |
| Keyboard behavior | Do forms handle the mobile keyboard well? | Viewport adjusts, active field stays visible, "next" button cycles fields | Keyboard covers input field, user must scroll manually |
| Address entry | Is address input streamlined? | Google Places autocomplete, minimal required fields | Full address form with no autocomplete, many required fields |
| Order summary on mobile | Can users see what they're buying? | Collapsible summary, visible by default, shows items + total | Hidden behind a click, no product images, confusing layout |
| Checkout steps | Is checkout progress clear? | Step indicator (1/3, 2/3, 3/3) or single-page checkout | No indication of how many steps remain |
| Error handling on mobile | How are form errors shown on touch devices? | Inline validation, auto-scroll to error, clear messages | Errors at top of page (scrolled out of view), generic messages |
| Post-checkout on mobile | Does the confirmation page work? | Clean confirmation, order number, email confirmation noted | Broken layout, truncated info, or redirect to desktop layout |

---

## Mobile Speed & Performance

| Element | What to Check | Strong | Weak |
|---------|--------------|--------|------|
| Perceived load time | Does the site feel fast on mobile? | Content appears within 1-2s, no visible layout shifts | 3+ seconds before content visible, major layout shifts |
| Image optimization | Are images sized for mobile? | Responsive images (srcset), WebP format, lazy loading below fold | Full-size desktop images served to mobile, no lazy loading |
| Layout shifts (CLS) | Does content jump around as it loads? | Stable layout — images have dimensions, fonts don't cause reflow | Text shifts when fonts load, images push content down, CLS >0.25 |
| Touch responsiveness | Do interactions respond instantly? | Buttons respond on first tap, no 300ms delay, smooth scrolling | Double-tap required, 300ms click delay, scroll jank |
| Scroll performance | Is scrolling smooth throughout? | 60fps scrolling, no jank on collection pages or product galleries | Janky scroll on pages with many images, sticky elements cause stutter |
| Offline/poor connection | What happens on slow mobile data? | Content loads progressively, no blank screens, error states helpful | White screen for 5+ seconds, broken images, no loading indicators |

---

## Mobile-Specific Friction Patterns

These are common patterns that kill mobile conversion. Flag any you observe:

**"Thumb zone" violations:** Key interactive elements (CTA, nav, cart) placed in hard-to-reach areas of the screen. Primary actions should be in the bottom half of the screen where thumbs naturally rest.

**"Scroll fatigue":** Users must scroll through 10+ screens of content before reaching the ATC button or checkout CTA. Mobile users have less patience — front-load the most important content.

**"Desktop squeeze":** The mobile experience is clearly just the desktop site squeezed into a narrow viewport. Elements overlap, text is tiny, buttons are too small, horizontal scroll appears.

**"Popup prison":** On mobile, popups that are easy to dismiss on desktop become screen-blocking overlays. Multiple overlays (cookie banner + email popup + chat widget) can make the site nearly unusable on mobile.

**"Form torture":** Checkout forms designed for desktop keyboards — date pickers that don't use native mobile date inputs, dropdowns instead of buttons for common selections (country, state), no autofill support.

**"Hidden cart":** No persistent cart indicator on mobile. Users add items, continue browsing, and can't remember if they have items in cart or how to get back to it.

**"Infinite scroll trap":** On collection pages with infinite scroll, users can never reach the footer (which often contains important links like return policy, contact). Also: losing scroll position after tapping into a product and hitting back.

---

## Scoring Guide

After completing the mobile audit, assign an overall mobile experience score:

- **Strong:** Mobile experience is intentionally designed. Sticky ATC, optimized checkout, fast loading, no major friction. CVR gap likely <2x.
- **OK:** Mobile is functional but not optimized. Some friction points but nothing catastrophic. CVR gap likely 1.5-2.5x.
- **Weak:** Mobile has significant UX problems. Multiple friction patterns present. Would expect CVR gap >2.5x.
- **Critical:** Mobile is essentially broken. Desktop squeeze, unusable checkout, major speed issues. Mobile is actively losing sales.

Record the score and the top 3 mobile-specific issues in the evidence file's findings section with the tag `[MOBILE]` in the title.
