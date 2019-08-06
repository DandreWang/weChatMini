//app.js
import http from './utils/request'
import { config } from './utils/api'

App({
  globalData: {
    // 验证当前环境接口返回标记
    firstFlg: false,
    // iphonex兼容
    isIphoneX: false,
  },
  // 小程序初始化-生命周期
  onLaunch(option) {

    this.globalData.initOpt = option
    // 经验证，开发者工具中，为devtools，开发版及体验版为0，正式版则为1
    http.get('first', undefined, { loadingHid: true }).then(res => {
      const version = res.data && res.data.split('/')[4];
      //非正式环境（开发者环境，开发版、体验版）
      if (!version || version == 0 || version == 'devtools') {
        config.test = true;
      } else {
        config.test = false;
      }

      this.globalData.firstFlg = true
      this.pageDataLoad && this.pageDataLoad();
    });
    //检测是否授权 未授权跳转登录页
    this.checkAuthorize()
    // 获取设备信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.isIphoneX = res.model.indexOf('iPhone X') !== -1
      }
    })
  },
  //判断用户是否授权
  checkAuthorize() {
    const userData = wx.getStorageSync('userData');
    // 本地没有用户信息
    if (!userData) {
      return wx.reLaunch({
        url: '/pages/login/index'
      });
    }
    this.data = { ...this.data, ...userData }
    this.firstCallback(this.pageCb)
  },
  firstCallback(cb) {
    const { firstFlg } = this.globalData;
    if (firstFlg) {
      cb();
    } else {
      this.pageDataLoad = cb;
    }
  },
  onShow(opt) {
    if (opt.path === 'pages/index/index') {
      wx.reLaunch({url: '/pages/examSec/index/index'})
    }
  },
  // 得到用户信息后的回调
  pageCb() {
    const { path } = this.globalData.initOpt
    if (path === 'pages/index/index') {
      wx.reLaunch({url: '/pages/examSec/index/index'})
    }
  },
})
