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
import helper from '../../../utils/helper';

const breadCrumbList = ['退货单列表', '客服部验收'];
const partResult = [
  {title: '审批人', value: '', itemSpan: 4},
  {title: '审批时间', value: '', itemSpan: 4},
  {title: '审批结果', value: '', itemSpan: 4},
  {title: '备注', value: '', itemSpan: 4},
];

const searchData = [
  {title: '审批人', dataIndex: 'approvalMan', formType: 'input', disabled: true},
  {title: '审批结果', dataIndex: 'approvalResult', formType: 'select', required: true, options: window.globalConfig.onlyPassStatusList},
  {title: '退款金额', dataIndex: 'returnMoney', formType: 'number', required: true},
  {title: '备注', dataIndex: 'remark', formType: 'input',},
  {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
]


@inject('store')
@observer
class CustomerAccept extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextDept: {},
      dataTotal: {},
      submitLoading: false,
      returnGoodsList: [], // 退货商品数据
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: [], showTotal: {
          money: 0,
          integral: 0
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: partResult},
        {key: 6, title: '客服部验收', sign: 'search', searchData, includeTable: {
          dataSource: [],
          tableHead: Columns.editTableHead
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
          <Button type="primary" className="fr" loading={submitLoading} onClick={() => this.submit()}>提交</Button>
        </div>
        <CommonHead optionList={titleOptions} />
        <CommonCollapse ref={el => this.collDom = el} defaultActiveKey={['1', '6']} optionList={optionList} />
      </div>
    )
  }

  componentDidMount() {
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/ReturnOrderList`);
      return;
    }
    // window.eventBus.on('selectEditTable', this.handleChange)
    this.getDetailData();
    this.getNextApprovaler();
  }

  // handleChange = (val, list) => {
  //   let { returnGoodsList } = this.state;
  //   const newList = JSON.parse(JSON.stringify(returnGoodsList));
  //   if (list[2] === 'input') {
  //     newList[list[1]].saveGoodsNum = list[0];
  //   }
    
  //   this.setState({
  //     returnGoodsList: newList
  //   });
  // }

  async getDetailData() {
    const { orderNo } = this.props.history.location.state;
    const { code, data } = await GoodsCenterService.OrderManagement.approvalPageDetai({
      orderReturnNo: orderNo
    });
    if (code !== SUCCESS_CODE) return;
    const list = [];
    data.orderReturnsInfoList.forEach((item, index) => {
      item.saveGoodsNum = item.returnNum;
      list.push({
        key: index,
        serialNum: index + 1,
        orderNo: item.orderNo,
        goodsHrNo: item.goodsHrNo,
        goodsName: item.goodsName,
        goodsNum: item.goodsNum,
        saveGoodsNum: item.returnNum,
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
    const { setCommon } = this.props.store;
    setCommon('editDataSource', list);
    this.setState({
      dataTotal: data,
      returnGoodsList: data.orderReturnsInfoList,
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: list, showTotal: {
          money: (data.returnTotalPrice / 100).toFixed(2),
          integral: data.returnTotalIntegral
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: data.userVo?[data.userVo]: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: data.orderReturnFlowInfoList},
        {key: 6, title: '客服部验收', sign: 'search', searchData, includeTable: {
          dataSource: list,
          tableHead: Columns.editTableHead
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
      flowId: 4
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
      if (searchData.returnMoney < 0) {
        helper.W('退款金额不能小于0');
        return;
      }
      const { dataTotal } = this.state;
      const { employee } = getLoginInfo();
      const { editDataSource } = this.props.store;
      const list = [];
      editDataSource.forEach((item) => {
        list.push({
          hrNo: item.goodsHrNo,
          num: item.saveGoodsNum
        })
      });
      for(let i=0; i< list.length; i++) {
        if (String(list[i].num).indexOf('.') > -1) {
          helper.W('签收数不能为小数');
          return
        }
      }
      
      this.setState({
        submitLoading: true
      });
      const { code, msg } = await GoodsCenterService.OrderManagement.customerAcceptSubmit({
        flowId: dataTotal.flowId,
        auditEmployeeId: employee.id,
        auditEmployeeName: employee.name,
        result: searchData.approvalResult,
        departmentId: employee.departmentId,
        departmentName: dataTotal.nextDepartmentName,
        returnNo: orderNo,
        returnMoney: searchData.returnMoney * 100,
        remark: searchData.remark,
        goodsMap: list
      });
      if(code !== SUCCESS_CODE) {
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

export default CustomerAccept;