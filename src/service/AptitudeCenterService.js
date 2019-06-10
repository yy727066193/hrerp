import api from './api'
import Request from '../utils/Request'

const request = new Request();

export default {
  AptitudeClassify: {   // 资质分类
    listAll(params) {
      return request.apiGet(api.AptitudeClassify.listAll, params);
    },
    addOne(params) {
      return request.apiPost(api.AptitudeClassify.addOne, params);
    },
    delete(params) {
      return request.apiGet(api.AptitudeClassify.delete, params);
    },
    updateOne(params) {
      return request.apiPost(api.AptitudeClassify.updateOne, params);
    },
  },
  AptitudeCatalog: {   // 资质目录分类
    listAll(params) {
      return request.apiGet(api.AptitudeCatalog.listAll, params);
    },
    addOne(params) {
      return request.apiPost(api.AptitudeCatalog.addOne, params);
    },
    delete(params) {
      return request.apiGet(api.AptitudeCatalog.delete, params);
    },
    updateOne(params) {
      return request.apiPost(api.AptitudeCatalog.updateOne, params);
    },
  },
  AptitudeGoodsCatalog: {   // 货品资质目录
    listAll(params) {
      return request.apiGet(api.AptitudeGoodsCatalog.listAll, params);
    },
    addOne(params) {
      return request.apiPost(api.AptitudeGoodsCatalog.addOne, params);
    },
    delete(params) {
      return request.apiGet(api.AptitudeGoodsCatalog.delete, params);
    },
    updateOne(params) {
      return request.apiPost(api.AptitudeGoodsCatalog.updateOne, params);
    },
  },
  AptitudeGoodsFile: {   // 货品资质文件
    listAll(params) {
      return request.apiGet(api.AptitudeGoodsFile.listAll, params);
    },
    addOne(params) {
      return request.apiPost(api.AptitudeGoodsFile.addOne, params);
    },
    delete(params) {
      return request.apiGet(api.AptitudeGoodsFile.delete, params);
    },
    updateOne(params) {
      return request.apiPost(api.AptitudeGoodsFile.updateOne, params);
    },
    getFactoryList(params) {
      return request.apiGet(api.AptitudeGoodsFile.getFactoryList, params);
    }
  }
}
