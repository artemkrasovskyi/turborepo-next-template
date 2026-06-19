import { createRecommendationsClient } from '@repo/api-client/features/recommendations';
import { createSearchClient } from '@repo/api-client/features/search';
import { getViewerUser } from '@/features/auth/lib/viewer';
import { RecommendedPosts } from '@/features/recommendations/components/recommended-posts';
import { SuggestedUsers } from '@/features/recommendations/components/suggested-users';
import { SearchBar } from '@/features/search/components/search-bar';
import { UserSearchResults } from '@/features/search/components/user-search-results';

export const dynamic = 'force-dynamic';

const searchClient = createSearchClient();
const recommendationsClient = createRecommendationsClient();

type ExplorePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const viewer = await getViewerUser();
  const viewerId = viewer?.id;

  if (query) {
    const initialPage = await searchClient.searchUsers({ query, viewerId });

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <h1 className="text-2xl font-semibold text-slate-950">Search</h1>
        <SearchBar defaultValue={query} />
        <section aria-label="Search results">
          <p className="mb-4 text-sm text-slate-500">Results for &ldquo;{query}&rdquo;</p>
          <UserSearchResults query={query} initialPage={initialPage} viewerId={viewerId ?? null} />
        </section>
      </main>
    );
  }

  const [suggestedUsersPage, recommendedPostsPage] = await Promise.all([
    recommendationsClient.getSuggestedUsers({ viewerId }),
    recommendationsClient.getRecommendedPosts({ viewerId }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-12 md:max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-950">Explore</h1>
      <SearchBar defaultValue="" />
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Suggested users</h2>
        <SuggestedUsers page={suggestedUsersPage} viewerId={viewerId ?? null} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Recommended posts</h2>
        <RecommendedPosts page={recommendedPostsPage} viewerId={viewerId ?? null} />
      </section>
    </main>
  );
}
