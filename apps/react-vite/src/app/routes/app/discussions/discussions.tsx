// src/features/discussions/routes/Discussions.tsx

import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LoaderFunctionArgs } from 'react-router';

import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button'; // Buttonコンポーネントをインポート
import { getInfiniteCommentsQueryOptions } from '@/features/comments/api/get-comments';
import { getDiscussionsQueryOptions } from '@/features/discussions/api/get-discussions';
import { CreateDiscussion } from '@/features/discussions/components/create-discussion';
import { DiscussionsList } from '@/features/discussions/components/discussions-list';

export const clientLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);
    const q = url.searchParams.get('q') || undefined; // クエリパラメータから 'q' を取得

    const query = getDiscussionsQueryOptions({ page, q });

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

const DiscussionsRoute = () => {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState(''); // inputのリアルタイム表示用
  const [submittedQuery, setSubmittedQuery] = useState(''); // APIに渡す実際の検索クエリ用

  // 検索実行ハンドラ
  const handleSearch = () => {
    setSubmittedQuery(inputValue); // リアルタイムのinputValueをAPI用のsubmittedQueryにセット
  };

  // Enterキーが押された時のハンドラ
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch(); // Enterキーで検索実行
    }
  };

  return (
    <ContentLayout title="ディスカッション">
      <div className="mb-4 flex justify-between items-center">
        {/* 検索ボックスとボタンのコンテナ */}
        <div className="flex items-center space-x-2">
          <label htmlFor="search" className="sr-only">
            検索
          </label>
          <input
            type="search"
            name="search"
            id="search"
            value={inputValue} // inputValue を使用
            onChange={(e) => setInputValue(e.target.value)} // setInputValue を使用
            onKeyDown={handleKeyDown}
            className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="ディスカッションを検索..."
          />
          <Button onClick={handleSearch} className="whitespace-nowrap">
            検索
          </Button>
        </div>
        {/* Create Discussion ボタン */}
        <CreateDiscussion />
      </div>

      <div className="mt-4">
        {/* DiscussionsList に submittedQuery を渡す (まだ実装されていませんが、将来的に使う) */}
        <DiscussionsList
          searchTerm={submittedQuery} // submittedQuery を渡すように変更
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
