import React from 'react'
import { Bread, SearchForm } from '../../../components'
import '../../../assets/style/common/pageItem.less'
import {getLoginInfo, searchList, setAction} from "../../../utils/public";
import { inject, observer } from 'mobx-react'
import { Table, Pagination, Popconfirm, Button } from 'antd'
import Columns from './Columns'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

const PATH = 'companyMealList';

@inject('store')
@observer
class CompanyMealList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      typeList: []
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

  setOptions = async () => {
    const { data: typeData } = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 2, pageSize: 999999 });
    if (typeData) {
      this.setState({ typeList: typeData.list })
    }
  };

  getData = async () => {
    const { setCommon, pageNum, pageSize, searchData } = this.props.store;
    const { companyId } = getLoginInfo();
    setCommon('tableLoading', true);
    const { code, data } = await GoodsCenterService.CompanyMealList.selectAll({ pageNum, pageSize, ...searchData, companyId, goodsGenre: 2, parentPutOn: 1, });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      return;
    }
    if (data) {
      setCommon('tableData', data.list);
      setCommon('total', data.page.total);
      setCommon('pageNum', data.page.pageNum);
      setCommon('pageSize', data.page.pageSize)
    }
  };

  changeIsPutOne = async (record) => { // 修改公司上下架状态
    const { setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, msg } = await GoodsCenterService.MealList.updateStatus({ hrNo: record.hrNo, list: [{ companyId: record.companyId, isPutOn: record.isPutOn ? 0 : 1}], goodsGenre: 2 });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
  };

  renderAction = (record, index) => {
    const val = record.isPutOn ? '下架' : '上架';
    return(
      <div className="page-wrapper-table-action">
        {!setAction(PATH, 'startStop') ? null :
          <Popconfirm title={`${val}该套餐，则所有售卖门店均${val}，确认${val}？`} placement="left" onConfirm={() => this.changeIsPutOne(record)}>
            <Button size="small" type="primary" ghost={!record.isPutOn}>{val}</Button>
          </Popconfirm>
        }
      </div>
    )
  };

  componentDidMount() {
    this.setOptions();
    this.getData();
  }

  render() {
    const { typeList } = this.state;
    const { tableLoading, tableData, pageNum, pageSize, total } = this.props.store;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'categoriesId') {
          item.render = (text, record) => (record.goodsCategories && record.goodsCategories.name) ? record.goodsCategories.name : '';
          item.options = typeList;
          item.defaultProps = { label: 'name', value: 'id', children: 'children' }
        } else if (dataIndex === '_actions') {
          item.render = (text, record, index) => this.renderAction(record, index)
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
                      formList={[...columns(), {title: '上下架状态', dataIndex: 'isPutOn', formType: 'radio', options: [{ label: '上架', value: 1 }, { label: '下架', value: 0 }]}]}  />
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
      </div>
    )
  }
}

export default CompanyMealList;
