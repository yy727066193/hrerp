import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input } from 'antd'
import { validChar } from '../../../utils/RegExps';

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  classifyName: {
    key: 'classifyName', 
    label: '资质分类名称',
    config: {
      rules: [
        {required: true, message: '请输入资质分类名称'},
        {max: 20, message: '不能超过20位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  classifyDesc: {
    key: 'classifyDesc', 
    label: '备注',
    config: {
      rules: [
        {required: false, message: '请输入备注'},
        {max: 100, message: '不能超过100位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  }
};

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

  componentDidMount() {
    this.setFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return(
      <Form layout={formConfig.layout}>
        <Form.Item label={formConfig.classifyName.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.classifyName.key, formConfig.classifyName.config)(
            <Input placeholder={formConfig.classifyName.config.rules[0].message} />
          )}
        </Form.Item>
        <Form.Item label={formConfig.classifyDesc.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.classifyDesc.key, formConfig.classifyDesc.config)(
            <Input.TextArea placeholder={formConfig.classifyDesc.config.rules[0].message} />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const AptitudeClassifyBaseForm = Form.create()(BaseForm);

export default AptitudeClassifyBaseForm;
