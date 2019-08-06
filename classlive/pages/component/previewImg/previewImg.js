
const app = getApp();

Component({
  properties: {
    url:{
      type:String,
      value:'',
      observer: function (newVal, oldVal) {
        this.setData({
          url:newVal
        })
      }
    },
    previewUrl:{
      type:String,
      value:''
    }
  },
  //组件生命周期
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function () {

    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    url:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    previewimg:function(){
      wx.previewImage({
        current: this.data.url, // 当前显示图片的http链接   
        urls: [this.data.previewUrl] // 需要预览的图片http链接列表   
      }) 
    }
  }
})
