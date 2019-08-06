import api from '../../utils/require.js'

Page({
  data: {
  },
  handleSubmit(e){
    const {
      content, name, mobile
    } = e.detail.value;
    if (content.trim() === '') {
      return wx.showToast({
        title: "请填写留言内容",
        icon: "none",
      })
    }
    if (mobile.trim() === '') {
      return wx.showToast({
        title: "请填写电话号码",
        icon: "none",
      })
    } else if (!/^(0|86|17951)?(13[0-9]|15[012356789]|166|17[0135678]|19[89]|18[0-9]|14[57])[0-9]{8}$/.test(mobile)) {
      return wx.showToast({
        title: "请填写正确的电话号码",
        icon: "none",
      })
    }
    api.post(`feedback/add`, { content, name, mobile, userId: wx.getStorageSync('id') }).then(res => {
      wx.showToast({
        title: "发送成功",
      })
      setTimeout(() => {
        wx.navigateBack();
      }, 800)
    })
  }
})