'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [lastPostTime, setLastPostTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // 残り時間のカウントダウン
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = Math.floor((now - lastPostTime) / 1000);
      const remaining = Math.max(0, 30 - timePassed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPostTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 30秒制限のチェック
    const now = Date.now();
    const timeSinceLastPost = (now - lastPostTime) / 1000;
    
    if (timeSinceLastPost < 30 && lastPostTime > 0) {
      const waitTime = Math.ceil(30 - timeSinceLastPost);
      setMessage(`次の投稿まで${waitTime}秒お待ちください`);
      setMessageType('error');
      return;
    }
    
    if (!name.trim()) {
      setMessage('お名前を入力してください');
      setMessageType('error');
      return;
    }
    
    if (!comment.trim()) {
      setMessage('コメントを入力してください');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, text: comment }),
      });

      const data = await response.json();

      if (response.ok) {
        setName('');
        setComment('');
        setMessage('コメントを投稿しました！');
        setMessageType('success');
        setLastPostTime(now);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'エラーが発生しました');
        setMessageType('error');
      }
    } catch {
      setMessage('通信エラーが発生しました');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
        <div className="absolute top-20 right-20 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-40 left-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-32 right-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 mt-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>🎋</span>
              <span className="mx-2">下分七夕飾りへようこそ！</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>🎋</span>
            </h1>
            <p className="text-gray-600">
              感想やメッセージを投稿してください
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お名前（ニックネーム可）
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：たなばた太郎"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  style={{ color: '#1f2937', backgroundColor: 'white' }}
                  maxLength={20}
                  disabled={isSubmitting}
                  />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {name.length}/20文字
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="七夕飾りを見た感想や願い事、どちらからお越しかなど..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  style={{ color: '#1f2937', backgroundColor: 'white' }}
                  rows={5}
                  maxLength={200}
                  disabled={isSubmitting}
                />
                <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                  {comment.length}/200文字
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (remainingTime > 0 && lastPostTime > 0)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 transform ${
                  isSubmitting || (remainingTime > 0 && lastPostTime > 0)
                    ? 'bg-gray-400 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    投稿中...
                  </span>
                ) : remainingTime > 0 && lastPostTime > 0 ? (
                  `次の投稿まで ${remainingTime} 秒`
                ) : (
                  '投稿する'
                )}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-xl text-center font-medium transform transition-all duration-300 ${
              messageType === 'error' 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {messageType === 'success' && '✅ '}
              {messageType === 'error' && '⚠️ '}
              {message}
            </div>
          )}
        </div>

        <div className="text-center mt-6 px-4">
          <p className="text-white/90 text-sm leading-relaxed">
            投稿されたコメントは会場のモニターに
            <br />
            リアルタイムで表示されます
          </p>
          {lastPostTime > 0 && remainingTime === 0 && (
            <p className="text-green-300 text-xs mt-2">
              ✅ 再度投稿できます
            </p>
          )}
        </div>

        <div className="flex justify-center mt-8 space-x-8">
          <div className="text-4xl animate-pulse">🌟</div>
          <div className="text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="text-4xl animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>
        </div>
      </div>
    </div>
  );
}