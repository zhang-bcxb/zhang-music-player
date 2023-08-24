const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const Store = require('electron-store');
const DataStore = require('./renderer/MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {

    // 基本参数
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        // 解决 JS 文件中的 require 报错
        contextIsolation: false
      }
    }

    // 后面的参数覆盖前面的参数
    // const finalConfig = Object.assign(basicConfig, config)
    const finalConfig = {...basicConfig, ...config}

    // 调用父类构造方法
    super(finalConfig);

    // 加载文件
    this.loadFile(fileLocation)

    // 隐藏工具栏
    this.setMenu(null)

    // 优雅的显示窗口，防止视觉闪烁
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

let mainWindow = null
let addWindow = null

function createIndexWindow() {
  mainWindow = new AppWindow({}, './renderer/index.html')

  // 打开开发者工具
  // mainWindow.webContents.openDevTools()
}

function createAddWindow() {
  addWindow = new AppWindow({
    width: 500,
    height: 400,
    parent: mainWindow
  }, './renderer/add.html')

  // 打开开发者工具
  // addWindow.webContents.openDevTools()
}

app.on('ready', () => {
  createIndexWindow()

  // 主窗口创建成功后触发
  mainWindow.webContents.on('did-finish-load', () => {
    // console.log("did-finish-load")
    mainWindow.send('getTracks', myStore.getTracks())
  })

  // 监听事件
  // 打开添加音乐窗口
  ipcMain.on('add-music-window', () => {
    createAddWindow()
  })

  // 打开音乐文件
  ipcMain.on('open-music-file', (event) => {

    const files = dialog.showOpenDialogSync({
      // 允许的功能：选择文件，多选
      properties: ['openFile', 'multiSelections'],
      // 过滤文件类型
      filters: [{name: 'Music', extensions: ['mp3']}]
    })

    // console.log(files)
    if (files) {
      event.sender.send('selected-file', files)
    } else {
      console.log('没有选择任何文件')
    }

  })

  // 导入并持久化音乐数据
  ipcMain.on('add-tracks', (event, tracks) => {
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    //console.log(updatedTracks)
    mainWindow.send('getTracks', updatedTracks)

    // 导入完后，关闭子窗口，显示父窗口
    addWindow.close()
    mainWindow.show()
  })

  // 删除音乐
  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })
})
