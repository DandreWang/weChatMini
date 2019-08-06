import http from '../../../utils/request'
import {shareLink} from '../../../utils/api.js'
Page({
    data:{
        imgUrl: '',
        url:'',
        userInfo:'',
        avatarUrl:''
    },
    onLoad:function(){
        this.setData({
            userInfo:wx.getStorageSync('userData').userInfo
        })
        const userInfo = wx.getStorageSync('userData')
        http.post('searchSchool', {
            quizId: 1,
            userId: userInfo.id
          }).then(res => {
            this.setData({
                imgUrl:res.data.images
            })
            this.drawImage(); 
        });       
    },
    canvasIdErrorCallback: function (e) {
        console.error(e.detail.errMsg)
    },
    drawImage() {
        wx.showToast({
            title: '生成图片中...',
            icon:'loading',
            duration: 60000,
        }); 
        const that = this;
        // 绘制图片之前需要先下载到本地，不然绘制出来是空白
        wx.downloadFile({
            url: that.data.userInfo.avatarUrl,
            success: function (res) {
                that.setData({
                    avatarUrl:res.tempFilePath
                }) 
                wx.downloadFile({
                    url: that.data.imgUrl,
                    success: function (res) {
                        that.setData({
                            imgUrl:res.tempFilePath
                        })  
                        that.draw() 
                    }, 
                    fail: function (err) {
                        console.log(err)
                    }
                })   
            }, 
            fail: function (err) {
                console.log(err)
            }
        })                 
    },
    draw:function(){
        var that = this;
        const {imgUrl,avatarUrl} = this.data
        const {nickName} =this.data.userInfo
        // 使用 wx.createContext 获取绘图上下文 ctx
        var ctx = wx.createCanvasContext('firstCanvas')      
        // 绘制背景
        ctx.save()  
        ctx.drawImage(imgUrl, 0, 0, 750, 1366, 0, 0) 
        ctx.setFillStyle('#5A5A5A')
        ctx.setFontSize(20)
        ctx.setTextAlign('center')
        ctx.fillText(nickName, 300, 180)
        ctx.save()
        ctx.beginPath()
        //先画个圆
        ctx.arc(180, 180, 44, 0, Math.PI * 2, false);
        ctx.clip()
        //绘制头像
        ctx.drawImage(avatarUrl,136,136, 88 ,88)      
        ctx.restore() 
        ctx.draw()
        setTimeout(function(){
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: 750,
                height: 1366,
                canvasId: 'firstCanvas',
                success: function (res) {
                    that.setData({
                        url:res.tempFilePath
                    })
                    wx.showToast({
                        title: '生成成功',
                        icon:'loading',
                        duration: 1000,
                    });
                },
                fail: function (err) {
                    console.log(err)
                }
            })
        },1000)     
    }, 
    saveImage:function(){
        wx.showToast({
            title: '保存中...',
            icon:'loading',
            duration: 60000,
        }); 
        var that = this;  
        wx.saveImageToPhotosAlbum({
            filePath: that.data.url,
            success(res) {  
                wx.showToast({
                    title: '保存成功',
                    icon:'none',
                    duration: 1000,
                });
            },
            fail(err) {
                if(err.errMsg === "saveImageToPhotosAlbum:fail auth deny"){
                    wx.openSetting({
                        success(res) {
                          console.log(res.authSetting)
                        }
                      })
                }
            }     
        })        
    },
    previewImage:function(){
        wx.previewImage({
            current: this.data.url, // 当前显示图片的http链接   
            urls: [this.data.url] // 需要预览的图片http链接列表   
        }) 
    },
    onShareAppMessage(res){
        return shareLink('/pages/index/index','世界名校Offer大作战！快来测测你能拿到哪所学校的Offer！天呐，我居然是哈佛大学！不服来战！')
    }  
})