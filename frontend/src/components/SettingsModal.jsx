import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// ── Themes ──────────────────────────────────
const THEMES = [
    { key: 'rose', label: 'Rose', bg: '#FCF5EE', sec: '#FFC4C4', acc: '#EE6983', dark: '#850E35' },
    { key: 'ocean', label: 'Ocean', bg: '#EEF5FC', sec: '#C4DCFF', acc: '#6983EE', dark: '#0E3585' },
    { key: 'forest', label: 'Forest', bg: '#EEFCF0', sec: '#C4FFCA', acc: '#69EE83', dark: '#0E8535' },
    { key: 'sunset', label: 'Sunset', bg: '#FCF0EE', sec: '#FFC4A0', acc: '#EE8369', dark: '#852A0E' },
    { key: 'violet', label: 'Violet', bg: '#F5EEFC', sec: '#DCC4FF', acc: '#9869EE', dark: '#3D0E85' },
    { key: 'slate', label: 'Slate', bg: '#EEEEF5', sec: '#C4C4FF', acc: '#6969EE', dark: '#0E0E85' },
    { key: 'crimson', label: 'Crimson', bg: '#FFF0F0', sec: '#FFB3B3', acc: '#E63946', dark: '#9B1D20' },
    { key: 'teal', label: 'Teal', bg: '#EFFAF8', sec: '#A8E6DF', acc: '#0E9F8E', dark: '#0A5F55' },
    { key: 'amber', label: 'Amber', bg: '#FFFBEE', sec: '#FFE5A0', acc: '#F59E0B', dark: '#92400E' },
    { key: 'emerald', label: 'Emerald', bg: '#F0FDF4', sec: '#BBF7D0', acc: '#10B981', dark: '#065F46' },
    { key: 'sakura', label: 'Sakura', bg: '#FFF5F8', sec: '#FFD6E5', acc: '#FF6FA8', dark: '#B5174D' },
    { key: 'midnight', label: 'Midnight', bg: '#1A1D2E', sec: '#2D3156', acc: '#7C83FF', dark: '#4A52C4' },
    { key: 'copper', label: 'Copper', bg: '#FDF6F0', sec: '#F5CBA7', acc: '#CA6F1E', dark: '#784212' },
    { key: 'indigo', label: 'Indigo', bg: '#EEF0FF', sec: '#C7CEFF', acc: '#4F5BD5', dark: '#2C3494' },
    { key: 'mint', label: 'Mint', bg: '#F0FFF8', sec: '#B2F5E0', acc: '#00C896', dark: '#007A5A' },
    { key: 'graphite', label: 'Graphite', bg: '#F4F4F6', sec: '#D1D1DB', acc: '#6E6E8A', dark: '#3A3A52' },
    { key: 'coral', label: 'Coral', bg: '#FFF4F2', sec: '#FFCDC7', acc: '#FF6B55', dark: '#C0392B' },
    { key: 'aurora', label: 'Aurora', bg: '#F0F8FF', sec: '#C8E8FF', acc: '#0EA5E9', dark: '#0369A1' },
]

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
}

function applyTheme(theme) {
    const root = document.documentElement
    // Hex vars
    root.style.setProperty('--bg-main', theme.bg)
    root.style.setProperty('--bg-secondary', theme.sec)
    root.style.setProperty('--accent', theme.acc)
    root.style.setProperty('--accent-dark', theme.dark)
    root.style.setProperty('--accent-hover', theme.dark)
    // RGB channel vars — every rgba() in the CSS uses these
    const acc = hexToRgb(theme.acc)
    const drk = hexToRgb(theme.dark)
    const bgm = hexToRgb(theme.bg)
    const bgs = hexToRgb(theme.sec)
    root.style.setProperty('--ac-r', acc.r); root.style.setProperty('--ac-g', acc.g); root.style.setProperty('--ac-b', acc.b)
    root.style.setProperty('--dk-r', drk.r); root.style.setProperty('--dk-g', drk.g); root.style.setProperty('--dk-b', drk.b)
    root.style.setProperty('--bm-r', bgm.r); root.style.setProperty('--bm-g', bgm.g); root.style.setProperty('--bm-b', bgm.b)
    root.style.setProperty('--bs-r', bgs.r); root.style.setProperty('--bs-g', bgs.g); root.style.setProperty('--bs-b', bgs.b)
    // bg-card stays white unless midnight theme
    root.style.setProperty('--bg-card', theme.key === 'midnight' ? '#1e2235' : '#ffffff')
    localStorage.setItem('wf_theme', theme.key)
    localStorage.setItem('wf_theme_data', JSON.stringify(theme))
}

// ── Tabs config ──────────────────────────────
const TABS = [
    { key: 'profile', label: 'Profile', icon: 'bi-person-circle' },
    { key: 'theme', label: 'Theme', icon: 'bi-palette' },
    { key: 'settings', label: 'Settings', icon: 'bi-gear' },
    { key: 'password', label: 'Security', icon: 'bi-shield-lock' },
]

export default function SettingsModal({ defaultTab = 'profile', onClose }) {
    const { user, updateUser, logout } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState(defaultTab)

    // ── Profile state ──
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
    const [savingProfile, setSavingProfile] = useState(false)

    // ── Password state ──
    const [curPwd, setCurPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confPwd, setConfPwd] = useState('')
    const [showCur, setShowCur] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConf, setShowConf] = useState(false)
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
    const [savingPassword, setSavingPassword] = useState(false)

    // ── Theme state ──
    const [activeTheme, setActiveTheme] = useState(
        localStorage.getItem('wf_theme') || 'mint'
    )
    const [themeMsg, setThemeMsg] = useState({ type: '', text: '' })

    // ── Settings state ──
    const [notifEmail, setNotifEmail] = useState(localStorage.getItem('wf_notif_email') !== 'false')
    const [compactMode, setCompactMode] = useState(localStorage.getItem('wf_compact') === 'true')
    const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' })

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

    // ── Force re-login helper ──────────────────
    const forceReLogin = (message) => {
        setTimeout(() => {
            logout()
            navigate('/login', { state: { message } })
        }, 1800)
    }

    // ── Save profile ──────────────────────────
    const handleProfileSave = async () => {
        if (!name.trim()) {
            setProfileMsg({ type: 'err', text: 'Name is required' })
            return
        }
        setSavingProfile(true)
        setProfileMsg({ type: '', text: '' })
        try {
            const res = await api.put('/auth/profile', {
                name: name.trim(),
                email: email.trim(),
            })
            updateUser(res.data)
            setProfileMsg({ type: 'ok', text: '✓ Profile updated! Please log in again to apply changes.' })
            forceReLogin('Profile updated. Please log in again.')
        } catch (e) {
            setProfileMsg({ type: 'err', text: e.response?.data?.detail || 'Failed to update profile' })
        }
        setSavingProfile(false)
    }

    // ── Save password ─────────────────────────
    const handlePasswordSave = async () => {
        setPasswordMsg({ type: '', text: '' })
        if (!curPwd) { setPasswordMsg({ type: 'err', text: 'Current password is required' }); return }
        if (!newPwd) { setPasswordMsg({ type: 'err', text: 'New password is required' }); return }
        if (newPwd.length < 6) { setPasswordMsg({ type: 'err', text: 'Minimum 6 characters' }); return }
        if (newPwd !== confPwd) { setPasswordMsg({ type: 'err', text: 'Passwords do not match' }); return }

        setSavingPassword(true)
        try {
            await api.put('/auth/password', {
                current_password: curPwd,
                new_password: newPwd,
            })
            setPasswordMsg({ type: 'ok', text: '✓ Password changed! Redirecting to login…' })
            setCurPwd(''); setNewPwd(''); setConfPwd('')
            forceReLogin('Password changed. Please log in with your new password.')
        } catch (e) {
            setPasswordMsg({ type: 'err', text: e.response?.data?.detail || 'Failed to change password' })
        }
        setSavingPassword(false)
    }

    // ── Apply theme ───────────────────────────
    const handleThemeSelect = (theme) => {
        applyTheme(theme)
        setActiveTheme(theme.key)
        setThemeMsg({ type: 'ok', text: `✓ ${theme.label} theme applied!` })
        setTimeout(() => setThemeMsg({ type: '', text: '' }), 2000)
    }

    // ── Save settings ─────────────────────────
    const handleSettingsSave = () => {
        localStorage.setItem('wf_notif_email', notifEmail)
        localStorage.setItem('wf_compact', compactMode)
        setSettingsMsg({ type: 'ok', text: '✓ Settings saved successfully!' })
        setTimeout(() => setSettingsMsg({ type: '', text: '' }), 2500)
    }

    // ── Msg component ─────────────────────────
    const Msg = ({ msg }) => {
        if (!msg.text) return null
        return (
            <div className={`alert-${msg.type} mb-3`}>
                <i className={`bi bi-${msg.type === 'ok' ? 'check-circle-fill' : 'exclamation-circle-fill'}`} />
                {msg.text}
            </div>
        )
    }

    useEffect(() => {
        document.body.classList.add('modal-open-custom')
        return () => {
            document.body.classList.remove('modal-open-custom')
        }
    }, [])

    // ── Password field ────────────────────────
    const PwdField = ({ label, value, onChange, show, onToggle, placeholder }) => (
        <div className="mb-3">
            <label className="form-label-custom">{label}</label>

            <div className="pwd-field-wrap">
                <i className="bi bi-lock pwd-icon"></i>

                <input
                    className="form-control-custom pwd-input"
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />

                <button
                    type="button"
                    className="pwd-toggle"
                    onClick={onToggle}
                >
                    <i className={`bi bi-eye${show ? "-slash" : ""}`}></i>
                </button>
            </div>
        </div>
    )

    return (
        <div
            className="modal d-block"
            style={{
                background: 'rgba(45,26,26,.55)',
                backdropFilter: 'blur(6px)',
                zIndex: 2100,
            }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                style={{ maxWidth: 500 }}>
                <div className="modal-content">

                    {/* ── Header ── */}
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-person-gear text-accent" />
                            Account Settings
                        </h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    {/* ── Tab strip ── */}
                    <div className="settings-tab-strip">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                className={`settings-tab-btn${tab === t.key ? ' active' : ''}`}
                                onClick={() => setTab(t.key)}
                            >
                                <i className={`bi ${t.icon}`} />
                                <span className="d-none d-sm-inline">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Body ── */}
                    <div className="modal-body">

                        {/* ════ PROFILE TAB ════ */}
                        {tab === 'profile' && (
                            <div>
                                {/* Avatar */}
                                <div className="text-center mb-4">
                                    <div style={{
                                        width: 76, height: 76,
                                        background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '1.6rem', fontWeight: 700,
                                        margin: '0 auto 10px',
                                        boxShadow: '0 6px 24px rgba(238,105,131,.35)',
                                    }}>
                                        {initials}
                                    </div>
                                    <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                                        Initials avatar — update name to change it
                                    </div>
                                </div>

                                <Msg msg={profileMsg} />

                                {/* Name */}
                                <div className="mb-3">
                                    <label className="form-label-custom">Full Name</label>

                                    <div className="input-icon-wrap">
                                        <i className="bi bi-person input-icon"></i>

                                        <input
                                            className="form-control-custom"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="mb-4">
                                    <label className="form-label-custom">Email Address</label>

                                    <div className="input-icon-wrap">
                                        <i className="bi bi-envelope input-icon"></i>

                                        <input
                                            type="email"
                                            className="form-control-custom"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Warning */}
                                <div style={{
                                    background: 'rgba(245,158,11,.08)',
                                    border: '1px solid rgba(245,158,11,.2)',
                                    borderRadius: 10, padding: '10px 14px',
                                    fontSize: '.78rem', color: '#92400e',
                                    display: 'flex', gap: 8, alignItems: 'flex-start',
                                    marginBottom: '1rem',
                                }}>
                                    <i className="bi bi-info-circle-fill mt-1" style={{ flexShrink: 0 }} />
                                    <span>Saving profile changes will <strong>log you out</strong> and redirect to login.</span>
                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handleProfileSave}
                                    disabled={savingProfile}
                                >
                                    {savingProfile
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                                        : <><i className="bi bi-check-lg me-1" />Save Profile</>
                                    }
                                </button>
                            </div>
                        )}

                        {/* ════ THEME TAB ════ */}
                        {tab === 'theme' && (
                            <div>
                                <div style={{
                                    fontSize: '.78rem', color: 'var(--text-muted)',
                                    marginBottom: '1rem', lineHeight: 1.5,
                                }}>
                                    Choose a color theme for your dashboard. Changes apply instantly.
                                </div>

                                <Msg msg={themeMsg} />

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 10, marginBottom: '1.5rem',
                                }}>
                                    {THEMES.map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => handleThemeSelect(t)}
                                            style={{
                                                border: activeTheme === t.key
                                                    ? '2.5px solid var(--accent)'
                                                    : '2px solid rgba(238,105,131,.15)',
                                                borderRadius: 14,
                                                padding: '12px 8px',
                                                background: activeTheme === t.key
                                                    ? 'rgba(238,105,131,.06)'
                                                    : '#fff',
                                                cursor: 'pointer',
                                                transition: 'all .2s',
                                                position: 'relative',
                                            }}
                                        >
                                            {/* Active checkmark */}
                                            {activeTheme === t.key && (
                                                <div style={{
                                                    position: 'absolute', top: 6, right: 6,
                                                    width: 16, height: 16, borderRadius: '50%',
                                                    background: 'var(--accent)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '.55rem',
                                                }}>
                                                    <i className="bi bi-check" />
                                                </div>
                                            )}

                                            {/* Color dots */}
                                            <div style={{
                                                display: 'flex', gap: 4,
                                                justifyContent: 'center', marginBottom: 6,
                                            }}>
                                                {[t.dark, t.acc, t.sec, t.bg].map((c, i) => (
                                                    <div key={i} style={{
                                                        width: 14, height: 14, borderRadius: '50%',
                                                        background: c,
                                                        border: '1.5px solid rgba(0,0,0,.08)',
                                                    }} />
                                                ))}
                                            </div>

                                            {/* Preview bar */}
                                            <div style={{
                                                height: 6, borderRadius: 6,
                                                background: `linear-gradient(to right, ${t.dark}, ${t.acc})`,
                                                marginBottom: 6,
                                            }} />

                                            <div style={{
                                                fontSize: '.72rem', fontWeight: 600,
                                                color: activeTheme === t.key ? 'var(--accent-dark)' : 'var(--text-muted)',
                                            }}>
                                                {t.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Current theme info */}
                                <div style={{
                                    background: 'rgba(252,245,238,.6)',
                                    border: '1.5px solid rgba(238,105,131,.12)',
                                    borderRadius: 10, padding: '10px 14px',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: `linear-gradient(135deg, var(--accent), var(--accent-dark))`,
                                        flexShrink: 0,
                                    }} />
                                    <div>
                                        <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--accent-dark)' }}>
                                            Active: {THEMES.find(t => t.key === activeTheme)?.label || 'Rose'}
                                        </div>
                                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                                            Theme is saved to your browser
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ════ SETTINGS TAB ════ */}
                        {tab === 'settings' && (
                            <div>
                                <Msg msg={settingsMsg} />

                                <div style={{
                                    fontSize: '.72rem', fontWeight: 700,
                                    color: 'var(--text-muted)', textTransform: 'uppercase',
                                    letterSpacing: '1px', marginBottom: 12,
                                }}>
                                    Preferences
                                </div>

                                {[
                                    {
                                        key: 'notif', icon: 'bi-bell-fill',
                                        label: 'Email Notifications',
                                        desc: 'Alerts for workflow executions',
                                        value: notifEmail, onChange: setNotifEmail,
                                    },
                                    {
                                        key: 'compact', icon: 'bi-layout-text-sidebar-reverse',
                                        label: 'Compact Mode',
                                        desc: 'Denser information display',
                                        value: compactMode, onChange: setCompactMode,
                                    },
                                ].map(item => (
                                    <div key={item.key} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 14px', marginBottom: 8,
                                        background: 'rgba(252,245,238,.5)',
                                        border: `1.5px solid ${item.value ? 'rgba(238,105,131,.25)' : 'rgba(238,105,131,.1)'}`,
                                        borderRadius: 12,
                                        transition: 'border .2s',
                                    }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: item.value ? 'rgba(238,105,131,.15)' : 'rgba(238,105,131,.07)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: item.value ? 'var(--accent)' : 'var(--text-muted)',
                                            fontSize: '1rem', flexShrink: 0, transition: 'all .2s',
                                        }}>
                                            <i className={`bi ${item.icon}`} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                                                {item.desc}
                                            </div>
                                        </div>
                                        {/* Toggle */}
                                        <div
                                            onClick={() => item.onChange(v => !v)}
                                            style={{
                                                width: 46, height: 26, borderRadius: 13,
                                                background: item.value ? 'var(--accent)' : 'rgba(156,163,175,.3)',
                                                position: 'relative', cursor: 'pointer',
                                                transition: 'background .25s', flexShrink: 0,
                                            }}
                                        >
                                            <div style={{
                                                width: 20, height: 20, borderRadius: '50%',
                                                background: '#fff', position: 'absolute', top: 3,
                                                left: item.value ? 23 : 3,
                                                transition: 'left .25s',
                                                boxShadow: '0 1px 4px rgba(0,0,0,.2)',
                                            }} />
                                        </div>
                                    </div>
                                ))}

                                {/* Account info box */}
                                <div style={{
                                    marginTop: 16, padding: '12px 14px',
                                    background: 'rgba(133,14,53,.03)',
                                    border: '1.5px solid rgba(133,14,53,.08)',
                                    borderRadius: 12,
                                }}>
                                    <div style={{
                                        fontSize: '.68rem', fontWeight: 700,
                                        color: 'var(--accent-dark)', textTransform: 'uppercase',
                                        letterSpacing: '1px', marginBottom: 8,
                                    }}>
                                        Account Info
                                    </div>
                                    {[
                                        { label: 'Name', value: user?.name },
                                        { label: 'Email', value: user?.email },
                                        { label: 'Status', value: '● Active' },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            fontSize: '.82rem', padding: '5px 0',
                                            borderBottom: '1px solid rgba(238,105,131,.07)',
                                        }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                            <span style={{
                                                fontWeight: 600,
                                                color: label === 'Status' ? '#15803d' : 'var(--text-dark)',
                                            }}>
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button className="btn btn-primary w-100 mt-3" onClick={handleSettingsSave}>
                                    <i className="bi bi-check-lg me-1" />Save Settings
                                </button>
                            </div>
                        )}

                        {/* ════ SECURITY / PASSWORD TAB ════ */}
                        {tab === 'password' && (
                            <div>
                                <Msg msg={passwordMsg} />

                                {/* Security notice */}
                                <div className="security-notice mb-2">
                                    <i className="bi bi-shield-check-fill notice-icon"></i>
                                    <span>
                                        After changing your password you will be
                                        <strong> logged out automatically</strong>.
                                    </span>
                                </div>

                                {/* Current Password */}
                                <div className="mb-3">
                                    <label className="form-label-custom">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control-custom w-100"
                                        value={curPwd}
                                        onChange={(e) => setCurPwd(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                </div>

                                {/* New Password */}
                                <div className="mb-3">
                                    <label className="form-label-custom">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control-custom w-100"
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        placeholder="Min 6 characters"
                                    />
                                </div>

                                {/* Strength bar */}
                                {newPwd && (
                                    <div className="password-strength">
                                        <div
                                            className={`strength-bar ${newPwd.length < 6
                                                    ? "weak"
                                                    : newPwd.length < 10
                                                        ? "medium"
                                                        : "strong"
                                                }`}
                                        />

                                        <span
                                            className={`strength-text ${newPwd.length < 6
                                                    ? "weak"
                                                    : newPwd.length < 10
                                                        ? "medium"
                                                        : "strong"
                                                }`}
                                        >
                                            {newPwd.length < 6
                                                ? "⚠ Weak"
                                                : newPwd.length < 10
                                                    ? "~ Medium"
                                                    : "✓ Strong"}
                                        </span>
                                    </div>
                                )}

                                {/* Confirm Password */}
                                <div className="mb-3">
                                    <label className="form-label-custom">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control-custom w-100"
                                        value={confPwd}
                                        onChange={(e) => setConfPwd(e.target.value)}
                                        placeholder="Repeat new password"
                                    />
                                </div>

                                {/* Match indicator */}
                                {confPwd && (
                                    <div
                                        className={`password-match ${confPwd === newPwd ? "match" : "no-match"
                                            }`}
                                    >
                                        <i
                                            className={`bi bi-${confPwd === newPwd ? "check" : "x"
                                                }-circle me-1`}
                                        />
                                        {confPwd === newPwd
                                            ? "Passwords match"
                                            : "Passwords do not match"}
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handlePasswordSave}
                                    disabled={savingPassword}
                                >
                                    {savingPassword ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Changing…
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-shield-check me-1" />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}