import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread } from '../../../components/index';
// import { Button } from 'antd';
import Columns from './columnConfig';
import { searchList, setAction } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './../ReturnOrderList/commonCollapse';

const breadCrumbList = ['商品订单列表', '门店下单详情'];
const PATH = 'GoodsOrderList';
const { orderStatusList, payWayList, payStatusList } = window.globalConfig;
// const fontList = [
//   {title: '促销类型', value: 1, itemSpan: 4},
//   {title: '促销名称', value: 123, itemSpan: 4},
//   {title: '促销详情', value: 42, itemSpan: 4}
// ];
@inject('store')
@observer
class CompleteDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			userMessage: {},
			totalMessage: {},
			data: [],
			total: 0,
			optionList: [
				{key: 1, title: '基本信息', sign: 'table', tableHead: Columns.baseTableHead, dataSource: []},
				{key: 2, title: '商品信息', sign: 'table', tableHead: Columns.detailGoodsTableHead, dataSource: [], showTotal: {showButton: true, }, showChecked: true},
				// {key: 3, title: '促销信息', sign: 'font', fontList},
				// {key: 4, title: '赠品信息', sign: 'table', tableHead: Columns.disCountTableHead, dataSource: []},
				{key: 5, title: '支付信息', sign: 'table', tableHead: Columns.payTableHead, dataSource: []},
				{key: 6, title: '会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
      ],

		}
	}
	render() {
		const { optionList } = this.state;
		// const { bothOrder } = this.props.location.state;
		return (
			<div className="page-wrapper">
				<div className="page-wrapper-bread">
					<Bread breadList={breadCrumbList} history={this.props.history} routerList={['GoodsOrderList']} />
					{/* <div className="fr">
						{
							bothOrder? [
								 <Button type="primary" style={{marginRight: '5px'}}  onClick={() => this.goOderList(false)}>查看销售退货单</Button>,
							   <Button type="primary"  onClick={() => this.goOderList(true)}>查看销售出库单</Button>
							]: null
						}
						{
							!bothOrder? <Button type="primary"  onClick={() => this.goOderList(true)}>查看销售出库单</Button> : null
						}
						
					</div> */}
				</div>
				<CommonCollapse  moneyFont='应付金额合计' integralFont='获取积分' onClick={() => this.goReturnPage()} defaultActiveKey={['1', '2']} optionList={optionList}/>
			</div>
		)
	}

	componentDidMount() {
		const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/GoodsOrderList`);
      return;
    }
		this.getDetailMessage();
	}

	async getDetailMessage() {
		const { orderNo } = this.props.location.state;
		const { code, data } = await GoodsCenterService.OrderManagement.getReturnGoodsByOrderNum({
      orderNo: orderNo
		});
		if (code !== SUCCESS_CODE) return;
		const list = [];
		let total = 0;
		data.buyCount = 0;
		data.orderDetailList.forEach((item, index) => {
			data.buyCount += item.goodsNum;
      list.push({
        key: index,
        orderNo: item.orderNo,
        goodsHrNo: item.goodsHrNo,
        goodsName: item.goodsName,
        goodsNum: item.goodsNum,
        priceUnitName: item.priceUnitName,
        returnMoney: item.goodsNum,
				unitPrice: item.priceType === 1? (item.unitPrice / 100).toFixed(2) +'(销售价)': (item.unitPrice / 100).toFixed(2) +'(会员价)',
        subtotal: ((item.goodsNum * item.unitPrice) / 100).toFixed(2),
				returnIntegral: item.returnIntegral * item.goodsNum,
				marketPrice: (item.marketPrice / 100).toFixed(2),
      });
      total += (item.goodsNum * item.unitPrice) / 100;
		});
		data.totalAmount = (data.totalAmount / 100).toFixed(2);
		if (data.userVo) {
			data.userVo.key = 0;
		}
		if (data.orderPayInfo) {
			data.orderPayInfo.key = 0;
			data.orderPayInfo.orderAmount = (data.orderAmount / 100).toFixed(2);
			data.orderPayInfo.totalAmount = data.totalAmount;
			data.orderPayInfo.wipePrice = (data.wipePrice / 100).toFixed(2);
			data.orderPayInfo.trade = searchList(payStatusList, 'value', data.tradeStatus).label;
			data.orderPayInfo.payWayName = searchList(payWayList, 'value', data.orderPayInfo.payWay).label;
			if (data.orderPayInfo.sourceId === 1) {
				data.orderPayInfo.sourceName = '收钱吧';
			}
			if (data.sourceId === 1) {
				data.orderPayInfo.paySource = '收银机';
			}
		}
		data.key = 0;
		if (data.sourceId === 1) {
			data.type = '收银机';
		}
		data.changeTradeStatus = searchList(orderStatusList, 'value', data.tradeStatus).label;
		this.setState({
			data: list,
			total,
      totalMessage: data,
			userMessage: data.userVo? data.userVo: {},
			optionList: [
				{key: 1, title: '基本信息', sign: 'table', tableHead: Columns.baseTableHead, dataSource: [data]},
				{key: 2, title: '商品信息', sign: 'table', tableHead: Columns.detailGoodsTableHead, dataSource: list, showTotal: {showButton: data.tradeStatus ===2 && setAction(PATH, 'applyReturn')? true: false , money: data.totalAmount,
					integral: data.totalReturnIntegral, }, showChecked: true},
				// {key: 3, title: '促销信息', sign: 'font', fontList},
				// {key: 4, title: '赠品信息', sign: 'table', tableHead: Columns.disCountTableHead, dataSource: []},
				{key: 5, title: '支付信息', sign: 'table', tableHead: Columns.payTableHead, dataSource: data.orderPayInfo? [data.orderPayInfo]: []},
				{key: 6, title: '会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: data.userVo? [data.userVo]: []},
      ],
    })
	}

	goOderList(bool) {
		if (bool) {
			this.props.history.push({ pathname: '/SaleOutOrderList'})
		} else {
			this.props.history.push({ pathname: '/InStoreOrderList'})
		}
	}

	goReturnPage() {
    const { orderNo } = this.props.location.state;
    this.props.history.push({pathname: 'AddNewReturnOrder', state: {orderNo}})
  }
	
}

export default CompleteDetail;