import React from 'react'
import '../../../assets/style/common/pageItem.less'
import { Bread } from '../../../components'
import {getLoginInfo, searchList, setAction} from "../../../utils/public";
import { Button, Modal, Input } from 'antd'
import { inject, observer } from 'mobx-react'
import PackageTypeBaseForm from './PackageTypeBaseForm'
import PackageTypeTree from './PackageTypeTree'
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

const PATH = 'packageType';
const dataList = [];
const generateList = (data) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    dataList.push(node);
    if (node.children) {
      generateList(node.children)
    }
  }
};
const getParentKey = (id, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.id === id)) {
        parentKey = node.id;
      } else if (getParentKey(id, node.children)) {
        parentKey = getParentKey(id, node.children);
      }
    }
  }
  return parentKey;
};

@inject('store')
@observer
class PackageType extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true
    };
  }

  onChange = (e) => {
    const value = e.target.value;
    const { tableData } = this.props.store;
    const expandedKeys = dataList.map((item) => {
      if (item.name.indexOf(value) > -1) {
        return getParentKey(item.id, tableData);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  showModal = () => {
    const { setCommon } = this.props.store;
    setCommon('submitType', true);
    setCommon('tableRowData', {parentId: 0});
    setCommon('modalVisible', true)
  };

  handleSubmit = () => {
    this.goodsTypeBaseForm.validateFields((err, formData) => {
      if (err) {
        return;
      }
      this.addUpdateType(formData)
    })
  };

  addUpdateType = async (formData) => {
    const { submitType, tableRowData, setCommon } = this.props.store;
    setCommon('loading', true);
    const { code, msg } = await GoodsCenterService.GoodsType[submitType ? 'addOne' : 'updateOne']({
      id: submitType ? undefined : tableRowData.id,
      parentId: tableRowData.parentId,
      ...formData,
    });
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    this.getData();
    helper.S();
    setCommon('modalVisible', false);
    setCommon('tableRowData', {});
  };

  handleDeleteType = async (formData) => { // 删除
    if (!formData.id) {
      return;
    }
    const { code, msg } = await GoodsCenterService.GoodsType.updateOne({ id: formData.id, hidden: 0 });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    this.getData();
    helper.S();
  };

  getData = async () => {
    const { setCommon } = this.props.store;
    setCommon('tableLoading', true);

    const {code, data} = await GoodsCenterService.GoodsType.listAll({ parentId: 0 });
    setCommon('tableLoading', false);
    if (code !== SUCCESS_CODE) {
      return;
    }
    if (data && data.list && Array.isArray(data.list)) {
      setCommon('tableData', data.list);
      generateList(data.list);
    }
  };

  componentDidMount() {
    this.getData()
  }

  render() {
    const { setCommon, modalVisible, submitType, loading } = this.props.store;
    const { expandedKeys, autoExpandParent, searchValue } = this.state;
    return(
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={['货品分类']} />
          <div className="page-wrapper-bread-txt">
            {searchList(getLoginInfo().modules || [], 'path', PATH).subName || ''}
          </div>
        </div>

        <div className="page-wrapper-search">
          {setAction(PATH, 'search') ? <Input.Search style={{ width: '260px', marginRight: '40px' }} placeholder="货品分类名称搜索" onChange={this.onChange} /> : null}
          {setAction(PATH, 'add') ? <Button type="primary" onClick={this.showModal}>新建新货品分类</Button> : null}
        </div>

        <div className="page-wrapper-content">
          <PackageTypeTree expandedKeys={expandedKeys}
                         searchValue={searchValue}
                         autoExpandParent={autoExpandParent}
                         handleDelete={(data) => this.handleDeleteType(data)}
                         onExpand={(expandedKeys) => this.setState({expandedKeys, autoExpandParent: false})} />
        </div>

        <Modal title={`${submitType ? '新增' : '编辑'}货品分类`}
               confirmLoading={loading}
               visible={modalVisible}
               destroyOnClose
               onOk={this.handleSubmit}
               onCancel={() => {
                 setCommon('tableRowData', {});
                 setCommon('modalVisible', false)
               }}>
          <PackageTypeBaseForm ref={el => this.goodsTypeBaseForm = el} />
        </Modal>
      </div>
    )
  }
}

export default PackageType;
