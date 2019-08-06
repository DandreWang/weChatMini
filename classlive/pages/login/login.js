import api from '../../utils/require.js'

//获取应用实例
const app = getApp();
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getPhoneNumber'),
  },
  onShow() {
    wx.login({
      success: res => {
        api.post(`user/jscode2session/${res.code}/CLASSLIVE`).then(sres => {
            const {openId, sessionKey} = sres.data.data;
            wx.setStorageSync('openId', openId);
            wx.setStorageSync('sessionKey', sessionKey);
        }).catch(res => {
          api.timeoutErr();
        })
      },
      fail: res => {
        console.log('微信登录失败')
      }
    })
  },
  getUserInfo : function (){
    wx.getUserInfo({
      success: (res) => {
        wx.reLaunch({
          url: '../welcome/welcome'
        });
      }
    })
  }
})