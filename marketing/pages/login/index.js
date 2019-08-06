//index.js
import http from '../../utils/request'
const regeneratorRuntime = require('../../utils/runtime');
//获取应用实例
const app = getApp();

Page({
  data: {
    // 用户信息
    allInfo: null,
    // 登陆code
    code: '',
    // 版本验证
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad() {
    // 登录
    wx.login({
      success: res => {
        const {code, errMsg} = res;
        if (code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          this.setData({
            code
          })
          this.userInfoCallback();
        } else {
          wx.showToast({title: '登录失败！' + errMsg, icon: 'none'})
        }
      }
    });
    // 获取用户信息
    wx.getSetting({
      success: setInfo => {
        if (setInfo.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: allInfo => {
              // 可以将 res 发送给后台解码出 unionId
              this.setData({
                allInfo
              })

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(allInfo)
              }
            }
          });
        }
      }
    })
  },
  getUserInfo(e) {
    const {detail: {errMsg}, detail} = e;
    if (errMsg.indexOf('fail') === -1) {
      this.pageDataLoad(detail);
    }
  },
  // 得到用户信息后（触发事件汇总）
  userInfoCallback() {
    // 用户信息
    const {allInfo, canIUse} = this.data;
    if (allInfo) {
      this.pageDataLoad(allInfo);
    } else if (canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.pageDataLoad(res);
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          this.pageDataLoad(res);
        }
      });
    }
  },
  // 由于判断环境接口为异步，故此设置回调
  pageDataLoad(userData) {
    app.firstCallback(() => {
      http.register({
        code: this.data.code,
        userData,
        success: res => {
          app.pageCb(res);
        }
      })
    })
  },
});
