import '@testing-library/jest-dom';
import { rest } from 'msw';
import { server } from '@/testing/mocks/server';
import { renderApp, screen, userEvent } from '@/testing/test-utils';
import { createDiscussion } from '@/testing/data-generators';
import DiscussionsRoute from '@/app/routes/app/discussions/discussions';
import { input } from '@testing-library/user-event/dist/cjs/event/input.js';
import { b, a } from 'vitest/dist/chunks/suite.B2jumIFP.js';

describe('Discussions search integration', () => {
  it('filters list when search button is clicked', async () => {
    const a = createDiscussion({ title: 'Apple pie' });
    const b = createDiscussion({ title: 'Banana split' });

    // /api/discussions を q に応じてフィルタするハンドラを差し替え
    server.use(
      rest.get('/api/discussions', (req, res, ctx) => {
        // req.url が文字列の場合があるので安全に URL オブジェクト化
        const url =
          typeof req.url === 'string' ? new URL(req.url, 'http://localhost') : req.url;
        const q = url.searchParams.get('q') || '';
        const page = Number(url.searchParams.get('page') || 1);
        let items = [a, b];
        if (q) {
          items = items.filter((it) =>
            it.title.toLowerCase().includes(q.toLowerCase()),
          );
        }
        return res(
          ctx.status(200),
          ctx.json({
            data: items,
            meta: { page, totalPages: 1 },
          }),
        );
      }),
    );

    await renderApp(<DiscussionsRoute />);

    // 初期表示では両方見えるはず
    expect(await screen.findByRole('cell', { name: a.title })).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: b.title })).toBeInTheDocument();

    // 検索して "Apple" のみ残ることを確認
    const input = await screen.findByPlaceholderText(/ディスカッションを検索\.\.\./i);
    await userEvent.type(input, 'Apple');
    await userEvent.click(await screen.findByRole('button', { name: /検索/i }));

    expect(await screen.findByRole('cell', { name: a.title })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: b.title })).not.toBeInTheDocument();
  });

  it('filters list when Enter is pressed in the search input', async () => {
    const a = createDiscussion({ title: 'Orange tart' });
    const b = createDiscussion({ title: 'Grape jelly' });

    server.use(
      rest.get('/api/discussions', (req, res, ctx) => {
        // 同様に安全に URL を取得
        const url =
          typeof req.url === 'string' ? new URL(req.url, 'http://localhost') : req.url;
        const q = url.searchParams.get('q') || '';
        const page = Number(url.searchParams.get('page') || 1);
        let items = [a, b];
        if (q) {
          items = items.filter((it) =>
            it.title.toLowerCase().includes(q.toLowerCase()),
          );
        }
        return res(
          ctx.status(200),
          ctx.json({
            data: items,
            meta: { page, totalPages: 1 },
          }),
        );
      }),
    );

    await renderApp(<DiscussionsRoute />);

    // 初期表示で両方見える
    expect(await screen.findByRole('cell', { name: a.title })).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: b.title })).toBeInTheDocument();

    const input = await screen.findByPlaceholderText(/ディスカッションを検索\.\.\./i);
    await userEvent.type(input, 'Grape');
    await userEvent.keyboard('{Enter}');

    expect(await screen.findByRole('cell', { name: b.title })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: a.title })).not.toBeInTheDocument();
  });
});
      await screen.findByPlaceholderText(/ディスカッションを検索\.\.\./i);
    await userEvent.type(input, 'Grape');
    await userEvent.keyboard('{Enter}');

    expect(
      await screen.findByRole('cell', { name: b.title }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: a.title }),
    ).not.toBeInTheDocument();
  });
});
