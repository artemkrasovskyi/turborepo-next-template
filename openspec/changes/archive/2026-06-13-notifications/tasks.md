1. Add a `Notification` model (`recipientId`, `actorId`, `type: NotificationType`, `postId?`, `createdAt`, `@@index([recipientId, createdAt])`) plus a `NotificationType` enum (`FOLLOW`, `LIKE`) and `User`/`Post` back-relations, and generate a migration (`bun run db:migrate --name add_notification_model`)
2. Create shared notification types (`packages-types/src/features/notifications`) — `NotificationType`, `NotificationActor`, `NotificationItem`, `NotificationPage`
3. Create notifications client (`packages/api-client/src/features/notifications`) — `notifyFollow()`, `notifyLike()` (resolves recipient from the post and skips self-likes), `getNotifications()` with cursor pagination
4. Change `createFollowClient().follow()` from `upsert` to an existence check + `create`, returning `{ created: boolean }`
5. Change `createLikesClient().like()` from `upsert` to an existence check + `create`, returning `{ created: boolean }`
6. Wire `toggleFollowAction` to call `notifyFollow` when `follow()` reports `created: true`
7. Wire `toggleLikeAction` to call `notifyLike` when `like()` reports `created: true` (create `toggleLikeAction` per the `likes` design first if it doesn't exist yet)
8. Create `loadMoreNotificationsAction` server action
9. Create `NotificationItem` component (FOLLOW vs LIKE rendering, links to the actor's profile or the liked post's thread page)
10. Create `NotificationLoadMoreButton` component mirroring `ProfileLoadMoreButton`
11. Create `/notifications` page with empty state and no-viewer state
12. Add a "Notifications" link to the home page header
13. Update package exports (`packages-types`, `packages/api-client`) for the notifications feature
