# Graph Report - .  (2026-06-24)

## Corpus Check
- 237 files · ~73,138 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 987 nodes · 1385 edges · 84 communities (66 shown, 18 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Main App Pages & Routes|Main App Pages & Routes]]
- [[_COMMUNITY_Direct Messages & Conversations|Direct Messages & Conversations]]
- [[_COMMUNITY_Auth & Navigation|Auth & Navigation]]
- [[_COMMUNITY_Post & Reply Composition|Post & Reply Composition]]
- [[_COMMUNITY_Loading States & Skeletons|Loading States & Skeletons]]
- [[_COMMUNITY_Build Config & Tooling|Build Config & Tooling]]
- [[_COMMUNITY_OpenSpec Workflow & Architecture|OpenSpec Workflow & Architecture]]
- [[_COMMUNITY_API Client Package|API Client Package]]
- [[_COMMUNITY_Follow & Explore Features|Follow & Explore Features]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Profile Management UI|Profile Management UI]]
- [[_COMMUNITY_Main App Dependencies|Main App Dependencies]]
- [[_COMMUNITY_Notification UI|Notification UI]]
- [[_COMMUNITY_Shared Types Package|Shared Types Package]]
- [[_COMMUNITY_Likes & Reactions Design|Likes & Reactions Design]]
- [[_COMMUNITY_Main App Dev Dependencies|Main App Dev Dependencies]]
- [[_COMMUNITY_Nodes List App|Nodes List App]]
- [[_COMMUNITY_Profile Content Components|Profile Content Components]]
- [[_COMMUNITY_User Discovery Lists|User Discovery Lists]]
- [[_COMMUNITY_Social Engagement Buttons|Social Engagement Buttons]]
- [[_COMMUNITY_Shared Package|Shared Package]]
- [[_COMMUNITY_Apple Web UI Design|Apple Web UI Design]]
- [[_COMMUNITY_Recommendations & Bookmarks|Recommendations & Bookmarks]]
- [[_COMMUNITY_Like Button Components|Like Button Components]]
- [[_COMMUNITY_Bookmarks Data Layer|Bookmarks Data Layer]]
- [[_COMMUNITY_Feed Components|Feed Components]]
- [[_COMMUNITY_Bookmark & Like Models|Bookmark & Like Models]]
- [[_COMMUNITY_Prisma Database Layer|Prisma Database Layer]]
- [[_COMMUNITY_Domain Models & Follow|Domain Models & Follow]]
- [[_COMMUNITY_Follow Types & Search|Follow Types & Search]]
- [[_COMMUNITY_App Layout & Explore|App Layout & Explore]]
- [[_COMMUNITY_Trending Posts & Feed Authors|Trending Posts & Feed Authors]]
- [[_COMMUNITY_Main App TypeScript Config|Main App TypeScript Config]]
- [[_COMMUNITY_Nodes List TypeScript Config|Nodes List TypeScript Config]]
- [[_COMMUNITY_Profile Edit Design|Profile Edit Design]]
- [[_COMMUNITY_Auth & DM Access Control|Auth & DM Access Control]]
- [[_COMMUNITY_Follow Button & Actions|Follow Button & Actions]]
- [[_COMMUNITY_Auth Concepts|Auth Concepts]]
- [[_COMMUNITY_Following List|Following List]]
- [[_COMMUNITY_Hashtags & Mentions|Hashtags & Mentions]]
- [[_COMMUNITY_API Client TypeScript Config|API Client TypeScript Config]]
- [[_COMMUNITY_Search Bar & Explore UI|Search Bar & Explore UI]]
- [[_COMMUNITY_Feed Spec & Pagination|Feed Spec & Pagination]]
- [[_COMMUNITY_Recommendations Engine|Recommendations Engine]]
- [[_COMMUNITY_Architecture Principles|Architecture Principles]]
- [[_COMMUNITY_Thread & Reply Domain|Thread & Reply Domain]]
- [[_COMMUNITY_Shared Package TypeScript Config|Shared Package TypeScript Config]]
- [[_COMMUNITY_Profile Types & Queries|Profile Types & Queries]]
- [[_COMMUNITY_ESLint TypeScript Config|ESLint TypeScript Config]]
- [[_COMMUNITY_Bookmarks Spec|Bookmarks Spec]]
- [[_COMMUNITY_Likes Spec & Toggle|Likes Spec & Toggle]]
- [[_COMMUNITY_Follow API Client|Follow API Client]]
- [[_COMMUNITY_Reposts Feature|Reposts Feature]]
- [[_COMMUNITY_Feed Time Formatting|Feed Time Formatting]]
- [[_COMMUNITY_Notifications Time Formatting|Notifications Time Formatting]]
- [[_COMMUNITY_Thread Time Formatting|Thread Time Formatting]]
- [[_COMMUNITY_Profile Load More|Profile Load More]]
- [[_COMMUNITY_Prisma Seed Data|Prisma Seed Data]]
- [[_COMMUNITY_Recommendations Spec|Recommendations Spec]]
- [[_COMMUNITY_Error Page|Error Page]]
- [[_COMMUNITY_Nodes List App Layout|Nodes List App Layout]]
- [[_COMMUNITY_Notifications Design|Notifications Design]]
- [[_COMMUNITY_Types Package Config|Types Package Config]]
- [[_COMMUNITY_Main Next.js Config|Main Next.js Config]]
- [[_COMMUNITY_Main Tailwind Config|Main Tailwind Config]]
- [[_COMMUNITY_Nodes List Next.js Config|Nodes List Next.js Config]]
- [[_COMMUNITY_Nodes List Tailwind Config|Nodes List Tailwind Config]]
- [[_COMMUNITY_Repost Feed Strategy|Repost Feed Strategy]]
- [[_COMMUNITY_Like Toggle Result|Like Toggle Result]]
- [[_COMMUNITY_Profile Management Tasks|Profile Management Tasks]]
- [[_COMMUNITY_Reposts Tasks|Reposts Tasks]]
- [[_COMMUNITY_Hashtags Tasks|Hashtags Tasks]]
- [[_COMMUNITY_Media Tasks|Media Tasks]]
- [[_COMMUNITY_Profile Page Tasks|Profile Page Tasks]]
- [[_COMMUNITY_Thread Page Tasks|Thread Page Tasks]]

## God Nodes (most connected - your core abstractions)
1. `getViewerUser` - 36 edges
2. `compilerOptions` - 21 edges
3. `EmptyState()` - 17 edges
4. `SkeletonCard()` - 15 edges
5. `FeedItem()` - 13 edges
6. `scripts` - 13 edges
7. `exports` - 13 edges
8. `requireViewerUser()` - 12 edges
9. `FeedPage` - 12 edges
10. `exports` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Recent Users Section` --semantically_similar_to--> `Suggested Users Algorithm`  [INFERRED] [semantically similar]
  openspec/changes/archive/2026-06-18-phase-9-search-discovery/design.md → openspec/changes/archive/2026-06-19-phase-17-recommendation-feed/design.md
- `Bookmark Toggle Optimistic UI Feedback` --semantically_similar_to--> `Like Toggle with Optimistic Feedback`  [INFERRED] [semantically similar]
  openspec/specs/bookmarks/spec.md → openspec/specs/likes/spec.md
- `Follow Button Reflects Relationship State` --semantically_similar_to--> `Bookmark Toggle Optimistic UI Feedback`  [INFERRED] [semantically similar]
  openspec/specs/follow-system/spec.md → openspec/specs/bookmarks/spec.md
- `Thread Reply Composition` --semantically_similar_to--> `Post Composition with Validation`  [INFERRED] [semantically similar]
  openspec/specs/thread-page/spec.md → openspec/specs/post-composer/spec.md
- `RootLayout()` --calls--> `getViewerUser`  [INFERRED]
  apps/main/src/app/layout.tsx → apps/main/src/features/auth/lib/viewer.ts

## Import Cycles
- 1-file cycle: `packages/api-client/src/features/direct-messages/index.ts -> packages/api-client/src/features/direct-messages/index.ts`
- 1-file cycle: `packages/api-client/src/features/feed/index.ts -> packages/api-client/src/features/feed/index.ts`
- 1-file cycle: `packages/api-client/src/features/follow/index.ts -> packages/api-client/src/features/follow/index.ts`
- 1-file cycle: `packages/api-client/src/features/notifications/index.ts -> packages/api-client/src/features/notifications/index.ts`
- 1-file cycle: `packages/api-client/src/features/posts/index.ts -> packages/api-client/src/features/posts/index.ts`
- 1-file cycle: `packages/api-client/src/features/profile/index.ts -> packages/api-client/src/features/profile/index.ts`
- 1-file cycle: `packages/api-client/src/features/users/index.ts -> packages/api-client/src/features/users/index.ts`

## Hyperedges (group relationships)
- **OpenSpec Change Lifecycle Propose Apply Archive** — opsx_propose_command, opsx_apply_command, opsx_archive_command [EXTRACTED 0.95]
- **Feed Data Layer Prisma Models Feed Client Cursor Pagination** — feed_prisma_models, feed_api_surface, feed_cursor_pagination [EXTRACTED 0.95]
- **Follow Mutation Flow FollowButton Server Action Follow Client** — follow_button_component, toggle_follow_action, follow_client [EXTRACTED 0.95]
- **Social Engagement Toggle Pattern (Like, Repost, Follow)** — likes_design_likebutton, phase11_design_repostbutton, likes_design_optimistic_toggle [INFERRED 0.85]
- **Post Creation Pipeline (Composer -> Action -> Client -> Prisma)** — postcomposer_design_postcomposer, postcomposer_design_createpostaction, postcomposer_design_createpostsclient [EXTRACTED 1.00]
- **Notification Creation Flow (Action -> Client -> Model)** — notifications_design_notifyfollow, notifications_design_notifylike, notifications_design_notification_model [EXTRACTED 1.00]
- **Explore Landing Page Content Surfaces** — explore_route, trending_posts, recent_users, search_discovery_feature [EXTRACTED 0.95]
- **Recommendation Feed Upgrades Explore Landing** — explore_route, suggested_users, recommended_posts, recommendation_feed_feature [EXTRACTED 0.95]
- **Direct Messages Prisma Schema Models** — conversation_model, conversation_participant_model, direct_message_model [EXTRACTED 1.00]
- **Optimistic UI Toggle Pattern (Like, Bookmark, Follow)** — likes_toggle, bookmarks_toggle_feedback, follow_button_state [INFERRED 0.85]
- **Apple Web UI Design System (Tokens, Icons, Nav, Accessibility)** — phase18_css_variables, phase18_lucide_icons, phase18_navigation, phase18_accessibility [EXTRACTED 1.00]
- **Notification Trigger System (Follow and Like Events)** — notifications_follow, notifications_like, domain_notifications [EXTRACTED 1.00]

## Communities (84 total, 18 thin omitted)

### Community 0 - "Main App Pages & Routes"
Cohesion: 0.06
Nodes (39): { GET, POST }, Page(), BookmarksPage(), DirectMessageComposer(), DirectMessageComposerProps, directMessagesClient, InboxList(), InboxListProps (+31 more)

### Community 1 - "Direct Messages & Conversations"
Cohesion: 0.05
Nodes (47): Conversation Prisma Model, ConversationParticipant Prisma Model, Conversation Route /messages/[conversationId], DirectMessage Prisma Model, Direct Messages Feature, createDirectMessagesClient API Client, EmptyState Component, getViewerUser React cache() Dedup Pattern (+39 more)

### Community 2 - "Auth & Navigation"
Cohesion: 0.05
Nodes (32): Session Authentication Feature, Better Auth Library Integration, NavBar(), NavBarProps, NavItem, NavLinks(), NavLinksProps, SignInForm() (+24 more)

### Community 3 - "Post & Reply Composition"
Cohesion: 0.07
Nodes (30): PostComposer(), PreviewImage, PreviewImage, ReplyComposer(), ReplyComposerProps, postsClient, ThreadPage(), ThreadPageProps (+22 more)

### Community 4 - "Loading States & Skeletons"
Cohesion: 0.09
Nodes (14): SKELETON_KEYS, SkeletonCard(), SkeletonCircle(), SkeletonLine(), SkeletonNotificationRow(), SkeletonProps, POST_KEYS, USER_KEYS (+6 more)

### Community 5 - "Build Config & Tooling"
Cohesion: 0.05
Nodes (36): devDependencies, eslint, eslint-config-airbnb, eslint-config-airbnb-typescript, eslint-config-next, eslint-config-prettier, eslint-import-resolver-typescript, eslint-plugin-import (+28 more)

### Community 6 - "OpenSpec Workflow & Architecture"
Cohesion: 0.09
Nodes (33): API Client Direct Prisma Pattern, Feed Change Design 2026-06-13, Feed Change Tasks 2026-06-13, Follow System Change Design 2026-06-13, Follow System Change Tasks 2026-06-13, Delta Spec, Feature-Based Layout Convention, Feed API Surface createFeedClient (+25 more)

### Community 7 - "API Client Package"
Cohesion: 0.07
Nodes (29): dependencies, react, @repo/shared, @repo/types, devDependencies, @types/node, @types/react, vitest (+21 more)

### Community 8 - "Follow & Explore Features"
Cohesion: 0.09
Nodes (27): Batch isFollowing Query Pattern, Explore Route /explore, FollowListPage Type, FollowListUser Type, Follow Page Feature (Followers/Following Lists), FollowUserCard Component, Followers Route /profile/[username]/followers, Following Route /profile/[username]/following (+19 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, esModuleInterop, exactOptionalPropertyTypes, ignoreDeprecations, incremental, isolatedModules, jsx (+17 more)

### Community 10 - "Profile Management UI"
Cohesion: 0.11
Nodes (18): EditProfileButton(), EditProfileButtonProps, EditProfileForm(), EditProfileFormProps, MessageButton(), MessageButtonProps, getInitials(), joinDateFormatter (+10 more)

### Community 11 - "Main App Dependencies"
Cohesion: 0.08
Nodes (23): dependencies, @chakra-ui/react, @emotion/react, @prisma/client, name, packageManager, prisma, seed (+15 more)

### Community 12 - "Notification UI"
Cohesion: 0.13
Nodes (17): getInitials(), NotificationItem(), NotificationItemProps, truncate(), NotificationLoadMoreButton(), NotificationLoadMoreButtonProps, loadMoreNotificationsAction(), notificationsClient (+9 more)

### Community 13 - "Shared Types Package"
Cohesion: 0.09
Nodes (22): devDependencies, vitest, exports, ./features/bookmarks, ./features/direct-messages, ./features/feed, ./features/follow, ./features/likes (+14 more)

### Community 14 - "Likes & Reactions Design"
Cohesion: 0.13
Nodes (21): createLikesClient Factory, FeedPost likeCount/isLikedByViewer Extension, Like Model (Prisma Schema), LikeButton Component, Optimistic Like Toggle Pattern, toggleLikeAction Server Action, Likes Feature Tasks, createNotificationsClient Factory (+13 more)

### Community 15 - "Main App Dev Dependencies"
Cohesion: 0.10
Nodes (20): devDependencies, autoprefixer, jsdom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/node, @types/react (+12 more)

### Community 16 - "Nodes List App"
Cohesion: 0.10
Nodes (20): dependencies, next, react, react-dom, @repo/api-client, @repo/shared, @repo/types, devDependencies (+12 more)

### Community 17 - "Profile Content Components"
Cohesion: 0.15
Nodes (15): EmptyState(), EmptyStateProps, LikedPosts(), LikedPostsProps, likesClient, profileClient, ProfilePosts(), ProfilePostsProps (+7 more)

### Community 18 - "User Discovery Lists"
Cohesion: 0.16
Nodes (12): FollowUserCard(), FollowUserCardProps, getInitials(), FollowersListProps, RecentUsersProps, SuggestedUsersLoadMoreButton(), SuggestedUsersLoadMoreButtonProps, SuggestedUsers() (+4 more)

### Community 19 - "Social Engagement Buttons"
Cohesion: 0.16
Nodes (13): toggleBookmarkAction(), BookmarkButton(), BookmarkButtonProps, FeedItemProps, LikeButton(), getInitials(), PostCard(), PostCardProps (+5 more)

### Community 20 - "Shared Package"
Cohesion: 0.12
Nodes (16): dependencies, @prisma/client, devDependencies, @repo/types, @types/node, exports, ./features/app-config, ./features/database (+8 more)

### Community 21 - "Apple Web UI Design"
Cohesion: 0.20
Nodes (16): Accessibility as Design Constraint, Apple Web Visual Language, CSS Design Token Variables, Phase 18 Apple Web UI Design, Lucide React Icons, Responsive Navigation (Top Bar / Bottom Tab), Phase 18 Apple Web UI Tasks, Semantic Accent Tokens (+8 more)

### Community 22 - "Recommendations & Bookmarks"
Cohesion: 0.18
Nodes (10): BookmarkParams, GetBookmarkedPostsParams, RecommendedPostsLoadMoreButton(), RecommendedPostsLoadMoreButtonProps, RecommendedPosts(), RecommendedPostsProps, FeedPage, loadMoreRecommendedPostsAction() (+2 more)

### Community 23 - "Like Button Components"
Cohesion: 0.18
Nodes (9): LikeButtonProps, LikedPostsLoadMoreButton(), LikedPostsLoadMoreButtonProps, likesClient, loadMoreLikedPostsAction(), notificationsClient, { like, unlike, notifyLike }, toggleLikeAction() (+1 more)

### Community 24 - "Bookmarks Data Layer"
Cohesion: 0.19
Nodes (9): bookmarksClient, loadMoreBookmarkedPostsAction(), createBookmarksClient(), ToggleBookmarkResult, BookmarkedPosts(), BookmarkedPostsProps, bookmarksClient, BookmarkedPostsLoadMoreButton() (+1 more)

### Community 25 - "Feed Components"
Cohesion: 0.21
Nodes (10): FeedItem(), getInitials(), feedClient, FeedList(), FeedListProps, LoadMoreButton(), LoadMoreButtonProps, feedClient (+2 more)

### Community 26 - "Bookmark & Like Models"
Cohesion: 0.17
Nodes (12): BookmarkButton Component, Bookmark Prisma Model, createBookmarksClient API Client, Bookmarks Feature, getLikedPosts API Client Method, Likes Feature (User Likes Page), Liked Posts Page /profile/[username]/likes, Phase 14 Bookmarks Design (+4 more)

### Community 27 - "Prisma Database Layer"
Cohesion: 0.18
Nodes (7): globalForPrisma, createLikesClient(), GetLikedPostsParams, LikeParams, createRepostsClient(), RepostParams, getCachedViewerUser

### Community 28 - "Domain Models & Follow"
Cohesion: 0.18
Nodes (12): Follow Relationship Domain Entity, Notifications Domain Concept, Profile Domain Concept, Follow Button Reflects Relationship State, Follow Relationship Management, Follow System Specification, Follow Notifications, Notifications Specification (+4 more)

### Community 29 - "Follow Types & Search"
Cohesion: 0.20
Nodes (8): FollowListPage, ToggleFollowResult, loadMoreUserSearchAction(), searchClient, createSearchClient(), RecentUsersParams, SearchUsersParams, TrendingPostsParams

### Community 30 - "App Layout & Explore"
Cohesion: 0.22
Nodes (9): metadata, RootLayout(), FollowersList(), ExplorePage(), followClient, FollowersPage(), PageProps, profileClient (+1 more)

### Community 31 - "Trending Posts & Feed Authors"
Cohesion: 0.22
Nodes (6): TrendingPostsProps, authorSelect, FeedAuthor, FeedEntry, FeedPost, GetHomeFeedParams

### Community 32 - "Main App TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, paths, plugins, exclude, extends, include, @/*, @repo/api-client/* (+2 more)

### Community 33 - "Nodes List TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, paths, plugins, exclude, extends, include, @/*, @repo/api-client/* (+2 more)

### Community 34 - "Profile Edit Design"
Cohesion: 0.22
Nodes (11): EditProfileButton Component, EditProfileForm Component, Inline Edit Form vs Separate Route Rationale, updateProfileAction Server Action, validateProfileInput Utility, createProfileClient Factory, Profile Page Route (/profile/[username]), ProfileHeader Component (+3 more)

### Community 35 - "Auth & DM Access Control"
Cohesion: 0.20
Nodes (10): Protected Routes, Conversation Access Control, Conversation Thread View, Direct Messages Inbox (/messages), One-to-One Conversations, Direct Messages Specification, Conversation Domain Entity, ConversationParticipant Domain Entity (+2 more)

### Community 36 - "Follow Button & Actions"
Cohesion: 0.24
Nodes (7): FollowButton(), FollowButtonProps, followClient, loadMoreFollowersAction(), notificationsClient, { follow, unfollow, notifyFollow }, toggleFollowAction()

### Community 37 - "Auth Concepts"
Cohesion: 0.28
Nodes (9): Better Auth Integration, Email and Password Authentication, Public Routes with Viewer State, Server-Derived Mutation Identity, Session-Backed Viewer, Authentication Specification, Account Domain Entity, Session Domain Entity (+1 more)

### Community 38 - "Following List"
Cohesion: 0.25
Nodes (7): FollowingList(), FollowingListProps, loadMoreFollowingAction(), followClient, FollowingPage(), PageProps, profileClient

### Community 39 - "Hashtags & Mentions"
Cohesion: 0.25
Nodes (9): createHashtagsClient Factory, Hashtag Model (Prisma Schema), Hashtag Page Route (/hashtags/[tag]), parseSocialText Shared Parser Utility, Post Creation Transaction (hashtags+mentions in one tx), PostHashtag Join Model, PostMention Model, SocialText Rendering Component (+1 more)

### Community 40 - "API Client TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, paths, types, extends, include, @repo/shared/*, @repo/types/*

### Community 41 - "Search Bar & Explore UI"
Cohesion: 0.29
Nodes (6): SearchBar(), SearchBarProps, UserSearchResults(), ExplorePageProps, recommendationsClient, searchClient

### Community 42 - "Feed Spec & Pagination"
Cohesion: 0.25
Nodes (8): Feed Domain Concept, Chronological Feed Ordering, Feed Composition (Followed + Own Posts), Feed Cursor-Based Pagination, Feed Specification, Post Composition with Validation, Composer Real-Time Feedback, Post Composer Specification

### Community 43 - "Recommendations Engine"
Cohesion: 0.32
Nodes (6): GetRecommendedPostsParams, GetSuggestedUsersParams, RECOMMENDED_POST_WEIGHTS, scoreRecommendedPost(), scoreSuggestedUser(), SUGGESTED_USER_WEIGHTS

### Community 44 - "Architecture Principles"
Cohesion: 0.29
Nodes (7): Feature-First Structure Principle, No HTTP Layer Principle, Prisma Singleton Pattern, Shared Types in @repo/types, Architecture Specification, Specs Before Code Principle, Flock Project Overview

### Community 45 - "Thread & Reply Domain"
Cohesion: 0.48
Nodes (7): Post Domain Entity, Reply Domain Entity, Domain Model Specification, Thread Domain Entity, Thread Reply Composition, Thread Page Specification, Thread View (Root Post + Replies)

### Community 46 - "Shared Package TypeScript Config"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, types, extends, include, @repo/types/*

### Community 47 - "Profile Types & Queries"
Cohesion: 0.47
Nodes (4): GetProfilePostsParams, ProfileUser, UpdateProfileInput, ValidateProfileResult

### Community 48 - "ESLint TypeScript Config"
Cohesion: 0.33
Nodes (5): compilerOptions, allowJs, checkJs, extends, include

### Community 49 - "Bookmarks Spec"
Cohesion: 0.40
Nodes (5): Bookmark Privacy, Save and Unsave Post (Idempotent), Bookmarks Specification, Bookmark Toggle Optimistic UI Feedback, Bookmark Domain Entity

### Community 50 - "Likes Spec & Toggle"
Cohesion: 0.50
Nodes (5): Like Domain Entity, Like State and Count Display, Likes Specification, Like Toggle with Optimistic Feedback, Like Notifications

### Community 51 - "Follow API Client"
Cohesion: 0.50
Nodes (3): createFollowClient(), FollowListParams, FollowParams

### Community 52 - "Reposts Feature"
Cohesion: 0.40
Nodes (3): repostsClient, toggleRepostAction(), ToggleRepostResult

### Community 56 - "Profile Load More"
Cohesion: 0.50
Nodes (3): ProfileLoadMoreButton(), ProfileLoadMoreButtonProps, loadMoreProfilePostsAction()

### Community 57 - "Prisma Seed Data"
Cohesion: 0.67
Nodes (3): hoursAgo(), main(), prisma

### Community 58 - "Recommendations Spec"
Cohesion: 0.50
Nodes (4): Explore Landing Page (/explore), Recommended Posts Algorithm, Recommendations Specification, Suggested Users Algorithm

### Community 61 - "Notifications Design"
Cohesion: 0.67
Nodes (3): NotificationItem Component, NotificationLoadMoreButton Component, Notifications Page (/notifications)

## Knowledge Gaps
- **437 isolated node(s):** `nextConfig`, `name`, `private`, `build`, `dev` (+432 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Better Auth Library Integration` connect `Auth & Navigation` to `Main App Pages & Routes`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Auth & Navigation` to `Main App Dev Dependencies`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `private` to the rest of the system?**
  _452 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Main App Pages & Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.05727644652250146 - nodes in this community are weakly interconnected._
- **Should `Direct Messages & Conversations` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._
- **Should `Auth & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.05410628019323672 - nodes in this community are weakly interconnected._
- **Should `Post & Reply Composition` be split into smaller, more focused modules?**
  _Cohesion score 0.06533776301218161 - nodes in this community are weakly interconnected._