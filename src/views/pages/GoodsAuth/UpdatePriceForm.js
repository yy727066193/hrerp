import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, InputNumber } from 'antd'

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  realPrice: {
    key: 'realPrice',
    label: '销售价格(元)',
    config: {
      initialValue: 0,
      rules: [
        {required: true, message: '请输入销售价格'},
      ]
    }
  },
  realUserPrice: {
    key: 'realUserPrice',
    label: '会员价格(元)',
    config: {
      initialValue: 0,
      rules: [
        {required: true, message: '请输入会员价格'},
      ]
    }
  }
};

@inject('store')
@observer
class BaseForm extends React.Component {

  setFormData = () => {
    const { form, comboRowData } = this.props;
    if(comboRowData.goodsStorePrice === null) {
      comboRowData.goodsStorePrice = {realPrice: 0, realUserPrice: 0, integral: 0, exchangeIntegral: null}
    }

    Object.keys(comboRowData.goodsStorePrice).forEach(key => {
      if (formMap.hasOwnProperty(key)) {
        const field = {};
        if (comboRowData.goodsStorePrice[key] || comboRowData.goodsStorePrice[key] === 0) {
          field[key] = comboRowData.goodsStorePrice[key]
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
      <Form layout={formMap.layout}>
        <Form.Item label={formMap.realPrice.label} {...formMap.formItemLayout}>
          {getFieldDecorator(formMap.realPrice.key, formMap.realPrice.config)(
            <InputNumber min={0} style={{ width: '100%' }} max={999999} precision={2} />
          )}
        </Form.Item>
        <Form.Item label={formMap.realUserPrice.label} {...formMap.formItemLayout}>
          {getFieldDecorator(formMap.realUserPrice.key, formMap.realUserPrice.config)(
            <InputNumber min={0} style={{ width: '100%' }} max={999999} precision={2} />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const UpdatePriceForm = Form.create()(BaseForm);

export default UpdatePriceForm;
