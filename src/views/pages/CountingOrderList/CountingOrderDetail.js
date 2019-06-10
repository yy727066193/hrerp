import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread}  from './../../../components/index';
import { Table, Row, Col, Button } from 'antd';
import tableData from './columnConfig';
import './../InboundOrders//index.less';
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import moment from 'moment';

const breadCrumbList = ['盘点单列表', '盘点单明细']
@inject('store')
@observer
class CountingOrderDetail extends React.Component {
  state = {
    tableDataList: [],
    negTotal: 0,
    posTotal: 0,
    dataObj: {}
  }
  render() {
    const {depotName, orderNumber, inventoryTime, inDate, pdUser, relationOutputOrder, relationInputOrder } = this.state.dataObj;
    const { tableDataList, negTotal, posTotal } = this.state;
    const { tableLoading } = this.props.store;
    // const { orderNumber } = this.props.location.state;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['CountingOrderList']}/>
        </div>
        <div className="page-wrapper-search">
          <div className="content clearfix">
            <Row gutter={16}>
              <Col className="gutter-row" span={8}>
                <div className='fl pr20'>
                  <span className="pr8">盘点单号:</span>
                  <span className="fb">{orderNumber}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">盘点仓库:</span>
                  <span className="fb">{depotName}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">盘点日期:</span>
                  <span className="fb">{inDate}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div className='fl pr20'>
               
                {relationOutputOrder ? <Button  onClick={() => this.goStoreDetail(true)} type="primary">查看关联盘亏出库单</Button> : null}
               
                {relationInputOrder ? <Button  onClick={() => this.goStoreDetail(false)} style={{marginLeft: '20px'}} type="primary" >查看关联盘盈入库单</Button> : null}
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <div className="tableListStyle borderBottom">
          <Table
            size="small"
            dataSource={tableDataList}
            columns={tableData.detailTableHead}
            rowKey={record => record.key}
            loading={tableLoading}
            pagination={false}
            bordered />
            <div className="tableContent clearfix">
              <div className="total fl">
                <span>盘盈合计:</span>
                <span>{posTotal}</span>
              </div>
              <div className="total fl ml_10">
                <span>盘亏合计:</span>
                <span>{negTotal}</span>
              </div>
            </div>
        </div>
        <div className="otherMes">
          <h3>其他信息</h3>
          <div className="clearfix mt10">
            <div className="fl w_20">
              <span className="pr8">创建人:</span>
              <span className="fb">{pdUser}</span>
            </div>
            <div className="fl w_20">
              <span className="pr8">创建时间:</span>
              <span className="fb">{inventoryTime? moment(inventoryTime).format('YYYY-MM-DD HH:mm:ss'): ''}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/CountingOrderList`);
      return;
    }
    this.getTableData();
  }

  async getTableData() {
    const { orderNumber } = this.props.location.state;
    const { code, data } = await GoodsCenterService.boundOrders.countOrderDetail({
      orderNumber
    });
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    let negTotal = 0;
    let posTotal = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      if (item.profitLoss > 0) {
        posTotal += item.profitLoss;
      } else {
        negTotal += item.profitLoss;
      }
    });
    this.setState({
      tableDataList: data.list,
      dataObj: data.inventory,
      posTotal,
      negTotal
    })
  }

  goStoreDetail(bool) {
    const { relationOutputOrder, relationInputOrder } = this.state.dataObj;
    if (bool) { // 出库单页面
      this.props.history.push({pathname: 'ApprovalDetail', state: {orderNumber: relationOutputOrder, signal: false, isComingFromDetail: true, fromCountingPage: true, type: 0}})
    } else {// 入库单页面
      this.props.history.push({pathname: 'ApprovalDetail', state: {orderNumber: relationInputOrder, signal: true, isComingFromDetail: true, fromCountingPage: true, type: 1}})
    }
  }
}

export default CountingOrderDetail;
