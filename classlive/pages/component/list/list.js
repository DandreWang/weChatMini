import api, { imgUrl } from '../../../utils/require.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageSize: {
      type: Number,
      value: 10,
    },
    empTxt: {
      type: String,
      value: '暂无内容',
    },
    slideshowType: {
      type: Number,
      value: 0,
    }
  },
  //组件生命周期
  lifetimes: {
    created() {
    },
    // 在组件实例进入页面节点树时执行
    attached() {
      this.getData();
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: imgUrl + 'public/',
    refreshStatus: false,
    refreshTime: '',
    list: [],
    pageNum: 0,
    allPages: 1,
    scrollTop: 0,
    backFlg: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    jump(event) {
      wx.navigateTo({
        url: '../detail/detail?id=' + event.currentTarget.dataset.id
      });
    },
    getData() {

      const { refreshStatus, pageNum, allPages, list, slideshowType, pageSize } = this.data;

      if (refreshStatus || pageNum >= allPages) {
        return;
      }
      this.setData({
        refreshTime: new Date().toLocaleTimeString(),
        refreshStatus: true,
      });
      const np = pageNum + 1;

      api.post('course/searchweb', {
        title: '',
        type: 1,
        slideshowType,
        pageNum: np,
        pageSize
      }).then(sres => {
        const { pages, list: rlist } = sres.data.data;
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
    bindscroll(e) {
      const { backFlg } = this.data;
      if (backFlg === e.scrollTop > 500) {
        this.setData({ backFlg: !backFlg });
      }
    }
  }
})
