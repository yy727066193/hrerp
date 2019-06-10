import React from 'react'
import '../../../assets/style/common/pageItem.less'
import { Bread, SearchForm } from '../../../components'
import {getLoginInfo, setAction} from "../../../utils/public";
import { Button, Modal, Table, Pagination, Popconfirm, Divider } from 'antd'
import { inject, observer } from 'mobx-react'
import Columns from './Columns'
import AptitudeGoodsCatalogBaseFrom from './AptitudeGoodsCatalogBaseFrom';
import AptitudeCenterService from "../../../service/AptitudeCenterService";
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

const PATH = 'aptitudeCatalog';
const BREAD_LIST = ['资质目录分类', '货品资质目录'];
const ROUTER_LIST = ['aptitudeCatalog'];

@inject('store')
@observer
class AptitudeGoodsCatalog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classifyId: this.props.location.state.id,
      goodsData: [],
    }
  };

  getData = async () => {   // 初始化数据
    const { classifyId } = this.state;
    const { companyId } = getLoginInfo();
    const { searchData, pageNum, pageSize, setCommon } = this.props.store;
    const params = { ...searchData, pageNum, pageSize, companyId, classifyId };
    setCommon('tableLoading', true);
    const { code, msg, data } = await AptitudeCenterService.AptitudeGoodsCatalog.listAll(params);
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

  getOption = async () => {   // 下拉的商品数据
    const { data: goodsData } = await GoodsCenterService.PreviewVisibleList.getParentListAll();

    this.setState({goodsData})
  };

  onSearchReset = (type=1, searchData) => {   // 搜索
    const { setCommon } = this.props.store;
    if (type) {
      setCommon('searchData', searchData);
    } else {
      setCommon('searchData', {});
    }

    this.getData();
  };

  pageChange = (type=0, num) => {   // 分页
    const { setCommon } = this.props.store;
    if (type) {
      setCommon('pageNum', 1);
      setCommon('pageSize', num);
    } else {
      setCommon('pageNum', num);
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

  handleSubmit = () => {   // 提交新增或修改数据
    this.aptitudeGoodsCatalogBaseFrom.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = JSON.parse(JSON.stringify(formData));
      this.addUpdateOne(params)
    })
  };

  addUpdateOne = async (formData) => {   // 新增或修改
    const { setCommon, submitType, tableRowData } = this.props.store;
    const { employee } = getLoginInfo();
    const { classifyId, goodsData } = this.state;

    const params = {};
    if (submitType) {   // 新增
      goodsData.forEach(item => {
        if(item.k3No === formData.goodsName) {
          params.goodsName = item.name
        }
      })
      params.goodsCode = formData.goodsCode;
      params.createUserId = employee.id;
      params.createUserName = employee.name;
      params.classifyId = classifyId;
    } else {   // 修改
      goodsData.forEach(item => {
        if(item.k3No === formData.goodsName) {
          params.goodsName = item.name
        }
      })
      params.goodsCode = formData.goodsCode;
      params.id = tableRowData.id;
    }

    setCommon('loading', true);
    const { code, msg } = await AptitudeCenterService.AptitudeGoodsCatalog[submitType ? 'addOne' : 'updateOne'](params);
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    setCommon('modalVisible', false);
    setCommon('tableRowData', {});
    this.getData();
  };

  handleDelete = async (formData) => {   // 删除
    const { code, msg } = await AptitudeCenterService.AptitudeGoodsCatalog.delete({ id: formData.id });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    this.getData();
  };

  renderAction = (text, record, index) => {   // 操作渲染
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
        {
          !setAction(PATH, 'goodsAptitude') ? null :
            [
              <Divider type="vertical" />,
              <Button 
                size="small" 
                type="primary" 
                onClick={() => this.props.history.push({ pathname: '/aptitudeGoodsFile', 
                                                         state: {id: record.id, goodsName: record.goodsName, goodsCode: record.goodsCode}
                                                      })}>
                货品资质文件
              </Button>
            ]
        }
      </div>
    )
  };

  componentDidMount() {
    this.getData();
    this.getOption();
  }

  render() {
    const { goodsData } = this.state;
    const { tableData, pageNum, pageSize, total, tableLoading, setCommon, modalVisible, submitType, loading } = this.props.store;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if(dataIndex === 'serialNumber') {
          item.render = (text, record, index) => `${index+1}`;
        } else if (dataIndex === 'actions') {
          item.render = (text, record, index) => this.renderAction(text, record, index);
        }
        arr.push(item);
      });

      return arr;
    };
    return(
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={BREAD_LIST} routerList={ROUTER_LIST} history={this.props.history} />
        </div>

        <div className="page-wrapper-search">
          <SearchForm formList={columns()} showSearch={setAction(PATH, 'search')}
                      onSubmit={(data) => this.onSearchReset(1, data)}
                      onReset={() => this.onSearchReset(0, null)}>
            {setAction(PATH, 'add') ? <Button type="primary" onClick={this.showModal.bind(this, true, null, null)}>添加货品目录</Button> : null}
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

        <Modal title={`${submitType ? '新增' : '编辑'}分类`}
               confirmLoading={loading}
               visible={modalVisible}
               destroyOnClose
               onOk={this.handleSubmit}
               onCancel={() => {
                 setCommon('tableRowData', {});
                 setCommon('modalVisible', false)
               }}>
          <AptitudeGoodsCatalogBaseFrom goodsData={goodsData} ref={el => this.aptitudeGoodsCatalogBaseFrom = el} />
        </Modal>
      </div>
    )
  }
}

export default AptitudeGoodsCatalog;
