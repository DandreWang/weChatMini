const app = getApp();
var websocket = require('../../utils/websocket.js');
import api from '../../utils/require.js'
import utils from '../../utils/util.js';
let heartCheck = {
    timeout: 10000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function () {
        this.timeoutObj = setTimeout(() => {
            wx.sendSocketMessage({
                data: "1",
                // success(){
                //  console.log("发送ping成功");
                // }
            });
            this.serverTimeoutObj = setTimeout(() => {
                wx.closeSocket();
            }, this.timeout);
        }, this.timeout);
    }
};
const myaudio = wx.createInnerAudioContext();
Page({
    data: {
        hideHeader: true,
        refreshTime: '', // 刷新的时间
        refreshStatus: false,
        windowHeight: '',
        userInfo: {},
        hasUserInfo: false,
        luStatu: false,//di'bu
        newslist: [],
        teacherData:[],
        width: 0,
        config: {
            adnote:""
        },
        scrollTop:"",
        bottom:"0rpx",
        byBottom:"0rpx",
        padBottom: 88,
        note:[
            '1、听不到声音请往下翻点击语音即可播放，并确认手机没有静音，若不行可切换网络；',
            '2、遇到卡顿或者加载不出，请尝试重新进入；',
            '3、大家可在下方评论框发起提问和交流； ',
            '4、课程语音永久保存，无线复听；'
        ],
        tabber:[
            {
                id:"speak",
                img:"speak",
                imgSelected:"speak_selected",
                open:false,
                selected:false
            },
            {
                id: "word",
                img: "word",
                imgSelected: "word_selected",
                open: false,
                selected: false
            },
            {
                id: "img",
                img: "img",
                imgSelected: "img_selected",
                open: false,
                selected: false
            },
            {
                id: "more",
                img: "more",
                imgSelected: "more_selected",
                open: false,
                selected: false
            },
        ],
        imgBtn:[
            {
                id:1,
                img:"img_img",
                word:"图片",
                op:"chooseimage"
            },
            {
                id: 2,
                img: "img_video",
                word: "视频",
                op: "choosevideo"
            },
            // {
            //   id: 3,
            //   img: "img_music",
            //   word: "音乐",
            //   op: "chooseimage"
            // }
        ],
        record: {
            text: "按住说话",
            type: "record",
            src:"../../images/speakBtn.png"
        }, //与录音相关的数据结构
        recorderManager: wx.getRecorderManager(), //录音管理上下文
        startPoint: {}, //记录长按录音开始点信息,用于后面计算滑动距离。
        sendLock: true, //发送锁，当为true时上锁，false时解锁发送
        textarea:'',
        tempFilePaths:[],
        video:'',
        baseUrl: app.data.baseUrl,
        isIphoneX: app.data.isIphoneX,
        pageNum: '',
        allPages: '',
        pageSize: 10,
        courseId:'',
        courseData:[],
        listArry:[],
        appType: '',
        speakStatus: true,
        userId: '',
        yuyinIcon: '',
        viceUserIds:[],
        UserIdsStatus:false,
        curTeacherData:[]
    },
    switchChange: function (e) {
        let params = '';
        let content = '';
        let statusNum = '';
        // type: 4 禁言 5 自由发言
        console.log(e.detail.value);
        e.detail.value ? params = 4 : params = 5;
        statusNum = e.detail.value ? 1 : 0;
        content = e.detail.value!=1 ? "发起了全员禁言" : "解除了全员禁言";
        console.log('{ "courseId": ' + this.data.courseId + ', "statement": "' + this.data.userInfo.nickName + '在' + utils.formatTime(new Date(), 'Y-M-D h:m:s') + content + '", "createTime": ' + Date.parse(new Date()) + ',"type":'+params+', "userNickname": "' + this.data.userInfo.nickName + '", "images": "' + this.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
        websocket.send('{ "courseId": ' + this.data.courseId + ', "statement": "' + this.data.userInfo.nickName + '在' + utils.formatTime(new Date(), 'Y-M-D h:m:s') + content + '", "createTime": ' + Date.parse(new Date()) + ',"type":' + params +', "userNickname": "' + this.data.userInfo.nickName + '", "images": "' + this.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
        api.post("user/findteacher/" + this.data.courseId + "/" + statusNum, '').then((sres) => {
        }).catch((fres) => {
            console.log(fres);
            wx.showToast({
                title: '请求超时',
                icon: 'fail',
                image: '../../images/x.png',
                duration: 1000,
                mask: true
            })
        });
        // let title = '';
        // if (e.detail.value == 4) {
        //   title = "你解除了全员禁言！";
        // } else if (e.detail.value == 5) {
        //   title = "你发起了全员禁言！";
        // }
        // setTimeout(() => {
        //   wx.showToast({
        //     title: title,
        //     icon: "none",
        //     duration: 3000
        //   })
        //   setTimeout(() => {
        //     wx.hideToast();
        //   }, 3000)
        // }, 0);
        console.log(params);
    },
    onLoad: function(options) {
        var that = this;
        var date = new Date();
        console.log(options,'000000');
        //获取屏幕高度
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    windowHeight: res.windowHeight
                })
                console.log("屏幕高度: " + res.windowHeight)
            }
        })

        console.log(app.data.id);
        var bottom = this.data.isIphoneX ? '68rpx' : '0rpx'
        this.setData({
            appType: app.data.type,
            userId: app.data.id,
            refreshTime: date.toLocaleTimeString(),
            bottom: bottom
        })
        if (app.data.userInfo) {
            this.setData({
                userInfo: app.data.userInfo,
                courseId: options.id
            })
        }
        api.post("user/findteacher/" + options.userId, '').then((sres) => {
            console.log(sres.data.data, that);
            that.setData({
                teacherData: sres.data.data
            })
            console.log(that.data.teacherData.id, '111', that.data.userId, app.data.type)
            if (app.data.type == 1 && that.data.teacherData.id == that.data.userId) {
                console.log(1, that.data.teacherData.id, that.data.userId);
                this.setData({
                    tabber: [
                        {
                            id: "speak",
                            img: "speak",
                            imgSelected: "speak_selected",
                            open: false,
                            selected: false
                        },
                        {
                            id: "word",
                            img: "word",
                            imgSelected: "word_selected",
                            open: false,
                            selected: false
                        },
                        {
                            id: "img",
                            img: "img",
                            imgSelected: "img_selected",
                            open: false,
                            selected: false
                        },
                        {
                            id: "more",
                            img: "more",
                            imgSelected: "more_selected",
                            open: false,
                            selected: false
                        },
                    ]
                })
            } else {
                console.log(2, that.data.teacherData.id, that.data.userId);
                this.setData({
                    tabber: [
                        {
                            id: "word",
                            img: "word",
                            imgSelected: "word_selected",
                            open: false,
                            selected: false
                        }
                    ]
                })
            }
        }).catch((fres) => {
            console.log(fres);
            wx.showToast({
                title: '请求超时',
                icon: 'fail',
                image: '../../images/x.png',
                duration: 1000,
                mask: true
            })
        });
        api.get("course/info/" + options.id, '').then((sres) => {
            console.log(sres.data.data, that);
            let status = sres.data.data.status != 1 ? false : true;
            that.setData({
                speakStatus: status,
                courseData: sres.data.data,
                viceUserIds: sres.data.data.viceUserIds
            })
            for (var i in that.data.viceUserIds){
                this.isTeacher(that.data.viceUserIds[i].id)
            }
            console.log(that.data.speakStatus, "speakStatus")
        }).catch((fres) => {
            console.log(fres);
            wx.showToast({
                title: '请求超时',
                icon: 'fail',
                image: '../../images/x.png',
                duration: 1000,
                mask: true
            })
        });




        //历史记录
        this.chatRecord(options.id);
        //调通接口
        this.webSocket();
        wx.getRecorderManager().onStop(res => {
            if (this.sendLock) {
                //上锁不发送
            } else {//解锁发送，发送网络请求
                // if (res.duration < 1000)
                //   wx.showToast({
                //     title: "录音时间太短",
                //     icon: "none",
                //     duration: 1000
                //   });
                // else this.contents = [...this.contents, { type: "record", content: res }];//contents是存储录音结束后的数据结构,用于渲染.
            }
        });
    },
    // 页面卸载
    onUnload() {
        wx.closeSocket();
        wx.showToast({
            title: '您已离开直播间~',
            icon: "none",
            duration: 2000
        })
    },
    //讲师判断
    isTeacher(id) {
        var that = this;
        api.post("user/findteacher/" + id, '').then((sres) => {
            let UserIds = [];
            for (var i in that.data.viceUserIds){
                UserIds.push(that.data.viceUserIds[i].id == that.data.userId ? true : false)
                if (that.data.viceUserIds[i].id == that.data.userId){
                    that.setData({
                        curTeacherData: that.data.viceUserIds[i]
                    })
                }
            }
            that.setData({
                UserIdsStatus: UserIds.indexOf(true) != -1
            })
            console.log(UserIds, UserIds.indexOf(true)!=-1);
            if (app.data.type == 1 && (UserIds.indexOf(true) != -1 || that.data.teacherData.id == that.data.userId)) {
                console.log(1, that.data.teacherData.id, that.data.userId);
                this.setData({
                    tabber: [
                        {
                            id: "speak",
                            img: "speak",
                            imgSelected: "speak_selected",
                            open: false,
                            selected: false
                        },
                        {
                            id: "word",
                            img: "word",
                            imgSelected: "word_selected",
                            open: false,
                            selected: false
                        },
                        {
                            id: "img",
                            img: "img",
                            imgSelected: "img_selected",
                            open: false,
                            selected: false
                        },
                        {
                            id: "more",
                            img: "more",
                            imgSelected: "more_selected",
                            open: false,
                            selected: false
                        },
                    ]
                })
            } else {
                console.log(2, that.data.teacherData.id, that.data.userId);
                this.setData({
                    tabber: [
                        {
                            id: "word",
                            img: "word",
                            imgSelected: "word_selected",
                            open: false,
                            selected: false
                        }
                    ]
                })
            }
        }).catch((fres) => {
            console.log(fres);
            wx.showToast({
                title: '请求超时',
                icon: 'fail',
                image: '../../images/x.png',
                duration: 1000,
                mask: true
            })
        });
    },
    //webSocket
    webSocket() {
        var that = this;
        websocket.connect('websocketmore/' + that.data.courseId,that.data.userInfo, function (res) {
            // console.log(JSON.parse(res.data))
            var list = [], message='';
            var statusNum = '';
            list = that.data.newslist;
            var message = JSON.parse(res.data)
            if (!(message.type == 4 || message.type == 5)){
                console.log(666, message.type);
                message.createTime = utils.formatTime(message.createTime, 'Y-M-D h:m');
                list.push(message);
                statusNum = message.type == 4 ? true : false;
                that.setData({
                    speakStatus: statusNum
                })
                console.log(that.data.speakStatus, 'speakStatus', (that.data.speakStatus == false && that.data.appType == 2) ? 'block' : 'none')
            }
            console.log(list);

            that.setData({
                newslist: list
            })
            that.pageScrollToBottom();
        });
        wx.onSocketOpen(() => {
            console.log('WebSocket连接打开')
            heartCheck.reset().start()
        })
        wx.onSocketMessage(function (res) {
            console.log(res);
            var list = [];
            list = that.data.newslist;
            res.data = res.data.replace(/\n/g, "<br/>").replace(/\r/g, "\\r");
            var message = JSON.parse(res.data);
            if (message == "1") {
                heartCheck.reset().start()
            } else {
                var statusNum = '';
                //把数据放入变量allContentList中
                console.log(message, "禁言",6666);
                if (!(message.type == 4 || message.type == 5)) {
                    message.createTime = utils.formatTime(message.createTime, 'Y-M-D h:m');
                    console.log(message,'222');
                    if (message.courseId == that.data.courseId){
                        if (message.type == 1){
                            message.isPlay = false;
                        }
                        list.push(message);
                        that.setData({
                            newslist: list
                        })
                        that.pageScrollToBottom();
                    }

                }else{
                    console.log(message.type)
                    if (message.courseId == that.data.courseId) {
                        if (message.type == 4){
                            statusNum = true;
                        } else if (message.type == 5){
                            statusNum = false;
                        }
                        if (message.type == 4 || message.type == 5){
                            var list = that.data.tabber;
                            for(var i=0;i<list.length;i++){
                                list[i].selected = false;
                            }
                        }
                        // statusNum = message.type == 4 ? true : false;
                        console.log(message.type, statusNum);
                        var bottom = that.data.isIphoneX ? '68rpx' : '0rpx';
                        that.setData({
                            speakStatus: statusNum,
                            bottom: bottom,
                            tabber:list
                        })
                        if (app.data.type == 1 && that.data.teacherData.id == that.data.userId){

                            let title = '';
                            if (message.type == 4){
                                title = "你解除了全员禁言！";
                            } else if (message.type == 5){
                                title = "你发起了全员禁言！";
                            }
                            wx.showLoading();
                            wx.hideLoading();
                            setTimeout(() => {
                                wx.showToast({
                                    title: title,
                                    icon: "none",
                                    duration: 2000
                                })
                                setTimeout(() => {
                                    wx.hideToast();
                                }, 2000)
                            }, 500);

                        }
                    }
                }
            }

        });
        wx.onSocketError((res) => {
            console.log('WebSocket连接打开失败')
            this.reconnect()
        })
        wx.onSocketClose((res) => {
            console.log('WebSocket 已关闭！')
            this.reconnect()
        })
    },
    //短线重连
    reconnect() {
        if (this.lockReconnect) return;
        this.lockReconnect = true;
        clearTimeout(this.timer)
        if (this.data.limit < 12) {
            this.timer = setTimeout(() => {
                this.linkSocket();
                this.lockReconnect = false;
            }, 5000);
            this.setData({
                limit: this.data.limit + 1
            })
        }
    },
    //事件处理函数
    send: function () {
        var flag = this
        if (this.data.message.trim() == "") {
            wx.showToast({
                title: '消息不能为空哦~',
                icon: "none",
                duration: 2000
            })
        } else {
            setTimeout(function () {
                flag.setData({
                    increase: false
                })
            }, 500)
            console.log(333, '{ "content": "' + this.data.message + '", "date": "' + utils.formatTime(new Date(), 'h:m') + '","type":"text", "nickName": "' + this.data.userInfo.nickName + '", "avatarUrl": "' + this.data.userInfo.avatarUrl + '" }');
            websocket.send('{ "content": "' + this.data.message + '", "date": "' + utils.formatTime(new Date(), 'h:m') + '","type":"text", "nickName": "' + this.data.userInfo.nickName + '", "avatarUrl": "' + this.data.userInfo.avatarUrl + '" }');

            this.bottom()
        }
    },
    jump: function (event) {
        console.log(event.currentTarget.dataset);
        let src = event.currentTarget.dataset.src;
        wx.navigateTo({
            url: '../player/player?src=' + src + ''
        })
    },
    closeAd: function() {
        this.setData({
            config:{
                adnote:"none"
            }
        })
    },
    kindToggle: function (e) {
        var id = e.currentTarget.id, list = this.data.tabber;
        var that = this;
        for (var i = 0, len = list.length; i < len; ++i) {
            if (list[i].id == id) {
                list[i].selected = !list[i].selected;
                var bottom = list[i].selected ? that.data.isIphoneX ? "316rpx" : "248rpx" : that.data.isIphoneX ? "68rpx" : "0rpx";
                var padBottom = list[i].selected ? (that.data.isIphoneX ? 404 : 336) : (that.data.isIphoneX ? 156 : 88);
                var oldBottom = this.data.bottom;
                if(oldBottom != bottom){
                    this.pageScrollToBottom();
                }
                if (bottom === '248rpx' || bottom === '316rpx'){
                    wx.createSelectorQuery().select('#chatContent').boundingClientRect(function (rect) { // 使页面滚动到底部
                        console.log(rect, 666)
                        that.setData({
                            scrollTop: rect.height  // 这里我们的单对话区域最高1000，取了最大值，应该有方法取到精确的
                        });
                        wx.pageScrollTo({
                            scrollTop: rect.height,
                            duration: 1000
                        })
                    }).exec()
                }
                this.setData({
                    bottom: bottom,
                    padBottom: padBottom
                })

            } else {
                list[i].selected = false
            }
        }
        this.setData({
            tabber: list
        });

    },
    handleRecordStart: function (e){
        console.log("开始");
        console.log(e.touches[0]);
        //longpress时触发
        this.setData({
            startPoint: e.touches[0],
            record:{
                text: "松开发送",
                type: "recording",
                src:"../../images/speakBtn_selected.png"
            },
            sendLock: false
        })
        wx.getRecorderManager().start({
            format: 'mp3',
            duration: 60000
        });//开始录音
        wx.showToast({
            title: "正在录音",
            icon: "none",
            duration: 60000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
        });
        // this.data.sendLock = false;//长按时是不上锁的。
        var start = e.timeStamp;
        var seconds = (start % (1000 * 60)) / 1000;
        this.setData({
            start: seconds,
            luStatu: true,
        })
    },
    onShow: function (e) {
        var that = this;
        //  初始化录音对象
        this.recorderManager = wx.getRecorderManager();
        this.recorderManager.onError(function () {
            // that.tip("录音失败！")
            wx.showToast({
                title: "录音失败！",
                icon: "none",
                duration: 1000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
            });
            return false;
        });

        // 录音结束
        this.recorderManager.onStop(function (res) {
            var list = that.data.newslist;
            var width = that.data.width;
            var src = res.tempFilePath;
            console.log('list的1是', list)
            // console.log(src)

            var aa = {
                courseId: that.data.courseId,
                statement: res.tempFilePath,
                createTime: Date.parse(new Date()),
                type: 1,
                userNickname: that.data.userInfo.nickName,
                images: that.data.userInfo.avatarUrl,
                userId: app.data.id,
                userType: app.data.type
            }
            var params = '';
            params = res.tempFilePath;
            wx.uploadFile({
                url: that.data.baseUrl + 'file/upload',
                filePath: params,
                name: 'multipartFile',
                formData: { data1: "w", },
                success: function (res) {
                    var res = JSON.parse(res.data);
                    let userNickname = that.data.UserIdsStatus ? that.data.curTeacherData.userNickname : that.data.teacherData.userNickname;
                    websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.data.filename + '", "createTime": ' + Date.parse(new Date()) + ',"type":1, "userNickname": "' + userNickname + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
                    console.log(res.data.filename, 6666);
                    var aa = {};
                    aa.img = that.data.baseUrl + 'filesinfo/' + res.data.filename;
                    // tempFilePaths.push(that.data.baseUrl + 'filesinfo/' + res.data.filename);
                    // that.setData({
                    //   tempFilePaths: tempFilePath
                    // })
                    console.log(that);
                },
                fail: function (res) {
                    console.log("tt");
                }
            })
            // list.push(aa);
            console.log('list的2是', list);
            // websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.tempFilePath + '", "createTime": ' + Date.parse(new Date()) + ',"type":1, "userNickname": "' + that.data.userInfo.nickName + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
            // that.setData({
            //   newslist: list
            // })
            console.log(that.data.newslist, that.data.userInfo,1111111);
            // that.tip("录音完成！")
            //console.log(list)
        });
        var that = this;
        this.innerAudioContext = wx.createInnerAudioContext();
        this.innerAudioContext.onError((res) => {
            // that.tip("播放录音失败！")
            wx.showToast({
                title: "播放录音失败！",
                icon: "none",
                duration: 1000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
            });
        })
    },
    // 播放录音
    audioPlay: function (e) {
        var that = this;
        var src = e.currentTarget.dataset.src;
        var index = e.currentTarget.dataset.index;
        var list = that.data.newslist;
        myaudio.src = src;
        myaudio.autoplay = true;
        //切换显示状态
        console.log(list, that.data.newslist,this.data.newslist);
        for (var i = 0; i < list.length; i++) {
            list[i].isPlay = false;
        }
        list[index].isPlay = true;
        //开始监听
        myaudio.onPlay(() => {
            that.setData({
                newslist: list
            })
        })
        //结束监听
        myaudio.onEnded(() => {
            list[index].isPlay = false;
            that.setData({
                newslist: list,
            })
        })

        // for(var i= 0;i<list.length;i++){
        //   if(i==index){
        //     list[i].isPlay = true;
        //   }
        //   newlist.push(list[i]);
        // }
        // that.setData({
        //   newlist : newlist
        // })
        console.log(that.data.newslist);
        if (src == '') {
            // this.tip("失效")
            wx.showToast({
                title: "失效",
                icon: "none",
                duration: 1000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
            });
            return;
        }
        // this.setData({
        //   yuyinIcon:'../../images/teacher.gif'
        // })
        // console.log(this.data.yuyinIcon);
        // this.innerAudioContext.src = src;
        // this.innerAudioContext.play();
    },
    // 音频停止
    audioStop: function (e) {
        var that = this;
        var src = e.currentTarget.dataset.src;
        var index = e.currentTarget.dataset.index;
        var list = that.data.newslist;
        var newlist = [];
        //切换显示状态
        for (var i = 0; i < list.length; i++) {
            list[i].isPlay = false;
        }
        list[index].isPlay = false;
        myaudio.stop();
        //停止监听
        myaudio.onStop(() => {
            list[index].isPlay = false;
            that.setData({ newslist: list, })
        })
        //结束监听
        myaudio.onEnded(() => {
            list[index].isPlay = false;
            that.setData({ newslist: list, })
        })
    },
    pageScrollToBottom: function () {
        var that = this;
        wx.createSelectorQuery().select('#chatContent').boundingClientRect(function (rect) { // 使页面滚动到底部
            console.log(rect,666)
            that.setData({
                scrollTop: rect.height  // 这里我们的单对话区域最高1000，取了最大值，应该有方法取到精确的
            });
            wx.pageScrollTo({
                scrollTop: rect.height,
                duration: 1000
            })
        }).exec()
    },
    handleRecordStop(e) {
        // touchend(手指松开)时触发
        this.setData({
            record: {
                text: "长按录音",
                type: "record",
                src: "../../images/speakBtn.png"
            },
            sendLock: false
        })
        wx.hideToast();//结束录音、隐藏Toast提示框
        wx.getRecorderManager().stop();//结束录音
        var start = this.data.start;
        var end = e.timeStamp;
        var seconds = (end % (1000 * 60)) / 1000;
        var shijian = (seconds - start).toFixed(1);
        var width = shijian * 4;
        this.setData({
            end: seconds,
            shijian: shijian,
            luStatu: false,
            width: width
        })
    },
    // textBlur: function(e) {
    //   // this.setData({
    //   //   textarea: e.detail.value
    //   // })
    // },
    // textFocus: function (e) {
    //   console.log("textFocus" + e.detail.value);
    // },
    textareaInput: function (e) {
        this.setData({
            textarea: e.detail.value
        })
        // console.log("textareaInput" + e.detail.value);
    },
    // textConfirm: function (e) {
    //   console.log("textConfirm" + e.detail.value);
    // },
    // lineChange: function (e) {
    //   console.log("lineChange" + e.detail.value);
    // },
    getWordContent() {
        var that = this;
        if (this.data.textarea){
            // var list = this.data.newslist;
            var aa = {
                courseId: this.data.courseId,
                statement: this.data.textarea,
                createTime: Date.parse(new Date()),
                type: 1,
                userNickname: this.data.userInfo.nickName,
                images: this.data.userInfo.avatarUrl,
                userId: app.data.id,
                userType: app.data.type
            }
            if (app.data.type == 1 && (that.data.teacherData.id == that.data.userId || that.data.UserIdsStatus )){
                let userNickname = that.data.UserIdsStatus ? this.data.curTeacherData.userNickname : this.data.teacherData.userNickname;
                websocket.send('{ "courseId": ' + this.data.courseId + ', "statement": "' + this.data.textarea + '", "createTime": ' + Date.parse(new Date()) + ',"type":0, "userNickname": "' + userNickname + '", "images": "' + this.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
            }else{
                websocket.send('{ "courseId": ' + this.data.courseId + ', "statement": "' + this.data.textarea + '", "createTime": ' + Date.parse(new Date()) + ',"type":0, "userNickname": "' + this.data.userInfo.nickName + '", "images": "' + this.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
            }

            // list.push(aa);
            this.setData({
                // newslist: list,
                textarea: ""
            })
        }else{
            wx.showToast({
                title: "发送内容不能为空",
                icon: "none",
                duration: 1000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
            });
        }


    },
    onPageScroll: function (e) {
        let that = this;
        if (e.scrollTop==300){
            setTimeout(function () {
                that.closeAd();
            },3500)
        }
    },
    //选择图片
    chooseimage: function () {
        var that = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#CED63A",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('album')
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('camera')
                    }
                }
            }
        })

    },
    chooseWxImage: function (type) {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: [type],
            success: function (res) {
                console.log(res);
                var list = that.data.newslist;
                var tempFilePaths = that.data.tempFilePaths;
                for (var i = 0; i < res.tempFilePaths.length;i++){

                    var params = '';
                    params = res.tempFilePaths[i];
                    wx.uploadFile({
                        url: that.data.baseUrl + 'file/upload',
                        filePath: params,
                        name: 'multipartFile',
                        formData: { data1: "w", },
                        success: function (res) {
                            var res = JSON.parse(res.data);
                            if (app.data.type == 1 && (that.data.teacherData.id == that.data.userId || that.data.UserIdsStatus)) {
                                let userNickname = that.data.UserIdsStatus ? that.data.curTeacherData.userNickname : that.data.teacherData.userNickname;
                                websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.data.filename + '", "createTime": ' + Date.parse(new Date()) + ',"type":2, "userNickname": "' + userNickname + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
                            } else {
                                websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.data.filename + '", "createTime": ' + Date.parse(new Date()) + ',"type":2, "userNickname": "' + that.data.userInfo.nickName + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
                            }
                            console.log(res.data.filename,6666);
                            var aa = {};
                            aa.img = that.data.baseUrl +'filesinfo/'+res.data.filename;
                            tempFilePaths.push(that.data.baseUrl + 'filesinfo/' + res.data.filename);
                            that.setData({
                                tempFilePaths: tempFilePaths
                            })
                            console.log(that);
                        },
                        fail: function (res) {
                            console.log("tt");
                        }
                    })
                    // websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.tempFilePaths[i] + '", "createTime": ' + Date.parse(new Date()) + ',"type":2, "userNickname": "' + that.data.userInfo.nickName + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
                    // list.push(aa);
                }


                console.log(that.data.tempFilePaths,that.data.list);
                // that.setData({
                //   tempFilePaths: res.tempFilePaths[0],
                // })
            }
        })
    },
    previewImage: function (e) {
        var current = e.target.dataset.src;
        this.data.tempFilePaths.length = 0;
        this.data.tempFilePaths.push(current);
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: this.data.tempFilePaths // 需要预览的图片http链接列表
        })
    },
    //选择视频
    choosevideo: function () {
        var that = this;
        wx.showActionSheet({
            itemList: ['从影集中选择', '拍摄'],
            itemColor: "#CED63A",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseVideo('album')
                    } else if (res.tapIndex == 1) {
                        that.chooseVideo('camera')
                    }
                }
            }
        })

    },
    chatRecord(courseId) {
        var that = this, params = {};
        params.courseId = Number(courseId);
        params.pageSize = that.data.pageSize;
        console.log(params);

        if (that.data.allPages === '') {
            params.pageNum = 1;
            api.post("classroom/findclassroomrecord", params).then((sres) => {
                var result = sres.data.data;
                that.setData({
                    pageNum: result.pages,
                    allPages: 0
                })
                params.pageNum = that.data.refreshStatus ? that.data.pageNum  : that.data.pageNum;
                api.post("classroom/findclassroomrecord", params).then((sres) => {
                    console.log(sres.data.data, that);
                    var result = sres.data.data;
                    var list = that.data.newslist;

                    if (that.data.refreshStatus) {
                        for (var i = result.list.length; i < 0; i--) {
                            if (!(result.list[i].type == 4 || result.list[i].type == 5)) {
                                if (result.list[i].type == 1) {
                                    result.list[i].isPlay = false;
                                }
                                list.unshift(result.list[i]);
                            }
                        }
                    } else {
                        for (var i = 0; i < result.list.length; i++) {
                            if (!(result.list[i].type == 4 || result.list[i].type == 5)) {
                                result.list[i].createTime = utils.formatTime(result.list[i].createTime, 'Y-M-D h:m');
                                if (result.list[i].type == 1) {
                                    result.list[i].isPlay = false;
                                }
                                list.push(result.list[i]);
                            }
                        }
                    }

                    that.setData({
                        newslist: list,
                        allPages: 0,
                        refreshStatus: false,
                        hideHeader: true
                    })
                    that.pageScrollToBottom();
                    console.log(that)
                }).catch((fres) => {
                    console.log(fres);
                    wx.showToast({
                        title: '请求超时',
                        icon: 'fail',
                        image: '../../images/x.png',
                        duration: 1000,
                        mask: true
                    })
                });
            }).catch((fres) => {
                console.log(fres);
                wx.showToast({
                    title: '请求超时',
                    icon: 'fail',
                    image: '../../images/x.png',
                    duration: 1000,
                    mask: true
                })
            });
        }else{
            params.pageNum = that.data.refreshStatus ? that.data.pageNum -1 : that.data.pageNum;
            console.log(params.pageNum, that.data.allPages, params.pageNum <= that.data.allPages)
            if (params.pageNum <= that.data.allPages) {
                that.setData({
                    refreshStatus: false,
                    hideHeader: true
                })
                return false;
            }
            api.post("classroom/findclassroomrecord", params).then((sres) => {
                console.log(sres.data.data, that);
                var result = sres.data.data;
                var list = that.data.newslist;

                if (that.data.refreshStatus) {
                    console.log(1, result.list.length,result);
                    for (var i = result.list.length - 1; i > 0; i--) {
                        console.log(result.list[i], i);
                        if (!(result.list[i].type == 4 || result.list[i].type == 5)) {
                            result.list[i].createTime = utils.formatTime(result.list[i].createTime, 'Y-M-D h:m');
                            if (result.list[i].type == 1) {
                                result.list[i].isPlay = false;
                            }
                            list.unshift(result.list[i]);
                        }
                    }
                } else {
                    console.log(2);
                    for (var i = 0; i < result.list.length; i++) {
                        if (!(result.list[i].type == 4 || result.list[i].type == 5)) {
                            result.list[i].createTime = utils.formatTime(result.list[i].createTime, 'Y-M-D h:m');
                            if (result.list[i].type == 1) {
                                result.list[i].isPlay = false;
                            }
                            list.push(result.list[i]);
                        }
                    }
                }
                that.setData({
                    pageNum: result.pageNum,
                    newslist: list,
                    allPages: 0,
                    refreshStatus: false,
                    hideHeader: true
                })

                console.log(that.data,list)
            }).catch((fres) => {
                console.log(fres);
                wx.showToast({
                    title: '请求超时',
                    icon: 'fail',
                    image: '../../images/x.png',
                    duration: 1000,
                    mask: true
                })
            });
        }

    },
    chooseVideo: function (type) {
        var that = this;
        wx.chooseVideo({
            sourceType: [type],
            maxDuration: 60,
            camera: 'back',
            success: function (res) {
                var list = that.data.newslist;
                var aa = {
                    video: res.tempFilePath,
                    thumbTempFilePath: res.thumbTempFilePath
                }
                var params = '';
                params = res.tempFilePath;
                wx.uploadFile({
                    url: that.data.baseUrl + 'file/upload',
                    filePath: params,
                    name: 'multipartFile',
                    formData: { data1: "w", },
                    success: function (res) {
                        var res = JSON.parse(res.data);
                        if (app.data.type == 1 && (that.data.teacherData.id == that.data.userId || that.data.UserIdsStatus)) {
                            let userNickname = that.data.UserIdsStatus ? that.data.curTeacherData.userNickname : that.data.teacherData.userNickname;
                            websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.data.filename + '", "createTime": ' + Date.parse(new Date()) + ',"type":3, "userNickname": "' + userNickname + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
                        } else {
                            websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.data.filename + '", "createTime": ' + Date.parse(new Date()) + ',"type":3, "userNickname": "' + that.data.userInfo.nickName + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
                        }

                        var aa = {};
                        var tempFilePaths = [];
                        aa.img = that.data.baseUrl + 'filesinfo/' + res.data.filename;
                        tempFilePaths.push(that.data.baseUrl + 'filesinfo/' + res.data.filename);
                        that.setData({
                            tempFilePaths: tempFilePaths
                        })
                        console.log(that);
                    },
                    fail: function (res) {
                        console.log("tt");
                    }
                })
                // websocket.send('{ "courseId": ' + that.data.courseId + ', "statement": "' + res.thumbTempFilePath + '", "createTime": ' + Date.parse(new Date()) + ',"type":4, "userNickname": "' + that.data.userInfo.nickName + '", "images": "' + that.data.userInfo.avatarUrl + '","userId": ' + app.data.id + ',"userType": ' + app.data.type + ' }');
                // list.push(aa);
                // that.setData({
                //   newslist: list,
                //   video: res.tempFilePath
                // })
                console.log(that.data.list);
            }
        })
    },
    // 下拉刷新
    refresh: function (e) {
        var self = this;
        setTimeout(function () {
            console.log('下拉刷新');
            var date = new Date();
            self.setData({
                currentPage: 1,
                refreshTime: date.toLocaleTimeString(),
                hideHeader: false,
                refreshStatus: true
            })
            self.chatRecord(self.data.courseId);
        }, 300);
    }
})