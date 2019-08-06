export default {
  null: '',
  // 获取当前环境
  first: 'comm/getReferer',
  // 告诉后台是哪个小程序
  mark: 'user/jscode2session/',
  // 注册
  register: 'user/saveOne',
  // 解密授权
  decoding: 'user/decoding',
  // 生成小程序码
  creatMImg: 'authorize/getWXACodeUnlimit',
  // 提交答题
  saveAnswer: 'quiz/save',
  // 查询匹配的哪个学校
  searchSchool: 'quiz/searchQuizUser',
  // 表单提交
  submit: 'web/activity/signUp',
  // 获取测试题列表
  getQuizList: 'web/quiz/quizSearch'
};
