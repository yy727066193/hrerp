import React from 'react'
import {inject, observer} from 'mobx-react'
import { Input, Select, Form, Steps, Collapse, Divider, Cascader, Upload, Button, Icon, Modal, InputNumber } from 'antd'
import api from '../../../service/api'
import helper from '../../../utils/helper';
import { IMG_SIZE, VIDEO_SIZE } from '../../../conf/index';
import {searchList} from "../../../utils/public";
import { validChar } from '../../../utils/RegExps';

const Panel = Collapse.Panel;
const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  },
  name: {key: 'name', label: '套餐名称',
    config: {
      rules: [
        { required: true, message: '请输入套餐名称' }, 
        { max: 80, message: '不能超过80位' },
        { pattern: validChar, message: '请勿输入特殊字符' }
    ]
    }
  },
  categoriesId: {key: 'categoriesId', label: '套餐分类',
    config: {
      rules: [{ required: true, message: '请选择套餐分类' }]
    }
  },
  priceUnitId: {key: 'priceUnitId', label: '计价单位',
    config: {
      rules: [{ required: true, message: '请选择计价单位' }]
    }
  },
  initPrice: {
    key: 'initPrice', 
    label: '初始价(元)',
    config: {
      rules: [{ required: false, message: '请输入初始价' }]
    }
  },

  shortName: {label: '短名称', key: 'shortName',
    config: {
      rules: [
        { required: false, message: '请输入端名称' }, 
        {max: 10, message: '不能超过10位'}
      ]
    }
  },
  marketPrice: {label: '市场价(元)', key: 'marketPrice',
    config: {
      rules: [
        { required: false, message: '请输入市场价' }
      ]
    }
  },
  helpCode: {label: '助记码', key: 'helpCode',
    config: {
      rules: [
        { required: false, message: '请输入助记码' }, 
        { max: 50, message: '不能超过50位' }
      ]
    }
  },
  goodsKeywordsList: {key: 'goodsKeywordsList', label: '套餐标签',
    config: {
      rules: [{ required: false, message: '请选择套餐标签' }]
    }
  },

  sortId: {key: 'sortId', label: '终端排序',
    config: {
      rules: [{ required: false, message: '请输入终端排序' }]
    }
  },
  mainImgs: {key: 'mainImgs', label: '套餐图片'},
  videos: {key: 'videos', label: '套餐视频'},
  description: {key: 'description', label: '套餐描述',
    config: {
      rules: [{ required: false, message: '请输入套餐描述' }, { max: 300, message: '不能超过300位' }]
    }
  },
  detailImgs: {key: 'detailImgs', label: '套餐详情图'}
};

const generateData = (list) => { // 套餐分类数据扁平化
  let data = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    data.push(item);
    if (item.children && Array.isArray(item.children)) {
      data = [...data, ...generateData(item.children)];
    }
  }

  return data;
};
const searchTypeIdArr = (id, list) => { // 根据子查父
  let data = [];
  if (!id) {
    return data;
  }
  if (data.indexOf(id) === -1) {
    data.unshift(id)
  }
  const findId = searchList(list, 'id', id).parentId;
  if (findId) {
    data = [...searchTypeIdArr(findId, list), ...data]
  }
  return data;
};

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mainImgList: [],
      detailImgList: [],
      videoList: [],
      keyArr: [['shortName', 'helpCode', 'marketPrice'], ['sortId', 'description']],
      previewImage: '',
      previewVisible: false
    };
  }

  setFormData = () => {
    const { form, typeList } = this.props;
    const { tableRowData } = this.props.store;
    const { keyArr } = this.state;

    Object.keys(tableRowData).forEach(key => {
      if (formMap.hasOwnProperty(key)) {
        const field = {};
        if (tableRowData[key] || tableRowData[key] === 0) {
          if (key === 'categoriesId') {
            field[key] = searchTypeIdArr(tableRowData[key], generateData(typeList))
          } else if (key === 'initPrice') {
            field[key] = tableRowData[key] / 100;
          } else if (key === 'goodsKeywordsList') {
            const arr = [];
            tableRowData[key].forEach(item => arr.push(item.id));
            field[key] = arr;
          } else {
            field[key] = tableRowData[key]
          }
        }
        form.setFieldsValue(field)
      }
    });

    const formDataCenter = tableRowData.goodsExtendedAttribute;
    const formDataBottom = tableRowData.goodsPresentation;
    const field = {};
    if (formDataCenter) {
      keyArr[0].forEach(key => {
        if (formDataCenter[key] || formDataCenter[key] === 0) {
          if (key === 'marketPrice') {
            field[key] = formDataCenter[key] / 100
          } else {
            field[key] = formDataCenter[key]
          }
        }
      });
    }
    if (formDataBottom) {
      keyArr[1].forEach(key => {
        if (formDataBottom[key] || formDataBottom[key] === 0) {
          field[key] = formDataBottom[key]
        }
      });
      if (formDataBottom.mainImgs) {
        const mainImgList = [];
        formDataBottom.mainImgs.split(',').map((item, index) => mainImgList.push({uid: index, status: 'down', url: item}));
        this.setState({ mainImgList });
      }
      if (formDataBottom.detailImgs) {
        const detailImgList = [];
        formDataBottom.detailImgs.split(',').map((item, index) => detailImgList.push({uid: index, status: 'down', url: item}));
        this.setState({ detailImgList });
      }
      if (formDataBottom.videos) {
        const videoList = [];
        formDataBottom.videos.split(',').map((item, index) => videoList.push({uid: index, status: 'down', url: item, name: '套餐视频'}));
        this.setState({ videoList });
      }
    }
    form.setFieldsValue(field)
  };

  handleChangeMainImgs = (e) => {
    if(e.file.status) {
      this.setState({ mainImgList: e.fileList });
    }
  };

  handleChangeVideos = (e) => {
    if(e.file.status) {
      this.setState({ videoList: e.fileList });
    }
  };

  handleChangeDetailImg = (e) => {
    if(e.file.status) {
      this.setState({ detailImgList: e.fileList });
    }
  };

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  beforeUpload = (maxSize, file) => {
    if (file.size/1024 <= maxSize) {
      return true;
    } else {
      helper.W('上传文件过大');
      return false;
    }
  };

  getImgUrl = (list) => {
    const arr = [];
    list.forEach(item => {
      if (item.url){
        arr.push(item.url)
      } else {
        if (item.response.data) {
          arr.push(item.response.data)
        }
      }
    });
    return arr.join(',')
  };

  formatData = (formData) => {
    const { unitList, goodsKeyList } = this.props;
    const { keyArr, mainImgList, detailImgList, videoList } = this.state;
    const params = JSON.parse(JSON.stringify(formData));
    params.categoriesId = params.categoriesId[params.categoriesId.length - 1];
    params.exchangeIntegral = 1;
    params.priceUnitName = searchList(unitList, 'id', params.priceUnitId).name || '';
    if (params.initPrice) {
      params.initPrice = params.initPrice * 100;
    }
    if (params.marketPrice) {
      params.marketPrice = params.marketPrice * 100;
    }
    if (params.goodsKeywordsList) {
      const arr = [];
      params.goodsKeywordsList.forEach(val => arr.push(searchList(goodsKeyList, 'id', val)));
      params.goodsKeywordsList = arr;
    }
    params.goodsExtendedAttribute = {};
    params.goodsPresentation = {};
    keyArr[0].forEach(key => {
      if (params[key]) {
        params.goodsExtendedAttribute[key] = params[key];
        params[key] = undefined;
      }
    });
    keyArr[1].forEach(key => {
      if (params[key]) {
        params.goodsPresentation[key] = params[key];
        params[key] = undefined;
      }
    });

    mainImgList.length !== 0 ? params.goodsPresentation.mainImgs = this.getImgUrl(mainImgList) : params.goodsPresentation.mainImgs = '';
    detailImgList.length !== 0 ? params.goodsPresentation.detailImgs = this.getImgUrl(detailImgList) : params.goodsPresentation.detailImgs = '';
    videoList.length !== 0 ? params.goodsPresentation.videos = this.getImgUrl(videoList) : params.goodsPresentation.videos = '';

    params.mainImgs = undefined;
    params.detailImgs = undefined;
    params.videos = undefined;

    return params;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { submitType, tableRowData } = this.props.store;
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      if (this.props.onSubmit) {
        this.props.onSubmit({ id: submitType ? undefined : tableRowData.id || undefined,
          hrNo: submitType ? undefined : tableRowData.hrNo || undefined,...this.formatData(values) })
      }
    });
  };

  componentDidMount() {
    this.setFormData()
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { stepList, typeList, unitList, goodsKeyList } = this.props;
    const { loading } = this.props.store;
    const { mainImgList, previewImage, previewVisible, detailImgList, videoList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">点击上传</div>
      </div>
    );

    return(
      <div>
        <Steps>
          {stepList.map(item => <Steps.Step title={item.title} key={item.title} />)}
        </Steps>
        <Divider />
        <Form layout={formMap.layout} onSubmit={this.handleSubmit}>
          <Collapse defaultActiveKey={['1']} forceRender>
            <Panel header="基础信息" key="1" disabled>
              <Form.Item label={formMap.name.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.name.key, formMap.name.config)(
                  <Input placeholder={formMap.name.config.rules[0].message} />
                )}
              </Form.Item>
              <Form.Item label={formMap.categoriesId.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.categoriesId.key, formMap.categoriesId.config)(
                  <Cascader options={typeList}
                            showSearch
                            placeholder={formMap.categoriesId.config.rules[0].message}
                            changeOnSelect
                            fieldNames={{ label: 'name', value: 'id', children: 'children' }} />
                )}
              </Form.Item>
              <Form.Item label={formMap.priceUnitId.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.priceUnitId.key, formMap.priceUnitId.config)(
                  <Select optionFilterProp="children"  
                          placeholder={formMap.priceUnitId.config.rules[0].message}
                          showSearch>
                    {unitList.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>)}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label={formMap.initPrice.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.initPrice.key)(
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }} 
                    allowClear 
                    placeholder={formMap.initPrice.config.rules[0].message}/>
                )}
              </Form.Item>
            </Panel>
            <Panel key="2" header="扩展属性">
              <Form.Item label={formMap.shortName.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.shortName.key, formMap.shortName.config)(
                  <Input placeholder={formMap.shortName.config.rules[0].message} />
                )}
              </Form.Item>
              <Form.Item label={formMap.helpCode.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.helpCode.key, formMap.helpCode.config)(
                  <Input placeholder={formMap.helpCode.config.rules[0].message} />
                )}
              </Form.Item>
              <Form.Item label={formMap.marketPrice.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.marketPrice.key, formMap.marketPrice.config)(
                  <InputNumber min={0} 
                               style={{ width: '100%' }} 
                               placeholder={formMap.marketPrice.config.rules[0].message}
                               allowClear />
                )}
              </Form.Item>
              <Form.Item label={formMap.goodsKeywordsList.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.goodsKeywordsList.key, formMap.goodsKeywordsList.config)(
                  <Select optionFilterProp="children" 
                          placeholder={formMap.goodsKeywordsList.config.rules[0].message}
                          showSearch mode="multiple">
                    {goodsKeyList.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>)}
                  </Select>
                )}
              </Form.Item>
            </Panel>
            <Panel key="3" header="展示信息">
              <Form.Item label={formMap.sortId.label} {...formMap.formItemLayout}>
                {getFieldDecorator(formMap.sortId.key, formMap.sortId.config)(
                  <InputNumber min={0} 
                               style={{ width: '100%' }} 
                               placeholder={formMap.sortId.config.rules[0].message}
                               allowClear />
                )}
              </Form.Item>
              <Form.Item label={formMap.mainImgs.label} {...formMap.formItemLayout}>
                {getFieldDecorator(formMap.mainImgs.key)(
                  <Upload action={api.Upload}
                          beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                          onChange={this.handleChangeMainImgs}
                          fileList={mainImgList}
                          accept="image/*"
                          onPreview={this.handlePreview}
                          listType="picture-card">
                    {mainImgList.length >= 5 ? null : uploadButton}
                  </Upload>
                )}
              </Form.Item>
              <Form.Item label={formMap.videos.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.videos.key)(
                  <Upload action={api.Upload}
                          fileList={videoList}
                          beforeUpload={this.beforeUpload.bind(this, VIDEO_SIZE)}
                          onChange={this.handleChangeVideos}
                          onRemove={() => this.setState({ videoList: [] })}
                          accept="video/*">
                    <Button><Icon type="upload" />点击上传</Button>
                  </Upload>
                )}
                {videoList.length === 0 ? null :
                  <div style={{ width: '100%' }}>
                    <Divider />
                    <video controls="controls"
                           src={videoList[0].url ? videoList[0].url : (videoList[0].status === 'done' ? videoList[0].response.data || '' : '')}
                           style={{ width: '100%', maxHeight: '300px' }}>
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                }
              </Form.Item>
              <Form.Item label={formMap.description.label} { ...formMap.formItemLayout }>
                {getFieldDecorator(formMap.description.key, formMap.description.config)(
                  <Input.TextArea placeholder={formMap.description.config.rules[0].message} />
                )}
              </Form.Item>
              <Form.Item label={formMap.detailImgs.label} {...formMap.formItemLayout}>
                {getFieldDecorator(formMap.detailImgs.key)(
                  <Upload action={api.Upload}
                          beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                          onChange={this.handleChangeDetailImg}
                          fileList={detailImgList}
                          accept="image/*"
                          onPreview={this.handlePreview}
                          listType="picture-card">
                    {mainImgList.length >= 10 ? null : uploadButton}
                  </Upload>
                )}
              </Form.Item>
            </Panel>
          </Collapse>
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
          </div>
        </Form>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
};

const MealListBaseForm = Form.create()(BaseForm);

export default MealListBaseForm;
