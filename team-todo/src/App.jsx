import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import NicknameModal from './components/NicknameModal'
import AddTodo from './components/AddTodo'
import TodoList from './components/TodoList'
import { Users, LogOut } from 'lucide-react'

const NICKNAME_KEY = 'team_todo_nickname'

export default function App() {
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICKNAME_KEY) || '')
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  // Firestore 실시간 구독
  useEffect(() => {
    const q = query(collection(db, 'todos'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setTodos(items)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleConfirmNickname = (name) => {
    localStorage.setItem(NICKNAME_KEY, name)
    setNickname(name)
  }

  const handleLogout = () => {
    localStorage.removeItem(NICKNAME_KEY)
    setNickname('')
  }

  const handleAdd = async (text) => {
    await addDoc(collection(db, 'todos'), {
      text,
      completed: false,
      createdBy: nickname,
      createdAt: serverTimestamp(),
    })
  }

  const handleToggle = async (id, currentCompleted) => {
    await updateDoc(doc(db, 'todos', id), { completed: !currentCompleted })
  }

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'todos', id))
  }

  return (
    <>
      {!nickname && <NicknameModal onConfirm={handleConfirmNickname} />}

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* 헤더 */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">팀 투두</h1>
                {nickname && (
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-indigo-600">{nickname}</span>
                    님으로 참여 중
                  </p>
                )}
              </div>
            </div>
            {nickname && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-xs transition px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                닉네임 변경
              </button>
            )}
          </header>

          {/* 할 일 추가 */}
          {nickname && (
            <div className="mb-6">
              <AddTodo onAdd={handleAdd} />
            </div>
          )}

          {/* 진행 현황 */}
          {todos.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(todos.filter((t) => t.completed).length / todos.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {todos.filter((t) => t.completed).length} / {todos.length} 완료
              </span>
            </div>
          )}

          {/* 목록 */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              currentNickname={nickname}
            />
          )}
        </div>
      </div>
    </>
  )
}
