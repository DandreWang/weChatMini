// pages/record/record.js
import api, {imgUrl} from '../../utils/require.js'
import util from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refreshTime: '', // 刷新的时间
    refreshStatus: false,
    pageNum : 0,
    pageSize : 10,
    allPages: 1,
    list: [],
    imgUrl: imgUrl + 'public/',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getData();
  },

  handleEmpty:function(){
    this.setData({
      list: []
    });
  },
  jump: function (event) {
    wx.navigateTo({
      url: '../detail/detail?id=' + event.currentTarget.dataset.id
    })
  },
  getData() {
    const {refreshStatus, pageNum, allPages, list, pageSize} = this.data;

    if (refreshStatus || pageNum>=allPages) {
      return;
    }
    const np = pageNum + 1;
    this.setData({
      refreshTime: new Date().toLocaleTimeString(),
      refreshStatus: true,
    });
    
    api.post('course/findcourserecord', {
      id: wx.getStorageSync('id'),
      pageNum: np,
      pageSize
    }).then(sres => {
      const { pages, list: rlist } = sres.data.data;
      rlist.forEach(item => {
        item.createTime = util.formatTime(item.createTime, 'Y.M.D h:m')
      });
      this.setData({
        pageNum: np,
        allPages: pages,
        list: list.concat(rlist),
        refreshStatus: false,
      });


    }).catch(fres => {
      api.timeoutErr();
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
  //删除
  deleteHistory(){
    const ids = this.data.list.map(item => item.studentCourseId).join(',');
    api.post('course/delClassRecord', {
      ids
    }).then(res=>{
      const {success}=res.data;
      if(success){
        this.setData({
          pageNum: 0,
          list: [],
        })
        wx.showToast({
          title: '已清空',
          icon: 'none',
          duration: 2000
        }) 
      }
    }).catch(()=>{
      api.timeoutErr();
    })
  },
  bindscroll(e) {
    const {backFlg} = this.data;
    if (backFlg === e.scrollTop > 500) {
      this.setData({backFlg: !backFlg});
    }
  }
});