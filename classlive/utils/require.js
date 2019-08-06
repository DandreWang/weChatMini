// "http://boluo.nat100.top",
// "https://api.vipboluo.com/", //线上地址
// "https://testapi.vipboluo.com/", //测试地址
// "https://talkwechat.vipboluo.com/", //外链线上地址
// "https://wechat.boluozaixian.com/", //外链测试地址
const u = 'api.vipboluo.com';
// const u = 'www.vipboluo.com';

export const baseUrl = `https://${u}/`;
export const SocketUrl = `wss://${u}/`;//测试服地址
// export const baseUrl='http://192.168.0.112:8000/'
// 外链页面测试地址
export const linkUrl = 'https://wechat.boluozaixian.com/';
// 文件地址
export const fileUrl = `https://${u}/filesinfo/`;
// 图片地址
export const imgUrl = `https://${u}/filesinfo/pages/`;

const paramSession = [{},
{ 'content-type': 'application/json'},
{ 'content-type': 'application/x-www-form-urlencoded' }]
const wxRequest = (method, url, data, sessionChoose, Success, Fail) => {
  wx.showLoading({
    title: '加载...',
  })
  wx.request({
    url: baseUrl + url,
    data: data,
    dataType: "json",
    header: paramSession[sessionChoose],
    method,
    success: sres => {
      wx.hideLoading();
      Success(sres);
    },
    fail: fres => {
      wx.hideLoading();
      Fail(fres);
    }
  })
}

const HTTP = {
  post(url, data) {
    return new Promise((suc, err) => {
      wxRequest("POST", url, data,1 ,suc, err)
    });
  },
  get(url, data) {
    return new Promise((suc, err) => {
      wxRequest("GET", url, data,1 ,suc, err)
    });
  },
  timeoutErr () {
    wx.showToast({
      title: '请求超时',
      icon: 'fail',
      image: `${imgUrl}public/x.png`,
      duration: 1000,
      mask: true
    });
  },
  upload (filePath, subPath, success, fail) {
    wx.uploadFile({
      url: baseUrl + 'file/upload',
      filePath,
      name: 'multipartFile',
      formData: { subPath },
      success,
      fail
    });
  }
}


//判断用户是否授权
const checkAuthorize = () => {
  const openid = wx.getStorageSync('openId');
  const userInfo = wx.getStorageSync('userInfo');
  const type = wx.getStorageSync('type');
  const id = wx.getStorageSync('id');
  if (!openid || !userInfo || !type || !id) {
    // 本地没有用户信息
    wx.reLaunch({
      url: '/pages/login/login'
    });
    return false;
  } else {
    return {
      openid, id, type, userInfo
    };
  }
}

// 分享跳转
const shareLink = (that, title, params) => {
  let path = that.route;
  if(params){
    path += '?';
    Object.keys(params).forEach((key,index) =>{
      if (index === 0) {
        path = path + key + '=' + params[key];
      } else {
        path = path + '&&'+ key + '=' + params[key];
      }
    })
  }
  return {
    title: title,
    path
  }
}

export default{
  get: HTTP.get,
  post: HTTP.post,
  upload: HTTP.upload,
  timeoutErr: HTTP.timeoutErr,
  checkAuthorize,
  shareLink
}
