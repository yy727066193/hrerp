import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Pagination } from 'antd'
import { SearchForm } from '../../../components'
import AddAuthComboColumns from './AddAuthComboColumns'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

@inject('store')
@observer
class AddAuthCombo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],   // 表格数据
      pageNum: 1,   // 当前页码
      pageSize: 10,   // 每页数据条数
      total: 0,   // 数据总条数
      AddComboLoading: false,   // 添加授权套餐loading
    }
  };

  getData = async () => {
    const { searchData, pageNum, pageSize } = this.state;
    const { authComboRowData } = this.props;

    this.setState({AddComboLoading: true})
    const { code, msg, data } = await GoodsCenterService.CompanyMealList.selectAll({ ...searchData, pageNum, pageSize, companyId: authComboRowData.companyId, goodsGenre: 2, isPutOn: 1 });
    this.setState({AddComboLoading: false})
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
    this.setState({  pageNum: 1 })

    if (type) {
      if(searchData.goodsCategories) {
        searchData.categoriesId = searchData.goodsCategories[searchData.goodsCategories.length - 1];
        delete searchData.goodsCategories
      }
      this.setState({searchData}, () => this.getData())
    } else {
      this.setState({searchData: {}}, () => this.getData())
    }
  };

  pageChange = (type=0, num) => {
    if (type) {
      this.setState({pageNum: 1, pageSize: num}, () => {
        this.getData();
      });
    } else {
      this.setState({pageNum: num}, () => this.getData())
    }
  };

  componentDidMount() {
    this.getData();
  };
  
  render() {
    const { comboData } = this.props;
    const { tableData, pageNum, pageSize, total, AddComboLoading } = this.state;
    
    const columns = () => {
      const arr = [];
      AddAuthComboColumns.forEach(item => {
        const { dataIndex } = item;
        if(dataIndex === 'serialNumber') {
          item.render = (text, record, index) => <span>{ `${index + 1}` }</span>
        } else if (dataIndex === 'goodsCategories') {
          item.options = comboData;
          item.defaultProps = { label: 'name', value: 'id', children: 'children' };
          item.render = (text, record, index) => <span>{ record.goodsCategories ? record.goodsCategories.name : '' }</span>
        }
        arr.push(item)
      })
      return arr;
    };
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.setAddAuthComboData(selectedRows)
      },
    };

    return(
      <div>
        <div className="page-wrapper-search">
          <SearchForm formList={AddAuthComboColumns} showSearch  
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
          </SearchForm>
        </div>

        <div className="page-wrapper-content">
          <Table dataSource={tableData}
                 rowKey={record => record.id}
                 loading={AddComboLoading}
                 columns={columns()}
                 size='small'
                 rowSelection={rowSelection}
                 bordered={false}
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

export default AddAuthCombo;