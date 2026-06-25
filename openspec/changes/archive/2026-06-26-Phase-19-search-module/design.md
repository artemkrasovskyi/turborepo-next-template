## Context

The main app currently renders `/explore` in two modes: with no `q` parameter it shows suggested users and recommended posts, and with `q` it shows user search results. User search is implemented through `@repo/api-client/features/search`, which calls Prisma directly.

Backend Phase 1 defines a Nest endpoint, `GET /search/users`, with the same user-search page shape. The frontend phase should switch only the user-search path to that backend endpoint. Explore recommendations should stay on the existing recommendation client.

## Goals / Non-Goals

**Goals:**
- Use the backend `GET /search/users` endpoint for `/explore?q=` initial results
- Use the same backend endpoint for load-more pagination
- Preserve the existing `SearchBar`, `UserSearchResults`, `FollowUserCard`, and `/explore?q=` UX
- Preserve optional viewer-specific `isFollowing` behavior by passing the current viewer id
- Keep tests mocked and independent from a running backend server

**Non-Goals:**
- Change no-query Explore recommendations
- Add post search, typeahead, unified search, saved search, or search history
- Change backend search endpoint semantics
- Remove `@repo/api-client/features/search` entirely
- Add authentication/session handling to the backend API

## Decisions

### Frontend API boundary

Add a main-app-local backend search client under `apps/main/src/features/search/`. It should call `GET /search/users` and return `FollowListPage` from `@repo/types/features/follow`.

The client must encode `query`, `cursor`, `limit`, and optional `viewerId` as query parameters. It must treat non-2xx backend responses as errors so the existing load-more error UI can handle failures.

### Backend API base URL

Use a server-side environment variable for the Nest API origin, such as `API_BASE_URL`, with a local default of `http://localhost:3002`. Do not expose the backend origin through a `NEXT_PUBLIC_` variable unless client-side browser fetching is introduced later.

### Explore route behavior

Keep `/explore` as the only frontend search route. The page continues reading `searchParams.q`, trimming the query, and rendering:
- search results when `q` is non-empty
- suggested users and recommended posts when `q` is empty or absent

Initial search results should be loaded on the server by calling the backend search client. Load-more should remain a Server Action and call the same backend search client with `cursor`.

### Error and empty states

Empty search results continue rendering the current "No users found" state. Load-more backend failures continue using the existing inline retry/error behavior. Initial backend failures should render an accessible error state for the search results area rather than silently falling back to direct Prisma.

### Compatibility

Keep `@repo/api-client/features/search` available because other code may still import it and Explore no-query behavior does not need to change. This phase only changes the `/explore?q=` user-search data source.

## Risks / Trade-offs

- The main app now depends on the Nest API being reachable for search results.
- Keeping the old package-client search temporarily creates duplicate data-access paths, but it reduces migration risk.
- Passing `viewerId` remains a temporary compatibility mechanism until backend session-derived viewer identity is specified.
