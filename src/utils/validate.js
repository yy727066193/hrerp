/**
 * antd form 手机号验证
 * @param {any}      rule      不知道是啥
 * @param {number}   value     值
 * @param {function} callback  回调
 * */
export function validMobile (rule, value, callback)  {
  const reg = /^1[3456789][0-9]{9}$/;

  if (value) {
    if (!reg.test(value)) {
      callback('手机号不合法')
    }
  }

  callback();
}

/**
 * 验证字字符长度
 * @param {any}      rule      不知道是啥
 * @param {number}   value     值
 * @param {function} callback  回调
 * */
export function validRemark (rule, value, callback)  {
  if (!value) {
    callback();
    return;
  }

  if (value.length >= 80) {
    callback('字符过长')
  }

  callback();
}

export function validAddressLength (rule, value, callback)  {
  if (!value) {
    callback();
    return;
  }

  if (value.length >= 70) {
    callback('字符长度不能大于70')
  }

  callback();
}

export function validFloor (rule, value, callback)  {
  const reg = /^([1-9]|[1-9]\\d|9)$/;

  if (value) {
    if (!reg.test(value)) {
      callback('请输入1-9的整数')
    }
  }
  callback();
}

export function validSet (rule, value, callback)  {
  const reg = /^[1-9][0-9]{0,1}$/;

  if (value) {
    if (!reg.test(value)) {
      callback('请输入1-99的整数')
    }
  }
  callback();
}

export function validLetter (rule, value, callback)  {
  const reg = /^[A-Z]$/;

  if (value) {
    if (!reg.test(value)) {
      callback('请输入大写英文字母')
    }
  }
  callback();
}

export function validateOrderNum (rule, value, callback) {
  const reg = /^[0-9a-zA-Z]{0,20}$/;

  if (value) {
    if (!reg.test(value)) {
      callback('请输入正确的单号')
    }
  }
  callback();
}

