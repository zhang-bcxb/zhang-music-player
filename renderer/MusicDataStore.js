const Store = require('electron-store');
const uuidv4 = require('uuid').v4
const path = require('path')

class DataStore extends Store {
  constructor(settings) {
    super();

    // 存储音乐信息
    this.tracks = this.get('tracks') || []
  }

  // 保持音乐信息
  saveTracks() {
    this.set('tracks', this.tracks)
    return this
  }

  // 获取音乐信息
  getTracks() {
    return this.get('tracks') || []
  }

  // 添加音乐信息
  addTracks(tracks) {
    const tracksWithProps = tracks.map(track => { // 存储固定格式的数据
      return {
        id: uuidv4(),
        path: track,
        fileName: path.basename(track)
      }
    }).filter(track => { // 去重
      const currentTracksPath = this.getTracks().map(track => track.path)
      return currentTracksPath.indexOf(track.path) < 0
    })

    this.tracks = [...this.tracks, ...tracksWithProps]

    return this.saveTracks()
  }

  // 删除音乐信息
  deleteTrack(delId) {
    this.tracks = this.tracks.filter(item => item.id !== delId)
    return this.saveTracks()
  }
}

module.exports = DataStore
