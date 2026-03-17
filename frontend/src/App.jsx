import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Suspense, lazy, useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Workflows = lazy(() => import('./pages/Workflows'))
const ExecuteWorkflow = lazy(() => import('./pages/ExecuteWorkflow'))
const ExecutionDetails = lazy(() => import('./pages/ExecutionDetails'))
const ExecutionPage = lazy(() => import('./components/ExecutionPage'))

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
}

function applyTheme(theme) {
    const root = document.documentElement

    root.style.setProperty('--bg-main', theme.bg)
    root.style.setProperty('--bg-secondary', theme.sec)
    root.style.setProperty('--accent', theme.acc)
    root.style.setProperty('--accent-dark', theme.dark)
    root.style.setProperty('--accent-hover', theme.dark)

    const acc = hexToRgb(theme.acc)
    const drk = hexToRgb(theme.dark)
    const bgm = hexToRgb(theme.bg)
    const bgs = hexToRgb(theme.sec)

    root.style.setProperty('--ac-r', acc.r)
    root.style.setProperty('--ac-g', acc.g)
    root.style.setProperty('--ac-b', acc.b)

    root.style.setProperty('--dk-r', drk.r)
    root.style.setProperty('--dk-g', drk.g)
    root.style.setProperty('--dk-b', drk.b)

    root.style.setProperty('--bm-r', bgm.r)
    root.style.setProperty('--bm-g', bgm.g)
    root.style.setProperty('--bm-b', bgm.b)

    root.style.setProperty('--bs-r', bgs.r)
    root.style.setProperty('--bs-g', bgs.g)
    root.style.setProperty('--bs-b', bgs.b)

    root.style.setProperty('--bg-card', theme.key === 'midnight' ? '#1e2235' : '#ffffff')
}

// Minimal inline fallback
function PageFallback() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FCF5EE',
        }}>
            <div style={{
                width: 32, height: 32,
                border: '2.5px solid rgba(238,105,131,.2)',
                borderTopColor: '#EE6983',
                borderRadius: '50%',
                animation: 'wf-spin .7s linear infinite',
            }} />
            <style>{`@keyframes wf-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )
}

export default function App() {

    useEffect(() => {
        const savedTheme = localStorage.getItem('wf_theme_data')

        if (savedTheme) {
            const theme = JSON.parse(savedTheme)
            applyTheme(theme)
        }
    }, [])
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<PageFallback />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/" element={
                            <ProtectedRoute><Dashboard /></ProtectedRoute>
                        } />
                        <Route path="/workflows" element={
                            <ProtectedRoute><Workflows /></ProtectedRoute>
                        } />
                        <Route path="/execute/:id" element={
                            <ProtectedRoute><ExecuteWorkflow /></ProtectedRoute>
                        } />
                        <Route path="/executions/:id" element={
                            <ProtectedRoute><ExecutionDetails /></ProtectedRoute>
                        } />
                        <Route path="/executions" element={
                            <ProtectedRoute><ExecutionPage /></ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    )
}