// const baseCenterService = process.env.NODE_ENV === 'development' ? 'https://zhmd.hbhrlb.com:8085/base-center-service' : 'https://zhmd.hbhrlb.com:8085/base-center-service';
// const goodsCenterService = process.env.NODE_ENV === 'development' ? 'https://zhmd.hbhrlb.com:8088/goods-center-service' : 'https://zhmd.hbhrlb.com:8088/goods-center-service';
// const notifCenterService = process.env.NODE_ENV === 'development' ? 'https://zhmd.hbhrlb.com:8084/file-client-service' : 'https://zhmd.hbhrlb.com:8084/file-client-service';

const baseCenterService = process.env.NODE_ENV === 'development' ? 'http://192.168.8.248:8085/base-center-service' : 'http://192.168.8.248:8085/base-center-service';
const goodsCenterService = process.env.NODE_ENV === 'development' ? 'http://192.168.8.248:8088/goods-center-service' : 'http://192.168.8.248:8088/goods-center-service';
const notifCenterService = process.env.NODE_ENV === 'development' ? 'http://192.168.8.248:8084/file-client-service' : 'http://192.168.8.248:8084/file-client-service';
const aptitudeCenterService = process.env.NODE_ENV === 'development' ? 'http://192.168.8.133:8084/file-client-service' : 'http://192.168.8.133:8084/file-client-service';

export default {
  SelectSessionId: baseCenterService + '/commonLogin/v2/selectBySessionId', // 根据sessionId查询
  Upload: baseCenterService + '/common/v1/static/upload/image', // 上传
  Company: { // 公司
    listAll: baseCenterService + '/company/v1/checkListAll',
  },
  Department: {
    listAll: baseCenterService + '/employeeDepartment/v1/listAll'
  },
  Employee: {
    listAll: baseCenterService + '/employee/v1/selectAll',
    getStoreEmployee: baseCenterService + '/store/v1/selectStoreIdsByEmployeeInfo',
  },
  Store: { // 门店
    listAll: baseCenterService + '/store/v1/listAll',
    getDetail: baseCenterService + '/store/v1/selectStoreIdsByEmployeeInfo'
  },
  GoodsType: { // 货品分类 / 套餐分类
    listAll: goodsCenterService + '/v2/goods/categories/select', // 分类列表
    addOne: goodsCenterService + '/v2/goods/categories/add',
    updateOne: goodsCenterService + '/v2/goods/categories/update',
  },
  GoodsUnit: { // 货品单位
    selectAll: goodsCenterService + '/v2/goods/base/unit/select',
    addOne: goodsCenterService + '/v2/goods/base/unit/insert',
    updateOne: goodsCenterService + '/v2/goods/base/unit/update'
  },
  PackageUnit: { // 包装规格
    selectAll: goodsCenterService + '/v2/goods/packing/unit/select',
    addOne: goodsCenterService + '/v2/goods/packing/unit/insert',
    updateOne: goodsCenterService + '/v2/goods/packing/unit/update'
  },
  SupplyGoods: { // 供应商管理
    selectAll: goodsCenterService + '/v2/goods/provider/select',
    addOne: goodsCenterService + '/v2/goods/provider/insert',   // 供应商管理添加
    updateOne: goodsCenterService + '/v2/goods/provider/update',   // 供应商管理编辑
  },
  GoodsBrand: {   // 品牌管理
    selectAll: goodsCenterService + '/v2/goods/brand/select',   // 品牌管理列表
    addOne: goodsCenterService + '/v2/goods/brand/insert',   // 品牌管理添加
    updateOne: goodsCenterService + '/v2/goods/brand/update',   // 品牌管理编辑
  },
  GoodsLabel: {   // 标签管理
    selectAll: goodsCenterService + '/v2/goods/keywords/select',   // 标签管理列表
    addOne: goodsCenterService + '/v2/goods/keywords/insert',   // 标签管理添加
    updateOne: goodsCenterService + '/v2/goods/keywords/update',   // 标签管理编辑
  },
  GiveIntSet: {   // 积分赠送配置
    selectAll: goodsCenterService + '/v2/goods/Integral/set/select',   // 查询上一条积分兑换金额
    updateOne: goodsCenterService + '/v2/goods/Integral/set/update',   // 积分赠送
    addOne: goodsCenterService + '/v2/goods/Integral/set/insert',   // 新增积分设置
  },
  UnitModel: {   // 规格型号
    selectAll: goodsCenterService + '/v2/goods/spu/tree/select',   // 规格型号列表
    addOne: goodsCenterService + '/v2/goods/spu/insert',   // 规格型号添加
    updateOne: goodsCenterService + '/v2/goods/spu/tree/update',   // 规格型号编辑
    addOneUnit: goodsCenterService + '/v2/goods/base/spu/insert',   // 子规格值添加
    updateOneUnit: goodsCenterService + '/v2/goods/base/spu/update',   // 子规格值编辑
  },
  AddUpdateGoods: {   // 添加货品
    setProp: goodsCenterService + '/v2/goods/attribute/select',   // 获取下拉属性值
    addOne: goodsCenterService + '/v2/goods/base/insert',   // 货品添加
  },
  PreviewVisibleList: {   // 货品库
    selectAll: goodsCenterService + '/v2/goods/base/select',   // 货品库列表
    addInsertOne: goodsCenterService + '/v2/goods/base/update',   // 货品库修改
    selectStartStop: goodsCenterService + '/v2/goods/put/select',   // 公司对应上下架列表
    updateStartStop: goodsCenterService + '/v2/goods/put/insert',   // 修改公司对应上下架
    setIntegral: goodsCenterService + '/v2/goods/company/integral/add',   // 设置积分添加修改
    setIntegralList: goodsCenterService + '/v2/goods/company/integral/list',   // 设置积分列表
    getParentListAll: goodsCenterService + '/v2/goods/base/sku/select/name',   // 获取父级所有货品
  },
  CompanyGoodsList: {   // 公司货品列表
    selectAll: goodsCenterService + '/v2/goods/company/select',   // 公司货品列表
  },
  StoreGoodsList: {   // 门店货品列表
    selectAll: goodsCenterService + '/v2/goods/combo/store/search',   // 门店货品列表
  },
  GoodsAuth: {   // 货品授权
    selectAll: goodsCenterService + '/v2/goods/price/plan/select',   // 货品授权列表
    updateOne: goodsCenterService + '/v2/goods/price/plan/update',   // 货品授权修改
    // authStore: goodsCenterService + '/v2/goods/price/plan/update',   // 授权门店、货品修改(重复)
    addOne: goodsCenterService + '/v2/goods/price/plan/insert',   // 货品授权新增
    authGoodsStore: goodsCenterService + '/v2/goods/store/select',   // 请求门店货品
    authStoreGoods: goodsCenterService + '/v2/goods/price/plan/store/select',   // type 1/2 加载门店/货品   type传1加载授权门店id   type传2 加载授权货品
    deleteAuthGoods: goodsCenterService + '/v2/goods/price/plan/delete',   // 删除已授权的货品或套餐
  },
  componyStore: { // 公司即时库存
    selectAll: goodsCenterService + '/stock/v1/selectStockAll', // 查询公司即时库存列表
    updateNumber: goodsCenterService + '/stock/v1/updateStock', // 修改预警值
    goodsDetailList: goodsCenterService + '/inputOutputDetails/v1/selectInputOutputDetailsList', // 出入库明细列表
    addInAndOutData: goodsCenterService + '/outputInputDepot/v1/addRecords', // 新增出入库数据
  },
  boundOrders: { // 出入库单,调拨单,盘点单
    ordersList: goodsCenterService + '/outputInputDepot/v1/selectOutputInputRecordList', // 出库单列表
    transferList: goodsCenterService + '/allocateRecords/v1/selectAllocateRecordsList', // 调拨单列表
    countList: goodsCenterService + '/inventory/v1/selectInventoryList', // 盘点单列表
    inAndOutApprovalList: goodsCenterService + '/inputOutputDetails/v1/selectInputOutputDetailsList', // 出入库审核列表
    approvalStatus: goodsCenterService + '/outputInputApprover/v1/selectList', // 获取审批人
    setApprovalMes: goodsCenterService + '/outputInputDepot/v1/orderAudit', // 提交审批信息
    generoteNumber: goodsCenterService + '/inventory/v1/addInputOutputOrder', // 生成盘盈盘亏单号
    getTypeList: goodsCenterService + '/typeDetails/v1/getAll', // 出入库类型列表
    getStoreList: goodsCenterService + '/depot/v1/getDepotAll', // 获取所有仓库列表
    getAllLogList: goodsCenterService + '/approvalLog/v1/getList', // 获取所有审批记录
    downTemplate: goodsCenterService + '/inventory/v1/daochu', // 下载导入模板
    uploadFile: goodsCenterService + '/inventory/v1/importData', // 上传文件
    getResult: goodsCenterService + '/inventoryDetails/v1/addInventoryDetails', // 导入详情结果
    requisitionDetail: goodsCenterService + '/allocateDetails/v1/selectAllocateDetailsList', //调拨详情
    requisitionApproval: goodsCenterService + '/allocateRecords/v1/authAllocate', // 调拨审批
    countOrderDetail: goodsCenterService + '/inventoryDetails/v1/selectInventoryDetailsList', // 盘点单详情
    getAllShelfNum: goodsCenterService + '/depotShelves/v1/selectAll', // 获取所有货架号
    addNewRequisitionList: goodsCenterService + '/allocateRecords/v1/addAllocateRecords', // 新增调拨单
    inBoundOrderUploadFile: goodsCenterService + '/outputInputDepot/v1/importData', // 导入上传文件
    reverseApproval: goodsCenterService + '/outputInputDepot/v1/oppositeApproval', // 反审批
    exportRequisition: goodsCenterService + '/allocateRecords/v1/daochuDbTemplate', // 导出调拨单模板
    importRequisition: goodsCenterService + '/allocateRecords/v1/importData', // 导入调拨单
    goodsListAll: goodsCenterService + '/v2/goods/company/sku/select', // 获取所有货品列表
    getInBoundOrdersTemplate: goodsCenterService + '/outputInputDepot/v1/outDaochu',
    getStoreListByCompanyId: goodsCenterService + '/depot/v1/selectDepotList', // 根据ID查询门店
    getAllTransitUnit: goodsCenterService + '/v2/goods/provider/select', // 查询所有往来单位
    reApprovalSubmit: goodsCenterService + '/outputInputDepot/v1/submitOpposite', // 反审批提交
  },
  storeAndShelf: {
    selectAllStoreList: goodsCenterService  + '/depot/v1/getDepotAll', // 获取所有仓库列表
    addNewStore: goodsCenterService + '/depot/v1/addDepot', // 新增仓库
    selectAllShelfList: goodsCenterService + '/depotShelves/v1/selectAll', // 获取所有货架列表
    addNewShelf: goodsCenterService + '/depotShelves/v1/addDepotShelves', // 添加货架
    updateNewStore: goodsCenterService + '/depot/v1/updateDepot', // 修改仓库
    updateNewShelf: goodsCenterService + '/depotShelves/v1/updateDepotShelves', // 修改货架
    shelfGoodsList: goodsCenterService + '/depotShelves/v1/getShelvesGoods', // 根据货架ID查数据
    selectAllApprovalList: goodsCenterService + '/depotApprover/v1/selectList', // 获取所有审批配置列表
    getNewApprovalData: goodsCenterService + '/depotApprover/v1/addDepotApproverList', // 新增审批配置
    updateNewApprovalData: goodsCenterService + '/depotApprover/v1/updateDepotApprover', // 修改审批配置
    setIsCanUse: goodsCenterService + '/depot/v1/updateDepot', // 是否禁用仓库
    shelfAdjust: goodsCenterService + '/depotShelves/v1/trimShelvedStock', // 货架调整
  },
  MealList: { // 套餐管理
    selectAll: goodsCenterService + '/v2/goods/combo/list', // 套餐列表 带分页
    addOne: goodsCenterService + '/v2/goods/combo/insert', // 新增套餐基础信息
    updateOne: goodsCenterService + '/v2/goods/combo/update', // 编辑套餐基础信息
    detailOne: goodsCenterService + '/v2/goods/combo/info/list', // 获取某一个套餐的商品列表
    formatGoodsList: goodsCenterService + '/v2/goods/combo/info/resolve', // 套餐序列化
    updateGoodsList: goodsCenterService + '/v2/goods/combo/info/update', // 更新套餐商品明细
    selectStatus: goodsCenterService + '/v2/goods/put/select', // 判断套餐里的公司上下架状态
    updateStatus: goodsCenterService + '/v2/goods/combo/put/insert', // 修改公司上下架状态 和积分状态
  },
  CompanyMealList: { // 公司套餐列表
    selectAll: goodsCenterService + '/v2/goods/combo/select'
  },
  StoreMealList: { // 门店套餐列表
    selectAll: goodsCenterService + '/v2/goods/combo/store/search'
  },
  OrderManagement: { // 订单管理
    selectAllGoodsOrder: goodsCenterService + '/v2/order/list', // 查询所有商品礼品订单
    getReturnGoodsByOrderNum: goodsCenterService + '/v2/order/detail/select', // 根据订单号查退货商品
    getNextApprovalMan: goodsCenterService + '/v2/return/next/flow', // 获取下一审批人
    submitReturnMessage: goodsCenterService + '/v2/return/order/insert', // 提交退货单
    returnBackOrderList: goodsCenterService + '/v2/return/order/list', // 退货单列表
    approvalCommonDetail: goodsCenterService + '/v2/return/order/resolve', // 所有审批接口
    customerApproval: goodsCenterService + '/v2/return/order/customer/service', // 客服部审批
    approvalPageDetai: goodsCenterService + '/v2/return/order/detail/get',  // 所有审批页面基本信息
    mailGoodsSubmit: goodsCenterService + '/v2/return/order/express', // 待邮寄接口
    customerAcceptSubmit: goodsCenterService + '/v2/return/order/service/check', // 待客服部验收接口
    logisticsApprovalSubmit: goodsCenterService + '/v2/return/order/logistics/check', // 待物流部审批
    getDepotAll: goodsCenterService + '/depot/v1/getDepotList', // 根据companyId查仓库
    finaceApprovalSubmit: goodsCenterService + '/v2/return/order/finance/check', // 财务部退款
  },
  NotifCenter: { // 通知中心
    listAll: notifCenterService + '/notify/v1/getNotificationAll',   // 通知中心列表
    addOne: notifCenterService + '/notify/v1/costomNotifyAddList',   // 创建一条通知
    getNotifyCount: notifCenterService + '/notify/v1/getNotifyCount',   // 查询用户有多少条未读信息
    clickBell : notifCenterService + '/notify/v1/clickBell',   // 点击铃铛按钮时调用一次这个接口
  },
  AptitudeClassify: {   // 资质分类管理
    listAll: aptitudeCenterService + '/certificateType/v1/getCertificateType',   // 资质分类管理列表
    addOne: aptitudeCenterService + '/certificateType/v1/addCertificateType',   // 资质分类管理新增
    delete: aptitudeCenterService + '/certificateType/v1/deleteCertificateType',   // 资质分类管理删除
    updateOne: aptitudeCenterService + '/certificateType/v1/updateCertificateType',   // 资质分类管理修改
  },
  AptitudeCatalog: {   // 资质目录管理
    listAll: aptitudeCenterService + '/certificate/v1/getClassify',   // 资质目录分类管理列表
    addOne: aptitudeCenterService + '/certificate/v1/addClassify',   // 资质目录分类管理新增
    delete: aptitudeCenterService + '/certificate/v1/deleteClassify',   // 资质目录分类管理删除
    updateOne: aptitudeCenterService + '/certificate/v1/updateClassify',   // 资质目录分类管理修改
  },
  AptitudeGoodsCatalog: {   // 货品资质管理
    listAll: aptitudeCenterService + '/classifyGoods/v1/getClassifyGoods',   // 货品资质管理列表
    addOne: aptitudeCenterService + '/classifyGoods/v1/addClassifyGoods',   // 货品资质管理新增
    delete: aptitudeCenterService + '/classifyGoods/v1/deleteClassifyGoods',   // 货品资质管理删除
    updateOne: aptitudeCenterService + '/classifyGoods/v1/updateClassifyGoods',   // 货品资质管理修改
  },
  AptitudeGoodsFile: {   // 货品资质文件
    listAll: aptitudeCenterService + '/certificateDetails/v1/getCertificateDetails',   // 货品资质文件列表
    addOne: aptitudeCenterService + '/certificateDetails/v1/addCertificateDetails',   // 货品资质文件新增
    delete: aptitudeCenterService + '/certificateDetails/v1/deleteCertificateDetails',   // 货品资质文件删除
    updateOne: aptitudeCenterService + '/certificateDetails/v1/updateCertificateDetails',   // 货品资质文件修改
    getFactoryList: aptitudeCenterService + '/factoryInfo/v1/getFactoryList',   // 获取厂商列表
  }
}
