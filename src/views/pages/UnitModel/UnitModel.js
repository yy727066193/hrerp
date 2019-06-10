import React from 'react'
import { inject, observer } from 'mobx-react'
import { Bread, SearchForm } from '../../../components'
import '../../../assets/style/common/pageItem.less'
import {getLoginInfo, searchList, setAction} from "../../../utils/public";
import Columns from './Columns'
import { Button, Table, Pagination, Popconfirm, Divider, Modal, message } from 'antd'
import {SUCCESS_CODE, SUCCESS_MSG} from "../../../conf";
import GoodsCenterService from "../../../service/GoodsCenterService";
import helper from "../../../utils/helper";
import UnitModelParentBaseForm from './UnitModelParentBaseForm'
import UnitModelSonBaseForm from './UnitModelSonBaseForm'

const PATH = 'unitModel';

@inject('store')
@observer
class UnitModel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      submitTypeParent: false,   // 判断提交类型
      modalVisibleParent: false,   // 父级modal弹框开关
    }
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

  onSearchReset = (type=1, searchData) => {
    const { setCommon } = this.props.store;
    if (type) {
      setCommon('searchData', searchData);
    } else {
      setCommon('searchData', {});
    }

    this.getData();
  };

  showModalParent = (submitTypeParent, formData, index, e) => {
    e.stopPropagation();
    const { setCommon } = this.props.store;
    this.setState({'submitTypeParent': submitTypeParent})
    if (formData) {
      setCommon('tableRowData', formData);
    }
    if (!submitTypeParent) {
      setCommon('editIndex', index);
    }
    this.setState({'modalVisibleParent': true})
  };

  handleSubmit = () => {
    const { submitTypeParent } = this.state;
    const { tableRowData } = this.props.store;
    this.formEl.validateFields((err, formData) => {
      if (err) {
        return;
      }

      this.addUpdateOne({ ...formData, id: submitTypeParent ? undefined : tableRowData.id })
    })
  };

  addUpdateOne = async (formData) => { // 新增 编辑
    const { submitTypeParent } = this.state;
    const { setCommon, addTableData, editIndex, setTableRowData } = this.props.store;

    setCommon('loading', true);
    const { code, msg, data } = await GoodsCenterService.UnitModel[submitTypeParent ? 'addOne' : 'updateOne'](formData);
    setCommon('loading', false);

    if (code !== SUCCESS_CODE) {
      message.error(msg);
      return;
    }

    submitTypeParent ? addTableData(data) : setTableRowData(data, editIndex);

    this.setState({'modalVisibleParent': false})
    setCommon('tableRowData', {});
    message.success(SUCCESS_MSG);
    this.getData();
  };

  handleDelete = async (formData) => {
    const { code, msg } = await GoodsCenterService.UnitModel.updateOne({ id: formData.id, hidden: 0 });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
  };

  getData = async () => {
    const { searchData, pageNum, pageSize, setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, msg, data } = await GoodsCenterService.UnitModel.selectAll({ ...searchData, pageNum, pageSize });
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

  renderAction = (text, record, index) => {
    return(
      <div className="page-wrapper-table-action">
        {setAction(PATH, 'update') ? <Button size="small" type="primary" onClick={this.showModalParent.bind(this, false, record, index)}>编辑规格</Button> : null}
        {
          !setAction(PATH, 'delete') ? null :
            [
              <Divider type="vertical" />,
              <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.handleDelete(record)}>
                <Button size="small" type="danger" ghost>删除</Button>
              </Popconfirm>,
            ]
        }
      </div>
    )
  };

  renderSpuTags = (text, record, index) => {
    return(
      <UnitModelSonBaseForm tableRowList={record}/>
    )
  };

  componentDidMount() {
    this.getData()
  }

  render(){
    const { tableData, pageNum, pageSize, total, tableLoading, setCommon, loading } = this.props.store;
    const { submitTypeParent, modalVisibleParent } = this.state;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'goodsBaseSpuList') {
          item.render = (text, record, index) => this.renderSpuTags(text, record, index)
        } else if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index)
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
            {searchList(getLoginInfo().modules, 'path', PATH).subName || ''}
          </div>
        </div>

        <div className="page-wrapper-search">
          <SearchForm formList={columns()} showSearch={setAction(PATH, 'search')}
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
            {setAction(PATH, 'add') ? <Button type="primary" onClick={this.showModalParent.bind(this, true, null, null)}>新建规格</Button> : null}
          </SearchForm>
        </div>

        <div className="page-wrapper-content">
          <Table dataSource={tableData}
                 size="small"
                 rowKey={record => record.id}
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

        <Modal  title={`${submitTypeParent ? '新增' : '编辑'}规格`}
               confirmLoading={loading}
               onCancel={() => {
                this.setState({'modalVisibleParent': false})
                setCommon('tableRowData', {});
               }}
               onOk={this.handleSubmit}
               destroyOnClose
               visible={modalVisibleParent}>
          <UnitModelParentBaseForm
            ref={el => this.formEl = el}/>
        </Modal>
      </div>
    )
  }
}

export default UnitModel;

