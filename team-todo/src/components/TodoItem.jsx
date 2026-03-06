import { Trash2, Check } from 'lucide-react'

export default function TodoItem({ todo, onToggle, onDelete, currentNickname }) {
  const isOwner = todo.createdBy === currentNickname

  const createdAt = todo.createdAt?.toDate?.()
  const timeLabel = createdAt
    ? createdAt.toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border transition ${
        todo.completed
          ? 'bg-gray-50 border-gray-100 opacity-60'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {/* 체크박스 */}
      <button
        onClick={() => onToggle(todo.id, todo.completed)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition mt-0.5 ${
          todo.completed
            ? 'bg-indigo-500 border-indigo-500'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {todo.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium break-words ${
            todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {todo.text}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
            {todo.createdBy}
          </span>
          {timeLabel && (
            <span className="text-xs text-gray-400">{timeLabel}</span>
          )}
        </div>
      </div>

      {/* 삭제 버튼 (본인이 추가한 항목만) */}
      {isOwner && (
        <button
          onClick={() => onDelete(todo.id)}
          className="flex-shrink-0 text-gray-300 hover:text-red-400 transition mt-0.5"
          title="삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
