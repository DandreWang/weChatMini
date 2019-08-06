import md5 from 'md5.js';
const API = 'https://www.vipboluo.com/';
const appId = 'wx9cf5285162aae274';
const code = 'blzx';
const sshd = '123456';
// 时间戳
const timestamp = () => Date.parse(new Date()) / 1000;

// 签名
const sign = () => md5.md5(code + time + sshd);

const get = (cmd, params, callback) => {
  params.token = wx.getStorageSync('token') || ''
  params.appId = appId
  wx.request({
    url: API + cmd,
    data: params,
    header: {
      'time': timestamp(),
      'sign': sign(),
      'phpssid': getApp().globalData.phpssid,
      'mini-apps': 'notices',
    },
    success: (res) => {
      const data = res.data
      if (typeof (callback) == 'function')
        callback(data)
    }
  })
}
// 登录专用 post
const post_app = (cmd, params, callback) => {
  params.token = wx.getStorageSync('token') || ''
  params.appId = appId
  wx.request({
    url: API + cmd,
    data: params,
    method: 'POST',
    header: {
      "Content-Type": "application/json",
      'time': timestamp(),
      'sign': sign(),
      'mini-apps': 'notices',
    },
    success: (res) => {
      const data = res.data
      if (typeof (callback) == 'function')
        callback(data)
    }
  })
}
// 不加appid的post
const post = (cmd, params, callback) => {
  wx.request({
    url: API + cmd,
    data: params,
    method: 'POST',
    header: {
      "Content-Type": "application/json",
      'time': timestamp(),
      'sign': sign(),
      'phpssid': getApp().globalData.phpssid,
      'mini-apps': 'notices',

    },
    success: (res) => {
      const data = res.data
      if (typeof (callback) == 'function')
        callback(data)
    }
  })
}
const upload = (cmd, params, refer, callback) => {
  wx.uploadFile({
    url: API + cmd, //仅为示例，非真实的接口地址
    filePath: params,
    name: 'file',
    formData: refer,
    header: {
      'time': timestamp(),
      'sign': sign(),
      'phpssid': getApp().globalData.phpssid,
      'mini-apps': 'notices',
    },
    success: (res) => {
      const data = res
      if (typeof (callback) == 'function')
        callback(data)
    }
  })
}
// 非空验证
const message = (e) => {
  wx.showToast({
    title: e,
    icon: 'none',
    duration: 2000,
    mask: true,
  });
}
// 加载中
const loading = (e) => {
  wx.showLoading({
    title: e,
    icon: 'loading',
    mask: true,
  })
}
// 返回上一页
const retu = (e) => {
  wx.navigateBack({
    delta: e
  })
}



export default {
  sign: sign,
  get,
  post,
  post_app,
  upload,
  message,
  retu,
  loading,
}
