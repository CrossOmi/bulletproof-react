import { useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom'; // react-router-dom -> react-router には Link と useSearchParams がないため、react-router-dom のままにする
import { clsx } from 'clsx';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableCell, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/format';
import { Authorization } from '@/lib/authorization';

import { getDiscussionQueryOptions } from '../api/get-discussion';
import { useDiscussions } from '../api/get-discussions';
import { DeleteDiscussion } from './delete-discussion';
import { useFavoritesStore } from '../stores/favorites-store';
import { FavoriteButton } from './favorite-button';

export const DiscussionsList = () => {
  const [searchParams] = useSearchParams();
  const discussionsQuery = useDiscussions({
    page: +(searchParams.get('page') || 1),
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

  const discussions = discussionsQuery.data?.data;
  const meta = discussionsQuery.data?.meta;

  if (!discussions) return null;

  return (
    <Table
      data={discussions}
      columns={[
        {
          title: '',
          field: 'id',
          Cell({ entry: { id } }) {
            const isFavorite = favoriteIds.includes(id);
            return (
              <TableCell className="w-10">
                <FavoriteButton
                  isFavorite={isFavorite}
                  onClick={() => toggleFavorite(id)}
                />
              </TableCell>
            );
          },
        },
        {
          title: 'Title',
          field: 'title',
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
