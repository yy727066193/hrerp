import React from 'react'
import '../../../assets/style/common/pageItem.less'
import { inject, observer } from 'mobx-react'
import { Bread, SearchForm } from '../../../components'
import {getLoginInfo, searchList, setAction} from "../../../utils/public";
import { Button, Table, Pagination, Drawer, Divider, Popconfirm, Modal, Popover } from 'antd'
import Columns from './Columns'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import MealListBaseForm from './MealListBaseForm'
import helper from "../../../utils/helper";
import DetailInfo from './DetailInfo'
import BaseCenterService from "../../../service/BaseCenterService";
import SetStatusInfo from "./SetStatusInfo";
import PopoverTableUp from './PopoverTableUp';

const stepList = [{title: '基础信息'}, {title: '套餐明细'}, {title: '完成'}];

const PATH = 'mealList';

@inject('store')
@observer
class MealList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      typeList: [],
      unitList: [],
      goodsKeyList: [],
      goodsTypeList: [],
      tableDetailData: [],
      companyList: [],
      putModalVisible: false,
      intModalVisible: false
    };
  }

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
      if (searchData.categoriesId && searchData.categoriesId.length !== 0) {
        searchData.categoriesId = searchData.categoriesId[searchData.categoriesId.length - 1]
      }
      setCommon('searchData', searchData);
    } else {
      setCommon('searchData', {});
    }

    this.getData();
  };

  getData = async () => {
    const { setCommon, pageNum, pageSize, searchData } = this.props.store;
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.MealList.selectAll({ pageNum, pageSize, ...searchData });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      return
    }
    if (data) {
      const { list, page } = data;
      setCommon('tableData', list);
      setCommon('total', page.total);
      setCommon('pageNum', page.pageNum);
      setCommon('pageSize', page.pageSize);
    }
  };

  getDetail = async (record, index) => {
    const { setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.MealList.detailOne({ id: record.id, hrNo: record.hrNo });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      return;
    }
    if (data) {
      this.setState({ tableDetailData: data });
      setCommon('tableRowData', record);
      setCommon('otherModalVisible', true)
    }
  };

  setOptions = async () => {
    const { companyIds } = getLoginInfo();
    const { data: companyList } = await BaseCenterService.Company.listAll({ companyIds });
    const { data: typeData } = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 2, pageSize: 999999 });
    const { data: goodsTypeData } = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 1, pageSize: 999999 });
    const { data: unitData } = await GoodsCenterService.GoodsUnit.selectAll({ pageNum: 1, pageSize: 9999999 });
    const { data: goodsKeyData } = await GoodsCenterService.GoodsLabel.selectAll({ pageNum: 1, pageSize: 999999 });
    if (typeData) {
      this.setState({ typeList: typeData.list })
    }
    if (unitData) {
      this.setState({ unitList: unitData.list })
    }
    if (goodsKeyData) {
      this.setState({ goodsKeyList: goodsKeyData.list })
    }
    if (goodsTypeData) {
      this.setState({ goodsTypeList: goodsTypeData.list })
    }
    if (companyList) {
      this.setState({ companyList })
    }
  };

  handleAddUpdateOne = async (formData) => { // 新增或 编辑
    const { submitType, setCommon } = this.props.store;
    setCommon('loading', true);
    const { code, msg } = await GoodsCenterService.MealList[submitType ? 'addOne' : 'updateOne'](formData);
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    setCommon('modalVisible', false);
    setCommon('tableRowData', {});
    this.getData()
  };

  showBaseModal = (type=0, record, index) => { // 0 编辑 1新增
    const { setCommon } = this.props.store;
    if (type) {
      setCommon('submitType', true)
    } else {
      setCommon('tableRowData', record);
      setCommon('editIndex', index);
      setCommon('submitType', false)
    }
    setCommon('modalVisible', true)
  };

  onGoodsNumChange = (val, index) => { // 套餐填写数量变化
    let tableDetailData = JSON.parse(JSON.stringify(this.state.tableDetailData));
    tableDetailData[index].goodsNum = val;
    this.setState({ tableDetailData })
  };

  updateGoodsList = async () => { // 编辑套餐明细
    const { tableDetailData } = this.state;
    const arr = [];

    tableDetailData.forEach(item => {
      if(!item.goodsNum || item.goodsNum * 1 === 0) {
        arr.push(item.id)
      }
    })
    if(!arr.length) {
      const { setCommon, tableRowData } = this.props.store;
      setCommon('loading', true);
      const { code, msg } = await GoodsCenterService.MealList.updateGoodsList({hrNo: tableRowData.hrNo, goodsBaseVoList: this.state.tableDetailData});
      setCommon('loading', false);
      if (code !== SUCCESS_CODE) {
        helper.W(msg);
        return;
      }
      helper.S();
      setCommon('otherModalVisible', false)
    } else {
      helper.W('请设置货品数量, 且不能为零')
    }
  };

  formatCompanyStatusData = (list, key='parentPutOn') => { // 格式化公司上下架数据 或赠送积分数据
    let companyList = this.state.companyList;
    let companyIdArr = list.map(item => item.companyId);
    companyList.forEach(item => {
      item.companyId = item.id;
      item[key] = companyIdArr.indexOf(item.id) === - 1 ? 0 : (searchList(list, 'companyId', item.id)[key] || 0);
    });
    return companyList;
  };

  showStatusModal = async (record, index, changeKey='parentPutOn') => { // 上下架状态 和 赠送积分状态
    const { setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.MealList.selectStatus({ hrNo: record.hrNo, pageSize: 9999999 });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      return;
    }
    if (data) {
      setCommon('tableRowData', record);
      setCommon('editIndex', index);
      changeKey === 'parentPutOn' ? this.setState({ companyList: this.formatCompanyStatusData(data.list, changeKey), putModalVisible: true }) :
        this.setState({ companyList: this.formatCompanyStatusData(data.list, changeKey), intModalVisible: true });
    }
  };

  changeCompanyStatus = async (type = 0) => { // type 0 修改上下架状态 1 修改送积分状态
    const { setCommon, tableRowData } = this.props.store;
    const companyList = this.state.companyList;
    setCommon('loading', true);
    const list = [];
    companyList.forEach(item => !type ? list.push({ companyId: item.id, parentPutOn: item.parentPutOn || 0 }) : list.push({ companyId: item.id, exchangeIntegral: item.exchangeIntegral || 0 }));
    const { code, msg } = await GoodsCenterService.MealList.updateStatus({ hrNo: tableRowData.hrNo, name: tableRowData.name, list, goodsGenre: 2 });
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    setCommon('tableRowData', {});
    !type ? this.setState({ putModalVisible: false }) : this.setState({ intModalVisible: false })
  };

  deleteItemOne = async (record) => {
    const { setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, msg } = await GoodsCenterService.MealList.updateOne({ hrNo: record.hrNo, hidden: 0, isUpdate: record.isUpdate });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData()
  };

  renderAction = (text, record, index) => {
    return(
      <div className="page-wrapper-table-action">
        {setAction(PATH, 'update') ? <Button size="small" type="primary" onClick={() => this.showBaseModal(0, record, index)}>编辑</Button> : null}
        {setAction(PATH, 'setDetail') ? [
          <Divider type="vertical" />,
          <Button size="small" ghost type="primary" onClick={() => this.getDetail(record, index)}>套餐明细</Button>
        ] : null}
        {/* {setAction(PATH, 'startStop') ? [
          <Divider type="vertical" />,
          <Button size="small" ghost type="primary" onClick={() => this.showStatusModal(record, index)}>上下架</Button>
        ]: null} */}
        <Popover trigger="click"
                 title={"货品名称：" + record.name}
                 placement="left"
                 content={<PopoverTableUp companyData={this.state.companyList} rowData={record} />}>
          {setAction(PATH, 'startStop') ? [
            <Divider type="vertical" />,
            <Button size="small" type="danger" ghost>上下架</Button>
          ] : null}
        </Popover>
        {setAction(PATH, 'giveInt') ? [
          <Divider type="vertical" />,
          <Button size="small" type="primary" ghost onClick={() => this.showStatusModal(record, index, 'exchangeIntegral')}>设置购买赠送积分</Button>
        ]: null}
        {setAction(PATH, 'delete') ? [
          <Divider type="vertical" />,
          <Popconfirm title="删除该套餐，则所有授权门店均删除，确认删除?" placement="left" onConfirm={() => this.deleteItemOne(record)}>
            <Button size="small" ghost type="danger">删除</Button>
          </Popconfirm>
        ]: null}
      </div>
    )
  };

  componentDidMount() {
    this.setOptions();
    this.getData();
  }

  render() {
    const { setCommon, pageNum, pageSize, tableData, tableLoading, total, submitType, modalVisible, otherModalVisible, loading, tableRowData } = this.props.store;
    const { typeList, unitList, goodsKeyList, goodsTypeList, tableDetailData, companyList, intModalVisible } = this.state;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } =item;
        if (dataIndex === 'categoriesId') {
          item.render = (text, record) => (record.goodsCategories && record.goodsCategories.name) ? record.goodsCategories.name : '';
          item.options = typeList;
          item.defaultProps = { label: 'name', value: 'id', children: 'children' }
        } else if (dataIndex === '_actions') {
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
          <SearchForm showSearch={setAction(PATH, 'search')}
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}
                      formList={columns()}>
            {setAction(PATH, 'add') ? <Button type="primary" onClick={() => this.showBaseModal(1)}>新增套餐</Button> : null}
          </SearchForm>
        </div>

        <div className="page-wrapper-content not-scrollY" ref={el => this.tableRef = el}>
          <Table size="small"
                 scroll={{ y: this.tableRef ? `${this.tableRef.clientHeight-40}px` : '100%' }}
                 dataSource={tableData}
                 rowKey={record => record.hrNo}
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

        <Drawer title={`${submitType ? '新增' : '编辑'}套餐`}
                destroyOnClose
                width="800px"
                placement="right"
                onClose={() => {
                  setCommon('modalVisible', false);
                  setCommon('tableRowData', {})
                }}
                visible={modalVisible}>
          <MealListBaseForm stepList={stepList}
                            typeList={typeList}
                            onSubmit={(formData) => this.handleAddUpdateOne(formData)}
                            goodsKeyList={goodsKeyList}
                            unitList={unitList} />
        </Drawer>

        <Drawer title={`${tableRowData.name}-套餐明细`}
                destroyOnClose
                width={`${document.documentElement.clientWidth - 200}px`}
                placement="right"
                onClose={() => {
                  setCommon('otherModalVisible', false);
                  setCommon('tableRowData', {})
                }}
                visible={otherModalVisible}>
          <DetailInfo stepList={stepList}
                      removeGoodsOne={(index) => {
                        this.state.tableDetailData.splice(index, 1);
                        this.setState({ tableDetailData: this.state.tableDetailData });
                      }}
                      updateGoodsList={() => this.updateGoodsList()}
                      onGoodsNumChange={(val, index) => this.onGoodsNumChange(val, index)}
                      onAddGoodsList={(tableDetailData) => {
                        this.setState({ tableDetailData: [] });
                        this.setState({ tableDetailData })
                      }}
                      tableDetailData={tableDetailData}
                      goodsTypeList={goodsTypeList} />
        </Drawer>

        {/* <Modal title={`${tableRowData.name}-上下架状态`}
               destroyOnClose
               confirmLoading={loading}
               onOk={() => this.changeCompanyStatus()}
               visible={putModalVisible}
               onCancel={() => {
                 this.setState({ putModalVisible: false });
                 setCommon('tableRowData', {})
               }}>
          <SetStatusInfo companyList={companyList} onRadioChange={(val, index) => {
            let companyList = JSON.parse(JSON.stringify(this.state.companyList));
            companyList[index].parentPutOn = val;
            this.setState({ companyList })
          }} />
        </Modal> */}

        <Modal title={`${tableRowData.name}-设置赠送积分`}
               destroyOnClose
               confirmLoading={loading}
               onOk={() => this.changeCompanyStatus(1)}
               visible={intModalVisible}
               onCancel={() => {
                 this.setState({ intModalVisible: false });
                 setCommon('tableRowData', {})
               }}>
          <SetStatusInfo formChangeKey="exchangeIntegral"
                         trueText="送积分"
                         falseText="不赠送积分"
                         companyList={companyList} onRadioChange={(val, index) => {
            let companyList = JSON.parse(JSON.stringify(this.state.companyList));
            companyList[index].exchangeIntegral = val;
            this.setState({ companyList })
          }} />
        </Modal>
      </div>
    )
  }
}

export default MealList;
