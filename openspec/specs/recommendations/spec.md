# Recommendations

## Requirements

### Requirement: Explore Landing Page

The system SHALL display personalized recommendations on the `/explore` route when no search query is present.

#### Scenario: Viewer opens Explore with no query

- **WHEN** a user opens `/explore` without a `q` parameter
- **THEN** the system SHALL render a `Suggested users` section
- **AND** the system SHALL render a `Recommended posts` section

#### Scenario: Viewer opens Explore with a search query

- **WHEN** a user opens `/explore?q=<query>` with a non-empty query
- **THEN** the system SHALL render user search results for that query
- **AND** the system SHALL NOT render suggested users or recommended posts

### Requirement: Suggested Users

The system SHALL suggest users that the viewer has not yet followed.

#### Scenario: Viewer is excluded from suggestions

- **WHEN** suggested users are generated for a viewer
- **THEN** the viewer's own account SHALL NOT appear in the list

#### Scenario: Already-followed users are excluded

- **WHEN** suggested users are generated for a viewer
- **THEN** users already followed by the viewer SHALL NOT appear in the list

#### Scenario: Social proximity candidates are included

- **WHEN** suggested users are generated for a viewer who follows at least one user
- **THEN** users followed by the viewer's followed users SHALL be included as candidates

#### Scenario: Recently active users are included as fallback

- **WHEN** suggested user candidates are sparse
- **THEN** users who authored a top-level post within the last 7 days SHALL be included as fallback candidates

#### Scenario: Recently joined users are included as final fallback

- **WHEN** suggested user candidates are still sparse
- **THEN** users who joined within the last 30 days SHALL be included as final fallback candidates

#### Scenario: Viewer follow state is returned

- **WHEN** suggested users are returned
- **THEN** each user SHALL carry a `isFollowing` field reflecting the viewer's current follow state

### Requirement: Suggested User Ranking

The system SHALL rank suggested users deterministically.

#### Scenario: Ranking formula

- **WHEN** suggested users are ranked
- **THEN** the score SHALL be computed as:
  `mutualFollowedByCount × 100 + followerCount × 3 + recentPostCount7d × 5 + accountRecencyBoost`
- **AND** tie-breaking SHALL use `createdAt` descending, then `id` descending

#### Scenario: Social proximity dominates for typical account sizes

- **WHEN** a candidate has one mutual-followed-by connection
- **THEN** that candidate SHALL rank above a candidate with no mutual connection and up to 33 followers

#### Scenario: Account recency boost

- **WHEN** a candidate's account was created within the last 30 days
- **THEN** a small boost up to 10 points SHALL be added to their score
- **AND** the boost SHALL be zero for accounts older than 30 days

### Requirement: Recommended Posts

The system SHALL recommend top-level posts from outside the viewer's home feed.

#### Scenario: Only top-level posts are recommended

- **WHEN** recommended posts are generated
- **THEN** posts with a non-null `parentId` (replies) SHALL NOT appear

#### Scenario: Viewer-authored posts are excluded

- **WHEN** recommended posts are generated for a viewer
- **THEN** posts authored by the viewer SHALL NOT appear

#### Scenario: Followed-author posts are excluded when practical

- **WHEN** recommended posts are generated for a viewer who follows users
- **THEN** posts authored by users the viewer follows SHOULD NOT appear, as those belong in the home feed

#### Scenario: Social engagement candidates are included

- **WHEN** recommended posts are generated for a viewer who follows users
- **THEN** posts liked or reposted by those followed users SHALL be included as candidates

#### Scenario: Second-hop author candidates are included

- **WHEN** recommended posts are generated
- **THEN** top-level posts by authors followed by people the viewer follows SHALL be included as candidates

#### Scenario: Recently engaged posts are included as fallback

- **WHEN** recommended post candidates are sparse
- **THEN** public top-level posts with engagement within the last 7 days SHALL be included as fallback candidates

### Requirement: Recommended Post Ranking

The system SHALL rank recommended posts deterministically.

#### Scenario: Ranking formula

- **WHEN** recommended posts are ranked
- **THEN** the score SHALL be computed as:
  `followedUserEngagementCount × 80 + authorFollowedByFollowedUsersCount × 50 + likeCount × 4 + repostCount × 8 + replyCount × 2 + recencyBoost`
- **AND** tie-breaking SHALL use `createdAt` descending, then `id` descending

#### Scenario: Followed-user engagement dominates for typical engagement counts

- **WHEN** a post has one followed-user engagement (like or repost)
- **THEN** that post SHALL rank above a post with no followed-user engagement and up to 19 likes

#### Scenario: Recency boost

- **WHEN** a post was created within the last 7 days
- **THEN** a recency boost up to 30 points SHALL be applied, decaying linearly to zero at day 7
- **AND** posts older than 7 days SHALL receive no recency boost

### Requirement: Recommendations Pagination

The system SHALL support load-more pagination for both suggested users and recommended posts.

#### Scenario: Load more suggested users

- **WHEN** the viewer clicks "Load more" on the suggested users list
- **THEN** the system SHALL fetch the next page of suggested users using a cursor derived from the last returned user id

#### Scenario: Load more recommended posts

- **WHEN** the viewer clicks "Load more" on the recommended posts list
- **THEN** the system SHALL fetch the next page of recommended posts using a cursor derived from the last returned post id

#### Scenario: No more results

- **WHEN** the last page has been reached
- **THEN** the "Load more" button SHALL NOT be rendered
