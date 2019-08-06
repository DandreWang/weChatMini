import {imgUrl} from "../../utils/require";

Page({
  data:{
    userInfo: {},
    imgUrl,
    pageImgUrl: imgUrl + 'personal/',
    showModal: false,
  },
  onLoad() {
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      type: wx.getStorageSync('type')
    });
  },
  /**
  * 弹窗
  */
  showDialogBtn() {
    // this.setData({
    //   showModal: true
    // });
    wx.navigateTo({
      url:'../feedback/feedback'
    });
  },
  recordBtn() {
    wx.navigateTo({
      url:'../record/record'
    });
  },
  couponBtn() {
    wx.navigateTo({
      url:'../coupon/coupon'
    });
  },
  /**
   * 隐藏模态对话框
   */
  hideModal() {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel() {
    this.hideModal();
  },
  previewImage(e) {
    const url = this.data.pageImgUrl+'901.png';
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
    });
  }
});