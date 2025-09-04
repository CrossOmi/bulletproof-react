// ...existing code...
vi.mock('../../api/get-discussions', () => ({
  useDiscussions: vi.fn(), // useDiscussionsを明示的にモック関数にする
}));
vi.mock('../../stores/favorites-store');

// 追加: React を import (require を使わない)
import React from 'react';

// 追加: react-router-dom をテスト用にモック（Link と useSearchParams を提供）
vi.mock('react-router-dom', () => {
  return {
    // Link を単純なアンカータグに置き換える
    Link: ({ children, to, ...props }: any) =>
      React.createElement(
        'a',
        { href: typeof to === 'string' ? to : to?.pathname ?? '#', ...props },
        children,
      ),
    // useSearchParams は [URLSearchParams] を返す（コンポーネントでは setter を使っていないためこれで十分）
    useSearchParams: () => [new URLSearchParams()],
  };
});

// 追加: Authorization コンポーネントをテスト用に置き換える（実際の useAuthorization を回避）
vi.mock('@/lib/authorization', () => ({
  // Authorization はそのまま children を返して無害化
  Authorization: ({ children }: { children: React.ReactNode }) => children,
  // ROLES を提供（最低限 ADMIN を含めれば OK）
  ROLES: {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    // 必要なら他のロールも追加
    GUEST: 'GUEST',
  },
}));

// 2. 外部ライブラリのインポート (ESLintの順序ルールに準拠)
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { nanoid } from 'nanoid';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 追加: React Query の QueryClientProvider をテストで使う
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 3. __tests__ディレクトリからの正しい相対パスを使ったインポート
import { useDiscussions } from '../../api/get-discussions';
import { useFavoritesStore } from '../../stores/favorites-store';
import { DiscussionsList } from '../discussions-list';

import { User, type Discussion } from '@/types/api';

// テスト用のダミーディスカッションデータ
const discussion1Id = nanoid();
const discussion2Id = nanoid();

// 1. User型のテストデータを作成
const mockAuthor: User = {
  id: nanoid(),
  firstName: 'Taro',
  lastName: 'Test',
  email: 'taro.test@example.com',
  teamId: 'team-1',
  role: 'ADMIN',
  bio: 'A passionate developer',
  createdAt: Date.now(),
};

const mockDiscussions: Discussion[] = [
  {
    id: discussion1Id,
    title: 'First Discussion',
    body: '',
    createdAt: Date.now(),
    teamId: 'team-1',
    author: mockAuthor,
  },
  {
    id: discussion2Id,
    title: 'Second Discussion',
    body: '',
    createdAt: Date.now(),
    teamId: 'team-1',
    author: mockAuthor,
  },
];

// ユーティリティ: 各テスト用に QueryClient を作成して Provider でラップして返す
const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithClient = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      {ui}
    </QueryClientProvider>,
  );

describe('DiscussionsList', () => {
  const mockToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモックを設定
    (useDiscussions as any).mockReturnValue({
      data: { data: mockDiscussions, meta: {} },
      isLoading: false,
      isFetching: false,
    });
  });

  it('should apply a highlight style to the row of a favorited discussion', () => {
    (useFavoritesStore as any).mockReturnValue({
      favoriteIds: [discussion1Id],
      toggleFavorite: mockToggleFavorite,
    });

    renderWithClient(
      <MemoryRouter>
        <DiscussionsList />
      </MemoryRouter>,
    );

    const favoritedRow = screen.getByRole('row', { name: /First Discussion/i });
    expect(favoritedRow).toHaveClass('bg-yellow-100/70');

    const nonFavoritedRow = screen.getByRole('row', {
      name: /Second Discussion/i,
    });
    expect(nonFavoritedRow).not.toHaveClass('bg-yellow-100/70');
  });

  it('should call toggleFavorite with the correct discussion ID when a favorite button is clicked', async () => {
    const user = userEvent.setup();
    (useFavoritesStore as any).mockReturnValue({
      favoriteIds: [],
      toggleFavorite: mockToggleFavorite,
    });

    renderWithClient(
      <MemoryRouter>
        <DiscussionsList />
      </MemoryRouter>,
    );

    const targetRow = screen.getByRole('row', { name: /Second Discussion/i });
    const favoriteButton = within(targetRow).getByRole('button', {
      name: /favorite/i,
    });

    await user.click(favoriteButton);

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
    expect(mockToggleFavorite).toHaveBeenCalledWith(discussion2Id);
  });
});
