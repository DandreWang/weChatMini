import http from '../../../utils/request'
import { imgUrl } from '../../../utils/api';
import { formatTime } from '../../../utils/util'

Page({
  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: imgUrl + 'public/',
    refreshStatus: false,
    refreshTime: '',
    list: [],
    pageNum: 0,
    pageSize: 10,
    allPages: 1,
    scrollTop: 0,
    backFlg: true,
  },
  onLoad() {
    this.getData();
  },
  jump(event) {
    wx.navigateTo({ url: `/${event.currentTarget.dataset.url}` });
  },
  getData() {

    const { refreshStatus, pageNum, allPages, list, pageSize } = this.data;

    if (refreshStatus || pageNum >= allPages) {
      return;
    }
    this.setData({
      refreshTime: new Date().toLocaleTimeString(),
      refreshStatus: true,
    });
    const np = pageNum + 1;

    http.post('getQuizList', {
      quizName: '',
      pageNum: np,
      pageSize
    }).then(sres => {
      const { pages, list: rlist } = sres.data;
      this.setData({
        pageNum: np,
        allPages: pages,
        list: list.concat(rlist.map(item => ({
          ...item,
          ct: formatTime(item.createTime, 'Y.M.D')
        }))),
        refreshStatus: false,
      });
    }).catch(fres => {
      this.setData({
        refreshStatus: false
      });
    });
  },
  // 下拉刷新
  refresh(e) {
    this.getData();
  },
  //回到顶部
  goTop(e) {  // 一键回到顶部
    this.setData({
      backFlg: true,
      scrollTop: 0
    });
  },
  bindscroll(e) {
    const { backFlg } = this.data;
    if (backFlg === e.scrollTop > 500) {
      this.setData({ backFlg: !backFlg });
    }
  }
});
