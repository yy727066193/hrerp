import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread } from './../../../components/index';
import { Button } from 'antd';
import Columns from './columnConfig';
import { inject, observer } from 'mobx-react';
import { getLoginInfo } from "../../../utils/public";
import GoodsCenterService from "../../../service/GoodsCenterService";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './commonCollapse';
import CommonHead from './commonHead';
import api from '../../../service/api';
import helper from '../../../utils/helper';
import { validateOrderNum } from "../../../utils/validate";

const breadCrumbList = ['退货单列表', '邮寄货品'];

// const fontList = [
//   {title: '审批人', value: 1, itemSpan: 4},
//   {title: '审批时间', value: 123, itemSpan: 4},
//   {title: '退货结果', value: 42, itemSpan: 4},
//   {title: '退回公司', value: 2, itemSpan: 4},
//   {title: '备注', value: 4, itemSpan: 4},
// ];
const partResult = [
  {title: '审批人', value: 1, itemSpan: 4},
  {title: '审批时间', value: 123, itemSpan: 4},
  {title: '审批结果', value: 42, itemSpan: 4},
  {title: '备注', value: 4, itemSpan: 4},
];
// const customResult = [
//   {title: '审批人', value: 1, itemSpan: 4},
//   {title: '审批时间', value: 123, itemSpan: 4},
//   {title: '审批结果', value: '审批通过', itemSpan: 4},
//   {title: '退款金额', value: 4, itemSpan: 4},
//   {title: '备注', value: 4, itemSpan: 4},
//   {title: '客服回访内容', value: 4, itemSpan: 4},
//   {title: '客服回访时间', value: 4, itemSpan: 4},
//   {title: '回访人', value: 4, itemSpan: 4},
//   {title: '退货地址', value: 4, itemSpan: 6},
// ]

const searchData = [
  {title: '操作人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
  {title: '快递公司', dataIndex: 'company', formType: 'input', required: true},
  {title: '快递单号', dataIndex: 'orderNum', formType: 'input', required: true, config: {
    rules: [
      { required: true, message: '请输入正确的单号' },
      { validator: validateOrderNum }
    ]
  }},
  {title: '邮寄时间', dataIndex: 'mailTime', formType: 'date', notSelectBeforeDate: true},
  {title: '备注', dataIndex: 'remark', formType: 'input'},
  {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
]
@inject('store')
@observer
class MailingGoods extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      nextDept: {},
      dataInfo: {},
      url: '',
      submitLoading: false,
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: [], showTotal: {
          money: 123,
          integral: 123
        }},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: partResult},
				{key: 7, title: '邮寄货品', sign: 'search', searchData, canUpload: {
          actions: api.Upload,
          listType: 'picture',
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
    const { optionList, titleOptions, submitLoading } = this.state;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['ReturnOrderList']} />
          <Button className="fr" onClick={() => this.submit()} loading={submitLoading} type="primary">提交</Button>
        </div>
        <CommonHead optionList={titleOptions} />
        <CommonCollapse uploadChange={(e) => this.uploadChange(e)} ref={el => this.collDom = el} defaultActiveKey={['1', '7']} optionList={optionList} />
      </div>
    )
  }

  componentDidMount() {
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/ReturnOrderList`);
      return;
    }
    this.getDetailData();
    this.getNextApprovaler();
  }

  async getDetailData() {
    const { orderNo } = this.props.history.location.state;
    const { code, data } = await GoodsCenterService.OrderManagement.approvalPageDetai({
      orderReturnNo: orderNo
    });
    if (code !== SUCCESS_CODE) return
    const list = [];
    data.orderReturnsInfoList.forEach((item, index) => {
      list.push({
        key: index,
        serialNum: index + 1,
        orderNo: item.orderNo,
        goodsHrNo: item.goodsHrNo,
        goodsName: item.goodsName,
        goodsNum: item.goodsNum,
        priceUnitName: item.priceUnitName,
        returnMoney: item.returnNum,
        unitPrice: (item.unitPrice / 100).toFixed(2),
        subtotal: ((item.returnNum * item.unitPrice) / 100).toFixed(2),
        returnIntegral:  item.countIntegral,
        putInNo: item.putInNo
      });
    })
    if (data.userVo) {
      data.userVo.key = 1
    }
    this.setState({
      dataInfo: data,
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: list, showTotal: {
          money: (data.returnTotalPrice / 100).toFixed(2),
          integral: data.returnTotalIntegral
        }},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: data.userVo?[data.userVo]: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: data.orderReturnFlowInfoList},
				{key: 7, title: '邮寄货品', sign: 'search', searchData, canUpload: {
          actions: api.Upload,
          listType: 'picture',
        }},            
      ],
      titleOptions: [
        {title: '退货单编号', value: data.returnNo, itemSpan: 5},
        {title: '申请门店名称', value: data.storeName, itemSpan: 3},
        {title: '操作人', value: data.createEName, itemSpan: 3},
        {title: '关联订单编号', value: data.orderBaseNo, itemSpan: 5},
        {title: '关联销售出库单编号', value: data.leaveWarehouseNo, itemSpan: 5},
      ]
    })
  }

  async getNextApprovaler() {
    const { code, data } = await GoodsCenterService.OrderManagement.getNextApprovalMan({
      flowId: 3
    });
    if (code !== SUCCESS_CODE) return;
    if (this.collDom.wrappedInstance.searchForm){
      const returnSearchData = this.collDom.wrappedInstance.searchForm;
      returnSearchData.initFormData({
        SingalNum: data.name,
        approvalMan: getLoginInfo().employee.name
      })
    }

    this.setState({
      nextDept: data
    })
  }

  uploadChange(e) {
    let url = this.state.url;
    this.setState({
      url: url += e + ','
    });
  }

  async submit() {
    const { orderNo } = this.props.history.location.state;
    if (this.collDom.wrappedInstance.searchForm && !this.collDom.wrappedInstance.searchForm.validateFormValues()) {
      const searchData = this.collDom.wrappedInstance.searchForm.getFormData();
      const { dataInfo, url } = this.state;
      const { employee, companyId } = getLoginInfo();
      this.setState({
        submitLoading: true
      })
      const { code, msg } = await GoodsCenterService.OrderManagement.mailGoodsSubmit({
        flowId: dataInfo.flowId,
        auditEmployeeId: employee.id,
        auditEmployeeName: employee.name,
        result: 1,
        departmentId: employee.departmentId,
        departmentName: dataInfo.nextDepartmentName,
        returnNo: orderNo,
        orderReturnExpress: {
          expressCompanyName: searchData.company,
          expressNo: searchData.orderNum,
          senderName: '',
          remark:searchData.remark,
          attachedFile: url,
          returnNo: orderNo,
          companyId: companyId,
          storeId: dataInfo.storeId
        }
      });
      if(code !== SUCCESS_CODE){
        helper.W(msg);
        this.setState({
          submitLoading: false
        })
        return;
      }
      this.setState({
        submitLoading: false
      })
      this.props.history.push('ReturnOrderList')
    }
  }
}

export default MailingGoods;