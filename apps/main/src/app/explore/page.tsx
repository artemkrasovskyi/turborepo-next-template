import { createSearchClient } from '@repo/api-client/features/search';
import { createUsersClient } from '@repo/api-client/features/users';
import { SearchBar } from '@/features/search/components/search-bar';
import { UserSearchResults } from '@/features/search/components/user-search-results';
import { RecentUsers } from '@/features/search/components/recent-users';
import { TrendingPosts } from '@/features/search/components/trending-posts';

export const dynamic = 'force-dynamic';

const searchClient = createSearchClient();
const usersClient = createUsersClient();

type ExplorePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const viewer = await usersClient.getViewerUser();
  const viewerId = viewer?.id;

  if (query) {
    const initialPage = await searchClient.searchUsers({ query, viewerId });

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <h1 className="text-2xl font-semibold text-slate-950">Search</h1>
        <SearchBar defaultValue={query} />
        <section aria-label="Search results">
          <p className="mb-4 text-sm text-slate-500">
            Results for &ldquo;{query}&rdquo;
          </p>
          <UserSearchResults query={query} initialPage={initialPage} viewerId={viewerId ?? null} />
        </section>
      </main>
    );
  }

  const [recentUsers, trendingPosts] = await Promise.all([
    searchClient.getRecentUsers({ viewerId }),
    searchClient.getTrendingPosts({ viewerId }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-12 md:max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-950">Explore</h1>
      <SearchBar defaultValue="" />
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Recent users</h2>
        <RecentUsers users={recentUsers} viewerId={viewerId ?? null} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Trending this week</h2>
        <TrendingPosts posts={trendingPosts} viewerId={viewerId ?? null} />
      </section>
    </main>
  );
}
