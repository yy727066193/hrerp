import React from 'react';
import {inject, observer} from 'mobx-react'
import { Input, Button, Select, Modal, InputNumber, Form, Collapse, Upload, Icon } from 'antd'
import api from '../../../../service/api'
import helper from '../../../../utils/helper';
import { IMG_SIZE, VIDEO_SIZE } from '../../../../conf/index'

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  },
  // 扩展属性
  shortName: {
    key: 'shortName',
    label: '短名称',
    ruleConfig: {
      rules: [{ required: false, message: '请输入短名称' }]
    }
  },
  helpCode: {
    key: 'helpCode',
    label: '助记码',
    ruleConfig: {
      rules: [{ required: false, message: '请输入助记码' }]
    }
  },
  marketPrice: {
    key: 'marketPrice',
    label: '成本价',
    ruleConfig: {
      rules: [{ required: false, message: '请输入成本价' }]
    }
  },
  costPrice: {
    key: 'costPrice',
    label: '市场价',
    ruleConfig: {
      rules: [{ required: false, message: '请输入市场价' }]
    }
  },
  heavy: {
    key: 'heavy',
    label: '货品重量',
    ruleConfig: {
      rules: [{ required: false, message: '请输入货品重量' }]
    }
  },
  longth: {
    key: 'longth',
    label: '长',
    ruleConfig: {
      initialValue: 0,
      rules: [{ required: false, message: '货品长度' }]
    }
  },
  width: {
    key: 'width',
    label: '宽',
    ruleConfig: {
      initialValue: 0,
      rules: [{ required: false, message: '货品宽度' }]
    }
  },
  height: {
    key: 'height',
    label: '高',
    ruleConfig: {
      initialValue: 0,
      rules: [{ required: false, message: '货品高度' }]
    }
  },
  volume: {
    key: 'volume',
    label: '货品体积',
    ruleConfig: {
      rules: [{ required: false, message: '请输入货品体积' }]
    }
  },
  expirationDate: {
    key: 'expirationDate',
    label: '保质期',
    ruleConfig: {
      rules: [{ required: false, message: '请输入保质期' }]
    }
  },
  expirationDateUnit: {
    key: 'expirationDateUnit',
    label: '保质期单位',
    ruleConfig: {
      rules: [{ required: false, message: '请选择保质期单位' }]
    }
  },
  createArea: {
    key: 'createArea',
    label: '产地',
    ruleConfig: {
      rules: [{ required: false, message: '请输入产地' }]
    }
  },
  goodsKeywordsList: {
    key: 'goodsKeywordsList',
    label: '货品标签',
    ruleConfig: {
      rules: [{ required: false, message: '请选择货品标签' }]
    }
  },

  // 展示信息
  sortId: {
    key: 'sortId',
    label: '终端排序',
    ruleConfig: {
      rules: [{ required: false, message: '请输入排序数值，数值越大越靠前' }]
    }
  },
  mainImgs: {
    key: 'mainImgs',
    label: '货品主图',
  },
  videos: {
    key: 'videos',
    label: '货品视频',
  },
  description: {
    key: 'description',
    label: '货品描述',
    ruleConfig: {
      rules: [
        { required: false, message: '请输入货品描述' },
        { max: 200, message: '输入字符在200字以内' }
      ]
    }
  },
  detailImgs: {
    key: 'detailImgs',
    label: '货品详情图',
  }
};

let heavyUnit = 'kg/件';   // 体重单位
let volumeUnit = 'm³/件';   // 体积单位
let expirationDate = [{id: 1, name: '年'}, {id: 2, name: '月'}, {id: 3, name: '天'}];   // 保质期单位

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainImgsPreviewVisible: false,
      mainImgsPreviewImage: '',
      mainImgsFileList: [],
      mainImgsFileType: '.jpg, .gif, .png',

      videosFileList: [],
      videosFileType: '.mp4, .avi, .mkv',

      detailImgsPreviewVisible: false,
      detailImgsPreviewImage: '',
      detailImgsFileList: [],

      tablePropertyData: this.props.setMarketRowData,
    }
  };

  handleCancelMainImgs = () => this.setState({ mainImgsPreviewImage: false });

  handlePreviewMainImgs = (file) => {
    this.setState({
      mainImgsPreviewImage: file.url || file.thumbUrl,
      mainImgsPreviewVisible: true,
    });
  };

  handleChangeMainImgs = (e) => {
    if(e.file.status) {
      this.setState({ 
        mainImgsFileList: e.fileList 
      });
    }
  };

  hlandChangVideos = (e) => {
    if(e.file.status) {
      this.setState({ 
        videosFileList: e.fileList 
      });
    }
  };

  handleCancelDetailImgs = () => this.setState({ detailImgsPreviewVisible: false });

  handlePreviewDetailImgs = (file) => {
    this.setState({
      detailImgsPreviewImage: file.url || file.thumbUrl,
      detailImgsPreviewVisible: true,
    });
  };

  handleChangeDetailImgs = (e) => {
    if(e.file.status) {
      this.setState({ 
        detailImgsFileList: e.fileList 
      });
    }
  };

  beforeUpload = (maxSize, file) => {
    if (file.size/1024 <= maxSize) {
      return true;
    } else {
      helper.W('上传文件过大');
      return false;
    }
  };

  setFormData = () => {
    const { mainImgsFileList, videosFileList, detailImgsFileList, tablePropertyData } = this.state;
    const { form } = this.props;
    const rowData = this.props.store;
    if(!tablePropertyData || !tablePropertyData.goodsExtendedAttribute) {
      return;
    }
    const tableRowData = JSON.parse(JSON.stringify(tablePropertyData.goodsExtendedAttribute));
    const tableRowDataPresentation = JSON.parse(JSON.stringify(tablePropertyData.goodsPresentation));
    const goodsKeywordsData = rowData.tableRowData.goodsKeywordsList;   // 父级表格数据

    if(!tableRowData) {
      return;
    }
    
    const goodsKeywordsDataArr = [];
    if(goodsKeywordsData) {
      if(goodsKeywordsData.length) {
        goodsKeywordsData.forEach(item => {
          goodsKeywordsDataArr.push(item.id)
        })
      }
    }
    tableRowData['expirationDateUnit'] = 3;   // 编辑保质期默认为天
    tableRowData['goodsKeywordsList'] = goodsKeywordsDataArr;
    tableRowData['marketPrice'] = (tableRowData.marketPrice / 100).toFixed(2);
    tableRowData['costPrice'] = (tableRowData.costPrice / 100).toFixed(2);

    tableRowData['sortId'] = tableRowDataPresentation.sortId;
    tableRowData['description'] = tableRowDataPresentation.description;

    if(tableRowDataPresentation.mainImgs) {
      tableRowDataPresentation.mainImgs.split(',').forEach((item, index) => {
        mainImgsFileList.push({
          uid: 'mainImgsFileList' + index,
          name: 'mainImgsFileList' + index,
          status: 'done',
          url: item
        })
      })
    };

    if(tableRowDataPresentation.detailImgs) {
      tableRowDataPresentation.detailImgs.split(',').forEach((item, index) => {
        detailImgsFileList.push({
          uid: 'detailImgsFileList' + index,
          name: 'detailImgsFileList' + index,
          status: 'done',
          url: item
        })
      })
    };

    if(tableRowDataPresentation.videos) {
      tableRowDataPresentation.videos.split(',').forEach((item, index) => {
        videosFileList.push({
          uid: 'videosFileList' + index,
          name: 'videosFileList' + index,
          status: 'done',
          url: item
        })
      })
    };

    Object.keys(tableRowData).forEach(key => {
      if (formConfig.hasOwnProperty(key)) {
        const field = {};
        if (tableRowData[key] || tableRowData[key] === 0) {
          field[key] = tableRowData[key]
        }
        form.setFieldsValue(field)
      }
    });
  };

  volumeValueChange = (type, value) => {   // 体积中长宽高发生变化时
    const { form } = this.props;
    const { longth, width, height } = form.getFieldsValue(['longth', 'width', 'height']);
    if(type === 1 && value) {
      const volumeNum = value ? value * width * height : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    } else if (type === 2 && value) {
      const volumeNum = value ? longth * value * height : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    } else {
      const volumeNum = value ? longth * width * value : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    }
  };

  componentDidMount() {
    this.setFormData();
  };

  render() {
    const { 
      mainImgsPreviewVisible,
      mainImgsPreviewImage,
      mainImgsFileList,
      mainImgsFileType,
  
      videosFileList,
      videosFileType,

      detailImgsPreviewVisible,
      detailImgsPreviewImage,
      detailImgsFileList } = this.state;
    const { goodsLabelData } = this.props;
    const { tableRowData } = this.props.store;
    const { getFieldDecorator } = this.props.form;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return(
      <div>
        <Form>
          <Collapse>
            <Collapse.Panel className="page-wrapper-form-panel" header="扩展属性" key="4">
              <div className="page-wrapper-form-content">
                <Form.Item label={formConfig.shortName.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.shortName.key, formConfig.shortName.ruleConfig)(
                    <Input 
                    allowClear 
                    placeholder={formConfig.shortName.ruleConfig.rules[0].message}/>
                  )}
                </Form.Item>
                <Form.Item label={formConfig.helpCode.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.helpCode.key, formConfig.helpCode.ruleConfig)(
                    <Input
                    allowClear 
                    placeholder={formConfig.helpCode.ruleConfig.rules[0].message}/>
                  )}
                </Form.Item>
                <Form.Item label={formConfig.marketPrice.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.marketPrice.key, formConfig.marketPrice.ruleConfig)(
                    <InputNumber 
                    min={0}
                    style={{ width: '100%' }}
                    disabled={tableRowData.isUpdate}
                    allowClear 
                    placeholder={formConfig.marketPrice.ruleConfig.rules[0].message}/>
                  )}
                </Form.Item>
                <Form.Item label={formConfig.costPrice.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.costPrice.key, formConfig.costPrice.ruleConfig)(
                    <InputNumber 
                    min={0}
                    style={{ width: '100%' }}
                    disabled={tableRowData.isUpdate}
                    allowClear 
                    placeholder={formConfig.costPrice.ruleConfig.rules[0].message}/>
                  )}
                </Form.Item>
                <Form.Item label={formConfig.heavy.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.heavy.key, formConfig.heavy.ruleConfig)(
                    <InputNumber 
                    min={0}
                    style={{ width: '100%' }}
                    disabled={tableRowData.isUpdate}
                    allowClear 
                    placeholder={formConfig.heavy.ruleConfig.rules[0].message}/>
                  )}
                  <span className="page-wrapper-form-content-unit">{heavyUnit}</span>
                </Form.Item>
                <Form.Item label={formConfig.volume.label} { ...formConfig.formItemLayout }>
                  <Form.Item style={{ width: '21%', 'display': 'inline-block', marginBottom: 0 }}>
                    {getFieldDecorator(formConfig.longth.key, formConfig.longth.ruleConfig)(
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        disabled={tableRowData.isUpdate}
                        allowClear
                        onChange={this.volumeValueChange.bind(this, 1)}
                        placeholder={formConfig.longth.ruleConfig.rules[0].message}/>
                    )}
                  </Form.Item>
                  <span style={{ fontSize: '20px', padding: '0 5px' }}>*</span>
                  <Form.Item style={{ width: '21%', 'display': 'inline-block', marginBottom: 0 }}>
                    {getFieldDecorator(formConfig.width.key, formConfig.width.ruleConfig)(
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        disabled={tableRowData.isUpdate}
                        allowClear
                        onChange={this.volumeValueChange.bind(this, 2)}
                        placeholder={formConfig.width.ruleConfig.rules[0].message}/>
                    )}
                  </Form.Item>
                  <span style={{ fontSize: '20px', padding: '0 5px' }}>*</span>
                  <Form.Item style={{ width: '21%', 'display': 'inline-block', marginBottom: 0 }}>
                    {getFieldDecorator(formConfig.height.key, formConfig.height.ruleConfig)(
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        disabled={tableRowData.isUpdate}
                        allowClear
                        onChange={this.volumeValueChange.bind(this, 3)}
                        placeholder={formConfig.height.ruleConfig.rules[0].message}/>
                    )}
                  </Form.Item>
                  <span style={{ fontSize: '20px', padding: '0 5px' }}>=</span>
                  <Form.Item style={{ width: '21%', 'display': 'inline-block', marginBottom: 0 }}>
                    {getFieldDecorator(formConfig.volume.key, formConfig.volume.ruleConfig)(
                      <InputNumber
                        min={0}
                        disabled
                        precision={2}
                        style={{ width: '100%' }}
                        allowClear
                        placeholder={formConfig.volume.ruleConfig.rules[0].message}/>
                    )}
                  </Form.Item>
                  <span className="page-wrapper-form-content-unit">{volumeUnit}</span>
                </Form.Item>
                <Form.Item label={formConfig.expirationDate.label} { ...formConfig.formItemLayout }>
                  <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>
                    {getFieldDecorator(formConfig.expirationDate.key, formConfig.expirationDate.ruleConfig)(
                      <InputNumber 
                      min={0}
                      style={{ width: '100%' }}
                      disabled={tableRowData.isUpdate}
                      allowClear 
                      placeholder={formConfig.expirationDate.ruleConfig.rules[0].message}/>
                    )}
                  </Form.Item>
                  <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>
                    {getFieldDecorator(formConfig.expirationDateUnit.key, formConfig.expirationDateUnit.ruleConfig)(
                      <Select
                        style={{ width: '100%' }}
                        disabled={tableRowData.isUpdate}
                        placeholder={formConfig.expirationDateUnit.ruleConfig.rules[0].message}
                        showSearch
                        allowClear
                        optionFilterProp="children">
                        {expirationDate.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                      </Select>
                    )}
                  </Form.Item>
                </Form.Item>
                <Form.Item label={formConfig.createArea.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.createArea.key, formConfig.createArea.ruleConfig)(
                    <Input 
                    allowClear 
                    disabled={tableRowData.isUpdate}
                    placeholder={formConfig.createArea.ruleConfig.rules[0].message}/>
                  )}
                </Form.Item>
                <Form.Item label={formConfig.goodsKeywordsList.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.goodsKeywordsList.key, formConfig.goodsKeywordsList.ruleConfig)(
                    <Select
                      style={{ width: '100%' }}
                      placeholder={formConfig.goodsKeywordsList.ruleConfig.rules[0].message}
                      mode="multiple"
                      showSearch
                      allowClear
                      optionFilterProp="children">
                      {goodsLabelData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                    </Select>
                  )}
                </Form.Item>
              </div>
            </Collapse.Panel>

            <Collapse.Panel className="page-wrapper-form-panel" header="展示形象" key="5">
              <div className="page-wrapper-form-content">
                <Form.Item label={formConfig.sortId.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.sortId.key, formConfig.sortId.ruleConfig)(
                    <InputNumber 
                      min={0}
                      style={{ width: '100%' }}
                      allowClear 
                      placeholder={formConfig.sortId.ruleConfig.rules[0].message}/>
                  )}
                </Form.Item>
                <Form.Item label={formConfig.mainImgs.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.mainImgs.key)(
                    <div>
                      <Upload
                        accept={mainImgsFileType}
                        action={api.Upload}
                        listType="picture-card"
                        fileList={mainImgsFileList}
                        beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                        onPreview={this.handlePreviewMainImgs}
                        onChange={this.handleChangeMainImgs}>
                        {mainImgsFileList.length >= 5 ? null : uploadButton}
                      </Upload>
                      <Modal visible={mainImgsPreviewVisible} footer={null} onCancel={this.handleCancelMainImgs}>
                        <img alt="example" style={{ width: '100%' }} src={mainImgsPreviewImage} />
                      </Modal>
                    </div>
                  )}
                  <div>支持多图上传,最多5个,每个图应小于1M，jpg,gif,png格式。</div>
                </Form.Item>
                <Form.Item label={formConfig.videos.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.videos.key)(
                    <Upload 
                      accept={videosFileType}
                      action={api.Upload}
                      fileList={videosFileList}
                      beforeUpload={this.beforeUpload.bind(this, VIDEO_SIZE)}
                      onChange={this.hlandChangVideos}>
                      <Button disabled={videosFileList.length >=1}>
                        <Icon type="upload" /> 上传货品视频
                      </Button>
                    </Upload>
                  )}
                  <div>建议上传格式为mp4的视频，大小不超过20MB。</div>
                </Form.Item>
                <Form.Item label={formConfig.description.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.description.key, formConfig.description.ruleConfig)(
                    <Input.TextArea
                    allowClear 
                    placeholder={formConfig.description.ruleConfig.rules[0].message}/>
                  )}
                </Form.Item>
                <Form.Item label={formConfig.detailImgs.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(formConfig.detailImgs.key)(
                    <div>
                      <Upload
                        accept={mainImgsFileType}
                        action={api.Upload}
                        listType="picture-card"
                        fileList={detailImgsFileList}
                        beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                        onPreview={this.handlePreviewDetailImgs}
                        onChange={this.handleChangeDetailImgs}>
                        {detailImgsFileList.length >= 5 ? null : uploadButton}
                      </Upload>
                      <Modal visible={detailImgsPreviewVisible} footer={null} onCancel={this.handleCancelDetailImgs}>
                        <img alt="example" style={{ width: '100%' }} src={detailImgsPreviewImage} />
                      </Modal>
                    </div>
                  )}
                  <div>支持多图上传,最多5个,每个图应小于1M，jpg,gif,png格式。</div>
                </Form.Item>
              </div>
            </Collapse.Panel>
          </Collapse>
        </Form>
      </div>
    )
  }
}


const extendExhibitionForm = Form.create()(BaseForm);

export default extendExhibitionForm;