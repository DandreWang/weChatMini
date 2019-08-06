import http from '../../../utils/request'
import {imgUrl,shareLink} from '../../../utils/api.js'
Page({
    data:{
        imgUrl: imgUrl + 'answer/',
    },
    submitForm(e){
        const value = e.detail.value
        var mobile = /^1\d{10}$/;
        var isMobile = mobile.exec(value.phone);
        if(!value.name){
            wx.showToast({
                title: '请输入姓名',
                icon: 'none',
                duration: 2000
            })  
            return
        }
        if(value.phone.length != 11 || !isMobile){
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none',
                duration: 2000
            })  
            return
        }
        if(!value.grade){
            wx.showToast({
                title: '请输入年级',
                icon: 'none',
                duration: 2000
            })  
            return
        }
        const userData = wx.getStorageSync('userData')
        const userInfo = userData.userInfo
        const {name, phone , grade} = value
        http.post('submit', {
            activityId: 3,
            userName: name,
            gradeName: grade,
            mobile: phone,
            userId: userData.id,
            image:userInfo.avatarUrl,
            school:" "
          }).then(res => {
            wx.showToast({
                title: '报名成功',
                icon: 'none',
                duration: 2000
            })
            value.name= " ";
            value.phone= " ";
            value.grade=" ";
            setTimeout(() => {
                wx.reLaunch({
                    url: '../school/school'
                });
            }, 1500); 
        }).catch(err => {
            console.log(err)
        });  
    },
    onShareAppMessage(res){
        return shareLink('/pages/index/index','世界名校Offer大作战！快来测测你能拿到哪所学校的Offer！天呐，我居然是哈佛大学！不服来战！')
    } 
})