import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/ProtectedRoute'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Workflows = lazy(() => import('./pages/Workflows'))
const ExecuteWorkflow = lazy(() => import('./pages/ExecuteWorkflow'))
const ExecutionDetails = lazy(() => import('./pages/ExecutionDetails'))
const ExecutionPage = lazy(() => import('./components/ExecutionPage'))

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