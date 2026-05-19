import React from 'react';

export default function SummaryScreen({ stats, onRetry, onHome }) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  
  let emoji = '🎉';
  let message = 'ยอดเยี่ยมมาก!';
  let color = 'text-green-500';

  if (accuracy < 50) {
    emoji = '💪';
    message = 'พยายามอีกนิดนะ!';
    color = 'text-orange-500';
  } else if (accuracy < 80) {
    emoji = '👏';
    message = 'ทำได้ดีแล้ว!';
    color = 'text-blue-500';
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-6 text-center animate-fade-in">
      <div className="text-8xl mb-4">{emoji}</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{message}</h2>
      <p className="text-gray-500 mb-8">คุณทดสอบเสร็จสิ้นแล้ว</p>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full max-w-sm mb-8">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">ความแม่นยำ</div>
          <div className={`text-6xl font-black ${color}`}>{accuracy}%</div>
        </div>

        <div className="flex justify-between border-t border-gray-100 pt-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">ตอบถูก</div>
            <div className="text-2xl font-bold text-green-500">{stats.correct}</div>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div>
            <div className="text-xs text-gray-500 mb-1">ตอบผิด</div>
            <div className="text-2xl font-bold text-red-500">{stats.incorrect}</div>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div>
            <div className="text-xs text-gray-500 mb-1">ทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button 
          onClick={onRetry}
          className="bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-indigo-700 transition active:scale-95"
        >
          🔄 ทดสอบอีกครั้ง
        </button>
        <button 
          onClick={onHome}
          className="bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition active:scale-95"
        >
          🏠 กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
