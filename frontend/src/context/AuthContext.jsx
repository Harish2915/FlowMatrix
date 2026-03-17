import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Read from localStorage synchronously — instant, no network call
        try {
            const storedToken = localStorage.getItem('wf_token')
            const storedUser = localStorage.getItem('wf_user')
            if (storedToken && storedUser) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            }
        } catch {
            localStorage.removeItem('wf_token')
            localStorage.removeItem('wf_user')
        }
        // Set loading false immediately
        setLoading(false)
    }, [])

    const login = (tokenData, userData) => {
        setToken(tokenData)
        setUser(userData)
        localStorage.setItem('wf_token', tokenData)
        localStorage.setItem('wf_user', JSON.stringify(userData))
    }

    const updateUser = (updatedUser) => {
        setUser(updatedUser)
        localStorage.setItem('wf_user', JSON.stringify(updatedUser))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('wf_token')
        localStorage.removeItem('wf_user')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}