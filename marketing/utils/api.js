import apis from './urls'
export const config = {
  // 打印日志
  logs: false,
  // 测试环境
  test: false,
};

/*
* 全局请求地址
* 若有新地址，在添加对应对象
* @cs：测试环境
* @zs：正式环境
* */
const urls = {
  default: {
    cs: 'https://www.vipboluo.com/',
    // cs: 'http://192.168.0.112:8000/',
    zs: 'https://api.vipboluo.com/'
  }
};

// 图片地址
// export const imgUrl = () => `${urls.default[config.test ? 'cs' : 'zs']}filesinfo/market/images/`
export const imgUrl = 'https://api.vipboluo.com/filesinfo/market/images/'

/*
* 获取地址
* @param: api
* @type: string/Object
* 使用默认地址直接传字符串，使用新地址传对象
* @address: 新地址对应key
* @apiType: 接口对应key
* */
export const getAddress = (api = 'null') => {
  const { test } = config;
  let link = 'default';
  if (typeof api === 'object') {
    const { address, apiType } = api
    link = address
    api = apiType
  }
  return urls[link][test ? 'cs' : 'zs'] + apis[api]
};

// 分享跳转
export const shareLink = (path, title, params, img) => {
  if (params) {
    path += '?';
    Object.keys(params).forEach((key, index) => {
      if (index === 0) {
        path += key + '=' + params[key];
      } else {
        path += '&&' + key + '=' + params[key];
      }
    })
  }
  return {
    title: title,
    path,
    imageUrl: `${imgUrl}${img}`,
    success() {
      wx.showToast({
        title: '转发成功',
        icon: 'none',
        duration: 1000
      })
    },
    fail(err) {
      console.log(err)
    }
  }
}
