// src/features/discussions/components/__tests__/search.test.tsx

import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/mocks/server';
import { renderApp, screen, userEvent, waitFor } from '@/testing/test-utils';
import { createDiscussion } from '@/testing/data-generators';
import DiscussionsRoute from '@/app/routes/app/discussions/discussions';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  server.close();
  (console.error as Mock).mockRestore();
});

afterEach(() => {
  server.resetHandlers();
});

describe('Discussions search integration', () => {
  it('filters list when search button is clicked', async () => {
    const a = createDiscussion({ title: 'Apple pie' });
    const b = createDiscussion({ title: 'Banana split' });

    // MSW v2の正しい構文でハンドラーを追加
    server.use(
      http.get('*/discussions', ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get('q') || '';
        const page = Number(url.searchParams.get('page') || 1);
        let items = [a, b];
        if (q) {
          items = items.filter((it) =>
            it.title.toLowerCase().includes(q.toLowerCase()),
          );
        }

        // MSW v2のHttpResponseを使用
        return HttpResponse.json({
          data: items,
          meta: {
            page,
            total: items.length,
            totalPages: 1,
          },
        });
      }),
    );

    await renderApp(<DiscussionsRoute />);
    console.log('Rendered DiscussionsRoute');

    // 初期状態で両方のディスカッションが表示されていることを確認
    expect(
      await screen.findByRole('cell', { name: a.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: b.title })).toBeInTheDocument();

    // 検索を実行
    const input =
      await screen.findByPlaceholderText(/ディスカッションを検索\.\.\./i);
    await userEvent.type(input, 'Apple');
    await userEvent.click(await screen.findByRole('button', { name: /検索/i }));

    // フィルタリング結果を待機して確認
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: a.title })).toBeInTheDocument();
      expect(
        screen.queryByRole('cell', { name: b.title }),
      ).not.toBeInTheDocument();
    });
  });

  it('filters list when Enter is pressed in the search input', async () => {
    const a = createDiscussion({ title: 'Orange tart' });
    const b = createDiscussion({ title: 'Grape jelly' });

    server.use(
      http.get('*/discussions', ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get('q') || '';
        const page = Number(url.searchParams.get('page') || 1);

        let items = [a, b];
        if (q) {
          items = items.filter((it) =>
            it.title.toLowerCase().includes(q.toLowerCase()),
          );
        }

        return HttpResponse.json({
          data: items,
          meta: {
            page,
            total: items.length,
            totalPages: 1,
          },
        });
      }),
    );

    await renderApp(<DiscussionsRoute />);

    // 初期状態で両方のディスカッションが表示されていることを確認
    expect(
      await screen.findByRole('cell', { name: a.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: b.title })).toBeInTheDocument();

    // Enterキーで検索を実行
    const input =
      await screen.findByPlaceholderText(/ディスカッションを検索\.\.\./i);
    await userEvent.type(input, 'Grape');
    await userEvent.keyboard('{Enter}');

    // フィルタリング結果を待機して確認
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: b.title })).toBeInTheDocument();
      expect(
        screen.queryByRole('cell', { name: a.title }),
      ).not.toBeInTheDocument();
    });
  });
});
