import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Table,  Modal, Popconfirm } from 'antd'
import { SearchForm } from '../../../components'
import AuthGoodsColumns from './AuthGoodsColumns'
import AddAuthGoods from './AddAuthGoods'
import UpdadePriceIntegralForm from './UpdadePriceIntegralForm'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";
import './item.less'

@inject('store')
@observer
class AuthGoods extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      tableData: [],   // 表格数据
      searchTableData: [],   // 搜索后的表格数据
      searchData: {},   // 搜索数据
      showAddAuthGoodsModal: false,   // 添加货品弹框显示隐藏
      showUpdadeAuthGoodsModal: false,   // 编辑货品销售价格、积分
      authGoodsed: [],   // 已勾选的授权货品
      goodsLoading: false,   // 加载已授权的货品loading

      priceIntegralRowData: {},
      priceIntegralRowDataFather: {},
      priceIntegralRowIndex: null,
    }
  };

  getData = async () => {
    const { rowData } = this.props;
    const { searchData } = this.state;
    const { pageNum } = this.props.store;
    
    if(rowData.hrNos) {
      this.setState({goodsLoading: true})
      const { code, msg, data } = await GoodsCenterService.GoodsAuth.authStoreGoods({...searchData, pageSize: 999999, pageNum, id: rowData.id, type: 2, goodsGenre: 1});
      this.setState({goodsLoading: false})
      if (code !== SUCCESS_CODE) {
        helper.W(msg);
        return;
      }
      if(JSON.stringify(searchData) === "{}") {
        this.setState({ tableData: data.list })
      } else {
        this.setState({ searchTableData: data.list })
      }
    }
  };

  getDataList = () => {   // 通过此方法父组件调用可获取子组件中tableData数据
    const { tableData } = this.state;
    return tableData;
  };

  onSearchReset = (type=1, searchData) => {   // 搜索
    if (type) {
      const { categoriesName } = searchData;
      if(categoriesName) {
        searchData.goodsCategoriesId = categoriesName[categoriesName.length - 1];
        delete searchData.categoriesName
      }
      this.setState({searchData}, () => this.getData())
    } else {
      this.setState({searchData: {}}, () => this.getData())
    }
  };

  showAddGoodsModal(formData, index, e) {   // 点击添加货品
    this.setState({
      showAddAuthGoodsModal: true,
    })
  };

  setAddAuthGoodsData(value) {   // 得到授权货品hrNo
    this.onSearchReset(0, null);
    this.setState({
      authGoodsed: value ? value : [],
      searchData: {}
    }, () => this.getData())
  };

  setAddAuthGoods = () => {   // 添加货品提交
    const { authGoodsed, tableData } = this.state;

    if(!authGoodsed || !authGoodsed.length) {
      helper.W('请选择货品');
      return;
    };
    this.setState({
      tableData: [...authGoodsed, ...tableData],
      showAddAuthGoodsModal: false,
    })
  };

  renderProductProperty = (text, record, index) => {   // 货品属性
    return(
      <div className="tr-goods-property clearfix">
        {
          record.goodsPresentation ? 
          <img className="tr-goods-property-img" alt='' src={record.goodsPresentation.mainImgs ? record.goodsPresentation.mainImgs.split(',')[0] : null}></img> : null
        }
        <div className="tr-goods-property-content">
          <span className="tr-goods-property-content-name">{record.name + "(多规格)"}</span>
          <span className="tr-goods-property-content-k3No"><label>货品编码:</label>{record.k3No}</span>
          <span className="tr-goods-property-content-hrNo"><label>条形码:</label>{record.barcode ? record.barcode : ' -- '}</span>
        </div>
      </div>
    )
  };

  renderProductPropertySon = (text, record, index) => {   // 子货品属性
    const arr = [];
    record.goodsBaseSpuList.forEach(item => {
      arr.push(item.name);
    })
    return(
      <div className="tr-goods-property clearfix">
        {
          record.goodsPresentation ? 
          <img className="tr-goods-property-img" alt='' src={record.goodsPresentation.mainImgs ? record.goodsPresentation.mainImgs.split(',')[0] : null}></img> : null
        }
        <div className="tr-goods-property-content">
        <span className="tr-goods-property-content-name">{record.name}</span>
          <span className="tr-goods-property-content-k3No"><label>货品编码:</label>{record.k3No}</span>
          <span className="tr-goods-property-content-hrNo"><label>条形码:</label>{record.barcode ? record.barcode : ' -- '}</span>
        </div>
      </div>
    )
  };

  renderGoodsTypeName = (text, record) => {
    if(text) {
      const goodsTypeNameList = [];
      text.forEach(item => {
        goodsTypeNameList.push(item.name)
      })
      return(
        <div>{goodsTypeNameList.join(',')}</div>
      )
    } else {
      return '';
    }
  };

  handleDelete = async (rowRecord, rowIndex) => {   // 删除货品授权表格中的数据
    const { tableData, searchTableData, searchData } = this.state;
    const { rowData } = this.props;

    if(JSON.stringify(searchData) === "{}") {
      await GoodsCenterService.GoodsAuth.deleteAuthGoods({goodsGenre: 1, 
                                                          isUpdateGoods: 1, 
                                                          goodsList: [rowRecord], 
                                                          id: rowData.id, 
                                                          companyId: rowData.companyId
                                                        })
      tableData.splice(rowIndex, 1);
    } else {
      await GoodsCenterService.GoodsAuth.deleteAuthGoods({goodsGenre: 1, 
                                                          isUpdateGoods: 1, 
                                                          goodsList: [rowRecord], 
                                                          id: rowData.id, 
                                                          companyId: rowData.companyId
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

  renderGoodsUnitRelation = (text, record, index) => {
    const arr = [];
    if(record.goodsPackingUnitList) {
      record.goodsPackingUnitList.forEach(item => {
        arr.push(item.num + "" + item.name)
      })
      return(
        <span>{arr.join(';')}</span>
      )
    } else {
      return(
        <span>{'--'}</span>
      )
    }
  };

  renderGoodsTypeNameSon = (text, recordFather) => {
    if(recordFather.goodsTypeList) {
      const goodsTypeNameList = [];
      recordFather.goodsTypeList.forEach(item => {
        goodsTypeNameList.push(item.name)
      })
      return(
        <span>{goodsTypeNameList.join(',')}</span>
      )
    } else {
      return(
        <span>{'--'}</span>
      )
    }
  };

  showPrice = (text ,record, index, recordFather) => {
    if(recordFather.goodsTypeList) {
      for(let i=0; i<recordFather.goodsTypeList.length; i++) {
        if(recordFather.goodsTypeList[i].id === 1) {
          return(
            <span>{ record.goodsStorePrice ? record.goodsStorePrice.realPrice : 0 }</span>
          )
          break;
        }
      }
    }
    return(
      <span>{ '--' }</span>
    )
  };

  showUserPrice = (text ,record, index, recordFather) => {
    if(recordFather.goodsTypeList) {
      for(let i=0; i<recordFather.goodsTypeList.length; i++) {
        if(recordFather.goodsTypeList[i].id === 1) {
          return(
            <span>{ record.goodsStorePrice ? record.goodsStorePrice.realUserPrice : 0 }</span>
          )
          break;
        }
      }
    }
    return(
      <span>{ '--' }</span>
    )
  };

  // showIntegral = (text ,record, index, recordFather) => {
  //   if(recordFather.goodsTypeList) {
  //     for(let i=0; i<recordFather.goodsTypeList.length; i++) {
  //       if(recordFather.goodsTypeList[i].id === 2) {
  //         return(
  //           <span>{ record.goodsStorePrice ? record.goodsStorePrice.integral : 0 }</span>
  //         )
  //         break;
  //       }
  //     }
  //   }
  //   return(
  //     <span>{ '--' }</span>
  //   )
  // };

  showExchangeIntegral = (text, record, index, recordFather) => {
    const arr = [];
    recordFather.goodsTypeList.forEach(item => {
      if(item.id === 1) {
        arr.push(item.id);
      }
    })
    if(arr.length) {
      if(record.goodsStorePrice) {
        return <span>{ record.goodsStorePrice.exchangeIntegral ? '是' : '否' }</span>
      } else {
        return '是'
      }
    } else {
      return '--'
    }
  };

  priceIntegralUpdate = (text, record, index, recordFather, indexFather) => {   // 编辑价格、积分
    this.setState({
      priceIntegralRowData: record,
      priceIntegralRowDataFather: recordFather,
      priceIntegralRowIndex: indexFather,
      showUpdadeAuthGoodsModal: true
    })
  };

  setUpdateAuthGoods = (e) => {   // 编辑价格、积分提交
    e.preventDefault();
    const { tableData, searchTableData, searchData, priceIntegralRowDataFather } = this.state;

    this.UpdadePriceIntegralForm.validateFields((err, formSubmitData) => {
      if (err) {
        return;
      }
      if(formSubmitData.realPrice === 0 || formSubmitData.realUserPrice === 0) {
        helper.W('价格不能为零');
        return;
      }
      if(JSON.stringify(searchData) === "{}") {
        this.updateAuthGoods(tableData, formSubmitData)
      } else {
        this.updateAuthGoods(searchTableData, formSubmitData);
        tableData.forEach((item, index) => {
          if(item.hrNo === priceIntegralRowDataFather.hrNo) {
            tableData.splice(index, 1, priceIntegralRowDataFather)
          }
        })
      }
    
      this.setState({
        tableData,
        searchTableData,
        priceIntegralRowData: {},
        priceIntegralRowDataFather: {},
        priceIntegralRowIndex: null,
        showUpdadeAuthGoodsModal: false
      })
    })
  };

  updateAuthGoods = (tableDataArr, formSubmitData) => {
    const { priceIntegralRowIndex, priceIntegralRowData } = this.state;

    tableDataArr[priceIntegralRowIndex].goodsSkuList.forEach((item, index) => {
      if(item.hrNo === priceIntegralRowData.hrNo) {
        const StorePrice = item.goodsStorePrice === null 
          ? {realPrice: 0, realUserPrice: 0, exchangeIntegral: null}
          : item.goodsStorePrice;

        if(formSubmitData.realPrice) {
          StorePrice['realPrice'] = formSubmitData.realPrice;
        }
        if(formSubmitData.realUserPrice) {
          StorePrice['realUserPrice'] = formSubmitData.realUserPrice;
        }
        StorePrice['exchangeIntegral'] = formSubmitData.exchangeIntegral ? 1 : 0;

        if(item.goodsStorePrice) {
          delete item.goodsStorePrice.price;
          delete item.goodsStorePrice.userPrice;
        }
      }
    })
  };

  renderActionFather = (text, record, index) => {
    return(
      <div className="page-wrapper-table-action">
        <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.handleDelete(record, index)}>
          <Button size="small" type="danger" ghost>移除</Button>    {/*0/1    可删除、不可删除*/}
        </Popconfirm>
      </div>
    )
  };

  renderActionSon = (text, record, index, recordFather, indexFather) => {
    const arr = [];
    recordFather.goodsTypeList.forEach(item => {
      if(item.id === 1) {
        arr.push(item.id);
      }
    })
    if(arr.length) {
      return(
        <div className="page-wrapper-table-action">
            <Button size="small" type="danger" ghost 
                    onClick={() => this.priceIntegralUpdate(text, record, index, recordFather, indexFather)}>编辑</Button>
        </div>
      )
    }
  };

  expandedRowRender = (recordFather, indexFather) => {
    const arr = [];
    AuthGoodsColumns.forEach(item => {
      const { dataIndex, visible } = item;

      if(visible !== 1) {
        if(dataIndex === 'serialNumber') {
          item.render = (text, record, index)=>`${indexFather+1} - ${index+1}`;
        } else if(dataIndex === 'productProperty') {
          item.render = (text, record, index) => this.renderProductPropertySon(text, record, index);
        } else if (dataIndex === 'packingSpec') {
          item.render = (text, record, index) => this.renderGoodsUnitRelation(text, record, index);
        } else if (dataIndex === 'goodsPriceUnit') {
          item.render = (text) => <span>{ recordFather.goodsPriceUnit.name }</span>;
        } else if (dataIndex === 'goodsTypeList') {
          item.render = (text, record) => this.renderGoodsTypeNameSon(text, recordFather);
        } else if (dataIndex === 'categoriesName') {
          item.render = (text) => <span>{ recordFather.categoriesName }</span>
        } else if (dataIndex === 'realPrice') {
          item.render = (text, record, index) => this.showPrice(text, record, index, recordFather);
        } else if (dataIndex === 'realUserPrice') {
          item.render = (text, record, index) => this.showUserPrice(text, record, index, recordFather);
        } 
        // else if (dataIndex === 'integral') {
        //   item.render = (text, record, index) => this.showIntegral(text, record, index, recordFather);
        // } 
        else if (dataIndex === 'exchangeIntegral') {
          item.render = (text, record, index) => this.showExchangeIntegral(text, record, index, recordFather);
        } else if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderActionSon(text, record, index, recordFather, indexFather)
        }
        arr.push(item)
      }
    });

    return (
      <Table
        columns={arr}
        showHeader={false}
        rowKey={recordFather => recordFather.id}
        dataSource={recordFather.goodsSkuList}
        pagination={false}
      />
    );
  };

  componentDidMount() {
    this.getData()
  }

  render() {
    const { loading } = this.props.store;
    const { tableData, 
            searchTableData,
            searchData,
            showAddAuthGoodsModal, 
            showUpdadeAuthGoodsModal, 
            priceIntegralRowData, 
            priceIntegralRowDataFather, 
            goodsLoading } = this.state;
    const { goodsCategoriesData, companyId } = this.props;
    const columns = () => {
      const arr = [];
      AuthGoodsColumns.forEach(item => {
        const { dataIndex, visible } = item;
        if(visible !== 1) {
          if(dataIndex === 'serialNumber') {
            item.render = (text, record, index)=>`${index+1}`;
          } else if(dataIndex === 'productProperty') {
            item.render = (text, record, index) => this.renderProductProperty(text, record, index);
          } else if (dataIndex === 'packingSpec') {
            item.render = (text) => <span> -- </span>;
          } else if (dataIndex === 'goodsPriceUnit') {
            item.render = (text) => <span>{ text ? text.name : '' }</span>;
          } else if (dataIndex === 'goodsTypeList') {
            item.render = (text, record) => this.renderGoodsTypeName(text, record);
          } else if (dataIndex === 'categoriesName') {
            item.options = goodsCategoriesData;
            item.defaultProps = { label: 'name', value: 'id', children: 'children' };
            item.changeOnSelect = true;
            item.render = (text, record) => <span>{ record.categoriesName }</span>
          } else if (dataIndex === 'realPrice') {
            item.render = () => <span>{ '--' }</span>;
          } else if (dataIndex === 'realUserPrice') {
            item.render = () => <span>{ '--' }</span>;
          } 
          // else if (dataIndex === 'integral') {
          //   item.render = () => <span>{ '--' }</span>;
          // } 
          else if (dataIndex === 'exchangeIntegral') {
            item.render = () => <span>{ '--' }</span>;
          } else if (dataIndex === 'actions') {
            item.render = (text, record, index) => this.renderActionFather(text, record, index)
          }
          arr.push(item);
        }
      })
      return arr;
    }

    return(
      <div>
        <div className="page-wrapper-search">
          <SearchForm formList={AuthGoodsColumns} showSearch  
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
            <Button type="primary" onClick={this.showAddGoodsModal.bind(this, true, null, null)}>添加货品</Button>
          </SearchForm>
        </div>

        <div className="page-wrapper-content">
          <div style={{ height: '450px' }}>
            <Table dataSource={JSON.stringify(searchData) === "{}" ? tableData : searchTableData}
              rowKey={(record, index) => `${record.id} + ${index}`}
              loading={goodsLoading}
              columns={columns()}
              size='small'
              bordered={false}
              expandedRowRender={(record, index) => this.expandedRowRender(record, index)}
              pagination={false} />
          </div>
          
        </div>

          <Modal title="添加授权货品"
                width='1000px'
                confirmLoading={loading}
                visible={showAddAuthGoodsModal}
                destroyOnClose
                onOk={this.setAddAuthGoods}
                onCancel={() => this.setState({showAddAuthGoodsModal: false})}>
            <AddAuthGoods companyId={companyId} goodsCategoriesData={goodsCategoriesData} setAddAuthGoodsData={this.setAddAuthGoodsData.bind(this)} />
          </Modal>

          <Modal title="编辑价格、积分"
                confirmLoading={loading}
                visible={showUpdadeAuthGoodsModal}
                destroyOnClose
                onOk={this.setUpdateAuthGoods}
                onCancel={() => this.setState({showUpdadeAuthGoodsModal: false})}>
              <UpdadePriceIntegralForm ref={el => this.UpdadePriceIntegralForm = el} priceIntegralRowData={priceIntegralRowData} priceIntegralRowDataFather={priceIntegralRowDataFather} />
          </Modal>
      </div>
    )
  }
};

export default AuthGoods;