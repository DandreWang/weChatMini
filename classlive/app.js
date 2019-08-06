//app.js
import { baseUrl } from 'utils/require'
import api from 'utils/require.js'
App({
  data: {
    token: '',
    openid: '',
    unionid:'',
    id:'',
    type:'',
    baseUrl,
    userInfo:'',
    isIphoneX:false,
  },
  onLaunch: function() {
     //检测是否授权 未授权跳转登录页
    const authorize = api.checkAuthorize()
    if (!authorize) return;
    this.data = { ...this.data, ...authorize }
    wx.getSystemInfo({
      success: res => {
        if (res.model.indexOf('iPhone X')!=-1) {
          this.data.isIphoneX = true;
        }
      }
    })　
  },
  onShow:function(){
    //检测是否授权 未授权跳转登录页
    const authorize = api.checkAuthorize()
    if (!authorize) return;
    this.data = { ...this.data, ...authorize }
  },
  globalData: {
    socketConnectFail: false,
  }
})