import api, {imgUrl} from '../../utils/require.js'
import util from '../../utils/util.js'

Page({
  data: {
    autoplay: false,
    duration: 500,
    currentTab: 0,
    tabList: ['未使用', '已使用', '已过期'],
    pageNum: 1,
    pageSize: 5,
    couponType: '1',
    windowHeight: '',
    couponList: [],
    isFromSearch: true,
    searchPageNum: 1,
    callbackcount: 5,
    searchLoading: false,
    searchLoadingComplete: false,
    allPages: '',
    imgUrl: imgUrl + 'coupon/',
  },
  // 滚动切换标签样式
  // switchTab: function(e) {
  //     this.setData({
  //         couponList:[],
  //         currentTab: e.detail.current,
  //         couponType: e.detail.current+1
  //     });
  //     this.getNoUseCouponDetail();
  // },
  // 点击标题切换当前页时改变样式
  switchType: function (e) {
    this.setData({
      couponList: []
    })
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) {
      return false;
    } else {
      this.setData({
        couponList: [],
        isFromSearch: true,
        searchPageNum: 1,
        callbackcount: 5,
        searchLoading: false,
        searchLoadingComplete: false,
        allPages: '',
        currentTab: cur,
        couponType: cur + 1
      })
      this.getNoUseCouponDetail();
    }
  },
  onLoad: function () {
    this.getNoUseCouponDetail();
  },
  // 获取优惠券数据
  getNoUseCouponDetail: function (e) {
    const {searchPageNum, callbackcount, couponType, isFromSearch, couponList} = this.data;
    api.post("discount/search", {
      id: wx.getStorageSync('id'),
      pageNum: searchPageNum,
      pageSize: callbackcount,
      type: couponType
    }).then(sres => {
      const {list, pages} = sres.data.data;
      //判断是否有数据，有则取数据
      if (list) {
        list.forEach(item => {
          item.startTime = util.formatTime(item.startTime, 'Y.M.D');
          item.endTime = util.formatTime(item.endTime, 'Y.M.D')
        });
        //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加
        this.setData({
          couponList: isFromSearch ? list : couponList.concat(list), //获取数据数组
          searchLoading: true,   //把"上拉加载"的变量设为false，显示
          allPages: pages
        });
        //没有数据了，把“没有数据”显示，把“上拉加载”隐藏
      } else {
        this.setData({
          searchLoadingComplete: true, //把“没有数据”设为true，显示
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏
        });
      }
    }).catch((fres) => {
      api.timeoutErr();
    });
  },
  // 下拉刷新
  refresh: function (e) {
    const {searchPageNum, allPages, searchLoading, searchLoadingComplete} = this.data;
    if (searchPageNum + 1 <= allPages) {
      if (searchLoading && !searchLoadingComplete) {
        this.setData({
          searchPageNum: searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1
          isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false
        });
        this.getNoUseCouponDetail();
      }
    }
  },
  //长按复制
  copy: function (e) {
    wx.setClipboardData({
      data: this.data.couponList.couponCode,
      success: res => {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  }
})