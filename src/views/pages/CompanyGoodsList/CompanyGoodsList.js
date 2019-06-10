import React from 'react'
import {inject, observer} from 'mobx-react'
import { Button, Table, Pagination, Popconfirm, Modal } from 'antd'
import {getLoginInfo, searchList, setAction} from "../../../utils/public"
import {SearchForm, Bread} from '../../../components/index'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {DATE_FORMAT, SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";
import Columns from './Columns'
import ColumnsChildren from './ColumnsChildren'
import '../../../assets/style/common/pageItem.less'
import './item.less'
import BaseFormList from './BaseFormList'
import BaseCenterService from '../../../service/BaseCenterService';

const PATH = 'companyGoodsList';

@inject('store')
@observer
class companyGoodsList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      goodsCategoriesData: [],
      goodsBrandData: [],
      goodsProviderData: [],
      goodsTypeData: [],
      companyData: [],
      tableDataList: [],
    }
  }

  getOption = async () => {
    const goodsTypeData = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 1, pageSize: 99999 });
    const propData = await GoodsCenterService.AddUpdateGoods.setProp();
    const companyData = await BaseCenterService.Company.listAll({ companyIds: getLoginInfo().childrenCompanyIds });

    this.setState({
      goodsCategoriesData: goodsTypeData.data.list,   // 货品分类
      goodsBrandData: propData.data.goodsBrand,   // 货品品牌
      goodsProviderData: propData.data.goodsProvider,   // 货品供应商
      goodsTypeData: propData.data.goodsType,   // 货品类别
      companyData: companyData.data,  // 公司管理
    })
  };

  getData = async () => {
    const { searchData, pageNum, pageSize, setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, msg, data } = await GoodsCenterService.CompanyGoodsList.selectAll({ ...searchData, pageNum, pageSize, 
                                                                                      companyId: searchData.companyId ? searchData.companyId : getLoginInfo().companyId, 
                                                                                      parentPutOn: 1,
                                                                                      goodsGenre: 1 });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }

    const { list, page } = data;
    const newList = [];
    list.forEach(item => {
      if(item) {
        newList.push(item);
      }
    })
    setCommon('pageNum', page.pageNum);
    setCommon('pageSize', page.pageSize);
    setCommon('total', page.total);
    setCommon('tableData', newList);
  };

  showModal = (formData, index, e) => {
    e.stopPropagation();

    const { setCommon } = this.props.store;

    if (formData) {
      setCommon('tableRowData', formData);
    }

    setCommon('editIndex', index);

    setCommon('modalVisible', true);
  };

  handleDelete = async (record) => {   // 软删除
    const { code, msg } = await GoodsCenterService.PreviewVisibleList.updateOne({ id: record.id, hidden: 0 });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
  };

  renderAction = (text, record, index) => {
    return(
      <div className="page-wrapper-table-action">
        <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.handleStartStop(record)}>
          {setAction(PATH, 'startStop') ? <Button size="small" type="primary">{record.isPutOn ? '下架' : '上架'}</Button> : null}
        </Popconfirm>
      </div>
    )
  };

  handleStartStop = async (record) => {   // 上下架操作
    const params = [{
      companyId: getLoginInfo().companyId,
      hrNo: record.hrNo,
      brandId: record.brandId,
      providerId: record.providerId,
      k3No: record.k3No,
      goodsTypeIds: record.goodsTypeIds,
      categoriesId: record.categoriesId,
      isPutOn: record.isPutOn ? 0 : 1,
     }];

    const { code, msg } = await GoodsCenterService.PreviewVisibleList.updateStartStop(params);
    if (code !== SUCCESS_CODE) {
    helper.W(msg);
    return;
    }
    helper.S();
    this.getData();
  };

  renderProductProperty = (text, record, index) => {   // 货品属性
    return(
      <div className="tr-goods-property clearfix">
        {
          record.goodsPresentation && record.goodsPresentation.mainImgs ?
          <img className="tr-goods-property-img" alt='' src={record.goodsPresentation.mainImgs.split(',')[0]} /> : null
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
    return(
      <div className="tr-goods-property clearfix">
        {
          record.goodsPresentation && record.goodsPresentation.mainImgs ?
          <img className="tr-goods-property-img" alt='' src={record.goodsPresentation.mainImgs.split(',')[0]} /> : null
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
        <div>
          {goodsTypeNameList.join(',')}
        </div>
      )
    } else {
      return '';
    }
  };

  renderGoodsTypeNameSon = (text, recordFather) => {
    if(recordFather) {
      const goodsTypeNameList = [];
      recordFather.goodsTypeList.forEach(item => {
        goodsTypeNameList.push(item.name)
      })
      return(
        <div>
          {goodsTypeNameList.join(',')}
        </div>
      )
    } else {
      return '';
    }
  };

  renderGoodsUnitRelation = (text, record, index) => {
    const arr = [];
    record.goodsPackingUnitList.forEach(item => {
      arr.push(item.num + "" + item.name)
    })
    return(
      <div>
        {arr.join(';')}
      </div>
    )
  };

  onSearchReset = (type=1, searchData) => {
    const { setCommon } = this.props.store;

    setCommon('pageNum', 1);

    if (type) {
      const { goodsTypeList, goodsProvider, goodsBrand, categoriesName, createTime } = searchData;

      if (createTime) {
        searchData.startDate = createTime[0].format(DATE_FORMAT);
        searchData.endDate = createTime[1].format(DATE_FORMAT);
        delete searchData.createTime
      }
      if(goodsTypeList) {
        searchData.goodsTypeIds = goodsTypeList;
        delete searchData.goodsTypeList
      }
      if(goodsProvider) {
        searchData.providerId = goodsProvider;
        delete searchData.goodsProvider
      }
      if(goodsBrand) {
        searchData.brandId = goodsBrand;
        delete searchData.goodsBrand
      }
      if(categoriesName) {
        searchData.categoriesId = categoriesName[categoriesName.length - 1];
        delete searchData.categoriesName
      }

      setCommon('searchData', searchData);
    } else {
      setCommon('searchData', {});
    }

    this.getData();
  };

  showIntegralNum = (text, record, index, recordFather) => {
    if(recordFather.goodsTypeList) {
      for(let i=0; i<recordFather.goodsTypeList.length; i++) {
        if(recordFather.goodsTypeList[i].id === 2) {
          return(
            <span>{ record.price ? record.price : 0 }</span>
          )
          break;
        }
      }
    }
    return(
      <span>{ '--' }</span>
    )
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

  expandedRowRender = (recordFather, indexFather) => {
    const { tableLoading } = this.props.store;
    const arr = [];

    ColumnsChildren.forEach(item => {
      const { dataIndex, visible } = item;

      if(visible !== 1) {
        if(dataIndex === 'serialNumber') {
          item.render = (text, record, index)=>`${indexFather+1} - ${index+1}`;
        } else if(dataIndex === 'productProperty') {
          item.render = (text, record, index) => this.renderProductPropertySon(text, record, index, recordFather);
        } else if (dataIndex === 'goodsBrand') {
          item.render = (text, record, index) => <span>{recordFather.goodsBrand ? recordFather.goodsBrand.name : ''}</span>;
        } else if (dataIndex === 'goodsProvider') {
          item.render = (text, record, index) => <span>{recordFather.goodsProvider ? recordFather.goodsProvider.name : ''}</span>;
        } else if (dataIndex === 'packingSpec') {
          item.render = (text, record, index) => this.renderGoodsUnitRelation(text, record, index)
        } else if (dataIndex === 'goodsStockUnit') {
          item.render = (text, record, index) => <span>{recordFather.goodsStockUnit ? recordFather.goodsStockUnit.name : ''}</span>;
        } else if (dataIndex === 'goodsPriceUnit') {
          item.render = (text, record, index) => <span>{recordFather.goodsPriceUnit ? recordFather.goodsPriceUnit.name : ''}</span>;
        } else if (dataIndex === 'goodsTypeList') {
          item.render = (text) => this.renderGoodsTypeNameSon(text, recordFather);
        } else if (dataIndex === 'integral') {
          item.render = (text, record, index) => this.showIntegralNum(text, record, index, recordFather);
        } else if (dataIndex === 'categoriesName') {
          item.render = (text) => <span>{ recordFather.categoriesName }</span>
        } else if (dataIndex === 'createEName') {
          item.render = (text) => <span>{ recordFather.createEName }</span>
        }
        arr.push(item)
      }
    });

    return (
      <Table
        size='small'
        loading={tableLoading}
        columns={arr}
        showHeader={true}
        bordered={false}
        rowKey={recordFather => recordFather.id}
        dataSource={recordFather.goodsSkuList}
        pagination={false}
      />
    );
  }

  componentDidMount() {
    this.getData();
    this.getOption();
  };

  render() {
    const { goodsProviderData, goodsBrandData, goodsTypeData, goodsCategoriesData, companyData } = this.state;
    const { tableData, pageNum, pageSize, total, tableLoading, setCommon, modalVisible, loading } = this.props.store;
    const companyColumns = [{title: '所属公司', dataIndex: 'companyId', formType: 'select', options: companyData, defaultProps: { label: 'name', value: 'id' }}]
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex, visible } = item;

        if(visible !== 1) {
          if (dataIndex === 'categoriesName') {
            item.options = goodsCategoriesData;
            item.defaultProps = { label: 'name', value: 'id', children: 'children' };
            item.changeOnSelect = true;
          } else if(dataIndex === 'serialNumber') {
            item.render = (text, record, index)=>`${index+1}`;
          } else if(dataIndex === 'productProperty') {
            item.options = goodsProviderData;
            item.defaultProps = { label: 'name', value: 'id' };
            item.render = (text, record, index) => this.renderProductProperty(text, record, index);
          } else if (dataIndex === 'goodsBrand') {
            item.options = goodsBrandData;
            item.defaultProps = { label: 'name', value: 'id' };
            item.render = (text) => <span>{ text ? text.name : '' }</span>;
          } else if (dataIndex === 'goodsProvider') {
            item.options = goodsProviderData;
            item.defaultProps = { label: 'name', value: 'id' };
            item.render = (text) => <span>{ text ? text.name : '' }</span>;
          } else if (dataIndex === 'goodsStockUnit') {
            item.render = (text) => <span>{ text ? text.name : '' }</span>;
          } else if (dataIndex === 'goodsPriceUnit') {
            item.render = (text) => <span>{ text ? text.name : '' }</span>;
          } else if (dataIndex === 'packingSpec') {
            item.render = (text) => <span> -- </span>;
          } else if (dataIndex === 'goodsTypeList') {
            item.options = goodsTypeData;
            item.defaultProps = { label: 'name', value: 'id' };
            item.render = (text, record) => this.renderGoodsTypeName(text, record);
          } else if (dataIndex === 'integral') {
            item.render = (text, record, index) => <span>{ '--' }</span>
          } else if (dataIndex === 'isPutOn') {
            item.options = [{ label: '上架', value: 1 }, { label: '下架', value: 0 }];
            item.render = (text, record) => <span>{ record.isPutOn ? '上架中' : '下架中' }</span>
          } else if (dataIndex === 'actions') {
            item.render = (text, record, index) => this.renderAction(text, record, index)
          }
          arr.push(item)
        }
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
          <SearchForm formList={[...Columns, ...companyColumns]} showSearch={setAction(PATH, 'search')}
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
            {setAction(PATH, 'add') ? <Button type="primary" onClick={this.showModal.bind(this, true, null, null)}>新建包装规格单位</Button> : null}
          </SearchForm>
        </div>

        <div className="page-wrapper-content">
          <Table
                 size='small'
                 dataSource={tableData}
                 rowKey={record => record.id}
                 loading={tableLoading}
                 columns={columns()}
                 bordered={false}
                 expandedRowRender={(record, index) => this.expandedRowRender(record, index)}
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

        <Modal title='编辑货品'
               confirmLoading={loading}
               visible={modalVisible}
               destroyOnClose
               onOk={this.handleSubmit}
               onCancel={() => {
                 setCommon('tableRowData', {});
                 setCommon('modalVisible', false)
               }}>
          <BaseFormList ref={el => this.previewVisibleListBaseForm = el} />
        </Modal>
      </div>
    )
  }
};

export default companyGoodsList;
