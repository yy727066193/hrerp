import request from 'axios'
import qs from 'qs'
import {getLoginInfo} from "./public";
import helper from "./helper";

export default class Request {
  constructor() {
    request.defaults.params = {};

    // 请求最大时间
    // request.defaults.timeout = 60 * 1000;

    // 请求之前
    request.interceptors.request.use(function (config) {

      return config;
    }, function (error) {
      helper.W();
      return Promise.reject(error);
    });

    // 响应
    request.interceptors.response.use(function (response) {

      return response;
    }, function (error) {
      helper.E();
      return Promise.reject(error);
    });

    // http 返回的状态code
    request.defaults.validateStatus = status => {
      return status >= 200 && status < 300;
    };

    this.instance = request;
    this.employeeAccountId = undefined;
  }
  // get
  apiGet(url='', params={}) {
    this.setPublicParam();

    return new Promise((resolve, reject) => {
      this.instance.get(url, {
        params: { ...params, employeeAccountId: this.employeeAccountId }
      }).then((res) => {
        resolve(res.data)
      })
    })
  }

  // post
  apiPost(url='', params={}) {
    this.setPublicParam();

    return new Promise((resolve, reject) => {
      this.instance.post(url, qs.stringify({
        ...params, employeeAccountId: this.employeeAccountId
      })).then((res) => {
        resolve(res.data)
      })
    })
  }

  // apiJson
  apiJson(url='', params={}) {
    return new Promise((resolve, reject) => {
      this.instance.post(url, params, {headers: { 'Content-Type': 'application/json' }}).then((res) => {
        resolve(res.data);
      })
    })
  }

  setPublicParam = () => {
    const { employeeAccountId } = getLoginInfo();

    if (employeeAccountId) {
      this.employeeAccountId = employeeAccountId;
    }
  }
}
