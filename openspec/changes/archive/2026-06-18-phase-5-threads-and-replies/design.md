## Context

The `Post` model already has a `parentId: String?` self-reference in the Prisma schema, so replies are representable without a migration. The feed feature, post-composer, likes, and profile pages are complete. What's missing is the surface area to navigate to a thread, view replies, and compose new replies.

The existing `@repo/api-client/features/posts` only handles top-level post creation; it needs `getThread` and `createReply` added. The feed client returns posts but does not yet join reply counts.

## Goals / Non-Goals

**Goals:**
- Render a `/posts/[id]` thread page showing root post, inline reply composer, and chronological replies list
- Expose `replyCount` on feed items with a link navigating to the thread page
- Persist replies via a Next.js Server Action and reflect them without full page reload
- Handle not-found state for missing or non-existent post IDs

**Non-Goals:**
- Nested/recursive replies (only one level of replies in MVP)
- Real-time reply streaming
- Reply notifications (covered by notifications feature)
- Editing or deleting replies
- Pagination of replies within a thread

## Decisions

### Reuse `Post` model for replies via `parentId`
Self-referential `parentId` on `Post` is already in the schema. No new model, no migration. Replies are just posts with a non-null `parentId`, top-level posts have `parentId: null`. This keeps the domain model flat and avoids premature abstraction.

Alternative considered: separate `Reply` model. Rejected — extra join table, more complex queries, no benefit at this scale.

### Feature named `post-thread` in `apps/main`
The feature directory is `src/features/post-thread/` to match the concept of navigating to a specific post's thread context. Avoids collision with a generic `threads` name and aligns with the route segment `posts/[id]`.

### Single `PostCard` component for root post and replies
Both the root post and each reply share the same card UI (author, body, timestamp, like button). A single `PostCard` accepting a `ThreadPost` satisfies both. The thread page distinguishes root from replies via position, not component type.

### Server Action + `revalidatePath` for reply submission
Reply creation uses `createReplyAction` (a Next.js Server Action) that calls `postsClient.createReply()` then calls `revalidatePath('/posts/<parentId>')`. This re-fetches the thread page's RSC data, appending the new reply to the list without a full navigation. Consistent with how `createPostAction` works in post-composer.

Alternative considered: TanStack Query mutation + optimistic update. Rejected — the rest of the page is a Server Component; mixing RSC and client-state invalidation adds complexity without a clear need.

### Feed client includes `_count.replies` in the existing query
The `getHomeFeed` query already joins `_count: { select: { likes: true } }`. Adding `replies: true` to the same `_count` select is a single-line change — no second query, no N+1. The `FeedPost` type is extended with `replyCount: number`.

### Reply count links to thread page from feed
The feed item renders reply count as `<Link href="/posts/{id}">N replies</Link>`. The post body also wraps in the same link. Two distinct click targets both navigate to the thread page — author name/avatar links to profile, body/reply count links to thread. This matches the thread-page spec's "Feed Links to Threads" requirement.

## Risks / Trade-offs

- **No reply pagination** → Long threads will fetch all replies in one query. Acceptable for MVP; add cursor pagination when a thread exceeds ~100 replies in practice.
- **`revalidatePath` re-renders the full RSC tree** → A brief loading flash is visible after reply submission. The loading skeleton (`loading.tsx`) mitigates this. A client-side optimistic list would eliminate it but is out of scope.
- **`parentId: null` filter on thread root** → `getThread` fetches the root with `where: { id: postId, parentId: null }`, meaning reply posts cannot be directly deep-linked as thread roots. This is intentional — replies are not stand-alone threads in MVP.
