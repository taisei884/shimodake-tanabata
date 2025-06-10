import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { pusherServer } from '@/lib/pusher';

export interface Comment {
  id: string;
  name: string;
  text: string;
  timestamp: number;
  date: string;
}

// 投稿間隔を記録するマップ（メモリ内）
const lastPostTimes = new Map<string, number>();

export async function GET() {
  try {
    // 型アサーションを使用
    const comments = await kv.zrange('comments', -10, -1, {
      rev: true,
    }) as Comment[];
    
    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // IPアドレスを取得
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // 30秒制限チェック
    const now = Date.now();
    const lastPostTime = lastPostTimes.get(ip) || 0;
    const timeSinceLastPost = (now - lastPostTime) / 1000;
    
    if (timeSinceLastPost < 30 && lastPostTime > 0) {
      return NextResponse.json(
        { error: `次の投稿まで${Math.ceil(30 - timeSinceLastPost)}秒お待ちください` },
        { status: 429 }
      );
    }

    const { name, text } = await request.json();
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'お名前を入力してください' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'メッセージを入力してください' },
        { status: 400 }
      );
    }

    if (name.length > 20) {
      return NextResponse.json(
        { error: 'お名前は20文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (text.length > 200) {
      return NextResponse.json(
        { error: 'メッセージは200文字以内で入力してください' },
        { status: 400 }
      );
    }

    const comment: Comment = {
      id: uuidv4(),
      name: name.trim(),
      text: text.trim(),
      timestamp: Date.now(),
      date: new Date().toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '/').replace(' ', ' '),
    };

    // Vercel KVに保存
    await kv.zadd('comments', {
      score: comment.timestamp,
      member: comment,
    });

    // 投稿時刻を記録
    lastPostTimes.set(ip, now);

    // Pusherでリアルタイム通知
    await pusherServer.trigger('comments-channel', 'new-comment', comment);

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { error: 'メッセージの投稿に失敗しました' },
      { status: 500 }
    );
  }
}