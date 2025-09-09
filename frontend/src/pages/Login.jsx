import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await axios.post(`${API_BASE}/token/`, form)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      navigate('/app')
    } catch (err) {
      setError('Usuario o contraseña inválidos')
    }
  }

  return (
    <div className="container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit} className="card">
        <input name="username" placeholder="Usuario" value={form.username} onChange={onChange} required />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={onChange} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  )
}


