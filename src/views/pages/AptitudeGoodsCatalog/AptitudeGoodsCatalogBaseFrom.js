import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Select } from 'antd'

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  goodsName: {
    key: 'goodsName', 
    label: '货品名称',
    config: {
      rules: [
        {required: true, message: '请选择货品'},
      ]
    }
  },
  goodsCode: {
    key: 'goodsCode', 
    label: '货品编码',
    config: {
      rules: [
        {required: true, message: '选择货品自动生成'},
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

  goodsNameChange = (val) => {
    this.props.form.setFieldsValue({
      goodsCode: val ? val : '',
    });
  };

  componentDidMount() {
    this.setFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { goodsData } = this.props;

    return(
      <Form layout={formConfig.layout}>
        <Form.Item label={formConfig.goodsName.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.goodsName.key, formConfig.goodsName.config)(
            <Select style={{ width: '100%' }}
              placeholder={formConfig.goodsName.config.rules[0].message}
              onChange={(value) => this.goodsNameChange(value)}
              showSearch
              allowClear
              optionFilterProp="children">
              {goodsData.map(item => <Select.Option value={item.k3No} key={item.k3No}>{item.name}</Select.Option>)}
            </Select>
          )}
        </Form.Item>
        <Form.Item label={formConfig.goodsCode.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.goodsCode.key, formConfig.goodsCode.config)(
            <Input disabled placeholder={formConfig.goodsCode.config.rules[0].message} />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const AptitudeGoodsCatalogBaseFrom = Form.create()(BaseForm);

export default AptitudeGoodsCatalogBaseFrom;
