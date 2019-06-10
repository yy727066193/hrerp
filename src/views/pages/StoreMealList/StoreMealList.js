import React from 'react'
import { Bread, SearchForm } from '../../../components'
import '../../../assets/style/common/pageItem.less'
import {getLoginInfo, searchList, setAction} from "../../../utils/public";
import { inject, observer } from 'mobx-react'
import { Table, Pagination } from 'antd'
import Columns from './Columns.js'
import GoodsCenterService from "../../../service/GoodsCenterService";
import BaseCenterService from "../../../service/BaseCenterService";
import {SUCCESS_CODE} from "../../../conf";

const PATH = 'storeMealList';

@inject('store')
@observer
class StoreMealList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      typeList: [],
      storeList: []
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
    const { subordinateStoreIds } = getLoginInfo();
    const { data: typeData } = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 2, pageSize: 999999 });
    const { data: storeList } = await BaseCenterService.Store.listAll({ subordinateStoreIds });
    if (typeData) {
      this.setState({ typeList: typeData.list })

    }
    if (storeList) {
      this.setState({ storeList })
    }
  };

  getData = async () => {
    const { setCommon, pageNum, pageSize, searchData, total } = this.props.store;
    setCommon('tableLoading', true);
    const { code,data} = await GoodsCenterService.StoreMealList.selectAll({ pageNum, pageSize, ...searchData, goodsGenre: 2, judgeStoreBlank: 1 });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      return;
    }
    if (data && data.list.length) {
      const { list, page } = data;
      setCommon('pageNum', page.pageNum);
      setCommon('pageSize', page.pageSize);
      setCommon('total', page.total);
      setCommon('tableData', list);
    } else {
      setCommon('pageNum', pageNum);
      setCommon('pageSize', pageSize);
      setCommon('total', total);
      setCommon('tableData', []);
    }
  };

  componentDidMount() {
    this.setOptions();
  }

  render() {
    const { typeList, storeList } = this.state;
    const { tableLoading, tableData, pageNum, pageSize, total } = this.props.store;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'categoriesId') {
          item.render = (text, record) => (record.goodsCategories && record.goodsCategories.name) ? record.goodsCategories.name : '';
          item.options = typeList;
          item.defaultProps = { label: 'name', value: 'id', children: 'children' }
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
                      formList={[...columns(), { title: '门店', dataIndex: 'storeId', formType: 'select', options: storeList, defaultProps: { label: 'name', value: 'id' } }]} />
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

export default StoreMealList;
