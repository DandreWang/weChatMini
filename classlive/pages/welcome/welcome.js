const app = getApp()
import api from '../../utils/require.js'

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getPhoneNumber'),
    code: '',
  },
  //获取手机号
  getPhoneNumber(e) {
    const {detail, detail: {errMsg}} = e
    if (/(deny)|(cancel to confirm login)/ig.test(errMsg)) {
      return wx.showToast({title: '请先确认授权', icon: 'none'})
    }
    wx.getUserInfo({
      success: (res) => {
        this.decodeData(res, detail)
      }
    })
  },
  decodeData(res, phoneDetail) {
    const sessionKey = wx.getStorageSync('sessionKey');
    const {encryptedData, iv, userInfo} = res;
    const {encryptedData: phoneEncrypted, iv: phoneIv} = phoneDetail
    const postdata = {
      encrypted: encryptedData,
      iv,
      sessionKey,
      phoneEncrypted,
      phoneIv
    }
    api.post("user/decoding", postdata).then(sres => {
      const {data: {id, openid, type, unionid}, data} = sres.data;
      Object.assign(app.data, {
        userInfo,
        ...data
      });
      wx.setStorageSync('id', id);
      wx.setStorageSync('unionid', unionid);
      wx.setStorageSync('type', type);
      wx.setStorageSync('userInfo', userInfo);
      wx.reLaunch({
        url: '../index/index'
      });
    }).catch(res => {
      api.timeoutErr();
    })
  },

})