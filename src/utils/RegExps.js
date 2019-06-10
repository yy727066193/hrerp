
// 手机号验证
export const validMobile = /^1[3456789][0-9]{9}$/;   

// 电话号码验证（手机号码为11位，第一位为数字1， 第二位是3-9的数字，后9为为任意数）
export const validPhoneNumber = /^0\d{2,3}-?\d{7,8}$/;   

// 身份证验证（身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X）
export const validCardNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;   

// 验证开头不为0的15位到19位银行卡号
export const validBankNo = /^([1-9]{1})(\d{14,19})$/;

// 只能输入字母，数字或字母数字组合
export const validNumEng = /^[0-9a-zA-Z]*$/g;  

// 特殊字符
export const validChar = /^[^-!@#$%^&*_+<>?,\\|/;'·！#￥——：；“”‘、，|《。》？、【】]*$/im;  