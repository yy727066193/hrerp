import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Divider, Modal, Button, Pagination } from 'antd';
import Columns from './columnConfig';
import { setAction, getLoginInfo, searchList} from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import UpdateModal from './../TimelyInventory/commonUpdateModal';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";
import BaseCenterService from '../../../service/BaseCenterService';

const PATH = 'storeInstantInventory';
const searchData = [
  {title: '分公司', dataIndex: 'compony', formType: 'select', bindChange: true},
  {title: '仓库', dataIndex: 'wareHouse', formType: 'select',},
  {title: '商品名称', dataIndex: 'goodsName', formType: 'input'},
  {title: '库存状态', dataIndex: 'saveStatus', formType: 'select', options: window.globalConfig.storeStatusList },
]

@inject('store')
@observer
class StoreInstantInventory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableDataList: [],
      tableRowData: {},
      storeList: [],
      allComponyList: []
    }
  }

  render() {
    const { tableDataList, visible, tableRowData } = this.state;
    const { pageNum, pageSize, total, tableLoading} = this.props.store;
    const columns = () => {

      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
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
            onSelect={(item, val) => this.onSelect(item, val)}
            >
            {
              setAction(PATH, 'countingStore')? <Button onClick={() => this.props.history.push({ pathname: '/addNewOrder', state: { showModal: true} } )} type="primary">盘点库存</Button>: null
            }

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
          <Modal title="修改预警值"
            visible={visible}
            onOk={this.handleOk.bind(this)}
            onCancel={this.handleCancel.bind(this)}>
            <UpdateModal tableRowData={tableRowData} ref= {el => this.inputEl = el} />
          </Modal>
      </div>
    )
  }

  componentDidMount() {
    this.searchForm.initFormData({'goodsStatus': 2});
    this.getAllCompony();
    this.getTableList();
  }

  async getStoreList(id) {
    const params = {
      companyOrStore: 1 ,// 0为公司仓
      belongCompanyId: id
    } 
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
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
      if (dataIndex === 'wareHouse') {
        item.options = arr;
      }
    });
    this.setState({
      storeList: arr
    })
  }

  async getAllCompony() {
    const { data, code } = await BaseCenterService.Company.listAll({
      companyIds: getLoginInfo().companyIds
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.name
      });
    });
    searchData.forEach((item) => {
      if (item.dataIndex === 'compony') {
        item.options = arr;
      }
    });
    this.setState({
      allComponyList: arr
    })
  }

  async getTableList() {
    const { storeList } = this.state;
    let searchData = this.searchForm.getFormData();
    let depotObj = searchList(storeList, 'value', searchData.SingalNum);
    const { setCommon, pageNum, pageSize } = this.props.store;
    setCommon('tableLoading', true);
    const params = {
      companyOrStore: 1,
      pageNum,
      pageSize,
      goodsName: searchData? searchData.goodsName: '',
      depotId: searchData? searchData.wareHouse: '',
      depotName: depotObj.label,
      companyOrStoreName: searchData? searchData.compony: '',
      storeStatus: searchData? searchData.saveStatus: ''
    }
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    const { data, code } = await GoodsCenterService.componyStore.selectAll(params);
    if (code !== SUCCESS_CODE) return;
    let index = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      if (item.stockMax === null) {
        item.stockMax = 0;
      }
      if (item.stockMin === null) {
        item.stockMin = 0;
      }
    });
    setCommon('total', data.total);
    setCommon('tableLoading', false);
    this.setState({
      tableDataList: data.list
    })
  }

  onSearchReset(bool, data) {
    if (bool) {
      this.getTableList();
    } else {

    }
  }

  onSelect(item, val) {
    this.getStoreList(val);
  }

  viewDetail(item) {
    this.props.history.push({ pathname: '/InventoryDetail', state: { id: item.goodsCode, depotId: item.depotId, fromCompany: false } });
  }

  changeLimitNum(rowData) {
    this.setState({
      visible: true
    });
    const obj = {
      stockMax: rowData.stockMax,
      stockMin: rowData.stockMin
    };
    this.setState({
      tableRowData: rowData
    });
    setTimeout(() => {
      this.inputEl.setFieldsValue(obj)
    });
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

    this.inputEl.validateFields((err, values) => {
      if (values.stockMax !== '' && values.stockMin !== '') {
        this.updateNum(values);
      }
    });
  }

  handleCancel() {
    this.setState({
      visible: false
    })
  }

  async updateNum(values) {
    const { tableRowData } = this.state;
    const { setCommon } = this.props.store;
    const { id } = tableRowData;
    const { code } = await GoodsCenterService.componyStore.updateNumber({
      id,
      stockMax: Number(values.stockMax),
      stockMin: Number(values.stockMin)
    });
    if (code !== SUCCESS_CODE) {
      return;
    }
    helper.S('修改成功');
    setCommon('modalVisible', false);
    this.getTableList();
  }

  renderAction = (text, record, index) => {

    return (
      <span>
        {
          setAction(PATH, 'viewDetail')? [
          <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>明细</Button>,
          <Divider type="vertical" />,
        ]: null
        }
        {
          setAction(PATH, 'update')? [
            <Button type="danger" ghost size="small"   onClick={() => this.changeLimitNum(record)}>修改预警值</Button>
          ]: null
        }

      </span>
    )
  }
}

export default StoreInstantInventory;
