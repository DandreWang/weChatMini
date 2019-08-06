
import api, {fileUrl} from '../../../utils/require.js'
// 接口
const apis = {
   checkIsPrize:'web/activity/checkIsWinning',
   koiInfo:'web/activity/activitykoiInfo',
   checkIsOpenPrize:'web/activity/checkIsTakePartIn'
}
// 图片
const staticImg = {
  openbg: fileUrl + "jinli/openbg.png",
  openwinning: fileUrl + "jinli/openwinning.gif",
  close: fileUrl + "jinli/close.png",
}
Component({
  /**
   * 组件的属性列表，使用组件时，传入的参数
   */
  properties: {
    name:{
      type:String,
      value:''
    }
  },
 
  /**
   * 组件的初始数据，组件内部的数据
   */
  data: {
    box:'none',
    interval:'',
    bgHeight:'',
    timeOut:'',
    staticImg: staticImg
  },
   //组件生命周期
   lifetimes: {
    created:function(){

    },
    // 在组件实例进入页面节点树时执行
    attached: function() {
      if (wx.getStorageSync('id')){
        this.checkStatus();
        this.getSystemMsg();
      }
     
    },
    // 在组件实例被从页面节点树移除时执行
    detached: function() {
      clearTimeout(this.data.timeOut)
    }
  },

  /**
   * 组件的方法列表，组件内部的方法
   */
  
  methods: {
    // check用户是否已报名，是否点击过开奖按钮
    checkStatus:function(){
      var that = this;
      var params = {};
      // activityId=2是锦鲤活动
      params.activityId = '2';
      params.userId = wx.getStorageSync('id');
      api.post(apis.checkIsOpenPrize, params).then((sres) => {
          if (sres.data.success){ 
            var resData = sres.data.data
            // debugger
            // 判断用户是否报过名
            if(resData.flag){
              // 用户已报名
              var lotteryTime = resData.lotteryTime
              var endTime = resData.endTime
              var nowTime = new Date().getTime()
              var timeBetween =  lotteryTime - nowTime
              var endSpace = endTime - nowTime   
              // 当前时间大于开奖时间小于活动结束时间
              if(nowTime >= lotteryTime){
                // 开奖时间到了，判断用户是否已开奖
                if(resData.isWinningCheck==1){
                    // 点击过开奖按钮
                    // status: 0-未报名显示报名按钮，1-已报名显示待开奖按钮，2-开奖时间到显示开奖按钮，3-显示中奖者信息
                    that.setData({
                       box:'none'
                    })
                }else{
                    // 没有点击开奖
                    that.setData({
                       box:'block'
                    })
                }
            }else{
                // 开奖时间未到，显示待开奖
                that.setData({
                   box:'none'
                })
                // 设置延迟定时器，到时间点显示开奖按钮
                that.data.timeOut=setTimeout(()=>{
                    that.setData({
                      box:'block'
                    })
                },timeBetween)
            }
            }else{
              // 用户未报名
              that.setData({
                box:'none'
              })
            }   
            // 不管用户是否报名是否开奖，活动结束时间到，显示活动已结束
            if(nowTime >= endTime){
              that.setData({
                box:'none'
              })
              clearTimeout(that.data.timeOut)
            }else{
              setTimeout(()=>{
                that.setData({
                  box:'none'
                })
                clearTimeout(that.data.timeOut)
              },endSpace)
            }    
          }else{
            wx.showToast({
              title: sres.data.msg,
              icon: 'none',
              duration: 2000
            })  
          }
        }).catch((fres) => {
          api.timeoutErr();
      });
    },
    // 获取页面宽度
    getSystemMsg:function(){
      var that = this;
      wx.getSystemInfo({
        success (res) {
          console.log(res.windowHeight)
          var windowWidth = res.windowWidth;
          var imgHeight = windowWidth * 1.33;
          that.setData({
            bgHeight : imgHeight
          })
        }
      })
    },
    // 点击开奖按钮
    openPrize:function(){
      var that = this;
      var params = {};
      // activityId=2是锦鲤活动
      params.activityId = '2';
      params.userId = wx.getStorageSync('id');
      api.post(apis.checkIsPrize, params).then((sres) => {
          if (sres.data.success){           
            if(sres.data.data){
              // 中奖了            
              wx.navigateTo({
                url: '../../koi/prizeDraw/prizeDraw'
              })
            }else{
              // 未中奖
              wx.navigateTo({
                url: '../../koi/prizeNone/prizeNone'
              })
            } 
            that.setData({
              box:'none'
            })
          }else{
            wx.showToast({
              title: sres.data.msg,
              icon: 'none',
              duration: 2000
            })  
          }
        }).catch((fres) => {
          api.timeoutErr();
      });
    },
    close:function(){
      this.setData({
        box:'none'
      })
    }
  }
})
