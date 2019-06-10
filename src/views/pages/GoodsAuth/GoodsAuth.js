import React from 'react'
import '../../../assets/style/common/pageItem.less'
import { Bread, SearchForm } from '../../../components'
import {getLoginInfo, searchList, setAction} from "../../../utils/public";
import { Button, Modal, Table, Pagination, Divider, Popconfirm } from 'antd'
import { inject, observer } from 'mobx-react'
import Columns from './Columns'
import BaseForm from './BaseForm'
import AuthStore from './AuthStore'
import AuthGoods from './AuthGoods'
import AuthCombo from './AuthCombo'
import GoodsCenterService from "../../../service/GoodsCenterService";
import helper from "../../../utils/helper";
import {AREA_DEPT_TYPE, SUCCESS_CODE} from "../../../conf";
import BaseCenterService from '../../../service/BaseCenterService';
const PATH = 'goodsAuth';

@inject('store')
@observer
class GoodsAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyList: [],   // 公司数据
      employeeDeptList: [],   // 片区数据
      showAuthStoreModal: false,   // 授权门店弹框显示隐藏
      showAuthGoodsModal: false,   // 授权货品弹框显示隐藏
      showAuthComboModal: false,   // 授权套餐弹框显示隐藏
      authStoreLoading: false,   // 门店授权确定按钮loading
      authGoodsLoading: false,   // 货品授权确定按钮loading
      authComboLoading: false,   // 套餐授权确定按钮loading
      authorizedStoreData: [],   // 已选中的门店id
      authStoreId: null,   // 授权门店当前点击行id
      rowData: {},   //    点击授权货品该行数据
      authStoreRowData: {},   // 点击授权门店该行数据
      authComboRowData: {},   // 点击授权套餐该行数据
      goodsCategoriesData: [],   // 货品分类数据
      companyId: null,   // 授权计划关联的公司Id
    }
  };

  setOptions = async () => {
    const { companyIds } = getLoginInfo();
    const { data: companyData } = await BaseCenterService.Company.listAll({ companyIds });
    const { data: areaData } = await BaseCenterService.Department.listAll({ companyIds, departmentType: AREA_DEPT_TYPE });
    const { data: goodsTypeData } = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 1, pageSize: 99999 });

    this.setState({
      goodsCategoriesData: goodsTypeData ? goodsTypeData.list : [],   // 货品分类
      companyList: companyData ? companyData : [],
      employeeDeptList: areaData ? areaData.list : [],
    })
  };

  getData = async () => {
    const { searchData, pageNum, pageSize, setCommon } = this.props.store;
    const { companyIds } = getLoginInfo();
    setCommon('tableLoading', true);
    const { code, msg, data } = await GoodsCenterService.GoodsAuth.selectAll({ ...searchData, pageNum, pageSize, companyIds });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }

    const { list, page } = data;
    setCommon('pageNum', page.pageNum);
    setCommon('pageSize', page.pageSize);
    setCommon('total', page.total);
    setCommon('tableData', list);
  };

  pageChange = (type=0, num) => {
    const { setCommon } = this.props.store;
    if (type) {
      setCommon('pageNum', 1);
      setCommon('pageSize', num);
    } else {
      setCommon('pageNum', num);
    }
    this.getData();
  };

  onSearchReset = (type=1, searchData) => {
    const { setCommon } = this.props.store;
    if (type) {
      setCommon('searchData', searchData);
    } else {
      setCommon('searchData', {});
    }
    this.getData();
  };

  showModal = (submitType, formData, index, e) => {
    e.stopPropagation();

    const { setCommon } = this.props.store;

    setCommon('submitType', submitType);

    if (formData) {
      setCommon('tableRowData', formData);
    }

    if (!submitType) {
      setCommon('editIndex', index);
    }

    setCommon('modalVisible', true);
  };

  handleSubmit = () => {
    this.BaseForm.validateFields((err, formData) => {
      if (err) {
        return;
      }
      this.addUpdatePack(formData);
    })
  };

  addUpdatePack = async (formData) => {
    const { companyList } = this.state;
    const { setCommon, submitType, tableRowData } = this.props.store;

    setCommon('loading', true);

    formData.companyName = searchList(companyList, 'id', formData.companyId).name;
    if(!submitType) {
      formData.id = tableRowData.id;
    }
    const { code, msg } = await GoodsCenterService.GoodsAuth[submitType ? 'addOne' : 'updateOne'](formData);
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    setCommon('modalVisible', false);
    setCommon('tableRowData', {});
    helper.S();
    this.getData();
  };

  handleDelete = async (formData) => {
    const { code, msg } = await GoodsCenterService.GoodsAuth.updateOne({ id: formData.id, hidden: 0 });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
  };

  handleAuthStore = async (record) => {   // 点击授权门店
    const { pageNum } = this.props.store;
    const storeArrId = [];
    const { data } = await GoodsCenterService.GoodsAuth.authStoreGoods({ type: 1, id: record.id, pageSize: 999999, pageNum, });
    if(data) {
      const storeArr = data.split(',');
      storeArr.forEach((item, index) => storeArrId[index] = item * 1)
    }

    this.setState({
      authorizedStoreData: storeArrId.length ? [...new Set(storeArrId)] : [],
      authStoreId: record.id,
      authStoreRowData: record,
      showAuthStoreModal: true
    })
  };

  setAuthStoreIds(storeData) {   // 子组件穿梭框数据变化得到穿梭框右边框中数据
    if(storeData) {
      storeData.forEach((item, index) => storeData[index] = item * 1)
    };
    this.setState({
      authorizedStoreData: [...storeData]
    })
  };

  handleAuthGoods = (record) => {   // 点击授权货品
    if(!record.storeIds) {
      helper.W('请先授权门店！');
      return;
    }
    this.setState({
      rowData: record,
      companyId: record.companyId,
      showAuthGoodsModal: true
    })
  };

  setAuthStore = async () => {   // 授权门店弹框关闭
    const { authorizedStoreData, authStoreId } = this.state;
    this.setState({authStoreLoading: true});
    const { code, msg } = await GoodsCenterService.GoodsAuth.updateOne({storeIds: authorizedStoreData.join(','), isUpdateGoods: 0, id: authStoreId});
    this.setState({authStoreLoading: false});
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
    this.setState({
      showAuthStoreModal: false
    })
  };

  setAuthGoods = async () => {   // 授权货品提交
    const { rowData } = this.state;
    const authGoodsData = this.setAuthGoodsData.wrappedInstance.getDataList();

    const goodsArr = [];
    const goodsIntegralArr = [];
    authGoodsData.forEach(itemOne => {
      itemOne.goodsTypeList.forEach(itemThree => {
        if(itemThree.id === 1) {
          goodsIntegralArr.push(itemThree.id)
          itemOne.goodsSkuList.forEach(itemTow => {
            if(itemTow.goodsStorePrice === null) {
              goodsArr.push(itemTow.name);
            }
          })
        }
      })
    })
    if(goodsArr.length && goodsIntegralArr.indexOf(1) !== -1) {
      helper.W(`${goodsArr.join(',')}等货品未设置价格或积分，请设置`);
      return;
    };
    this.setState({authGoodsLoading: true});
    const { code, msg } = await GoodsCenterService.GoodsAuth.updateOne({goodsList: authGoodsData, 
                                                                        isUpdateGoods: 1, 
                                                                        id: rowData.id, 
                                                                        companyId: rowData.companyId, 
                                                                        goodsGenre: 1});
    this.setState({authGoodsLoading: false});
    if(code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.setState({
      showAuthGoodsModal: false
    })
  };

  handleAuthCombo = (record) => {   // 点击套餐授权
    if(!record.storeIds) {
      helper.W('请先授权门店！');
      return;
    }

    this.setState({
      authComboRowData: record,
      showAuthComboModal: true
    })
  };

  setAuthCombo = async () => {   // 套餐授权提交
    const { authComboRowData } = this.state;
    const authComboData = this.setAuthComboData.wrappedInstance.state.tableData;
    const arr = [];

    authComboData.forEach(item => {
      if(!item.goodsStorePrice) {
        arr.push(item.id);
      }
    });
    if(!arr.length) {
      this.setState({authComboLoading: true});
      const { code, msg } = await GoodsCenterService.GoodsAuth.updateOne({ goodsComboList: authComboData, 
                                                                            isUpdateGoods: 1, 
                                                                            id: authComboRowData.id, 
                                                                            companyId: authComboRowData.companyId, 
                                                                            goodsGenre: 2});
      this.setState({authComboLoading: false});
      if(code !== SUCCESS_CODE) {
        helper.W(msg);
        return;
      }
      helper.S();
      this.setState({showAuthComboModal: false })
    } else {
      helper.W('请设置套餐价格或积分！');
    }
  };

  renderAction = (text, record, index) => {
    return(
      <div className="page-wrapper-table-action">
        {setAction(PATH, 'update') ? <Button size="small" type="primary" onClick={this.showModal.bind(this, false, record, index)}>编辑</Button> : null}
        {setAction(PATH, 'update') && setAction(PATH, 'authStore') ? <Divider type="vertical" /> : null}
        {setAction(PATH, 'authStore') ? <Button size="small" type="danger" ghost onClick={() => this.handleAuthStore(record)}>门店授权</Button> : null}
        {setAction(PATH, 'authStore') && setAction(PATH, 'authStore') ? <Divider type="vertical" /> : null}
        {setAction(PATH, 'authGoods') ? <Button size="small" type="danger" ghost onClick={() => this.handleAuthGoods(record)}>货品授权</Button> : null}
        {setAction(PATH, 'authGoods') && setAction(PATH, 'authCombo') ? <Divider type="vertical" /> : null}
        {setAction(PATH, 'authCombo') ? <Button size="small" type="danger" ghost onClick={() => this.handleAuthCombo(record)}>套餐授权</Button> : null}
        {
          !setAction(PATH, 'delete') ? null :
            [
              <Divider type="vertical" />,
              <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.handleDelete(record)}>
                <Button size="small" type="danger" ghost>删除</Button>
              </Popconfirm>,
            ]
        }
      </div>
    )
  };

  componentDidMount() {
    this.getData();
    this.setOptions();
  }

  render() {
    const { tableData, pageNum, pageSize, total, tableLoading, setCommon, modalVisible, submitType, loading } = this.props.store;
    const { companyList, 
            employeeDeptList, 
            showAuthStoreModal, 
            showAuthGoodsModal, 
            showAuthComboModal, 
            authStoreLoading,
            authGoodsLoading,
            authComboLoading,
            authorizedStoreData, 
            rowData, 
            companyId, 
            authComboRowData,
            authStoreRowData,
            goodsCategoriesData } = this.state;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'serialNumber') {
          item.render = (text, record, index) => `${index+1}`;
        } else if (dataIndex === 'companyId') {
          item.options = companyList;
          item.defaultProps = { label: 'name', value: 'id' };
          item.render = (text) =>  <span>{ searchList(companyList, 'id', text).name || '' }</span>;
        } else if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
        }
        arr.push(item)
      });

      return arr;
    };
    return(
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={[`${searchList(getLoginInfo().modules || [], 'path', PATH).name || ''}`]} />
          <div className="page-wrapper-bread-txt">
            {searchList(getLoginInfo().modules || [], 'path', PATH).subName || ''}
          </div>
        </div>

        <div className="page-wrapper-search">
          <SearchForm formList={columns()} showSearch={setAction(PATH, 'search')}
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
            {setAction(PATH, 'add') ? <Button type="primary" onClick={this.showModal.bind(this, true, null, null)}>新建授权</Button> : null}
          </SearchForm>
        </div>

        <div className="page-wrapper-content not-scrollY" ref={el => this.tableRef = el}>
          <Table size="small"
                 scroll={{ y: this.tableRef ? `${this.tableRef.clientHeight-40}px` : '100%' }}
                 dataSource={tableData}
                 rowKey={record => record.id}
                 loading={tableLoading}
                 columns={columns()}
                 bordered
                 pagination={false} />
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

        <Modal title={`${submitType ? '新增' : '编辑'}货品授权`}
               confirmLoading={loading}
               visible={modalVisible}
               destroyOnClose
               onOk={this.handleSubmit}
               onCancel={() => {
                 setCommon('tableRowData', {});
                 setCommon('modalVisible', false)
               }}>
          <BaseForm companyList={companyList} submitType={submitType} ref={el => this.BaseForm = el} />
        </Modal>

        <Modal title="授权门店"
               width="1000px"
               confirmLoading={authStoreLoading}
               visible={showAuthStoreModal}
               destroyOnClose
               onOk={this.setAuthStore}
               onCancel={() => this.setState({showAuthStoreModal: false})}>
          <AuthStore employeeDeptList={employeeDeptList} 
                     companyList={companyList} 
                     storeRow={authStoreRowData}
                     authorizedStoreData={authorizedStoreData} 
                     setAuthStoreIds={this.setAuthStoreIds.bind(this)} />
        </Modal>

        <Modal title="授权货品"
               width="1000"
               confirmLoading={authGoodsLoading}
               visible={showAuthGoodsModal}
               destroyOnClose
               onOk={this.setAuthGoods}
               onCancel={() => this.setState({showAuthGoodsModal: false})}>
          <AuthGoods rowData={rowData} 
                     companyId={companyId} 
                     goodsCategoriesData={goodsCategoriesData} 
                     ref={el => this.setAuthGoodsData = el} />
        </Modal>

        <Modal title="授权套餐"
               width="1000"
               confirmLoading={authComboLoading}
               visible={showAuthComboModal}
               destroyOnClose
               onOk={this.setAuthCombo}
               onCancel={() => this.setState({showAuthComboModal: false})}>
          <AuthCombo authComboRowData={authComboRowData} 
                     companyId={companyId} ref={el => this.setAuthComboData = el} />
        </Modal>
      </div>
    )
  }
}

export default GoodsAuth;
