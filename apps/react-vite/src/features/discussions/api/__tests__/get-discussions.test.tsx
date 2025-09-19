import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { useDiscussions } from '../get-discussions';

// ====================================================================================
// Test Setup:
// React Queryフックをテストするための最小限の準備です。
// MSWサーバーやDBのセットアップは不要になります。
// ====================================================================================
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // テストでは、通信を実際には行わないので
        // 自動リトライやネットワーク状態の監視をオフにします
        retry: false,
        networkMode: 'offlineFirst',
      },
    },
  });

const createWrapper = (client: QueryClient) => {
  return function CreatedWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
};

// ====================================================================================
// Tests:
// useDiscussionsフックが、渡された引数に応じて
// 正しい「翻訳」（queryKeyの生成）を行っているかだけを検証します。
// ====================================================================================
describe('useDiscussions', () => {
  it('should create a correct query key with default parameters', async () => {
    // 準備
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);

    // 実行: 引数なしでフックを呼び出す
    renderHook(() => useDiscussions(), { wrapper });

    // 検証: キャッシュ内に、デフォルトのqueryKeyが生成されているか確認
    // 実際にAPIは呼ばれないので、すぐにキャッシュを確認できます
    const queries = queryClient.getQueryCache().findAll();
    expect(queries[0].queryKey).toEqual([
      'discussions',
      { page: undefined, q: undefined },
    ]);
  });

  it('should create a correct query key when "page" is provided', () => {
    // 準備
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const page = 2;

    // 実行
    renderHook(() => useDiscussions({ page }), { wrapper });

    // 検証
    const queries = queryClient.getQueryCache().findAll();
    expect(queries[0].queryKey).toEqual([
      'discussions',
      { page, q: undefined },
    ]);
  });

  it('should create a correct query key when "q" is provided', () => {
    // 準備
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const q = 'React';

    // 実行
    renderHook(() => useDiscussions({ q }), { wrapper });

    // 検証
    const queries = queryClient.getQueryCache().findAll();
    expect(queries[0].queryKey).toEqual([
      'discussions',
      { page: undefined, q },
    ]);
  });

  it('should create a correct query key when both "page" and "q" are provided', () => {
    // 準備
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const page = 3;
    const q = 'TypeScript';

    // 実行
    renderHook(() => useDiscussions({ page, q }), { wrapper });

    // 検証
    const queries = queryClient.getQueryCache().findAll();
    expect(queries[0].queryKey).toEqual(['discussions', { page, q }]);
  });
});
