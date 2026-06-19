import Link from 'next/link';
import { createDirectMessagesClient } from '@repo/api-client/features/direct-messages';
import { createUsersClient } from '@repo/api-client/features/users';
import { DirectMessageComposer } from '@/features/direct-messages/components/direct-message-composer';
import { LoadOlderMessagesButton } from '@/features/direct-messages/components/load-older-messages-button';
import { MessageBubble } from '@/features/direct-messages/components/message-bubble';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const directMessagesClient = createDirectMessagesClient();
const usersClient = createUsersClient();

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const viewer = await usersClient.getViewerUser();

  if (!viewer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <EmptyState
          heading="Conversation not available"
          description="Sign in as a sample user to view messages."
        />
      </main>
    );
  }

  const conversation = await directMessagesClient.getConversation({
    conversationId,
    viewerId: viewer.id,
  });

  if (!conversation) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <EmptyState
          heading="Conversation not found"
          description="This conversation does not exist, or you do not have access to it."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Link href="/messages" className="focus-ring rounded text-sm text-slate-500 hover:underline">
          Back to inbox
        </Link>
        <div className="mt-3">
          <h1 className="text-2xl font-semibold text-slate-950">
            {conversation.otherParticipant.displayName}
          </h1>
          <p className="text-sm text-slate-500">@{conversation.otherParticipant.username}</p>
        </div>
      </header>

      <section className="flex flex-col gap-3" aria-label="Messages">
        <LoadOlderMessagesButton
          conversationId={conversation.id}
          viewerId={viewer.id}
          initialCursor={conversation.nextCursor}
        />
        {conversation.messages.length === 0 ? (
          <EmptyState heading="No messages yet" description="Send the first message." />
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} viewerId={viewer.id} />
          ))
        )}
      </section>

      <DirectMessageComposer conversationId={conversation.id} viewerId={viewer.id} />
    </main>
  );
}
