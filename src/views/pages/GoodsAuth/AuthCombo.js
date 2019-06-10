import React from 'react'
import { inject, observer } from 'mobx-react'
import {  Button, Table, Modal, Popconfirm, Divider } from 'antd'
import { SearchForm } from '../../../components'
import AuthComboColumns from './AuthComboColumns'
import AddAuthCombo from './AddAuthCombo'
import UpdatePriceForm from './UpdatePriceForm'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

@inject('store')
@observer
class AuthCombo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],   // 表格数据
      searchTableData: [],   // 搜索后表格数据
      searchData: {},   // 搜索数据
      authConboed: [],   // 已勾选的套餐数据
      comboData: [],   // 套餐分类下拉数据

      rowIndex: null,   // 编辑的行下标
      showUpdadeAuthComboModal: false,   // 价格积分设置显示隐藏
      showAddAuthComboModal: false,   // 添加套餐弹框显示隐藏
      comboLoading: false,   // 套餐表格加载loading
    }
  };

  getData = async () => {
    const { authComboRowData } = this.props;
    const { searchData } = this.state;
    const { pageNum } = this.props.store;
    
    this.setState({comboLoading: true})
    const { code, msg, data } = await GoodsCenterService.GoodsAuth.authStoreGoods({...searchData, pageSize: 999999, pageNum, id: authComboRowData.id, type: 2, goodsGenre: 2});
    this.setState({comboLoading: false})
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    if(JSON.stringify(searchData) === "{}") {
      this.setState({ tableData: data.list })
    } else {
      this.setState({ searchTableData: data.list })
    }
  };

  setOptions = async () => {
    const { data: comboData } = await GoodsCenterService.GoodsType.listAll({ goodsTypeId: 2, parentId: 0 });

    if(comboData) {
      this.setState({comboData: comboData.list})
    }
  };

  onSearchReset = (type=1, searchData) => {   // 搜索
    if (type) {
      const { goodsCategories } = searchData;
      if(goodsCategories) {
        searchData.goodsCategoriesId = goodsCategories[goodsCategories.length - 1];
        delete searchData.goodsCategories
      }
      this.setState({searchData}, () => this.getData())
    } else {
      this.setState({searchData: {}}, () => this.getData())
    }
  };

  showAddGoodsModal(e) {   // 点击添加套餐货品
    this.setState({
      showAddAuthComboModal: true
    })
  };

  setAddAuthComboData(value) {   // 执行子组件，得到选中的套餐
    this.onSearchReset(0, null);
    this.setState({
      authComboed: value ? value : [],
      searchData: {}
    }, () => this.getData())
  };

  setAddAuthCombo = () => {   // 添加货品提交
    const { authComboed, tableData, total } = this.state;

    if(!authComboed || !authComboed.length) {
      helper.W('请选择套餐');
      return;
    }
    this.setState({
      tableData: [...authComboed, ...tableData],
      total: total + authComboed.length,
      showAddAuthComboModal: false,
    })
  };

  renderAction = (text, record, index) => {   // 移除操作
    return(
      <div className="page-wrapper-table-action">
        <Button size="small" type="primary" onClick={() => this.priceUpdate(text, record, index)}>编辑</Button>
        <Divider type="vertical" />
        <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.handleDelete(record, index)}>
          <Button size="small" type="danger" ghost>移除</Button>    {/*0/1    可删除、不可删除*/}
        </Popconfirm>
      </div>
    )
  };

  handleDelete = async (rowRecord, rowIndex) => {
    const { tableData, searchTableData, searchData } = this.state;
    const { authComboRowData } = this.props;

    if(JSON.stringify(searchData) === "{}") {
      await GoodsCenterService.GoodsAuth.deleteAuthGoods({goodsGenre: 2, 
                                                          isUpdateGoods: 1, 
                                                          goodsList: [rowRecord], 
                                                          id: authComboRowData.id, 
                                                          companyId: authComboRowData.companyId
                                                        })
      tableData.splice(rowIndex, 1);
    } else {
      await GoodsCenterService.GoodsAuth.deleteAuthGoods({goodsGenre: 2, 
                                                          isUpdateGoods: 1, 
                                                          goodsList: [rowRecord], 
                                                          id: authComboRowData.id, 
                                                          companyId: authComboRowData.companyId
                                                        })
      tableData.forEach((item, index) => {
        if(item.hrNo === searchTableData[rowIndex].hrNo) {
          tableData.splice(index, 1);
        }
      })
      searchTableData.splice(rowIndex, 1);
    }

    this.setState({ tableData, searchTableData })
  };

  priceUpdate = (text, record, index) => {   // 编辑价格
    this.setState({
      rowData: index,
      comboRowData: record,
      showUpdadeAuthComboModal: true
    })
  };

  setUpdateAuthCombo = (e) => {
    e.preventDefault();
    const { tableData, searchData, searchTableData, comboRowData } = this.state;
    this.UpdatePriceForm.validateFields((err, formSubmitData) => {
      if(err) {
        return;
      }

      if(JSON.stringify(searchData) === "{}") {
        this.updateAuthCombo(tableData, formSubmitData)
      } else {
        this.updateAuthCombo(searchTableData, formSubmitData);
        tableData.forEach((item, index) => {
          if(item.hrNo === comboRowData.hrNo) {
            tableData.splice(index, 1, comboRowData)
          }
        })
      }
      
      this.setState({
        tableData,
        showUpdadeAuthComboModal: false
      })
    })
  };

  updateAuthCombo = (tableDataArr, formSubmitData) => {
    const { rowData, searchData, tableData, searchTableData } =this.state;
    const comboPrice = tableDataArr[rowData].goodsStorePrice === null ? {realPrice: 0, realUserPrice: 0} : tableDataArr[rowData].goodsStorePrice;

    if(formSubmitData.realPrice) {
      comboPrice['realPrice'] = formSubmitData.realPrice;
    }
    if(formSubmitData.realUserPrice) {
      comboPrice['realUserPrice'] = formSubmitData.realUserPrice;
    }

    if(JSON.stringify(searchData) === "{}") {
      tableData[rowData].goodsStorePrice = comboPrice;
      if(tableData[rowData].goodsStorePrice) {
        delete tableData[rowData].goodsStorePrice.price;
        delete tableData[rowData].goodsStorePrice.userPrice;
      }
    } else {
      searchTableData[rowData].goodsStorePrice = comboPrice;
      if(searchTableData[rowData].goodsStorePrice) {
        delete searchTableData[rowData].goodsStorePrice.price;
        delete searchTableData[rowData].goodsStorePrice.userPrice;
      }
    }
  };

  componentDidMount() {
    this.getData();
    this.setOptions()
  };
  
  render() {
    const { authComboRowData, companyId } = this.props;
    const { loading } = this.props.store;
    const { tableData, showUpdadeAuthComboModal, searchData, searchTableData, showAddAuthComboModal, comboData, comboRowData, comboLoading } = this.state;

    const columns = () => {
      const arr = [];
      AuthComboColumns.forEach(item => {
        const { dataIndex } = item;
        if(dataIndex === 'serialNumber') {
          item.render = (text, record, index) => <span>{ `${index + 1}` }</span>
        } else if (dataIndex === 'goodsCategories') {
          item.options = comboData;
          item.defaultProps = { label: 'name', value: 'id', children: 'children' };
          item.render = (text, record, index) => <span>{ record.goodsCategories ? record.goodsCategories.name : '' }</span>
        }else if (dataIndex === 'realPrice') {
          item.render = (text, record, index) => <span>{ record.goodsStorePrice ? record.goodsStorePrice.realPrice : 0 }</span>;
        } else if (dataIndex === 'realUserPrice') {
          item.render = (text, record, index) => <span>{ record.goodsStorePrice ? record.goodsStorePrice.realUserPrice : 0 }</span>;
        } else if (dataIndex === 'action') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
        }
        arr.push(item)
      })
      return arr;
    }

    return(
      <div>
        <div className="page-wrapper-search">
          <SearchForm formList={AuthComboColumns} showSearch  
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
            <Button type="primary" onClick={this.showAddGoodsModal.bind(this)}>添加套餐</Button>
          </SearchForm>
        </div>

        <div className="page-wrapper-content">
          <div style={{ height: '450px' }}>
            <Table dataSource={JSON.stringify(searchData) === "{}" ? tableData : searchTableData}
                  rowKey={(record, index) => `${record.id} + ${index}`}
                  loading={comboLoading}
                  columns={columns()}
                  size='small'
                  bordered={false}
                  pagination={false} />
          </div>
        </div>

        <Modal title="添加授权套餐"
              width='1000px'
              confirmLoading={loading}
              visible={showAddAuthComboModal}
              destroyOnClose
              onOk={this.setAddAuthCombo}
              onCancel={() => this.setState({showAddAuthComboModal: false})}>
          <AddAuthCombo companyId={companyId} authComboRowData={authComboRowData} comboData={comboData} setAddAuthComboData={this.setAddAuthComboData.bind(this)} />
        </Modal>

        <Modal title="编辑价格、积分"
              confirmLoading={loading}
              visible={showUpdadeAuthComboModal}
              destroyOnClose
              onOk={this.setUpdateAuthCombo}
              onCancel={() => this.setState({showUpdadeAuthComboModal: false})}>
            <UpdatePriceForm ref={el => this.UpdatePriceForm = el} comboRowData={comboRowData} />
        </Modal>
      </div>
    )
  }
};

export default AuthCombo;