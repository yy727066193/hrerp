import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input } from 'antd'
import { validMobile } from "../../../utils/validate";
import { validChar, validBankNo } from '../../../utils/RegExps';

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {
    key: 'name',
    label: '供应商名称',
    ruleConfig: {
      rules: [
        { required: true, message: '请输入供应商名称' },
        {max: 60, message: '不能超过60位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  pointOfContact: {
    key: 'pointOfContact',
    label: '联系人',
    ruleConfig: {
      rules: [
        { required: true, message: '请输入联系人' },
        {max: 60, message: '不能超过60位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  contactPhone: {
    key: 'contactPhone',
    label: '联系电话',
    ruleConfig: {
      rules: [{ required: true, message: '请输入联系电话' }, { validator: validMobile }]
    }
  },
  bankName: {
    key: 'bankName',
    label: '所属银行',
    ruleConfig: {
      rules: [
        { required: false, message: '请输入所属银行' },
        {max: 10, message: '不能超过10位'},
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  bankNo: {
    key: 'bankNo',
    label: '银行账号',
    ruleConfig: {
      rules: [
        { required: false, message: '请输入银行账号' },
        { pattern: validBankNo, message: '请输入15到19位银行卡号' }
      ]
    }
  },
  providerGoods: {
    key: 'providerGoods',
    label: '供应货品',
    ruleConfig: {
      rules: [{ required: true, message: '请输入供应货品' }]
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
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return(
      <Form layout={formConfig.layout}>
        <Form.Item label={formConfig.name.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.name.key, formConfig.name.ruleConfig)(
            <Input placeholder={formConfig.name.ruleConfig.rules[0].message} />
          )}
        </Form.Item>

        <Form.Item label={formConfig.pointOfContact.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.pointOfContact.key, formConfig.pointOfContact.ruleConfig)(
            <Input placeholder={formConfig.pointOfContact.ruleConfig.rules[0].message} />
          )}
        </Form.Item>

        <Form.Item label={formConfig.contactPhone.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.contactPhone.key, formConfig.contactPhone.ruleConfig)(
            <Input type="number" placeholder={formConfig.contactPhone.ruleConfig.rules[0].message} />
          )}
        </Form.Item>

        <Form.Item label={formConfig.bankName.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.bankName.key, formConfig.bankName.ruleConfig)(
            <Input placeholder={formConfig.bankName.ruleConfig.rules[0].message} />
          )}
        </Form.Item>

        <Form.Item label={formConfig.bankNo.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.bankNo.key, formConfig.bankNo.ruleConfig)(
            <Input type="number" placeholder={formConfig.bankNo.ruleConfig.rules[0].message} />
          )}
        </Form.Item>

        <Form.Item label={formConfig.providerGoods.label} { ...formConfig.formItemLayout }>
          {getFieldDecorator(formConfig.providerGoods.key, formConfig.providerGoods.ruleConfig)(
            <Input placeholder={`${formConfig.providerGoods.ruleConfig.rules[0].message}, 以逗号隔开`} />
          )}
        </Form.Item>
      </Form>
    )
  }
}

const SupplyGoodsBaseForm = Form.create()(BaseForm);

export default SupplyGoodsBaseForm
