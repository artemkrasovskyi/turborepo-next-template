# Frontend Search

## Requirement: Frontend Backend-Backed User Search

The main app SHALL use the backend Search Module for `/explore` user search results.

### Scenario: Viewer opens Explore with a search query

- **WHEN** a viewer opens `/explore?q=<query>` with a non-empty trimmed query
- **THEN** the main app SHALL request initial user search results from `GET /search/users`
- **AND** it SHALL render the returned users with the existing search results UI

### Scenario: Viewer loads more search results

- **WHEN** search results include `nextCursor` and the viewer activates load more
- **THEN** the main app SHALL request the next page from `GET /search/users`
- **AND** it SHALL include the current query and cursor
- **AND** it SHALL append the returned users to the existing list

### Scenario: Viewer state is available

- **WHEN** the main app has a current viewer id
- **THEN** backend search requests SHALL include `viewerId`
- **AND** returned `isFollowing` state SHALL be used by existing follow user cards

### Scenario: Viewer opens Explore without a search query

- **WHEN** `/explore` has no non-empty `q` parameter
- **THEN** the main app SHALL render the existing Explore recommendations experience
- **AND** it SHALL NOT request backend user search results

### Scenario: Backend search returns no users

- **WHEN** backend user search returns an empty page
- **THEN** the main app SHALL render the existing no-users-found empty state

### Scenario: Backend search request fails

- **WHEN** initial backend user search fails
- **THEN** the main app SHALL render an accessible search-results error state
- **AND** it SHALL NOT silently fall back to direct Prisma user search

### Scenario: Backend load-more request fails

- **WHEN** a load-more backend search request fails
- **THEN** the main app SHALL preserve already-rendered results
- **AND** it SHALL show an inline retry/error message for the load-more action

### Scenario: Existing search route remains

- **WHEN** the frontend search integration is added
- **THEN** `/explore?q=<query>` SHALL remain the search route
- **AND** the search bar SHALL continue to update the `q` query parameter
