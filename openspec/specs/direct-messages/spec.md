# Direct Messages

## Requirements

### Requirement: One-to-One Conversations

The system SHALL let a signed-in viewer start or open a one-to-one conversation with another user.

#### Scenario: Viewer starts a conversation with another user

- **WHEN** the viewer starts a conversation with a different existing user
- **THEN** the system SHALL create a `Conversation` with exactly two `ConversationParticipant` records if no conversation already exists
- **AND** the system SHALL navigate the viewer to `/messages/<conversationId>`

#### Scenario: Conversation already exists

- **WHEN** the viewer starts a conversation with a user they already have a conversation with
- **THEN** the system SHALL reuse the existing conversation
- **AND** the system SHALL NOT create a duplicate conversation intentionally

#### Scenario: Viewer attempts to message themselves

- **WHEN** the viewer starts a conversation with their own user id
- **THEN** the system SHALL reject the request

#### Scenario: Viewer attempts to message an unknown user

- **WHEN** the viewer starts a conversation with a user id that does not exist
- **THEN** the system SHALL reject the request

### Requirement: Conversation Access Control

The system SHALL allow only conversation participants to read or write conversation data.

#### Scenario: Participant opens a conversation

- **WHEN** a participant opens `/messages/<conversationId>`
- **THEN** the system SHALL display the conversation thread

#### Scenario: Non-participant opens a conversation

- **WHEN** a user who is not a participant opens `/messages/<conversationId>`
- **THEN** the system SHALL NOT display messages from that conversation

#### Scenario: Non-participant sends to a conversation

- **WHEN** a user who is not a participant attempts to send a message to a conversation
- **THEN** the system SHALL reject the request and SHALL NOT create a `DirectMessage`

### Requirement: Send Direct Message

The system SHALL let a participant send a plain-text message in a conversation.

#### Scenario: Participant sends a valid message

- **WHEN** a participant sends non-empty message text within the maximum message length
- **THEN** the system SHALL trim the message body
- **AND** the system SHALL create a `DirectMessage` with `conversationId`, `senderId`, `body`, and `createdAt`
- **AND** the system SHALL update the conversation's `lastMessageAt`

#### Scenario: Participant sends an empty message

- **WHEN** a participant sends empty or whitespace-only message text
- **THEN** the system SHALL reject the message
- **AND** the system SHALL NOT create a `DirectMessage`

#### Scenario: Participant sends an over-limit message

- **WHEN** a participant sends message text longer than `MAX_DIRECT_MESSAGE_LENGTH`
- **THEN** the system SHALL reject the message
- **AND** the system SHALL NOT create a `DirectMessage`

### Requirement: Inbox

The system SHALL provide a private `/messages` inbox that lists the current viewer's conversations.

#### Scenario: Viewer opens inbox

- **WHEN** a signed-in viewer opens `/messages`
- **THEN** the system SHALL display conversations where the viewer is a participant
- **AND** the conversations SHALL be ordered by `lastMessageAt` descending, then `id` descending

#### Scenario: Inbox conversation row

- **WHEN** the inbox renders a conversation
- **THEN** the system SHALL show the other participant's display name, username/avatar, last message preview, and last message timestamp

#### Scenario: Viewer has no conversations

- **WHEN** a signed-in viewer opens `/messages` and has no conversations
- **THEN** the system SHALL display an empty inbox state

#### Scenario: No viewer opens inbox

- **WHEN** `/messages` is opened and no viewer is resolved
- **THEN** the system SHALL NOT show any user's conversations and SHALL display an auth/empty state

### Requirement: Conversation Thread

The system SHALL render conversation messages chronologically and support loading older messages.

#### Scenario: Viewer opens conversation with messages

- **WHEN** a participant opens a conversation with messages
- **THEN** the system SHALL display the newest page of messages ordered oldest-to-newest
- **AND** the system SHALL visually distinguish the viewer's messages from the other participant's messages

#### Scenario: Viewer opens conversation with no messages

- **WHEN** a participant opens a conversation with no messages
- **THEN** the system SHALL display an empty thread state and a message composer

#### Scenario: Older messages exist

- **WHEN** older messages exist beyond the initially loaded page
- **THEN** the system SHALL let the viewer load older messages and prepend them above the current list
