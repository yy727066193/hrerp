import api from './api'
import Request from '../utils/Request'

const request = new Request();

export default {
  SelectSessionId(params) {
    return request.apiPost(api.SelectSessionId, params);
  },
  Company: { // 公司
    listAll(params) {
      return request.apiGet(api.Company.listAll, params)
    }
  },
  Department: { // 部门
    listAll(params) {
      return request.apiGet(api.Department.listAll, params)
    }
  },
  Employee: {
    listAll(params) {
      return request.apiGet(api.Employee.listAll, params)
    },
    getStoreEmployee(params) {
      return request.apiPost(api.Employee.getStoreEmployee, params)
    }
  },
  Store: {
    listAll(params) {
      return request.apiGet(api.Store.listAll, params)
    }
  },
}
