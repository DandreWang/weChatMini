import {imgUrl, shareLink} from '../../../utils/api.js'
import http from '../../../utils/request'

Page({
  data: {
    imgUrl: imgUrl + 'answer/',
    goTest() {
      wx.reLaunch({
        url: '../examine/examine'
      });
    }
  },
  onLoad() {
    const userInfo = wx.getStorageSync('userData')
    http.post('searchSchool', {
      quizId: 1,
      userId: userInfo.id
    }).then(res => {
      // console.log(res.data)
      if (res.data == null) {
        // 未答题
      } else {
        // 已答题
        wx.reLaunch({
          url: '../school/school'
        });
      }
    });
  },
  //  用户点击右上角分享
  onShareAppMessage() {
    return shareLink('/pages/index/index', '世界名校Offer大作战！快来测测你能拿到哪所学校的Offer！天呐，我居然是哈佛大学！不服来战！')
  }

})