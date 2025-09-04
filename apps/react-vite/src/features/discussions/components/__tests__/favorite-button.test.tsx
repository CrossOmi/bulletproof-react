import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// これから作成するコンポーネントをインポートする
// (ファイルがまだないので、エディタ上ではエラーが表示されます)
import { FavoriteButton } from '../favorite-button';
import userEvent from '@testing-library/user-event';

describe('FavoriteButton', () => {
  // --- 表示に関するテスト (Visual Tests) ---

  // テスト1.1: isFavoriteがtrueの場合
  it('should render in favorite state when isFavorite is true', () => {
    // Arrange: コンポーネントに渡すpropsを準備
    const props = {
      isFavorite: true,
      onClick: vi.fn(), // 操作テストではないが、必須propなのでモック関数を渡す
    };

    // Act: コンポーネントを描画
    render(<FavoriteButton {...props} />);

    // Assert: 結果を検証
    // ボタン要素をアクセシビリティ名で取得することを想定（aria-label（エリア・ラベル）などの「favorite」の大文字と小文字を区別しない）
    const buttonElement = screen.getByRole('button', { name: /favorite/i });

    // 設計書に基づき、お気に入り状態（黄色）のCSSクラスが付与されていることを期待
    expect(buttonElement).toHaveClass('text-yellow-500');
    // 逆の状態（灰色）のクラスが付与されていないことも確認すると、よりテストが堅牢になる
    expect(buttonElement).not.toHaveClass('text-gray-400');
  });

  // テスト1.2: isFavoriteがfalseの場合
  it('should render in non-favorite state when isFavorite is false', () => {
    // Arrange
    const props = {
      isFavorite: false,
      onClick: vi.fn(),
    };

    // Act
    render(<FavoriteButton {...props} />);

    // Assert
    const buttonElement = screen.getByRole('button', { name: /favorite/i });

    // 設計書に基づき、非お気に入り状態（灰色）のCSSクラスが付与されていることを期待
    expect(buttonElement).toHaveClass('text-gray-400');
    // 逆の状態（黄色）のクラスが付与されていないことも確認
    expect(buttonElement).not.toHaveClass('text-yellow-500');
  });

  // --- 操作に関するテスト (Interaction Tests) ---
  it('should call the onClick handler once when clicked', async () => {
    // Arrange: ユーザー操作の準備と、監視対象のモック関数を用意
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    const props = {
      isFavorite: false, // isFavoriteの状態はこのテストに影響しない
      onClick: mockOnClick,
    };
    render(<FavoriteButton {...props} />);
    const buttonElement = screen.getByRole('button', { name: /favorite/i });

    // Act: ユーザーがボタンをクリックする操作をシミュレート
    await user.click(buttonElement);

    // Assert: モック関数がちょうど1回呼び出されたことを検証
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
