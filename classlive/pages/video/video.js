import api, {imgUrl} from '../../utils/require.js'

const apis = {
  cls: 'course/search',
  list: 'course/searchweb'
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    backFlg: true,
    refreshTime: '', // 刷新的时间
    refreshStatus: false,
    hideHeader: true,
    pageNum: 1,
    pageSize: 10,
    act: 0,
    imgUrl: imgUrl + 'public/',
    tits: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCls();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getData();
  },

  // 获取滚动条当前位置
  onPageScroll(e) {
    const {backFlg} = this.data;
    if (backFlg !== e.scrollTop < 100) {
      this.setData({
        backFlg: !backFlg
      });
    }
  },

  //回到顶部
  goTop(e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      });
      this.setData({
        backFlg: true
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
    }
  },
  jump(event) {
    const {id, src} = event.currentTarget.dataset;
    api.post("course/addnewclick/" + id, '').then(sres => {
      wx.navigateTo({
        url: '../player/player?src=' + src
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  getCls() {
    api.post(apis.cls, {
      all: 0,
      id: -1,
      pageNum: 0,
      pageSize: 0,
      type: 2
    }).then(res => {
      this.setData({
        tits: res.data.data.list.filter(item => item.hide !== 1)
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  getData(flg) {
    const {pageNum, pageSize, act, refreshStatus} = this.data;
    if (refreshStatus && !flg) {
      return;
    }
    this.setData({
      refreshStatus: true,
      hideHeader: false
    });
    const params = {
      type: 2,
      pageNum,
      pageSize,
      title: '',
      slideshowType: flg ? flg : act
    };

    api.post(apis.list, params).then(sres => {
      const {list, isLastPage, pageNum} = sres.data.data;
      list.forEach(li => {
        if (!li.videoImage) {
          li.videoImage = '72_72.png';
        }
      });
      const {tits} = this.data;
      for (let i in tits) {
        const {id, children = []} = tits[i];
        if (id !== (flg ? flg : act)) {
          continue;
        }
        tits[i].children = (flg ? [] : children).concat(list);
      }
      this.setData({
        pageNum: pageNum + 1 - 0,
        tits,
        refreshStatus: isLastPage,
        hideHeader: true,
        refreshTime: new Date().toLocaleTimeString(),
        act: flg ? flg : act
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  // 切换tab
  actItem(event) {
    const {type} = event.currentTarget.dataset;
    const {act} = this.data;
    if (act === type) {
      this.setData({
        act: '',
      });
    } else {
      this.setData({
        pageNum: 1,
      });
      this.getData(type);
    }
  },
})