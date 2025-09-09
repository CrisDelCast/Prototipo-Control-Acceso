import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const LazyWebcam = lazy(() => import('react-webcam'))

const API_BASE = import.meta.env.VITE_API_BASE || '/api'
let MEDIA_BASE
try {
  const apiUrl = new URL(API_BASE, window.location.origin)
  MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE || apiUrl.origin
} catch {
  MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE || window.location.origin
}

function useAuthAxios() {
  const instance = useMemo(() => {
    const i = axios.create({ baseURL: API_BASE })
    i.interceptors.request.use((config) => {
      const token = localStorage.getItem('access')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
    return i
  }, [])
  return instance
}

export default function Dashboard() {
  const api = useAuthAxios()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    document_type: 'CC',
    document_number: '',
    apartment: '',
    visitor_type: 'VISITANTE',
    always_allowed: false,
    photo: null,
  })
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const webcamRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === 'checkbox') setForm({ ...form, [name]: checked })
    else if (type === 'file') setForm({ ...form, photo: files?.[0] || null })
    else setForm({ ...form, [name]: value })
  }

  const stopCamera = () => {
    const video = webcamRef.current?.video
    const stream = video && video.srcObject
    if (stream && typeof stream.getTracks === 'function') {
      stream.getTracks().forEach((t) => t.stop())
    }
    if (video) video.srcObject = null
  }

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) return
    const byteString = atob(imageSrc.split(',')[1])
    const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    const blob = new Blob([ab], { type: mimeString })
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: mimeString })
    setForm((prev) => ({ ...prev, photo: file }))
    stopCamera()
    setShowCamera(false)
  }

  const submitVisitor = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) fd.append(k, v)
      })
      await api.post('/visitors/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await fetchRows()
      setForm({
        full_name: '', document_type: 'CC', document_number: '', apartment: '',
        visitor_type: 'VISITANTE', always_allowed: false, photo: null,
      })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Error al guardar (duplicado o datos inválidos).')
    }
  }

  const fetchRows = async () => {
    const params = search ? { search } : {}
    const { data } = await api.get('/visitors/', { params })
    setRows(data)
  }

  useEffect(() => { fetchRows() }, [])
  useEffect(() => { const t = setTimeout(fetchRows, 300); return () => clearTimeout(t) }, [search])

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>Registro de Visitantes</h2>
        <button onClick={() => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); navigate('/login') }}>Salir</button>
      </div>
      <form onSubmit={submitVisitor} className="card">
        <input name="full_name" placeholder="Nombre completo" value={form.full_name} onChange={onChange} required />
        <div className="row">
          <select name="document_type" value={form.document_type} onChange={onChange}>
            <option value="CC">CC</option>
            <option value="TI">TARJETA IDENTIDAD</option>
            <option value="PASAPORTE">PASAPORTE</option>
            <option value="PPT">PPT</option>
          </select>
          <input name="document_number" placeholder="Número de documento" value={form.document_number} onChange={onChange} required />
        </div>
        <div className="row">
          <input name="apartment" placeholder="Apartamento" value={form.apartment} onChange={onChange} required />
          <select name="visitor_type" value={form.visitor_type} onChange={onChange}>
            <option value="PROVEEDOR">Proveedor</option>
            <option value="VISITANTE">Visitante</option>
          </select>
        </div>
        <label className="row">
          <input type="checkbox" name="always_allowed" checked={form.always_allowed} onChange={onChange} />
          Permitido siempre
        </label>

        <div className="row">
          <input type="file" accept="image/*" onChange={onChange} />
          {showCamera ? (
            <>
              <Suspense fallback={<span>Cargando cámara…</span>}>
                <LazyWebcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }}
                />
              </Suspense>
              <button type="button" onClick={capture}>Tomar foto</button>
              <button type="button" onClick={() => { stopCamera(); setShowCamera(false) }}>Cerrar cámara</button>
            </>
          ) : (
            <button type="button" onClick={() => setShowCamera(true)}>Abrir cámara</button>
          )}
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit">Guardar</button>
      </form>

      <div className="card">
        <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo Doc</th>
              <th>N° Doc</th>
              <th>Apartamento</th>
              <th>Tipo</th>
              <th>Siempre</th>
              <th>Foto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.full_name}</td>
                <td>{r.document_type}</td>
                <td>{r.document_number}</td>
                <td>{r.apartment}</td>
                <td>{r.visitor_type}</td>
                <td>{r.always_allowed ? 'Sí' : 'No'}</td>
                <td>
                  {r.photo ? (() => {
                    let pathname
                    try {
                      const u = new URL(r.photo, window.location.origin)
                      pathname = u.pathname
                    } catch {
                      pathname = typeof r.photo === 'string' ? r.photo : ''
                    }
                    const absoluteUrl = `${MEDIA_BASE}${pathname}`
                    return (
                      <>
                        <a href={absoluteUrl} target="_blank" rel="noopener noreferrer" title={absoluteUrl}>
                          <img src={absoluteUrl} alt="foto" width={60} />
                        </a>
                        <div style={{ fontSize: '12px', color: '#555', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={absoluteUrl}>
                          {absoluteUrl.split('/').pop()}
                        </div>
                      </>
                    )
                  })() : ('-')}
                </td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


