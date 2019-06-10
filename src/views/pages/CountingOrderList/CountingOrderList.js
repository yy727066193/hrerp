import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Divider, Button, Pagination, Modal, Tabs } from 'antd';
import Columns from './columnConfig';
import {setAction, getProvinceLinkage, searchList, getLoginInfo} from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import AddNewOrder from './addNewOrder';
import moment from 'moment';
import helper from '../../../utils/helper';

const TabPane = Tabs.TabPane;
const PATH = 'CountingOrderList';

const searchData = [
  {title: '盘点仓库', dataIndex: 'store', formType: 'select'},
  {title: '单号', dataIndex: 'SingalNum', formType: 'input'},
  {title: '创建时间', dataIndex: 'createTime', formType: 'dateScope'},
  {title: '盘点日期', dataIndex: 'approvalDate', formType: 'dateScope'}
];

@inject('store')
@observer
class CountingOrderList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pageGlobalId: 0, // 默认0为查看公司仓
      tableDataList: [],
      visible: false,
      addOrderVisable: false,
      storeList: [],
    }
  }
  render() {
    searchData.forEach((item) => {
      const { dataIndex } = item;
      if (dataIndex === 'wareHouse') {
        item.options = getProvinceLinkage();
      }
    })
    const { tableDataList, visible, addOrderVisable } = this.state;
    const { pageNum, pageSize, total, tableLoading, rowData} = this.props.store;
    const columns = () => {

      const arr = [];
      Columns.tableData.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index);
        }

        arr.push(item);
      });

      return arr;
    };
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={[`${searchList(getLoginInfo().modules || [], 'path', PATH).name || ''}`]} />
        </div>
        <div className="page-wrapper-search">
          <SearchForm
            formList={searchData}
            ref={el => this.searchForm = el}
            showSearch={setAction(PATH, 'search')}
            onSubmit={(data) => this.onSearchReset(true, data)}
            onReset={() => this.onSearchReset(0, null)}
            showSearchCount={3}
            >
            {
              setAction(PATH, 'add')? <Button onClick={() => this.addNewOrder()} type="primary">新增</Button>: null
            }
          </SearchForm>
        </div>
        <Tabs defaultActiveKey="0" onChange={this.changeTab.bind(this)} >
            {
              !setAction(PATH, 'viewCompany')? null: [
                <TabPane tab="公司仓" key="0" />
              ]
            }
            {
              !setAction(PATH, 'viewStore')? null: [
                <TabPane tab="门店仓" key="1" />
              ]
            }
        </Tabs>
        <div className="page-wrapper-content">
          <Table
            size="small"
            dataSource={tableDataList}
            columns={columns()}
            rowKey={record => record.key}
            loading={tableLoading}
            pagination={false}
            bordered />
        </div>
        <div className="page-wrapper-page">
          <Pagination
            onChange={(num) => this.pageChange(0, num)}
            onShowSizeChange={(num, size) => this.pageChange(1, size)}
            current={pageNum}
            total={total}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total) => `${total}条`} />
        </div>
        <Modal title="生成盘盈盘亏单"
            visible={visible}
            onOk={this.handleOk.bind(this)}
            onCancel={this.handleCancel.bind(this)}>
           <div className="clearfix">
            <Button className="fl" disabled={rowData && rowData.relationInputOrder? true: false} onClick={() => this.getOrderNumber(1)} style={{marginLeft: '15%'}} type="primary" size="large">生成盘盈入库单</Button>
            <Button className="fr" disabled={rowData && rowData.relationOutputOrder? true: false} onClick={() => this.getOrderNumber(0)} style={{marginRight: '15%'}} type="primary" size="large">生成盘亏出库单</Button>
           </div>
        </Modal>
        <Modal title="新增盘点单"
               visible={addOrderVisable}
               width={800}
               footer={null}
            >
          <AddNewOrder />
        </Modal>
      </div>
    )
  }

  componentDidMount() {
    const isViewCompany = setAction(PATH, 'viewCompany');
    const isViewStore = setAction(PATH, 'viewStore');
    if (isViewStore) {
      this.setState({
        pageGlobalId: 1
      }, () => {
        this.getStoreList();
        this.getTableList();
      })
    }
    if (isViewCompany) {
      this.setState({
        pageGlobalId: 0
      }, () => {
        this.getStoreList();
        this.getTableList();
      })
    }
    
  }

  changeTab(e) {
    this.getStoreList(e);
    this.getTableList(e);
    this.setState({
      pageGlobalId: e
    });
  }

  async getTableList(id) {
    const searchData = this.searchForm.getFormData();
    const { pageGlobalId } = this.state;
    const { setCommon, pageSize, pageNum } = this.props.store;
    const params = {
      pageSize,
      pageNum,
      companyOrStore: id? id: pageGlobalId, // 0为公司仓
      orderNumber: searchData.SingalNum,
      depotId: searchData.store,
      beginTime: searchData.createTime? moment(searchData.createTime[0]).format('YYYY-MM-DD'): null, // 创建时间
      overTime: searchData.createTime? moment(searchData.createTime[1]).format('YYYY-MM-DD'): null,
      startTime: searchData.approvalDate? moment(searchData.approvalDate[0]).format('YYYY-MM-DD'): null, // 盘点时间
      endTime: searchData.approvalDate? moment(searchData.approvalDate[1]).format('YYYY-MM-DD'): null,
    }
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    setCommon('tableLoading', true);
    const { data, code } = await GoodsCenterService.boundOrders.countList(params);
    if (code !== SUCCESS_CODE) return;
    setCommon('total', data.total);
    setCommon('tableLoading', false);

    let index = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
    });
    this.setState({
      tableDataList: data.list
    })
  }

  async getStoreList(id) {
    const { pageGlobalId } = this.state;
    const params = {
      companyOrStore: id? id : pageGlobalId ,// 0为公司仓
    }
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    const { data, code } = await GoodsCenterService.boundOrders.getStoreList(params);
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.depotName
      });
    });
    searchData.forEach((item) => {
      if (item.dataIndex === 'store') {
        item.options = arr;
     }
    });
    this.setState({
      storeList: arr
    })
  }

  onSearchReset(bool) {
    if (bool) {
      this.getTableList();
    }
  }

  addNewOrder() {
    this.props.history.push({ pathname: '/addNewOrder'});
  }

  pageChange(bool, data) {
    const { setCommon } = this.props.store;
    if (bool) { // 每页数量改变
      setCommon('pageSize', data);
    } else { // 页数变化
      setCommon('pageNum', data);
    }
    this.getTableList();
  }

  handleOk() {
    this.setState({
      visible: false
    });
  }

  handleCancel() {
    this.setState({
      visible: false
    })
  }

  getOrderNumber(bool) {
    this.sendType(bool);
  }

  async sendType(bool) {
    const { rowData } = this.props.store;
    const { code, msg } = await GoodsCenterService.boundOrders.generoteNumber({
      pdOrder: rowData.orderNumber,
      type: bool
    });
    if (code !== SUCCESS_CODE) {
      helper.W(msg)
      return;
    }
    helper.S('生成成功');
    this.setState({
      visible: false
    });
    this.getTableList();
  }

  generoteOrderNumber(item) {
    const { setCommon } = this.props.store;
    this.setState({
      visible: true
    });
    setCommon('rowData', item);
  }

  viewDetail(item) {
    this.props.history.push({ pathname: '/CountingOrderDetail', state: { orderNumber: item.orderNumber } });
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {
          setAction(PATH, 'viewDetail')? [
            <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>明细</Button>
          ]: null
        }
        {
          record.relationInputOrder && record.relationOutputOrder ? null:
          [
            <Divider type="vertical" />,
            setAction(PATH, 'relOrder')? <Button type="danger" ghost size="small" onClick={() => this.generoteOrderNumber(record)}>生成关联单据</Button>: null
          ]
        }
      </span>
    )
  }
}

export default CountingOrderList;
