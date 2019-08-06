const formatTime = (number, format) => {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  let returnArr = [];
  const date = new Date(number);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));
  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));
  for (let i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const jumpToMarketPrm = (path = '', param = {}) => {
  wx.navigateToMiniProgram({
    appId: 'wx70691410297a3d39',
    path,
    extraData: {},
    // envVersion: 'develop',
    ...param
  })
}

module.exports = {
  formatTime,
  jumpToMarketPrm
}


