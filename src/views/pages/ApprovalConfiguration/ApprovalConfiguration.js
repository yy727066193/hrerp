import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Modal, Button, Pagination } from 'antd';
import Columns from './columnConfig';
import { setAction, getTypeFont, searchList, getLoginInfo} from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import BaseCenterService from './../../../service/BaseCenterService';
import {SUCCESS_CODE} from "../../../conf";
import moment from 'moment';
import helper from '../../../utils/helper';
import ApprovalBaseForm from './ApprovalBaseForm';

const PATH = 'ApprovalConfiguration';
const searchData = [
  {title: '仓库', dataIndex: 'store', formType: 'select'},
  {title: '审核单据', dataIndex: 'orderType', formType: 'select', options: window.globalConfig.approvalDocList},
  {title: '审核人', dataIndex: 'approvalMan', formType: 'input'}
];

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
  },
  list:[
    {key: 'depotId', label: '所属仓库', formType: 'select', required: true,
      config: {

      }
    },
    {key: 'orderType', label: '审批单据', formType: 'select', options: window.globalConfig.approvalDocList, required: true,
      config: {

      }
    },
    {key: 'approverType', label: '单据类型', formType: 'select', required: true,
      config: {

      }
    },
    {key: 'yesOrNo', label: '审批设置', formType: 'select', options: window.globalConfig.approvalSetList, required: true,
      config: {

      }
    },
    {key: 'approvalLevel', label: '审批层级', formType: 'select',options: window.globalConfig.approvalLevelList, required: true,
      config: {

      }
    },
    {key: 'remark', label: '备注', formType: 'input',
      config: {

      }
    }
  ]
};

@inject('store')
@observer
class ApprovalConfiguration extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tableDataList: [],
      visible: false,
      renderList: [],
      componyOptions: [],
      departmentOptions1: [],
      departmentOptions2: [],
      departmentOptions3: [],
      employeeList1: [],
      employeeList2: [],
      employeeList3: [],
      orderTypeList: [],
      approvalLevel: 0,
      storeList: []
    }
  }
  render() {
    const { tableDataList, visible, renderList } = this.state;
    const { pageNum, pageSize, total, tableLoading, submitType} = this.props.store;
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
              setAction(PATH, 'add')? <Button type="primary" onClick={() => this.addConfig()}>新增</Button>: null
            }

          </SearchForm>
        </div>
        <div className="page-wrapper-content" >
          <Table
            // scroll={{ y: this.tableRef ? `${this.tableRef.clientHeight}px` : '100%' }}
            dataSource={tableDataList}
            columns={columns()}
            size="small"
            rowKey={record => record.key}
            loading={tableLoading}
            pagination={false}
            bordered
            />
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
        <Modal title={`${submitType ? '新增' : '修改'}审批`}
            visible={visible}
            onOk={this.handleOk.bind(this)}
            onCancel={this.handleCancel.bind(this)}>
            <ApprovalBaseForm
              ref={el => this.baseSearchForm = el}
              formItemSpan={24}
              formMap={formMap}
              changeSelectValue={(item, val, option) => this.changeSelectValue(item, val, option)}
              renderList ={renderList}
              >
            </ApprovalBaseForm>

        </Modal>
      </div>
    )
  }

  componentDidMount() {
    this.getStoreList();
    this.getAllCompony();
    this.getTableList();
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
    const { data, code } = await GoodsCenterService.boundOrders.getStoreList(params);
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.depotName
      });
    });
    formMap.list.forEach((item) => {
      if (item.key === 'depotId') {
        item.options = arr;
     }
    });
    searchData.forEach((item) => {
      const { dataIndex } = item;
      if (dataIndex === 'store') {
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
    this.setState({
      componyOptions: arr
    })
  }

  async getTypeList(type) {
    const { data, code } = await GoodsCenterService.boundOrders.getTypeList({
      type
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.typeId,
        label: item.typeName
      })
    });
    formMap.list.forEach((item) => {
      if (item.key === 'approverType') {
        item.options = arr;
     }
    });

    this.setState({
      orderTypeList: arr
    })
  }

  async getTableList() {
    const { setCommon, pageSize, pageNum } = this.props.store;
    const searchData = this.searchForm.getFormData();
    const params = {
      pageSize,
      pageNum,
      depotId: searchData ? searchData.store : '',
      orderType: searchData ? searchData.orderType : '',
      approverName: searchData ? searchData.approvalMan : '',
    }
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.storeAndShelf.selectAllApprovalList(params);
    if (code !== SUCCESS_CODE) return;
    setCommon('total', data.total);
    setCommon('tableLoading', false);
    data.list.forEach((item, index) =>{
      item.serialNum = index + 1;
      item.key = index;
      if (item.orderType === 0) {
        item.type = '审核出库单';
      } else if(item.orderType === 1) {
        item.type = '审核入库单';
      } else if(item.orderType === 2) {
        item.type = '审核调拨单';
      }
      item.yesOrNo ? item.isApproval = '需要审批' : item.isApproval = '无需审批';
      let arr = [];
      let node = [];
      if (item.nodes) {
        arr = item.nodes.split(',') || [];
      }
      if (item.usernames) {
        node = item.usernames.split(',') || []
      }
      item.approvalLevel = this.getApprovalLevel(node.length);

      arr.forEach((newItem, index) => {
        if (newItem * 1 === 1) {
          item.first = node[index];
        } else if (newItem * 1 === 2) {
          item.second = node[index];
        } else if (newItem * 1 === 3) {
          item.third = node[index];
        }
      });
      item.fontApproverType = getTypeFont(item.approverType);
      if (item.updateTime) {
        item.time = moment(item.updateTime).format("YYYY-MM-DD HH:mm:ss");
      }

    });
    this.setState({
      tableDataList: data.list
    })
  }

  handleCancel() {
    this.setState({
      visible: false
    })
  }

  handleOk() {
    this.baseSearchForm.validateFields((err, values) => {
      if (!err) {
       
        this.addNewApprovalData(values)
      }
    })
  }

  async addNewApprovalData(val) {
    const { componyOptions, departmentOptions1, departmentOptions2, departmentOptions3, storeList, employeeList1, employeeList2, employeeList3 } = this.state;
    const { submitType } = this.props.store;
    const storeVal = searchList(storeList, 'value', val.depotId);
    const params = {
      depotId: val.depotId,
      depotName: storeVal.label,
      approverType: val.approverType,
      yesOrNo: val.yesOrNo,
      remark: val.remark,
      orderType: val.orderType,
      list: [],
    }
    if (val.backup1 || val.dep1 || val.store1) { // 如果一级审批存在
      const store = searchList(componyOptions, 'value', val.store1);
      const dept = searchList(departmentOptions1, 'value', val.dep1);
      const person = searchList(employeeList1, 'value', val.backup1)
      params.list.push({
        companyId: val.store1,
        approverName: person.label,
        approverId: person.value,
        deptId: val.dep1,
        companyName: store.label,
        deptName: dept.label,
        approveNode: 1
      });
    }
    if (val.backup2 || val.dep2 || val.store2) {
      const store = searchList(componyOptions,'value', val.store2);
      const dept = searchList(departmentOptions2, 'value', val.dep2);
      const person = searchList(employeeList2, 'value', val.backup2)
      params.list.push({
        companyId: val.store2,
        deptId: val.dep2,
        approverName: person.label,
        approverId: person.value,
        companyName: store.label,
        deptName: dept.label,
        approveNode: 2
      });
    }
    if (val.backup3 || val.dep3 || val.store3) {
      const store = searchList(componyOptions, 'value', val.store3);
      const dept = searchList(departmentOptions3, 'value', val.dep3);
      const person = searchList(employeeList3, 'value', val.backup3)
      params.list.push({
        companyId: val.store3,
        companyName: store.label,
        deptName: dept.label,
        deptId: val.dep3,
        approverName: person.label,
        approverId: person.value,
        approveNode: 3
      });
    }
    const { code, msg } = await GoodsCenterService.storeAndShelf[submitType ? 'getNewApprovalData' : 'updateNewApprovalData'](params)
    if (code !== SUCCESS_CODE){
      helper.W(msg)
      return;
    }
    this.setState({
      visible: false
    })
    helper.S(submitType? '添加成功': '修改成功');
    this.getTableList();
  }

  addConfig() {
    const { setCommon } = this.props.store;
    setTimeout(() => {
      formMap.list.forEach((item) => {
        if (item.key === 'approvalLevel') {
          item.disabled = false;
          item.required = true;
        }
      });
      this.renderSelectForm(0);
      this.baseSearchForm.resetFields();
    }, 0)
    setCommon('submitType', true);
    this.setState({
      visible: true
    })
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

  onSearchReset(bool) {
    if (bool) {
      this.getTableList();
    }
  }

  updateData(item) {
    const { setCommon } = this.props.store;
    // const { componyOptions } = this.state;
    setCommon('submitType', false);
    const req1 = this.getTypeList(item.orderType);
    const total = Promise.all([req1]);
    total.then(() => {
        this.setState({
          visible: true
        });
        this.baseSearchForm.setFieldsValue({});
        const obj = {};
        Object.keys(item).forEach(key => {
          obj[key] = item[key];
          if (key === 'approvalLevel') {
            if (item.nodes) {
              const val = item.nodes.split(',').length;
              obj.approvalLevel = val;
              this.renderSelectForm(val);
            }
           
          }
          // if (key === 'companyids') {
          //  if (item.nodes) {
          //   const arr = item[key].split(',');
          //   const level = item.nodes.split(',').length;
          //   const deptList = item.deptNames.split(',')
          //   if (level === 1) {
          //     obj['store1'] = searchList(componyOptions, 'value', Number(arr[0])).label;
          //     obj['dep1'] = deptList[0];
          //     obj['backup1'] = item.first; 
          //   } if (level === 2) {
          //     obj['store1'] = searchList(componyOptions, 'value', Number(arr[0])).label;
          //     obj['store2'] = searchList(componyOptions, 'value', Number(arr[1])).label;
          //     obj['dep1'] = deptList[0];
          //     obj['dep2'] = deptList[1];
          //     obj['backup1'] = item.first;
          //     obj['backup2'] = item.second; 
          //   } else if (level === 3) {
          //     obj['store1'] = searchList(componyOptions, 'value', Number(arr[0])).label;
          //     obj['store2'] = searchList(componyOptions, 'value', Number(arr[1])).label;
          //     obj['store3'] = searchList(componyOptions, 'value', Number(arr[2])).label;
          //     obj['dep1'] = deptList[0];
          //     obj['dep2'] = deptList[1];
          //     obj['dep3'] = deptList[2];
          //     obj['backup1'] = item.first; 
          //     obj['backup2'] = item.second; 
          //     obj['backup3'] = item.third; 
          //   }
          //  }
          // }
          
          if (key === 'depotId') {
            obj.depotId = item.depotId;
          }
  
          if (key === 'yesOrNo') {// 审批类型
            this.setDisabledLevel(item.yesOrNo);
          }
         
        });
        this.baseSearchForm.setFieldsValue(obj)

    })
  }

  changeSelectValue(item, val) {
    if (item.key === 'yesOrNo') {// 审批类型
      this.setDisabledLevel(val);
    }
    if (item.key === 'approvalLevel') {// 审批等级
      this.setState({
        approvalLevel: val
      })
      this.renderSelectForm(val);
    }
    if (item.key === 'store1' || item.key === 'store2' || item.key === 'store3') {
      this.getAllDepartment(val, item.key);
    }
    if (item.key === 'dep1' || item.key === 'dep2' || item.key === 'dep3') {
      this.getAllEmployee(val, item.key);
    }

    if (item.key === 'orderType') { // 审批单据
      this.getTypeList(val);
      this.baseSearchForm.setFieldsValue({approverType: ''});
    }

  }

  setDisabledLevel(val) {
    if (val) {
      formMap.list.forEach((item) => {
        if (item.key === 'approvalLevel') {
          item.disabled = false;
          item.required = true;
        }
      });

    } else {
      formMap.list.forEach((item) => {
        if (item.key === 'approvalLevel') {
          item.disabled = true;
          item.required = false;
        }
      });
      this.setState({
        renderList: []
      });

    }
  }

  renderSelectForm(val) {
    let { renderList, componyOptions, departmentOptions1, departmentOptions2, departmentOptions3, employeeList1, employeeList2, employeeList3 } = this.state;

    renderList = [];
    let renderListObj1 = {
      title: '一级审批',
      list: [
        {key: 'store1', label: '所属公司', formType: 'select', options: componyOptions},
        {key: 'dep1', label: '审批部门', formType: 'select', options: departmentOptions1},
        {key: 'backup1', label: '审批人', formType: 'select', options: employeeList1}
      ]
    }
    let renderListObj2 = {
      title: '二级审批',
      list: [
        {key: 'store2', label: '所属公司', formType: 'select', options: componyOptions},
        {key: 'dep2', label: '审批部门', formType: 'select', options: departmentOptions2},
        {key: 'backup2', label: '审批人', formType: 'select', options: employeeList2}
      ]
    }
    let renderListObj3 = {
      title: '三级审批',
      list: [
        {key: 'store3', label: '所属公司', formType: 'select', options: componyOptions},
        {key: 'dep3', label: '审批部门', formType: 'select', options: departmentOptions3},
        {key: 'backup3', label: '审批人', formType: 'select', options: employeeList3}
      ]
    }

    for (let i = 0; i<val; i ++) {
      if (i === 0) {
        renderList.push(renderListObj1);
      } else if (i === 1) {
        renderList.push(renderListObj2);
      } else if (i === 2) {
        renderList.push(renderListObj3);
      }
    }

    this.setState({
      renderList
    });
  }

  async getAllDepartment(id,key) {
    const { data, code } = await BaseCenterService.Department.listAll({
      companyId: id
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.name
      });
    });
    if (key === 'store1') {
      this.setState({
        departmentOptions1: arr
      });
    } else if (key === 'store2') {
      this.setState({
        departmentOptions2: arr
      });
    } else if (key === 'store3') {
      this.setState({
        departmentOptions3: arr
      });
    }
   
    this.renderSelectForm(this.state.approvalLevel);
  }

  async getAllEmployee(id, key) {
    const { data, code } = await BaseCenterService.Employee.listAll({
      departmentId: id,
      pageSize: 999
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.name
      });
    });
    if (key === 'dep1') {
      this.setState({
        employeeList1: arr
      });
    } else if (key === 'dep2') {
      this.setState({
        employeeList2: arr
      });
    } else if (key === 'dep3') {
      this.setState({
        employeeList3: arr
      });
    }
    
    this.renderSelectForm(this.state.approvalLevel);
  }

  getApprovalLevel(level) {
    if (level === 1) {
     return '一级审批';
    } else if (level === 2) {
     return '二级审批';
    } else if (level === 3) {
     return '三级审批';
    };
  }

  renderAction = (text, record, index) => {
    return (
      setAction(PATH, 'update')? <Button type="primary" size="small" onClick={() => this.updateData(record)}>修改</Button>: null
     )

  }
}

export default ApprovalConfiguration;
