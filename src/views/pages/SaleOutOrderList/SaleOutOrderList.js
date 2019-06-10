import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Button, Pagination } from 'antd';
import Columns from './columnConfig';
import {setAction, getProvinceLinkage, searchList, getLoginInfo} from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import moment from 'moment';


const PATH = 'SaleOutOrderList';

const searchData = [
  {title: '销售出库单', dataIndex: 'likeSearch', formType: 'input', },
  {title: '关联订单号', dataIndex: 'relationOrder', formType: 'input',},
  {title: '分公司', dataIndex: 'otherCompany', formType: 'cascader', options: getProvinceLinkage(), bindChange: true},
  {title: '门店仓库', dataIndex: 'depotId', formType: 'select', options: []},
];

@inject('store')
@observer
class SaleOutPutList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      item: {},
      tableDataList: [],
      tableRowData: {},
      companyList: [],
      storeList: []
    }
  }

  render() {
    const { tableDataList, storeList } = this.state;
    const { pageNum, pageSize, total, tableLoading} = this.props.store;
    const columns = () => {
      const arr = [];
      Columns.outPutTableHead.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
        }

        arr.push(item);
      });

      return arr;
    };

    searchData.forEach((item) => {
      if (item.dataIndex === 'depotId') {
        item.options = storeList;
      }
    })

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
              onChange={(val, item) => this.selectStoreByCompany(val, item)}
              >
          </SearchForm>
        </div>
        <div className="page-wrapper-content">
          <Table
            size="small"
            // scroll={{ y: this.tableRef ? `${this.tableRef.clientHeight}px` : '100%' }}
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
  }

  async getTableList() {
    const { otherCompany, depotId, likeSearch, relationOrder } = this.searchForm.getFormData();
    const { setCommon, pageSize, pageNum } = this.props.store;
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    const params = {
      typeId: 11,
      pageSize,
      pageNum,
      orderNumber: likeSearch,
      province: otherCompany? otherCompany[0] : null,
      city: otherCompany? otherCompany[1] : null,
      region: otherCompany? otherCompany[2] : null,
      depotId,
      relationOrder: relationOrder
    }
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds;
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.boundOrders.ordersList(params);
    if (code !== SUCCESS_CODE) return;
    setCommon('total', data.total);
    setCommon('tableLoading', false);
    let index = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      item.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    this.setState({
      tableDataList: data.list
    });

  }

  onSearchReset(bool, data) {
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

  selectStoreByCompany(val, item) {
    this.getStoreByCompany(item)
  }

  async getStoreByCompany(item) {
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    const params = {
      province: item[0]? item[0]: null,
      city: item[1]? item[1] : null,
      region: item[2]? item[2] : null
    }
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds;
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    const { code, data } = await GoodsCenterService.storeAndShelf.selectAllStoreList(params);
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        label: item.depotName,
        value: item.id
      })
    })
    this.setState({
      storeList: arr
    })
  }

  viewDetail(record) {
    this.props.history.push({pathname: 'SaleOutPutDetail', state: {orderNumber: record.orderNumber}})
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {
          !setAction(PATH, 'viewDetail') ? null: [
          <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>详情</Button>
          ]
        }
      </span>
    )
  }
}
export default SaleOutPutList;
