
import api from '../../../utils/require.js'

const app=getApp()


const apis = {
  checkSign:'web/activity/checkIsTakePartIn'
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    state:{
      type: Boolean,
      value:false,
      observer: function (newVal, oldVal){
        this.checksign()
      }
    }
  },
  //组件生命周期
  lifetimes: {
    created: function () {

    },
    // 在组件实例进入页面节点树时执行
    attached: function () {
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    baseUrl: app.data.baseUrl,
    signKoiStatus:'none',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭弹窗
    closeWin:function(){
      this.setData({
        signKoiStatus: 'none'
      })
    },
    // 点击打开表单
    showForm:function(){
      this.closeWin();
      // 调用父组件 打开表单方法
      this.triggerEvent('signupevent', {})
    },
    // 获取用户是否报名状态
    checksign:function(){
      let params = {};
      params.activityId = '2';
      params.userId = wx.getStorageSync('id');
      api.post(apis.checkSign, params).then((sres) => {
        const {success,data}=sres.data;
        const timeout = (data.signUpEndTime - new Date().getTime())>0
        if (success) {
          if (data.flag === false && timeout){
            this.setData({
              signKoiStatus: 'block'
            })
          }
        } else {
          wx.showToast({
            title: sres.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }).catch((fres) => {
        console.log(fres)
        wx.showToast({
          title: '请求超时',
          icon: 'none',
          image: '../../images/x.png',
          duration: 1000,
          mask: true
        })
      });
    }
  }
})
