import { $, $preset, $bg, $lb } from './dom'
import {
  showToast,
  renderPresetDropdown,
  openPanel,
  closeAllPanels,
  closeDropdown,
  openSavePanel,
  openPresetManager,
} from './ui'
import { openGitHubPanel, doGitHubFetch } from './github'
import { openLightbox, closeLightbox } from './lightbox'
import { loadFolderFiles } from './image-loader'
import { state } from './store'

export { state }

export function initGallery(): void {
  renderPresetDropdown()

  $bg.btn.addEventListener('click', () => openPanel($bg.panel))
  $bg.closeBtn.addEventListener('click', closeAllPanels)
  $bg.resetBtn.addEventListener('click', () => {
    document.body.style.backgroundColor = '#f5f5f7'
    document.body.style.backgroundImage = 'none'
    $bg.colorPicker.value = '#f5f5f7'
    $bg.imageInput.value = ''
    showToast('背景已重置')
    closeAllPanels()
  })

  $bg.colorPicker.addEventListener('input', function () {
    document.body.style.backgroundColor = this.value
    document.body.style.backgroundImage = 'none'
  })

  $bg.imageInput.addEventListener('change', function (e) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function (ev) {
      document.body.style.backgroundImage = `url(${ev.target!.result})`
      showToast('背景已更新')
    }
    reader.readAsDataURL(file)
  })

  document.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', function () {
      const action = (this as HTMLElement).dataset.action
      closeDropdown()
      switch (action) {
        case 'folder':
          $.folderInput.click()
          break
        case 'github':
          openGitHubPanel()
          break
        case 'save':
          openSavePanel()
          break
        case 'manage':
          openPresetManager()
          break
      }
    })
  })

  $.folderInput.addEventListener('change', function (e) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (!files.length) {
      showToast('未找到图片文件')
      return
    }
    state.currentPresetId = null
    state.lastGithubConfig = null
    $preset.label.innerHTML = '<i class="fa-solid fa-folder"></i> 本地文件夹'
    loadFolderFiles(files)
  })

  document.addEventListener('dragover', function (e) {
    e.preventDefault()
  })

  document.addEventListener('drop', function (e) {
    e.preventDefault()
    const items = e.dataTransfer?.items
    if (!items) return
    for (const item of items) {
      if (item.webkitGetAsEntry && item.webkitGetAsEntry()?.isDirectory) {
        $.folderInput.files = e.dataTransfer!.files
        $.folderInput.dispatchEvent(new Event('change'))
        return
      }
    }
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (files.length) {
      state.currentPresetId = null
      state.lastGithubConfig = null
      $preset.label.innerHTML = '<i class="fa-solid fa-folder"></i> 拖拽文件'
      loadFolderFiles(files)
    }
  })

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if ($lb.wrap.classList.contains('open')) {
        closeLightbox()
      } else {
        closeAllPanels()
      }
    }
  })
}

initGallery()
