import api from './api'
import Request from '../utils/Request'

const request = new Request();

export default {
  GoodsType: { // 货品分类
    listAll(params) {
      return request.apiPost(api.GoodsType.listAll, params)
    },
    addOne(params) {
      return request.apiPost(api.GoodsType.addOne, params)
    },
    updateOne(params) {
      return request.apiPost(api.GoodsType.updateOne, params)
    }
  },
  GoodsUnit: { // 货品单位
    selectAll(params) {
      return request.apiPost(api.GoodsUnit.selectAll, params)
    },
    addOne(params) {
      return request.apiPost(api.GoodsUnit.addOne, params)
    },
    updateOne(params) {
      return request.apiPost(api.GoodsUnit.updateOne, params)
    }
  },
  PackageUnit: { // 包装单位
    selectAll(params) {
      return request.apiPost(api.PackageUnit.selectAll, params)
    },
    addOne(params) {
      return request.apiPost(api.PackageUnit.addOne, params)
    },
    updateOne(params) {
      return request.apiPost(api.PackageUnit.updateOne, params)
    }
  },
  SupplyGoods: { // 供应商
    selectAll(params) {
      return request.apiPost(api.SupplyGoods.selectAll, params)
    },
    addOne(params) {
      return request.apiPost(api.SupplyGoods.addOne, params)
    },
    updateOne(params) {
      return request.apiPost(api.SupplyGoods.updateOne, params)
    }
  },
  GoodsBrand: {   // 品牌
    selectAll(params) {
      return request.apiPost(api.GoodsBrand.selectAll, params)
    },
    addOne(params) {
      return request.apiPost(api.GoodsBrand.addOne, params)
    },
    updateOne(params) {
      return request.apiPost(api.GoodsBrand.updateOne, params)
    }
  },
  GoodsLabel: {   // 标签
    selectAll(params) {
      return request.apiPost(api.GoodsLabel.selectAll, params)
    },
    addOne(params) {
      return request.apiPost(api.GoodsLabel.addOne, params)
    },
    updateOne(params) {
      return request.apiPost(api.GoodsLabel.updateOne, params)
    }
  },
  GiveIntSet: {   // 配置积分赠送
    selectAll(params) {
      return request.apiPost(api.GiveIntSet.selectAll, params)
    },
    updateOne(params) {
      return request.apiPost(api.GiveIntSet.updateOne, params)
    },
    addOne(params) {
      return request.apiPost(api.GiveIntSet.addOne, params)
    }
  },
  UnitModel: {   // 规格型号
    selectAll(params) {
      return request.apiPost(api.UnitModel.selectAll, params)
    },
    addOne(params) {
      return request.apiPost(api.UnitModel.addOne, params)
    },
    updateOne(params) {
      return request.apiJson(api.UnitModel.updateOne, params)
    },
    addOneUnit(params) {
      return request.apiPost(api.UnitModel.addOneUnit, params)
    },
    updateOneUnit(params) {
      return request.apiPost(api.UnitModel.updateOneUnit, params)
    },
  },
  AddUpdateGoods: {   // 添加货品
    setProp(params) {   // 获取下拉属性列表
      return request.apiGet(api.AddUpdateGoods.setProp, params)
    },
    addOne(params) {   // 添加货品
      return request.apiJson(api.AddUpdateGoods.addOne, params)
    }
  },
  PreviewVisibleList: {   // 货品库列表
    selectAll(params) {
      return request.apiPost(api.PreviewVisibleList.selectAll, params)
    },
    updateOne(params) {
      return request.apiJson(api.PreviewVisibleList.updateOne, params)
    },
    selectStartStop(params) {
      return request.apiPost(api.PreviewVisibleList.selectStartStop, params)
    },
    updateStartStop(params) {
      return request.apiJson(api.PreviewVisibleList.updateStartStop, params)
    },
    setIntegralList(params) {
      return request.apiPost(api.PreviewVisibleList.setIntegralList, params)
    },
    setIntegral(params) {
      return request.apiPost(api.PreviewVisibleList.setIntegral, params)
    },
    addInsertOne(params) {
      return request.apiJson(api.PreviewVisibleList.addInsertOne, params)
    },
    getParentListAll(params) {
      return request.apiPost(api.PreviewVisibleList.getParentListAll, params)
    }
  },
  CompanyGoodsList: {   // 公司货品列表
    selectAll(params) {
      return request.apiPost(api.CompanyGoodsList.selectAll, params)
    },
    updateOne(params) {
      return request.apiPost(api.CompanyGoodsList.updateOne, params)
    }
  },
  StoreGoodsList: {   // 门店货品列表
    selectAll(params) {
      return request.apiPost(api.StoreGoodsList.selectAll, params)
    },
    updateOne(params) {
      return request.apiPost(api.StoreGoodsList.updateOne, params)
    }
  },
  GoodsAuth: {   // 货品授权
    selectAll(params) {
      return request.apiPost(api.GoodsAuth.selectAll, params)
    },
    updateOne(params) {
      return request.apiJson(api.GoodsAuth.updateOne, params)
    },
    addOne(params) {
      return request.apiJson(api.GoodsAuth.addOne, params)
    },
    addAuthGoods(params) {
      return request.apiJson(api.GoodsAuth.addAuthGoods, params)
    },
    authGoodsStore(params) {
      return request.apiJson(api.GoodsAuth.authGoodsStore, params)
    },
    authStoreGoods(params) {
      return request.apiPost(api.GoodsAuth.authStoreGoods, params)
    },
    deleteAuthGoods(params) {
      return request.apiJson(api.GoodsAuth.deleteAuthGoods, params)
    }
  },
  componyStore: { //
    selectAll(params) {
      return request.apiGet(api.componyStore.selectAll, params)
    },
    updateNumber(params) {
      return request.apiPost(api.componyStore.updateNumber, params)
    },
    goodsDetailList(params) {
      return request.apiGet(api.componyStore.goodsDetailList, params)
    },
    addInAndOutData(params) {
      return request.apiJson(api.componyStore.addInAndOutData, params)
    }
  },
  boundOrders: {
    ordersList(params) {
      return request.apiGet(api.boundOrders.ordersList, params)
    },
    transferList(params) {
      return request.apiGet(api.boundOrders.transferList, params)
    },
    countList(params) {
      return request.apiGet(api.boundOrders.countList, params)
    },
    inAndOutApprovalList(params) {
      return request.apiGet(api.boundOrders.inAndOutApprovalList, params)
    },
    approvalStatus(params) {
      return request.apiGet(api.boundOrders.approvalStatus, params)
    },
    setApprovalMes(params) {
      return request.apiPost(api.boundOrders.setApprovalMes, params)
    },
    generoteNumber(params) {
      return request.apiPost(api.boundOrders.generoteNumber, params)
    },
    getTypeList(params) {
      return request.apiGet(api.boundOrders.getTypeList, params)
    },
    getStoreList(params) {
      return request.apiGet(api.boundOrders.getStoreList, params)
    },
    getAllLogList(params) {
      return request.apiGet(api.boundOrders.getAllLogList, params)
    },
    downTemplate(params) {
      return request.apiGet(api.boundOrders.downTemplate, params)
    },
    getResult(params) {
      return request.apiJson(api.boundOrders.getResult, params)
    },
    requisitionDetail(params) {
      return request.apiGet(api.boundOrders.requisitionDetail, params)
    },
    countOrderDetail(params) {
      return request.apiGet(api.boundOrders.countOrderDetail, params)
    },
    getAllShelfNum(params) {
      return request.apiGet(api.boundOrders.getAllShelfNum, params)
    },
    addNewRequisitionList(params) {
      return request.apiJson(api.boundOrders.addNewRequisitionList, params)
    },
    reverseApproval(params) {
      return request.apiPost(api.boundOrders.reverseApproval, params)
    },
    exportRequisition(params) {
      return request.apiGet(api.boundOrders.exportRequisition, params)
    },
    goodsListAll(params) {
      return request.apiPost(api.boundOrders.goodsListAll, params)
    },
    getStoreListByCompanyId(params) {
      return request.apiGet(api.boundOrders.getStoreListByCompanyId, params)
    },
    getAllTransitUnit(params) {
      return request.apiPost(api.boundOrders.getAllTransitUnit, params)
    },
    requisitionApproval(params) {
      return request.apiPost(api.boundOrders.requisitionApproval, params)
    },
    reApprovalSubmit(params) {
      return request.apiJson(api.boundOrders.reApprovalSubmit, params)
    }

  },
  storeAndShelf: {
    selectAllStoreList(params) {
      return request.apiGet(api.storeAndShelf.selectAllStoreList, params)
    },
    addNewStore(params) {
      return request.apiPost(api.storeAndShelf.addNewStore, params)
    },
    updateNewStore(params) {
      return request.apiPost(api.storeAndShelf.updateNewStore, params)
    },
    selectAllShelfList(params) {
      return request.apiGet(api.storeAndShelf.selectAllShelfList, params)
    },
    addNewShelf(params) {
      return request.apiPost(api.storeAndShelf.addNewShelf, params)
    },
    updateNewShelf(params) {
      return request.apiPost(api.storeAndShelf.updateNewShelf, params)
    },
    selectAllApprovalList(params) {
      return request.apiGet(api.storeAndShelf.selectAllApprovalList, params)
    },
    getNewApprovalData(params) {
      return request.apiJson(api.storeAndShelf.getNewApprovalData, params)
    },
    updateNewApprovalData(params) {
      return request.apiJson(api.storeAndShelf.updateNewApprovalData, params)
    },
    setIsCanUse(params) {
      return request.apiPost(api.storeAndShelf.setIsCanUse, params)
    },
    shelfGoodsList(params) {
      return request.apiGet(api.storeAndShelf.shelfGoodsList, params)
    },
    shelfAdjust(params) {
      return request.apiJson(api.storeAndShelf.shelfAdjust, params)
    }
  },
  MealList: { // 套餐分类
    selectAll(params) {
      return request.apiPost(api.MealList.selectAll, params);
    },
    addOne(params) {
      return request.apiJson(api.MealList.addOne, params)
    },
    updateOne(params) {
      return request.apiJson(api.MealList.updateOne, params)
    },
    detailOne(params) {
      return request.apiPost(api.MealList.detailOne, params);
    },
    formatGoodsList(params) {
      return request.apiJson(api.MealList.formatGoodsList, params);
    },
    updateGoodsList(params) {
      return request.apiJson(api.MealList.updateGoodsList, params)
    },
    selectStatus(params) {
      return request.apiPost(api.MealList.selectStatus, params);
    },
    updateStatus(params) {
      return request.apiJson(api.MealList.updateStatus, params);
    }
  },
  CompanyMealList: { // 公司套餐列表
    selectAll(params) {
      return request.apiPost(api.CompanyMealList.selectAll, params);
    }
  },
  StoreMealList: { // 门店套餐列表
    selectAll(params) {
      return request.apiPost(api.StoreMealList.selectAll, params);
    }
  },
  OrderManagement: {
    selectAllGoodsOrder(params) {
      return request.apiPost(api.OrderManagement.selectAllGoodsOrder, params);
    },
    getReturnGoodsByOrderNum(params) {
      return request.apiPost(api.OrderManagement.getReturnGoodsByOrderNum, params);
    },
    getNextApprovalMan(params) {
      return request.apiPost(api.OrderManagement.getNextApprovalMan, params);
    },
    submitReturnMessage(params) {
      return request.apiJson(api.OrderManagement.submitReturnMessage, params);
    },
    returnBackOrderList(params) {
      return request.apiPost(api.OrderManagement.returnBackOrderList, params);
    },
    approvalCommonDetail(params) {
      return request.apiJson(api.OrderManagement.approvalCommonDetail, params);
    },
    customerApproval(params) {
      return request.apiJson(api.OrderManagement.customerApproval, params);
    },
    approvalPageDetai(params) {
      return request.apiPost(api.OrderManagement.approvalPageDetai, params);
    },
    mailGoodsSubmit(params) {
      return request.apiJson(api.OrderManagement.mailGoodsSubmit, params);
    },
    customerAcceptSubmit(params) {
      return request.apiJson(api.OrderManagement.customerAcceptSubmit, params);
    },
    logisticsApprovalSubmit(params) {
      return request.apiJson(api.OrderManagement.logisticsApprovalSubmit, params);
    },
    getDepotAll(params) {
      return request.apiGet(api.OrderManagement.getDepotAll, params);
    },
    finaceApprovalSubmit(params) {
      return request.apiJson(api.OrderManagement.finaceApprovalSubmit, params);
    }
  }
}
