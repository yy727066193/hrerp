import React from 'react'
import { Form, Input } from 'antd'
import { inject, observer } from 'mobx-react'

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
        {max: 60, message: '不能超过60位'}
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
            <Input />
          )}
        </Form.Item>
        <Form.Item label={formMap.sortId.label} {...formMap.formItemLayout}>
          {getFieldDecorator(formMap.sortId.key, formMap.sortId.config)(
            <Input type="number" />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const PackageTypeBaseForm = Form.create()(BaseForm);

export default PackageTypeBaseForm;
