import { message } from 'antd'
import {SUCCESS_MSG} from "../conf";

export default {
  S: (msg=SUCCESS_MSG) => {
    message.success(msg)
  },
  W: (msg='系统繁忙') => {
    message.warning(msg)
  },
  E: (msg='系统异常') => {
    message.error(msg);
  }
}
