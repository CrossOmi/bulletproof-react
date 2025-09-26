import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LoaderFunctionArgs } from 'react-router';

import { ContentLayout } from '@/components/layouts';
import { getInfiniteCommentsQueryOptions } from '@/features/comments/api/get-comments';
import { getDiscussionsQueryOptions } from '@/features/discussions/api/get-discussions';
import { CreateDiscussion } from '@/features/discussions/components/create-discussion';
import { DiscussionsList } from '@/features/discussions/components/discussions-list';

export const clientLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);
    const q = url.searchParams.get('q') || undefined;

    const query = getDiscussionsQueryOptions({ page, q });

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

const DiscussionsRoute = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    // ContentLayoutのtitleプロップでページタイトルを管理
    <ContentLayout title="ディスカッション">
      {' '}
      {/* タイトルを日本語に修正 */}
      {/* 検索ボックスとCreateDiscussionボタンを別々のブロックに配置 */}
      {/* 検索ボックスのコンテナ */}
      <div className="mb-4 flex justify-start">
        {' '}
        {/* 左寄せにするため justify-start に変更 */}
        <div className="w-64">
          {' '}
          {/* 検索ボックスの幅を制限 */}
          <label htmlFor="search" className="sr-only">
            検索
          </label>
          <input
            type="search"
            name="search"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="ディスカッションを検索..."
          />
        </div>
      </div>
      {/* Create Discussion ボタンのコンテナ (右寄せ) */}
      <div className="flex justify-end mb-4">
        {' '}
        {/* 右寄せにして、DiscussionsListの上に余白を追加 */}
        <CreateDiscussion />
      </div>
      <div className="mt-4">
        <DiscussionsList
          onDiscussionPrefetch={(id) => {
            queryClient.prefetchInfiniteQuery(
              getInfiniteCommentsQueryOptions(id),
            );
          }}
        />
      </div>
    </ContentLayout>
  );
};

export default DiscussionsRoute;
