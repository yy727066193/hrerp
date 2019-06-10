import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread}  from './../../../components/index';
import { Table, Row, Col } from 'antd';
import tableData from './columnConfig';
import './../InboundOrders//index.less';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";

const breadCrumbList = ['调拨单列表', '调拨单明细']
@inject('store')
@observer
class RequisitionDetail extends React.Component {

  state = {
    tableDataList: {},
    totalCount: 0,
    approvalMan: '',
    approvalId: '',
    approvalLogList: []
  }
  render() {
    const { dbOrder } = this.props.history.location.state;
    const { totalCount, tableDataList } = this.state;
    const { tableLoading } = this.props.store;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['RequisitionList']}/>
        </div>
        <div className="page-wrapper-search">
          <div className="page-wrapper-head">
            <span className="page-wrapper-type fb">调拨单详情</span>
          </div>
          <div className="content clearfix">
            <Row gutter={16}>
              <Col className="gutter-row" span={8}>
                <div className='fl pr20'>
                  <span className="pr8">调拨单号:</span>
                  <span className="fb">{dbOrder}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">调拨日期:</span>
                  <span className="fb">{tableDataList.inDate}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">调出仓库:</span>
                  <span className="fb">{tableDataList.dcDepotName}</span>
                </div>
              </Col>
              {/* <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">调入仓库:</span>
                  <span className="fb">{tableDataList.drDepotName}</span>
                </div>
              </Col> */}
            </Row>
          </div>
        </div>
        <div className="tableListStyle borderBottom">
          <Table 
            dataSource={tableDataList.list} 
            columns={tableData.detailTableHead}
            rowKey={record => record.key}
            loading={tableLoading}
            pagination={false}
            size='small'
            bordered />
            <div className="tableContent clearfix">
              <div className="total fl">
                <span>总计数量:</span>
                <span>{totalCount}</span>
              </div>
            </div>
        </div>
        <div className="otherMes">
          <h3>其他信息</h3>
          <div className="clearfix mt10">
            <div className="fl w_20">
              <span className="pr8">创建人:</span>
              <span className="fb">{tableDataList.createUser}</span>
            </div>
            <div className="fl w_20">
              <span className="pr8">创建时间:</span>
              <span className="fb">{tableDataList.createTime? moment(tableDataList.createTime).format('YYYY-MM-DD HH:mm:ss'): ''}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/RequisitionList`);
      return;
    }
    this.getTableData();
  }

  async getTableData() {
    const { dbOrder } = this.props.history.location.state;
    const { code, data } = await GoodsCenterService.boundOrders.requisitionDetail({
      dbOrder
    });
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    let total = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      if (item.num) {
        total += item.num;
      }
    });
    this.setState({
      tableDataList: data,
      totalCount: total
    })
  }
}

export default RequisitionDetail;