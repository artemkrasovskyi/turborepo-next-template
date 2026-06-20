# UI Design

## Requirements

### Requirement: Apple Web Visual Direction

The main app SHALL use an Apple-inspired web visual language across user-facing routes.

#### Scenario: User views any app route

- **WHEN** a user opens a main app page
- **THEN** the page SHALL use system typography
- **AND** adaptive `--color-background`, `--color-surface`, and `--color-surface-elevated` tokens
- **AND** restrained borders, separators, and shadows
- **AND** `--color-accent` for primary interactive emphasis

#### Scenario: Existing feature behavior is preserved

- **WHEN** the visual redesign is applied
- **THEN** existing routes, auth boundaries, server actions, and data contracts SHALL remain unchanged

### Requirement: Light and Dark Appearance

The main app SHALL support both light and dark appearances.

#### Scenario: System prefers light appearance

- **WHEN** the user's system preference is light
- **THEN** the app SHALL render using the light-theme values for `--color-background`, `--color-surface`, `--color-text`, and `--color-separator`

#### Scenario: System prefers dark appearance

- **WHEN** the user's system preference is dark
- **THEN** the app SHALL render using the dark-theme values for `--color-background`, `--color-surface`, `--color-text`, and `--color-separator`

#### Scenario: User overrides the theme via the nav toggle

- **WHEN** a signed-in user presses the theme toggle in the navigation bar
- **THEN** the app SHALL switch between the light and dark theme immediately
- **AND** the chosen theme SHALL be persisted to `localStorage` under the key `flock-theme`
- **AND** the toggle SHALL show a Sun icon when the dark theme is active and a Moon icon when the light theme is active
- **AND** the saved preference SHALL be applied before the first paint on subsequent page loads to prevent a flash of the wrong theme

#### Scenario: Saved preference takes precedence over system preference

- **WHEN** a user has saved a theme preference
- **THEN** that preference SHALL be used regardless of the operating system's `prefers-color-scheme` setting

#### Scenario: No saved preference exists

- **WHEN** no theme preference is stored in `localStorage`
- **THEN** the app SHALL follow the user's system `prefers-color-scheme` setting

#### Scenario: User interacts with controls in either appearance

- **WHEN** a user focuses, hovers, presses, disables, or triggers an error state
- **THEN** the state SHALL remain visible and meet readable contrast expectations in both appearances

### Requirement: Accessible Interaction

The main app SHALL preserve accessibility across redesigned visual states and controls.

#### Scenario: User navigates with a keyboard

- **WHEN** a user tabs through links, buttons, form fields, tabs, upload controls, and dialogs
- **THEN** focus order SHALL follow the visual and document order
- **AND** every focusable control SHALL have a visible focus indicator
- **AND** no keyboard trap SHALL be introduced

#### Scenario: User operates icon-only controls

- **WHEN** a control is represented primarily by an icon
- **THEN** the control SHALL expose an accessible name
- **AND** decorative icons SHALL be hidden from assistive technology

#### Scenario: User operates toggle controls

- **WHEN** a user likes, reposts, bookmarks, follows, selects a tab, or opens the current navigation destination
- **THEN** the selected, pressed, or current state SHALL be communicated visually
- **AND** the state SHALL be exposed to assistive technology with native semantics or appropriate ARIA

#### Scenario: User reviews form validation or async status

- **WHEN** a form, upload, mutation, pagination, or auth action returns an error, pending state, or success status
- **THEN** the status SHALL be programmatically associated with the relevant control or region where practical
- **AND** the message SHALL remain readable in each supported theme appearance

#### Scenario: User prefers reduced motion

- **WHEN** the user's system preference requests reduced motion
- **THEN** decorative transitions or animations SHALL be reduced or disabled
- **AND** functional state changes SHALL remain understandable without motion

### Requirement: Accent Tokens

The main app SHALL use semantic accent tokens for primary emphasis.

#### Scenario: Primary action is displayed

- **WHEN** a primary action button, selected tab, focused control, or prominent link is shown
- **THEN** it SHALL use `--color-accent`, `--color-accent-hover`, `--color-accent-foreground`, or `--color-focus-ring` as appropriate

#### Scenario: Semantic state is displayed

- **WHEN** an error, destructive action, success, warning, like, or other semantic state is shown
- **THEN** it MAY use an appropriate semantic state token such as `--color-danger`
- **AND** it SHALL NOT replace `--color-accent` as the main app accent token

### Requirement: Responsive Authenticated Navigation

The authenticated navigation SHALL adapt to desktop and mobile contexts.

#### Scenario: Signed-in user views the app on desktop

- **WHEN** the viewport is desktop-sized
- **THEN** the app SHALL show a sticky top navigation bar
- **AND** the bar SHALL use a translucent material treatment with blur and a subtle separator
- **AND** navigation items SHALL use consistent icons and readable labels
- **AND** the current page SHALL be communicated where practical

#### Scenario: Signed-in user views the app on mobile

- **WHEN** the viewport is mobile-sized
- **THEN** the app SHALL show a fixed bottom tab bar
- **AND** the tab bar SHALL respect safe-area padding
- **AND** page content SHALL NOT be hidden behind the tab bar

#### Scenario: Signed-out user views auth pages

- **WHEN** no viewer is signed in and the user opens sign-in or sign-up
- **THEN** authenticated navigation SHALL NOT be shown

### Requirement: Consistent Iconography

The main app SHALL use a consistent outline icon set for common navigation and actions.

#### Scenario: Navigation renders

- **WHEN** navigation items are displayed
- **THEN** each item SHALL use a consistent icon from the app icon set
- **AND** SHALL NOT use emoji as the primary visual icon

#### Scenario: Common social actions render

- **WHEN** reply, repost, like, bookmark, message, image upload, profile, search, notification, or sign-out actions are displayed
- **THEN** the app SHOULD use consistent outline icons where an icon improves recognition
- **AND** the accessible label or visible text SHALL remain clear

### Requirement: Shared Surface and Control Styling

The main app SHALL use shared visual treatments for repeated UI patterns.

#### Scenario: Card or grouped content surface renders

- **WHEN** feed items, profile headers, message rows, forms, notification rows, or empty states are displayed
- **THEN** they SHALL use consistent adaptive surface, border, radius, and spacing treatments

#### Scenario: Form control renders

- **WHEN** an input, textarea, upload control, or editable form is displayed
- **THEN** it SHALL use consistent adaptive control styling
- **AND** focused and invalid states SHALL be visible

#### Scenario: Button renders

- **WHEN** a primary, secondary, ghost, icon, or destructive button is displayed
- **THEN** its visual hierarchy SHALL be clear
- **AND** disabled and pending states SHALL remain distinguishable
- **AND** disabled controls SHALL expose disabled semantics when they cannot be activated

### Requirement: Comfortable Social App Density

The redesigned app SHALL use comfortable density suitable for reading and touch interaction.

#### Scenario: User scans feed or list content

- **WHEN** posts, notifications, users, bookmarks, recommendations, or messages are displayed
- **THEN** spacing SHALL support quick scanning without making the interface feel sparse
- **AND** primary touch targets SHALL remain comfortably tappable on mobile

#### Scenario: Text appears in constrained components

- **WHEN** labels, buttons, cards, tabs, or messages contain variable-length text
- **THEN** text SHALL not overlap adjacent UI
- **AND** text SHALL wrap, truncate, or resize according to the component's intended behavior

#### Scenario: User uses touch input on mobile

- **WHEN** primary actions, navigation items, tabs, and icon buttons are displayed on mobile
- **THEN** touch targets SHALL be large enough for comfortable activation
- **AND** adjacent controls SHALL have enough spacing to avoid accidental activation

### Requirement: Loading, Empty, and Error States

The redesigned app SHALL include Apple Web styling for non-happy-path UI states.

#### Scenario: Route or list is loading

- **WHEN** a loading state is shown
- **THEN** skeletons SHALL use `--color-skeleton` and consistent shape/radius with the destination surface
- **AND** loading regions SHALL not announce decorative skeleton content as meaningful content

#### Scenario: Empty state is shown

- **WHEN** a feed, list, search result, bookmark list, notification list, or message area has no content
- **THEN** the empty state SHALL use the shared Apple Web surface and typography treatment

#### Scenario: Error state is shown

- **WHEN** an error message or error route is displayed
- **THEN** it SHALL use readable semantic error tokens in each supported theme appearance
