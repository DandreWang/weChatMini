Page({
  data: {
    slideshowType: 7,
    empTxt: '暂无内容'
  },
  dict: {
    7: {
      title: '热门精选',
      emp: '暂无内容'
    },
    8: {
      title: '精选专区',
      emp: '暂无精选'
    },
    9: {
      title: '近期讲座',
      emp: '暂无内容'
    },
  },
  onLoad(opt) {
    const {slideshowType: oType} = this.data
    const { slideshowType } = opt
    if (slideshowType && slideshowType !== oType) {
      const { title, emp } = this.dict[slideshowType]
      this.setData({ slideshowType, emp })
      wx.setNavigationBarTitle({ title })
    }
  }
});
