## Context

Posts currently store only `body: String`. There is no image field, no media model, no upload route, and no image rendering in feed or thread cards. The `PostComposer` and `ReplyComposer` are text-only. Adding images requires: a storage backend for uploaded files, a schema change to associate images with posts, and UI changes to the composer and post display surfaces.

The avatar upload in Phase 10 accepted a URL string and required no storage infrastructure. Image upload here is different — users pick files from their device, so a real upload pipeline is needed.

## Goals / Non-Goals

**Goals:**
- Let a viewer attach 1–4 images when composing a top-level post or a reply
- Show a local preview of selected images in the composer before submission
- Upload images and store their URLs alongside the post on submit
- Render attached images in feed cards and thread post cards
- Allow body text to be empty when at least one image is attached

**Non-Goals:**
- Video or GIF upload
- Image editing, cropping, or filters in the browser
- Alt-text input (accessibility improvement, future phase)
- Image-only search or discovery
- Deleting or replacing images after a post is published

## Decisions

### Uploadthing for file storage
Uploadthing is a Next.js-native upload service with an App Router upload handler, a React component library (`@uploadthing/react`), and a free tier. It avoids AWS credential setup and provides CDN-backed URLs. The upload route lives at `apps/main/src/app/api/uploadthing/route.ts`, consistent with how Next.js API routes work.

Alternative considered: local `/public/uploads/`. Rejected — ephemeral in serverless/container deployments, no CDN, not viable for production.

Alternative considered: Cloudinary. Rejected — heavier SDK, transformation API adds complexity that isn't needed for MVP display.

### Separate `PostImage` model, not an array column
A dedicated `PostImage` model (`id`, `postId`, `url`, `order`) keeps the schema normalised, allows ordering images within a post, and makes it easy to add metadata (alt text, dimensions) in a future phase without a destructive migration.

Alternative considered: `imageUrls String[]` on `Post`. Rejected — PostgreSQL arrays are harder to query, can't store per-image metadata, and ordering requires a separate convention.

### Upload-first flow: upload on file selection, not on post submit
When the user picks images in the composer, they are uploaded immediately via the Uploadthing client. The returned URLs are held in component state. On submit, the post is created with both `body` and the collected image URLs. This keeps `createPostAction` a simple Server Action (no `FormData` / `File` handling server-side) and makes the preview instant — the `<img src>` is the real CDN URL from the moment the file is picked.

Alternative considered: upload on submit. Rejected — mixing file upload with Server Action data submission complicates the action signature and delays the preview.

### `body` is optional when images are attached; required when no images
`validatePostBody` currently requires non-empty body. Phase 13 relaxes this: a post is valid if `body` is non-empty **or** at least one image URL is present. The validation utility gains an `imageCount` parameter.

### Max 4 images per post
Consistent with common microblogging conventions and Uploadthing's free-tier file size limits. Enforced in the composer (disable the add-image button once 4 are selected) and in the server action.

### Display: responsive grid in feed and thread cards
1 image → full width. 2 images → 2-column grid. 3 images → 2-column with first spanning both rows. 4 images → 2×2 grid. Rendered as `<img>` tags with `object-cover` inside a fixed-height container. A dedicated `PostImageGrid` component used by both `FeedItem` and `PostCard`.

## Risks / Trade-offs

- **Uploadthing dependency** → External service; if it's unavailable uploads fail. Mitigation: fail gracefully with an inline error in the composer; already-uploaded CDN URLs are stable even if the service is down.
- **Upload-first wastes storage on abandoned drafts** → If a user uploads images then closes the composer without posting, the files are stored but never referenced. Acceptable for MVP; Uploadthing supports scheduled cleanup of unlinked files.
- **Schema migration required** → `PostImage` model must be added and `db:migrate` run before the feature works. No existing data is affected.
- **`body` optionality change** → Any callers that assume body is always non-empty need updating. Only `validatePostBody` and its call sites are affected.
