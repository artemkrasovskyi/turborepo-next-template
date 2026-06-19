## 1. Schema & Migration

- [x] 1.1 Add `PostImage` model to `prisma/schema.prisma` — fields: `id String @id @default(cuid())`, `postId String`, `url String`, `order Int`, relation `post Post @relation(fields: [postId], references: [id], onDelete: Cascade)`, index `@@index([postId])`
- [x] 1.2 Add `images PostImage[]` relation to the `Post` model in `prisma/schema.prisma`
- [x] 1.3 Run `bun run db:migrate` to apply the migration and `bun run db:generate` to regenerate Prisma Client

## 2. Uploadthing Setup

- [x] 2.1 Install dependencies: `bun add uploadthing @uploadthing/react` in `apps/main`
- [x] 2.2 Create Uploadthing file router at `apps/main/src/app/api/uploadthing/core.ts` — define `imageUploader` route accepting up to 4 `image` files, max 4 MB each
- [x] 2.3 Create Next.js API route at `apps/main/src/app/api/uploadthing/route.ts` — export GET and POST handlers from the file router
- [x] 2.4 Add `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` to `.env.example`

## 3. Types

- [x] 3.1 Add `PostImage` type to `packages-types/src/features/posts/index.ts` — `{ id: string; url: string; order: number }`
- [x] 3.2 Add `images: PostImage[]` to `ThreadPost` type in `packages-types/src/features/posts/index.ts`
- [x] 3.3 Add `images: PostImage[]` to `FeedPost` type in `packages-types/src/features/feed/index.ts`
- [x] 3.4 Update `CreatePostInput` and `CreateReplyInput` in `packages-types/src/features/posts/index.ts` to include `imageUrls?: string[]`
- [x] 3.5 Update `validatePostBody` in `packages-types/src/features/posts/index.ts` to accept an optional `imageCount` parameter — body is required only when `imageCount` is 0

## 4. API Client

- [x] 4.1 Update `createPost` in `packages/api-client/src/features/posts/index.ts` to accept `imageUrls` and create `PostImage` records in the same transaction using `prisma.$transaction`
- [x] 4.2 Update `createReply` similarly to accept and persist `imageUrls`
- [x] 4.3 Update `getThread` to include `images: { select: { id, url, order }, orderBy: { order: asc } }` in the Prisma include for both root and replies
- [x] 4.4 Update `getHomeFeed` in `packages/api-client/src/features/feed/index.ts` to include `images` in the post query and map them onto `FeedPost.images`
- [x] 4.5 Update `getProfilePosts` in `packages/api-client/src/features/profile/index.ts` to include and map `images`

## 5. Post Image Grid Component

- [x] 5.1 Create `PostImageGrid` component at `apps/main/src/features/ui/components/post-image-grid.tsx` — renders 1–4 images in a responsive grid (1→full, 2→2-col, 3→2-col first-spans, 4→2×2); each image is an `<img>` with `object-cover`; accepts `images: PostImage[]`

## 6. Composer — Image Picker

- [x] 6.1 Update `PostComposer` to add an image picker button that opens a hidden `<input type="file" multiple accept="image/*">`; selected files are uploaded via Uploadthing client on selection; returned URLs stored in state; previews rendered below the textarea using `PostImageGrid` with local object URLs
- [x] 6.2 Add a remove button on each preview image to deselect it before posting
- [x] 6.3 Disable the image picker button once 4 images are selected
- [x] 6.4 Pass collected `imageUrls` to `createPostAction` on submit
- [x] 6.5 Update `ReplyComposer` with the same image picker and preview logic, passing `imageUrls` to `createReplyAction`

## 7. Server Actions

- [x] 7.1 Update `createPostAction` in `apps/main/src/features/post-composer/actions.ts` to accept `imageUrls: string[]`, pass them to `postsClient.createPost`, and pass `imageUrls.length` to `validatePostBody`
- [x] 7.2 Update `createReplyAction` in `apps/main/src/features/post-thread/actions.ts` similarly

## 8. Post Display

- [x] 8.1 Update `FeedItem` to render `<PostImageGrid images={post.images} />` below the post body when `post.images.length > 0`
- [x] 8.2 Update `PostCard` to render `<PostImageGrid images={post.images} />` below the post body when `post.images.length > 0`
