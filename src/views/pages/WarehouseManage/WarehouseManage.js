import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Divider, Modal, Button, Pagination, Icon, Popconfirm, Spin } from 'antd';
import Columns from './columnConfig';
import { setAction, getProvinceLinkage, getLoginInfo, searchList } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import BaseCenterService from "../../../service/BaseCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from '../../../utils/helper';
import { validMobile, validAddressLength } from "../../../utils/validate";

const PATH = 'WarehouseManage';

const searchData = [
  {title: '所属公司', dataIndex: 'company', formType: 'select'},
  {title: '状态', dataIndex: 'status', formType: 'select', options: window.globalConfig.isCanUse,},
  {title: '仓库名称', dataIndex: 'storeName', formType: 'input'}
];

const modalSearchData = [
  {title: '仓库名称', dataIndex: 'depotName', formType: 'input', required: true},
  {title: '所属公司', dataIndex: 'companyName', formType: 'select', required: true, bindChange: true},
  // {title: '所属门店', dataIndex: 'factName', formType: 'select', bindChange: true},
  {title: '负责人', dataIndex: 'userName', formType: 'select', required: true},
  {title: '地区', dataIndex: 'area', formType: 'cascader', options: getProvinceLinkage()},
  {title: '详细地址', dataIndex: 'adress', formType: 'input', required: true, config: {
    rules: [
      { required: true, message: '请输入详细地址' },
      { validator: validAddressLength }
    ]
  }},
  {title: '联系方式', dataIndex: 'phone', formType: 'input', required: true, config: {
    rules: [
      { required: true, message: '请输入联系方式' },
      { validator: validMobile }
    ]
  }},
  {title: 'K3编码', dataIndex: 'k3Code', formType: 'input'},
  {title: '允许货架管理', dataIndex: 'allowShelfManage', formType: 'radio', options:window.globalConfig.isChooseOptions, required: true},
  {title: '允许负库存', dataIndex: 'allowNegativeStock', formType: 'radio', options:window.globalConfig.isChooseOptions, required: true},
  {title: '参与预警', dataIndex: 'allowWarning', formType: 'radio', options:window.globalConfig.isChooseOptions, required: true},
  {title: '备注', dataIndex: 'remark', formType: 'input'},
]

@inject('store')
@observer
class WarehouseManage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tableDataList: [],
      visible: false,
      forbidModalVisible: false,
      spinLoading: false,
      getAllStore: [],
      companyList: [],
      storeList: [],
      employeeList: []
    }
  }
  render() {
    searchData.forEach((item) => {
      const { dataIndex } = item;
      if (dataIndex === 'wareHouse') {
        item.options = getProvinceLinkage();
      }
    })
    const { tableDataList, visible, forbidModalVisible, spinLoading } = this.state;
    const { pageNum, pageSize, total, tableLoading, submitType, item} = this.props.store;
    let status = '';
    if (item) {
      status = item.status;
    }
    const columns = () => {

      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index);
        }

        arr.push(item);
      });

      return arr;
    };
    modalSearchData.forEach((item) => {
      if (submitType === false && (item.dataIndex === 'companyName' || item.dataIndex === 'factName')) {
        item.disabled = true;
      } else {
        item.disabled = false;
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
            showSearchCount={3}
            >
            {
              setAction(PATH, 'add')? <Button type="primary" onClick={() => this.addStore(true)}>新增仓库</Button>: null
            }

          </SearchForm>
        </div>
        
        <div className="page-wrapper-content">
          <Spin spinning={spinLoading} tip="加载中...">
            <Table
              size="small"
              dataSource={tableDataList}
              columns={columns()}
              rowKey={record => record.key}
              loading={tableLoading}
              pagination={false}
              bordered />
          </Spin>
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
        <Modal title={`${submitType ? '新增' : '编辑'}仓库`}
            visible={visible}
            onOk={this.handleOk.bind(this)}
            onCancel={this.handleCancel.bind(this)}>
          <SearchForm
            formList={modalSearchData}
            ref={el => this.modalSearchForm = el}
            formItemSpan={24}
            onSelect={(val, option) => this.onSelect(val, option)}
            showSearchCount = {999}
            >
          </SearchForm>
        </Modal>
        <Modal  title="仓库"
                visible={forbidModalVisible}
                onOk={this.forbidOk.bind(this)}
                onCancel={this.forbidCancel.bind(this)}>
          <div style={{textAlign: 'center', fontSize: '18px'}}>
            <Icon type="exclamation" />是否{status ? '禁用' : '启用'}仓库?
          </div>
        </Modal>
        
      </div>
    )
  }

  componentDidMount() {
    this.getStoreList();
    this.getAllCompony();
    this.getTableList();
  }

  async getTableList() {
    const searchData = this.searchForm.getFormData();
    const { setCommon, pageNum, pageSize } = this.props.store;
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    setCommon('tableLoading', true);
    const params = {
      pageNum,
      pageSize,
      companyId: searchData.company ? searchData.company : '',
      depotName: searchData ? searchData.storeName: '',
      status: searchData ? searchData.status: ''
    }

    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds;
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    
    const { data, code } = await GoodsCenterService.storeAndShelf.selectAllStoreList(params);
    if (code !== SUCCESS_CODE) {
      return
    }
    data.list.forEach((item, index) =>{
      item.serialNum = index+ 1;
      item.key = index;
      if (item.allowNegativeStock !== null && item.allowNegativeStock === 0) {
        item.allowNegStock ='否';
      } else if(item.allowNegativeStock === 1) {
        item.allowNegStock ='是';
      }
      if (item.allowShelfManage !== null && item.allowShelfManage === 0) {
        item.allowShelfMana ='否';
      } else if (item.allowShelfManage === 1) {
        item.allowShelfMana ='是';
      }
      if (item.allowWarning !== null && item.allowWarning === 0) {
        item.allowWarn ='否';
      } else if (item.allowWarning === 1) {
        item.allowWarn ='是';
      }
      item.status ? item.newStatus ='启用': item.newStatus ='禁用';
      // item.companyOrStore ? item.companyOrStoreName = item.companyOrStoreName : item.companyOrStoreName = '';
      if (!item.companyOrStore) {
        item.companyOrStoreName = '';
      }
    });
    setCommon('total', data.total);
    setCommon('tableLoading', false);
    this.setState({
      tableDataList: data.list
    })
  }

  async getStoreList() {
    const params = {};
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
    this.setState({
      storeList: arr
    })

  }

  async getAllCompony() { // 获取所有公司
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
      if (item.dataIndex === 'company') {
        item.options = arr;
      }
    });

    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'companyName') {
        item.options = arr;
      }
    })
    this.setState({
      companyList: arr
    })
  }

  async getAllStore(id) { // 获取所有门店
    const { code, data } = await BaseCenterService.Store.listAll({
      companyId: id
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.name
      })
    });
    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'factName') {
        item.options = arr;
      }
    })
    this.setState({
      storeList: arr
    })
  }

  async getAllEmployss(id) {
    const { code, data } = await BaseCenterService.Employee.listAll({
      companyId: id,
      pageSize: 9999
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.name
      })
    });
    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'userName') {
        item.options = arr;
      }
    })
    this.setState({
      employeeList: arr
    })
  }

  async getAllEmployssByStore(id) {
    const { code, data } = await BaseCenterService.Employee.getStoreEmployee({
      storeIds: id,
      roleId: 2
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.eid,
        label: item.storeLeaderName
      })
    });
    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'userName') {
        item.options = arr;
      }
    });
    this.setState({
      employeeList: arr
    })
  }

  onSearchReset(bool, data) {
    if (bool) {
      this.getTableList();
    }
  }

  onSelect(item, val) {
    if (item.dataIndex === 'companyName') { // 可以根据门店来查员工也可以根据公司来查员工
      // this.getAllStore(val);
      this.getAllEmployss(val);
    }
    if (item.dataIndex === 'factName') {
      this.getAllEmployssByStore(val);
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

  addStore(bool) {
    const { setCommon } = this.props.store;
    setCommon('submitType', bool);
    setCommon('storeId', '');
    this.setState({
      visible: true
    });
    setTimeout(() => {
      this.modalSearchForm.initFormData({});
    })

  }

  handleOk() {
    const bool = this.modalSearchForm.validateFormValues();
    if (bool)
      return;
    this.addNewStore();
  }

  async addNewStore() {
    const { submitType, storeId } = this.props.store;
    const { companyList, storeList, employeeList } = this.state;
    const formData = this.modalSearchForm.getFormData();
    for (const key in formData) {
      if (key === 'area') {
        if (formData[key]) {
          formData['province'] = formData[key][0];
          formData['city'] = formData[key][1];
          formData['region'] = formData[key][2];
          delete formData[key];
        }
      }
    }
    if (storeId) {
      formData.id = storeId;
    }
    const label = searchList(companyList, 'value', formData.companyName).label;
    const userName = searchList(employeeList, 'value', formData.userName)
    formData.belongCompanyId = formData.companyName;
    formData.belongCompanyName  = label;
    formData.userId = userName.value ;
    formData.userName = userName.label;

    if (formData.factName) {
      formData.companyOrStoreId = formData.factName;
      formData.companyOrStoreName = searchList(storeList, 'value', formData.factName).label;
    } else {
      formData.companyOrStoreId = formData.companyName;
      formData.companyOrStoreName = label;
    }
    
    const { code, msg } = await GoodsCenterService.storeAndShelf[submitType ? 'addNewStore' : 'updateNewStore'](formData);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    this.setState({
      visible: false
    });
    helper.S(submitType ? '添加成功': '修改成功');
    this.getTableList();
  }

  handleCancel() {
    this.setState({
      visible: false
    })
  }

  forbidOk() {
    this.setState({
      forbidModalVisible: false
    });

    this.setIsCanUse();
  }

  async setIsCanUse() {
    const { item } = this.props.store;
    const { code } = await GoodsCenterService.storeAndShelf.setIsCanUse({
      id: item.id,
      status: item.status ? 0 : 1
    })
    if (code !== SUCCESS_CODE) return;
    helper.S('修改成功');
    this.getTableList();
  }

  forbidCancel() {
    this.setState({
      forbidModalVisible: false
    })
  }

  confirm(item) {
    const { setCommon } = this.props.store;
    setCommon('item', item);
    this.setIsCanUse();
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {
          setAction(PATH, 'forbidStore')? [
            <Popconfirm placement="top" title={`是否${record.status ?'禁用': '启用'}仓库`} onConfirm={ () => this.confirm(record)} okText="确定" cancelText="取消">
              <Button type="primary" size="small">{record.status ? '禁用': '启用'}</Button>
              <Divider type="vertical" />
            </Popconfirm>
          ]: null
        }

        {
          setAction(PATH, 'update')? <Button type="primary" size="small" onClick={() => this.edit(record)}>编辑</Button>: null
        }

        {
          setAction(PATH, 'shelfMange')? [
            record.allowShelfManage ? (
              [<Divider type="vertical" />,
              <Button type="danger" ghost size="small" onClick={() => this.shelfManag(record)}>货架管理</Button>]
            ) : null
          ]: null

        }
      </span>
    )
  }

  forbid(item) {
    this.setState({
      forbidModalVisible: true
    });
    const { setCommon } = this.props.store;
    setCommon('item', item);
  }

  edit(item) {
    this.setState({
      spinLoading: true
    })
    item['area'] = [item.province, item.city, item.region];
    item['companyName'] = item.belongCompanyId;
    const { setCommon } = this.props.store;
    setCommon('submitType', false);
    setCommon('storeId', item.id);
   
    if (!item.companyOrStore) { // 0为公司仓
      const req1 = this.getAllEmployss(item.belongCompanyId);
      const total = Promise.all([req1]);
      total.then(() => {
        this.setState({
          visible: true
        },() => {
          setTimeout(() => {
            this.modalSearchForm.initFormData(item);
            this.setState({
              spinLoading: false
            })
          }, 0)
        });
        
      })
    } else {
      const req1 = this.getAllStore(item.belongCompanyId);
      const req2 = this.getAllEmployssByStore(item.companyOrStoreId);
      const total = Promise.all([req1, req2]);
      total.then(() => {
        item['factName'] = item.companyOrStoreId;
        this.setState({
          visible: true
        },() => {
          setTimeout(() => {
            this.modalSearchForm.initFormData(item);
            this.setState({
              spinLoading: false
            })
          }, 0)
        });
      })

    }
    
    
  }

  shelfManag(item) {
    this.props.history.push({ pathname: '/ShelfManage', state: { id: item.id } });
  }
}

export default WarehouseManage;
