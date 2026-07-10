import { useEffect, useRef, useState } from 'react'
import './App.css'

const REPO = 'luanluuu/mk-note'
const RELEASES = `https://github.com/${REPO}/releases`

// 请替换为实际上传到 GitHub Release 的资产文件名。
// 如果文件名固定（不带版本号），/releases/latest/download/{文件名} 会永远指向最新版本。
const RELEASE_ASSETS = {
  mac: 'Markdown-Notes.dmg',
  win: 'Markdown-Notes.exe',
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
      <span className="theme-toggle__label">{theme === 'light' ? 'Light' : 'Dark'}</span>
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

type IconName = 'doc' | 'ai' | 'search' | 'disk' | 'theme' | 'command'

function GeoIcon({ name }: { name: IconName }) {
  return (
    <span className={`geo-icon geo-icon--${name}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: IconName
  title: string
  desc: string
  accent: 'red' | 'blue' | 'yellow'
}) {
  return (
    <article className={`feature-card feature-card--${accent} reveal`}>
      <GeoIcon name={icon} />
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{desc}</p>
    </article>
  )
}

const EDITOR_LINES = [
  { type: 'h1' as const, text: '项目规划' },
  { type: 'p' as const, text: '把分散想法整理成可执行的项目笔记。' },
  { type: 'li' as const, text: '沉淀会议结论和待办' },
  { type: 'li' as const, text: '用 AI 优化段落结构' },
  { type: 'li' as const, text: '按语义搜索相关资料' },
]

const TYPE_SPEED = 45
const LINE_PAUSE = 600

function TypewriterEditor({ started }: { started: boolean }) {
  const [currentLine, setCurrentLine] = useState(0)
  const [display, setDisplay] = useState<string[]>(() => EDITOR_LINES.map((line) => line.text))
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!started) return
    if (currentLine >= EDITOR_LINES.length) {
      setDone(true)
      return
    }
    const text = EDITOR_LINES[currentLine].text
    let i = Math.max(0, text.length - 8)
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

function MockWindow({ scrollY, compact = false }: { scrollY: number; compact?: boolean }) {
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
      className={`mock-window ${compact ? 'mock-window--compact' : 'reveal'}`}
      style={compact ? undefined : { transform: `translateY(${offset}px)` }}
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
            <span>优化</span>
            <span>变体</span>
            <span>精简</span>
            <span>翻译</span>
          </div>
          <TypewriterEditor started={started} />
          <div className="mock-ai-panel" aria-hidden="true">
            <strong>AI 建议</strong>
            <span>将目标拆成「背景 / 决策 / 下一步」，并引用项目上下文。</span>
          </div>
        </main>
      </div>
    </div>
  )
}

const VALUE_ITEMS = [
  ['本地文件', '笔记就是 .md 文件，可放进同步盘或 Git 仓库。'],
  ['本地语义搜索', '不用记关键词，也能找回相近主题的笔记。'],
  ['AI 写作栏', '优化、变体、精简、翻译直接回写编辑器。'],
  ['项目上下文', '写笔记时可参考项目内容，减少来回切换。'],
]

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
        <div className="topbar__mobile-actions">
          <a href="#download" className="topbar__download">下载</a>
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

        <div className="hero__inner">
          <div
            className="hero__content"
            style={{ transform: `translateY(${scrollY * -0.035}px)` }}
          >
            <span className="hero__kicker">LOCAL FIRST / AI READY</span>
            <h1 className="hero__title">
              把思绪写成
              <br />
              <span className="hero__title--accent">结构清晰的笔记</span>
            </h1>
            <p className="hero__lead">
              本地优先的 Markdown 桌面应用。用 .md 文件保存你的知识库，并把 AI 写作、项目上下文和语义搜索放进同一个工作区。
            </p>
            <div className="hero__actions">
              <DownloadButton
                label={os === 'mac' ? '下载 macOS 版' : '下载 Windows 版'}
                href={latestAssetUrl(os === 'mac' ? RELEASE_ASSETS.mac : RELEASE_ASSETS.win)}
              />
              <DownloadButton label="历史版本" href={RELEASES} variant="secondary" />
            </div>
            <p className="hero__note">开源免费，本地 .md 存储，可接 Ollama 或 OpenAI 兼容 API。</p>
          </div>
          <div className="hero__preview">
            <MockWindow scrollY={0} compact />
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
            icon="doc"
            title="Markdown 编辑"
            desc="基于 Milkdown 的所见即所得编辑器，实时预览、快捷键友好，专注内容本身。"
            accent="blue"
          />
          <FeatureCard
            icon="ai"
            title="AI 辅助写作"
            desc="连接本地 Ollama 或 OpenAI 兼容 API，实现优化、变体、精简、翻译和项目级分析。"
            accent="red"
          />
          <FeatureCard
            icon="search"
            title="语义搜索"
            desc="基于 Transformers.js 的本地嵌入模型，无需联网即可按语义检索笔记。"
            accent="yellow"
          />
          <FeatureCard
            icon="disk"
            title="本地优先"
            desc="笔记以 .md 文件形式保存在本地文件夹中，支持任意同步盘或版本控制。"
            accent="blue"
          />
          <FeatureCard
            icon="theme"
            title="Mondrian 主题"
            desc="鲜明的三原色与粗黑网格，支持浅色 / 深色模式切换，视觉干脆利落。"
            accent="yellow"
          />
          <FeatureCard
            icon="command"
            title="快捷操作"
            desc="Cmd+N 新建、Cmd+O 打开笔记库、Cmd+K 搜索，常用操作一手掌握。"
            accent="red"
          />
        </div>
      </section>

      <section className="section section--value">
        <div className="value-grid reveal">
          {VALUE_ITEMS.map(([title, desc]) => (
            <article className="value-item" key={title}>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
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
