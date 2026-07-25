const REPO = 'xfcnl/my-web'
const ANNOUNCEMENT_URL = `https://raw.githubusercontent.com/${REPO}/home/home.txt`
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases`

function escapeHtml(unsafe: string): string {
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatFileSize(bytes: number): string {
  const units = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const exp = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, exp)).toFixed(2)} ${units[exp]}`
}

function generateProxyUrl(url: string): string {
  return `https://ghproxy.net/${encodeURI(url)}`
}

function showErrorNotification(message: string): void {
  const notification = document.createElement('div')
  notification.style.cssText =
    'position:fixed;bottom:20px;right:20px;background:#2d1b1b;color:#f85149;padding:12px 20px;border-radius:8px;z-index:10000;display:flex;align-items:center;gap:10px;border:1px solid #f85149;font-size:0.9rem;'
  notification.innerHTML = `<span><i class="fas fa-exclamation-circle"></i> ${escapeHtml(message)}</span><button style="background:none;border:none;cursor:pointer;color:#f85149;font-size:1rem;"><i class="fas fa-times"></i></button>`
  document.body.appendChild(notification)
  notification.querySelector('button')!.onclick = () => notification.remove()
  setTimeout(() => notification.remove(), 5000)
}

async function fetchAnnouncement(): Promise<void> {
  const contentDiv = document.getElementById('announcement-content')!
  try {
    contentDiv.innerHTML =
      '<div class="loading-text"><i class="fas fa-spinner"></i> 加载中...</div>'
    const response = await fetch(ANNOUNCEMENT_URL)
    if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`)
    const text = await response.text()
    const formatted = (text || '暂无公告').replace(/\n/g, '<br>')
    // Simple markdown-like link detection
    const withLinks = formatted.replace(
      /https?:\/\/[^\s<]+/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
    )
    contentDiv.innerHTML = withLinks
  } catch (error: any) {
    contentDiv.innerHTML = `
      <div class="error-text">
        <i class="fas fa-exclamation-triangle"></i> ${escapeHtml(error.message)}
        <button onclick="fetchAnnouncement()" class="refresh-button" style="margin-top:10px;">
          <i class="fas fa-redo"></i> 重试
        </button>
      </div>
    `
  }
}

async function fetchReleases(): Promise<void> {
  try {
    const response = await fetch(RELEASES_API)
    if (!response.ok) throw new Error('获取发布信息失败')
    const releases = await response.json()
    const container = document.getElementById('releases')!

    container.innerHTML = releases
      .map(
        (release: any) => `
      <div class="release">
        <div class="release-header">
          <h3><i class="fas fa-tag"></i> ${escapeHtml(release.name)}</h3>
          <div class="release-meta">
            <span><i class="fas fa-code-branch"></i> 版本：${escapeHtml(release.tag_name)}</span>
            <span><i class="fas fa-calendar-alt"></i> 发布时间：${new Date(release.published_at).toLocaleDateString()}</span>
          </div>
        </div>
        <ul class="assets" style="display:none;list-style:none;padding:0;">
          ${release.assets
            .map(
              (asset: any) => `
            <li class="download-item">
              <div class="file-info">
                <span class="file-name"><i class="fas fa-file"></i> ${escapeHtml(asset.name)}</span>
                <span class="file-size"><i class="fas fa-database"></i> ${formatFileSize(asset.size)}</span>
              </div>
              <div class="download-options">
                <a href="${asset.browser_download_url}" class="download-link"><i class="fas fa-download"></i> 普通下载</a>
                <a href="${generateProxyUrl(asset.browser_download_url)}" class="download-link accelerated"><i class="fas fa-bolt"></i> 高速下载</a>
              </div>
            </li>
          `,
            )
            .join('')}
        </ul>
        <button class="toggle-assets"><i class="fas fa-layer-group"></i> 显示资源</button>
      </div>
    `,
      )
      .join('')

    document.getElementById('release-count')!.textContent = releases.length
    const totalFiles = releases.reduce(
      (acc: number, r: any) => acc + r.assets.length,
      0,
    )
    document.getElementById('file-count')!.textContent = totalFiles

    document.querySelectorAll('.toggle-assets').forEach((button) => {
      button.addEventListener('click', function () {
        const assetsList = this.previousElementSibling as HTMLElement
        const isHidden = assetsList.style.display === 'none'
        assetsList.style.display = isHidden ? 'block' : 'none'
        this.innerHTML = isHidden
          ? '<i class="fas fa-layer-group"></i> 隐藏资源'
          : '<i class="fas fa-layer-group"></i> 显示资源'
      })
    })
  } catch (error: any) {
    showErrorNotification(`文件加载失败: ${error.message}`)
  }
}

async function initialize(): Promise<void> {
  try {
    await Promise.all([fetchAnnouncement(), fetchReleases()])
  } catch (error: any) {
    showErrorNotification(`初始化失败: ${error.message}`)
  }
}

document.addEventListener('DOMContentLoaded', initialize)
