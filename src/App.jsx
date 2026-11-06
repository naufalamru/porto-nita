import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight, Github, Linkedin, Mail, MapPin, Menu, X, LockKeyhole,
  LogOut, Plus, Pencil, Trash2, ExternalLink, UserRound, BriefcaseBusiness,
  GraduationCap, Code2, Award, FolderKanban, Save, Eye, EyeOff
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './supabase'

const CATEGORIES = [
  { key: 'project', label: 'Projects', icon: FolderKanban },
  { key: 'experience', label: 'Experience', icon: BriefcaseBusiness },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'skill', label: 'Skills', icon: Code2 },
  { key: 'certificate', label: 'Certificates', icon: Award },
]
const EMPTY_PROFILE = {
  full_name: '', headline: '', about: '', location: '', email: '', phone: '',
  linkedin: '', github: '', photo_url: ''
}
const EMPTY_ITEM = {
  category: 'project', title: '', subtitle: '', description: '',
  date_label: '', url: '', image_url: '', sort_order: 0
}

function App() {
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminOpen, setAdminOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  async function loadData() {
    if (!isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)
    const [p, i] = await Promise.all([
      supabase.from('portfolio_profile').select('*').eq('id', 1).maybeSingle(),
      supabase.from('portfolio_items').select('*').order('sort_order').order('created_at', { ascending: false })
    ])
    if (p.error || i.error) setError(p.error?.message || i.error?.message)
    if (p.data) setProfile({ ...EMPTY_PROFILE, ...p.data })
    if (i.data) setItems(i.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  const grouped = useMemo(() => Object.fromEntries(
    CATEGORIES.map(c => [c.key, items.filter(i => i.category === c.key)])
  ), [items])

  if (adminOpen) {
    return <AdminPanel
      profile={profile} setProfile={setProfile} items={items} setItems={setItems}
      session={session} setSession={setSession} onClose={() => setAdminOpen(false)}
      reload={loadData}
    />
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#home">{profile.full_name || 'PORTFOLIO'}<span>.</span></a>
        <button className="mobile-toggle icon-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
          {mobileMenu ? <X /> : <Menu />}
        </button>
        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          <a href="#projects" onClick={() => setMobileMenu(false)}>Projects</a>
          <a href="#experience" onClick={() => setMobileMenu(false)}>Experience</a>
          <a href="#contact" onClick={() => setMobileMenu(false)}>Contact</a>
          <button className="admin-link" onClick={() => setAdminOpen(true)}><LockKeyhole size={15}/> </button>
        </nav>
      </header>

      {!isSupabaseConfigured && <div className="setup-notice">Website belum terhubung ke Supabase. Ikuti README untuk mengaktifkan database dan CRUD.</div>}
      {error && <div className="setup-notice error-notice">Gagal memuat data: {error}</div>}

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot"/> PERSONAL PORTFOLIO</p>
            <h1>{profile.full_name || 'Your Name'}<br/><span>{profile.headline || 'Your professional headline goes here.'}</span></h1>
            <p className="hero-description">{profile.about || 'A short introduction about yourself will appear here. Add your profile information through the Admin page.'}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">Explore my work <ArrowUpRight size={17}/></a>
              <a className="button button-secondary" href="#contact">Get in touch</a>
            </div>
            <div className="hero-meta">
              {profile.location && <span><MapPin size={15}/>{profile.location}</span>}
              {profile.email && <a href={`mailto:${profile.email}`}><Mail size={15}/>{profile.email}</a>}
            </div>
            <div className="social-links">
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17}/> LinkedIn <ArrowUpRight size={14}/></a>}
                {profile.github && <a href={profile.github} target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={14}/></a>}
              </div>
          </div>
          <div className="hero-visual">
            {profile.photo_url
              ? <img className="profile-photo" src={profile.photo_url} alt={profile.full_name || 'Profile'} />
              : <div className="photo-placeholder"><UserRound size={76}/><span>YOUR PHOTO</span></div>}
            <div className="visual-caption"><span>01 / ABOUT ME</span><span>OPEN TO OPPORTUNITIES</span></div>
          </div>
          <div className="hero-index"></div>
        </section>

        <section className="content-section section-wrap" id="projects">
          <SectionHeading number="02" title="Selected projects" note="WHAT I'VE BUILT"/>
          <ItemGrid items={grouped.project} empty="Your projects will appear here after you add them from Admin." />
        </section>

        <section className="content-section section-wrap" id="experience">
          <SectionHeading number="03" title="Experience & education" note="MY JOURNEY"/>
          <div className="timeline-grid">
            <div><h3 className="subsection-title">Experience</h3><Timeline items={grouped.experience}/></div>
            <div><h3 className="subsection-title">Education</h3><Timeline items={grouped.education}/></div>
          </div>
        </section>

        <section className="content-section section-wrap" id="skills">
          <SectionHeading number="04" title="Tools & skills" note="WHAT I WORK WITH"/>
          {grouped.skill.length ? <div className="skill-list">{grouped.skill.map(x => <span className="skill-chip" key={x.id}>{x.title}</span>)}</div> : <p className="empty-state">Add your skills through the Admin page.</p>}
          {grouped.certificate.length > 0 && <>
            <h3 className="subsection-title certificate-heading">Certificates</h3>
            <div className="certificate-list">{grouped.certificate.map(x => <a className="certificate-row" key={x.id} href={x.url || undefined} target="_blank" rel="noreferrer"><div><strong>{x.title}</strong><span>{x.subtitle} {x.date_label && `· ${x.date_label}`}</span></div>{x.url && <ExternalLink size={17}/>}</a>)}</div>
          </>}
        </section>

        <section className="contact-section section-wrap" id="contact">
          <p className="eyebrow">05 / CONTACT</p>
          <h2>Have a project<br/>in mind<span>?</span></h2>
          <p className="muted">Let's connect and create something meaningful.</p>
          
{profile.phone ? (
  <a
    className="button button-primary"
    href={`https://wa.me/${profile.phone.replace(/\D/g, '').replace(/^0/, '62')}`}
    target="_blank"
    rel="noreferrer"
  >
    Chat on WhatsApp <ArrowUpRight size={17}/>
  </a>
) : (
  <p className="empty-state">
    Add your WhatsApp number in Admin to activate this contact button.
  </p>
)}

        </section>
      </main>
      <footer className="footer section-wrap"><span>© {new Date().getFullYear()} {profile.full_name || 'Your Name'}. All rights reserved.</span><button onClick={() => setAdminOpen(true)}><LockKeyhole size={13}/> Admin access</button><a href="#home">Back to top ↑</a></footer>
      {loading && <div className="loading-indicator">Loading portfolio…</div>}
    </div>
  )
}

function SectionHeading({ number, title, note }) {
  return <div className="section-heading"><span className="section-number">{number}</span><h2>{title}</h2><span className="section-note">{note}</span></div>
}
function ItemGrid({ items, empty }) {
  if (!items.length) return <p className="empty-state">{empty}</p>
  return <div className="project-grid">{items.map((item, index) => <article className="project-card" key={item.id}>
    <div className="project-image">{item.image_url ? <img src={item.image_url} alt={item.title}/> : <span>0{index + 1}</span>}</div>
    <div className="project-info"><div className="project-kicker">{item.subtitle || 'PROJECT'} <span>{item.date_label}</span></div><h3>{item.title}</h3><p>{item.description}</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer">View project <ArrowUpRight size={15}/></a>}</div>
  </article>)}</div>
}
function Timeline({ items }) {
  if (!items.length) return <p className="empty-state">No information added yet.</p>
  return <div className="timeline">{items.map(item => <article className="timeline-item" key={item.id}><span className="timeline-date">{item.date_label}</span><h4>{item.title}</h4>{item.subtitle && <p className="timeline-subtitle">{item.subtitle}</p>}{item.description && <p className="muted">{item.description}</p>}</article>)}</div>
}

function AdminPanel({ profile, setProfile, items, setItems, session, setSession, onClose, reload }) {
  const [tab, setTab] = useState('profile')
  const [category, setCategory] = useState('project')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [profileForm, setProfileForm] = useState(profile)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingItemImage, setUploadingItemImage] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function login(e) {
    e.preventDefault(); setBusy(true); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false); if (error) setMessage(error.message)
  }
  async function saveProfile(e) {
    e.preventDefault(); setBusy(true); setMessage('')
    const { error } = await supabase.from('portfolio_profile').update({ ...profileForm, updated_at: new Date().toISOString() }).eq('id', 1)
    setBusy(false)
    if (error) setMessage(error.message)
    else { setProfile(profileForm); setMessage('Profile berhasil disimpan.') }
  }
  
async function uploadProfilePhoto(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // Validasi format gambar
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    setMessage('Format foto harus JPG, PNG, atau WebP.')
    e.target.value = ''
    return
  }

  // Maksimal 5 MB
  if (file.size > 5 * 1024 * 1024) {
    setMessage('Ukuran foto maksimal 5 MB.')
    e.target.value = ''
    return
  }

  setUploadingPhoto(true)
  setMessage('Mengunggah foto...')

  try {
    const extension = file.name.split('.').pop().toLowerCase()
    const filePath = `profile/${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(filePath)

    setProfileForm(prev => ({
      ...prev,
      photo_url: data.publicUrl
    }))

    setMessage('Foto berhasil diunggah. Klik Save profile untuk menyimpan perubahan.')
  } catch (error) {
    setMessage(`Gagal mengunggah foto: ${error.message}`)
  } finally {
    setUploadingPhoto(false)
    e.target.value = ''
  }
}


  async function uploadItemImage(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage('Format gambar harus JPG, PNG, atau WebP.')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Ukuran gambar maksimal 5 MB.')
      e.target.value = ''
      return
    }

    setUploadingItemImage(true)
    setMessage('Mengunggah gambar project...')
    try {
      const extension = file.name.split('.').pop().toLowerCase()
      const filePath = `projects/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })
      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath)

      setForm(prev => ({ ...prev, image_url: data.publicUrl }))
      setMessage('Gambar berhasil diunggah. Klik Save item untuk menyimpan project.')
    } catch (error) {
      setMessage(`Gagal mengunggah gambar: ${error.message}`)
    } finally {
      setUploadingItemImage(false)
      e.target.value = ''
    }
  }

  function startNew(cat = category) {
    setCategory(cat); setEditing(null); setFormOpen(true); setForm({ ...EMPTY_ITEM, category: cat })
  }
  function startEdit(item) { setEditing(item.id); setFormOpen(true); setCategory(item.category); setForm({ ...item }) }
  async function saveItem(e) {
    e.preventDefault(); setBusy(true); setMessage('')
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
    const result = editing
      ? await supabase.from('portfolio_items').update(payload).eq('id', editing)
      : await supabase.from('portfolio_items').insert(payload)
    setBusy(false)
    if (result.error) setMessage(result.error.message)
    else { setMessage('Data berhasil disimpan.'); setEditing(null); setFormOpen(false); setForm({ ...EMPTY_ITEM, category }); await reload(); }
  }
  async function deleteItem(id) {
    if (!confirm('Hapus informasi ini? Tindakan ini tidak bisa dibatalkan.')) return
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
    if (error) setMessage(error.message)
    else { setMessage('Data berhasil dihapus.'); await reload() }
  }
  async function logout() { await supabase.auth.signOut(); setSession(null) }

  if (!isSupabaseConfigured) return <div className="admin-screen"><div className="admin-card"><button className="close-admin" onClick={onClose}><X/></button><LockKeyhole size={28}/><h2>Admin setup required</h2><p>Tambahkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> ke file <code>.env</code>. Panduan lengkap tersedia di README.</p></div></div>
  if (!session) return <div className="admin-screen"><form className="admin-card login-card" onSubmit={login}><button type="button" className="close-admin" onClick={onClose}><X/></button><div className="admin-icon"><LockKeyhole/></div><p className="eyebrow">PRIVATE AREA</p><h2>Admin login</h2><p className="muted">Masuk untuk mengelola konten portofolio.</p><label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@email.com"/></label><label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></label>{message && <p className="form-message">{message}</p>}<button className="button button-primary full-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={16}/></button></form></div>

  return <div className="admin-screen"><div className="admin-layout">
    <aside className="admin-sidebar"><div className="admin-brand">PORTFOLIO<span>.</span><small>CONTENT MANAGER</small></div><nav>{[{key:'profile',label:'Profile',icon:UserRound},...CATEGORIES.map(c => ({key:c.key,label:c.label,icon:c.icon}))].map(t => <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => {setTab(t.key);setMessage('')}}><t.icon size={17}/>{t.label}</button>)}</nav><button className="sidebar-back" onClick={onClose}>← View website</button><button className="sidebar-logout" onClick={logout}><LogOut size={16}/> Sign out</button></aside>
    <section className="admin-main"><div className="admin-top"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>{tab === 'profile' ? 'Profile settings' : `${CATEGORIES.find(c => c.key === tab)?.label} manager`}</h1></div><button className="close-admin desktop-close" onClick={onClose}><X/></button></div>
      {message && <div className="admin-message">{message}</div>}
      {tab === 'profile' ? <form className="editor-form" onSubmit={saveProfile}><p className="form-intro">Informasi utama yang ditampilkan pada halaman portofolio.</p><div className="form-grid">
        <Field label="Full name" value={profileForm.full_name} onChange={v => setProfileForm({...profileForm,full_name:v})}/>
        <Field label="Professional headline" value={profileForm.headline} onChange={v => setProfileForm({...profileForm,headline:v})} placeholder="e.g. System Analyst & Web Developer"/>
        <Field label="Location" value={profileForm.location} onChange={v => setProfileForm({...profileForm,location:v})}/>
        <Field label="Email" type="email" value={profileForm.email} onChange={v => setProfileForm({...profileForm,email:v})}/>
        <Field label="Phone" value={profileForm.phone} onChange={v => setProfileForm({...profileForm,phone:v})}/>
        <div className="field full-field">
          <label>Profile Photo</label>
          {profileForm.photo_url && (
            <div style={{ marginBottom: '12px' }}>
              <img
                src={profileForm.photo_url}
                alt="Profile preview"
                style={{
                  width: '130px',
                  height: '130px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '1px solid #444'
                }}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadProfilePhoto}
            disabled={uploadingPhoto || busy}
          />
          <small>
            {uploadingPhoto
              ? 'Uploading photo...'
              : 'JPG, PNG, atau WebP. Maksimal 5 MB.'}
          </small>
          {profileForm.photo_url && (
            <button
              type="button"
              className="text-button"
              onClick={() => setProfileForm(prev => ({ ...prev, photo_url: '' }))}
            >
              Remove selected photo
            </button>
          )}
        </div>
        <Field label="LinkedIn URL" value={profileForm.linkedin} onChange={v => setProfileForm({...profileForm,linkedin:v})}/>
        <Field label="GitHub URL" value={profileForm.github} onChange={v => setProfileForm({...profileForm,github:v})}/>
        <div className="field full-field"><label>About me</label><textarea rows="6" value={profileForm.about} onChange={e => setProfileForm({...profileForm,about:e.target.value})} placeholder="Ceritakan tentang diri, keahlian, dan tujuan profesionalmu…"/></div>
      </div><button className="button button-primary" disabled={busy || uploadingPhoto}><Save size={16}/> {busy ? 'Saving…' : 'Save profile'}</button></form>
      : <div className="items-manager"><div className="manager-toolbar"><p className="form-intro">Tambah, edit, atau hapus informasi {CATEGORIES.find(c => c.key === tab)?.label.toLowerCase()}.</p><button className="button button-primary" onClick={() => startNew(tab)}><Plus size={16}/> Add new</button></div>
        {formOpen ? <form className="editor-form item-editor" onSubmit={saveItem}><div className="editor-title"><h3>{editing ? 'Edit item' : 'New item'}</h3><button type="button" className="text-button" onClick={() => {setEditing(null);setFormOpen(false);setForm(EMPTY_ITEM)}}>Cancel</button></div><div className="form-grid">
          <div className="field"><label>Category</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>{CATEGORIES.map(c => <option value={c.key} key={c.key}>{c.label}</option>)}</select></div>
          <Field label="Title" value={form.title} onChange={v => setForm({...form,title:v})} required/>
          <Field label="Subtitle / organization" value={form.subtitle} onChange={v => setForm({...form,subtitle:v})}/>
          <Field label="Date / period" value={form.date_label} onChange={v => setForm({...form,date_label:v})} placeholder="2024 – 2025"/>
          <Field label="Website / credential URL" value={form.url} onChange={v => setForm({...form,url:v})}/>
          <div className="field full-field">
            <label>Project image (optional)</label>
            {form.image_url && (
              <div style={{ marginBottom: '12px' }}>
                <img
                  src={form.image_url}
                  alt="Project preview"
                  style={{
                    display: 'block',
                    width: 'min(100%, 320px)',
                    maxHeight: '190px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid #444'
                  }}
                />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadItemImage}
              disabled={uploadingItemImage || busy}
            />
            <small>
              {uploadingItemImage
                ? 'Uploading image...'
                : 'Upload JPG, PNG, atau WebP. Maksimal 5 MB.'}
            </small>
            {form.image_url && (
              <button
                type="button"
                className="text-button"
                onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
              >
                Remove selected image
              </button>
            )}
          </div>
          <Field label="Display order" type="number" value={String(form.sort_order ?? 0)} onChange={v => setForm({...form,sort_order:v})}/>
          <div className="field full-field"><label>Description</label><textarea rows="4" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Deskripsi singkat…"/></div>
        </div><button className="button button-primary" disabled={busy || uploadingItemImage}><Save size={16}/>{busy ? 'Saving…' : 'Save item'}</button></form> : null}
        <div className="managed-list">{items.filter(i => i.category === tab).map(item => <article className="managed-item" key={item.id}><div className="managed-thumb">{item.image_url ? <img src={item.image_url} alt=""/> : <FolderKanban/>}</div><div className="managed-copy"><strong>{item.title}</strong><span>{item.subtitle} {item.date_label && `· ${item.date_label}`}</span></div><button className="icon-button" title="Edit" onClick={() => startEdit(item)}><Pencil size={16}/></button><button className="icon-button danger" title="Delete" onClick={() => deleteItem(item.id)}><Trash2 size={16}/></button></article>)}{!items.some(i => i.category === tab) && <p className="empty-state">Belum ada data. Klik “Add new” untuk mulai.</p>}</div>
      </div>}
    </section>
  </div></div>
}
function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return <div className="field"><label>{label}</label><input type={type} value={value ?? ''} required={required} placeholder={placeholder} onChange={e => onChange(e.target.value)}/></div>
}

export default App