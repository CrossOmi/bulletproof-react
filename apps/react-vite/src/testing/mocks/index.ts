import { env } from '@/config/env';

export const enableMocking = async () => {
  // 環境変数でモックが有効化されている場合にのみ、MSWのセットアップを行う
  if (env.ENABLE_API_MOCKING) {
    // 動的インポートを使用して、ブラウザ用のモックワーカー（本物のブラウザからAPIリクエストを横取りしてモック（模擬）レスポンスを返す）
    const { worker } = await import('./browser');
    // 動的インポートを使用して、モックデータベースの初期化関数を取得し、初期化を実行
    const { initializeDb } = await import('./db');
    await initializeDb();
    return worker.start();
  }
};
