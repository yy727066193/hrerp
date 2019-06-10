import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread} from './../../../components/index';
import { Button } from 'antd';
import Columns from './columnConfig';
import { getLoginInfo } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './commonCollapse';
import CommonHead from './commonHead';
import moment from 'moment';
import api from '../../../service/api';
import helper from '../../../utils/helper';

const breadCrumbList = ['退货单列表', '财务部退款'];
const partResult = [
  {title: '审批人', value: '', itemSpan: 4},
  {title: '审批时间', value: '', itemSpan: 4},
  {title: '审批结果', value: '', itemSpan: 4},
  {title: '备注', value: '', itemSpan: 4},
];

const searchData = [
  {title: '审批人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
  {title: '退款金额', dataIndex: 'money', formType: 'input', disabled: true},
  {title: '结果', dataIndex: 'approvalResult', formType: 'select', required: true, options: [{value: 1, label: '退款'}]},
  {title: '退款银行', dataIndex: 'bank', formType: 'input', required: true,},
  {title: '退款账号', dataIndex: 'accountNumber', formType: 'input', required: true,},
  {title: '退款时间', dataIndex: 'returnTime', formType: 'dateTime', notSelectBeforeDate: true},
  {title: '备注', dataIndex: 'remark', formType: 'input',},
]

@inject('store')
@observer
class FinaceApproval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextDept: {},
      totalData: {},
      submitLoading: false,
      defaultDisabledMoney: 0, // 默认退款金额为客服部审批所填金额 不可修改
      returnGoodsList: [],
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: [], showTotal: {
          money: '',
          integral: ''
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: partResult},
        {key: 6, title: '财务部退款', sign: 'search', searchData, canUpload: {
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
    const { optionList, titleOptions, returnGoodsList, submitLoading } = this.state;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['ReturnOrderList']} />
          <Button type="primary" className="fr" loading={submitLoading} onClick={() => this.submit()}>提交</Button>
        </div>
        <CommonHead optionList={titleOptions}/>
        <CommonCollapse newData={returnGoodsList} uploadChange={(e) => this.uploadChange(e)} ref={el => this.collDom = el} defaultActiveKey={['1', '6']} optionList={optionList} />
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
        serviceNum: item.serviceNum,
        logisticsNum: item.logisticsNum,
        warehouseName: item.warehouseName,
        putInNo: item.putInNo
      });
    })
    if (data.userVo) {
      data.userVo.key = 1
    }
    let defaultDisabledMoney = 0;
    data.orderReturnFlowInfoList.forEach((item) => {
      if (item.flowId === 4 && item.returnMoney) {
        defaultDisabledMoney = item.returnMoney;
      }
    })
    this.setState({
      totalData: data,
      returnGoodsList: list,
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: list, showTotal: {
          money: (data.returnTotalPrice/100).toFixed(2),
          integral: data.returnTotalIntegral
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: data.userVo?[data.userVo]: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: data.orderReturnFlowInfoList},
        {key: 6, title: '财务部退款', sign: 'search', searchData, canUpload: {
          actions: api.Upload,
          listType: 'picture',
        }},       
      ],
      defaultDisabledMoney,
      titleOptions: [
        {title: '退货单编号', value: data.returnNo, itemSpan: 5},
        {title: '申请门店名称', value: data.storeName, itemSpan: 3},
        {title: '操作人', value: data.createEName, itemSpan: 3},
        {title: '关联订单编号', value: data.orderBaseNo, itemSpan: 5},
        {title: '关联销售出库单编号', value: data.leaveWarehouseNo, itemSpan: 5},
      ]
    }, () => {
      this.getNextApprovaler()
    })
  }

  uploadChange(e) {
    let url = this.state.url;
    this.setState({
      url: url += e + ','
    });
  }

  async getNextApprovaler() {
    const { defaultDisabledMoney } = this.state;
    const { code, data } = await GoodsCenterService.OrderManagement.getNextApprovalMan({
      flowId: 6
    });
    if (code !== SUCCESS_CODE) return;
    if (this.collDom.wrappedInstance.searchForm){
      const returnSearchData = this.collDom.wrappedInstance.searchForm;
      returnSearchData.initFormData({
        SingalNum: data.name,
        approvalMan: getLoginInfo().employee.name,
        money: (defaultDisabledMoney / 100).toFixed(2)
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
      const { totalData } = this.state;
      const { employee } = getLoginInfo();
      this.setState({
        submitLoading: true
      });
      const { code, msg } = await GoodsCenterService.OrderManagement.finaceApprovalSubmit({
        flowId: totalData.flowId,
        auditEmployeeId: employee.id,
        auditEmployeeName: employee.name,
        result: searchData.approvalResult,
        departmentId: employee.departmentId,
        departmentName: totalData.nextDepartmentName,
        returnNo: orderNo,
        orderReturnFinance:{
          bankName: searchData.bank,
          bankCardNo: searchData.accountNumber,
          file: this.state.file,
          backTime: searchData.returnTime? moment(searchData.returnTime).format('YYYY-MM-DD HH:mm:ss'): null,
          returnMoney: searchData.money? searchData.money * 100: '',
          returnNo: orderNo,
          remark: searchData.remark
        }
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
      this.props.history.push('ReturnOrderList')
    }
  }
}

export default FinaceApproval