import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Table, Row, Col, Button } from 'antd';
import { inject, observer } from 'mobx-react';
import { EditSignalCellComponents, Bread, }  from '../../../components/index';
import { getTypeFont} from '../../../utils/public';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import './index.less';
import moment from 'moment';
import Columns from './columnConfig';
import helper from '../../../utils/helper';
const breadCrumbList = ['', '']
@inject('store')
@observer
class ResubmitApproval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      tableDataList: {},
      approvalLogList: []
    }
  }

  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  }

  render() {
    const { dataSource, tableDataList, approvalLogList } = this.state;
    const {signal} = this.props.location.state;
    const columns = Columns.editableTableHead.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
          // type: col.type
        }),
      };
    });
    Columns.editableTableHead.forEach((item) => {
      if (item.dataIndex === 'inputOutputNum') {
        item.title =  signal? '入库数量': '出库数量'
      }
    });
    breadCrumbList.forEach((item, index) => {
      if (index === 0) {
       breadCrumbList[index] = signal? '入库单列表': '出库单列表'
      } else if (index === 1) {
       breadCrumbList[index] = signal? '入库单审批' : '出库单审批'
      }
    })
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={[ signal? 'InboundOrders': 'OutboundOrders']} />
        </div>
        <div className="page-wrapper-head mb10">
          <span className="page-wrapper-type">{`${getTypeFont(tableDataList.typeId)}详情:`}</span>
          <span className="page-wrapper-approval">{this.getMes(tableDataList.status)}</span>
          <Button className="fr" type="primary" onClick={() => this.submit()}>提交</Button> 
          {/* <Button className="fr" type="primary">查看关联单据</Button> */}
        </div>
        <div className="content clearfix">
            <Row gutter={16}>
              <Col className="gutter-row" span={8}>
                <div className='fl pr20'>
                  <span className="pr8">{`${signal ? '入库': '出库'}单号:`}</span>
                  <span className="fb">{tableDataList.orderNumber}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">{`${signal ? '入库': '出库'}日期:`}</span>
                  <span className="fb">{tableDataList.inDate? moment(tableDataList.inDate).format('YYYY-MM-DD'): null}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">{`${signal ? '入库': '出库'}类型:`}</span>
                  <span className="fb">{getTypeFont(tableDataList.typeId)}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">{`${signal ? '入库': '出库'}仓:`}</span>
                  <span className="fb">{tableDataList.depotName}</span>
                </div>
              </Col>
            </Row>
          </div>
        <div className="page-wrapper-content mt15">
          <Table
            components={EditSignalCellComponents}
            rowClassName={() => 'editable-row'}
            bordered
            size="small"
            rowKey={record => record.key}
            dataSource={dataSource}
            pagination={false}
            columns={columns}
          />
        </div>
          <div className="page-wrapper-content mt15">
          <div className="approval">
            <h3 className="topTitleStyle">审批信息</h3>
              <Table dataSource={approvalLogList}
                size="small"
                columns={Columns.logTableHead}
                bordered
                pagination={false}
              />
            </div>
          </div>
      </div>
    );
  }

  componentDidMount() {
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/InboundOrders`);
      return;
    }
    this.getGoodsList();
  }

  async getGoodsList() {
    const { orderNumber, signal} = this.props.location.state;
    const params = {
      orderNumber: orderNumber,
      type: signal? 1: 0
    }
    
    const { data, code } = await GoodsCenterService.boundOrders.inAndOutApprovalList(params);
    if (code !== SUCCESS_CODE) {
      return;
    }
    let total = 0;
    const dataSource = [];
    data.list.forEach((item, index) =>{
      item.serialNum = index + 1;
      item.key = index;
      item.saveNumber = item.inputOutputNum; // 储存一个原始的数量  用来做对比
      dataSource.push(item)
    });
    this.setState({
      dataSource,
      tableDataList: data,
      totalCount: total
    }, () => {
      this.getLogList();
    });
  }

  async getLogList() {
    const { orderNumber} = this.state.tableDataList;
    const { code, data } = await GoodsCenterService.boundOrders.getAllLogList({
      relationOrder: orderNumber
    });
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    data.forEach((item) => {
      index ++;
      if (item.createTime) {
        item.createTime = moment(item.createTime).format("YYYY-MM-DD HH:mm:ss")
      }
      item.approvalStatus = this.getMes(item.approvalStatus);
      item.key = index;
    })
    this.setState({
      approvalLogList: data
    });
  }

  async submit() {
    const { tableDataList, dataSource } = this.state;
    const { signal } = this.props.location.state;
    const list = [];
    dataSource.forEach((item) => {
      list.push({
        goodsCode: item.goodsCode,
        goodsName: item.goodsName,
        spec: item.spec,
        unit: item.unit,
        batchNumber: item.batchNumber,
        productionTime: item.productionTime,
        detailsRemark: item.detailsRemark,
        shelvesId: item.shelvesId,
        inputOutputNum: Math.abs(Number(item.inputOutputNum))
      })
    })
    const { code, msg } = await GoodsCenterService.boundOrders.reApprovalSubmit({
      orderNumber: tableDataList.orderNumber,
      depotId: tableDataList.depotId,
      depotName: tableDataList.depotName,
      type: signal? 1: 0,
      typeId: tableDataList.typeId,
      list
    });
    if (code !== SUCCESS_CODE) {
      helper.W(msg)
      return;
    }
    if (signal) {
      this.props.history.push('/InboundOrders');
    } else {
      this.props.history.push('/OutboundOrders');
    }
  }

  getMes(status) {
    if (status === 1) {
      return '审批中';
    }else if (status === 2) {
      return '通过';
    } else if (status === 3) {
      return '驳回';
    } else if (status === 4) {
      return '反审批';
    }
  }
}

export default ResubmitApproval;
