const {ipcRenderer} = require('electron')
const {convertDuration, showMusicName} = require('./helper')

window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('add-music-btn').addEventListener('click', () => {
    // 发送事件
    ipcRenderer.send('add-music-window')
  })

  const tracksList = document.getElementById('tracks-list')

  ipcRenderer.on('getTracks', (event, tracks) => {
    // console.log(tracks)
    // 渲染数据到页面
    allTracks = tracks
    renderListHtml(tracksList, tracks)
  })

  // 播放音乐的相关变量
  let musicAudio = new Audio()
  let allTracks
  let currentTrack

  tracksList.addEventListener('click', (event) => {
    // 阻止默认行为
    event.preventDefault();
    // 获取自定义属性和class数组
    const {dataset, classList} = event.target
    // 获取ID属性
    const id = dataset && dataset.id

    if (id && classList.contains('fa-play')) { // 播放按钮
      // 判断播放的是否是当前歌曲
      if (currentTrack && currentTrack.id === id) {
        // 继续播放音乐
        musicAudio.play()
      } else {
        // 播放新的歌曲
        currentTrack = allTracks.find(track => track.id === id)
        musicAudio.src = currentTrack.path
        musicAudio.play()
        // 还原之前歌曲的播放图标
        const resetIconEle = document.querySelector('.fa-pause')
        if (resetIconEle) {
          resetIconEle.classList.replace('fa-pause', 'fa-play')
        }
      }

      // 改变图标
      classList.replace('fa-play', 'fa-pause')
    } else if (id && classList.contains('fa-pause')) { // 暂停按钮
      // 暂停音乐
      musicAudio.pause()
      // 改变图标
      classList.replace('fa-pause', 'fa-play')
    } else if (id && classList.contains('fa-trash-alt')) { // 删除按钮
      // 删除音乐
      ipcRenderer.send('delete-track', id)
    }
  })

  musicAudio.addEventListener('loadedmetadata', () => {
    /*musicAudio.currentTime = 100
    musicAudio.play()*/
    // 渲染播放器状态
    renderPlayerHtml(currentTrack.fileName, musicAudio.duration)
  })

  musicAudio.addEventListener('timeupdate', () => {
    // 更新播放器状态
    updateProgressHTML(musicAudio.currentTime, musicAudio.duration)
  })
})

// 渲染播放状态
const renderPlayerHtml = (name, duration) => {
  const player = document.getElementById('player-status')
  const html = `
    <div class="col font-weight-bold">正在播放：${showMusicName(name)}</div>
    <div class="col">
        <span id="current-seeker">00:00</span>/${convertDuration(duration)}
    </div>
  `
  player.innerHTML = html
}

// 渲染进度条
const updateProgressHTML = (currentTime, duration) => {
  // 显示歌曲时间
  const seeker = document.getElementById('current-seeker')
  seeker.innerHTML = convertDuration(currentTime)

  // 计算进度条
  const progress = Math.floor(currentTime/duration * 100)
  const bar = document.getElementById('player-progress')
  bar.innerHTML = progress + "%"
  bar.style.width = progress + '%'
}

// 渲染列表
const renderListHtml = (listDom, tracks) => {
  const emptyTrackHtml = `<div class="alert alert-primary">还没有添加任何音乐</div>`
  const tracksListHtml = tracks.reduce((html, track) => {
    html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
            <div class="col-10">
                <i class="fas fa-music mr-2 text-secondary"></i>
                <b>${track.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fas fa-play" data-id="${track.id}" style="margin-right: 15px;"></i>
                <i class="fas fa-trash-alt" data-id="${track.id}"></i>
            </div>
        </li>`
    return html
  }, '')

  listDom.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHtml}</ul>` : emptyTrackHtml
}

