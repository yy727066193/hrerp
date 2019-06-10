import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Divider, Button, Pagination } from 'antd';
import Columns from './columnConfig';
import { setAction, getLoginInfo, searchList } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import BaseCenterService from  '../../../service/BaseCenterService';
import {SUCCESS_CODE} from "../../../conf";

const { returnMoneyStatus, returnOrderStatus, returnTypeList } = window.globalConfig;

const PATH = 'ReturnOrderList';

let searchData = [
  {title: '销售退货单', dataIndex: 'likeSearch', formType: 'input',},
  {title: '订单编号', dataIndex: 'orderNo', formType: 'input',},
  {title: '销售出库单', dataIndex: 'leaveWarehouseNo', formType: 'input',},
  {title: '下单门店名称', dataIndex: 'otherCompany', formType: 'cascader', options: [],},
  {title: '退款状态', dataIndex: 'returnMoneyStatus', formType: 'select', options: returnMoneyStatus},
  {title: '退货类型', dataIndex: 'typeId', formType: 'select', options: returnTypeList, bindChange: true},
  {title: '退货单状态', dataIndex: 'returnOrderStatus', formType: 'select', options: returnOrderStatus}
];

@inject('store')
@observer
class ReturnOrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      item: {},
      tableDataList: [],
      tableRowData: {},
      comapnyDeptStoreList: []
    }
  }

  render() {
    const { tableDataList, comapnyDeptStoreList } = this.state;
    const { pageNum, pageSize, total, tableLoading} = this.props.store;
    const columns = () => {
      const arr = [];
      Columns.returnOrderTableHead.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
        }
        arr.push(item);
      });
      return arr;
    };
    searchData.forEach((item) => {
      if (item.dataIndex === 'otherCompany') {
        item.options = comapnyDeptStoreList;
        item.defaultProps = { label: 'name', value: 'id', children: 'children' }
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
              showSearchCount={3}
              onSubmit={(data) => this.onSearchReset(true, data)}
              onSelect={(val, item) => this.onChangeSelect(val, item)}
              onReset={() => this.onSearchReset(0, null)}
              >
              {/* <Button type="primary">新增退货单</Button> */}
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
  }

  async getTableList() {
    const searchData = this.searchForm.getFormData();
    const { companyIds, subordinateStoreIds } = getLoginInfo();
    const { pageSize, pageNum, setCommon } = this.props.store;
    const params = {
      companyIds,
      flowId: searchData.returnOrderStatus,
      isComplete: searchData.returnMoneyStatus,
      returnNo: searchData.likeSearch,
      orderBaseNo: searchData.orderNo,
      leaveWarehouseNo: searchData.leaveWarehouseNo,
      pageSize,
      pageNum,
      storeIds: subordinateStoreIds,
      typeId: searchData.typeId
    }
    if (searchData.otherCompany) {
      if (searchData.otherCompany.length === 1) {
        params.comapnyId = searchData.otherCompany[0];
      } else if (searchData.otherCompany.length === 2) {
        params.areaId = searchData.otherCompany[1];
      } else if (searchData.otherCompany.length === 3) {
        params.storeId =  searchData.otherCompany[2];
      }
    }
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.OrderManagement.returnBackOrderList(params);
    if (code !== SUCCESS_CODE) 
      return;
    data.list.forEach((item, index) => {
      item.serialNum = index + 1;
      item.key = index;
      item.returnStatus = searchList(returnOrderStatus, 'value', item.flowId).label;
      item.returnMoney = searchList(returnMoneyStatus, 'value', item.isComplete).label;
      item.typeName = searchList(returnTypeList, 'value', item.typeId).label;
    })
    setCommon('total', data.page.total)
    setCommon('tableLoading', false);
    this.setState({
      tableDataList: data.list
    })
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

  viewDetail(record) { // 跳转到退货详情页面
    this.props.history.push({pathname: 'TotalCompleteDetail', state: {orderNo: record.returnNo}})
  }

  onChangeSelect(item, val) {
    if (val === 1) {
      searchData = [
        {title: '销售退货单', dataIndex: 'likeSearch', formType: 'input',},
        {title: '订单编号', dataIndex: 'orderNo', formType: 'input',},
        {title: '销售出库单', dataIndex: 'leaveWarehouseNo', formType: 'input',},
        {title: '下单门店名称', dataIndex: 'otherCompany', formType: 'cascader', options: [],},
        {title: '退款状态', dataIndex: 'returnMoneyStatus', formType: 'select', options: returnMoneyStatus},
        {title: '退货类型', dataIndex: 'typeId', formType: 'select', options: returnTypeList, bindChange: true},
      ];
    } else if (val === 2) {
      searchData = [
        {title: '销售退货单', dataIndex: 'likeSearch', formType: 'input',},
        {title: '订单编号', dataIndex: 'orderNo', formType: 'input',},
        {title: '销售出库单', dataIndex: 'leaveWarehouseNo', formType: 'input',},
        {title: '下单门店名称', dataIndex: 'otherCompany', formType: 'cascader', options: [],},
        {title: '退款状态', dataIndex: 'returnMoneyStatus', formType: 'select', options: returnMoneyStatus},
        {title: '退货类型', dataIndex: 'typeId', formType: 'select', options: returnTypeList, bindChange: true},
        {title: '退货单状态', dataIndex: 'returnOrderStatus', formType: 'select', options: returnOrderStatus}
      ];
    }
    this.setState({})
  }

  approval(record) { // 跳转到当前审批阶段页面
    switch(record.flowId) {
      // case 0:
      //   this.props.history.push({pathname: 'AddNewReturnOrder', state: {orderNo: record.returnNo, showLog: true}});
      //   break;
      case 1:
        this.props.history.push({pathname: 'PartManageApproval', state: {orderNo: record.returnNo}});
        break;
      case 2:
        this.props.history.push({pathname: 'CustomerApproval', state: {orderNo: record.returnNo}});
        break;
      case 3:
        this.props.history.push({pathname: 'MailingGoods', state: {orderNo: record.returnNo}});
        break;
      case 4:
        this.props.history.push({pathname: 'CustomerAccept', state: {orderNo: record.returnNo}});
        break;
      case 5:
        this.props.history.push({pathname: 'LogisticsApproval', state: {orderNo: record.returnNo}});
        break;
      case 6:
        this.props.history.push({pathname: 'FinaceApproval', state: {orderNo: record.returnNo}});
        break;
      default:
        return null;
    }
  }

  getApprovalFont(id) {
    if (id === 3) {
      return '邮寄';
    } else if(id === 6) {
      return '提交'
    } else {
      return '审批'
    }
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {
          !setAction(PATH, 'viewDetail') ? null: [
          <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>详情</Button>,
          ]
        }
        {/* {
          setAction(PATH, 'storeSubmit') && record.flowId === 0?  [
            <Divider type="vertical" />,
            <Button type="primary" size="small" onClick={() => this.approval(record)}>店长提交</Button>,
          ]: null
        } */}
        {
          setAction(PATH, 'partApproval') && record.flowId === 1?  [
            <Divider type="vertical" />,
            <Button type="primary" size="small" onClick={() => this.approval(record)}>片区经理审批</Button>,
          ]: null
        }
        {
          setAction(PATH, 'customerApproval') && record.flowId === 2?  [
            <Divider type="vertical" />,
            <Button type="primary" size="small" onClick={() => this.approval(record)}>客服部审批</Button>,
          ]: null
        }
        {
          setAction(PATH, 'mailApproval') && record.flowId === 3?  [
            <Divider type="vertical" />,
            <Button type="primary" size="small" onClick={() => this.approval(record)}>邮寄</Button>,
          ]: null
        }
        {
          setAction(PATH, 'customerAccept') && record.flowId === 4?  [
            <Divider type="vertical" />,
            <Button type="primary" size="small" onClick={() => this.approval(record)}>客服部验收</Button>,
          ]: null
        }
        {
          setAction(PATH, 'logisticsApproval') && record.flowId === 5?  [
            <Divider type="vertical" />,
            <Button type="primary" size="small" onClick={() => this.approval(record)}>物流部审批</Button>,
          ]: null
        }
        {
          setAction(PATH, 'finaceApproval') && record.flowId === 6?  [
            <Divider type="vertical" />,
            <Button type="primary" size="small" onClick={() => this.approval(record)}>财务部审批</Button>,
          ]: null
        }
      </span>
    )
  }
}
export default ReturnOrderList;
