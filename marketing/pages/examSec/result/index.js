import { shareLink } from '../../../utils/api.js'
import http from '../../../utils/request'
import { imgUrl } from '../../../utils/api';
import { saveBase64Image } from '../../../utils/util'

const { windowWidth } = wx.getSystemInfoSync()

const pr = windowWidth ? windowWidth / 375 : 1

Page({
  onLoad(query) {

    // 用户id
    const { id } = wx.getStorageSync('userData')
    let { scene } = query

    scene = scene && scene !== 'undefined' ? scene : false

    const { data: { tits }, desc } = this
    // 获取答案数据
    http.post('searchSchool', {
      quizId: 2,
      userId: scene ? scene : id
    }).then(res => {
      const { data } = res
      // 未答题
      if (res.data == null) {
        wx.reLaunch({ url: '../index/index' });
      } else {
        const { result, images } = data
        Object.assign(this, { userId: id, resType: images })
        const tar = result.split('|')
        this.drawLine(172, 8, tar[1].split(','))
        this.setData({
          maxList: tar[0].split(',').map(item => ({
            idx: item,
            tit: tits[item],
            txt: desc[item]
          })),
          scene
        })
        this.getListHeight(0)
      }
    })

  },
  //  用户点击右上角分享
  onShareAppMessage() {
    return shareLink('/pages/examSec/index/index', '你的好友向你推荐这个专业测试，快来测测吧！', null, `examSec/shareImg.png`)
  },
  // 点击切换
  handleTabChange(e) {
    this.getListHeight(e.target.dataset.idx)
  },
  // 切换tab
  tabChange(e) {
    const { current, source } = e.detail
    if (source === 'touch') {
      this.getListHeight(current)
    }
  },
  // 跳转分享
  handleShare() {
    wx.showToast({
      title: '正在生成..',
      icon: 'loading',
      duration: 60000,
    })
    const { resType, data: { imgUrl }, userId, drawShare } = this
    // 生成二维码
    http.post('creatMImg', {
      page: 'pages/examSec/result/index',
      release: 'MARKET',
      scene: userId,
      width: 200
    }, { loadingHid: true }).then(res => {
      return saveBase64Image(`base64Tmp_${userId}`, res.data)
    }).then(codeImg => {
      // 下载背景图
      wx.downloadFile({
        url: `${imgUrl}res${resType}.png`,
        success(res) {
          drawShare(res.tempFilePath, codeImg)
        },
      })
    })
  },
  // 分享图
  drawShare(bg, codeImg) {
    // 使用 wx.createContext 获取绘图上下文 ctx
    const ctx = wx.createCanvasContext('share')
    ctx.scale(pr, pr)

    // 画图
    ctx.drawImage(bg, 0, 0, 375, 717, 0, 0)
    ctx.drawImage(codeImg, 244, 609, 100, 100, 0, 0)

    ctx.draw(false, res => {
      // 生成图片
      wx.canvasToTempFilePath({
        canvasId: 'share',
        success: res => {
          // 下载分享图片
          wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
          wx.showToast({
            title: '已保存, 请分享至朋友圈',
            icon: 'none',
            duration: 1000,
          })
        },
      })
    })
  },
  // tab内容高度
  getListHeight(n) {
    const query = wx.createSelectorQuery()
    query.select(`#tabList${n}`).boundingClientRect(res => {
      this.setData({
        tabH: res.height,
        tabIdx: n - 0
      })
    }).exec()
  },
  // 能力值
  drawLine(radius, side, ability_value) {
    // 使用 wx.createContext 获取绘图上下文 ctx
    const ctx = wx.createCanvasContext('top')
    ctx.scale(pr, pr)

    const center = radius * 0.5;
    const theta = Math.PI * 2 / side;

    //绘制能力多边形
    ctx.beginPath();
    for (let i = 0; i <= side; i++) {
      const x = Math.cos(i * theta + Math.PI / 2) * center * ability_value[i % side] + center;
      const y = -Math.sin(i * theta + Math.PI / 2) * center * ability_value[i % side] + center;
      ctx.lineTo(x, y);
    }

    // 填充色
    const grd = ctx.createLinearGradient(0, 0, 0, 172)
    grd.addColorStop(0, 'rgba(0, 235, 255, 0.7)')
    grd.addColorStop(1, 'rgba(228, 0, 255, 0.7)')

    // 填充色
    ctx.setFillStyle(grd)
    ctx.fill()
    // 画线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.draw()
  },
  goMoreTest() {
    wx.navigateTo({ url: '/pages/exams/examineMore/index' });
  },
  data: {
    imgUrl: imgUrl + 'examSec/',
    tabH: 0,
    tabIdx: 0,
    chk: false,
    ttid: false,
    maxList: [],
    goTest() {
      wx.reLaunch({ url: '../index/index' });
    },
    tits: ['人际社交潜能', '音乐艺术潜能', '肢体运动潜能', '空间推理潜能', '数理逻辑潜能', '内省感知潜能', '自然观察潜能', '语言文字潜能'],
    tabData1: [{
      sub: '团队游戏、体育、聊天、帮助、志愿工作',
      msgTit: '利用人际社交潜能提高学习兴趣',
      txt: 'A.多多参与集体学习。\nB.给别人当小老师。\nC.多参与义工服务、课外活动等能和朋友一起工作的事情，提升学习效率。',
    }, {
      sub: '唱歌、打鼓、韵律、吹口哨',
      msgTit: '利用音乐艺术潜能提高学习兴趣',
      txt: 'A.通过唱、拍打或使用节拍器等方式辅助学习。\nB.创造学习乐器的环境，充分发挥能力。\nC.在有音乐的环境中学习其效率或会更高。',
    }, {
      sub: '篮球、跆拳道、魔术、手工、舞蹈、跑步',
      msgTit: '利用肢体运动潜能提高学习兴趣',
      txt: 'A.创造修玩具、修机器、做模型、做木工、做陶土的机会。\nB.运动、跳舞、跑步或参与其它消耗体力的互动。\nC.利用角色表演、戏剧、手脚比划等方式学习。',
    }, {
      sub: '涂鸦、摄影、造型、设计',
      msgTit: '利用空间推理潜能提高学习兴趣',
      txt: 'A.利用照片、图画、地图或表格佐以学习，通过思维导图和彩笔制作笔记。\nB.观察各种地图或建筑物，尝试画出其结构。\nC.一起制作手工制品，折纸，拼接组合玩具积木，模拟不同的建筑物构造。',
    }, {
      sub: '国际象棋、拼图、电脑、数独',
      msgTit: '利用数理逻辑潜能提高学习兴趣',
      txt: 'A.发散思维，探索新想法，一道题想出多种解释方法。\nB.玩棋类、数独或益智玩具等逻辑性强的游戏。\nC.到需要科学思考的地方玩，比如自然博物馆、科技馆等。',
    }, {
      sub: '思考、调查、规划人生目标、写日记',
      msgTit: '利用内省感知潜能提高学习兴趣',
      txt: 'A.提供机会独处，自我觉察，有自我选择的空间。\nB.可以做独立研究和个人化的计划及游戏。\nC.尊重他们的隐私，家中有可以安静追求兴趣爱好、不被打扰的空间。',
    }, {
      sub: '训练宠物、养鱼、户外活动、栽花种树',
      msgTit: '利用自然观察潜能提高学习兴趣',
      txt: 'A.观察环境中的人、事、物，并试着了解、分类和归纳。\nB.多去大自然中行走或露营，在家中设小花园或菜园甚至可以养宠物。\nC.理清复杂的事物，分门别类，例如列出赏鸟清单或做汽车分类。',
    }, {
      sub: '文字游戏、诗歌、讲故事、歌词、朗读',
      msgTit: '利用语言文字潜能提高学习兴趣',
      txt: 'A.创造多种与语文接触的机会，比如去图书馆、读书、写日记、玩文字游戏等。\nB.多给自己找一些讲故事、演讲或辩论的机会。\nC.担任讲解员或小老师，教授他人知识。',
    }],
    tabData2: [{
      t1: '市场推广、公共关系、服务、销售、教育、商业管理、护理学、人力资源管理',
      t2: '教师、公共关系、社会工作者、销售',
    }, {
      t1: '声乐、作曲、合唱、乐团、指挥',
      t2: '作曲家、指挥家、歌唱家、乐师、乐器制作者、音乐评论家',
    }, {
      t1: '戏剧、舞蹈、运动、健身',
      t2: '运动员、教练、演员、舞蹈家、外科医生、工匠',
    }, {
      t1: '视觉设计、服装设计、建筑、工程、航空、地理、摄影、广告、平面设计',
      t2: '摄影师、工程师、建筑设计师、室内设计师、飞行员',
    }, {
      t1: '计算机、经济学、工程学、会计学、医学、化学、物理学、统计学',
      t2: '数学家、会计、精算师、科学家',
    }, {
      t1: '创意写作、哲学、心理学',
      t2: '政治家、哲学家、心理咨询师、教师',
    }, {
      t1: '生物学、生态学、园艺学、动物学、地质、海洋、农业、烹饪',
      t2: '生物学家、兽医、生态环境学家、园艺师、环保人士、地质家、社会学家、人类研究学家',
    }, {
      t1: '文学、社会学、语言学、新闻学、教育学、哲学',
      t2: '作家、演说家、记者、编辑、节目主持人、播音员、律师、教师',
    }],
  },
  desc: [
    '人际社交潜能主要是指对他人的面部表情、声音和动作的敏感性，以及觉察并辨识他人情绪想法与意向动机的潜能，表现为喜欢参与团体活动，在人群中比较感到舒服自在，学习时常透过与他人的回馈来思考。',
    '音乐艺术潜能主要是指能敏感地感知音调、旋律、节奏和音色等能力，表现为喜欢听音乐，唱歌，节奏感强，学习时常透过节奏旋律来记忆思考。',
    '肢体运动潜能主要是善于运用整个身体来表达想法和感觉，并能运用双手灵巧地生产或改造事物的能力，表现为喜欢动手制作东西，喜欢户外运营，与人谈话时常用手势或其它肢体语言，他们很难长时间坐着不动，学习时常是透过身体感觉来思考。',
    '空间推理潜能主要是能准确感受并表达出色线条、形状结构、空间关系等要素的能力，表现为喜欢运用颜色、线条、形状表现内心想法，学习时常是用图像来思考。',
    '数理逻辑潜能主要是掌握数字运算和了解逻辑、推理思考的能力，表现为喜欢透过推理来思考，喜欢提出问题并寻找事物的逻辑与规律，学习时常是用数学推理来思考。',
    '内省感知潜能主要是指了解自己的长处与短处，能够自省自律，会吸收他人的长处能力，表现为喜欢独处，对自己的生活有规划，学习时常是深入地自我思考。',
    '自然观察潜能是能认识动物、植物和其它自然环境中事物的能力，表现为喜欢大自然或喜欢社会现象，学习时常通过观察和归纳的方式来思考。',
    '语言文字潜能主要是指能掌握并灵活运用口头语言及文字的能力，即听说读写能力，表现为能顺畅且有效地利用语言描述事件、表达想法和与他人交流，学习时常是通过与他人交流求助或参阅书籍来思考。'
  ]
})
