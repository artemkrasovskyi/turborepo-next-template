## Why

The backend API now defines a Search Module with `GET /search/users`, but the main app's `/explore?q=` search still reads users through `@repo/api-client/features/search`, which calls Prisma directly. The frontend should consume the backend search API for user search so the search flow exercises the new backend boundary while preserving the existing Explore user experience.

## What Changes

- Update frontend user search on `/explore?q=<query>` to load results from the backend `GET /search/users` endpoint.
- Keep the existing search route, query-string behavior, result cards, empty state, and load-more interaction.
- Add a small frontend API client boundary for backend search requests.
- Keep Explore's no-query recommendations behavior unchanged.
- Keep backend search semantics and response shape unchanged.

## Impact

- Moves main-app user search reads from direct Prisma package calls to the Nest backend API.
- Preserves existing user-facing `/explore` navigation and UI behavior.
- Requires frontend configuration for the backend API base URL.
- Does not add post search, typeahead, unified results, or new frontend routes.
