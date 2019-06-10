import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Select, Icon, Button } from 'antd'

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {key: 'name', label: '包装规格单',
    config: {
      rules: [
        {required: true, message: '请选择包装规格单'},
        {validator: (rule, value, callback) => console.log(value)}
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

  checkAddSelect = (val, callback, index) => {
    if (!val) {
      callback('请选择包装规格单')
    }
    const nameIdList = this.props.form.getFieldValue('nameIdList');
    const nameId = nameIdList[index];
    if (nameId[0] === nameId[1]) {
      callback('不能选择相同单位')
    }
    callback();
  };

  checkUpdateSelect = (val, callback) => {
    if (!val) {
      callback('请选择包装规格单')
    }
    const nameId = this.props.form.getFieldValue('nameId');
    if (nameId[0] === nameId[1]) {
      callback('不能选择相同单位')
    }
    callback();
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { tableRowData } = this.props.store;
    const { unitList } = this.props;
    const { submitType } = this.props.store;
    getFieldDecorator('keys', { initialValue: [id] });
    const keys = getFieldValue('keys');

    return(
      <Form layout={formMap.layout}>
        {submitType ?
          [
            keys.map((k, index) => {
              return(
                <Form.Item label={index === 0 ? formMap.name.label : ''} key={k} {...(index === 0 ? formMap.formItemLayout : formItemLayoutWithOutLabel)} required>
                  <Form.Item style={{ display: 'inline-block', width: '43%', marginBottom: 0 }}>
                    {getFieldDecorator(`nameIdList[${k}][0]`, {
                      rules: [{validator: (rule, value, callback) => this.checkAddSelect(value, callback, k)}]
                    })(
                      <Select showSearch optionFilterProp="children">
                        {unitList.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                      </Select>
                    )}
                  </Form.Item>
                  <div style={{ display: 'inline-block', width: '4%', textAlign: 'center' }}>/</div>
                  <Form.Item style={{ display: 'inline-block', width: '43%', marginBottom: 0 }}>
                    {getFieldDecorator(`nameIdList[${k}][1]`, {
                      rules: [{validator: (rule, value, callback) => this.checkAddSelect(value, callback, k)}]
                    })(
                      <Select showSearch optionFilterProp="children">
                        {unitList.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                      </Select>
                    )}
                  </Form.Item>
                  {keys.length > 1 ? (
                    <Icon style={{ marginLeft: '10px' }} className="dynamic-delete-button" type="minus-circle-o" disabled={keys.length === 1} onClick={() => this.removeAction(k)} />
                  ) : null}
                </Form.Item>
              )
            }),
            <Button type="dashed" onClick={this.addAction} style={{ width: '68%', marginLeft: '25%' }}>
              <Icon type="plus" /> 增加包装规格单位
            </Button>
          ]
          :
          <Form.Item label={formMap.name.label} {...formMap.formItemLayout} required>
            <Form.Item style={{ display: 'inline-block', width: '43%', marginBottom: 0 }}>
              {getFieldDecorator('nameId[0]', {
                initialValue: tableRowData.firstBaseUnitId || '',
                rules: [{validator: (rule, value, callback) => this.checkUpdateSelect(value, callback)}]
              })(
                <Select showSearch optionFilterProp="children">
                  {unitList.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                </Select>
              )}
            </Form.Item>
            <div style={{ display: 'inline-block', width: '4%', textAlign: 'center' }}>/</div>
            <Form.Item style={{ display: 'inline-block', width: '43%', marginBottom: 0 }}>
              {getFieldDecorator('nameId[1]', {
                initialValue: tableRowData.secondBaseUnitId || '',
                rules: [{validator: (rule, value, callback) => this.checkUpdateSelect(value, callback)}]
              })(
                <Select showSearch optionFilterProp="children">
                  {unitList.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                </Select>
              )}
            </Form.Item>
          </Form.Item>
        }
      </Form>
    )
  }
}

const PackageUnitBaseForm = Form.create()(BaseForm);

export default PackageUnitBaseForm;
