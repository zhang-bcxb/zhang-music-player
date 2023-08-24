const {ipcRenderer} = require('electron')
const path = require('path')

window.addEventListener('DOMContentLoaded', function () {
  let musicFilesPath = []

  // 添加音乐
  document.getElementById('select-music-btn').addEventListener('click', () => {
    // 发送事件
    ipcRenderer.send('open-music-file')
  })

  // 导入音乐
  document.getElementById('add-music-btn').addEventListener('click', () => {
    // 发送事件
    ipcRenderer.send('add-tracks', musicFilesPath)
  })

  ipcRenderer.on('selected-file', (event, path) => {
    if (Array.isArray(path)) {
      renderListHtml(path)
      musicFilesPath = path
    }
  })

  const renderListHtml = (paths) => {
    const musicList = document.getElementById('music-list')
    const musicItemsHtml = paths.reduce((html, music) => {
      html += `<li class="list-group-item">${path.basename(music)}</li>`
      return html
    }, '')

    musicList.innerHTML = `<ul class="list-group">${musicItemsHtml}</ul>`
  }

})
