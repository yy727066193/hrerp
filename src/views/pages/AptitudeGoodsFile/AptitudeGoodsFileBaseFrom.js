import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Select, Upload, Icon, Modal, DatePicker } from 'antd'
import api from '../../../service/api'
import {IMG_SIZE, DATE_FORMAT} from "../../../conf";
import helper from '../../../utils/helper';
import { validChar } from '../../../utils/RegExps';
import moment from "moment";

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  certificateType: {
    key: 'certificateType', 
    label: '资质分类',
    config: {
      rules: [
        {required: true, message: '请选择资质分类'},
      ]
    }
  },
  factoryId: {
    key: 'factoryId', 
    label: '厂商',
    config: {
      rules: [
        {required: true, message: '请选择厂商'},
      ]
    }
  },
  certificateName: {
    key: 'certificateName', 
    label: '资质名称',
    config: {
      rules: [
        {required: true, message: '请输入资质名称'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  filesUrl: {
    key: 'filesUrl', 
    label: '资质图片',
    config: {
      rules: [
        {required: true, message: '请点击上传资质图片'},
      ]
    }
  },
  certificateCode: {
    key: 'certificateCode', 
    label: '证件编号',
    config: {
      rules: [
        {required: true, message: '请输入证件编号'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  expireDate: {
    key: 'expireDate', 
    label: '到期时间',
    config: {
      rules: [
        {required: true, message: '请选择到期时间'},
      ]
    }
  },
  certificateDesc: {
    key: 'certificateDesc', 
    label: '备注',
    config: {
      rules: [
        {required: false, message: '请输入备注信息'},
        {max: 100, message: '不能超过100位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  }
};

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filesUrlPreviewVisible: false,
      filesUrlPreviewImage: '',
      filesUrlFileList: [],
      filesUrlFileType: '.jpg, .png, .pdf',
    }
  };

  beforeUpload = (maxSize, file) => {   // 验证图片大小
    if (file.size/1024 <= maxSize) {
      return true;
    } else {
      helper.W('上传文件过大');
      return false;
    }
  };

  handleCancelFilesUrl = () => this.setState({ filesUrlPreviewVisible: false })

  handlePreviewFilesUrl = (file) => {
    console.log(file)
    this.setState({
      filesUrlPreviewImage: file.url || file.thumbUrl,
      filesUrlPreviewVisible: true,
    });
  }

  handleChangeFilesUrl = (e) => {
    if(e.file.status) {
      this.setState({ filesUrlFileList: e.fileList });
    }
  };

  setFormData = () => {
    const { form } = this.props;
    const { tableRowData } = this.props.store;

    const filesUrlArr = [];
    if(tableRowData.filesUrl) {
      tableRowData.filesUrl.split(',').forEach((item, index) => {
        filesUrlArr.push({
          uid: index + '',
          name: item.split('/')[item.split('/').length - 1],
          status: 'done',
          url: item,
        })
      })
      this.setState({
        filesUrlFileList: filesUrlArr
      })
    }
    
    Object.keys(tableRowData).forEach(key => {
      if (formConfig.hasOwnProperty(key)) {
        const field = {};
        if (tableRowData[key] || tableRowData[key] === 0) {
          if (key === 'expireDate') {
            field[key] = moment(tableRowData[key], DATE_FORMAT);
          } else {
            field[key] = tableRowData[key]
          }
        }
        form.setFieldsValue(field)
      }
    });
  };

  componentDidMount() {
    this.setFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { aptitudeClassifyData, factoryData } = this.props;
    const { 
      filesUrlPreviewVisible,
      filesUrlPreviewImage,
      filesUrlFileList,
      filesUrlFileType
    } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    console.log(factoryData)
    return(
      <Form layout={formConfig.layout}>
        <Form.Item label={formConfig.certificateType.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.certificateType.key, formConfig.certificateType.config)(
            <Select style={{ width: '100%' }}
              placeholder={formConfig.certificateType.config.rules[0].message}
              showSearch
              allowClear
              optionFilterProp="children">
              {aptitudeClassifyData.map(item => <Select.Option value={item.id} key={item.id}>{item.typeName}</Select.Option>)}
            </Select>
          )}
        </Form.Item>
        <Form.Item label={formConfig.factoryId.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.factoryId.key, formConfig.factoryId.config)(
            <Select style={{ width: '100%' }}
              placeholder={formConfig.factoryId.config.rules[0].message}
              showSearch
              allowClear
              optionFilterProp="children">
              {factoryData.map(item => <Select.Option value={item.id} key={item.id}>{item.factoryName}</Select.Option>)}
            </Select>
          )}
        </Form.Item>
        <Form.Item label={formConfig.certificateName.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.certificateName.key, formConfig.certificateName.config)(
            <Input placeholder={formConfig.certificateName.config.rules[0].message} />
          )}
        </Form.Item>
        <Form.Item label={formConfig.filesUrl.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.filesUrl.key, formConfig.filesUrl.config)(
            <div>
              <Upload
                accept={filesUrlFileType}
                action={api.Upload}
                listType="picture-card"
                fileList={filesUrlFileList}
                beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                onPreview={this.handlePreviewFilesUrl}
                onChange={this.handleChangeFilesUrl}>
                {filesUrlFileList.length >= 5 ? null : uploadButton}
              </Upload>
              <Modal visible={filesUrlPreviewVisible} footer={null} onCancel={this.handleCancelFilesUrl}>
                <img alt="example" style={{ width: '100%' }} src={filesUrlPreviewImage} />
              </Modal>
            </div>
          )}
        </Form.Item>
        <Form.Item label={formConfig.certificateCode.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.certificateCode.key, formConfig.certificateCode.config)(
            <Input placeholder={formConfig.certificateCode.config.rules[0].message} />
          )}
        </Form.Item>
        <Form.Item label={formConfig.expireDate.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.expireDate.key, formConfig.expireDate.config)(
            <DatePicker showToday={false} style={{ width: '100%' }} placeholder={formConfig.expireDate.config.rules[0].message} />
          )}
        </Form.Item>
        <Form.Item label={formConfig.certificateDesc.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.certificateDesc.key, formConfig.certificateDesc.config)(
            <Input.TextArea placeholder={formConfig.certificateDesc.config.rules[0].message} />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const AptitudeGoodsFileBaseFrom = Form.create()(BaseForm);

export default AptitudeGoodsFileBaseFrom;
