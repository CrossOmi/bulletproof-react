// mswライブラリが提供する関数で、ブラウザ環境向けのサービスワーカー(今回のケースにおける『サービスワーカー』は、s)をセットアップするために使用します。
import { setupWorker } from 'msw/browser';

// handlersモジュールからインポートしたリクエストハンドラーを使用して、サービスワーカーを設定します。
import { handlers } from './handlers';

// setupWorker関数にリクエストハンドラーをスプレッド構文で渡し、サービスワーカーを作成します。
export const worker = setupWorker(...handlers);
