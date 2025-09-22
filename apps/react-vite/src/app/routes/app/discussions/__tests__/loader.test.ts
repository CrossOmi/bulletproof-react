import { QueryClient } from '@tanstack/react-query';
import { vi } from 'vitest';

import { api } from '@/lib/api-client';
import { clientLoader } from '../discussions';

describe('clientLoader', () => {
  const getSpy = vi.spyOn(api, 'get');
  // QueryClientの変数をここで宣言だけしておきます
  let queryClient: QueryClient;

  // ★★★ これが最も重要な変更点です ★★★
  // 各テスト(`it`)が始まる直前に、毎回新しいQueryClientを作成します
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // テストではリトライを無効化
        },
      },
    });
  });

  afterEach(() => {
    getSpy.mockClear();
    // 各テストの後に、そのテストで使ったQueryClientをクリーンアップします
    queryClient.clear();
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it(
    'should fetch data using api.get and return it when cache is empty',
    { timeout: 5000 },
    async () => {
      const mockApiResponse = {
        data: [{ id: '1', title: 'New Discussion' }],
        meta: {},
      };
      getSpy.mockResolvedValue(mockApiResponse);

      // beforeEachで作成された、このテスト専用のqueryClientを使います
      const loader = clientLoader(queryClient);
      const request = new Request('http://localhost:3000/discussions');

      const result = await loader({ request, params: {}, context: {} });

      expect(result).toEqual(mockApiResponse);
      expect(getSpy).toHaveBeenCalledWith('/discussions', {
        params: {
          page: 1,
          q: undefined,
        },
      });
    },
  );

  it(
    'should return cached data and NOT call api.get when cache is available',
    { timeout: 5000 },
    async () => {
      const mockCachedData = {
        data: [{ id: 'cached-1', title: 'Cached Discussion' }],
        meta: {},
      };
      queryClient.setQueryData(
        ['discussions', { page: 1, q: undefined }],
        mockCachedData,
      );

      const loader = clientLoader(queryClient);
      const request = new Request('http://localhost:3000/discussions');

      const result = await loader({ request, params: {}, context: {} });

      expect(result).toEqual(mockCachedData);
      expect(getSpy).not.toHaveBeenCalled();
    },
  );
});
