// src/features/discussions/components/discussions-list.tsx

import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableCell, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/format';
import { Authorization } from '@/lib/authorization';

import { getDiscussionQueryOptions } from '../api/get-discussion';
import { useDiscussions } from '../api/get-discussions'; // useDiscussionsフックをインポート
import { DeleteDiscussion } from './delete-discussion';
import { useFavoritesStore } from '../stores/favorites-store';
import { FavoriteButton } from './favorite-button';

// DiscussionsListProps の型定義を追加
type DiscussionsListProps = {
  searchTerm: string; // ▼▼▼ ここを追加 ▼▼▼
};

export const DiscussionsList = ({ searchTerm }: DiscussionsListProps) => {
  // ▼▼▼ ここを更新 ▼▼▼
  const [searchParams] = useSearchParams();

  // useDiscussions フックに page と q (searchTerm) を渡すように変更
  const discussionsQuery = useDiscussions({
    page: +(searchParams.get('page') || 1),
    q: searchTerm, // ▼▼▼ ここを追加 ▼▼▼
  });

  const queryClient = useQueryClient();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  if (discussionsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // エラー時の処理は現状のまま（useDiscussionsがエラーハンドリングしていると仮定）
  // データが取得できない場合（例えば、検索結果がない場合）の表示
  const discussions = discussionsQuery.data?.data;
  const meta = discussionsQuery.data?.meta;

  if (!discussions || discussions.length === 0) {
    // データがない、または空の場合（英語表示を削除して日本語のみ）
    return (
      <div className="flex h-48 w-full items-center justify-center text-gray-500">
        ディスカッションが見つかりませんでした。
      </div>
    );
  }

  return (
    <Table
      data={discussions}
      columns={[
        {
          title: '',
          field: 'id',
          Cell({ entry: { id } }) {
            // Table 内では既に <td> が出力される想定なので、
            // ここで <TableCell>（=td）を返すと <td> の中に <td> が入ってしまう。
            // そのため単純なブロック要素で包んで返す。
            const isFavorite = favoriteIds.includes(id);
            return (
              <div className="w-10">
                <FavoriteButton
                  isFavorite={isFavorite}
                  onClick={() => toggleFavorite(id)}
                />
              </div>
            );
          },
        },
        {
          title: 'Title',
          field: 'title',
          // 検索キーワードにマッチする部分をハイライト表示するなどの拡張も可能だが、
          // まずはフィルタリングのみに集中
        },
        {
          title: 'Created At',
          field: 'createdAt',
          Cell({ entry: { createdAt } }) {
            return <span>{formatDate(createdAt)}</span>;
          },
        },
        {
          title: '',
          field: 'id',
          Cell({ entry: { id } }) {
            return (
              <Link
                onMouseEnter={() => {
                  queryClient.prefetchQuery(getDiscussionQueryOptions(id));
                }}
                to={paths.app.discussion.getHref(id)}
              >
                View
              </Link>
            );
          },
        },
        {
          title: '',
          field: 'id',
          Cell({ entry: { id } }) {
            return (
              <Authorization allowedRoles={['ADMIN']}>
                <DeleteDiscussion id={id} />
              </Authorization>
            );
          },
        },
      ]}
      renderRow={(discussion) => {
        const isFavorite = favoriteIds.includes(discussion.id);
        return (
          <TableRow
            key={discussion.id}
            className={clsx(
              isFavorite && 'bg-yellow-100/70 hover:bg-yellow-100',
            )}
          />
        );
      }}
      pagination={
        meta && {
          totalPages: meta.totalPages,
          currentPage: meta.page,
        }
      }
    />
  );
};
