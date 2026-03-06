import TodoItem from './TodoItem'
import { ClipboardList } from 'lucide-react'

export default function TodoList({ todos, onToggle, onDelete, currentNickname }) {
  const active = todos.filter((t) => !t.completed)
  const completed = todos.filter((t) => t.completed)

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">아직 할 일이 없습니다.</p>
        <p className="text-xs mt-1">위에서 새 할 일을 추가해보세요!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 진행 중 */}
      {active.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            진행 중 ({active.length})
          </h2>
          <div className="flex flex-col gap-2">
            {active.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                currentNickname={currentNickname}
              />
            ))}
          </div>
        </section>
      )}

      {/* 완료 */}
      {completed.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            완료 ({completed.length})
          </h2>
          <div className="flex flex-col gap-2">
            {completed.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                currentNickname={currentNickname}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
