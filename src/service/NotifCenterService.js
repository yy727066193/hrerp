import api from './api'
import Request from '../utils/Request'

const request = new Request();

export default {
  NotifCenter: {
    listAll(params) {
      return request.apiGet(api.NotifCenter.listAll, params);
    },
    addOne(params) {
      return request.apiPost(api.NotifCenter.addOne, params);
    },
    getNotifyCount(params) {
      return request.apiGet(api.NotifCenter.getNotifyCount, params);
    },
    clickBell(params) {
      return request.apiGet(api.NotifCenter.clickBell, params);
    }
  }
}
