import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Upload, Icon, Button } from 'antd'
import api from "../../../service/api";
import { validChar } from '../../../utils/RegExps';

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  imgSrc:{
    key: 'imgSrc',
    label: '标签图片'
  },
  name: {
    key: 'name', 
    label: '标签名称',
    config: {
      rules: [
        {required: true, message: '请输入标签名称'},
        {max: 60, message: '不能超过60位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  }
};

let id = 0;

@inject('store')
@observer
class BaseForm extends React.Component {

  setFormData = () => {
    const { form } = this.props;
    const { tableRowData } = this.props.store;

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

  addAction = () => {
    const { getFieldValue, setFieldsValue } = this.props.form;

    const keys = getFieldValue('keys');
    const nextKeys = keys.concat(++id);

    setFieldsValue({
      keys: nextKeys,
    });
  };

  removeAction = (k) => {
    const { getFieldValue, setFieldsValue } = this.props.form;

    const keys = getFieldValue('keys');
 
    if (keys.length === 1) {
      return;
    }

    setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  normFile = (info) => {
    const { status, response } = info.file;
    const { setCommon } = this.props.store;
    setCommon('loading', true);

    if (status === 'done') {
      setCommon('loading', false);

      return response.data
    }
  };

  componentDidMount() {
    this.setFormData();
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { loading, submitType } = this.props.store;
    getFieldDecorator('keys', { initialValue: [id] });
    const keys = getFieldValue('keys');
    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">点击上传标签</div>
      </div>
    );
    return(
      <Form layout={formConfig.layout}>
        {!submitType ? 
          <div className="upload-file-style">
            <Form.Item label={formConfig.imgSrc.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.imgSrc.key, {
                valuePropName: 'file',
                getValueFromEvent: this.normFile,
              })(
                <Upload name="file" showUploadList={false}
                        accept="image/*"
                        listType="picture-card"
                        className="avatar-uploader"
                        action={api.Upload}>
                  {getFieldValue(formConfig.imgSrc.key) ?
                    <img style={{ width: '100%' }} src={getFieldValue(formConfig.imgSrc.key)} alt="logo" /> : uploadButton}
                </Upload>
              )}
            </Form.Item>

            <Form.Item label={formConfig.name.label} {...formConfig.formItemLayout}>
              {getFieldDecorator(formConfig.name.key, formConfig.name.config)(
                <Input style={{ width: '80%', marginRight: 8 }} placeholder={formConfig.name.config.rules[0].message} />
              )}
            </Form.Item>
          </div> : 
          keys.map((k, index) => {
            return(
              <div>
                <Form.Item label={formConfig.imgSrc.label} { ...formConfig.formItemLayout }>
                  {getFieldDecorator(`imgSrc[${k}]`, {
                    valuePropName: 'file',
                    getValueFromEvent: this.normFile,
                  })(
                    <Upload name="file" showUploadList={false}
                            accept="image/*"
                            listType="picture-card"
                            className="avatar-uploader"
                            action={api.Upload}>
                      {getFieldValue(`imgSrc[${k}]`) ?
                        <img style={{ width: '100%' }} src={getFieldValue(`imgSrc[${k}]`)} alt="img" /> : uploadButton}
                    </Upload>
                  )}
                </Form.Item>

                <Form.Item label={formConfig.name.label} key={k} {...formConfig.formItemLayout}>
                  {getFieldDecorator(`name[${k}]`, formConfig.name.config)(
                    <Input style={{ width: '80%', marginRight: 8 }} placeholder={formConfig.name.config.rules[0].message} />
                  )}
                  {keys.length > 1 ? (
                    <Icon className="dynamic-delete-button" type="minus-circle-o" disabled={keys.length === 1} onClick={() => this.removeAction(k)} />
                  ) : null}
                </Form.Item>
              </div>
            )
          })
        }

        {!submitType ? null :
          <Button type="dashed" onClick={this.addAction} style={{ width: '60%', marginLeft: '25%' }}>
            <Icon type="plus" /> 增加标签
          </Button>
        }
      </Form>
    )
  }
}

const GoodsLabelBaseForm = Form.create()(BaseForm);

export default GoodsLabelBaseForm;
