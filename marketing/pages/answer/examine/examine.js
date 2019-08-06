import {imgUrl,shareLink} from '../../../utils/api.js'
import http from '../../../utils/request'
Page({
    data:{
        imgUrl:imgUrl + 'answer/',
        num:0,
        progress:0,
        canSubmit:false,
        items: [
            {
                id:1,
                img:'banner1.png',
                question:'1、你收到了一份超棒的高校offer，你希望通知书的颜色是？',
                answer:[
                    {name: '1-A', value: 'A.红'},
                    {name: '1-B', value: 'B.绿'},
                    {name: '1-C', value: 'C.蓝'}
                ]
            },
            {
                id:2,
                img:'banner2.png',
                question:'2、收拾行李前往你梦中的象牙塔吧！以下物品你必须带的是？',
                answer:[
                    {name: '2-A', value: 'A.零食'},
                    {name: '2-B', value: 'B.相机 '},
                    {name: '2-C', value: 'C.书'},
                    {name: '2-D', value: 'D.日记本'}
                ]
            },
            {
                id:3,
                img:'banner3.png',
                question:'3、长时间的飞行让你百无聊赖，此时你面前有4本书，你会选择哪本来阅读？',
                answer:[
                    {name: '3-A', value: 'A.罗密欧与朱丽叶'},
                    {name: '3-B', value: 'B.麦田里的守望者 '},
                    {name: '3-C', value: 'C.少女安妮'},
                    {name: '3-D', value: 'D.荆棘鸟'},
                ]
            },
            {
                id:4,
                img:'banner4.png',
                question:'4、到达学校后，五花八门的社团让你挑花了眼，此时你会选择加入？',
                answer:[
                    {name: '4-A', value: 'A.击剑社'},
                    {name: '4-B', value: 'B.语言社'},
                    {name: '4-C', value: 'C.合唱团'},
                    {name: '4-D', value: 'D.数学俱乐部'},
                ]
            },
            {
                id:5,
                img:'banner5.png',
                question:'5、迎新party上，学长学姐们送给你了一个小礼物，你希望是？',
                answer:[
                    {name: '5-A', value: 'A.文化衫'},
                    {name: '5-B', value: 'B.校园指南'},
                    {name: '5-C', value: 'C.红包'},
                    {name: '5-D', value: 'D.当地特产'},
                ]
            }
        ],
        text:'下一题',
        select:[],
        checkAnswer:'',
        randomSchool:'',
    },
    radioChange(e) {
        const {num , select} = this.data
        const {value} = e.detail
        
        if(select[num] == undefined){
            select.push(value)
        }else{
            select.splice(num,1,value);
        }    
        this.setData({
            progress:20*(select.length)
        })  
        this.complete()
    },
    complete(){
        if(this.data.num == 4){
            this.setData({
                canSubmit:true
            })          
        }else{
            this.setData({
                canSubmit:false
            })  
        }
    },
    prev(){
        this.setData({
            num:this.data.num-1,            
        })
        if(this.data.num <0){
            this.setData({
                num:0,            
            })
            wx.showToast({
                title: '已在第一题',
                icon: 'none',
                duration: 1000
            })
        }
        this.complete()
    },
    next(){   
        const {num , select} = this.data
        if(select[num] == undefined){
            wx.showToast({
                title: '请选择',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if(select[2] !== undefined){
            const length = select[2].length - 1
            const check = select[2].charAt(length)
            const random = this.random(1,100)
            this.setData({
                checkAnswer:check
            })
            const schoolImg = `${this.data.imgUrl}school/`
            if(check == 'A'){
                // A英国类学校
                if(random >0 && random <25){
                    this.setData({
                        randomSchool: schoolImg+'ldzj.png'
                    })
                }
                if(random >=25 && random < 50){
                    this.setData({
                        randomSchool: schoolImg+'dglg.png'
                    })
                }
                if(random >=50 && random <75){
                    this.setData({
                        randomSchool: schoolImg+'adb.png'
                    })
                }
                if(random >=75 && random <= 100){
                    this.setData({
                        randomSchool: schoolImg+'jq.png'
                    })
                }
            }
            if(check == 'B'){
                // A美国类学校
                if(random >0 && random <25){
                    this.setData({
                        randomSchool: schoolImg+'dl.png'
                    })
                }
                if(random >=25 && random < 50){
                    this.setData({
                        randomSchool: schoolImg+'hf.png'
                    })
                }
                if(random >=50 && random <75){
                    this.setData({
                        randomSchool: schoolImg+'yl.png'
                    })
                }
                if(random >=75 && random <= 100){
                    this.setData({
                        randomSchool: schoolImg+'mslg.png'
                    })
                }
            }
            if(check == 'C'){
                // A加拿大类学校
                if(random >0 && random <33){
                    this.setData({
                        randomSchool: schoolImg+'htl.png'
                    })
                }
                if(random >=33 && random < 66){
                    this.setData({
                        randomSchool: schoolImg+'mntb.png'
                    })
                }
                if(random >=66 && random <=100){
                    this.setData({
                        randomSchool: schoolImg+'mkmst.png'
                    })
                }
            }
            if(check == 'D'){
                // A澳洲类学校
                if(random >0 && random <25){
                    this.setData({
                        randomSchool: schoolImg+'xn.png'
                    })
                }
                if(random >=25 && random < 50){
                    this.setData({
                        randomSchool: schoolImg+'meb.png'
                    })
                }
                if(random >=50 && random <75){
                    this.setData({
                        randomSchool: schoolImg+'adly.png'
                    })
                }
                if(random >=75 && random <= 100){
                    this.setData({
                        randomSchool: schoolImg+'ksl.png'
                    })
                }
            }
        }
        this.setData({
            num:this.data.num+1,            
        })
        if(this.data.select[4] !== undefined){
            this.complete()
        }
        
    },
    submit(){
        const { randomSchool } = this.data
        const userData = wx.getStorageSync('userData')
        http.post('saveAnswer', {
            createBy: userData.id,
            images: randomSchool,
            quizId: 1,
            userId: userData.id
          }).then(res => {
            wx.navigateTo({
                url: '../school/school'
            }); 
        }).catch(err => {
            wx.navigateTo({
                url: '../school/school'
            });
        });  
    },
    random:function(m,n){
        var num = Math.floor(Math.random()*(m - n) + n);
　　    return num;
    },
    onShareAppMessage(res){
        return shareLink('/pages/index/index','世界名校Offer大作战！快来测测你能拿到哪所学校的Offer！天呐，我居然是哈佛大学！不服来战！')
    } 

})