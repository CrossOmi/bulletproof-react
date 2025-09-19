import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

import { db } from '../../db';
import { discussionsHandlers } from '../discussions';
import { env } from '@/config/env';
// 1. 認証用のユーティリティに `hash` を追加でインポートします
import { authenticate, AUTH_COOKIE, hash } from '../../utils';

// 2. 認証に必要な情報をダミーユーザーに追加します
const mockUser = {
  id: 'user-1',
  email: 'test@user.com',
  password: 'password123', // authenticate が見つけられるようにするため
  teamId: 'team-1',
};

// ... createDiscussion ヘルパー関数は変更なし
const createDiscussion = (title: string, authorId: string, teamId: string) => {
  db.discussion.create({
    id: Math.random().toString(),
    title,
    body: 'Lorem ipsum',
    createdAt: new Date().toJSON(),
    authorId,
    teamId,
  });
};

const authHandler = http.get(`${env.API_URL}/auth/me`, () => {
  return HttpResponse.json({ data: mockUser });
});

const server = setupServer(...discussionsHandlers, authHandler);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

// 3. 各テストの前に、認証対象のユーザーがDBに存在することを保証します
beforeEach(() => {
  // 4. パスワードをハッシュ化してからDBに保存します
  db.user.create({
    ...mockUser,
    password: hash(mockUser.password),
  });
});

afterEach(() => {
  server.resetHandlers();
  // 他のテストに影響しないよう、user もクリーンアップします
  db.user.deleteMany({ where: {} });
  db.discussion.deleteMany({ where: {} });
});

describe('GET /discussions handler', () => {
  it('should return all discussions for the users team when no query is provided', async () => {
    createDiscussion('Test Discussion 1', mockUser.id, mockUser.teamId);
    createDiscussion('Test Discussion 2', mockUser.id, mockUser.teamId);
    createDiscussion('Other Team Discussion', 'user-2', 'team-2');

    // authenticate を使って認証トークン(JWT)を生成します
    const { jwt } = authenticate({
      email: mockUser.email,
      password: mockUser.password,
    });

    // fetchリクエストのヘッダーに、生成したトークンをクッキーとして設定します
    const res = await fetch(`${env.API_URL}/discussions`, {
      headers: {
        Cookie: `${AUTH_COOKIE}=${jwt}`,
      },
    });
    const body = await res.json();

    expect(res.status).toBe(200); // これで 200 OK になるはずです
    expect(body.data.length).toBe(2);
  });

  it('should filter discussions by title when "q" query parameter is present', async () => {
    createDiscussion('A discussion about React', mockUser.id, mockUser.teamId);
    createDiscussion('Another one about quis', mockUser.id, mockUser.teamId);
    createDiscussion('General discussion', mockUser.id, mockUser.teamId);

    // こちらのテストも同様に認証が必要です
    const { jwt } = authenticate({
      email: mockUser.email,
      password: mockUser.password,
    });

    const res = await fetch(`${env.API_URL}/discussions?q=quis`, {
      headers: {
        Cookie: `${AUTH_COOKIE}=${jwt}`,
      },
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toContain('quis');
  });
});
