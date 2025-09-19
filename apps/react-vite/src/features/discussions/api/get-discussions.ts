import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Discussion, Meta } from '@/types/api';

// 1. getDiscussions が受け取る引数をオブジェクト形式に変更し、'q' を追加します
type GetDiscussionsParams = {
  page?: number;
  q?: string;
};

export const getDiscussions = ({
  page = 1,
  q,
}: GetDiscussionsParams): Promise<{
  data: Discussion[];
  meta: Meta;
}> => {
  return api.get(`/discussions`, {
    // 2. APIリクエストのパラメータに 'q' を渡します
    params: {
      page,
      q,
    },
  });
};

// 3. queryOptions も 'q' を受け取れるようにします
export const getDiscussionsQueryOptions = ({
  page,
  q,
}: GetDiscussionsParams = {}) => {
  return queryOptions({
    // 4. queryKey に 'q' を含めて、キャッシュが一意に決まるようにします
    queryKey: ['discussions', { page, q }],
    // 5. queryFn から getDiscussions に 'q' を渡します
    queryFn: () => getDiscussions({ page, q }),
  });
};

// 6. カスタムフックのオプションにも 'q' を追加します
type UseDiscussionsOptions = {
  page?: number;
  q?: string;
  queryConfig?: QueryConfig<typeof getDiscussionsQueryOptions>;
};

export const useDiscussions = ({
  queryConfig,
  page,
  q, // 7. 'q' を受け取ります
}: UseDiscussionsOptions = {}) => {
  return useQuery({
    // 8. queryOptions に 'q' を渡します
    ...getDiscussionsQueryOptions({ page, q }),
    ...queryConfig,
  });
};
