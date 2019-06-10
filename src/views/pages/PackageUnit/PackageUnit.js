import React from 'react'
import '../../../assets/style/common/pageItem.less'
import { Bread, SearchForm } from '../../../components'
import {getLoginInfo, searchList, setAction} from "../../../utils/public";
import { Button, Modal, Table, Pagination, Divider, Popconfirm } from 'antd'
import { inject, observer } from 'mobx-react'
import Columns from './Columns'
import PackageUnitBaseForm from './PackageUnitBaseForm'
import GoodsCenterService from "../../../service/GoodsCenterService";
import helper from "../../../utils/helper";
import {SUCCESS_CODE} from "../../../conf";

const PATH = 'packageUnit';

@inject('store')
@observer
class PackageUnit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unitList: []
    }
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
      setCommon('searchData', searchData);
    } else {
      setCommon('searchData', {});
    }

    this.getData();
  };

  showModal = (submitType, formData, index, e) => {
    e.stopPropagation();

    const { setCommon } = this.props.store;

    setCommon('submitType', submitType);

    if (formData) {
      setCommon('tableRowData', formData);
    }

    if (!submitType) {
      setCommon('editIndex', index);
    }

    setCommon('modalVisible', true);
  };

  handleSubmit = () => {
    this.packageUnitBaseForm.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = JSON.parse(JSON.stringify(formData));
      this.addUpdatePack(params);
    })
  };

  addUpdatePack = async (formData) => {
    const { setCommon, submitType, tableRowData } = this.props.store;
    const { unitList } = this.state;
    setCommon('loading', true);
    const params = {};
    if (submitType) {
      const goodsPackingUnitList = [];
      formData.nameIdList.forEach(item => {
        if (item) {
          goodsPackingUnitList.push({
            firstBaseUnitId: item[0],
            firstBaseUnitName: searchList(unitList, 'id', item[0]).name || undefined,
            secondBaseUnitId: item[1],
            secondBaseUnitName: searchList(unitList, 'id', item[1]).name || undefined,
            name: `${searchList(unitList, 'id', item[0]).name || undefined}/${searchList(unitList, 'id', item[1]).name || undefined}`
          })
        }
      });
      params.goodsPackingUnitList = JSON.stringify(goodsPackingUnitList);
    } else {
      const item = formData.nameId;
      params.firstBaseUnitId = item[0];
      params.firstBaseUnitName = searchList(unitList, 'id', item[0]).name || undefined;
      params.secondBaseUnitId = item[1];
      params.secondBaseUnitName = searchList(unitList, 'id', item[1]).name || undefined;
      params.id = tableRowData.id;
      params.name = `${searchList(unitList, 'id', item[0]).name || undefined}/${searchList(unitList, 'id', item[1]).name || undefined}`
    }
    const { code, msg } = await GoodsCenterService.PackageUnit[submitType ? 'addOne' : 'updateOne'](params);
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    setCommon('modalVisible', false);
    setCommon('tableRowData', {});
    helper.S();
    this.getData();
  };

  handleDelete = async (formData) => {
    const { code, msg } = await GoodsCenterService.PackageUnit.updateOne({ id: formData.id, hidden: 0 });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
  };

  setOptions = async () => {
    const { data:unitData } = await GoodsCenterService.GoodsUnit.selectAll({ pageSize: 99999 });
    if (unitData && unitData.list) {
      this.setState({ unitList: unitData.list })
    }
  };

  getData = async () => {
    const { searchData, pageNum, pageSize, setCommon } = this.props.store;
    setCommon('tableLoading', true);
    const { code, msg, data } = await GoodsCenterService.PackageUnit.selectAll({ ...searchData, pageNum, pageSize });
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
        {setAction(PATH, 'update') ? <Button size="small" type="primary" onClick={this.showModal.bind(this, false, record, index)}>编辑</Button> : null}
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

  componentDidMount() {
    this.setOptions();
    this.getData()
  }

  render() {
    const { tableData, pageNum, pageSize, total, tableLoading, setCommon, modalVisible, submitType, loading } = this.props.store;
    const { unitList } = this.state;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if (dataIndex === 'actions') {
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
            {searchList(getLoginInfo().modules || [], 'path', PATH).subName || ''}
          </div>
        </div>

        <div className="page-wrapper-search">
          <SearchForm formList={columns()}
                      showSearch={setAction(PATH, 'search')}
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
            {setAction(PATH, 'add') ? <Button type="primary" onClick={this.showModal.bind(this, true, null, null)}>新建包装规格单位</Button> : null}
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

        <Modal title={`${submitType ? '新增' : '编辑'}包装规格单位`}
               confirmLoading={loading}
               visible={modalVisible}
               destroyOnClose
               onOk={this.handleSubmit}
               onCancel={() => {
                 setCommon('tableRowData', {});
                 setCommon('modalVisible', false)
               }}>
          <PackageUnitBaseForm unitList={unitList} ref={el => this.packageUnitBaseForm = el} />
        </Modal>
      </div>
    )
  }
}

export default PackageUnit;
