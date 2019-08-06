export const formatTime = (number, format) => {
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
  n = n.toString();
  return n[1] ? n : '0' + n
}

export const saveBase64Image = (fileName, base64data) => {
  return new Promise((resolve, reject) => {
    const fsm = wx.getFileSystemManager();
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      reject(new Error('ERROR_BASE64SRC_PARSE'));
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}.${format}`;
    fsm.writeFile({
      filePath,
      data: wx.base64ToArrayBuffer(bodyData),
      encoding: 'binary',
      success() {
        resolve(filePath);
      },
      fail() {
        reject(new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  });
}

export const getSysPr = (cb) => {
  wx.getSystemInfoSync({
    //获取系统信息
    success(res) {
      cb && typeof cb === 'function' && cb(res.windowWidth / 375)
    }
  })
}
