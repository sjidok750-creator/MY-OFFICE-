import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function AddTodo({ onAdd }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="할 일을 입력하세요..."
        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-3 rounded-xl transition flex items-center gap-1 text-sm font-semibold whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">추가</span>
      </button>
    </form>
  )
}
