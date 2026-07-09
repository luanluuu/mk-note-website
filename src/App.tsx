import './App.css'

const REPO = 'luanluuu/mk-note'
const LATEST_RELEASE = `https://github.com/${REPO}/releases/latest`

function DownloadButton({
  label,
  href,
  primary = false,
}: {
  label: string
  href: string
  primary?: boolean
}) {
  return (
    <a
      className={primary ? 'btn btn-primary' : 'btn btn-secondary'}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {label}
    </a>
  )
}

function App() {
  return (
    <div className="app">
      <header className="hero">
        <h1>Markdown Notes</h1>
        <p className="tagline">
          一款简洁、快速的本地 Markdown 笔记桌面应用
        </p>

        <div className="download-group">
          <DownloadButton
            label="下载 macOS 版"
            href={`${LATEST_RELEASE}`}
            primary
          />
          <DownloadButton
            label="下载 Windows 版"
            href={`${LATEST_RELEASE}`}
            primary
          />
        </div>

        <p className="hint">
          点击后会跳转到 GitHub Releases，选择对应系统的安装包即可。
        </p>

        <a
          className="github-link"
          href={`https://github.com/${REPO}`}
          target="_blank"
          rel="noreferrer"
        >
          在 GitHub 上查看源码 →
        </a>
      </header>

      <section className="features">
        <div className="feature">
          <h3>📝 Markdown 编辑</h3>
          <p>支持实时预览，专注写作体验。</p>
        </div>
        <div className="feature">
          <h3>🔍 语义搜索</h3>
          <p>基于本地模型，无需联网即可语义检索笔记。</p>
        </div>
        <div className="feature">
          <h3>💻 本地存储</h3>
          <p>数据保存在本地文件系统，安全可控。</p>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Markdown Notes. 开源 under MIT。</p>
      </footer>
    </div>
  )
}

export default App
