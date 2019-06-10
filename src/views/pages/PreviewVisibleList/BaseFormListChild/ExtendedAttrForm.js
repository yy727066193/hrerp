import React from 'react';
import {inject, observer} from 'mobx-react'
import { Form, Select, Input, InputNumber } from 'antd';
import formConfig from './ExtendedAttrFormConfig';
import './index.less'

let heavyUnit = 'kg/件';   // 体重单位
let volumeUnit = 'm³/件';   // 体积单位
let expirationDate = [{id: 1, name: '年'}, {id: 2, name: '月'}, {id: 3, name: '天'}];   // 保质期单位

@inject('store')
@observer
class BaseForm extends React.Component {
  setFormData = () => {
    const { form } = this.props;
    const tableRowData = JSON.parse(JSON.stringify(this.props.store.tableRowData.goodsExtendedAttribute));
    const goodsKeywordsData = JSON.parse(JSON.stringify(this.props.store.tableRowData.goodsKeywordsList));

    if(!tableRowData) {
      return;
    }
    const goodsKeywordsDataArr = [];
    if(goodsKeywordsData !== null) {
      if(goodsKeywordsData.length) {
        goodsKeywordsData.forEach(item => {
          goodsKeywordsDataArr.push(item.id)
        })
      }
    }
    tableRowData['expirationDateUnit'] = 3;   // 编辑保质期默认为天
    tableRowData['goodsKeywordsList'] = goodsKeywordsDataArr;
    tableRowData['marketPrice'] = Number((tableRowData.marketPrice / 100).toFixed(2));
    tableRowData['costPrice'] = Number((tableRowData.costPrice / 100).toFixed(2));

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

  volumeValueChange = (type, value) => {   // 体积中长宽高发生变化时
    const { form } = this.props;
    const { longth, width, height } = form.getFieldsValue(['longth', 'width', 'height']);
    if(type === 1 && value) {
      const volumeNum = value ? value * width * height : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    } else if (type === 2 && value) {
      const volumeNum = value ? longth * value * height : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    } else {
      const volumeNum = value ? longth * width * value : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    }
  };

  componentDidMount() {
    this.setFormData();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { goodsLabelData } = this.props;
    const { tableRowData } = this.props.store;

    return(
      <div>
        <Form layout={formConfig.layout}>
            <Form.Item label={formConfig.shortName.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.shortName.key, formConfig.shortName.ruleConfig)(
                <Input
                allowClear
                placeholder={formConfig.shortName.ruleConfig.rules[0].message}/>
              )}
            </Form.Item>
            <Form.Item label={formConfig.helpCode.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.helpCode.key, formConfig.helpCode.ruleConfig)(
                <Input
                allowClear
                placeholder={formConfig.helpCode.ruleConfig.rules[0].message}/>
              )}
            </Form.Item>
            <Form.Item label={formConfig.marketPrice.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.marketPrice.key, formConfig.marketPrice.ruleConfig)(
                <InputNumber
                min={0}
                style={{ width: '100%' }}
                disabled={tableRowData.isUpdate}
                allowClear
                placeholder={formConfig.marketPrice.ruleConfig.rules[0].message}/>
              )}
            </Form.Item>
            <Form.Item label={formConfig.costPrice.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.costPrice.key, formConfig.costPrice.ruleConfig)(
                <InputNumber
                min={0}
                style={{ width: '100%' }}
                disabled={tableRowData.isUpdate}
                allowClear
                placeholder={formConfig.costPrice.ruleConfig.rules[0].message}/>
              )}
            </Form.Item>
            <Form.Item label={formConfig.heavy.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.heavy.key, formConfig.heavy.ruleConfig)(
                <InputNumber
                min={0}
                style={{ width: '100%' }}
                disabled={tableRowData.isUpdate}
                allowClear
                placeholder={formConfig.heavy.ruleConfig.rules[0].message}/>
              )}
              <span className="page-wrapper-form-content-unit">{heavyUnit}</span>
            </Form.Item>
            <Form.Item label={formConfig.volume.label} { ...formConfig.formItemLayout }>
              <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                {getFieldDecorator(formConfig.longth.key, formConfig.longth.ruleConfig)(
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    disabled={tableRowData.isUpdate}
                    allowClear
                    onChange={this.volumeValueChange.bind(this, 1)}
                    placeholder={formConfig.longth.ruleConfig.rules[0].message}/>
                )}
              </Form.Item>
              <span style={{ fontSize: '20px', padding: '0 5px' }}>*</span>
              <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                {getFieldDecorator(formConfig.width.key, formConfig.width.ruleConfig)(
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    disabled={tableRowData.isUpdate}
                    allowClear
                    onChange={this.volumeValueChange.bind(this, 2)}
                    placeholder={formConfig.width.ruleConfig.rules[0].message}/>
                )}
              </Form.Item>
              <span style={{ fontSize: '20px', padding: '0 5px' }}>*</span>
              <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                {getFieldDecorator(formConfig.height.key, formConfig.height.ruleConfig)(
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    disabled={tableRowData.isUpdate}
                    allowClear
                    onChange={this.volumeValueChange.bind(this, 3)}
                    placeholder={formConfig.height.ruleConfig.rules[0].message}/>
                )}
              </Form.Item>
              <span style={{ fontSize: '20px', padding: '0 5px' }}>=</span>
              <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                {getFieldDecorator(formConfig.volume.key, formConfig.volume.ruleConfig)(
                  <InputNumber
                    min={0}
                    disabled
                    precision={2}
                    style={{ width: '100%' }}
                    allowClear
                    placeholder={formConfig.volume.ruleConfig.rules[0].message}/>
                )}
              </Form.Item>
              <span className="page-wrapper-form-content-unit">{volumeUnit}</span>
            </Form.Item>
            <Form.Item label={formConfig.expirationDate.label} { ...formConfig.formItemLayout }>
              <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>
                {getFieldDecorator(formConfig.expirationDate.key, formConfig.expirationDate.ruleConfig)(
                  <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  disabled={tableRowData.isUpdate}
                  allowClear
                  placeholder={formConfig.expirationDate.ruleConfig.rules[0].message}/>
                )}
              </Form.Item>
              <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>
                {getFieldDecorator(formConfig.expirationDateUnit.key, formConfig.expirationDateUnit.ruleConfig)(
                  <Select
                    style={{ width: '100%' }}
                    disabled={tableRowData.isUpdate}
                    placeholder={formConfig.expirationDateUnit.ruleConfig.rules[0].message}
                    showSearch
                    allowClear
                    optionFilterProp="children">
                    {expirationDate.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                  </Select>
                )}
              </Form.Item>
            </Form.Item>
            <Form.Item label={formConfig.createArea.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.createArea.key, formConfig.createArea.ruleConfig)(
                <Input
                allowClear
                disabled={tableRowData.isUpdate}
                placeholder={formConfig.createArea.ruleConfig.rules[0].message}/>
              )}
            </Form.Item>
            <Form.Item label={formConfig.goodsKeywordsList.label} { ...formConfig.formItemLayout }>
              {getFieldDecorator(formConfig.goodsKeywordsList.key, formConfig.goodsKeywordsList.ruleConfig)(
                <Select
                  style={{ width: '100%' }}
                  placeholder={formConfig.goodsKeywordsList.ruleConfig.rules[0].message}
                  mode="multiple"
                  showSearch
                  allowClear
                  optionFilterProp="children">
                  {goodsLabelData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                </Select>
              )}
            </Form.Item>
        </Form>
      </div>
    )
  }
}

const ProductCategoriesForm = Form.create()(BaseForm);

export default ProductCategoriesForm;

