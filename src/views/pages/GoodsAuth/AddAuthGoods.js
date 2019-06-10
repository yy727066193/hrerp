import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Pagination,  } from 'antd'
import { SearchForm } from '../../../components'
import AddAuthGoodsColumns from './AddAuthGoodsColumns'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

@inject('store')
@observer
class AddAuthGoods extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      tableData: [],   // 表格数据
      searchData: {},   // 搜索数据
      pageNum: 1,   // 当前页码
      pageSize: 10,   // 每页数据条数
      total: 0,   // 数据总条数
      showAddAuthGoodsModal: false,   // 添加货品弹框显示隐藏
      AddGoodsLoading: false,   // 添加授权货品loading
    }
  };

  getData = async () => {
    const { searchData, pageNum, pageSize } = this.state;
    const { companyId } = this.props;

    this.setState({AddGoodsLoading: true})
    const { code, msg, data } = await GoodsCenterService.CompanyGoodsList.selectAll({ ...searchData, pageNum, pageSize, companyId, goodsGenre: 1, isPutOn: 1 });
    this.setState({AddGoodsLoading: false})
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    const { page, list } = data;
    this.setState({
      tableData: list,
      total: page.total
    })
  };

  onSearchReset = (type=1, searchData) => {   // 搜索
    this.setState({
      pageNum: 1
    })

    if (type) {
      const { categoriesName } = searchData;

      if(categoriesName) {
        searchData.categoriesId = categoriesName[categoriesName.length - 1];
        delete searchData.categoriesName
      }

      this.setState({searchData}, () => this.getData())
    } else {
      this.setState({searchData: {}}, () => this.getData())
    }
  };

  pageChange = (type=0, num) => {
    if (type) {
      this.setState({
        pageNum: 1,
        pageSize: num,
      }, () => this.getData())
    } else {
      this.setState({
        pageNum: num,
      }, () => this.getData())
    }
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

  renderGoodsTypeNameSon = (recordData) => {
    if(recordData) {
      const goodsTypeNameList = [];
      recordData.goodsTypeList.forEach(item => {
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

  expandedRowRender = (recordData, indexData) => {
    const { goodsCategoriesData, AddGoodsLoading } = this.state;

    const arr = [];
    AddAuthGoodsColumns.forEach(item => {
      const { dataIndex, visible } = item;
      if(visible !== 1) {
        if(dataIndex === 'categoriesName') {
          item.render = () => <span>{ recordData.categoriesName }</span>
          item.options = goodsCategoriesData;
          item.defaultProps = { label: 'name', value: 'id', children: 'children' };
        } else if (dataIndex === 'goodsPriceUnit') {
          item.render = (text, record) => <span>{ recordData.goodsPriceUnit ? recordData.goodsPriceUnit.name : '' }</span>
        } else if(dataIndex === 'goodsTypeList') {
          item.render = () => this.renderGoodsTypeNameSon(recordData)
        }
        arr.push(item);
      }
    })

    return (
      <Table
        loading={AddGoodsLoading}
        columns={arr}
        showHeader={false}
        rowKey={record => record.hrNo}
        dataSource={recordData.goodsSkuList}
        pagination={false}
      />
    );
  };

  componentDidMount() {
    this.getData()
  };

  render() {
    const { tableData, pageNum, pageSize, total, AddGoodsLoading } = this.state;
    const { goodsCategoriesData } = this.props;
    const columns = () => {
      const arr = [];
      AddAuthGoodsColumns.forEach(item => {
        const { dataIndex, visible } = item;
        if(visible !== 1) {
          if(dataIndex === 'categoriesName') {
            item.options = goodsCategoriesData;
            item.defaultProps = { label: 'name', value: 'id', children: 'children' };
          } else if (dataIndex === 'goodsPriceUnit') {
            item.render = (text, record, index) => <span>{ record.goodsPriceUnit ? record.goodsPriceUnit.name : '' }</span>
          } else if(dataIndex === 'goodsTypeList') {
            item.render = (text, record) => this.renderGoodsTypeName(text, record)
          }
          arr.push(item);
        }
      })
      return arr;
    };
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.setAddAuthGoodsData(selectedRows)
      },
    }
    

    return(
      <div>
        <div className="page-wrapper-search">
          <SearchForm formList={AddAuthGoodsColumns} showSearch  
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
          </SearchForm>
        </div>

        <div className="page-wrapper-content">
          <Table size='small'
                  dataSource={tableData}
                  rowKey={record => record.hrNo}
                  loading={AddGoodsLoading}
                  columns={columns()}
                  bordered={false}
                  showHeader={true}
                  rowSelection={rowSelection}
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
      </div>
    )
  }
};

export default AddAuthGoods;