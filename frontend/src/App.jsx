import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  const Protected = ({ children }) => {
    const token = localStorage.getItem('access')
    if (!token) return <Navigate to="/login" replace />
    return children
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<Protected><Dashboard /></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
