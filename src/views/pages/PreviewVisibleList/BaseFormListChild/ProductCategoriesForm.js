import React from 'react';
import {inject, observer} from 'mobx-react'
import { Form, Checkbox } from 'antd';
import formConfig from './ProductCategoriesFormConfig'
import './index.less'

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goodsTypeList: []
    }
  };

  setFormData = () => {
    const { form } = this.props;
    const { tableRowData } = this.props.store;
    const { goodsTypeList } = this.state; 
    const rowData = {};

    tableRowData.goodsTypeList.forEach(item => {
      goodsTypeList.push(item.id)
    })

    rowData['goodsType'] = goodsTypeList;

    Object.keys(rowData).forEach(key => {
      if (formConfig.hasOwnProperty(key)) {
        const field = {};
        if (rowData[key] || rowData[key] === 0) {
          field[key] = rowData[key]
        }
        form.setFieldsValue(field)
      }
    });
  };

  checkBoxChange = (value) => {
    this.setState({goodsTypeList: value })
  };

  componentDidMount() {
    this.setFormData();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { goodsTypeData } = this.props;
    const { goodsTypeList } = this.state;
    const { tableRowData } = this.props.store;

    return(
      <div>
        <Form layout={formConfig.layout}>
          <Form.Item label={formConfig.goodsType.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.goodsType.key, formConfig.goodsType.ruleConfig)(
              <Checkbox.Group 
              onChange={this.checkBoxChange} >
                {goodsTypeData.map(item => <Checkbox value={item.id} key={item.id} 
                                                     disabled={tableRowData.isUpdate ? goodsTypeList.indexOf(item.id) !== -1 : false}>
                                                     {item.name}
                                           </Checkbox>)}
              </Checkbox.Group>
            )}
          </Form.Item>
        </Form>
      </div>
    )
  }
}

const ProductCategoriesForm = Form.create()(BaseForm);

export default ProductCategoriesForm;

