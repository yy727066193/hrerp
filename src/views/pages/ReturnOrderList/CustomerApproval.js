import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread } from './../../../components/index';
import Columns from './columnConfig';
import { Button } from 'antd';
import { getLoginInfo } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './commonCollapse';
import CommonHead from './commonHead';
import moment from 'moment';
import helper from '../../../utils/helper';

const breadCrumbList = ['商品订单列表', '客服部审批'];


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

// const disCountFontList = [
//   {title: '促销类型', value: 1, itemSpan: 4},
//   {title: '促销名称', value: 123, itemSpan: 4},
//   {title: '促销详情', value: 42, itemSpan: 4}
// ];
@inject('store')
@observer
class CustomerApproval extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      datTotal: {},
      submitLoading: false,
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: [], showTotal: {
          money: '',
          integral: ''
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: partResult},
        {key: 6, title: '客服部审批', sign: 'search', searchData: []},       
      ],
      titleOptions: [
        {title: '退货单编号', value: '', itemSpan: 4},
        {title: '申请门店名称', value: '', itemSpan: 4},
        {title: '操作人', value: '', itemSpan: 4},
        {title: '关联订单编号', value: '', itemSpan: 4},
        {title: '关联销售出库单编号', value: '', itemSpan: 4},
      ],
      searchData: [
        {title: '审批人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
        {title: '审批结果', dataIndex: 'approvalResult', formType: 'select', required: true, options: window.globalConfig.customerApprovalReturnList, bindChange: true},
        {title: '客服回访时间', dataIndex: 'askTime', formType: 'date', required: true},
        {title: '回访人', dataIndex: 'askMan', formType: 'input',},
        {title: '退款金额', dataIndex: 'returnMoney', formType: 'number', required: true},
        {title: '备注', dataIndex: 'remark', formType: 'input',},
        {title: '客服回访内容', dataIndex: 'askContent', formType: 'input',},
        {title: '退货地址', dataIndex: 'address', formType: 'input', required: true},
        {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
      ]
    }
  }

  render() {
    const { optionList, titleOptions, searchData, submitLoading } = this.state;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['GoodsOrderList']}/>
          <Button className="fr" onClick={() => this.submit()} loading={submitLoading} type="primary">提交</Button>
        </div>
        <CommonHead optionList={titleOptions} />
        <CommonCollapse ref={el => this.collDom = el} defaultActiveKey={['1', '6']} onSelect={(item, val) => this.changeSelect(item, val)} searchData={searchData} optionList={optionList} />
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
    if (code !== SUCCESS_CODE) return;
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
        returnIntegral: item.countIntegral,
        putInNo: item.putInNo
      });
    })
    if (data.userVo) {
      data.userVo.key = 1
    }
    this.setState({
      datTotal: data,
      titleOptions: [
        {title: '退货单编号', value: data.returnNo, itemSpan: 5},
        {title: '申请门店名称', value: data.storeName, itemSpan: 3},
        {title: '操作人', value: data.createEName, itemSpan: 3},
        {title: '关联订单编号', value: data.orderBaseNo, itemSpan: 5},
        {title: '关联销售出库单编号', value: data.leaveWarehouseNo, itemSpan: 5},
      ],
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: list, showTotal: {
          money: (data.returnTotalPrice/ 100).toFixed(2),
          integral: data.returnTotalIntegral
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: data.userVo?[data.userVo]: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: data.orderReturnFlowInfoList},
        {key: 6, title: '客服部审批', sign: 'search', searchData: this.state.searchData},       
      ],
    })
  }

  async getNextApprovaler() {
    const { code, data } = await GoodsCenterService.OrderManagement.getNextApprovalMan({
      flowId: 2
    });
    if (code !== SUCCESS_CODE) return;
    if (this.collDom.wrappedInstance.searchForm){
      const returnSearchData = this.collDom.wrappedInstance.searchForm;
      returnSearchData.initFormData({
        SingalNum: data.name,
        approvalMan: getLoginInfo().employee.name,
        askMan: getLoginInfo().employee.name
      })
    }

    this.setState({
      nextDept: data
    })
  }

  async submit() {
    const { orderNo } = this.props.history.location.state;
    if (this.collDom.wrappedInstance.searchForm && !this.collDom.wrappedInstance.searchForm.validateFormValues()) {
      const searchData = this.collDom.wrappedInstance.searchForm.getFormData();
      if(searchData.returnMoney < 0) {
        helper.W('退款金额不能小于0');
        return;
      }
      const { datTotal } = this.state;
      const { employee } = getLoginInfo();
      this.setState({
        submitLoading: true
      });
      const { code, msg } = await GoodsCenterService.OrderManagement.customerApproval({
        auditEmployeeId: employee.id,
        auditEmployeeName: employee.name,
        departmentId: employee.departmentId,
        departmentName: datTotal.nextDepartmentName,
        returnNo: orderNo,
        flowId: datTotal.flowId,
        result: searchData.approvalResult,
        orderServiceCustomer:{
          returnNo: orderNo,
          vistTime: moment(searchData.askTime).format('YYYY-MM-DD HH:mm:ss'),
          vistEmployeeId: searchData.askMan,
          vistEmployeeName: '',
          visitContent: searchData.askContent,
          returnAddress: searchData.address,
          returnMoney: searchData.returnMoney * 100,
          remark: searchData.remark,
        },
        
      });
      if (code !== SUCCESS_CODE){
        this.setState({
          submitLoading: false
        });
        helper.W(msg);
        return;
      }
      this.setState({
        submitLoading: false
      });
      this.props.history.push('ReturnOrderList');
    }
  }

  changeSelect(item, val) {
    if (val) {
      this.setState({
        searchData: [
          {title: '审批人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
          {title: '审批结果', dataIndex: 'approvalResult', formType: 'select', required: true, options: window.globalConfig.customerApprovalReturnList, bindChange: true},
          {title: '客服回访时间', dataIndex: 'askTime', formType: 'date', required: true},
          {title: '回访人', dataIndex: 'askMan', formType: 'input',},
          {title: '退款金额', dataIndex: 'returnMoney', formType: 'number', required: true},
          {title: '备注', dataIndex: 'remark', formType: 'input',},
          {title: '客服回访内容', dataIndex: 'askContent', formType: 'input',},
          {title: '退货地址', dataIndex: 'address', formType: 'input', required: true},
          {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
        ]
      })
    } else {
      this.setState({
        searchData: [
          {title: '审批人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
          {title: '审批结果', dataIndex: 'approvalResult', formType: 'select', required: true, options: window.globalConfig.customerApprovalReturnList, bindChange: true},
          {title: '备注', dataIndex: 'remark', formType: 'input',},
        ]
      })
     
    }
  }
}

export default CustomerApproval;