// pages/boutique/boutique.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:'',
    state: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    this.setData({
      src: options.src,
    });
    // this.onAcc();
  },
  // 播放结束返回
  end() {
    wx.navigateBack({delta: 1});
  },
  // 播放出错
  err() {
    wx.showToast({
      icon: 'none',
      title: '视频加载失败'
    });
    setTimeout(() => {
      wx.hideToast();
      wx.navigateBack({delta: 1});
    }, 1500);
  },
  //翻转屏幕
  onAcc: function () {
    let lastState = 0;
    let lastTime = Date.now();
    wx.startAccelerometer();
    wx.onAccelerometerChange((res) => {
      const now = Date.now();
      // 500ms检测一次
      if (now - lastTime < 500) {
        return;
      }
      lastTime = now;
      let nowState;
      // 57.3 = 180 / Math.PI
      const Roll = Math.atan2(-res.x, Math.sqrt(res.y * res.y + res.z * res.z)) * 57.3;
      const Pitch = Math.atan2(res.y, res.z) * 57.3;
      // console.log('Roll: ' + Roll, 'Pitch: ' + Pitch)
      // 横屏状态
      if (Roll > 50) {
        if ((Pitch > -180 && Pitch < -60) || (Pitch > 130)) {
          nowState = 1;
        } else {
          nowState = lastState;
        }
      } else if ((Roll > 0 && Roll < 30) || (Roll < 0 && Roll > -30)) {
        let absPitch = Math.abs(Pitch);
        // 如果手机平躺，保持原状态不变，40容错率
        if ((absPitch > 140 || absPitch < 40)) {
          nowState = lastState;
        } else if (Pitch < 0) { /*收集竖向正立的情况*/
          nowState = 0;
        } else {
          nowState = lastState;
        }
      }
      else {
        nowState = lastState;
      }
      this.setData({
        state: nowState
      })
      // 状态变化时，触发
      if (nowState !== lastState) {
        lastState = nowState;
        if (nowState === 1) {
          console.log('change:横屏');
        } else {
          console.log('change:竖屏');
        }
      }
      const videoCtx = wx.createVideoContext('myVideo', this)
      if (this.data.state === 1) {
        videoCtx.requestFullScreen();
      } else {
        videoCtx.exitFullScreen();
      }
    });
  },
  // https://talkwechat.boluozaixian.com/filesinfo/20180927_Two Steps From Hell - Never Back Down.mp4
});