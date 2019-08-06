import { shareLink } from '../../../utils/api.js'
import http from '../../../utils/request'

Page({
  data: {
    title: '1.空闲时我喜欢看一些小说或书籍。',
    txt: ['非常不符合', '有点不符合', '有点符合', '非常符合'],
    num: 1,
    chk: false
  },
  res: [],
  onLoad() {
    // 用户id
    const { id } = wx.getStorageSync('userData')
    http.post('searchSchool', {
      quizId: 2,
      userId: id
    }).then(res => {
      if (res.data == null) {
        this.userId = id
        // 缓存答案
        const res = wx.getStorageSync('examSecRes')
        if (res) {
          wx.showToast({ title: '请继续答题！', icon: 'none' })
          const n = res.length - 1
          this.setData({
            title: this.ts[n],
            num: n,
            chk: res[n]
          })
          this.res = res
        }
      } else {
        // 已答题
        wx.redirectTo({
          url: '../result/index'
        });
      }
    });
  },
  // //  用户点击右上角分享
  // onShareAppMessage() {
  //   return shareLink('/pages/index/index', '测试题')
  // },
  handleChk(e) {
    const { idx } = e.target.dataset
    this.setData({
      chk: idx
    })
  },
  // 下一题
  handleToNext() {
    const { res, data, save, changeNum } = this
    const { num, chk } = data
    if (!chk) {
      return wx.showToast({ title: '请先选择答案！', icon: 'none' })
    }
    // 赋值保存
    res[num] = chk
    wx.setStorageSync('examSecRes', res)
    // 下一题，最后提交
    if (num < 40) {
      changeNum(num - 0 + 1)
    } else {
      wx.showModal({
        title: '提示',
        content: '提交后无法再次修改答案，是否继续提交？',
        success(e) {
          if (e.confirm) {
            save(res)
          }
        }
      })
    }
  },
  // 上一题
  handleToPre() {
    const { num } = this.data
    if (num === 1) {
      return wx.showToast({ title: '已经是第一题了！', icon: 'none' })
    }
    this.changeNum(num - 1)
  },
  // 提交数据
  save(res) {
    // 答案与雷达图对应角标
    const c = [0, 7, 4, 3, 6, 2, 1, 5]
    // 初值
    const valList = [0, 0, 0, 0, 0, 0, 0, 0]
    // 遍历结果
    res.forEach((val, idx) => {
      const type = idx % 8
      // 对应类型累加
      valList[c[type]] += val
    })
    const max = Math.max(...valList)
    const maxIdx = []
    const nList = valList.map((item, idx) => {
      max === item && maxIdx.push(idx)
      return item / 20
    })


    http.post('saveAnswer', {
      quizId: 2,
      images: maxIdx[0],
      // 最大值角标，结果值列表
      result: `${maxIdx.join(',')}|${nList.join(',')}`,
      userId: this.userId,
      createBy: 0
    }).then(res => {
      wx.redirectTo({
        url: '../result/index'
      });
    })
  },
  // 切换题目
  changeNum(n) {
    const { res, ts } = this
    const chk = res[n] ? res[n] : false
    this.setData({
      chk,
      num: n,
      title: ts[n]
    })
  },
  ts: [
    '1.空闲时我喜欢看一些小说或书籍。',
    '1.空闲时我喜欢看一些小说或书籍。',
    '2.平常我喜欢玩数独或寻宝、桌游等活动。',
    '3.我喜欢用乐高或积木拼插组合成各种建筑或物品。',
    '4.我喜欢观察大自然的变化以及动植物或昆虫的成长。',
    '5.我喜欢户外运动、上体育课或需要动手操作的活动。',
    '6.我喜欢听音乐，看与音乐有关的节目或玩乐器、唱歌等。',
    '7.我平常喜欢想象或思考问题。',
    '8.我喜欢参加聚会活动，和大家一起聊天、讨论。',
    '9.写作文或小日记对我来说一点也不困难。',
    '10.计算或解数学题是我拿手的项目。',
    '11.我只看地图就能顺利抵达没去过的陌生地方。',
    '12.实验课时，我能仔细精确地记录观察到的资料。',
    '13.我有擅长的运动项目（打球、游泳、跳舞、跑步等）。',
    '14.我的音乐成绩相当不错。',
    '15.我容易察觉到自己的情绪状态和心情的好坏。',
    '16.我会体谅别人的难处，也喜欢帮助别人。',
    '17.我擅长的科目是语文、历史或社会。',
    '18.我常会注意到线索而猜到侦探小说或电影中的凶手。',
    '19.我能看看示范图来拼装玩具模型或组合家具。',
    '20.我对很多事情都会好奇的想要多了解。',
    '21.我的双手灵巧，串珠、编织或制作小模型等对我是容易的事。',
    '22.随意听到一首歌，我就可以正确的哼出来。',
    '23.我知道自己的优点和缺点是哪些。',
    '24.我会觉察到别人的表情声音动作等，而了解他们的感受和想法。',
    '25.上台说话或报告是我的强项。',
    '26.遇到问题时，我会先弄清楚前因后果再来处理。',
    '27.计算图形的面积、体积等数学题目是我擅长的。',
    '28.我的观察力强，常可以看到别人没有察觉的现象。',
    '29.我精力充沛，不怕需要花费力气的活动。',
    '30.我可以听出别人唱歌音准不准、拍子对不对。',
    '31.我可以听出别人的批评，也会自我检查问题在哪里。',
    '32.遇到困难时，我会想办法找人帮忙。',
    '33.别人很容易了解我要表达的想法和感受。',
    '34.我很容易看懂不同的统计图表。',
    '35.我看得懂一些简单的机器或建筑设计图。',
    '36.面对杂乱的东西、资料时，我很容易找到规则来分类整理。',
    '37.只要看到表演者的舞步或动作，我很快就能学会。',
    '38.我有参加过合唱团、乐团，或音乐表演、比赛的经验。',
    '39.我能为自己的目标努力，不需要他人督促。',
    '40.在陌生的环境中，我也能很快和大家打成一片。'
  ]
})
