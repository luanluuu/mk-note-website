import { useEffect, useRef, useState } from 'react'
import './App.css'

const REPO = 'luanluuu/mk-note'
const RELEASES = `https://github.com/${REPO}/releases`

// 请替换为实际上传到 GitHub Release 的资产文件名。
// 如果文件名固定（不带版本号），/releases/latest/download/{文件名} 会永远指向最新版本。
const RELEASE_ASSETS = {
  mac: 'Markdown-Notes.dmg', // TODO: 替换为实际文件名
  win: 'Markdown-Notes.exe', // TODO: 替换为实际文件名
}

function latestAssetUrl(asset: string) {
  return `https://github.com/${REPO}/releases/latest/download/${encodeURIComponent(asset)}`
}

type Theme = 'light' | 'dark'

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('mk-site-theme') as Theme) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mk-site-theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return { theme, toggle }
}

function useScrollY() {
  const [scrollY, setScrollY] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const max = document.documentElement.scrollHeight - window.innerHeight
        setScrollY(y)
        setProgress(max > 0 ? y / max : 0)
        raf = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return { scrollY, progress }
}

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else {
            // 离开视口时移除类，再次进入时重新触发动画
            entry.target.classList.remove('is-visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function ScrollProgress({ progress }: { progress: number }) {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      <span className="theme-toggle__track">
        <span className={`theme-toggle__thumb ${theme}`} />
      </span>
      <span className="theme-toggle__label">{theme === 'light' ? '☀️' : '🌙'}</span>
    </button>
  )
}

function DownloadButton({
  label,
  href,
  variant = 'primary',
}: {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}) {
  return (
    <a className={`download-btn download-btn--${variant}`} href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: string
  title: string
  desc: string
  accent: 'red' | 'blue' | 'yellow'
}) {
  return (
    <article className={`feature-card feature-card--${accent} reveal`}>
      <div className="feature-card__icon">{icon}</div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{desc}</p>
    </article>
  )
}

const EDITOR_LINES = [
  { type: 'h1' as const, text: '项目规划' },
  { type: 'p' as const, text: '本周重点完成官网设计和 Windows 安装包优化。' },
  { type: 'li' as const, text: '统一 Mondrian 视觉语言' },
  { type: 'li' as const, text: '添加交互式功能展示' },
  { type: 'li' as const, text: '修复 onnxruntime DLL 打包问题' },
]

const TYPE_SPEED = 45
const LINE_PAUSE = 600

function TypewriterEditor({ started }: { started: boolean }) {
  const [currentLine, setCurrentLine] = useState(0)
  const [display, setDisplay] = useState<string[]>(() => EDITOR_LINES.map(() => ''))
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!started) return
    if (currentLine >= EDITOR_LINES.length) {
      setDone(true)
      return
    }
    const text = EDITOR_LINES[currentLine].text
    let i = 0
    const timer = window.setInterval(() => {
      setDisplay((prev) => {
        const next = [...prev]
        next[currentLine] = text.slice(0, i)
        return next
      })
      i++
      if (i > text.length) {
        window.clearInterval(timer)
        window.setTimeout(() => setCurrentLine((c) => c + 1), LINE_PAUSE)
      }
    }, TYPE_SPEED)
    return () => window.clearInterval(timer)
  }, [started, currentLine])

  const cursorIndex = done ? EDITOR_LINES.length - 1 : currentLine

  return (
    <div className="mock-editor__content">
      <h1>
        {display[0]}
        {cursorIndex === 0 && <span className="mock-editor__cursor" />}
      </h1>
      <p>
        {display[1]}
        {cursorIndex === 1 && <span className="mock-editor__cursor" />}
      </p>
      <ul>
        <li>
          {display[2]}
          {cursorIndex === 2 && <span className="mock-editor__cursor" />}
        </li>
        <li>
          {display[3]}
          {cursorIndex === 3 && <span className="mock-editor__cursor" />}
        </li>
        <li>
          {display[4]}
          {cursorIndex === 4 && <span className="mock-editor__cursor" />}
        </li>
      </ul>
    </div>
  )
}

function MockWindow({ scrollY }: { scrollY: number }) {
  const offset = scrollY * 0.06
  const editorRef = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="mock-window reveal"
      style={{ transform: `translateY(${offset}px)` }}
    >
      <div className="mock-window__bar">
        <span className="mock-window__dot" />
        <span className="mock-window__dot" />
        <span className="mock-window__dot" />
        <span className="mock-window__title">Markdown Notes</span>
      </div>
      <div className="mock-window__body">
        <aside className="mock-sidebar">
          <div className="mock-sidebar__header">
            <span className="mock-sidebar__mark" />
            <span className="mock-sidebar__brand">Markdown Notes</span>
          </div>
          <div className="mock-sidebar__btn">+ 新建笔记</div>
          <ul className="mock-sidebar__list">
            <li className="mock-sidebar__item active">
              <span className="mock-sidebar__dot" />
              项目规划.md
            </li>
            <li className="mock-sidebar__item">
              <span className="mock-sidebar__dot" />
              会议纪要.md
            </li>
            <li className="mock-sidebar__item">
              <span className="mock-sidebar__dot" />
              学习笔记.md
            </li>
          </ul>
        </aside>
        <main className="mock-editor" ref={editorRef}>
          <div className="mock-editor__toolbar">
            <span>润色</span>
            <span>续写</span>
            <span>摘要</span>
          </div>
          <TypewriterEditor started={started} />
        </main>
      </div>
    </div>
  )
}

function App() {
  const { theme, toggle } = useTheme()
  const { scrollY, progress } = useScrollY()
  const [os, setOs] = useState<'mac' | 'win' | 'other'>('other')
  useScrollReveal()

  useEffect(() => {
    const platform = navigator.platform.toLowerCase()
    if (platform.includes('mac') || platform.includes('darwin')) setOs('mac')
    else if (platform.includes('win')) setOs('win')
  }, [])

  return (
    <div className="site">
      <ScrollProgress progress={progress} />

      <nav className="topbar">
        <a className="topbar__brand" href="#">
          <span className="topbar__mark" />
          <span>Markdown Notes</span>
        </a>
        <div className="topbar__links">
          <a href="#features">功能</a>
          <a href="#preview">预览</a>
          <a href="#download">下载</a>
          <a href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer">GitHub</a>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </nav>

      <header className="hero">
        <div className="hero__grid" aria-hidden="true">
          <div
            className="hero__block hero__block--red"
            style={{ transform: `translateY(${scrollY * 0.18}px)` }}
          />
          <div
            className="hero__block hero__block--blue"
            style={{ transform: `translateY(${scrollY * -0.12}px)` }}
          />
          <div
            className="hero__block hero__block--yellow"
            style={{ transform: `translateY(${scrollY * 0.28}px)` }}
          />
          <div
            className="hero__block hero__block--black"
            style={{ transform: `translateY(${scrollY * -0.22}px)` }}
          />
        </div>

        <div
          className="hero__content reveal"
          style={{ transform: `translateY(${scrollY * -0.06}px)` }}
        >
          <h1 className="hero__title">
            把思绪写成
            <br />
            <span className="hero__title--accent">结构清晰的笔记</span>
          </h1>
          <p className="hero__lead">
            本地优先的 Markdown 笔记应用。支持 AI 辅助写作、语义搜索与多主题切换，所有数据保存在你的电脑上。
          </p>
          <div className="hero__actions">
            <DownloadButton
              label={os === 'mac' ? '下载 macOS 版' : '下载 Windows 版'}
              href={latestAssetUrl(os === 'mac' ? RELEASE_ASSETS.mac : RELEASE_ASSETS.win)}
            />
            <DownloadButton label="历史版本" href={RELEASES} variant="secondary" />
          </div>
        </div>
      </header>

      <section id="features" className="section section--features">
        <div className="section__head reveal">
          <span className="section__kicker">核心功能</span>
          <h2 className="section__title">为写作和思考设计</h2>
        </div>
        <div className="features-grid">
          <FeatureCard
            icon="📝"
            title="Markdown 编辑"
            desc="基于 Milkdown 的所见即所得编辑器，实时预览、快捷键友好，专注内容本身。"
            accent="blue"
          />
          <FeatureCard
            icon="🤖"
            title="AI 辅助写作"
            desc="连接本地 Ollama 或 OpenAI 兼容 API，实现润色、续写、摘要和项目级分析。"
            accent="red"
          />
          <FeatureCard
            icon="🔍"
            title="语义搜索"
            desc="基于 Transformers.js 的本地嵌入模型，无需联网即可按语义检索笔记。"
            accent="yellow"
          />
          <FeatureCard
            icon="💻"
            title="本地优先"
            desc="笔记以 .md 文件形式保存在本地文件夹中，支持任意同步盘或版本控制。"
            accent="blue"
          />
          <FeatureCard
            icon="🎨"
            title="Mondrian 主题"
            desc="鲜明的三原色与粗黑网格，支持浅色 / 深色模式切换，视觉干脆利落。"
            accent="yellow"
          />
          <FeatureCard
            icon="⚡"
            title="快捷操作"
            desc="Cmd+N 新建、Cmd+O 打开笔记库、Cmd+K 搜索，常用操作一手掌握。"
            accent="red"
          />
        </div>
      </section>

      <section id="preview" className="section section--preview">
        <div className="section__head reveal">
          <span className="section__kicker">界面预览</span>
          <h2 className="section__title">熟悉的笔记工作区</h2>
        </div>
        <MockWindow scrollY={scrollY} />
      </section>

      <section id="download" className="section section--download">
        <div className="download-panel reveal">
          <h2 className="download-panel__title">开始试用</h2>
          <p className="download-panel__desc">
            选择适合你系统的版本下载。安装包由 GitHub Releases 托管，完全开源免费。
          </p>
          <div className="download-panel__actions">
            <DownloadButton label="下载 macOS 版 (.dmg)" href={latestAssetUrl(RELEASE_ASSETS.mac)} />
            <DownloadButton label="下载 Windows 版 (.exe)" href={latestAssetUrl(RELEASE_ASSETS.win)} variant="secondary" />
          </div>
          <p className="download-panel__hint">
            当前检测到你在使用 {os === 'mac' ? 'macOS' : os === 'win' ? 'Windows' : '未知系统'}，
            也可以前往 <a href={RELEASES} target="_blank" rel="noreferrer">Releases 页面</a> 手动选择历史版本。
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Markdown Notes. 开源 under{' '}
          <a href={`https://github.com/${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT</a>.
        </p>
      </footer>
    </div>
  )
}

export default App
