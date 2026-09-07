# Design QA — Network first-launch invitation flow

## Source visual truth

- Figma: `https://www.figma.com/design/M41ryp7zaL85FO7Th4hNaM/Referral-app?node-id=1070-8153`
- Target flow: Network overview → contacts ready to invite → invitation preview → 1,000-point reward → invitation sent.
- Source nodes: overview `1070:7668`, contacts `1076:10695`, preview `1070:8373`, reward `1070:8512`, sent `1070:8451`.
- Comparison size: 390 × 844 CSS px at device scale factor 1. The overview reference was center-cropped from its surrounding 434 × 888 Figma presentation frame.

## Implementation evidence

- Local preview: `http://127.0.0.1:5173/`
- Browser: headless Chrome controlled with Playwright.
- Implementation captures:
  - `qa-screenshots/01-network-overview.png`
  - `qa-screenshots/02-contacts-ready.png`
  - `qa-screenshots/03-invitation-preview.png`
  - `qa-screenshots/04-reward-1000.png`
  - `qa-screenshots/05-invitation-sent.png`
  - `qa-screenshots/06-first-launch-invited-empty.png`
- Side-by-side source/implementation comparisons:
  - `qa-screenshots/compare-01-network-overview.png`
  - `qa-screenshots/compare-02-contacts-ready.png`
  - `qa-screenshots/compare-03-invitation-preview.png`
  - `qa-screenshots/compare-04-reward-1000.png`
  - `qa-screenshots/compare-05-invitation-sent.png`

## Full-view and focused comparisons

- Network overview: hierarchy, card sizing, spacing, colors, and fixed bottom navigation align with the Figma source. The black border in the source capture belongs to the Figma presentation frame, not the app screen.
- Contacts: tabs, search, heading/count, contact-card density, row separators, and Invite actions align. The implementation intentionally preserves the source's seven visible rows while displaying the specified `5 people` count.
- Invitation preview: exact Figma hero, banner, invitation card, copy action, and share-channel assets are used. Crop and wrapping align at 390 px.
- Reward: exact 1,000-point typography and celebration/confetti assets are used; composition and CTA placement align.
- Invitation sent: status artwork, copy, contact row, unlock banner, and bottom actions align.
- First-launch Invited tab: verified with zero summary cards and zero contact rows; the screen uses the same empty-list structure and Invite more people recovery action as Registered.

## Interaction and runtime checks

- Opened Network overview and selected the first Invite action.
- Selected Mai Anh from the contacts view.
- Selected Zalo from the invitation preview.
- Advanced from the reward scene with Next.
- Opened View invited contacts and verified the active tab changed to `Invited`.
- Browser console errors: none.
- Unhandled page errors: none.

## Comparison history

1. Initial implementation had four actionable P2 mismatches: the flow started in an unsynced-contact state, individual Invite did not open the selected person's preview directly, the 1,000-point reward scene was missing, and the overview bottom navigation was hidden behind content.
2. Added the synced first-launch state, direct Mai Anh invitation path, reward stage, exact Figma assets/copy, and corrected bottom-navigation visibility and stacking.
3. First visual pass found the contacts list too sparse, an extra Swipe up hint, and an incorrect invitation-link color. Increased visible row density, removed the hint for the synced state, and corrected link styling.
4. Re-captured and re-compared all five scenes. No actionable P0, P1, or P2 mismatch remains.
5. Removed returning-user sample invitees from the first-launch Invited tab and hid the invited summary when its count is zero. A full first-launch browser run verified the empty state before any invitation is sent.

## Residual P3 polish

- The overview's code-native utility icons have slight optical differences from the source vectors.
- The selected contact is normalized as `Mai Anh`; one Figma banner renders the surname as lowercase `Mai anh`.

final result: passed
