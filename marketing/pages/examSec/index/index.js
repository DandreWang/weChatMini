import { imgUrl, shareLink } from '../../../utils/api.js'
import http from '../../../utils/request'

Page({
  data: {
    imgUrl: imgUrl + 'examSec/',
    txt: [{
      tit: '测试背景',
      text: '英国一项研究发现，这一代的孩子未来的工作，有60%以上还未被发现，未来的职业有着弹性、主动、多元、追求乐趣、技能需不断提升等特性。身为父母又该如何观察，怎样行动，才能帮助孩子更好的发展呢？'
    }, {
      tit: '测试价值',
      text: '本项测试将会从语言文字、数理逻辑、观察、音乐、空间推理等维度了解孩子的优势，帮助家长挖掘孩子的潜能，找到最适合孩子的学习方法。'
    }, {
      tit: '适用人群',
      text: '想要了解自己能力优势的人。\n想要了解孩子潜能的家长。\n即将选择专业/职业方向的人。'
    }, {
      tit: '测试须知',
      text: '本测评为免费测试，测试时间需要10分钟。'
    }],
    goTest() {
      wx.navigateTo({ url: '../examine/index' })
    },
    // 展示页面
    show: false
  },
  onLoad() {
    const { id } = wx.getStorageSync('userData')
    http.post('searchSchool', {
      quizId: 2,
      userId: id
    }).then(res => {
      if (res.data !== null) {
        // 已答题
        wx.redirectTo({
          url: '../result/index'
        });
      } else {
        this.setData({
          show: true,
        })
      }
    });
  },
  //  用户点击右上角分享
  onShareAppMessage() {
    return shareLink('/pages/examSec/index/index', '你的好友向你推荐这个专业测试，快来测测吧！', null, `examSec/shareImg.png`)
  },
})
