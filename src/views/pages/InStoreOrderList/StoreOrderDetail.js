import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { inject, observer } from 'mobx-react';
import CommonHead from './../ReturnOrderList/commonHead';
import { Bread}  from './../../../components/index';
import { Table } from 'antd';
import columns from './columnConfig';
import GoodsCenterService from '../../../service/GoodsCenterService';
import { SUCCESS_CODE } from '../../../conf';
import moment from 'moment';

const breadCrumbList = ['退货入库单列表', '退货入库单详情'];

@inject('store')
@observer
class StoreOrderDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalCount: 0,
      typeCount: 0,
      tableDataList: [],
      titleOptions: [
        {title: '编号', value: '', itemSpan: 4},
        {title: '入库日期', value: '', itemSpan: 4},
        {title: '仓库', value: '', itemSpan: 4},
        {title: '入库单状态', value: '', itemSpan: 4},
        // {title: '查看关联订单', type: 'Button', itemSpan: 4}
      ]
    }
  }

  render() {
    const { titleOptions, tableDataList, typeCount, totalCount } = this.state;
    const { tableLoading } = this.props.store;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['InStoreOrderList']}/>
        </div>

        <CommonHead optionList={titleOptions} operateButton={() => this.relvantOrder()} />
        <div className="page-wrapper-content">
          <Table
            size="small"
            dataSource={tableDataList}
            columns={columns.DetailTableHead}
            rowKey={record => record.key}
            loading={tableLoading}
            pagination={false}
            bordered />
            <div className="mt15">
              <span>合计: {typeCount}种类货品, {totalCount}件商品 </span>
            </div>
        </div>
      </div>
    )
  }

  relvantOrder() {
    // const { orderNumber } = this.props.history.location.state;
  }

  componentDidMount() {
    const state = this.props.history.location.state;
    if (!state) {
      this.props.history.push(`/InStoreOrderList`);
      return;
    }
    this.getDetailMessage();
  }

  async getDetailMessage() {
    const { orderNumber } = this.props.history.location.state;
    const { code, data } = await GoodsCenterService.boundOrders.inAndOutApprovalList({
      orderNumber
    });
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    let total = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      total += item.inputOutputNum;
    });
    this.setState({
      tableDataList: data.list,
      totalCount: total,
      typeCount: data.list.length,
      titleOptions: [
        {title: '编号', value: data.orderNumber, itemSpan: 6},
        {title: '入库日期', value: data.inDate? moment(data.inDate).format('YYYY-MM-DD'): null, itemSpan: 4},
        {title: '仓库', value: data.depotName, itemSpan: 4},
        {title: '入库单状态', value: '已入库', itemSpan: 4},
        // {title: '查看关联订单', type: 'Button', itemSpan: 4}
      ]
    });
  }
}

export default StoreOrderDetail;
