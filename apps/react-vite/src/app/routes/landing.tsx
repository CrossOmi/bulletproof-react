import { useNavigate } from 'react-router';

import logo from '@/assets/logo.svg';
import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

const LandingRoute = () => {
  const navigate = useNavigate();
  const user = useUser();

  const handleStart = () => {
    if (user.data) {
      navigate(paths.app.dashboard.getHref());
    } else {
      navigate(paths.auth.login.getHref());
    }
  };

  return (
    <>
      <Head description="Welcome to bulletproof react" />
      <div className="flex h-screen items-center bg-white">
        {/* flex: Flexboxコンテナとして要素を配置。
            h-screen: ビューポートの高さ全体に広がる。
            items-center: 子要素を垂直方向の中央に揃える。
            bg-white: 背景色を白にする。 */}
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          {/* mx-auto: 左右のマージンを自動にして、要素を水平方向の中央に配置。
              max-w-7xl: 最大幅を1280pxに制限する。
              px-4: 左右のパディングを1rem (16px)にする。
              py-12: 上下のパディングを3rem (48px)にする。
              text-center: テキストを中央揃えにする。
              sm:px-6: 画面幅がsm (640px)以上の場合、左右のパディングを1.5rem (24px)にする。
              lg:px-8: 画面幅がlg (1024px)以上の場合、左右のパディングを2rem (32px)にする。
              lg:py-16: 画面幅がlg (1024px)以上の場合、上下のパディングを4rem (64px)にする。 */}
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {/* text-3xl: フォントサイズを3xl (30px)にする。
                font-extrabold: フォントを極太にする。
                tracking-tight: 文字間隔を狭くする。
                text-gray-900: 文字色を濃いグレーにする。
                sm:text-4xl: 画面幅がsm (640px)以上の場合、フォントサイズを4xl (36px)にする。 */}
            <span className="block">Bulletproof React</span>
            {/* block: ブロックレベル要素として表示し、前後に改行を入れる。 */}
          </h2>
          <img src={logo} alt="react" />
          <p>Showcasing Best Practices For Building React Applications</p>
          <div className="mt-8 flex justify-center">
            {/* mt-8: 上のマージンを2rem (32px)にする。
                flex: Flexboxコンテナとして要素を配置。
                justify-center: 子要素を水平方向の中央に揃える。 */}
            <div className="inline-flex rounded-md shadow">
              {/* inline-flex: インライン要素としてFlexboxを有効にする。
                  rounded-md: 角を中程度に丸くする。
                  shadow: 要素に影を付ける。 */}
              <Button
                onClick={handleStart}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {/* size-6: SVGの幅と高さを1.5rem (24px)にする。 */}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                }
              >
                Get started
              </Button>
            </div>
            <div className="ml-3 inline-flex">
              {/* ml-3: 左のマージンを0.75rem (12px)にする。
                  inline-flex: インライン要素としてFlexboxを有効にする。 */}
              <a
                href="https://github.com/alan2207/bulletproof-react"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  icon={
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="size-6"
                    >
                      {/* size-6: SVGの幅と高さを1.5rem (24px)にする。 */}
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                >
                  Github Repo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingRoute;
