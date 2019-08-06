import api, {imgUrl} from '../../utils/require.js'
import utils from '../../utils/util.js';

const websocket = require('../../utils/websocket.js');
const app = getApp();
// 课程ID
let courseId = '';
// 语音是否取消
let vioceCancel = false;

const tabber = [{
  id: "speak",
  open: false,
}, {
  id: "word",
  open: false,
}, {
  id: "img",
  open: false,
}, {
  id: "more",
  open: false,
}];
//心跳检测
const heartCheck = {
  timeout: 3000,
  timeoutObj: null,
  serverTimeoutObj: null,
  start() {
    this.timeoutObj && clearTimeout(this.timeoutObj);
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
    this.timeoutObj = setTimeout(() => {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      wx.sendSocketMessage({data: "1"});
      this.serverTimeoutObj = setTimeout(() => {
        wx.closeSocket();
      }, this.timeout);
    }, this.timeout)
  }
}

Page({
  data: {
    userId: '',
    appType: '',
    userInfo: {},
    imgUrl: imgUrl + 'chat/',
    isIphoneX: '',
    refreshTime: '', // 刷新的时间
    refreshStatus: false,
    newslist: [],
    teacherData: {},
    adnote: true,
    note: [
      '1、听不到声音请往下翻点击语音即可播放，并确认手机没有静音，若不行可切换网络；',
      '2、遇到卡顿或者加载不出，请尝试重新进入；',
      '3、大家可在下方评论框发起提问和交流； ',
      '4、课程语音永久保存，无限复听；'
    ],
    tabber: [],
    imgBtn: [{
      id: 'img',
      word: "图片",
    }, {
      id: 'video',
      word: "视频",
      // }, {
      //   id: 'music',
      //   word: "音乐",
      //   op: "chooseimage"
    }],
    recording: false, //记录长按录音开始点信息,用于后面计算滑动距离。
    recorderManager: null, //录音管理上下文
    innerAudioContext: null,
    textarea: '',
    tempFilePaths: [],
    pageNum: 0,
    pageSize: null,
    allPages: 1,
    speakStatus: true,
    curTeaName: false,
    lastItem: '',
    audioId: '',
    // 新消息
    nid: '',
    nMsgNum: 0
  },
  // 重连
  lockReconnect: false,
  timer: null,
  // 底部标识
  lower: false,
  onLoad(options) {
    courseId = options.id;
    const {lsId} = options;
    const id = wx.getStorageSync('id');
    const type = wx.getStorageSync('type');
    const userInfo = wx.getStorageSync('userInfo');
    const {isIphoneX} = app.data;
    const obj = {
      appType: type,
      userId: id,
      isIphoneX,
      refreshTime: new Date().toLocaleTimeString(),
      bottom: isIphoneX ? '68rpx' : '0rpx',
      userInfo: userInfo ? userInfo : {}
    }
    this.setData(obj);

    api.post("user/findteacher/" + lsId, '').then(sres => {
      const {data} = sres.data;
      const o = lsId == id ? {curTeaName: data.userNickname} : {};
      this.setData({
        ...o,
        teacherData: data
      });
    }).catch(fres => {
      api.timeoutErr();
    });
    api.get("course/info/" + courseId, '').then(sres => {
      const {status, viceUserIds} = sres.data.data;
      const curTeacherData = viceUserIds.filter(item => item.id === id);
      const isT = type == 1 && (lsId == id || curTeacherData.length);
      const o = curTeacherData.length ? {curTeaName: curTeacherData[0].userNickname} : {};
      this.setData({
        ...o,
        speakStatus: status == 1,
        tabber: isT ? tabber : [tabber[1]],
        isT
      });
    }).catch(fres => {
      api.timeoutErr();
    });
    this.evtInit();
    //历史记录
    this.chatRecord();
    //调通接口
    this.webSocket();
  },
  // 页面卸载
  onUnload() {
    this.innerAudioContext.stop();
    wx.onSocketClose((res) => {
      console.log('已离开直播间, WebSocket 已关闭！');
    });
    wx.closeSocket();
    wx.showToast({
      title: '您已离开直播间~',
      icon: "none",
      duration: 2000
    })
  },
  closeAd() {
    this.setData({
      adnote: false
    });
  },
  sendMsg(opt) {
    const {userId, appType, curTeaName, userInfo: {nickName, avatarUrl}} = this.data;
    websocket.send(JSON.stringify(Object.assign({
      courseId,
      createTime: Date.parse(new Date()),
      userNickname: curTeaName ? curTeaName : nickName,
      images: avatarUrl,
      userType: appType,
      userId
    }, opt)));
  },
  switchChange(e) {
    const {value} = e.detail;
    const {userInfo: {nickName}} = this.data;

    api.post("user/findteacher/" + courseId + "/" + (value ? 0 : 1), '').then((sres) => {
      this.sendMsg({
        statement: `${nickName}在${utils.formatTime(new Date(), 'Y-M-D h:m:s')}${value ? "解除" : "发起"}了全员禁言`,
        // type: 4 禁言 5 自由发言
        type: value ? 5 : 4,
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  //webSocket
  webSocket() {
    const {userInfo} = this.data;
    // 消息响应
    websocket.connect('websocketmore/' + courseId, userInfo, res => {

      const {newslist, userId, isIphoneX, tempFilePaths, nid, nMsgNum} = this.data;
      const message = JSON.parse(res.data.replace(/\n/g, "&#10;").replace(/\r/g, "&#13;"));

      console.log(res.data)

      if (message == "1") {
        heartCheck.start();
      } else if (message.courseId == courseId) {
        const {type, userId: mid} = message;
        //把数据放入变量allContentList中
        if (type != 4 && type != 5) {
          const newFilePaths = this.msgFormatter([message]);
          newslist.push(message);
          this.setData({
            newslist,
            tempFilePaths: tempFilePaths.concat(newFilePaths),
          }, res => {
            if (this.lower) {
              this.getLastItem([message]);
            } else {
              this.setData({
                nid: nid ? nid : `msg${message.createTime}`,
                nMsgNum: nMsgNum + 1
              });
            }
          });
        } else {
          this.setData({
            actTab: '',
            speakStatus: type == 4,
            bottom: isIphoneX ? '68rpx' : '0rpx',
          });
          if (userId == mid) {
            wx.showToast({
              title: type == 4 ? '你发起了全员禁言！' : '你解除了全员禁言！',
              icon: "none",
            });
            setTimeout(() => {
              wx.hideToast();
            }, 1500);
          }
        }
      }
    });
  },
  //断线重连
  reconnect() {
    if (this.lockReconnect) return;
    this.lockReconnect = true;
    wx.showToast({
      title: '正在连接服务器...',
      icon: "loading",
      duration: 1000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
    });
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.webSocket();
      this.lockReconnect = false;
    }, 1000);
  },
  // 播放视频
  jump(e) {
    wx.navigateTo({
      url: '../player/player?src=' + e.currentTarget.dataset.src
    });
  },
  kindToggle(e) {
    const {id} = e.currentTarget.dataset;
    const {actTab} = this.data;
    this.setData({
      actTab: actTab === id ? '' : id,
    }, res => {
      this.getLastItem();
    });

  },
  handleRecordStart(e) {
    this.setData({
      recording: e.changedTouches[0].clientY,
    });

    //longpress时触发
    this.recorderManager.start({
      format: 'aac',
      duration: 60000
    });
  },
  handleRecordMove(e) {
    const {recording} = this.data;
    if (!recording || recording - e.changedTouches[0].clientY > 120 === vioceCancel) {
      return;
    }

    vioceCancel = !vioceCancel;
    //开始录音
    wx.showToast({
      title: vioceCancel ? '松手取消' : '正在录音，上滑取消',
      icon: "none",
      duration: 60000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
    });
  },
  // touchend(手指松开)时触发
  handleRecordStop(e) {
    // 上滑取消
    if (this.data.recording - e.changedTouches[0].clientY > 120) {
      this.setData({
        recording: false
      });
    }
    this.recorderManager.stop();//结束录音
  },
  evtInit(e) {
    // 初始化录音对象
    this.recorderManager = wx.getRecorderManager();
    // 录音开始
    this.recorderManager.onStart(res => {
      //开始录音
      wx.showToast({
        title: "正在录音，上滑取消",
        icon: "none",
        duration: 60000//先定义个60秒，后面可以手动调用wx.hideToast()隐藏
      });
    });
    // 录音出现错误
    this.recorderManager.onError(res => {
      if (!this.data.recording) {
        return;
      }
      this.setData({
        recording: false,
      });
      wx.showToast({
        title: "录音失败！",
        icon: "none",
      });
      return;
    });

    // 录音结束
    this.recorderManager.onStop(res => {
      //结束录音、隐藏Toast提示框
      wx.hideToast();
      if (!this.data.recording) {
        return;
      }
      this.setData({
        recording: false
      });
      const {tempFilePath, duration} = res;
      if (duration < 500) {
        return wx.showToast({
          title: "录音时间太短！",
          icon: "none",
        });
      }
      api.upload(tempFilePath, 'lesson', res => {
        this.sendMsg({
          statement: JSON.parse(res.data).data.url,
          duration,
          type: 1,
        });
      });
    });
    // 语音对象
    this.innerAudioContext = wx.createInnerAudioContext();
    // 结束播放
    this.innerAudioContext.onEnded(res => {
      this.setData({
        audioId: ''
      });
    });
    // 播放错误
    this.innerAudioContext.onError(res => {
      wx.showToast({
        title: "网络异常，请重试！",
        icon: "none",
      });
      this.setData({
        audioId: ''
      });
    });
    wx.onSocketOpen(() => {
      // 获取断线期间消息
      this.chatRecord();
      // 关闭错误提示
      wx.hideToast();
      // 清理重连定时器
      clearTimeout(this.timer);
      // 恢复心跳检测
      heartCheck.start();
    });
    wx.onSocketError((res) => {
      console.log('WebSocket连接打开失败');
      this.reconnect();
    });
    wx.onSocketClose((res) => {
      console.log('WebSocket 已关闭！');
      this.reconnect();
    });
  },
  // 语音点击
  audioClick(e) {
    const {id} = e.currentTarget.dataset;
    const {newslist, audioId} = this.data;
    // 是否播放
    let nid = '';
    if (audioId) {
      this.innerAudioContext.stop();
    }
    if (audioId != id) {
      nid = id;
      //切换显示状态
      newslist.forEach(item => {
        const {createTime, statement} = item;
        if (createTime == id) {
          this.innerAudioContext.src = statement;
          this.innerAudioContext.play();
        }
      });
    }

    this.setData({
      audioId: nid
    });
  },
  getWordContent(e) {
    const {
      textarea
    } = e.detail.value;
    if (textarea.trim() === '') {
      return wx.showToast({
        title: "发送内容不能为空",
        icon: "none",
      });
    }
    this.sendMsg({
      statement: textarea,
      type: 0,
    });

    this.setData({
      textarea: ""
    });
  },
  handleScrollChange(e) {
    const {adnote} = this.data;
    // if (adnote && scrollTop > 500) {
    //   this.setData({
    //     adnote: false
    //   });
    // }
    if (this.lower) {
      this.lower = false;
    }
  },
  inpBlur() {
    if (!this.data.actTab) return;
    this.setData({
      actTab: false,
    });
  },
  getLastItem(list) {
    if (!list || !list.length) {
      list = this.data.newslist;
    }
    this.setData({
      lastItem: 'msg' + list[list.length - 1].createTime
    });
  },
  //选择图片
  chooseimg() {
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#CED63A",
      success: res => {
        const {cancel, tapIndex} = res;
        if (!cancel) {
          this.chooseWxImage(tapIndex ? 'camera' : 'album')
        }
      }
    });
  },
  chooseWxImage(type) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: res => {
        res.tempFilePaths.forEach(item => {
          api.upload(item, 'lesson', res => {
            this.sendMsg({
              statement: JSON.parse(res.data).data.url,
              type: 2,
            });
            // this.inpBlur();
          });
        });
      }
    });
  },
  previewImage(e) {
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接
      urls: this.data.tempFilePaths // 需要预览的图片http链接列表
    });
  },
  //选择视频
  choosevideo() {
    wx.showActionSheet({
      itemList: ['从影集中选择', '拍摄'],
      itemColor: "#CED63A",
      success: res => {
        const {cancel, tapIndex} = res;
        if (!cancel) {
          this.chooseWxVideo(tapIndex ? 'camera' : 'album')
        }
      }
    });
  },
  chooseWxVideo(type) {
    wx.chooseVideo({
      sourceType: [type],
      maxDuration: 60,
      camera: 'back',
      success: res => {
        api.upload(res.tempFilePath, 'lesson', res => {
          this.sendMsg({
            statement: JSON.parse(res.data).data.url,
            type: 3,
          });
          // this.inpBlur();
        });
      }
    });
  },
  chatRecord() {
    const {pageSize, newslist, refreshStatus, pageNum, allPages, tempFilePaths} = this.data;

    // if (refreshStatus || pageNum >= allPages) {
    //   return;
    // }
    this.setData({
      refreshTime: new Date().toLocaleTimeString(),
      refreshStatus: true,
    });
    const np = pageNum - 0 + 1;

    const {length} = newslist;

    api.post("classroom/findclassroomrecord", {
      courseId,
      startTime: length ? newslist[length - 1].createTime : null,
      endTime: length ? new Date().getTime() : null,
      pageNum: np,
      pageSize
    }).then(sres => {
      const {list, pages} = sres.data.data;

      const flist = list.filter(item => {
        return !newslist.filter(oi => oi.createTime === item.createTime).length
      });

      const newFilePaths = this.msgFormatter(flist);

      this.setData({
        // newslist: list.reverse().concat(newslist),
        newslist: newslist.concat(flist),
        pageNum: np,
        allPages: pages,
        refreshStatus: false,
        // tempFilePaths: newFilePaths.reverse().concat(tempFilePaths),
        tempFilePaths: tempFilePaths.concat(newFilePaths),
      }, res => {
        // this.getLastItem();
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  msgFormatter(list) {
    const tempFilePaths = [];
    list.forEach(item => {
      const {type, statement, duration} = item;
      item.time = utils.formatTime(item.createTime, 'Y-M-D h:m');
      if (type == 2) {
        tempFilePaths.push(statement);
      } else if (type == 1) {
        item.dTime = Math.ceil(duration / 1000);
      }
    });
    return tempFilePaths;
  },
  // 下拉刷新
  refresh() {
    this.lower = true;
    // this.chatRecord();
  },
  // 新消息
  toBom() {
    this.setData({
      nid: '',
      nMsgNum: 0,
      lastItem: this.data.nid
    });
  }
});