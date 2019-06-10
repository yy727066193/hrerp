import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread} from './../../../components/index';
import { Button } from 'antd';
import Columns from './columnConfig';
import { getLoginInfo, searchList } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './commonCollapse';
import CommonHead from './commonHead';
import helper from '../../../utils/helper';
import EventBus from '../../../utils/eventBus';

const breadCrumbList = ['退货单列表', '物流部审批'];
const partResult = [
  {title: '审批人', value: '', itemSpan: 4},
  {title: '审批时间', value: '', itemSpan: 4},
  {title: '审批结果', value: '', itemSpan: 4},
  {title: '备注', value: '', itemSpan: 4},
];

const searchData = [
  {title: '审批人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
  {title: '审批结果', dataIndex: 'approvalResult', formType: 'select', required: true, options: window.globalConfig.onlyPassStatusList},
  {title: '备注', dataIndex: 'remark', formType: 'input',},
  {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
]

@inject('store')
@observer
class LogisticsApproval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextDept: {},
      totalData: [],
      newData: {},
      depotList: [],
      returnGoodsList: [], 
      submitLoading: false,
      bool: true, // 入库数量是否大于可退数量, 大于则不可退货
      isSave: false, // 是否保存了数据
      editTableDataSource: [], // 修改表格的数据源
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: [], showTotal: {
          money: '',
          integral: ''
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: partResult},
        {key: 6, title: '物流部审批', sign: 'search', searchData, includeTable: {
          dataSource: [],
          tableHead: Columns.logisticsApprovalHead
        }},       
      ],
      titleOptions: [
        {title: '退货单编号', value: '', itemSpan: 4},
        {title: '申请门店名称', value: '', itemSpan: 4},
        {title: '操作人', value: '', itemSpan: 4},
        {title: '关联订单编号', value: '', itemSpan: 4},
        {title: '关联销售出库单编号', value: '', itemSpan: 4},
      ]
    }
  }
  render() {
    const { optionList, titleOptions, returnGoodsList, submitLoading } = this.state;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['ReturnOrderList']} />
          <Button type="primary" className="fr" loading={submitLoading} onClick={() => this.submit()}>提交</Button>
        </div>
        <CommonHead optionList={titleOptions} />
        <CommonCollapse ref={el => this.collDom = el} defaultActiveKey={['1', '6']} newData={returnGoodsList} optionList={optionList} />
      </div>
    )
  }

  componentDidMount() {
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/ReturnOrderList`);
      return;
    }
    window.eventBus.on('selectEditTable', this.handleChange)
    this.getDetailData();
    this.getNextApprovaler();
  }

  handleChange = (val, list) => {
    let { returnGoodsList, depotList } = this.state;
    if (list[2] === 'select') {
      returnGoodsList[list[1]].warehouseId = list[0];
      returnGoodsList[list[1]].warehouseName = searchList(depotList, 'value', list[0]).label;
    } else if (list[2] === 'input') {
      returnGoodsList[list[1]].saveGoodsNum = list[0];
    }
    this.setState({
      returnGoodsList
    });
  }

  async getDetailData() {
    const { orderNo } = this.props.history.location.state;
    const { code, data, msg } = await GoodsCenterService.OrderManagement.approvalPageDetai({
      orderReturnNo: orderNo
    });
    if (code !== SUCCESS_CODE){
      helper.W(msg);
      return;
    }
    if (data.userVo) {
      data.userVo.key = 1
    }
    this.getAllDepot(data)
  }

  async getNextApprovaler() {
    const { code, data } = await GoodsCenterService.OrderManagement.getNextApprovalMan({
      flowId: 5
    });
    if (code !== SUCCESS_CODE) return;
    if (this.collDom.wrappedInstance.searchForm){
      const returnSearchData = this.collDom.wrappedInstance.searchForm;
      returnSearchData.initFormData({
        SingalNum: data.name,
        approvalMan: getLoginInfo().employee.name
      })
    }
  }

  async getAllDepot(newData) {
    const { code, data } = await GoodsCenterService.OrderManagement.getDepotAll({
      companyId: getLoginInfo().companyId
    });
    if (code !== SUCCESS_CODE){
      return;
    }
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.depotName
      })
    })
    this.state.optionList.forEach((item) => {
      if (item.sign === 'search') {
        item.includeTable.tableHead.forEach((item) => {
          if (item.dataIndex === 'store') {
            item.options = arr;
          }
        })
      }
    })
    const list = [];
    const newList = [];
    newData.orderReturnsInfoList.forEach((item, index) => {
      item.saveGoodsNum = item.serviceNum;
      list.push({
        key: index,
        serialNum: index + 1,
        orderNo: item.orderNo,
        goodsHrNo: item.goodsHrNo,
        goodsName: item.goodsName,
        goodsNum: item.goodsNum,
        saveGoodsNum: item.serviceNum,
        priceUnitName: item.priceUnitName,
        priceUnitId: item.priceUnitId,
        returnMoney: item.returnNum, // 退货数
        returnInfoNo: item.returnInfoNo,
        unitPrice: (item.unitPrice / 100).toFixed(2),
        subtotal: ((item.returnNum * item.unitPrice) / 100).toFixed(2),
        returnIntegral: item.countIntegral,
        warehouseId: '',
        serviceNum: item.serviceNum,
        warehouseName: item.warehouseName,
        putInNo: item.putInNo
      });
      if (item.saveGoodsNum !== 0) {
        let newIndex = 0;
        newList.push({
          key: newIndex,
          serialNum: newIndex + 1,
          orderNo: item.orderNo,
          goodsHrNo: item.goodsHrNo,
          goodsName: item.goodsName,
          goodsNum: item.goodsNum,
          saveGoodsNum: item.serviceNum,
          priceUnitName: item.priceUnitName,
          priceUnitId: item.priceUnitId,
          returnMoney: item.returnNum, // 退货数
          returnInfoNo: item.returnInfoNo,
          unitPrice: (item.unitPrice / 100).toFixed(2),
          subtotal: ((item.returnNum * item.unitPrice) / 100).toFixed(2),
          returnIntegral: item.countIntegral,
          warehouseId: '',
          serviceNum: item.serviceNum,
          warehouseName: item.warehouseName,
          putInNo: item.putInNo
        })
      } 
    })
    this.setState({
      depotList: arr,
      totalData: data,
      newData,
      returnGoodsList: newList,
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: list, showTotal: {
          money: (newData.returnTotalPrice / 100).toFixed(2),
          integral: newData.returnTotalIntegral
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: newData.userVo?[newData.userVo]: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: newData.orderReturnFlowInfoList},
        {key: 6, title: '物流部审批', sign: 'search', searchData, includeTable: {
          dataSource: newList,
          tableHead: Columns.logisticsApprovalHead
        }},       
      ],
      titleOptions: [
        {title: '退货单编号', value: newData.returnNo, itemSpan: 5},
        {title: '申请门店名称', value: newData.storeName, itemSpan: 3},
        {title: '操作人', value: newData.createEName, itemSpan: 3},
        {title: '关联订单编号', value: newData.orderBaseNo, itemSpan: 5},
        {title: '关联销售出库单编号', value: newData.leaveWarehouseNo, itemSpan: 5},
      ]
    });
  }

  async submit() {
    const { orderNo } = this.props.history.location.state;
    const { bool, returnGoodsList } = this.state;
    for(let i=0; i< returnGoodsList.length; i++) {
      if (returnGoodsList[i].warehouseId.length === 0) {
        helper.W('请先填写入库仓');
        return
      }
    }
    for(let i=0; i< returnGoodsList.length; i++) {
      if (returnGoodsList[i].saveGoodsNum === null) {
        helper.W('请先填写入库数量');
        return
      }
    }
    for(let i=0; i< returnGoodsList.length; i++) {
      if (returnGoodsList[i].saveGoodsNum > returnGoodsList[i].returnMoney || String(returnGoodsList[i].saveGoodsNum).indexOf('.') > -1) {
        helper.W('入库数不能大于商品总数且不能为小数');
        return
      }
    }
    if (this.collDom.wrappedInstance.searchForm && !this.collDom.wrappedInstance.searchForm.validateFormValues() && bool) {
      const dataList = [];
      returnGoodsList.forEach((item) => {
        dataList.push({
          hrNo: item.goodsHrNo,
          num: item.saveGoodsNum,
          goodsName: item.goodsName,
          priceUnitId: item.priceUnitId,
          priceUnitName: item.priceUnitName,
          warehouseId: item.warehouseId,
          warehouseName: item.warehouseName,
          returnInfoNo: item.returnInfoNo,
        });
      })
      const searchData = this.collDom.wrappedInstance.searchForm.getFormData();
      const { newData } = this.state;
      const { employee } = getLoginInfo();
      this.setState({
        submitLoading: true
      });
      const { code, msg } = await GoodsCenterService.OrderManagement.logisticsApprovalSubmit({
        flowId: newData.flowId,
        auditEmployeeId: employee.id,
        auditEmployeeName: employee.name,
        result: searchData.approvalResult,
        departmentId: employee.departmentId,
        departmentName: newData.nextDepartmentName,
        returnNo: orderNo,
        remark: searchData.remark,
        goodsMap: dataList
      });
      if(code !== SUCCESS_CODE){
        helper.W(msg);
        this.setState({
          submitLoading: false
        });
        return;
      }
      this.setState({
        submitLoading: false
      });
      this.props.history.push('ReturnOrderList');
    }
  }

}

export default LogisticsApproval