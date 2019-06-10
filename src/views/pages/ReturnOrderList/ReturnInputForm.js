import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Form, InputNumber } from 'antd';
class ReturnInputForm extends React.Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="mt15 inputWrapper">
        <Form layout="horizontal">
          <Form.Item label='已通过协商,获批退款金额为' required={true}>
          {getFieldDecorator('resultMoney', {
              rules: [{
                required: true,
                message: `请输入退款金额`
              }],
            })(<InputNumber style={{marginLeft: '15px', width:'200px'}} min={0} max={9999999} placeholder='请输入退款金额' />)}
          </Form.Item>
        </Form>
      </div>
    )
  }
}

const ReturnInputFormItem = Form.create()(ReturnInputForm);

export default ReturnInputFormItem;