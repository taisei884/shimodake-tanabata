'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';

interface Comment {
  id: string;
  name: string;
  text: string;
  timestamp: number;
  date: string;
}

export default function Display() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isNewPost, setIsNewPost] = useState(false);

  useEffect(() => {
    // 初期データの取得
    const fetchComments = async () => {
      try {
        const response = await fetch('/api/comments');
        const data = await response.json();
        setComments(data.comments || []);
        setTotalCount(data.totalCount || 0);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();

    // Pusherの設定
    const channel = pusherClient.subscribe('comments-channel');
    
    channel.bind('new-comment', (comment: Comment) => {
      setComments((prev) => {
        const updated = [comment, ...prev];
        return updated.slice(0, 10);
      });
      // 新規投稿時にカウントを増やしてアニメーション発動
      setTotalCount((prev) => prev + 1);
      setIsNewPost(true);
      setTimeout(() => setIsNewPost(false), 2000);
    });

    return () => {
      pusherClient.unsubscribe('comments-channel');
    };
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 p-6 overflow-hidden">
      {/* 背景の装飾的な星 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

        {/* アニメーション付きカウンター（右上配置） */}
      <div className={`absolute top-4 right-20 z-20 flex items-center gap-2 bg-gradient-to-r from-purple-500/40 to-pink-500/40 backdrop-blur-md rounded-full px-5 py-3 border-2 border-white/40 shadow-2xl transform transition-all duration-500 ${
        isNewPost ? 'scale-110 border-yellow-300/60' : 'scale-100'
      }`}>
        <span className={`text-3xl transition-all duration-500 ${isNewPost ? 'animate-bounce' : ''}`}>
          {isNewPost ? '🎉' : '🌟'}
        </span>
        <div className="text-center">
          <p className="text-white/90 text-sm font-medium">総投稿数</p>
          <p className={`text-3xl font-black transition-all duration-500 ${
            isNewPost ? 'text-yellow-300 animate-pulse' : 'text-white'
          }`}>
            {totalCount.toLocaleString()}
            <span className="text-lg ml-1">件</span>
          </p>
        </div>
        <span className={`text-3xl transition-all duration-500 ${isNewPost ? 'animate-bounce' : ''}`}>
          {isNewPost ? '🎉' : '🌟'}
        </span>
      </div>

      {/* カウンター増加時のエフェクト */}
      {isNewPost && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
          <div className="text-6xl animate-ping">✨</div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="text-center mb-4 relative z-10">
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
          🎋 下分七夕飾り メッセージボード 🎋
        </h1>
        <p className="text-xl text-white/90">
          みなさまからのメッセージをリアルタイムでお届けします
        </p>
      </div>

      {/* コメント表示エリア */}
      <div className="h-[calc(100vh-140px)] relative z-10">
        <div className="flex flex-col gap-2 h-full">
          {comments.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 text-center text-white border border-white/20">
              <p className="text-2xl mb-2">まだメッセージがありません</p>
              <p className="text-lg opacity-80">QRコードを読み取って最初のメッセージを投稿してください！</p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const heightPercent = index === 0 ? 20 : index === 1 ? 15 : 8.125;
              const fontSize = index === 0 ? 'text-3xl' : index === 1 ? 'text-2xl' : 'text-lg';
              const nameSize = index === 0 ? 'text-xl' : index === 1 ? 'text-lg' : 'text-base';
              const dateSize = index === 0 ? 'text-lg' : index === 1 ? 'text-base' : 'text-sm';
              const padding = index === 0 ? 'px-8 py-5' : index === 1 ? 'px-6 py-4' : 'px-5 py-2';
              const namePadding = index === 0 ? 'px-5 py-2' : index === 1 ? 'px-4 py-1' : 'px-3 py-1';
              
              return (
                <div
                  key={comment.id}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl ${padding} flex items-center border border-white/20 min-h-0 transition-all duration-300 ${
                    index === 0 ? 'animate-slideIn bg-white/25 shadow-2xl scale-[1.02]' : index === 1 ? 'bg-white/20 shadow-lg' : 'hover:bg-white/15'
                  }`}
                  style={{ 
                    height: `${heightPercent}%`,
                    animation: index === 0 ? 'slideIn 0.6s ease-out' : undefined
                  }}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full ${namePadding} shrink-0 backdrop-blur-sm border border-white/30`}>
                      <span className={`text-white font-bold ${nameSize} whitespace-nowrap`}>
                        {comment.name} さん
                      </span>
                    </div>
                    <p className={`text-white ${fontSize} flex-1 ${index < 2 ? 'line-clamp-2' : 'line-clamp-1'} leading-relaxed font-medium`}>
                      {comment.text}
                    </p>
                    <span className={`text-white/80 ${dateSize} shrink-0 font-bold`}>
                      {comment.date}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1.02);
          }
        }
        .line-clamp-1 {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .line-clamp-2 {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}