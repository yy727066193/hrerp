import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Button, Pagination } from 'antd';
import Columns from './columnConfig';
import { getProvinceLinkage, getTypeFont, getLoginInfo,} from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import moment from 'moment';

const breadCrumbList = ['公司即时库存','出入库明细'];

const searchData = [
  // {title: '所属仓库', dataIndex: 'store', formType: 'select', options: []},
  {title: '商品名称', dataIndex: 'goodsName', formType: 'input'},
  {title: '出入库类型', dataIndex: 'type', formType: 'select', options: []},
  {title: '出入库时间', dataIndex: 'updateTime', formType: 'dateTimeScope'},
];


@inject('store')
@observer
class InventoryDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableDataList: [],
      storeList: [],
      fromCompany: this.props.location.state.fromCompany
    }
  }
  render() {
    searchData.forEach((item) => {
      const { dataIndex } = item;
      if (dataIndex === 'wareHouse') {
        item.options = getProvinceLinkage();
      }
    })
    const { tableDataList, fromCompany } = this.state;
    breadCrumbList[0] = fromCompany ? '公司即时库存': '门店即时库存';
    const { pageNum, pageSize, total, tableLoading} = this.props.store;
    const columns = () => {

      const arr = [];
      Columns.tableDetailHead.forEach(item => {
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
         <Bread breadList={breadCrumbList} history={this.props.history} routerList={[fromCompany? 'timelyInventory' : 'storeInstantInventory']}/>
        </div>
        <div className="page-wrapper-search">
          <SearchForm
            formList={searchData}
            ref={el => this.searchForm = el}
            showSearch={true}
            onSubmit={(data) => this.onSearchReset(true, data)}
            onReset={() => this.onSearchReset(0, null)}
            showSearchCount={3}
            />
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
    const state = this.props.history.location.state;
    if (!state) {
      this.props.history.push(`/timelyInventory`);
      return;
    }
    this.getStoreList();
    this.getTypeList();
    this.getTableList();
  }

  async getTypeList() {
    const { data, code } = await GoodsCenterService.boundOrders.getTypeList();
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.typeId,
        label: item.typeName
      })
    });
    searchData.forEach((item) => {
      if (item.dataIndex === 'type') {
         item.options = arr;
      }
    });
  }

  async getStoreList() {
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    const params = {};
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    const { data, code } = await GoodsCenterService.boundOrders.getStoreListByCompanyId(params);
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.depotName
      });
    });
    searchData.forEach((item) => {
      const { dataIndex } = item;
      if (dataIndex === 'store') {
        item.options = arr;
      }
    });
    this.setState({
      storeList: arr
    });
  }

  async getTableList() {
    const { setCommon, pageNum, pageSize } = this.props.store;
    const { id, depotId } = this.props.history.location.state;
    setCommon('tableLoading', true);
    const searchData = this.searchForm.getFormData();
    const params = {
      goodsCode: id,
      status: 2,
      pageSize,
      pageNum,
      goodsName: searchData? searchData.goodsName: '',
      depotId: searchData.store? searchData.store: depotId,
      typeId: searchData? searchData.type: ''
    }
    const { code, data } = await GoodsCenterService.componyStore.goodsDetailList(params);
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      item.createTime = item.createTime ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss'): null
      item.newType = getTypeFont(item.typeId);
    });
    setCommon('total', data.total);
    setCommon('tableLoading', false);
    this.setState({
      tableDataList: data.list
    });

  }


  onSearchReset(bool, data) {
    if (bool) {
      this.getTableList()
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
    if (item.type) {
      this.props.history.push({ pathname: '/ApprovalDetail', state: { orderNumber: item.orderNumber, signal: true, isComingFromDetail: true} });
    } else {
      this.props.history.push({ pathname: '/ApprovalDetail', state: { orderNumber: item.orderNumber, signal: false, isComingFromDetail: true} });
    }
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>明细</Button>
      </span>
    )
  }
}

export default InventoryDetail;
