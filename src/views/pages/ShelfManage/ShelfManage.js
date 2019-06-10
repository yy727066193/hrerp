import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm}  from './../../../components/index';
import { Table, Modal, Button, Pagination } from 'antd';
import Columns from './columnConfig';
import {setAction, searchList, getLoginInfo} from "../../../utils/public";
import AdjustGoods from './adjustGoods';
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from '../../../utils/helper';
import { validFloor, validSet, validLetter } from "../../../utils/validate";

const PATH = 'ShelfManage';

const searchData = [
  {title: '仓库', dataIndex: 'store', formType: 'select', bindChange: true},
  {title: '货架号', dataIndex: 'shelfNum', formType: 'select'},
  {title: '存放方式', dataIndex: 'saveWay', formType: 'select', options: window.globalConfig.storeType},
  {title: '区号', dataIndex: 'areaName', formType: 'input'},
  {title: '层号', dataIndex: 'floorName', formType: 'input'},
  {title: '位号', dataIndex: 'siteName', formType: 'input'},
];

const modalSearchData = [
  {title: '所属仓库', dataIndex: 'depotId', formType: 'select'},
  {title: '存放方式', dataIndex: 'depositType', formType: 'select', required: true, options: window.globalConfig.storeType},
  {title: '区号', dataIndex: 'areaCode', formType: 'input', required: true, config: {
    rules: [
      { required: true, message: '请输入大写英文字母' },
      { validator: validLetter }
    ]
  }},
  {title: '层号', dataIndex: 'layerNum', formType: 'number', config: {
    rules: [
      { required: false, message: '请输入1-9的整数' },
      { validator: validFloor }
    ]
  }},
  {title: '位号', dataIndex: 'positionNum', formType: 'number', required: true, config: {
    rules: [
      { required: true, message: '请输入1-99的整数' },
      { validator: validSet }
    ]
  }},
  {title: '备注', dataIndex: 'remark', formType: 'input'},
]

@inject('store')
@observer
class ShelfManage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tableDataList: [],
      visible: false,
      dataSource: [],
      leftContentList: [],
      targetKeys: [],
      storeList: [],
      goodsVisible: false,
      options: [],
      shelfList: []
    }
  }
  render() {
    const { tableDataList, visible, leftContentList, targetKeys, goodsVisible, options } = this.state;
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
            onSelect={(val, option) => this.onSelect(val, option)}
            showSearchCount={3}
            >
            {
              setAction(PATH, 'add')? <Button type="primary" onClick={() => this.addShelf(true)}>新增货架</Button>: null
            }

          </SearchForm>
        </div>
        <div className="page-wrapper-content" >
          <Table
            // scroll={{ y: this.tableRef ? `${this.tableRef.clientHeight}px` : '100%' }}
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
        <Modal title={`${submitType ? '新增' : '编辑'}货架`}
            visible={visible}
            onOk={this.handleOk.bind(this)}
            onCancel={this.handleCancel.bind(this)}>
          <SearchForm
            formList={modalSearchData}
            ref={el => this.modalSearchForm = el}
            formItemSpan={24}
            >
          </SearchForm>
        </Modal>
        <AdjustGoods leftContentList={leftContentList} targetKeys={targetKeys} visible={goodsVisible} options={options} handleChange={(keyList) => this.handleChange(keyList)} clickOk={(keyList) => this.clickGoodsOk(keyList)} clickCancel={() => this.clickGoodsCancel()}></AdjustGoods>
      </div>
    )
  }

  componentDidMount() {
    
    if (!this.props.history.location.state) {
      this.getTableList();
    }
    this.getStoreList();
  }

  async getTableList() {
    const searchData = this.searchForm.getFormData();
    const { setCommon, pageSize, pageNum } = this.props.store;
    const params = {
      pageSize,
      pageNum,
      depositType: searchData.saveWay,
      depotId: searchData.store,
      shelvesId: searchData.shelfNum,
      areaCode: searchData.areaName,
      layerNum: searchData.floorName,
      positionNum: searchData.siteName
    }
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    setCommon('tableLoading', true);
    const { data, code } = await GoodsCenterService.storeAndShelf.selectAllShelfList(params);
    if (code !== SUCCESS_CODE) {
      return
    }
    let index = 0;
    data.list.forEach((item) =>{
      index ++;
      item.serialNum = index;
      item.key = index;
      item.depositType ? item.storeType = '卡板' : item.storeType = '货架';
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
    searchData.forEach((item) => {
      if (item.dataIndex === 'store') {
        item.options = arr;
     }
    });
    modalSearchData.forEach((item) => {
      const { dataIndex } = item;
      if (dataIndex === 'depotId') {
        item.options = arr;
      }
    });

    this.setState({
      storeList: arr
    }, () => {
      if (this.props.history.location.state) {
        this.searchForm.initFormData({store: this.props.history.location.state.id});
        this.getTableList();
      }
    })

  }

  addShelf(submitType) {
    const { setCommon }  = this.props.store;
    setCommon('submitType', submitType);
    setCommon('shelfId', '');
    this.setState({
      visible: true
    });
    setTimeout(() => {
      modalSearchData.forEach((item) => {
        if (item.dataIndex === 'depotId') {
          item.disabled = false;
        }
      })
      this.modalSearchForm.initFormData({});
    }, 0)

  }

  handleOk() {
    this.addNewShelf();
  }

  onSelect(item, val) {
    this.getShelfList(val);
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
    searchData.forEach((item) => {
      if (item.dataIndex === 'shelfNum') {
        item.options = arr;
      }
    })
    this.setState({
      shelfList: arr
    });
  }

  async addNewShelf() {
    const { storeList } = this.state;
    const formData = this.modalSearchForm.getFormData();
    const bool = this.modalSearchForm.validateFormValues();
    formData.depotName = searchList(storeList, 'value', formData.depotId).label;
    const { submitType, shelfId } = this.props.store;
    if (shelfId) {
      formData.id = shelfId;
    }
    if (!bool) {
      const { code, msg } = await GoodsCenterService.storeAndShelf[submitType ? 'addNewShelf' : 'updateNewShelf'](formData);
      if (code !== SUCCESS_CODE) {
        helper.W(msg);
        return;
       }
      helper.S(submitType ? '添加成功': '修改成功');
      this.setState({
        visible: false
      });
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

  handleCancel() {
    this.setState({
      visible: false
    })
  }

  onSearchReset(bool) {
    if (bool) {
      this.getTableList();
    }
  }

  edit(item) {
    const { setCommon } = this.props.store;
    setCommon('submitType', false);
    setCommon('shelfId', item.id);
    this.setState({
      visible: true
    });
    setTimeout(() => {
      modalSearchData.forEach((item) => {
        if (item.dataIndex === 'depotId') {
          item.disabled = true;
        }
      })
      this.modalSearchForm.initFormData(item)
    }, 100)
  }

  adjustGoods(item) {
    const { setCommon } = this.props.store;
    setCommon('tableRowData', item);
    this.getShelfGoodsList(item);
  }

  async getShelfGoodsList(item) {
    const { code, data } = await GoodsCenterService.storeAndShelf.shelfGoodsList({
      depotId: item.depotId,
      shelvesId: item.shelvesId
    });
    if (code !== SUCCESS_CODE) return;
    this.setState({
      goodsVisible: true
    });
    
    if (data.notShelvedGoods) {
      const leftContentList = [];
      const targetKeys = [];
      data.shelvedGoods.forEach((item) => {
        item.isRight = true;
      })
      const list = data.notShelvedGoods.concat(data.shelvedGoods);
      list.forEach((item) => {
        leftContentList.push({
          title: item.goodsName,
          code: item.goodsCode,
          key: item.id
        })
        if (item.isRight) {
          targetKeys.push(item.id);
        }
      });
      this.setState({
        leftContentList,
        targetKeys,
        dataSource: data
      })
    }
    
  }

  handleChange(keyList) {
    this.setState({
      targetKeys: keyList
    })
  }

  clickGoodsOk(keyList) {
    const { dataSource } = this.state;
    const { tableRowData } = this.props.store;
    const rightList = [];
    if (dataSource.notShelvedGoods) {
      const list = dataSource.notShelvedGoods.concat(dataSource.shelvedGoods);
      list.forEach((item, index) => {
        keyList.forEach((keyItem) => {
          if (item.id === keyItem) {
            rightList.push(item);
          }
        });
      });
      const totalArr = [...list, ...rightList];
      const d = new Set(totalArr);
      const e = Array.from(d);
      const leftList = [...e.filter(_ => !list.includes(_)), ...e.filter(_ => !rightList.includes(_))];
      const notShelvedGoods = [];
      const shelvedGoods = [];
      leftList.forEach((item) => {
        notShelvedGoods.push({
          goodsCode: item.goodsCode,
          goodsName: item.goodsName,
          stock: item.stock
        })
      });
      rightList.forEach((item) => {
        shelvedGoods.push({
          goodsCode: item.goodsCode,
          goodsName: item.goodsName,
          stock: item.stock,
          shelvesId: item.shelvesId
        })
      });

      const params = {
        shelvesId: tableRowData.shelvesId,
        depotId: tableRowData.depotId,
        notShelvedGoods,
        shelvedGoods
      }
      this.sendParamToAdjustGoods(params);
    }
  }

  async sendParamToAdjustGoods(params) {
    const { code, msg } = await GoodsCenterService.storeAndShelf.shelfAdjust(params);
    if (code !== SUCCESS_CODE){
      helper.W(msg);
      return;
    }
    helper.S('操作成功');
    this.setState({
      goodsVisible: false
    });
  }


  clickGoodsCancel() {
    this.setState({
      goodsVisible: false
    });
  }

  renderAction = (text, record, index) => {
    return (
      <span>
        {/* {
          setAction(PATH, 'changeGoods')? [
            <Button type="danger" ghost size="small" onClick={() => this.adjustGoods(record)}>调整货品</Button>,
            <Divider type="vertical" />
          ]: null
        } */}
        {
          setAction(PATH, 'update')? <Button type="primary" size="small" onClick={() => this.edit(record)}>修改</Button>: null
        }

      </span>
    )
  }
}

export default ShelfManage;
