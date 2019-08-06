import http from '../../../utils/request'
const regeneratorRuntime = require('../../../utils/runtime');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    success: {
      type: Function,
      value: () => {},
    },
    error: {
      type: Function,
      value: () => {},
    },
  },
  externalClasses: ['cls'],
  //组件生命周期
  lifetimes: {
    created() {
    },
    // 在组件实例进入页面节点树时执行
    attached() {
      this.getUserData()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    code: '',
    userData: null,
    phoneData: null,
    flg: false
  },

  // 在组件实例进入页面节点树时执行
  attached() {
    this.getUserData()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserData() {
      const { mobile } = wx.getStorageSync('userData')
      if (mobile) {
        return this.setData({flg : true})
      }
      // 登录
      wx.login({
        success: res => {
          const {code, errMsg} = res;
          if (code) {
            // 用户信息
            wx.getUserInfo({
              success: userData => {
                // 可以将 res 发送给后台解码出 unionId
                this.setData({
                  userData, code
                }, () => {
                  this.setInfo()
                })
              }
            });
          } else {
            console.log('授权失败！' + errMsg)
          }
        }
      });
    },
    getPhoneNumber(e) {
      const {detail, detail: {errMsg}} = e
      if (/(deny)|(cancel to confirm login)/ig.test(errMsg)) {
        return wx.showToast({title: '请先确认授权', icon: 'none'})
      }
      this.setData({
        phoneData: detail
      }, () => {
        this.setInfo()
      })
    },
    setInfo() {
      const {code, userData, phoneData, success, error} = this.data;
      if (code && userData && phoneData) {
        if (phoneData.encryptedData) {
          http.register({
            code, userData, phoneData,
            success: res => {
              typeof success === 'function' && success(res)
            },
            error: err => {
              typeof error === 'function' && error(err)
            }
          })
        } else {
          typeof success === 'function' && success(userData)
        }
      }
    },
    sucCb() {
      const {userData, success} = this.data;
      typeof success === 'function' && success(userData)
    }
  }
})
