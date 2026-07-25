import galleryConfig from '../../config/gallery-config.json'
import { $github, $preset } from './dom'
import { state } from './store'
import { showToast, openPanel, closeAllPanels, renderPresetDropdown } from './ui'
import { loadUrls } from './image-loader'

const IMAGE_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.bmp', '.ico', '.tiff', '.tif', '.avif', '.heic', '.heif',
])

export function openGitHubPanel(): void {
  if (state.lastGithubConfig) {
    $github.repo.value = state.lastGithubConfig.owner + '/' + state.lastGithubConfig.repo
    $github.branch.value = state.lastGithubConfig.branch
    $github.path.value = state.lastGithubConfig.path || ''
    $github.token.value = state.lastGithubConfig.token || ''
    $github.rawService.value = state.lastGithubConfig.rawService || galleryConfig.githubDefaults.rawService
  } else {
    const saved = localStorage.getItem('gallery_raw_service')
    if (saved) $github.rawService.value = saved
  }
  openPanel($github.panel)
  setTimeout(() => $github.repo.focus(), 100)
}

$github.cancelBtn.addEventListener('click', closeAllPanels)
$github.fetchBtn.addEventListener('click', doGitHubFetch)

$github.repo.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') $github.branch.focus()
})
$github.branch.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') $github.path.focus()
})
$github.path.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') doGitHubFetch()
})

export async function doGitHubFetch(): Promise<void> {
  const repo = $github.repo.value.trim()
  const branch = $github.branch.value.trim() || 'main'
  const path = $github.path.value.trim()
  const token = $github.token.value.trim() || null
  const rawService = $github.rawService.value

  const match = repo.match(/^([\w.-]+)\/([\w.-]+)$/)
  if (!match) {
    showToast('请输入有效的 owner/repo')
    return
  }
  const owner = match[1]
  const repoName = match[2]

  $github.fetchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 获取中…'
  ;($github.fetchBtn as HTMLButtonElement).disabled = true

  try {
    const urls = await fetchGitHubImages(owner, repoName, branch, path, token, rawService)
    if (!urls.length) {
      showToast('未找到图片文件')
      return
    }

    localStorage.setItem('gallery_raw_service', rawService)
    state.lastGithubConfig = { owner, repo: repoName, branch, path, token, rawService }
    state.currentPresetId = null
    $preset.label.innerHTML = `<i class="fa-brands fa-github"></i> ${owner}/${repoName}`
    closeAllPanels()
    loadUrls(urls)

    setTimeout(() => renderPresetDropdown(), 0)
  } catch (err: any) {
    showToast('获取失败: ' + err.message)
  } finally {
    $github.fetchBtn.innerHTML = '获取并加载'
    ;($github.fetchBtn as HTMLButtonElement).disabled = false
  }
}

export async function fetchGitHubImages(
  owner: string,
  repo: string,
  branch: string,
  path: string,
  token: string | null,
  rawService: string,
): Promise<string[]> {
  rawService = rawService || galleryConfig.githubDefaults.rawService
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (token) headers['Authorization'] = 'token ' + token

  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`
  const res = await fetch(treeUrl, { headers })

  if (res.status === 403) throw new Error('API 频率限制，请添加 Token 或稍后再试')
  if (res.status === 404) throw new Error('仓库或分支不存在')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const json = await res.json()
  if (!json.tree || !Array.isArray(json.tree)) throw new Error('无法获取文件树')
  if (json.truncated) console.warn('仓库文件树过大，结果可能不完整')

  const filterPath = path ? path.replace(/^\/|\/$/g, '') + '/' : ''
  const found: string[] = []

  for (const item of json.tree) {
    if (item.type !== 'blob') continue
    if (filterPath && !item.path.startsWith(filterPath)) continue
    const ext = '.' + item.path.split('.').pop()!.toLowerCase()
    if (IMAGE_EXTS.has(ext)) {
      const encodedPath = item.path.split('/').map((s: string) => encodeURIComponent(s)).join('/')
      if (rawService === 'jsdelivr') {
        found.push(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${encodeURIComponent(branch)}/${encodedPath}`)
      } else {
        const host = rawService === 'raw.gh.1s.fan' ? 'raw.gh.1s.fan' : 'raw.githubusercontent.com'
        found.push(`https://${host}/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}`)
      }
    }
  }

  return found
}
