// pages/boutique/boutique.js
import api, {imgUrl} from '../../utils/require.js'
import util from '../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    imgUrl: imgUrl + 'public/'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow:function(){
    this.setData({
      userId: wx.getStorageSync('id')
    });
    this.getData();
  },
  jump(event) {
    const {id, lsid} = event.currentTarget.dataset;
    wx.navigateTo({
      url: `../chat/chat?id=${id}&lsId=${lsid}`
    });
  },
  getData() {
    api.post("course/findcourserecordnew", {id: this.data.userId}).then(sres => {
      const {data} = sres.data;
      data.createTime = util.formatTime(data.createTime, 'Y.M.D h:m')
      this.setData({
        item: data
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  }
});