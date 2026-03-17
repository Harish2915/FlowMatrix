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
]

function applyTheme(theme) {
    const r = document.documentElement
    r.style.setProperty('--bg-main', theme.bg)
    r.style.setProperty('--bg-secondary', theme.sec)
    r.style.setProperty('--accent', theme.acc)
    r.style.setProperty('--accent-dark', theme.dark)
    r.style.setProperty('--accent-hover', theme.dark)
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
        localStorage.getItem('wf_theme') || 'rose'
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
            <div style={{ position: 'relative' }}>
                <input
                    className="form-control-custom w-100"
                    style={{ paddingLeft: 38, paddingRight: 40 }}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                <i className="bi bi-lock" style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--accent)', pointerEvents: 'none',
                }} />
                <button type="button" onClick={onToggle} style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', padding: 4,
                }}>
                    <i className={`bi bi-eye${show ? '-slash' : ''}`} />
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
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="form-control-custom w-100"
                                            style={{ paddingLeft: 38 }}
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Your full name"
                                        />
                                        <i className="bi bi-person" style={{
                                            position: 'absolute', left: 12, top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--accent)', pointerEvents: 'none',
                                        }} />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="mb-4">
                                    <label className="form-label-custom">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="form-control-custom w-100"
                                            style={{ paddingLeft: 38 }}
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                        />
                                        <i className="bi bi-envelope" style={{
                                            position: 'absolute', left: 12, top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--accent)', pointerEvents: 'none',
                                        }} />
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
                                <div style={{
                                    background: 'rgba(59,130,246,.06)',
                                    border: '1px solid rgba(59,130,246,.18)',
                                    borderRadius: 10, padding: '10px 14px',
                                    fontSize: '.78rem', color: '#1d4ed8',
                                    display: 'flex', gap: 8, alignItems: 'flex-start',
                                    marginBottom: '1.25rem',
                                }}>
                                    <i className="bi bi-shield-check-fill mt-1" style={{ flexShrink: 0 }} />
                                    <span>After changing your password you will be <strong>logged out automatically</strong>.</span>
                                </div>

                                <PwdField
                                    label="Current Password"
                                    value={curPwd}
                                    onChange={setCurPwd}
                                    show={showCur}
                                    onToggle={() => setShowCur(s => !s)}
                                    placeholder="Enter current password"
                                />

                                <PwdField
                                    label="New Password"
                                    value={newPwd}
                                    onChange={setNewPwd}
                                    show={showNew}
                                    onToggle={() => setShowNew(s => !s)}
                                    placeholder="Min 6 characters"
                                />

                                {/* Strength bar */}
                                {newPwd && (
                                    <div style={{ marginTop: -8, marginBottom: 12 }}>
                                        <div style={{
                                            height: 4, borderRadius: 4, transition: 'all .3s',
                                            background: newPwd.length < 6 ? '#ef4444'
                                                : newPwd.length < 10 ? '#f59e0b' : '#22c55e',
                                            width: newPwd.length < 6 ? '30%'
                                                : newPwd.length < 10 ? '65%' : '100%',
                                        }} />
                                        <span style={{
                                            fontSize: '.7rem',
                                            color: newPwd.length < 6 ? '#b91c1c'
                                                : newPwd.length < 10 ? '#92400e' : '#15803d',
                                        }}>
                                            {newPwd.length < 6 ? '⚠ Weak' : newPwd.length < 10 ? '~ Medium' : '✓ Strong'}
                                        </span>
                                    </div>
                                )}

                                <PwdField
                                    label="Confirm New Password"
                                    value={confPwd}
                                    onChange={setConfPwd}
                                    show={showConf}
                                    onToggle={() => setShowConf(s => !s)}
                                    placeholder="Repeat new password"
                                />

                                {/* Match indicator */}
                                {confPwd && (
                                    <div style={{
                                        fontSize: '.72rem', marginTop: -8, marginBottom: 12,
                                        color: confPwd === newPwd ? '#15803d' : '#b91c1c',
                                    }}>
                                        <i className={`bi bi-${confPwd === newPwd ? 'check' : 'x'}-circle me-1`} />
                                        {confPwd === newPwd ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handlePasswordSave}
                                    disabled={savingPassword}
                                >
                                    {savingPassword
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Changing…</>
                                        : <><i className="bi bi-shield-check me-1" />Change Password</>
                                    }
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}