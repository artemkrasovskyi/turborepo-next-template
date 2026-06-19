# Domain Model

## Overview

Flock is a microblogging platform centered around users, posts, conversations, and social relationships.

The domain model prioritizes simplicity and explicit behavior over advanced social network features.

---

## User

A user represents a person using the platform.

Attributes:
- id
- username
- displayName
- email
- emailVerified
- bio
- avatarUrl
- createdAt
- updatedAt

Rules:
- Username must be unique.
- Email must be unique.
- A user can create many posts.
- A user can follow many users.
- A user can be followed by many users.
- A user can like many posts.
- A user can bookmark many posts.
- A user can participate in many direct-message conversations.
- A user can send many direct messages.
- A user can have many authenticated sessions.
- A user can have many linked auth accounts.

---

## Session

A session represents an authenticated browser session.

Attributes:
- id
- userId
- token
- expiresAt
- ipAddress
- userAgent
- createdAt
- updatedAt

Rules:
- A session belongs to exactly one user.
- A session token must be unique.
- A session is private authentication state.

---

## Account

An account connects a user to an authentication provider.

Attributes:
- id
- userId
- accountId
- providerId
- password
- createdAt
- updatedAt

Rules:
- A credential account stores the password hash for email/password sign-in.
- Passwords are never stored on `User`.
- A user may have multiple accounts for future provider support.

---

## Verification

A verification record stores short-lived auth verification data.

Attributes:
- id
- identifier
- value
- expiresAt
- createdAt
- updatedAt

Rules:
- Verification records are internal auth state.
- Verification records may expire.

---

## Post

A post is a short text message published by a user.

Attributes:
- id
- authorId
- body
- createdAt
- updatedAt

Rules:
- A post belongs to exactly one user.
- A post may receive likes.
- A post may be bookmarked by users.
- A post may receive replies.
- A post may appear in one or more feeds.
- Posts are immutable from a conversation perspective. Editing is out of scope for MVP.

---

## Reply

A reply is a post that references another post.

Rules:
- A reply is a specialized form of Post.
- Every reply references exactly one parent post.
- Replies belong to the same conversation thread as their parent.
- Replies are displayed chronologically.

---

## Thread

A thread represents a conversation.

Rules:
- Every thread has exactly one root post.
- A thread contains the root post and all replies.
- Replies are ordered chronologically.
- Nested replies are not required for MVP.

---

## Follow

A follow relationship connects two users.

Attributes:
- followerId
- followingId
- createdAt

Rules:
- A user cannot follow themselves.
- A follow relationship must be unique.
- Following a user allows their posts to appear in the follower's feed.

---

## Like

A like represents a user's reaction to a post.

Attributes:
- userId
- postId
- createdAt

Rules:
- A user may like a post only once.
- A like belongs to exactly one user and one post.
- Like counts are derived from Like relationships.

---

## Bookmark

A bookmark represents a private saved-post relationship between a user and a post.

Attributes:
- userId
- postId
- createdAt

Rules:
- A user may bookmark a post only once.
- A bookmark belongs to exactly one user and one post.
- Bookmarks are private to the bookmarking user.
- Bookmark counts are not exposed publicly in MVP.

---

## Conversation

A conversation represents a private direct-message thread between users.

Attributes:
- id
- createdAt
- updatedAt
- lastMessageAt

Rules:
- A conversation has participants.
- Phase 15 conversations are one-to-one and contain exactly two distinct participants.
- Only participants may read or write messages in a conversation.
- Conversations are ordered in the inbox by `lastMessageAt`.

---

## ConversationParticipant

A conversation participant connects a user to a conversation.

Attributes:
- conversationId
- userId
- createdAt

Rules:
- A participant relationship belongs to exactly one user and one conversation.
- A user may participate in a conversation only once.

---

## DirectMessage

A direct message is a private text message sent inside a conversation.

Attributes:
- id
- conversationId
- senderId
- body
- createdAt

Rules:
- A direct message belongs to exactly one conversation.
- A direct message has exactly one sender.
- The sender must be a participant in the conversation.
- Direct messages are plain text in MVP.

---

## Feed

A feed is a collection of posts visible to a user.

Rules:
- Feed content is generated from followed users.
- Feed ordering is chronological in MVP.
- Feed does not use ranking algorithms in MVP.
- Feed does not include sponsored content.
- Feed may be paginated.

---

## Profile

A profile represents the public view of a user.

Rules:
- A profile displays user information.
- A profile displays the user's posts.
- A profile displays follower and following counts.
- Profile visibility is public in MVP.

---

## Notifications

Notifications are informational events shown to a user.

Supported events:
- New follower
- New like on own post

Rules:
- Notifications are informational only.
- Real-time delivery is not required for MVP.
- Notifications may be loaded on demand.
