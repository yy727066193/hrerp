import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread} from './../../../components/index';
import { Row} from 'antd';
import Columns from './columnConfig';
import { getLoginInfo } from "../../../utils/public";
import { Button } from 'antd';
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './commonCollapse';
import CommonHead from './commonHead';
import helper from '../../../utils/helper';

const breadCrumbList = ['退货单列表', '片区经理审批'];

const searchData = [
  {title: '审批人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
  {title: '审批结果', dataIndex: 'approvalResult', formType: 'select', options: window.globalConfig.approvalReturnList, required: true},
  {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
  {title: '备注', dataIndex: 'remark', formType: 'input',}
]
// const fontList = [
//   {title: '审批人', value: 1, itemSpan: 4},
//   {title: '创建时间', value: 123, itemSpan: 4},
//   {title: '退货结果', value: 42, itemSpan: 4},
//   {title: '退回公司', value: 2, itemSpan: 4},
//   {title: '备注', value: 4, itemSpan: 4},
// ];

// const disCountFontList = [
//   {title: '促销类型', value: 1, itemSpan: 4},
//   {title: '促销名称', value: 123, itemSpan: 4},
//   {title: '促销详情', value: 42, itemSpan: 4}
// ];
@inject('store')
@observer
class PartManageApproval extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      nextDept: {},
      totalData: {},
      submitLoading: false,
      optionList: [
				{key: 1, sign: 'table', title: '商品信息', tableHead: Columns.goodsTableHead, dataSource: [], showTotal: {
          money: '',
          integral: ''
        }},
        // {key: 2, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 3, sign: 'table', title: '赠品信息', tableHead: Columns.giftTableHead, dataSource: []},        
        {key: 4, sign: 'table', title: '订单会员信息', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 5, sign: 'search', title: '片区经理审批', searchData},
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
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['ReturnOrderList']}/>
          <Button className="fr" onClick={() => this.submit()} loading={submitLoading} type="primary">提交</Button>
        </div>
        <div className="page-wrapper-search">
          <div className="content clearfix">
            <Row gutter={16}>
              <CommonHead optionList={titleOptions} />
            </Row>
          </div>
        </div>
        <CommonCollapse defaultActiveKey={['1', '5']} ref={el => this.collDom = el} optionList={optionList} />
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
    const { code, data, msg } = await GoodsCenterService.OrderManagement.approvalPageDetai({
      orderReturnNo: orderNo
    });
    if (code !== SUCCESS_CODE){
      helper.W(msg);
      return;
    }
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
    };
    this.setState({
      totalData: data,
      optionList: [
				{key: 1, sign: 'table', title: '商品信息', tableHead: Columns.goodsTableHead, dataSource: list, showTotal: {
          money: (data.returnTotalPrice / 100).toFixed(2),
          integral: data.returnTotalIntegral
        }},
        // {key: 2, sign: 'font', title: '促销信息', fontList: disCountFontList},
        // {key: 3, sign: 'table', title: '赠品信息', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 6, title: '操作日志', sign: 'doubleFont', fontList: data.orderReturnFlowInfoList},
        {key: 4, sign: 'table', title: '订单会员信息', tableHead: Columns.memberTableHead, dataSource: data.userVo?[data.userVo]: []},
        {key: 5, sign: 'search', title: '片区经理审批', searchData},
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
      flowId: 1
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

  async submit() {
    const { orderNo } = this.props.history.location.state;
    if (this.collDom.wrappedInstance.searchForm && !this.collDom.wrappedInstance.searchForm.validateFormValues()) {
      const searchData = this.collDom.wrappedInstance.searchForm.getFormData();
      const { totalData } = this.state;
      const { employee } = getLoginInfo();
      this.setState({
        submitLoading: true
      });
      const { code, msg } = await GoodsCenterService.OrderManagement.approvalCommonDetail({
        auditEmployeeId: employee.id,
        auditEmployeeName: employee.name,
        result: searchData.approvalResult,
        departmentId: employee.departmentId,
        departmentName: totalData.nextDepartmentName,
        returnNo: orderNo,
        flowId: totalData.flowId,
        remark: searchData.remark
      });
      if (code !== SUCCESS_CODE) {
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

export default PartManageApproval;