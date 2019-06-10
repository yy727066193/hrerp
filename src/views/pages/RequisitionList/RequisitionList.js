import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import './index.less';
import { Bread, SearchForm,  Components, EditableContext}  from './../../../components/index';
import { Table, Button, Pagination, Popconfirm, Divider, Modal, Upload, Icon, Tabs, Tooltip, Tag } from 'antd';
import Columns from './columnConfig';
import { setAction, getProvinceLinkage, searchList, getLoginInfo} from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import moment from 'moment';
import helper from '../../../utils/helper';
import Api from './../../../service/api';

const TabPane = Tabs.TabPane;
const PATH = 'RequisitionList';
const STATIC_TABLE_ROW = {key: 0, goodsCode: '', goodsName: '', size: '', unit: '', shelfNum: '', num: '', batch: '', time: '', remark: ''};
const searchData = [
  {title: '调出仓库', dataIndex: 'outStore', formType: 'select'},
  {title: '调入仓库', dataIndex: 'inStore', formType: 'select'},
  {title: '创建时间', dataIndex: 'createTime', formType: 'dateScope'},
  {title: '单号', dataIndex: 'orderNumber', formType: 'input'},
  {title: '调拨日期', dataIndex: 'approvalDate', formType: 'dateScope'}
];

const modalSearchData = [
  {title: '调出仓库', dataIndex: 'outStore', formType: 'select', required: true, bindChange: true},
  {title: '调入仓库', dataIndex: 'inStore', formType: 'select', required: true},
  {title: '调拨日期', dataIndex: 'date', formType: 'date'},
];
@inject('store')
@observer
class RequisitionList extends React.Component {
  constructor(props) {
    const data = [
      STATIC_TABLE_ROW
    ];
    super(props);
    this.state = {
      pageGlobalId: 0, // 默认0为查看公司仓
      tableDataList: [],
      visible: false,
      importVisible: false,
      data,
      storeList: [],
      shelfList: [],
      goodsList: [], // 货品列表
      goodsCodeOptions: []
    }
    this.index = 0;
  }

  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      row.goodsName = searchList(this.state.goodsList, 'value', row.goodsCode).label;
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.setState({ data: newData, editingKey: '' });
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }

  edit(key) {
    if (this.modalSearchFormEl.getFormData().outStore) {
      this.setState({ editingKey: key });
     } else {
       helper.W('请先选择仓库');
     }
  }

  addLineData(record) {
    const data = this.state.data;
    const obj = {};
    for(const key in STATIC_TABLE_ROW) {
      obj[key] = STATIC_TABLE_ROW[key];
    }
    obj.key = ++ this.index;
    data.push(obj);
    this.setState({
      data
    });
  }

  deleteLineData(record) {
    const data = this.state.data;
    data.forEach((item, index) => {
      if (record.key === item.key && data.length > 1) {
        data.splice(index, 1);
      }
    })

    this.setState({
      data
    });
  }

  render() {
    searchData.forEach((item) => {
      const { dataIndex } = item;
      if (dataIndex === 'wareHouse') {
        item.options = getProvinceLinkage();
      }
    });

    const { tableDataList, visible, data, shelfList, importVisible, goodsList, goodsCodeOptions } = this.state;
    const { pageNum, pageSize, total, tableLoading} = this.props.store;
    const { id, name } = getLoginInfo().employee;
    const columns = () => {
      const arr = [];
      Columns.tableHead.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index);
        } else if (dataIndex === 'relationInputOrder' || dataIndex === 'drDepotName' || dataIndex === 'dcDepotName' || dataIndex === 'relationOutputOrder') {
          item.render = (text) => {
           
            if (text) {
              const list = text.split(',');
              const domList = list.map((item) => {
                return <div>{item}</div>
              });
              return (
                <Tooltip trigger="click" overlayStyle={{background:'#fff', color: '#000'}} title={domList}><Tag color="geekblue">查看</Tag></Tooltip>
              )
              
            }
           } 
        } 
        arr.push(item);
      });

      return arr;
    };

    const newColumns = Columns.AddModalColumns.map((col) => {
      if (col.dataIndex === 'addAndDelete') {
        col.render = (text, record) => {
            return (
              <div>
                <span className="cursorPointer" onClick={() => this.addLineData(record)}><Icon type="plus" /></span>
                <Divider type="vertical" />
                <span className="cursorPointer" onClick={() => this.deleteLineData(record)}><Icon type="minus" /></span>
              </div>
            );
          }
      }
      if (col.dataIndex === 'operation') {
        col.render = (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
                {editable ? (
                  <span>
                    <EditableContext.Consumer>
                      {form => (
                        <span
                          className="cursorPointer"
                          onClick={() => this.save(form, record.key)}
                          style={{ marginRight: 4, fontSize:10}}
                        >
                          保存
                        </span>
                      )}
                    </EditableContext.Consumer>
                    <Divider type="vertical" />
                    <Popconfirm
                      title="是否取消操作?"
                      onConfirm={() => this.cancel(record.key)}
                    >
                      <span className="cursorPointer" style={{fontSize: 10}}>取消</span>
                    </Popconfirm>
                  </span>
                ) : (
                  <span className="cursorPointer" onClick={() => this.edit(record.key)}>编辑</span>
                )}
              </div>

          );
        }
      }
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.type,
          dataIndex: col.dataIndex,
          title: col.title,
          required: col.required,
          editing: this.isEditing(record),
          options: shelfList,
          goodsOptions: goodsList,
          goodsCodeOptions
        }),
      };
    });
    return (
      <div className="page-wrapper tooltipStyle">
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
              setAction(PATH, 'import')? <Button type="primary" onClick={() => this.showImportModal()}>导入</Button> : null
            }
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
          <Modal title='新增调拨单'
            visible={visible}
            width="400"
            onOk={this.handleOk.bind(this)}
            onCancel={this.handleCancel.bind(this)}>
          <div className="page-wrapper-search">
            <SearchForm
              formList={modalSearchData}
              ref={el => this.modalSearchFormEl = el}
              showSearchCount = {999}
              onSelect={(item, val) => this.onSelect(item, val)}
              formItemSpan={6}
              >
            </SearchForm>
          </div>

          <div className="page-wrapper-content">
            <Table
              size="small"
              components={Components}
              bordered
              dataSource={data}
              columns={newColumns}
              pagination={false}
              rowClassName="editable-row"
            />
          </div>
        </Modal>
        <Modal title='导入调拨单'
            visible={importVisible}
            onOk={this.importModalOk.bind(this)}
            onCancel={this.importModalCancel.bind(this)}>
             <Upload name="file"
                     showUploadList={false}
                     accept=".xls,.xlsx"
                     onChange={(e) => this.uploadFile(e)}
                     action={Api.boundOrders.importRequisition + '?createPersonId='+ id + '&createPerson=' + name }>
                <Button type="primary">
                  <Icon type="upload"/> 导入
                </Button>

              </Upload>
              <span className="downStyle" onClick={() => this.dowTemplate()}>模板下载</span><span>请您按照模板中的要求填写相关信息</span>
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
        this.getTypeList();
        this.getTableList();
      })
    }
    if (isViewCompany) {
      this.setState({
        pageGlobalId: 0
      }, () => {
        this.getStoreList();
        this.getTypeList();
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
    setCommon('tableLoading', true);
    const params = {
      pageSize,
      pageNum,
      companyOrStore: id? id: pageGlobalId, // 0为公司仓
      dcDepotId: searchData.outStore,
      drDepotId: searchData.inStore,
      dbOrder: searchData.orderNumber,
      beginTime: searchData.createTime? moment(searchData.createTime[0]).format('YYYY-MM-DD'): null, // 创建时间
      overTime: searchData.createTime? moment(searchData.createTime[1]).format('YYYY-MM-DD'): null,
      startTime: searchData.approvalDate? moment(searchData.approvalDate[0]).format('YYYY-MM-DD'): null, // 调拨时间
      endTime: searchData.approvalDate? moment(searchData.approvalDate[1]).format('YYYY-MM-DD'): null,
    }
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    const { code, data } = await GoodsCenterService.boundOrders.transferList(params);
    if (code !== SUCCESS_CODE)
      return;
    setCommon('total', data.total);
    setCommon('tableLoading', false);

    data.list.forEach((item, index) =>{
      if (item) {
        item.serialNum = index + 1;
        item.key = index;
        item.createTime = item.createTime? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss'): null
        if (item.approverStatus === 1) {
          item.approverName = '审批中';
        } else if (item.approverStatus === 2) {
          item.approverName = '审批通过';
        }
      }
    });
    this.setState({
      tableDataList: data.list || []
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
    const { data, code } = await GoodsCenterService.boundOrders.getStoreListByCompanyId(params);
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.depotName,
        companyId: item.companyOrStoreId,
        companyName: item.companyOrStoreName
      });
    });
    searchData.forEach((item) => {
      if (item.dataIndex === 'outStore' || item.dataIndex === 'inStore') {
        item.options = arr;
     }

     modalSearchData.forEach((item) => {
       if (item.dataIndex === 'outStore' || item.dataIndex === 'inStore') {
         item.options = arr;
       }
     })
    });

    this.setState({
      storeList: arr
    })
  }

  onSelect(item, val) {
    const rowData = {key: 0, goodsCode: '', goodsName: '', size: '', unit: ''};
    this.getShelfList(val);
    const id = searchList(item.options, 'value', val).companyId;
    this.setState({
      data: [rowData]
    })
    this.getGoodsListByCompany(id);
  }

  async getShelfList(id) {
    const { code, data } =  await GoodsCenterService.boundOrders.getAllShelfNum({
      depotId: id
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.shelvesId,
        label: item.shelvesId
      });
    });
    this.setState({
      shelfList: arr
    });
  }

  async getTypeList() {
    const { data, code } = await GoodsCenterService.boundOrders.getTypeList({
      type: 2
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.typeId,
        label: item.typeName
      })
    });
    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'inBoundType') {
        item.options = arr;
     }
    });
  }

  async getGoodsListByCompany(id) {
    const { code, data } = await GoodsCenterService.boundOrders.goodsListAll({
      companyId: id,
      goodsGenre: 1
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    const k3NoList = [];
    if (data.length) {
      data.forEach((parentItem) => {
        parentItem.goodsSkuList.forEach((item) => {
          arr.push({
            label: item.name,
            value: item.hrNo,
            goodsNumber: item.hrNo,
            priceUnitName: item.priceUnitName,
            priceUnitId: item.priceUnitId
          })
          k3NoList.push({
            hrNo: item.hrNo,
            value: item.hrNo,
            label: item.hrNo,
            priceUnitName: item.priceUnitName,
            priceUnitId: item.priceUnitId
          })
        })
      })

      this.setState({
        goodsList: arr,
        goodsCodeOptions: k3NoList
      })
    }
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

  addNewOrder() { // 新增调拨单
    this.setState({
      visible: true
    })
  }

  handleCancel() {
    this.setState({
      visible: false
    })
  }

  handleOk() {
    const bool = this.modalSearchFormEl.validateFormValues();
    if (bool) return;

    this.sendSubmit();
  }

  async sendSubmit() {
    const rowData = {key: 0, goodsCode: '', goodsName: '', size: '', unit: '', shelfNum: '', num: '', batch: '', time: '', remark: ''};
    const { outStore, inStore, date } = this.modalSearchFormEl.getFormData();
    const { storeList } = this.state;
    const drDepotObj = searchList(storeList, 'value', inStore);
    const dcDepotObj = searchList(storeList, 'value', outStore);
    const list = [];
    const { employee } = getLoginInfo();
    const colData = this.state.data;

    colData.forEach((item) => {
      list.push({
        goodsCode: item.goodsCode,
        goodsName: item.goodsName,
        spec: item.size,
        unit: item.unit,
        dcDepotId: dcDepotObj.value,
        dcDepotName: dcDepotObj.label,
        drDepotId: drDepotObj.value,
        drDepotName: drDepotObj.label,
        num: item.num,
        shelvesId: item.shelfNum,
        batchNumber: item.batch,
        productionTime: item.time,
        remark: item.remark
      })
    });
    if (drDepotObj.value === dcDepotObj.value) {
      helper.W('调入仓和调出仓不能相同');
      return;
    }
    if (colData.length > 1 || colData[0].goodsName) {
      const { code, msg } = await GoodsCenterService.boundOrders.addNewRequisitionList({
        dcDepotId: outStore,
        drDepotId: inStore,
        createPerson: employee.name,
        createPersonId: employee.id,
        inDate: moment(date).format('YYYY-MM-DD'),
        ishand: 0,
        list
      });
      if (code !== SUCCESS_CODE) {
        helper.W(msg)
        return;
      }
      this.setState({
        visible: false,
        data: [rowData]
      })
      helper.S('新增成功');
    } else {
      helper.W('请先添加商品');
    }
  }

  showImportModal() {
    this.setState({
      importVisible: true
    })
  }

  importModalOk() {
    this.setState({
      importVisible: false
    })
  }

  importModalCancel() {
    this.setState({
      importVisible: false
    })
  }

  dowTemplate() {
    window.location.replace(Api.boundOrders.exportRequisition);
  }

  approvalOrder(record) {
    this.props.history.push({pathname: 'RequisitionApproval', state: {orderNumber: record.dbOrder}})
  }

  uploadFile(e) {
    if (e.file.response) {
      this.setState({
        isUpload: true
      });
      const { code, msg } = e.file.response;
      if (code !== SUCCESS_CODE) {
        helper.W(msg);
      } else {
        helper.S('上传成功')
      }

    }

  }

  viewDetail(item) {
    this.props.history.push({ pathname: '/RequisitionDetail', state: { dbOrder: item.dbOrder, signal: false, isComingFromDetail: true} });
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {
          setAction(PATH, 'viewDetail')? <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>明细</Button> : null
        }
        {
          setAction(PATH, 'approval') && record.approverStatus === 1 && record.nowApprovalId === getLoginInfo().employee.id? [
            <Divider type="vertical" />,
            <Button type="primary" ghost size="small" onClick={() => this.approvalOrder(record)}>审批</Button>
          ]: null
        }
      </span>
      
    )
  }
}

export default RequisitionList;
