import React from 'react'
import {inject, observer} from 'mobx-react'
import { Button, Table, Pagination, Divider, Popconfirm, Popover, Drawer } from 'antd'
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
import PopoverTableUp from './PopoverTableUp'
// import PopoverTableIntegral from './PopoverTableIntegral'
import PopoverTableIntegralSet from './PopoverTableIntegralSet'
import BaseCenterService from '../../../service/BaseCenterService';

const PATH = 'previewVisibleList';

@inject('store')
@observer
class PreviewVisibleList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      goodsCategoriesData: [],
      goodsBrandData: [],
      goodsProviderData: [],
      goodsTypeData: [],
      companyData: [],
      tableDataList: [],
      goodsBaseUnitData: [],
      goodsPackingUnitData: [],
      productSpecData: [],
      goodsLabelData: [],
    }
  };

  getOption = async () => {
    const goodsTypeData = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 1, pageSize: 99999 });
    const propData = await GoodsCenterService.AddUpdateGoods.setProp();
    const productSpecData = await GoodsCenterService.UnitModel.selectAll({pageNum: 1, pageSize: 999999});
    const goodsLabelData = await GoodsCenterService.GoodsLabel.selectAll({pageNum: 1, pageSize: 999999});
    const companyData = await BaseCenterService.Company.listAll({ companyIds: getLoginInfo().companyIds });

    this.setState({
      goodsCategoriesData: goodsTypeData.data.list,   // 货品分类
      goodsBrandData: propData.data.goodsBrand,   // 货品品牌
      goodsProviderData: propData.data.goodsProvider,   // 货品供应商
      goodsTypeData: propData.data.goodsType,   // 货品类别
      goodsBaseUnitData: propData.data.goodsBaseUnit,   // 计价单位（个）
      goodsPackingUnitData: propData.data.goodsPackingUnit,   // 组合单位（个/盒）
      productSpecData: productSpecData.data.list,   // 货品规格
      goodsLabelData: goodsLabelData.data.list,   // 货品标签
      companyData: companyData.data,  // 公司数据
    })
  };

  getData = async () => {
    const { searchData, pageNum, pageSize, setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, msg, data } = await GoodsCenterService.PreviewVisibleList.selectAll({ ...searchData, pageNum, pageSize });
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

  showModal = (formData, index, e) => {
    e.stopPropagation();

    const { setCommon } = this.props.store;

    if (formData) {
      setCommon('tableRowData', formData);
    }

    setCommon('editIndex', index);
    setCommon('modalVisible', true);
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

  handleDelete = async (record) => {   // 软删除
    const { code, msg } = await GoodsCenterService.PreviewVisibleList.addInsertOne({ hrNo: record.hrNo, hidden: 0 });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
  };

  renderAction = (text, record, index) => {
    const { companyData } = this.state;
    return(
      <div className="page-wrapper-table-action">
        {setAction(PATH, 'update') ? <Button size="small" type="primary" onClick={this.showModal.bind(this, record, index)}>编辑</Button> : null}
        {setAction(PATH, 'update') && setAction(PATH, 'startStop') ? <Divider type="vertical" /> : null}
        <Popover trigger="click"
                 title={"货品名称：" + record.name}
                 placement="left"
                 content={<PopoverTableUp companyData={companyData} rowData={record} />}>
          {setAction(PATH, 'startStop') ? <Button size="small" type="danger" ghost>上下架</Button> : null}
        </Popover>
        {/* {setAction(PATH, 'giveInt') && setAction(PATH, 'startStop') ? <Divider type="vertical" /> : null}
        <Popover trigger="click"
                 title={"货品名称：" + record.name}
                 placement="left"
                 content={<PopoverTableIntegral companyData={companyData} rowData={record} />}>
          {setAction(PATH, 'giveInt') ? <Button size="small" type="danger" ghost>购买送积分</Button> : null}
        </Popover> */}
        {
          !setAction(PATH, 'delete') ? null :
            [
              <Divider type="vertical" />,
              <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.handleDelete(record)}>
                <Button size="small" type="danger" ghost disabled={record.isUpdate}>删除</Button>    {/*0/1    可删除、不可删除*/}
              </Popconfirm>,
            ]
        }
      </div>
    )
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
    if(record.goodsPackingUnitList) {
      record.goodsPackingUnitList.forEach(item => {
        arr.push(item.num + "" + item.name)
      })
      return(
        <div>{arr.join('；')}</div>
      )
    }
  };

  renderActionSon = (text, record, index, recordFather) => {
    const { companyData } = this.state;
    const arr = [];
    recordFather.goodsTypeList.forEach(item => {
      if(item.id === 2) {
        arr.push(item.id)
      }
    })
    if(arr.length) {
      return(
        <span>
          <Popover trigger="click"
                    title={"货品名称：" + record.name}
                    placement="top"
                    content={<PopoverTableIntegralSet companyData={companyData} rowData={recordFather} rowDataSon={record} />}>
            {setAction(PATH, 'setIntegral') ? <Button size="small" type="danger" ghost>设置积分</Button> : null}
          </Popover>
        </span>
      )
    }
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

  expandedRowRender = (recordFather, indexFather) => {
    const { tableLoading } = this.props.store;

    const arr = [];
    ColumnsChildren.forEach(item => {
      const { dataIndex, visible } = item;

      if(visible !== 1) {
        if(dataIndex === 'serialNumber') {
          item.render = (text, record, index)=>`${indexFather+1} - ${index+1}`;
        } else if(dataIndex === 'productProperty') {
          item.render = (text, record, index) => this.renderProductPropertySon(text, record, index);
        } else if (dataIndex === 'goodsBrand') {
          item.render = (text, record, index) => <span>{recordFather.goodsBrand ? recordFather.goodsBrand.name : ''}</span>;
        } else if (dataIndex === 'goodsProvider') {
          item.render = (text, record, index) => <span>{recordFather.goodsProvider ? recordFather.goodsProvider.name : ''}</span>;
        } else if (dataIndex === 'packingSpec') {
          item.render = (text, record, index) => this.renderGoodsUnitRelation(text, record, index);
        } else if (dataIndex === 'goodsStockUnit') {
          item.render = (text, record, index) => <span>{recordFather.goodsStockUnit ? recordFather.goodsStockUnit.name : ''}</span>;
        } else if (dataIndex === 'goodsPriceUnit') {
          item.render = (text, record, index) => <span>{recordFather.goodsPriceUnit ? recordFather.goodsPriceUnit.name : ''}</span>;
        } else if (dataIndex === 'goodsTypeList') {
          item.render = (text) => this.renderGoodsTypeNameSon(text, recordFather);
        } else if (dataIndex === 'categoriesName') {
          item.render = (text) => <span>{ recordFather.categoriesName }</span>
        } else if (dataIndex === 'createEName') {
          item.render = (text) => <span>{ recordFather.createEName }</span>
        } else if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderActionSon(text, record, index, recordFather)
        }
        arr.push(item)
      }
    });

    return (
      <Table
        size="small"
        loading={tableLoading}
        columns={arr}
        showHeader={false}
        rowKey={recordFather => recordFather.id}
        dataSource={recordFather.goodsSkuList}
        pagination={false}
      />
    );
  };

  componentDidMount() {
    this.getData();
    this.getOption();
  };

  render() {
    const { goodsProviderData,
            goodsBrandData,
            goodsTypeData,
            goodsCategoriesData,
            goodsBaseUnitData,
            goodsLabelData,
            goodsPackingUnitData,
            productSpecData } = this.state;
    const { tableData, pageNum, pageSize, total, tableLoading, setCommon, modalVisible } = this.props.store;
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
          <SearchForm formList={Columns} showSearch={setAction(PATH, 'search')}
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
          </SearchForm>
        </div>

        <div className="page-wrapper-content">
          <Table size="small"
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

        <Drawer title='编辑货品'
                width='1000'
                placement="right"
                visible={modalVisible}
                destroyOnClose
                onClose={() => {
                  setCommon('tableRowData', {});
                  setCommon('modalVisible', false)
                }}>
          <BaseFormList goodsProviderData={goodsProviderData}
                        goodsBrandData={goodsBrandData}
                        goodsTypeData={goodsTypeData}
                        goodsPackingUnitData={goodsPackingUnitData}
                        productSpecData={productSpecData}
                        goodsBaseUnitData={goodsBaseUnitData}
                        goodsLabelData={goodsLabelData}
                        goodsCategoriesData={goodsCategoriesData}
                        getData={this.getData.bind(this)} />
        </Drawer>
      </div>
    )
  }
};

export default PreviewVisibleList;
