## 1. OpenSpec Validation

- [ ] 1.1 Create the OpenSpec change files
- [ ] 1.2 Run `openspec validate Phase-19-search-module --strict`
- [ ] 1.3 Do not begin implementation until the change has been reviewed

## 2. Frontend Backend Search Client

- [ ] 2.1 Add a main-app search API client for `GET /search/users`
- [ ] 2.2 Read the backend API base URL from a server-side env var with local default `http://localhost:3002`
- [ ] 2.3 Encode `query`, `cursor`, `limit`, and optional `viewerId` as URL query parameters
- [ ] 2.4 Return `FollowListPage` and throw on non-2xx responses
- [ ] 2.5 Keep backend fetch logic server-only

## 3. Explore Search Integration

- [ ] 3.1 Update `/explore?q=` initial user search to call the backend search client
- [ ] 3.2 Update `loadMoreUserSearchAction` to call the backend search client
- [ ] 3.3 Preserve `SearchBar`, query-string navigation, and existing result card rendering
- [ ] 3.4 Preserve no-query Explore recommendations behavior
- [ ] 3.5 Preserve empty results and load-more error states
- [ ] 3.6 Add an accessible initial-load error state for backend search failures

## 4. Tests

- [ ] 4.1 Test backend search client URL construction and query encoding
- [ ] 4.2 Test backend search client non-2xx error handling
- [ ] 4.3 Test `/explore?q=` calls the backend search client for initial results
- [ ] 4.4 Test load-more calls the backend search client with `cursor`
- [ ] 4.5 Test no-query Explore still uses recommendations and does not call backend user search
- [ ] 4.6 Keep tests mocked and independent from a running Nest API

## 5. Verification

- [ ] 5.1 Run `bunx turbo typecheck --filter=@repo/main`
- [ ] 5.2 Run `bunx turbo lint --filter=@repo/main`
- [ ] 5.3 Run `bunx turbo test --filter=@repo/main`
- [ ] 5.4 Run `bunx turbo build --filter=@repo/main`
- [ ] 5.5 With both apps running, manually verify `/explore?q=<query>` and load-more behavior
