import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread} from '../../../components/index';
import { Button } from 'antd';
import Columns from './columnConfig';
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import { searchList } from "../../../utils/public";
import { SUCCESS_CODE } from "../../../conf";
import CommonCollapse from './../ReturnOrderList/commonCollapse';

const breadCrumbList = ['礼品订单详情'];
const { orderStatusList, payWayList } = window.globalConfig;
@inject('store')
@observer
class GiftListDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			tablePaneList: [
				{key: 1, title: '基本信息', sign: 'table', tableHead: Columns.baseTableHead, dataSource: []},
        {key: 4, title: '礼品信息', sign: 'table', tableHead: Columns.giftsTableHead, dataSource: [], showTotal: true},
        {key: 2, title: '会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []}
			]

		}
	}
	render() {
		const {  tablePaneList } = this.state;
		return (
			<div className="page-wrapper">
				<div className="page-wrapper-bread">
					<Bread breadList={breadCrumbList} />
					<Button className="fr" type="primary">查看销售出库单</Button>
				</div>
				<div className="mt15">
					<CommonCollapse defaultActiveKey='1' ref={el => this.collDom = el} optionList={tablePaneList} />
				</div>
			</div>
		)
	}
	
	componentDidMount() {
		this.getBaseTableData();
	}

	async getBaseTableData() {
		const { orderNo } = this.props.history.location.state;
		const { code, data } = await GoodsCenterService.OrderManagement.getReturnGoodsByOrderNum({
			orderNo: orderNo
		});
		if (code !== SUCCESS_CODE) return;
		const list = [];

		data.orderDetailList.forEach((item, index) => {
      list.push({
				key: index,
        orderNo: item.orderNo,
        goodsHrNo: item.goodsHrNo,
        goodsName: item.goodsName,
        goodsNum: item.goodsNum,
        priceUnitName: item.priceUnitName,
        returnMoney: item.goodsNum,
				unitPrice: (item.unitPrice / 100).toFixed(2),
        subtotal: ((item.goodsNum * item.unitPrice) / 100).toFixed(2),
				returnIntegral: item.returnIntegral * item.goodsNum,
      });
		});
		data.userVo.key = 0;
		data.key = 0;
		if (data.orderPayInfo) {
			data.orderPayInfo.key = 0;
			data.orderPayInfo.orderAmount = (data.orderAmount / 100).toFixed(2);
			data.orderPayInfo.totalAmount = data.totalAmount;
			data.orderPayInfo.wipePrice = data.wipePrice;
			data.orderPayInfo.trade = searchList(orderStatusList, 'value', data.tradeStatus).label;
			data.orderPayInfo.payWayName = searchList(payWayList, 'value', data.orderPayInfo.payWay).label;
			if (data.orderPayInfo.sourceId === 1) {
				data.orderPayInfo.sourceName = '收钱吧';
			}
		}
		if (data.sourceId === 1) {
			data.type = '收银机';
		}
		this.setState({
			tablePaneList: [
				{key: 1, title: '基本信息', sign: 'table', tableHead: Columns.baseTableHead, dataSource: [data]},
        {key: 4, title: '礼品信息', sign: 'table', tableHead: Columns.giftsTableHead, dataSource: list, showTotal: true},
        {key: 2, title: '会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: [data.userVo? data.userVo: {key: 0}]},
			]
		})
	}

}

export default GiftListDetail;