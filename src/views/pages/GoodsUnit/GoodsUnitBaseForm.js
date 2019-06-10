import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Icon, Button } from 'antd'
import { validChar } from '../../../utils/RegExps'

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {key: 'name', label: '单位名称',
    config: {
      rules: [
        {required: true, message: '请输入单位名称'},
        {max: 60, message: '不能超过60位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  }
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 18, offset: 6 },
  },
};

let id = 0;

@inject('store')
@observer
class BaseForm extends React.Component {

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

  addAction = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(++id);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  removeAction = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  componentDidMount() {
    this.setFormData();
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { submitType } = this.props.store;
    getFieldDecorator('keys', { initialValue: [id] });
    const keys = getFieldValue('keys');
    return(
      <Form layout={formMap.layout}>
        {!submitType ?
          <Form.Item label={formMap.name.label} {...formMap.formItemLayout}>
            {getFieldDecorator(formMap.name.key, formMap.name.config)(
              <Input placeholder={formMap.name.config.rules[0].message} />
            )}
          </Form.Item> :
          keys.map((k, index) => {
            return(
              <Form.Item label={index === 0 ? formMap.name.label : ''} key={k} {...(index === 0 ? formMap.formItemLayout : formItemLayoutWithOutLabel)}>
                {getFieldDecorator(`name[${k}]`, formMap.name.config)(
                  <Input style={{ width: '80%', marginRight: 8 }} placeholder={formMap.name.config.rules[0].message} />
                )}
                {keys.length > 1 ? (
                  <Icon className="dynamic-delete-button" type="minus-circle-o" disabled={keys.length === 1} onClick={() => this.removeAction(k)} />
                ) : null}
              </Form.Item>
            )
          })
        }
        {!submitType ? null :
          <Button type="dashed" onClick={this.addAction} style={{ width: '60%', marginLeft: '25%' }}>
            <Icon type="plus" /> 增加单位
          </Button>
        }
      </Form>
    )
  }
}

const GoodsUnitBaseForm = Form.create()(BaseForm);

export default GoodsUnitBaseForm;
