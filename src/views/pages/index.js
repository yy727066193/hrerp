import Loadable from 'react-loadable'

const AddUpdateGoods = Loadable({
  loader: () => import('./AddUpdateGoods/AddUpdateGoods.js'),
  loading: () => null
});

const PreviewVisibleList = Loadable({
  loader: () => import('./PreviewVisibleList/PreviewVisibleList.js'),
  loading: () => null
});

const CompanyGoodsList = Loadable({
  loader: () => import('./CompanyGoodsList/CompanyGoodsList.js'),
  loading: () => null
});

const StoreGoodsList = Loadable({
  loader: () => import('./StoreGoodsList/StoreGoodsList.js'),
  loading: () => null
});

const MealList = Loadable({
  loader: () => import('./MealList/MealList.js'),
  loading: () => null
});

const GoodsAuth = Loadable({
  loader: () => import('./GoodsAuth/GoodsAuth.js'),
  loading: () => null
});

const GoodsType = Loadable({
  loader: () => import('./GoodsType/GoodsType.js'),
  loading: () => null
});

const GoodsUnit = Loadable({
  loader: () => import('./GoodsUnit/GoodsUnit.js'),
  loading: () => null
});

const UnitModel = Loadable({
  loader: () => import('./UnitModel/UnitModel.js'),
  loading: () => null
});

const GoodsBrand = Loadable({
  loader: () => import('./GoodsBrand/GoodsBrand.js'),
  loading: () => null
});

const GoodsLabel = Loadable({
  loader: () => import('./GoodsLabel/GoodsLabel.js'),
  loading: () => null
});

const SupplyGoods = Loadable({
  loader: () => import('./SupplyGoods/SupplyGoods.js'),
  loading: () => null
});

const GiveIntSet = Loadable({
  loader: () => import('./GiveIntSet/GiveIntSet.js'),
  loading: () => null
});

const PackageUnit = Loadable({
  loader: () => import('./PackageUnit/PackageUnit.js'),
  loading: () => null
});

const TimelyInventory = Loadable({
  loader: () => import('./TimelyInventory/TimelyInventory.js'),
  loading: () => null
});

const InventoryDetail = Loadable({
  loader: () => import('./TimelyInventory/InventoryDetail.js'),
  loading: () => null
});

const StoreInstantInventory = Loadable({
  loader: () => import('./StoreInstantInventory/StoreInstantInventory.js'),
  loading: () => null
});

const InboundOrders = Loadable({
  loader: () => import('./InboundOrders/InboundOrders.js'),
  loading: () => null
});

const OutboundOrders = Loadable({
  loader: () => import('./OutboundOrders/OutboundOrders.js'),
  loading: () => null
});

const ResubmitApproval = Loadable({
  loader: () => import('./OutboundOrders/ResubmitApproval.js'),
  loading: () => null
});

const RequisitionList = Loadable({
  loader: () => import('./RequisitionList/RequisitionList.js'),
  loading: () => null
});

const CountingOrderList = Loadable({
  loader: () => import('./CountingOrderList/CountingOrderList.js'),
  loading: () => null
});

const WarehouseManage = Loadable({
  loader: () => import('./WarehouseManage/WarehouseManage.js'),
  loading: () => null
});

const ShelfManage = Loadable({
  loader: () => import('./ShelfManage/ShelfManage.js'),
  loading: () => null
});

const ApprovalConfiguration = Loadable({
  loader: () => import('./ApprovalConfiguration/ApprovalConfiguration.js'),
  loading: () => null
});

const ApprovalDetail = Loadable({
  loader: () => import ('./InboundOrders/approvalDetail.js'),
  loading: () => null
});

const AddNewOrder = Loadable({
  loader: () => import ('./CountingOrderList/addNewOrder.js'),
  loading: () => null
});

const RequisitionDetail = Loadable({
  loader: () => import ('./RequisitionList/RequisitionDetail.js'),
  loading: () => null
});

const RequisitionApproval = Loadable({
  loader: () => import ('./RequisitionList/RequisitionApproval.js'),
  loading: () => null
});

const CountingOrderDetail = Loadable({
  loader: () => import ('./CountingOrderList/CountingOrderDetail.js'),
  loading: () => null
});

// 商品模块

const GoodsOrderList = Loadable({
  loader: () => import ('./GoodsOrderList/GoodsOrderList.js'),
  loading: () => null
});
const GiftIntegralSet = Loadable({
  loader: () => import ('./GiftIntegralSet/GiftIntegralSet.js'),
  loading: () => null
});

const PackageType = Loadable({
  loader: () => import ('./PackageType/PackageType.js'),
  loading: () => null
})

const GiftOrderList = Loadable({
  loader: () => import ('./GiftOrderList/GiftOrderList.js'),
  loading: () => null
});

const SaleOutOrderList = Loadable({
  loader: () => import ('./SaleOutOrderList/SaleOutOrderList.js'),
  loading: () => null
});

const OutAndInStoreOrder = Loadable({
  loader: () => import ('./InStoreOrderList/StoreOrderDetail.js'),
  loading: () => null
});


const InStoreOrderList = Loadable({
  loader: () => import ('./InStoreOrderList/InStoreOrderList.js'),
  loading: () => null
});

const ReturnOrderList = Loadable({
  loader: () => import ('./ReturnOrderList/ReturnOrderList.js'),
  loading: () => null
});

const InStoreOrderDetail = Loadable({
  loader: () => import ('./GoodsOrderList/StoreOrderDetail.js'),
  loading: () => null
});

const CompleteDetail = Loadable({
  loader: () => import ('./GoodsOrderList/CompleteDetail.js'),
  loading: () => null
});

const GiftListDetail = Loadable({
  loader: () => import ('./GiftOrderList/GiftListDetail.js'),
  loading: () => null
});

const SaleOutPutDetail = Loadable({
  loader: () => import ('./SaleOutOrderList/SaleOutPutDetail.js'),
  loading: () => null
});

const AddNewReturnOrder = Loadable({
  loader: () => import ('./ReturnOrderList/AddNewOrder.js'),
  loading: () => null
});

const PartManageApproval = Loadable({
  loader: () => import ('./ReturnOrderList/PartManageApproval.js'),
  loading: () => null
});

const CustomerApproval = Loadable({
  loader: () => import ('./ReturnOrderList/CustomerApproval.js'),
  loading: () => null
});

const MailingGoods = Loadable({
  loader: () => import ('./ReturnOrderList/MailingGoods.js'),
  loading: () => null
});

const CustomerAccept = Loadable({
  loader: () => import ('./ReturnOrderList/CustomerAccept.js'),
  loading: () => null
});

const LogisticsApproval = Loadable({
  loader: () => import ('./ReturnOrderList/LogisticsApproval.js'),
  loading: () => null
});

const FinaceApproval = Loadable({
  loader: () => import ('./ReturnOrderList/FinaceApproval.js'),
  loading: () => null
});

const TotalCompleteDetail = Loadable({
  loader: () => import ('./ReturnOrderList/CompleteDetail.js'),
  loading: () => null
});

// 套餐分类
const MealType = Loadable({
  loader: () => import('./MealType/MealType.js'),
  loading: () => null
});

// 分公司套餐列表
const CompanyMealList = Loadable({
  loader: () => import('./CompanyMealList/CompanyMealList.js'),
  loading: () => null
});

// 门店套餐列表
const StoreMealList = Loadable({
  loader: () => import('./StoreMealList/StoreMealList.js'),
  loading: () => null
});

// 资质分类
const AptitudeClassify = Loadable({
  loader: () => import('./AptitudeClassify/AptitudeClassify.js'),
  loading: () => null
});

// 资质目录分类
const AptitudeCatalog = Loadable({
  loader: () => import('./AptitudeCatalog/AptitudeCatalog.js'),
  loading: () => null
});

// 货品资质目录
const AptitudeGoodsCatalog = Loadable({
  loader: () => import('./AptitudeGoodsCatalog/AptitudeGoodsCatalog.js'),
  loading: () => null
});

// 货品资质文件
const AptitudeGoodsFile = Loadable({
  loader: () => import('./AptitudeGoodsFile/AptitudeGoodsFile.js'),
  loading: () => null
});


/**
 * path       路由地主
 * comp       组件
 * exact      是否唯一path
 * checkLogin 是否验证登录
 * */
export default [
  {path: '/addUpdateGoods', comp: AddUpdateGoods, exact: true, checkLogin: true},
  {path: '/previewVisibleList', comp: PreviewVisibleList, exact: true, checkLogin: true},
  {path: '/companyGoodsList', comp: CompanyGoodsList, exact: true, checkLogin: true},
  {path: '/storeGoodsList', comp: StoreGoodsList, exact: true, checkLogin: true},
  {path: '/mealList', comp: MealList, exact: true, checkLogin: true},
  {path: '/goodsAuth', comp: GoodsAuth, exact: true, checkLogin: true},
  {path: '/goodsType', comp: GoodsType, exact: true, checkLogin: true},
  {path: '/goodsUnit', comp: GoodsUnit, exact: true, checkLogin: true},
  {path: '/unitModel', comp: UnitModel, exact: true, checkLogin: true},
  {path: '/goodsBrand', comp: GoodsBrand, exact: true, checkLogin: true},
  {path: '/goodsLabel', comp: GoodsLabel, exact: true, checkLogin: true},
  {path: '/supplyGoods', comp: SupplyGoods, exact: true, checkLogin: true},
  {path: '/giveIntSet', comp: GiveIntSet, exact: true, checkLogin: true},
  {path: '/packageUnit', comp: PackageUnit, exact: true, checkLogin: true},
  {path: '/timelyInventory', comp: TimelyInventory, exact: true, checkLogin: true},
  {path: '/storeInstantInventory', comp: StoreInstantInventory, exact: true, checkLogin: true},
  {path: '/InboundOrders', comp: InboundOrders, exact: true, checkLogin: true},
  {path: '/OutboundOrders', comp: OutboundOrders, exact: true, checkLogin: true},
  {path: '/ResubmitApproval', comp: ResubmitApproval, exact: true, checkLogin: false},
  {path: '/RequisitionList', comp: RequisitionList, exact: true, checkLogin: true},
  {path: '/CountingOrderList', comp: CountingOrderList, exact: true, checkLogin: true},
  {path: '/WarehouseManage', comp: WarehouseManage, exact: true, checkLogin: true},
  {path: '/ShelfManage', comp: ShelfManage, exact: true, checkLogin: true},
  {path: '/ApprovalConfiguration', comp: ApprovalConfiguration, exact: true, checkLogin: true},
  {path: '/InventoryDetail', comp: InventoryDetail, exact: true, checkLogin: false},
  {path: '/ApprovalDetail', comp: ApprovalDetail, exact: true, checkLogin: false},
  {path: '/AddNewOrder', comp: AddNewOrder, exact: true, checkLogin: false},
  {path: '/RequisitionDetail', comp: RequisitionDetail, exact: true, checkLogin: false},
  {path: '/RequisitionApproval', comp: RequisitionApproval, exact: true, checkLogin: false},
  {path: '/CountingOrderDetail', comp: CountingOrderDetail, exact: true, checkLogin: false},
  {path: '/GoodsOrderList', comp: GoodsOrderList, exact: true, checkLogin: true},
  // {path: '/StoreOrderDetail', comp: StoreOrderDetail, exact: true, checkLogin: true},
  {path: '/GiftOrderList', comp: GiftOrderList, exact: true, checkLogin: true},
  {path: '/SaleOutOrderList', comp: SaleOutOrderList, exact: true, checkLogin: true},
  {path: '/InStoreOrderList', comp: InStoreOrderList, exact: true, checkLogin: true},
  {path: '/ReturnOrderList', comp: ReturnOrderList, exact: true, checkLogin: true},
  {path: '/InStoreOrderDetail', comp: InStoreOrderDetail, exact: true, checkLogin: false},
  {path: '/CompleteDetail', comp: CompleteDetail, exact: true, checkLogin: false},
  {path: '/GiftListDetail', comp: GiftListDetail, exact: true, checkLogin: false},
  {path: '/SaleOutPutDetail', comp: SaleOutPutDetail, exact: true, checkLogin: false},
  {path: '/AddNewReturnOrder', comp: AddNewReturnOrder, exact: true, checkLogin: false},
  {path: '/PartManageApproval', comp: PartManageApproval, exact: true, checkLogin: false},
  {path: '/CustomerApproval', comp: CustomerApproval, exact: true, checkLogin: false},
  {path: '/GiftIntegralSet', comp: GiftIntegralSet, exact: true, checkLogin: false},
  {path: '/PackageType', comp: PackageType, exact: true, checkLogin: false},
  {path: '/mealType', comp: MealType, exact: true, checkLogin: true},
  {path: '/OutAndInStoreOrder', comp: OutAndInStoreOrder, exact: true, checkLogin: false},
  {path: '/companyMealList', comp: CompanyMealList, exact: true, checkLogin: false},
  {path: '/storeMealList', comp: StoreMealList, exact: true, checkLogin: true},
  {path: '/MailingGoods', comp: MailingGoods, exact: true, checkLogin: false},
  {path: '/CustomerAccept', comp: CustomerAccept, exact: true, checkLogin: false},
  {path: '/LogisticsApproval', comp: LogisticsApproval, exact: true, checkLogin: false},
  {path: '/FinaceApproval', comp: FinaceApproval, exact: true, checkLogin: false},
  {path: '/TotalCompleteDetail', comp: TotalCompleteDetail, exact: true, checkLogin: false},

  {path: '/aptitudeClassify', comp: AptitudeClassify, exact: true, checkLogin: false},
  {path: '/aptitudeCatalog', comp: AptitudeCatalog, exact: true, checkLogin: false},
  {path: '/aptitudeGoodsCatalog', comp: AptitudeGoodsCatalog, exact: true, checkLogin: false},
  {path: '/aptitudeGoodsFile', comp: AptitudeGoodsFile, exact: true, checkLogin: false},
]
