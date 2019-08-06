const app = getApp();
import api, {imgUrl} from '../../utils/require.js'

Page({
  data: {
    detailData: {},
    userId: '',
    imgUrl,
    isIphoneX: false,
    id:''
  },
  onShareAppMessage(res) {
    return api.shareLink(this, this.data.detailData.title,{id:this.data.id})
  },
  onLoad(options) {
    const {id} = options;
    this.setData({id})
    const {isIphoneX, id: userId} = app.data;
    api.post("course/addnewclick/" + id, '');
    api.get("course/info/" + id, '').then(sres => {
      this.setData({
        detailData: sres.data.data,
        isIphoneX,
        userId
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  //跳转聊天室
  jump(e) {
    const {userId, detailData: {id, userId: lsId, isOver, startTime}} = this.data;
    if (isOver) {
      return wx.showToast({title: '课程已结束', icon: 'none'});
    }
    if (!startTime || startTime > new Date().getTime()) {
      return wx.showToast({title: '尚未开始，敬请期待', icon: 'none'});
    }

    api.post('/courseEnterLog/save', {
      courseId: id,
      userId
    }).then(sres => {
      wx.navigateTo({
        url: `../chat/chat?id=${id}&lsId=${lsId}`
      });
    }).catch(fres => {
      api.timeoutErr();
    });
    api.post("course/addcoursestudent", {
      status: 0,
      courseId: id,
      userId
    });
  },
});