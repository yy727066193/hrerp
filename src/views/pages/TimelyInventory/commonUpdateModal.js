import React from 'react';
import { InputNumber, Form } from 'antd';
import { inject, observer } from 'mobx-react';

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  stockMax: {key: 'stockMax', label: '库存预警上限',
    config: {
      rules: [
        {required: true, message: '请输入库存预警上限'}
      ]
    }
  },
  stockMin: {key: 'stockMin', label: '库存预警下限',
    config: {
      rules: [
        {required: true, message: '请输入库存预警下限'}
      ]
    }
  }
};
@inject('store')
@observer
class commonUpdateModal extends React.Component {

  setFormData = () => {
    const { form } = this.props;
    const { tableRowData } = this.props;
    Object.keys(tableRowData).forEach(key => {
      if (formMap.hasOwnProperty(key)) {
        const field = {};
        if (tableRowData[key] || tableRowData[key] === 0) {
          field[key] = tableRowData[key]
        }
        form.setFieldsValue(field)
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
        <Form wrappedComponentRef={el => this.renderForm = el}>
          <Form.Item {...formMap.formItemLayout} label={formMap.stockMax.label}>
            {getFieldDecorator(formMap.stockMax.key, {
              rules: formMap.stockMax.config.rules})(
              <InputNumber style={{width: '100%'}} min={0} max={999999}/>
            )}
          </Form.Item>

          <Form.Item {...formMap.formItemLayout} label={formMap.stockMin.label}>
            {getFieldDecorator(formMap.stockMin.key, {
              rules: formMap.stockMin.config.rules
            })(
              <InputNumber style={{width: '100%'}} min={0} max={999999}/>
            )}
          </Form.Item>
        </Form>
    )
  }

}

const UpdateModal = Form.create()(commonUpdateModal);
export default UpdateModal;
