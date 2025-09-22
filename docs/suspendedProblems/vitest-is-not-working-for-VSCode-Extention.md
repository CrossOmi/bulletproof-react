# 作業ログ: Vitest 拡張がテスト結果を表示しない問題

## 事象

- VS Code の **Vitest 拡張（Test Explorer）** からテストを実行すると
  `The test run did not record any output.` が出て結果が表示されない。
- ただし **テストコード自体は動いていて console.log は出力される**。
- CLI (`npm run test` / `npx vitest`) からは正常にテストが実行できる。

---

## 試したこと

### 1. コード・テスト側の切り分け

- loader 関数を UI と分離 → **改善せず**
- `vi.mock` → `vi.spyOn` に変更して API 呼び出しを監視 → **改善せず**
- MSW を導入して結合テストに切り替え → jsdom の制約エラー（`navigation not implemented`）は出るがテスト自体は実行 → **テストコード自体は問題ないと確認**

### 2. React Query の状態リークを疑う

- `beforeEach` で新しい `QueryClient` を生成
- `afterEach` で `queryClient.clear()` を実施
  → **改善せず**

### 3. CLI 実行確認

- `npx vitest run src/.../loader.test.ts`
- ルート (`bulletproof-react/`) からだとモノレポ構成のせいで `No test files found`
- `apps/react-vite/` 直下から実行すると **正常にテスト成功**
  → **CLI 実行は問題なし**

### 4. VSCode 拡張設定の確認

- `Vitest: Workspace Config` に `apps/react-vite/vitest.config.ts` を設定 →
  **「must export a default array of project paths」エラー発生**

  - 原因: Workspace Config は monorepo 用の「workspace.json」を指定するための項目。通常の `vitest.config.ts` を設定すると誤認識される。

- → 結論: **`Vitest: Workspace Config` は空欄にすべき**

### 5. パス解決エラーの対応

- テスト実行時に `Failed to resolve import "@/lib/api-client"` が発生
- `vite-tsconfig-paths` を導入して `vitest.config.ts` に以下を追加

  ```ts
  import tsconfigPaths from "vite-tsconfig-paths";
  plugins: [tsconfigPaths()];
  ```

- CLI では解決成功
- しかし拡張経由だと依然として「The test run did not record any output」

---

## 現在の結論

- **テストコードや設定に問題はなく、CLI 実行は正常**
- 問題は **VS Code Vitest 拡張の monorepo 対応の不完全さ** にある可能性が高い
- 一旦は **CLI (`npm run test`) 実行をメインに使用**する方針に決定

---

## 今後対応したくなったら検討すること

1. **Vitest Workspace 設定**

   - monorepo 用に `vitest.workspace.json` を作成し、`apps/react-vite/vitest.config.ts` を参照させる

   ```json
   ["apps/react-vite"]
   ```

2. **代替拡張を試す**

   - 「Vitest Runner」など、別の VSCode 拡張を検証する

3. **VS Code Tasks で簡易実行**

   - `tasks.json` に `vitest run ${file}` を登録し、現在開いているテストだけ CLI で流せるようにする

---

✅ 現時点では「**拡張は無視、CLI で実行**」が安定解。
後で再挑戦するなら **workspace.json の導入** or **別拡張の利用** が有力候補。
