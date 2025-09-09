import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      await axios.post(`${API_BASE}/auth/register/`, form)
      setMsg('Registro exitoso. Ahora puedes iniciar sesión.')
      setTimeout(() => navigate('/login'), 800)
    } catch (err) {
      setError(err?.response?.data?.detail || 'No se pudo registrar')
    }
  }

  return (
    <div className="container">
      <h2>Registro</h2>
      <form onSubmit={onSubmit} className="card">
        <input name="username" placeholder="Usuario" value={form.username} onChange={onChange} required />
        <input name="password" type="password" placeholder="Contraseña (min 6)" value={form.password} onChange={onChange} required />
        {msg && <p className="success">{msg}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Crear cuenta</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  )
}


