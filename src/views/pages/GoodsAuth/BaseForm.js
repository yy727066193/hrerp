import React from 'react';
import { inject, observer } from 'mobx-react';
import { Form, Select, Input } from 'antd';
import { validChar } from '../../../utils/RegExps';

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {
    key: 'name', 
    label: '货品授权名称',
    ruleConfig: {
      rules: [
        {required: true, message: '请输入货品授权名称'},
        {max: 60, message: '输入字符数应小于60个'},
        {pattern: validChar, message: '请勿输入特殊字符'}
      ]
    }
  },
  companyId: {
    key: 'companyId',
    label: '所属分公司',
    ruleConfig: {
      rules: [
        {required: true, message: '请选择所属分公司'}
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
    const { companyList, submitType } = this.props;

    return(
      <Form layout={formConfig.layout}>
        <Form.Item label={formConfig.companyId.label} {...formConfig.formItemLayout}>
          {getFieldDecorator(formConfig.companyId.key, formConfig.companyId.ruleConfig)(
            <Select style={{ width: '100%' }}
                    placeholder="请选择公司"
                    showSearch
                    allowClear
                    disabled={!submitType}
                    optionFilterProp="children">
              {companyList.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>)}
            </Select>
          )}
        </Form.Item>

        <Form.Item label={formConfig.name.label} {...formConfig.formItemLayout}>
          {getFieldDecorator(formConfig.name.key, formConfig.name.ruleConfig)(
            <Input />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const PackageUnitBaseForm = Form.create()(BaseForm);

export default PackageUnitBaseForm;
