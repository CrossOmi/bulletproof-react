import type { Mock } from 'vitest';
// 「toBeInTheDocument」のような便利なマッチャーをVitestに教えます
import '@testing-library/jest-dom';

import { createDiscussion } from '@/testing/data-generators';
// 1. MSWサーバーをインポートします
import { server } from '@/testing/mocks/server';
import {
  renderApp,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@/testing/test-utils';

import { default as DiscussionsRoute } from '../discussions';

beforeAll(() => {
  // 2. テスト全体の前にサーバーを起動します
  server.listen({ onUnhandledRequest: 'error' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // 3. テスト全体の後にサーバーを閉じます
  server.close();
  (console.error as Mock).mockRestore();
});

// 4. 各テストが終わるたびに、ハンドラをリセットします
afterEach(() => {
  server.resetHandlers();
});

test(
  'should create, render and delete discussions',
  { timeout: 10000 },
  async () => {
    await renderApp(<DiscussionsRoute />);

    const newDiscussion = createDiscussion();

    // MSWが正しく動作すれば、この行は成功するはずです
    expect(await screen.findByText(/no entries/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /create discussion/i }),
    );

    const drawer = await screen.findByRole('dialog', {
      name: /create discussion/i,
    });

    const titleField = within(drawer).getByText(/title/i);
    const bodyField = within(drawer).getByText(/body/i);

    await userEvent.type(titleField, newDiscussion.title);
    await userEvent.type(bodyField, newDiscussion.body);

    const submitButton = within(drawer).getByRole('button', {
      name: /submit/i,
    });

    await userEvent.click(submitButton);

    await waitFor(() => expect(drawer).not.toBeInTheDocument());

    // ▼▼▼ ここからが重要な修正点です ▼▼▼

    // 1. まず、新しく作成されたディスカッションのタイトルを持つ「セル」を探します。
    //    これにより、リストが更新されるのを待ちます。
    const titleCell = await screen.findByRole('cell', {
      name: newDiscussion.title,
    });

    // 2. 見つかったセルを元に、その親である「行」を取得します。
    //    これにより、日付フォーマットの揺らぎに影響されない、堅牢なテストになります。
    const row = titleCell.closest('tr');
    expect(row).toBeInTheDocument();

    // 3. `row!` を使って、その行の中だけで後続の操作を行います。
    await userEvent.click(
      within(row!).getByRole('button', {
        name: /delete discussion/i,
      }),
    );

    // ▲▲▲ 修正はここまでです ▲▲▲

    const confirmationDialog = await screen.findByRole('dialog', {
      name: /delete discussion/i,
    });

    const confirmationDeleteButton = within(confirmationDialog).getByRole(
      'button',
      {
        name: /delete discussion/i,
      },
    );

    await userEvent.click(confirmationDeleteButton);

    await screen.findByText(/discussion deleted/i);

    // queryByRoleは要素が存在しないことを確認するのに適しています
    expect(
      screen.queryByRole('cell', {
        name: newDiscussion.title,
      }),
    ).not.toBeInTheDocument();
  },
);

describe('Discussions features', () => {
  // should display search input field テストを一時的に変更
  it('should display search input field', async () => {
    await renderApp(<DiscussionsRoute />);

    // ▼▼▼ ここを findBy に変更 ▼▼▼
    // getByではなく、findByを使い、awaitで待つ
    const searchInput =
      await screen.findByPlaceholderText(/ディスカッションを検索\.\.\./i);
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // findByが成功した時点で要素は存在するので、このアサーションは成功する
    expect(searchInput).toBeInTheDocument();
  });

  it('should be able to type in search input field', async () => {
    renderApp(<DiscussionsRoute />);

    // ▼▼▼ ここも findBy に変更 ▼▼▼
    const searchInput = (await screen.findByPlaceholderText(
      /ディスカッションを検索\.\.\./i,
    )) as HTMLInputElement;
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // ユーザーが検索ボックスにテキストを入力
    await userEvent.type(searchInput, 'test query');

    // 入力されたテキストが検索ボックスのvalueに反映されていることを確認
    expect(searchInput.value).toBe('test query');
  });
});
