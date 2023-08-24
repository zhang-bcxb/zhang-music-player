exports.$ = (id) => {
  return document.getElementById(id)
}

// 格式化时间
exports.convertDuration = (time) => {
  // 计算分钟
  const minutes = "0" + Math.floor(time / 60)
  // 计算秒数
  const seconds = "0" + Math.floor(time - minutes * 60)

  return minutes.substr(-2) + ":" + seconds.substr(-2)
}

// 格式化歌曲名称
exports.showMusicName = (name) => {
  // 去掉文件后缀
  name = name.slice(0, name.length - 4)
  // 截取显示的部分
  return name.length > 20 ? name.substr(0, 20) + "..." : name;
}
