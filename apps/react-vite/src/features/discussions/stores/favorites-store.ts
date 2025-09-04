import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ストアが持つ状態（State）の型を定義
type FavoritesState = {
  favoriteIds: string[];
};

// ストアが持つアクション（Actions）の型を定義
type FavoritesActions = {
  toggleFavorite: (discussionId: string) => void;
  reset: () => void; // テストのためにリセット用アクションを追加
};

// 初期状態を定義
const initialState: FavoritesState = {
  favoriteIds: [],
};

export const useFavoritesStore = create(
  // devtoolsミドルウェアでラップして、Redux DevToolsで状態を追跡できるようにする
  devtools<FavoritesState & FavoritesActions>(
    (set) => ({
      ...initialState, // 初期状態を展開

      /**
       * お気に入りのIDを追加または削除するアクション
       * @param discussionId - トグル対象のディスカッションID
       */
      toggleFavorite: (discussionId) =>
        set((state) => {
          const hasId = state.favoriteIds.includes(discussionId);
          if (hasId) {
            // IDがすでに存在する場合、配列からフィルタリングして削除
            return {
              favoriteIds: state.favoriteIds.filter(
                (id) => id !== discussionId,
              ),
            };
          }
          // IDが存在しない場合、配列の末尾に追加
          return {
            favoriteIds: [...state.favoriteIds, discussionId],
          };
        }),

      /**
       * ストアの状態を初期状態にリセットする（テスト用）
       */
      reset: () => set(initialState),
    }),
    {
      name: 'favorites-store', // Redux DevToolsで表示されるストア名
    },
  ),
);
