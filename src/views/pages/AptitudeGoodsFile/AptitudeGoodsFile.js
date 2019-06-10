import React from 'react'
import '../../../assets/style/common/pageItem.less'
import { Bread, SearchForm } from '../../../components'
import {getLoginInfo, setAction, searchList} from "../../../utils/public";
import { Button, Modal, Table, Pagination, Popconfirm, Divider, Tag, Carousel } from 'antd'
import { inject, observer } from 'mobx-react'
import Columns from './Columns'
import AptitudeGoodsFileBaseFrom from './AptitudeGoodsFileBaseFrom';
import AptitudeCenterService from "../../../service/AptitudeCenterService";
import {SUCCESS_CODE, DATE_FORMAT} from "../../../conf";
import helper from "../../../utils/helper";
import './AptitudeImg.less';

const PATH = 'aptitudeCatalog';
const BREAD_LIST = ['资质目录分类', '货品资质文件'];
const ROUTER_LIST = ['aptitudeCatalog'];

@inject('store')
@observer
class AptitudeGoodsFile extends React.Component {
  constructor(props) {
    super(props);
    const { id, goodsName, goodsCode } = this.props.location.state;
    this.state = {
      rId: id,
      goodsName,
      goodsCode,
      aptitudeClassifyData: [],
      factoryData: [],
      otherModalVisible: false,
      filesUrlArr: []
    }
  };

  getData = async () => {   // 初始化数据
    const { rId } = this.state;
    const { searchData, pageNum, pageSize, setCommon } = this.props.store;
    const params = { ...searchData, pageNum, pageSize, rId };
    setCommon('tableLoading', true);
    const { code, msg, data } = await AptitudeCenterService.AptitudeGoodsFile.listAll(params);
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

  getOption = async () => {
    const { data: aptitudeClassifyData } = await AptitudeCenterService.AptitudeClassify.listAll({pageNum: 1, pageSize: 99999});
    const { data: factoryData } = await AptitudeCenterService.AptitudeGoodsFile.getFactoryList();

    this.setState({
      aptitudeClassifyData: aptitudeClassifyData.list.length ? aptitudeClassifyData.list : [],
      factoryData: factoryData.length ? factoryData : []
    })
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
    const { factoryData } = this.state;
    this.aptitudeGoodsFileBaseFrom.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const filesUrl = this.filesUrl.wrappedInstance.state.filesUrlFileList;
      if (formData.expireDate) {
        formData.expireDate = formData.expireDate.format(DATE_FORMAT);
      }
      if(formData.factoryId) {
        formData.factoryName = searchList(factoryData, 'id', formData.factoryId).factoryName
      }
      if(filesUrl.length) {
        const arr = [];
        filesUrl.forEach(item => {
          if(item.url) {
            arr.push(item.url)
          } else {
            arr.push(item.response.data)
          }
        })
        formData.filesUrl = arr.join(',');
      }
      const params = JSON.parse(JSON.stringify(formData));
      this.addUpdateOne(params)
    })
  };

  addUpdateOne = async (formData) => {   // 新增或修改
    const { setCommon, submitType, tableRowData } = this.props.store;
    const { employee } = getLoginInfo();
    const { rId, goodsName, goodsCode } = this.state;

    const params = {};
    if (submitType) {   // 新增
      params.rId = rId;
      params.goodsName = goodsName;
      params.goodsCode = goodsCode;
      params.createUserId = employee.id;
      params.createUserName = employee.name;
    } else {   // 修改
      params.id = tableRowData.id;
      params.rId = rId;
      // params.goodsName = goodsName;
      // params.goodsCode = goodsCode;
      // params.createUserId = employee.id;
      // params.createUserName = employee.name;
    }

    setCommon('loading', true);
    const { code, msg } = await AptitudeCenterService.AptitudeGoodsFile[submitType ? 'addOne' : 'updateOne']({...params, ...formData});
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
    const { code, msg } = await AptitudeCenterService.AptitudeGoodsFile.delete({ id: formData.id });
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
      </div>
    )
  };

  componentDidMount() {
    this.getData();
    this.getOption();
  }

  render() {
    const { aptitudeClassifyData, factoryData, otherModalVisible, filesUrlArr } = this.state;
    const { tableData, pageNum, pageSize, total, tableLoading, setCommon, modalVisible, submitType, loading } = this.props.store;
    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if(dataIndex === 'serialNumber') {
          item.render = (text, record, index) => `${index+1}`;
        } else if (dataIndex === 'filesUrl') {
          item.render = (text, record, index) => <Tag color="magenta" 
                                                      onClick={() => this.setState({filesUrlArr: record.filesUrl.split(','), otherModalVisible: true})}>
                                                      查看
                                                 </Tag>;
        } else if (dataIndex === 'certificateType') {
          item.options = aptitudeClassifyData;
          item.defaultProps = { label: 'typeName', value: 'id' };
          item.render = (text, record, index) => {return searchList(aptitudeClassifyData, 'id', record.certificateType).typeName};
        } else if (dataIndex === 'factoryId') {
          item.render = (text, record, index) => {return searchList(factoryData, 'id', record.factoryId).factoryName};
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
            {setAction(PATH, 'add') ? <Button type="primary" onClick={this.showModal.bind(this, true, null, null)}>添加资质文件</Button> : null}
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

        <Modal title={`${submitType ? '新增' : '编辑'}资质文件`}
               confirmLoading={loading}
               visible={modalVisible}
               destroyOnClose
               onOk={this.handleSubmit}
               onCancel={() => {
                 setCommon('tableRowData', {});
                 setCommon('modalVisible', false)
               }}>
          <AptitudeGoodsFileBaseFrom 
            aptitudeClassifyData={aptitudeClassifyData}
            factoryData={factoryData}
            wrappedComponentRef={el => this.filesUrl = el} 
            ref={el => this.aptitudeGoodsFileBaseFrom = el} />
        </Modal>

        <Modal title="附件"
               visible={otherModalVisible}
               destroyOnClose
               onOk={() => this.setState({filesUrlArr: [], otherModalVisible: false})}
               onCancel={() => this.setState({filesUrlArr: [], otherModalVisible: false})}>
          {filesUrlArr && filesUrlArr.length ?
            <div className="aptitude-img">
              <Carousel>
                {filesUrlArr.map(src => <img src={src} style={{ width: '100%' }} alt="资质图片" onClick={() => window.open(src)} />)}
              </Carousel>
            </div>
            : null}
        </Modal>
      </div>
    )
  }
}

export default AptitudeGoodsFile;
