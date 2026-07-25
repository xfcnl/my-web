export const $ = {
  gallery: document.getElementById('gallery') as HTMLElement,
  countInfo: document.getElementById('countInfo') as HTMLElement,
  overlay: document.getElementById('overlay') as HTMLElement,
  toast: document.getElementById('toast') as HTMLElement,
  folderInput: document.getElementById('folderInput') as HTMLInputElement,
}

export const $preset = {
  wrap: document.querySelector('.preset-wrap') as HTMLElement,
  trigger: document.getElementById('presetTrigger') as HTMLElement,
  dropdown: document.getElementById('presetDropdown') as HTMLElement,
  label: document.getElementById('presetLabel') as HTMLElement,
  list: document.getElementById('presetList') as HTMLElement,
}

export const $bg = {
  btn: document.getElementById('bgBtn') as HTMLElement,
  panel: document.getElementById('bgPanel') as HTMLElement,
  colorPicker: document.getElementById('colorPicker') as HTMLInputElement,
  imageInput: document.getElementById('bgImageInput') as HTMLInputElement,
  resetBtn: document.getElementById('resetBgBtn') as HTMLElement,
  closeBtn: document.getElementById('closeBgBtn') as HTMLElement,
}

export const $github = {
  panel: document.getElementById('githubPanel') as HTMLElement,
  repo: document.getElementById('ghRepo') as HTMLInputElement,
  branch: document.getElementById('ghBranch') as HTMLInputElement,
  path: document.getElementById('ghPath') as HTMLInputElement,
  token: document.getElementById('ghToken') as HTMLInputElement,
  rawService: document.getElementById('ghRawService') as HTMLSelectElement,
  cancelBtn: document.getElementById('cancelGhBtn') as HTMLElement,
  fetchBtn: document.getElementById('fetchGhBtn') as HTMLElement,
}

export const $presetPanel = {
  panel: document.getElementById('presetPanel') as HTMLElement,
  list: document.getElementById('presetListPanel') as HTMLElement,
  closeBtn: document.getElementById('closePresetPanelBtn') as HTMLElement,
}

export const $save = {
  panel: document.getElementById('savePanel') as HTMLElement,
  nameInput: document.getElementById('presetNameInput') as HTMLInputElement,
  typeSelect: document.getElementById('saveTypeSelect') as HTMLSelectElement,
  typeHint: document.getElementById('saveTypeHint') as HTMLElement,
  cancelBtn: document.getElementById('cancelSaveBtn') as HTMLElement,
  confirmBtn: document.getElementById('confirmSaveBtn') as HTMLElement,
}

export const $lb = {
  wrap: document.getElementById('lightbox') as HTMLElement,
  bg: document.getElementById('lightboxBg') as HTMLElement,
  imgWrap: document.getElementById('lbImgWrap') as HTMLElement,
  img: document.getElementById('lbImg') as HTMLImageElement,
  caption: document.getElementById('lbCaption') as HTMLElement,
  prev: document.getElementById('lbPrev') as HTMLElement,
  next: document.getElementById('lbNext') as HTMLElement,
  close: document.getElementById('lbClose') as HTMLElement,
  zoomIn: document.getElementById('zoomIn') as HTMLElement,
  zoomOut: document.getElementById('zoomOut') as HTMLElement,
  zoomReset: document.getElementById('zoomReset') as HTMLElement,
  zoomLevel: document.getElementById('zoomLevel') as HTMLElement,
}
