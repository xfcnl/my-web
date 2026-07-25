import galleryConfig from '../../config/gallery-config.json'
import { $, $preset, $presetPanel, $save, $bg } from './dom'
import {
  getAllPresets,
  loadCustomPresets,
  saveCustomPresets,
  presetIconClass,
  presetCount,
  state,
} from './store'
import { loadUrls } from './image-loader'
import { openGitHubPanel } from './github'

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function showToast(msg: string, duration?: number): void {
  duration = duration ?? galleryConfig.ui.toastDuration ?? 2000
  $.toast.textContent = msg
  $.toast.classList.add('show')
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => $.toast.classList.remove('show'), duration)
}

export function openPanel(panel: HTMLElement): void {
  $.overlay.classList.add('open')
  panel.classList.add('open')
}

export function closeAllPanels(): void {
  document.querySelectorAll('.panel.open').forEach((p) => p.classList.remove('open'))
  $.overlay.classList.remove('open')
}

$.overlay.addEventListener('click', closeAllPanels)

export function toggleDropdown(e: MouseEvent): void {
  e.stopPropagation()
  $preset.dropdown.classList.toggle('open')
  $preset.trigger.classList.toggle('open')
}

export function closeDropdown(): void {
  $preset.dropdown.classList.remove('open')
  $preset.trigger.classList.remove('open')
}

$preset.trigger.addEventListener('click', toggleDropdown)

document.addEventListener('click', function (e) {
  if ($preset.wrap && !$preset.wrap.contains(e.target as Node)) closeDropdown()
})

export function renderPresetDropdown(): void {
  const all = getAllPresets()
  $preset.list.innerHTML = ''

  if (!all.length) {
    $preset.list.innerHTML =
      '<div style="padding:12px;text-align:center;font-size:13px;opacity:.4">暂无预设</div>'
    return
  }

  all.forEach((p, i) => {
    const btn = document.createElement('button')
    btn.className = 'opt-item'
    btn.dataset.presetId = String(i)
    btn.innerHTML = `
      <span class="icon"><i class="${presetIconClass(p)}"></i></span>
      ${p.name}
      <span class="badge">${presetCount(p)}</span>
    `
    btn.addEventListener('click', () => {
      loadPresetById(i)
      closeDropdown()
    })
    $preset.list.appendChild(btn)
  })
}

export function loadPresetById(id: number): void {
  const all = getAllPresets()
  const preset = all[id]
  if (!preset) return

  state.currentPresetId = id
  state.lastGithubConfig = null

  if (preset.type === 'github') {
    const $g = document
    ;($g.getElementById('ghRepo') as HTMLInputElement).value =
      preset.owner + '/' + preset.repo
    ;($g.getElementById('ghBranch') as HTMLInputElement).value =
      preset.branch || 'main'
    ;($g.getElementById('ghPath') as HTMLInputElement).value = preset.path || ''
    ;($g.getElementById('ghToken') as HTMLInputElement).value = preset.token || ''
    ;($g.getElementById('ghRawService') as HTMLSelectElement).value =
      preset.rawService ||
      localStorage.getItem('gallery_raw_service') ||
      galleryConfig.githubDefaults.rawService
    $preset.label.textContent = preset.name
    openGitHubPanel()
  } else if ('images' in preset && preset.images?.length) {
    $preset.label.textContent = preset.name
    loadUrls(preset.images)
  } else {
    showToast('预设为空')
  }
}

function updateSaveTypeHint(): void {
  const type = $save.typeSelect.value
  $save.typeHint.textContent =
    type === 'github'
      ? '保存仓库配置，下次加载时可重新获取最新图片'
      : '保存当前所有图片的 URL'
}

$save.typeSelect.addEventListener('change', updateSaveTypeHint)

export function openSavePanel(): void {
  if (!state.images.length) {
    showToast('没有可保存的图片')
    return
  }

  const hasGithub = state.lastGithubConfig !== null
  $save.nameInput.value = ''
  $save.typeSelect.value = hasGithub ? 'github' : 'urls'
  $save.typeSelect.disabled = !hasGithub
  updateSaveTypeHint()
  openPanel($save.panel)
  setTimeout(() => $save.nameInput.focus(), 100)
}

$save.cancelBtn.addEventListener('click', closeAllPanels)
$save.confirmBtn.addEventListener('click', function () {
  const name = $save.nameInput.value.trim()
  if (!name) {
    showToast('请输入名称')
    return
  }

  const type = $save.typeSelect.value
  const presets = loadCustomPresets()

  if (type === 'github' && state.lastGithubConfig) {
    const gc = state.lastGithubConfig
    presets.push({
      type: 'github',
      name,
      owner: gc.owner,
      repo: gc.repo,
      branch: gc.branch,
      path: gc.path || '',
      rawService: gc.rawService || galleryConfig.githubDefaults.rawService,
    } as any)
  } else {
    const urls = state.images.map((img) => img.src).filter(Boolean)
    if (!urls.length) {
      showToast('没有可保存的图片 URL')
      return
    }
    presets.push({ name, images: urls } as any)
  }

  saveCustomPresets(presets)
  renderPresetDropdown()
  closeAllPanels()
  showToast(`已保存预设: ${name}`)
})

$save.nameInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') $save.confirmBtn.click()
})

export function openPresetManager(): void {
  renderPresetManager()
  openPanel($presetPanel.panel)
}

$presetPanel.closeBtn.addEventListener('click', closeAllPanels)

function renderPresetManager(): void {
  const container = $presetPanel.list
  container.innerHTML = ''

  const builtin = getAllPresets().slice(0, getBuiltinPresetCount())

  builtin.forEach((p) => {
    const row = document.createElement('div')
    row.className = 'preset-list-item'
    row.innerHTML = `
      <div class="p-info">
        <span class="p-icon"><i class="${presetIconClass(p)}"></i></span>
        <span class="p-name">${p.name}</span>
        <span class="p-count">${presetCount(p)}</span>
      </div>
      <span class="p-lock"><i class="fa-solid fa-lock"></i></span>
    `
    container.appendChild(row)
  })

  const custom = loadCustomPresets()
  if (custom.length) {
    const sep = document.createElement('div')
    sep.style.cssText =
      'font-size:11px;font-weight:600;opacity:.4;padding:8px 0 4px;text-transform:uppercase;letter-spacing:.5px;'
    sep.textContent = '自定义'
    container.appendChild(sep)

    custom.forEach((p, i) => {
      const row = document.createElement('div')
      row.className = 'preset-list-item'
      const delBtn = document.createElement('button')
      delBtn.className = 'p-del'
      delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>'
      delBtn.addEventListener('click', function (e) {
        e.stopPropagation()
        const presets = loadCustomPresets()
        presets.splice(i, 1)
        saveCustomPresets(presets)
        renderPresetDropdown()
        renderPresetManager()
        showToast('已删除')
      })
      row.innerHTML = `
        <div class="p-info">
          <span class="p-icon"><i class="${presetIconClass(p)}"></i></span>
          <span class="p-name">${p.name}</span>
          <span class="p-count">${presetCount(p)}</span>
        </div>
      `
      row.appendChild(delBtn)
      container.appendChild(row)
    })
  }

  if (!builtin.length && !custom.length) {
    container.innerHTML =
      '<div style="padding:12px;text-align:center;font-size:13px;opacity:.4">暂无预设</div>'
  }
}

function getBuiltinPresetCount(): number {
  const all = getAllPresets()
  return all.length - loadCustomPresets().length
}
