import http from '../../../utils/request'
import {imgUrl,shareLink} from '../../../utils/api.js'
Page({
    data:{
        schoolImg: '',
        imgUrl: imgUrl + 'answer/',
        userInfo:''
    },
    onLoad(){
        this.setData({
            userInfo:wx.getStorageSync('userData').userInfo
        })
        const userInfo = wx.getStorageSync('userData')
        http.post('searchSchool', {
            quizId: 1,
            userId: userInfo.id
          }).then(res => {
            this.setData({
                schoolImg:res.data.images
            })
        });   
    },
    // 点击定制升学方案
    goForm(){
        wx.navigateTo({
            url: '../form/form'
        }); 
    },
    // 点击跳转到分享朋友圈页面
    goShare:function(){
        wx.navigateTo({
            url: '../share/share'
        })
    }, 
    onShareAppMessage(res){
        return shareLink('/pages/index/index','世界名校Offer大作战！快来测测你能拿到哪所学校的Offer！天呐，我居然是哈佛大学！不服来战！')
    }   
})