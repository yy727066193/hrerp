import React from 'react'
import { Tree, Button, Spin, Popconfirm } from 'antd'
import { setAction } from '../../../utils/public'
import { inject, observer } from 'mobx-react'

const { TreeNode } = Tree;
const PATH = 'goodsType';

@inject('store')
@observer
class GoodsTypeTree extends React.Component {

  showModal = (submitType, item) => {
    const { setCommon } = this.props.store;
    setCommon('submitType', submitType);
    if (submitType) {
      setCommon('tableRowData', { parentId: item.id, parentName: item.name });
    } else {
      const params = JSON.parse(JSON.stringify(item));
      params.sortId = params.sortId + '';
      setCommon('tableRowData', params)
    }
    setCommon('modalVisible', true);
  };

  renderTitle = (title, item) => {
    return(
      <div className="clearfix" style={{ width: '100%' }}>
        <div className="fl">{title}</div>
        <div className="fr" style={{ paddingLeft: '40px' }}>
          {!setAction(PATH, 'add') ? null :  <Button size="small" type="primary" onClick={() => this.showModal(true, item)}>新增子分类</Button>}
          {!setAction(PATH, 'update') ? null : <Button size="small" type="primary" ghost style={{ marginLeft: '10px' }} onClick={() => this.showModal(false, item)}>编辑</Button>}
          {!setAction(PATH, 'delete') || item.children ? null :
            <Popconfirm title="确认执行吗" placement="right" onConfirm={() => this.props.handleDelete(item)}>
              <Button size="small" type="danger" ghost style={{ marginLeft: '10px' }}>删除</Button>
            </Popconfirm>
          }
        </div>
      </div>
    )
  };

  render() {
    const { tableData, tableLoading } = this.props.store;
    const { expandedKeys, autoExpandParent, searchValue } = this.props;
    const loop = data => data.map((item, i) => {
      const index = item.name.indexOf(searchValue);
      const beforeStr = item.name.substr(0, index);
      const afterStr = item.name.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : item.name;
      if (item.children) {
        return(
          <TreeNode key={item.id} title={this.renderTitle(title, item)}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={this.renderTitle(title, item)} />
    });
    return(
      <div>
        <Spin spinning={tableLoading}>
          <Tree showLine onExpand={this.props.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}>
            {loop(tableData)}
          </Tree>
        </Spin>
      </div>
    )
  }
}

export default GoodsTypeTree;
