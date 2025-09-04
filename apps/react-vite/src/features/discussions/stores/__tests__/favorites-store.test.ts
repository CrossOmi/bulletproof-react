import { act, renderHook } from '@testing-library/react';
import { nanoid } from 'nanoid'; // nanoidをインポート
import { describe, it, expect, beforeEach } from 'vitest';

// これから作成するZustandストアをインポートします
// (ファイルがまだないので、エディタ上ではエラーが表示されます)
import { useFavoritesStore } from '../favorites-store';

describe('useFavoritesStore', () => {
  // 各テストの前にストアの状態をリセットする
  beforeEach(() => {
    act(() => {
      // resetアクションがストアに実装されていることを想定
      if (useFavoritesStore.getState().reset) {
        useFavoritesStore.getState().reset();
      }
    });
  });

  // テスト1.1: IDの追加
  it('should add a discussion ID to the favorites list', () => {
    // Arrange: nanoidを使ってテストIDを動的に生成
    const discussionId = nanoid();

    // Act: ストアのアクションを実行する
    const { result } = renderHook(() => useFavoritesStore());
    act(() => {
      result.current.toggleFavorite(discussionId);
    });

    // Assert: 結果を検証
    // favoriteIds配列に、先ほど生成したIDが含まれていることを期待
    expect(result.current.favoriteIds).toContain(discussionId);
    // 配列の長さが1であることも確認すると、より厳密なテストになる
    expect(result.current.favoriteIds).toHaveLength(1);
  });

  // テスト1.2: IDの削除
  it('should remove a discussion ID from the favorites list if it already exists', () => {
    // Arrange
    const discussionId = nanoid();
    const { result } = renderHook(() => useFavoritesStore());

    // 事前にIDを追加しておく
    act(() => {
      result.current.toggleFavorite(discussionId);
    });
    // 追加されたことを確認 (Arrangeの一部)
    expect(result.current.favoriteIds[0]).toEqual(discussionId);

    // Act: 同じIDで再度アクションを実行する
    act(() => {
      result.current.toggleFavorite(discussionId);
    });

    // Assert: IDが配列から削除されていることを期待
    expect(result.current.favoriteIds).not.toContain(discussionId);
    // 配列が空になっていることを確認
    expect(result.current.favoriteIds).toHaveLength(0);
  });
});
