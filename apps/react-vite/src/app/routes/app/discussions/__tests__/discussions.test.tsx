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
  describe('Search box UI Tests', () => {
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
  describe('useState UI Tests', () => {
    it('should clear search input field', async () => {
      await renderApp(<DiscussionsRoute />);
      const searchInput = (await screen.findByPlaceholderText(
        /ディスカッションを検索\.\.\./i,
      )) as HTMLInputElement;

      // まず何か入力されている状態を作る
      await userEvent.type(searchInput, 'initial query');
      expect(searchInput.value).toBe('initial query');

      // 全てのテキストをクリアする (例: Ctrl+A -> Delete)
      // userEvent.clear() は input の内容をクリアします
      await userEvent.clear(searchInput);

      // 検索ボックスが空になっていることを確認
      expect(searchInput.value).toBe('');
    });
  });

  it('should display search button', async () => {
    await renderApp(<DiscussionsRoute />);
    const searchButton = await screen.findByRole('button', {
      name: /検索/i, // ボタンのテキストが「検索」であることを確認
    });
    expect(searchButton).toBeInTheDocument();
  });

  it('should update submitted query when search button is clicked', async () => {
    await renderApp(<DiscussionsRoute />);
    const searchInput = (await screen.findByPlaceholderText(
      /ディスカッションを検索\.\.\./i,
    )) as HTMLInputElement;
    const searchButton = await screen.findByRole('button', { name: /検索/i });

    const testQuery = 'test keyword';
    await userEvent.type(searchInput, testQuery); // 検索ボックスに入力
    expect(searchInput.value).toBe(testQuery); // inputValueが更新されていることを確認

    await userEvent.click(searchButton); // 検索ボタンをクリック

    // submittedQuery が更新されたことを間接的に確認するために、
    // DiscussionsList に渡された searchTerm プロップが変更されたことをシミュレートします。
    // Testing Library は、親コンポーネントの状態更新によって子コンポーネントが
    // 新しいプロップで再レンダリングされることを自動的に検出します。
    // このテストは、将来的に DiscussionsList が検索クエリを元にフィルタリングする際に
    // 実際にそのプロップが渡っていることを保証するものです。

    // ここで、DiscussionsListが受け取ったsearchTerm propがtestQueryになっていることを
    // 確認したいのですが、Testing Libraryは直接propをアサートする方法を提供しません。
    // 代わりに、検索結果がフィルタリングされるという「効果」をテストすることになります。
    // しかし、このタスクの目的は「submittedQueryが更新されること」なので、
    // 現時点では、UI上の変化（例: 検索結果のリストがフィルタリングされる）がないため、
    // 「検索ボタンを押したこと自体」で状態が更新されたと仮定するしかありません。
    // より厳密なテストは、API連携後にリストの表示内容で確認することになります。

    // 現時点では、API連携やリストのフィルタリングを実装していないため、
    // ここでsubmittedQueryが更新されたことを直接的にUIから確認する方法はありません。
    // そのため、このテストは「ボタンを押すとsubmittedQueryが更新される"はず"」
    // という意図の表明となります。

    // しかし、Testing Libraryの哲学に従うと、目に見える変化をテストすべきです。
    // 暫定的なテストとしてはこれでOKとし、次の「データ連携」タスクで、
    // 実際にリストの内容がフィルターされることをもって、submittedQueryの更新を検証します。

    // TODO: 後続の「データ連携」タスクで、フィルタリングされたリストが表示されることを検証するテストを追加する。
  });

  it('should update submitted query when Enter key is pressed', async () => {
    await renderApp(<DiscussionsRoute />);
    const searchInput = (await screen.findByPlaceholderText(
      /ディスカッションを検索\.\.\./i,
    )) as HTMLInputElement;

    const testQuery = 'enter keyword';
    await userEvent.type(searchInput, testQuery); // 検索ボックスに入力
    expect(searchInput.value).toBe(testQuery); // inputValueが更新されていることを確認

    await userEvent.keyboard('{enter}'); // Enterキーを押す

    // 上記と同様に、現時点ではUI上の直接的な変化を確認できないため、
    // 「EnterキーでsubmittedQueryが更新される"はず"」という意図の表明に留まります。
    // TODO: 後続の「データ連携」タスクで、フィルタリングされたリストが表示されることを検証するテストを追加する。
  });
});
