import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input } from 'antd'
import { validChar } from '../../../utils/RegExps'

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {
    key: 'name',
    label: '规格名称',
    ruleConfig: {
      rules: [
        { required: true, message: '请输入规格名称' },
        {max: 60, message: '不能超过60位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  }
};

@inject('store')
@observer
class BaseForm extends Component {
  setFormData = () => {
    const form = this.props.form;
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
    this.setFormData()
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return(
      <Form layout={formConfig.layout}>
        <Form.Item label={formConfig.name.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.name.key, formConfig.name.ruleConfig)(
            <Input placeholder={formConfig.name.ruleConfig.rules[0].message} />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const UnitModelParentBaseForm = Form.create()(BaseForm);

export default UnitModelParentBaseForm
