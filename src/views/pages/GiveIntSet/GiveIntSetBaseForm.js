import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, InputNumber } from 'antd'

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      number: value.number,
    };
  };

  handleNumberChange = (e) => {
    this.setState({ number: parseInt(e) });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="inline" style={{ float: 'left' }}>
        <Form.Item>
          {getFieldDecorator('money', { initialValue: this.state.number !== 0 ? this.state.number : 0 })(
            <p style={{ paddingLeft: '10%' }}>
              <span>单个商品销售金额每满足 </span>
              <InputNumber
                min={0}
                max={999999}
                precision={2}
                defaultValue={this.props.integralData[0].money/100 }
                onChange={this.handleNumberChange}
                style={{ width: '30%' }}
              />
              <span> 元，赠送1积分</span>
            </p>
          )}
        </Form.Item>
      </Form>
    );
  }
}

const GiveIntSetBaseForm = Form.create()(BaseForm);

export default GiveIntSetBaseForm;
