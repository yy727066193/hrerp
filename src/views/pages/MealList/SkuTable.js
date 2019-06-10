import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table } from 'antd'

const { Column } = Table;

@inject('store')
@observer
class SkuTable extends React.Component {
  static defaultProps = {
    isRowSelect: true
  };

  render() {
    const { rowData, rowIndex, isRowSelect } = this.props;
    if (!rowData) {
      return null
    }
    const rowSelection = {
      selectedRowKeys: rowData._selectRowKeys,
      onChange: (keys) => this.props.onSelectRowChange(keys, rowIndex)
    };
    return(
      <section>
        <Table dataSource={rowData.goodsSkuList || []}
               size="small"
               rowKey={record => record.hrNo}
               pagination={false}
               showHeader={false}
               rowSelection={isRowSelect ? rowSelection : undefined}>
          <Column title="子商品名称" dataIndex="name" widht="100px" />
          <Column title="子货品编号" dataIndex="k3No" widht="100px" />
          <Column title="子商品规格" dataIndex="goodsBaseSpuList" render={(text) => text ? text.map(item => item.name).join(',') || '' : ''} />
        </Table>
      </section>
    )
  }
}

export default SkuTable;
