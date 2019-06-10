import React from 'react'
import { Form, Input, InputNumber } from 'antd'
import { inject, observer } from 'mobx-react'
import { validChar } from '../../../utils/RegExps'

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {key: 'name', label: '分类名称',
    config: {
      rules: [
        {required: true, message: '请输入分类名称'},
        {max: 60, message: '不能超过60位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  sortId: {key: 'sortId', label: '分类排序',
    config: {
      initialValue: '1',
      rules: [
        {required: true, message: '请输入分类排序'},
        {max: 10, message: '不能超过10位'}
      ]
    }
  }
};

@inject('store')
@observer
class BaseForm extends React.Component{

  setFormData = () => {
    const { form } = this.props;
    const { tableRowData } = this.props.store;

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

  componentDidMount() {
    this.setFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { tableRowData, submitType } = this.props.store;
    return(
      <Form layout={formMap.layout}>
        {tableRowData.parentId === 0 || !submitType ? null :
          <div style={{ marginBottom: '20px', marginLeft: '8%', color: 'rgba(0, 0, 0, 0.85)' }}>所属分类名称：{tableRowData.parentName}</div>
        }
        <Form.Item label={formMap.name.label} {...formMap.formItemLayout}>
          {getFieldDecorator(formMap.name.key, formMap.name.config)(
            <Input placeholder={formMap.name.config.rules[0].message} />
          )}
        </Form.Item>
        <Form.Item label={formMap.sortId.label} {...formMap.formItemLayout}>
          {getFieldDecorator(formMap.sortId.key, formMap.sortId.config)(
            <InputNumber 
              min={0} 
              style={{ width: '100%' }} 
              allowClear 
              placeholder={formMap.sortId.config.rules[0].message}/>
          )}
        </Form.Item>
      </Form>
    )
  }
}

const GoodsTypeBaseForm = Form.create()(BaseForm);

export default GoodsTypeBaseForm;
