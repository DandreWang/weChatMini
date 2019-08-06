//index.js
import api, { imgUrl } from '../../utils/require.js'
import util from '../../utils/util.js'
//获取应用实例
const app = getApp();
const prize = require('../component/openPrize/openPrize.js')

Page({
  data: {
    imgUrl: imgUrl + 'index/',
    // winHeight: "", //窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    slideData: [],
    indicatorDots: true,
    autoplay: true,
    circular: true,
    interval: 3000,
    duration: 500,
    tarbarList: [],
    rmjxList: [],
    jqjzList: [],
    status: '../item/item.wxml',
    isIphoneX: false,
    showModal: false,
    couponList: {},
    couponTime: [],
    showSuccessModal: false,
    showActiveModal: false,
    showCouponModal: false,
    couponData: [],
    activeData: [],
    couponIndex: 0,
    activeIndex: 0,
    hide: '',
    couponBgUrl: '',
  },
  openPrize: prize.openPrize,
  /**
   * 弹窗
   */
  showDialogBtn() {
    this.setData({
      showModal: false
    })
  },
  onShareAppMessage(res) {
    return api.shareLink(this, '菠萝在线知识讲堂')
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel() {
    this.setData({
      showModal: false
    })
  },
  // 滚动切换标签样式
  switchTab(e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },
  // 点击标题切换当前页时改变样式
  swichNav(e) {
    const { current } = e.target.dataset;
    if (this.data.currentTaB == current) {
      return false;
    } else {
      this.setData({
        currentTab: current
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor() {
    const { currentTab } = this.data;
    if (currentTab > 3) {
      this.setData({
        scrollLeft: 300 * (currentTab / 4)
      })
    } else {
      this.setData({
        scrollLeft: 10
      })
    }
  },
  onLoad() {
    this.setData({
      isIphoneX: app.data.isIphoneX
    });
    this.loadData();
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    api.post("course/search", {
      all: 1,
      id: -1,
      pageNum: 0,
      pageSize: 0,
      type: 1
    }).then(sres => {
      const { list } = sres.data.data;
      const arrNum = list.filter(item => item.hide == 0);
      arrNum.unshift({ id: -1, name: '推荐' });
      this.setData({
        tarbarList: arrNum
      });
      // that.data.list = sres.data.data.list;
    }).catch(fres => {
      api.timeoutErr();
    });
    // this.getCouponData();
    // this.getActiveData();
    api.post("course/searchweb", {
      title: '',
      type: 1,
      slideshowType: 7,
      pageNum: 1,
      pageSize: 3,
    }).then(sres => {
      this.setData({
        rmjxList: sres.data.data.list
      })
      // that.data.list = sres.data.data.list;
    }).catch(fres => {
      api.timeoutErr();
    });
    api.post("course/searchweb", {
      title: '',
      type: 1,
      slideshowType: 9,
      pageNum: 1,
      pageSize: 3,
    }).then(sres => {
      this.setData({
        jqjzList: sres.data.data.list
      });
      // that.data.list = sres.data.data.list;
    }).catch(fres => {
      api.timeoutErr();
    });
    api.post("slideshow/searchwebslideshow", {
      title: '',
      pageNum: 0,
      pageSize: 0,
    }).then(sres => {
      this.setData({
        slideData: sres.data.data.list
      });
    }).catch(fres => {
      api.timeoutErr();
    });

    this.getCouponMsg();
    this.setData({
      hide: !this.data.couponList || app.data.type == 1 ? 'none' : 'block'
    });
  },
  // 优惠券
  getCouponData() {
    const that = this;
    api.post("discount/searchwindows", "").then(sres => {
      const { data } = sres.data;
      for (let i in data) {
        const { couponType, discount, minusMoney, usedStartTime, usedEndTime } = data[i];
        Object.assign(data[i], {
          couponTypeValue: couponType == 1 ? '立减' : couponType == 2 ? '立享' : '抵用',
          backImg: couponType == 1 ? '满减' : couponType == 2 ? '折扣' : couponType == 3 ? '定金' : '现金',
          word: couponType == 2 ? '折' : '元',
          bigWord: couponType != 2 ? minusMoney : discount,
          usedStartTime: util.formatTime(usedStartTime, 'Y.M.D'),
          usedEndTime: util.formatTime(usedEndTime, 'Y.M.D'),
        });
      }
      that.setData({
        couponData: sres.data.data
      });
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  // 活动弹窗
  getActiveData() {
    const that = this;
    api.post("windows/search", "").then(sres => {
      const { data } = sres.data;
      if (data.length) {
        that.setData({
          activeData: data,
          showActiveModal: true
        });
      }
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  // 近期讲座查看更多
  ExamineMore() {
    wx.navigateTo({
      url: '../examineMore/index'
    });
  },
  //跳转详情
  jump(e) {
    wx.navigateTo({
      url: '../detail/detail?id=' + e.currentTarget.dataset.id
    });
  },
  //跳转web
  web(e) {
    const { src } = e.currentTarget.dataset;
    if (!src) {
      return false;
    }
    wx.navigateTo({
      url: src.charAt(0) === '.' ? src : `../web/web?src=${src}`
    });
  },
  // 听课记录
  ClassRecord() {
    wx.navigateTo({
      url: '../record/record'
    });
  },
  //视频专栏
  Video() {
    wx.navigateTo({
      url: '../video/video'
    });
  },
  //查看更多
  jumpMore(e) {
    wx.navigateTo({
      url: `../lesMore/index?slideshowType=${e.currentTarget.dataset.id}`
    });
  },

  //获取手机号
  getPhoneNumber(e) {
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: e.detail.errMsg == 'getPhoneNumber:fail user deny' ? '未授权' : '同意授权',
    });
  },
  getCouponMsg(e) {
    const params = {
      type: -1,
      pageNum: 0,
      pageSize: 0,
    };
    api.post("discount/search", params).then(sres => {
      const { list } = sres.data.data;
      if (list.length) {
        const item = list[0];
        const { startTime, endTime, couponType } = item;
        Object.assign(item, {
          startTime: util.formatTime(startTime, 'Y.M.D'),
          endTime: util.formatTime(endTime, 'Y.M.D'),
        });

        this.setData({
          couponList: item,
          couponBgUrl: `${this.data.imgUrl}coupon_bg${couponType}.png`
        });
      }
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  clickGetCoupon(e) {
    const { couponIndex, couponData } = this.data;
    const index = couponIndex >= couponData.length ? couponData.length - 1 : couponIndex + 1;
    this.setData({
      showCouponModal: false,
      couponIndex: index
    });
    const params = {
      couponId: e.target.dataset.id,
      userId: app.data.id,
    };
    api.post("discount/get", params).then(sres => {
      const { success, msg } = sres.data;
      if (success) {
        this.setData({
          showSuccessModal: true
        });
      } else {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(fres => {
      api.timeoutErr();
    });
  },
  goCouponList() {
    this.setData({
      showSuccessModal: false
    });
    wx.navigateTo({
      url: '../coupon/coupon'
    });
  },
  //弹窗
  showCouponModal() {
    this.setData({ showCouponModal: true });
  },
  showActiveModal() {
    this.setData({ showActiveModal: true });
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove() {

  },
  /**
   * 隐藏模态对话框
   */
  hideActiveModal() {
    const { activeIndex, activeData } = this.data;
    const index = activeIndex >= activeData.length ? activeData.length - 1 : activeIndex + 1;
    this.setData({
      showActiveModal: false,
      activeIndex: index,
      showCouponModal: index >= activeData.length
    });
  },
  hideSuccessModal() {
    this.setData({ showSuccessModal: false });
  },
  hideCouponModal() {
    const { couponIndex, couponData } = this.data;
    const index = couponIndex >= couponData.length ? couponData.length - 1 : couponIndex + 1;
    this.setData({
      showCouponModal: false,
      couponIndex: index
    });
    const that = this;
    couponIndex < couponData.length && setTimeout(() => {
      that.showCouponModal();
    }, 2000);
  },
  activeJump(e) {
    const { activeIndex, activeData } = this.data;
    const index = activeIndex >= activeData.length ? activeData.length - 1 : activeIndex + 1;
    this.setData({
      showActiveModal: false,
      activeIndex: index
    });
    this.web(e);
  },
  hideModal() {
    this.setData({
      showActiveModal: false,
      showSuccessModal: false
    });
  },
  footerTap: app.footerTap
})
