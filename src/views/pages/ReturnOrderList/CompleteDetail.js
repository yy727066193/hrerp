import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread} from './../../../components/index';
import Columns from './columnConfig';
import { getLoginInfo } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './commonCollapse';
import CommonHead from './commonHead';

const breadCrumbList = ['退货单列表', '已完成'];

@inject('store')
@observer
class CompleteDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextDept: {},
      returnGoodsList: [],
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: [], showTotal: {
          money: '',
          integral: ''
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: []},   
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
    const { optionList, titleOptions, returnGoodsList } = this.state;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['ReturnOrderList']}/>
          {/* <Button type="primary" className="fr" onClick={() => this.viewDetail()}>查看关联入库单明细</Button> */}
        </div>
        <CommonHead optionList={titleOptions} />
        <CommonCollapse newData={returnGoodsList} ref={el => this.collDom = el} defaultActiveKey='1' optionList={optionList} />
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
        subtotal: ((item.goodsNum * item.unitPrice) / 100).toFixed(2),
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
    this.setState({
      returnGoodsList: list,
      optionList: [
				{key: 1, title: '商品信息', sign: 'table', tableHead: Columns.goodsTableHead, dataSource: list, showTotal: {
          money: (data.returnTotalPrice / 100).toFixed(2),
          integral: data.returnTotalIntegral
        }},
        // {key: 4, sign: 'font', title: '促销信息', fontList: disCountFontList},
				// {key: 2, title: '赠品信息', sign: 'table', tableHead: Columns.giftTableHead, dataSource: []},
        {key: 3, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: data.userVo?[data.userVo]: []},
        {key: 5, title: '操作日志', sign: 'doubleFont', fontList: data.orderReturnFlowInfoList},
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
      flowId: 6
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

  viewDetail() {

  }
}

export default CompleteDetail;