// React QueryとReact Routerから必要な機能をインポート
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

// 設定ファイルからパス情報をインポート
import { paths } from '@/config/paths';
import { ProtectedRoute } from '@/lib/auth';

// /app以下のルートで使われる共通のレイアウトコンポーネントとエラー画面をインポート
import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/app/root';

/**
 * 遅延読み込みされたルートモジュールを、React Routerが理解できる形式に変換するヘルパー関数。
 * React Queryの `queryClient` を `loader` や `action` に注入する役割も担う (依存性の注入)。
 * @param queryClient - React Queryのクライアントインスタンス
 * @returns 変換用の関数
 */
// (queryClient: QueryClient)でqueryClientを受け取って記憶
//
const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

/**
 * アプリケーションのルーター設定を作成するファクトリ関数。
 * @param queryClient - React Queryのクライアントインスタンス
 * @returns React Routerのルーターインスタンス
 */
export const createAppRouter = (queryClient: QueryClient) =>


  createBrowserRouter([
    // ホームページ (ランディングページ) のルート設定
    {
      path: paths.home.path,
      // `lazy` を使い、ユーザーがこのパスにアクセスした時に初めて関連コードをダウンロードする (コード分割)
      lazy: () => import('./routes/landing').then(convert(queryClient)),
    },
    {
      path: paths.auth.register.path,
      lazy: () => import('./routes/auth/register').then(convert(queryClient)),
    },
    {
      path: paths.auth.login.path,
      lazy: () => import('./routes/auth/login').then(convert(queryClient)),
    },
    {
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        {
          path: paths.app.discussions.path,
          lazy: () =>
            import('./routes/app/discussions/discussions').then(
              convert(queryClient),
            ),
        },
        {
          path: paths.app.discussion.path,
          lazy: () =>
            import('./routes/app/discussions/discussion').then(
              convert(queryClient),
            ),
        },
        {
          path: paths.app.users.path,
          lazy: () => import('./routes/app/users').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.path,
          lazy: () => import('./routes/app/profile').then(convert(queryClient)),
        },
        {
          path: paths.app.dashboard.path,
          lazy: () =>
            import('./routes/app/dashboard').then(convert(queryClient)),
        },
      ],
    },
    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert(queryClient)),
    },
  ]);

export const AppRouter = () => {
  // 1. ReactのContext機能を通じて、アプリ全体で共有されている
  //    React Queryのクライアントインスタンス（データ管理ツール）を取得する。
  const queryClient = useQueryClient();
  // queryClientは以下の2つの大きな役割を持つオブジェクトです。
  // 1. データキャッシュ (The Library's Shelves): APIから取得したすべてのデータを保持する場所。

  // 2. APIメソッド (The Librarian): そのキャッシュを操作するための様々な命令（関数）。



  // 2. `useMemo` を使って、ルーターのインスタンス生成処理を最適化する。
  //    これにより、不要な再レンダリング時に関数が再実行されるのを防ぎ、
  //    パフォーマンスを向上させる。`createAppRouter`は初回レンダリング時
  //    （または`queryClient`が変更された時）にのみ実行される。
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
};
