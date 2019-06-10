import React from 'react'
import { inject, observer } from 'mobx-react'
import { SearchForm } from '../../../components'
import { Table } from 'antd'
import SkuTable from './SkuTable'

const { Column } = Table;

@inject('store')
@observer
class DetailSelect extends React.Component {

  onSearchReset = (type=0, searchData) => { // type 0 重制 1搜索
    if (type) {
      if (searchData.categoriesId && searchData.categoriesId.length !== 0) {
        searchData.categoriesId = searchData.categoriesId[searchData.categoriesId.length - 1]
      }
      this.props.onSearch(searchData)
    } else {
      this.props.onSearch({})
    }
  };

  render() {
    const { goodsTypeList, tableSelectData, tableSelectLoading, selectedInfoRowKeys } = this.props;
    const formSearchList = [
      {title: '商品分类', dataIndex: 'categoriesId', options: goodsTypeList, formType: 'cascader', defaultProps: { label: 'name', value: 'id', children: 'children' }},
      {title: '商品名称', dataIndex: 'name', formType: 'input'}
    ];
    const rowSelection = {
      selectedRowKeys: selectedInfoRowKeys,
      onChange: (keys, selectList) => this.props.onRowSelectChange(keys, selectList),
    };
    return(
      <div>
        <SearchForm showSearch
                    onSubmit={(data) => this.onSearchReset(1, data)}
                    onReset={() => this.onSearchReset(0, null)}
                    formList={formSearchList} />
        <section style={{ marginTop: '20px', maxHeight: '500px', overflowY: 'auto' }}>
          <Table size="small"
                 title={() => <div>共{tableSelectData.length}条</div>}
                 dataSource={tableSelectData}
                 rowKey={record => record.hrNo}
                 pagination={false}
                 expandedRowRender={(record, index) => <SkuTable rowData={record}
                                                                 onSelectRowChange={(keys, index) => this.props.onSelectRowInfoChange(keys, index)}
                                                                 rowIndex={index} />}
                 rowSelection={rowSelection}
                 loading={tableSelectLoading}>
            <Column title="货品名称" dataIndex="name" widht="100px" />
            <Column title="货品编号" dataIndex="hrNo" />
            <Column title="计价单位" dataIndex="priceUnitName" widht="100px" />
            <Column title="货品类别" dataIndex="goodsTypeList" widht="100px" render={(text) => text.map(item => item.name).join(',')} />
          </Table>
        </section>
      </div>
    )
  }
}

export default DetailSelect;
