import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import './../InboundOrders/index.less';
import { Bread}  from './../../../components/index';
import { Table, Row, Col, Button } from 'antd';
import tableData from './columnConfig';
import { getTypeFont } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import FormRenderList from './../InboundOrders/renderFormList';
import {SUCCESS_CODE} from "../../../conf";
import helper from '../../../utils/helper';
import moment from 'moment';

const breadCrumbList = ['调拨单列表','调拨单审批']

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
   const { totalCount, tableDataList } = this.state;
   const { tableLoading } = this.props.store;
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['RequisitionList']} />
        </div>
        <div className="page-wrapper-search">
          <div className="page-wrapper-head">
            <span className="page-wrapper-type">{`${getTypeFont(tableDataList.typeId)}详情:`}</span>
            <span className="page-wrapper-approval">{this.getMes(tableDataList.status)}</span>
          </div>
          <div className="content clearfix">
            <Row gutter={16}>
              <Col className="gutter-row" span={8}>
                <div className='fl pr20'>
                  <span className="pr8">单号</span>
                  <span className="fb">{tableDataList.dbOrder}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">调拨日期</span>
                  <span className="fb">{tableDataList.inDate? moment(tableDataList.inDate).format('YYYY-MM-DD'): null}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">调出仓库</span>
                  <span className="fb">{tableDataList.dcDepotName}</span>
                </div>
              </Col>
              <Col className="gutter-row" span={4}>
                <div className='fl pr20'>
                  <span className="pr8">调入仓库</span>
                  <span className="fb">{tableDataList.drDepotName}</span>
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
              <span className="fb">{tableDataList.createUser}</span>
            </div>
            <div className="fl w_20">
              <span className="pr8">创建时间:</span>
              <span className="fb">{tableDataList.createTime? moment(tableDataList.createTime).format('YYYY-MM-DD HH:mm:ss'): null}</span>
            </div>
          </div>
        </div>
        <div className="approval">
          <h3>审批信息</h3>
          <div>
            <FormRenderList ref={(el) => this.form = el} />
            <Button type="primary" onClick={() => this.submitForm()} style={{width: '100px', marginLeft: '50%'}}>提交</Button>
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
    this.getGoodsList()
  }

  async getGoodsList() {
    const { orderNumber } = this.props.location.state;
    const { data, code } = await GoodsCenterService.boundOrders.requisitionDetail({
      dbOrder: orderNumber
    });
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    let total = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      total += item.num;
    });
    this.setState({
      tableDataList: data,
      totalCount: total,
    });
    this.getApprover(data.node, data.dbOrder)
  }

  async getApprover(node, orderNumber) {
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
  async submit() {
    const { tableDataList, approvalId } = this.state;
    const { pointOfContact, name, remark } = this.form.getFieldsValue();
    const { code } = await GoodsCenterService.boundOrders.requisitionApproval({
      dbOrder: tableDataList.dbOrder,
      node: tableDataList.node,
      status: pointOfContact,
      nowApprovalId: approvalId,
      nowApprovalName: name,
      remark
    });
    if (code !== SUCCESS_CODE) return;
    helper.S('审核成功');
    this.props.history.push('RequisitionList');

  }
}

export default ApprovalDetail;
