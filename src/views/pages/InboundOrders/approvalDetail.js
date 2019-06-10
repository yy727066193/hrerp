import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import './index.less';
import { Bread}  from './../../../components/index';
import { Table, Row, Col, Button } from 'antd';
import tableData from './columnConfig';
import { getTypeFont } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import FormRenderList from './renderFormList';
import helper from '../../../utils/helper';
import moment from 'moment';

const breadCrumbList = ['', '']

@inject('store')
@observer
class ApprovalDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tableDataList: {},
      totalCount: 0,
      approvalMan: '',
      approvalId: '',
      approvalLogList: []
    }
  }

  render() {
   const { signal, isComingFromDetail } = this.props.history.location.state;
   const { totalCount, tableDataList, approvalLogList } = this.state;
   const { tableLoading } = this.props.store;
   breadCrumbList.forEach((item, index) => {
     if (index === 0) {
      breadCrumbList[index] = signal? '入库单列表': '出库单列表'
     } else if (index === 1) {
      breadCrumbList[index] = signal? '入库单审批' : '出库单审批'
     }
   })
   tableData.detailTableHead.forEach((item) => {
     if (item.dataIndex === 'inputOutputNum') {
       item.title =  signal? '入库数量': '出库数量'
     }
   });
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={[ signal? 'InboundOrders': 'OutboundOrders']}/>
        </div>
        <div className="page-wrapper-search">
          <div className="page-wrapper-head">
            <span className="page-wrapper-type">{`${getTypeFont(tableDataList.typeId)}详情:`}</span>
            <span className="page-wrapper-approval">{this.getMes(tableDataList.status)}</span>
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
        </div>
        <div className="tableListStyle borderBottom">
          <Table
            dataSource={tableDataList.list}
            size="small"
            columns={tableData.detailTableHead}
            rowKey={record => record.key}
            loading={tableLoading}
            pagination={false}
            bordered />
            <div className="tableContent clearfix">
              <div className="total fl">
                <span>总计:</span>
                <span>{totalCount}</span>
              </div>
            </div>
        </div>
        <div className="otherMes">
          <h3>其他信息</h3>
          <div className="clearfix mt10">
            <div className="fl w_20">
              <span className="pr8">创建人:</span>
              <span className="fb">{tableDataList.createPerson}</span>
            </div>
            <div className="fl w_20">
              <span className="pr8">创建时间:</span>
              <span className="fb">{tableDataList.createTime}</span>
            </div>
          </div>
        </div>
        <div className="approval">
          <h3 style={{marginBottom: '10px'}}>审批信息</h3>
          {
            isComingFromDetail ? (
              <div className="page-wrapper-content">
                <Table dataSource={approvalLogList}
                       size="small"
                       columns={tableData.logTableHead}
                       bordered
                       pagination={false}
                />
              </div>
            ) : (
              <div>
                <FormRenderList ref={(el) => this.form = el} />
                <Button type="primary" onClick={() => this.submitForm()} style={{width: '100px', marginLeft: '50%'}}>提交</Button>
              </div>
            )
          }

        </div>
      </div>
    )
  }

  componentDidMount() {
    // const { signal } = this.props.location.state;
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/InboundOrders`);
      return;
    }
    this.getGoodsList();
  }

  async getGoodsList() {
    const { orderNumber, fromCountingPage, isComingFromDetail, type} = this.props.location.state;
    const params = {}
    if (fromCountingPage) {
      params.orderNumber = orderNumber;
      params.type = type;
    } else {
      params.orderNumber = orderNumber;
    }
    const { data, code } = await GoodsCenterService.boundOrders.inAndOutApprovalList(params);
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
      tableDataList: data,
      totalCount: total
    }, () => {
      if (isComingFromDetail) {
        this.getLogList();
      } else {
        this.getApprover();
      }
    });
  }

  async getApprover() {
    const { node, orderNumber } = this.state.tableDataList;
    const {data, code} = await GoodsCenterService.boundOrders.approvalStatus({
      node,
      relationOrder: orderNumber
    });
    if (code !== SUCCESS_CODE) return;
    if (this.form && data.length> 0) {
      this.form.setFieldsValue({'name': data[0].approvalName});
    }
    this.setState({
      approvalId: data[0]? data[0].approvalId: ''
    })
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

  submitForm() {
    this.form.validateFields((err, values) => {
      if (!err) {
        this.submit();
      }
    })
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
    const { tableDataList } = this.state;
    const { signal } = this.props.history.location.state;
    const { pointOfContact, name, remark } = this.form.getFieldsValue();
    const { code, msg } = await GoodsCenterService.boundOrders.setApprovalMes({
      orderNumber: tableDataList.orderNumber,
      node: tableDataList.node,
      type: signal? 1 : 0,
      status: pointOfContact,
      nowApprovalId: this.state.approvalId,
      nowApprovalName: name,
      remark,
      // id
    });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S('审核成功');

    if (signal) {
      this.props.history.push('/InboundOrders');
    } else {
      this.props.history.push('/OutboundOrders');
    }

  }
}

export default ApprovalDetail;
