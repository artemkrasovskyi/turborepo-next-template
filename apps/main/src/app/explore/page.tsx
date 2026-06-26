/**
 * @openspec openspec/specs/frontend-search/spec.md
 * @change Phase-19-search-module
 */
import { createRecommendationsClient } from '@repo/api-client/features/recommendations';
import { getViewerUser } from '@/features/auth/lib/viewer';
import { RecommendedPosts } from '@/features/recommendations/components/recommended-posts';
import { SuggestedUsers } from '@/features/recommendations/components/suggested-users';
import { searchUsersFromBackend } from '@/features/search/backend-search-client';
import { SearchBar } from '@/features/search/components/search-bar';
import { UserSearchResults } from '@/features/search/components/user-search-results';

export const dynamic = 'force-dynamic';

const recommendationsClient = createRecommendationsClient();

type ExplorePageProps = {
  searchParams: Promise<{ q?: string }>;
};

const ExplorePage = async ({ searchParams }: ExplorePageProps) => {
  const { q: rawQuery } = await searchParams;
  const query = rawQuery?.trim() ?? '';
  const viewer = await getViewerUser();
  const viewerId = viewer?.id;

  if (query) {
    let initialPage;
    let searchError: string | null = null;

    try {
      initialPage = await searchUsersFromBackend({ query, ...(viewerId ? { viewerId } : {}) });
    } catch {
      searchError = 'Search is currently unavailable. Please try again later.';
    }

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Search</h1>
        <SearchBar defaultValue={query} />
        <section aria-label="Search results">
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">Results for &ldquo;{query}&rdquo;</p>
          {searchError ? (
            <p className="text-sm text-[var(--color-danger)]" role="alert">
              {searchError}
            </p>
          ) : (
            <UserSearchResults query={query} initialPage={initialPage!} viewerId={viewerId ?? null} />
          )}
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
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Explore</h1>
      <SearchBar defaultValue="" />
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Suggested users</h2>
        <SuggestedUsers page={suggestedUsersPage} viewerId={viewerId ?? null} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Recommended posts</h2>
        <RecommendedPosts page={recommendedPostsPage} viewerId={viewerId ?? null} />
      </section>
    </main>
  );
};

export default ExplorePage;
