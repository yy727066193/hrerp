import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Divider, Button, Pagination } from 'antd';
import Columns from './columnConfig';
import { setAction, getLoginInfo, searchList } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import BaseCenterService from '../../../service/BaseCenterService';
import {SUCCESS_CODE} from "../../../conf";
import moment from 'moment';

const { orderStatusList, payStatusList } = window.globalConfig;
const breadCrumbList = ['商品订单列表'];
const PATH = 'GoodsOrderList';
const searchData = [
  {title: '订单编号', dataIndex: 'likeSearch', formType: 'input'},
  {title: '关联出库单', dataIndex: 'leaveWarehouseNo', formType: 'input'},
  {title: '订单状态', dataIndex: 'orderStatus', formType: 'select', options: window.globalConfig.orderStatusList},
  {title: '支付状态', dataIndex: 'payStatus', formType: 'select', options: window.globalConfig.payStatusList},
  {title: '下单门店', dataIndex: 'orderStore', formType: 'cascader', options: [], changeOnSelect: true},
  {title: '下单时间', dataIndex: 'orderTime', formType: 'dateScope'},
];

@inject('store')
@observer
class GoodsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      item: {},
      tableDataList: [],
      tableRowData: {},
      companyList: [],
      comapnyDeptStoreList: []
    }
  }

  render() {
    const { tableDataList, comapnyDeptStoreList } = this.state;
    const { pageNum, pageSize, total, tableLoading} = this.props.store;
    const columns = () => {
      const arr = [];
      Columns.goodsTableHead.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
        }
        arr.push(item);
      });

      return arr;
    };
    searchData.forEach((item) => {
      if (item.dataIndex === 'orderStore') {
        item.options = comapnyDeptStoreList;
        item.defaultProps = { label: 'name', value: 'id', children: 'children' }
      }
    })
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} />
        </div>
        <div className="page-wrapper-search">
          <SearchForm
            formList={searchData}
            ref={el => this.searchForm = el}
            showSearch={setAction(PATH, 'search')}
            onSubmit={(data) => this.onSearchReset(true, data)}
            onReset={() => this.onSearchReset(0, null)}
            onSelect={(option, val) => this.selectInput(option, val)}
            >
          </SearchForm>
        </div>
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
      </div>
    )
  }

  componentDidMount() {
    this.getTableList();
    this.setOptions();
  }

  setOptions = async () => {
    const { companyIds } = getLoginInfo();
    const { data:companyList } = await BaseCenterService.Company.listAll({ companyIds });
    const { data:areaData } = await BaseCenterService.Department.listAll({ departmentType: 4 });
    const { data:storeList } = await BaseCenterService.Store.listAll({ companyIds });
    if (companyList && areaData && areaData.list && storeList) {
      this.setState({ companyList, deptList: areaData.list, storeList, comapnyDeptStoreList: this.formatCompanyAreaStore(companyList, areaData.list, storeList)})
    }
  };

  formatCompanyAreaStore = (companyList, deptList, storeList) => {
    for (let i = 0; i < companyList.length; i++) {
      const comapny = companyList[i];
      comapny.children = [];
      for (let j = 0; j < deptList.length; j++) {
        const dept = deptList[j];
        dept.children = storeList.filter(item => item.areaId === dept.id);
        if (dept.companyId === comapny.id) {
          comapny.children.push(dept)
        }
      }
    }
    return companyList;
  };

  async getTableList() {
    const { likeSearch, payStatus, orderStatus, orderStore, orderTime, leaveWarehouseNo } = this.searchForm.getFormData();
    const { companyIds, subordinateStoreIds } = getLoginInfo();
    const { pageSize, pageNum, setCommon } = this.props.store;
    const params = {
        typeId: 1,
        companyIds,
        pageSize,
        pageNum,
        orderNo: likeSearch, // 订单号
        leaveWarehouseNo,
        payStatus,   // 支付状态
        tradeStatus: orderStatus, // 订单状态
        startDate: orderTime? moment(orderTime[0]).format('YYYY-MM-DD'): null,
        endDate: orderTime? moment(orderTime[1]).format('YYYY-MM-DD'): null,
        storeIds: subordinateStoreIds
    };
    if (orderStore) {
      if (orderStore.length === 1) {
        params.comapnyId = orderStore[0];
      } else if (orderStore.length === 2) {
        params.areaId = orderStore[1];
      } else if (orderStore.length === 3) {
        params.storeId =  orderStore[2];
      }
    }
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.OrderManagement.selectAllGoodsOrder(params);
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      item.totalAmount = (item.totalAmount / 100).toFixed(2);
      if (item.sourceId === 1) {
        item.type = '收银机';
      }
      item.changeTradeStatus = searchList(orderStatusList, 'value', item.tradeStatus).label
      item.changePayStatus = searchList(payStatusList, 'value', item.payStatus).label
    })
    setCommon('total', data.page.total);
    setCommon('tableLoading', false);
    this.setState({
      tableDataList: data.list
    })
  }

  onSearchReset(bool) {
    if (bool) {
      this.getTableList();
    }
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

  viewDetail(item) {
    if (item.tradeStatus === 5) { // 退货已完成情况 可查看退货详情
      this.props.history.push({pathname: '/CompleteDetail', state: {orderNo: item.orderNo, bothOrder: true}});
    } else {
      this.props.history.push({pathname: '/CompleteDetail', state: {orderNo: item.orderNo, bothOrder: false}})
    }

  }

  applyReturn(item) {
    this.props.history.push({pathname: '/AddNewReturnOrder', state: {orderNo: item.orderNo}})
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {
          !setAction(PATH, 'viewDetail') ? null: [
          <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>详情</Button>,

          ]
        }
        {
          setAction(PATH, 'applyReturn') && record.tradeStatus === 2 ?
          [
            <Divider type="vertical" />,
            <Button type="danger" ghost size="small" setAction onClick={() => this.applyReturn(record)}>申请退货</Button>
          ]: null
        }

      </span>
    )
  }
}


export default GoodsList;
