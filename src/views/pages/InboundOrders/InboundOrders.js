import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm, Components, EditableContext}  from './../../../components/index';
import { Table, Modal, Button, Pagination, Popconfirm, Divider, Upload, Icon, Tabs } from 'antd';
import tableData from './columnConfig';
import { setAction, getLoginInfo, searchList, getTypeFont} from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import moment from 'moment';
import helper from '../../../utils/helper';
import './index.less';
import Api from './../../../service/api';

const TabPane = Tabs.TabPane;
const PATH = 'InboundOrders';

const searchData = [
  {title: '入库类型', dataIndex: 'class', formType: 'select'},
  {title: '入库单号', dataIndex: 'SingalNum', formType: 'input'},
  {title: '创建时间', dataIndex: 'createTime', formType: 'dateScope'},
  {title: '审批状态', dataIndex: 'approvalStatus', formType: 'select', options: window.globalConfig.approvalStatusList},
  {title: '入库仓库', dataIndex: 'wareHouse', formType: 'select', options: []},
];

const modalSearchData = [
  {title: '仓库名', dataIndex: 'store', formType: 'select', required: true, bindChange: true},
  {title: '入库类型', dataIndex: 'inBoundType', formType: 'select', required: true},
  {title: '往来单位', dataIndex: 'ownStore', formType: 'select'},
  {title: '入库日期', dataIndex: 'date', formType: 'date'},
  {title: '创建人', dataIndex: 'createPerson', formType: 'input', disabled: true},
  {title: '备注', dataIndex: 'remark', formType: 'input'},
];

const STATIC_TABLE_ROW = {key: 0, goodsCode: '', goodsName: '', size: '', unit: '', shelfNum: '', num: '', batch: '', time: '', remark: ''};

@inject('store')
@observer
class InboundOrders extends React.Component {

  constructor(props) {
    super(props);
    const data = [
      STATIC_TABLE_ROW
    ];
    this.state = {
      pageGlobalId: 0, // 默认0为查看公司仓
      tableDataList: [],
      visible: false,
      modalTableDataList: [],
      editingKey: '',
      data,
      shelfList: [], // 货架列表
      storeList: [], // 仓库列表
      typeList: [],  // 存出库类型
      goodsList: [], // 货品列表
      goodsCodeOptions: [],
      importVisible: false,
      transitUnitList: [], // 往来单位列表
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
   if (this.modalSearchFormEl.getFormData().store) {
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
    const { tableDataList, visible, data, shelfList, goodsList, goodsCodeOptions, importVisible, transitUnitList } = this.state;
    const { pageNum, pageSize, total, tableLoading, submitType} = this.props.store;
    const { employee } = getLoginInfo();
    const columns = () => {
      const arr = [];
      tableData.Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
        }
        arr.push(item);
      });

      return arr;
    };
    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'ownStore') {
        item.options = transitUnitList;
      }
    })

    const newColumns = tableData.AddModalColumns.map((col) => {
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
                    <EditableContext.Consumer >
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
          placeholder: col.placeholder,
          editing: this.isEditing(record),
          options: shelfList,
          goodsOptions: goodsList,
          goodsCodeOptions
        }),
      };
    });
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
              !setAction(PATH, 'import')? null : [
                <Button onClick={() => this.showImportModal()} type="primary">
                  <Icon type="upload" /> 导入
                </Button>
              ]
            }
            {
              !setAction(PATH, 'add')? null : [
                <Button type="primary" onClick={() => this.addOrders()}>新增入库单</Button>
              ]
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
        <Modal title={`${submitType ? '新增' : '编辑'}入库单`}
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
        <Modal title='导入入库单'
            visible={importVisible}
            onOk={this.importModalOk.bind(this)}
            onCancel={this.importModalCancel.bind(this)}>
            <Upload name="file" className="fl"
                      showUploadList={false}
                      accept=".xls,.xlsx"
                      onChange={(e) => this.uploadFile(e)}
                      action={Api.boundOrders.inBoundOrderUploadFile + '?createPerson=' + employee.name + '&personId=' + employee.id}>
                <Button type="primary">
                  <Icon type="upload"/> 导入
                </Button>

            </Upload>
            <span className="downStyle lh32" onClick={() => this.dowTemplate()}>模板下载</span><span className="lh32">请您按照模板中的要求填写相关信息</span>
        </Modal>
      </div>
    )
  }

  changeTab(e) {
    this.getStoreList(e);
    this.getTableList(e);
    this.setState({
      pageGlobalId: e
    });
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
    this.getAllTransitUnit();
  }

  async getAllTransitUnit() {
    const { code, data } = await GoodsCenterService.boundOrders.getAllTransitUnit({
      pageSize: 9999
    });
    const arr = [];
    if (code !== SUCCESS_CODE) {
      return;
    }
    data.list.forEach((item) => {
      arr.push({
        label: item.name,
        value: item.id
      })
    })
    if (code !== SUCCESS_CODE)
      return;
    this.setState({
      transitUnitList: arr
    })
  }

  async getTableList(id) {
    const { storeList, pageGlobalId } = this.state;
    const { setCommon, pageSize, pageNum } = this.props.store;
    const searchData = this.searchForm.getFormData();
    const depotObj = searchList(storeList, 'value', searchData.SingalNum);
    const params = {
      type: 1, // 1为入库
      companyOrStore: id? id: pageGlobalId, // 0为公司仓
      pageSize,
      pageNum,
      orderNumber: searchData.SingalNum,
      createDepotId: searchData.wareHouse,
      createDepotName: depotObj.label,
      typeId: searchData.class,
      approvalStatus: searchData.approvalStatus,
      beginTime: searchData.createTime? moment(searchData.createTime[0]).format('YYYY-MM-DD'): null,
      overTime: searchData.createTime? moment(searchData.createTime[1]).format('YYYY-MM-DD'): null,
    }
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    setCommon('tableLoading', true);
    const { data, code } = await GoodsCenterService.boundOrders.ordersList(params);
    if (code !== SUCCESS_CODE) {
      return
    }
    data.list.forEach((item, index) =>{
      item.serialNum = index + 1;
      item.key = index;
      if (item.approvalStatus === 1) {
        item.status = '审批中';
        item.approvalText = '审批'; // button的文字
        item.showSubmitText = false;
      } else if (item.approvalStatus === 2) {
        item.status = '通过';
        item.approvalText = '反审批';
        item.showSubmitText = false;
      } else if (item.approvalStatus === 3) {
        item.status = '驳回';
        item.showSubmitText = true;
      } else if (item.approvalStatus === 0) {
        item.status = '待提交';
        item.showSubmitText = true;
      }
      item.orderType = getTypeFont(item.typeId);
      if (item.createTime) {
        item.createTime = moment(item.createTime).format("YYYY-MM-DD HH:mm:ss");
      }
    });
    setCommon('total', data.total);
    setCommon('tableLoading', false);

    this.setState({
      tableDataList: data.list
    })
  }

  async getTypeList() {
    const { data, code } = await GoodsCenterService.boundOrders.getTypeList({
      type: 1
    });
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.forEach((item) => {
      arr.push({
        value: item.typeId,
        label: item.typeName
      })
    });
    searchData.forEach((item) => {
      if (item.dataIndex === 'class') {
         item.options = arr;
      }
    });
    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'inBoundType') {
        item.options = arr;
     }
    });
    this.setState({
      typeList: arr
    });
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
        companyId: item.belongCompanyId,
        companyName: item.companyOrStoreName
      });
    });
    modalSearchData.forEach((item) => {
      if (item.dataIndex === 'store') {
        item.options = arr;
     }
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

  async getGoodsListByCompany(id) {
    const params = {
      goodsGenre: 1,
      companyId: id
    }
    const { code, data } = await GoodsCenterService.boundOrders.goodsListAll(params);
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
          });
          k3NoList.push({
            hrNo: item.hrNo,
            value: item.hrNo,
            label: item.hrNo,
            priceUnitName: item.priceUnitName,
            priceUnitId: item.priceUnitId
          })

        });
      })
      this.setState({
        goodsList: arr,
        goodsCodeOptions: k3NoList
      });
    }
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

  handleOk() {
    const bool = this.modalSearchFormEl.validateFormValues();
    if (bool)
      return;
    this.sendSubmit();
  }
  async sendSubmit() {
    const rowData = {key: 0, goodsCode: '', goodsName: '', size: '', unit: '', shelfNum: '', num: '', batch: '', time: '', remark: ''};
    const { storeList, transitUnitList } = this.state;
    const { inBoundType, ownStore, remark, store, date } = this.modalSearchFormEl.getFormData();
    const dealingsUnitObj = {};
    if (ownStore) {
      dealingsUnitObj.label = searchList(transitUnitList, 'value', ownStore).label;
    }
    const colData = this.state.data;
   
    const depotObj = searchList(storeList, 'value', store);
    const list = [];
    const { id, name } = getLoginInfo().employee;
    colData.forEach((item) => {
      list.push({
        goodsCode: item.goodsCode,
        goodsName: item.goodsName,
        spec: item.size,
        unit: item.unit,
        typeId: inBoundType,
        type: 1,
        depotId: depotObj.value,
        depotName: depotObj.label,
        inputOutputNum: item.num,
        shelvesId: item.shelfNum,
        batchNumber: item.batch,
        productionTime: item.time,
        remark: item.remark
      })
    });
    if (colData.length > 1 || colData[0].goodsName) {
      const { code, msg } = await GoodsCenterService.componyStore.addInAndOutData({
        createPerson: name,
        personId: id,
        dealingsUnit: dealingsUnitObj.label,
        dealingsUnitId: ownStore,
        type: 1,
        typeId: inBoundType,
        remark,
        inDate: date? moment(date).format('YYYY-MM-DD'): '',
        createDepotId: depotObj.value,
        createDepotName: depotObj.label,
        list
      });
      if (code !== SUCCESS_CODE) {
        helper.W(msg)
      } else {
        helper.S('新增成功');
        this.setState({
          visible: false,
          data: [rowData]
        })
        this.getTableList();
      }

    } else {
      helper.W('请先添加商品');
    }
  }

  uploadFile(e) {
    if (e.file.response) {
      const { code, msg } = e.file.response;
      if (code !== SUCCESS_CODE) {
        helper.W(msg);
      } else {
        helper.S('上传成功')
      }
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

  handleCancel() {
    this.setState({
      visible: false
    })
  }

  addOrders() {
   
    const { setCommon } = this.props.store;
    setCommon('submitType', true);
    this.setState({
      visible: true,
    }, () => {
      setTimeout(() => {
        this.modalSearchFormEl.initFormData({
          createPerson: getLoginInfo().employee.name
        })
      })
    });
  }

  dowTemplate() {
    window.location.replace(Api.boundOrders.getInBoundOrdersTemplate);
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {
           setAction(PATH, 'viewDetail')? [
            <Button type="primary" size="small" onClick={() => this.viewDetail(record)}>明细</Button>,
           ]: null
        }
        {
          setAction(PATH, 'submit') && record.personId === getLoginInfo().employee.id && record.source === 1 && (record.approvalStatus === 0 || record.approvalStatus === 3) ? 
          [ // 当前登录的人为创建人 并且来源为手动生成才能提交
            <Divider type="vertical" />,
            <Button type="danger" onClick={() => this.handleSubmit(record)} ghost size="small">提交</Button>
          ]: null
        }
        {
          setAction(PATH, 'approval') && record.nowApprovalId === getLoginInfo().employee.id && (record.approvalStatus === 1 || record.approvalStatus === 2)? [
            <Divider type="vertical" />,
            <Button type="danger" ghost size="small" onClick={() => this.approval(record)}>{record.approvalText}</Button>
          ]: null
        }

      </span>
    )
  }

  handleSubmit(item) {
    this.props.history.push({ pathname: '/ResubmitApproval', state: { orderNumber: item.orderNumber, signal: true} });
  }

  viewDetail(item) {
    this.props.history.push({ pathname: '/ApprovalDetail', state: { orderNumber: item.orderNumber, signal: true, isComingFromDetail: true} });
  }

  async reverseApproval(item) {
    const { employee } = getLoginInfo();
    const { code, msg } = await GoodsCenterService.boundOrders.reverseApproval({
      orderNumber: item.orderNumber,
      type: item.type,
      userId: employee.id,
      userName: employee.name
    });
    if (code !== SUCCESS_CODE) {
      helper.W(msg)
      return;
    }
    helper.S('修改成功');
    this.getTableList();
  }

  approval(item) { // 审批反审批方法
    if (item.approvalStatus === 2) { // 审批通过 显示反审批 需要调接口验证
      this.reverseApproval(item);
    } else {
      this.props.history.push({ pathname: '/ApprovalDetail', state: { orderNumber: item.orderNumber, signal: true} });
    }

  }
}

export default InboundOrders;
