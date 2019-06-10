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
  typeName: {
    key: 'typeName', 
    label: '资质分类名称',
    config: {
      rules: [
        {required: true, message: '请输入资质分类名称'},
        {max: 20, message: '不能超过20位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  typeDesc: {
    key: 'typeDesc', 
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
        <Form.Item label={formConfig.typeName.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.typeName.key, formConfig.typeName.config)(
            <Input placeholder={formConfig.typeName.config.rules[0].message} />
          )}
        </Form.Item>
        <Form.Item label={formConfig.typeDesc.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.typeDesc.key, formConfig.typeDesc.config)(
            <Input.TextArea placeholder={formConfig.typeDesc.config.rules[0].message} />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const AptitudeClassifyBaseForm = Form.create()(BaseForm);

export default AptitudeClassifyBaseForm;
