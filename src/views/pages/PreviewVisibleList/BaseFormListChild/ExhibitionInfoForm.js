import React from 'react';
import {inject, observer} from 'mobx-react'
import { Form, Upload, Input, InputNumber, Modal, Button, Icon } from 'antd';
import formConfig from './ExhibitionInfoFormConfig';
import api from '../../../../service/api'
import helper from '../../../../utils/helper';
import { IMG_SIZE, VIDEO_SIZE } from '../../../../conf/index';
import './index.less'

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
    }
  };

  setFormData = () => {
    const { form } = this.props;
    const { mainImgsFileList, videosFileList, detailImgsFileList } = this.state;
    const tableRowData = this.props.store.tableRowData.goodsPresentation;

    if(!tableRowData) {
      return;
    }
    if(tableRowData.mainImgs) {
      tableRowData.mainImgs.split(',').forEach((item, index) => {
        mainImgsFileList.push({
          uid: 'mainImgsFileList' + index,
          name: 'mainImgsFileList' + index,
          status: 'done',
          url: item
        })
      })
    };

    if(tableRowData.detailImgs) {
      tableRowData.detailImgs.split(',').forEach((item, index) => {
        detailImgsFileList.push({
          uid: 'detailImgsFileList' + index,
          name: 'detailImgsFileList' + index,
          status: 'done',
          url: item
        })
      })
    };

    if(tableRowData.videos) {
      tableRowData.videos.split(',').forEach((item, index) => {
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

  handleCancelMainImgs = () => {
    this.setState({ mainImgsPreviewVisible: false })
  }

  handlePreviewMainImgs = (file) => {
    this.setState({
      mainImgsPreviewImage: file.url || file.thumbUrl,
      mainImgsPreviewVisible: true,
    });
  }

  handleChangeMainImgs = (e) => {
    if(e.file.status) {
      this.setState({ mainImgsFileList: e.fileList })
    };
  };

  hlandChangVideos = (e) => {
    if(e.file.status) {
      this.setState({ videosFileList: e.fileList })
    };
  };

  handleCancelDetailImgs = () => { 
    this.setState({detailImgsPreviewVisible: false})
  }

  handlePreviewDetailImgs = (file) => {
    this.setState({
      detailImgsPreviewImage: file.url || file.thumbUrl,
      detailImgsPreviewVisible: true,
    });
  }

  handleChangeDetailImgs = (e) => {
    if(e.file.status) {
      this.setState({ detailImgsFileList: e.fileList })
    };
  };

  beforeUpload = (maxSize, file) => {
    if (file.size/1024 <= maxSize) {
      return true;
    } else {
      helper.W('上传文件过大');
      return false;
    }
  };

  componentDidMount() {
    this.setFormData()
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { mainImgsPreviewVisible,
            mainImgsPreviewImage,
            mainImgsFileList,
            mainImgsFileType,

            videosFileList,
            videosFileType,

            detailImgsPreviewVisible,
            detailImgsPreviewImage,
            detailImgsFileList,} = this.state;

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return(
      <div>
        <Form layout={formConfig.layout}>
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
        </Form>
      </div>
    )
  }
}

const ExhibitionInfoForm = Form.create()(BaseForm);

export default ExhibitionInfoForm;

