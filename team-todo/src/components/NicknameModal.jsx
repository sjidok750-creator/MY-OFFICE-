import { useState } from 'react'
import { User } from 'lucide-react'

export default function NicknameModal({ onConfirm }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = input.trim()
    if (!name) return
    onConfirm(name)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">팀 투두</h1>
            <p className="text-gray-500 text-sm mt-1">닉네임을 입력하고 시작하세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="닉네임 (예: 김민준)"
            maxLength={20}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  )
}
