import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, InputNumber, Radio } from 'antd'

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  realPrice: {
    key: 'realPrice',
    label: '销售价格(元)',
    config: {
      initialValue: 0,
      rules: [
        {required: true, message: '请输入销售价格'},
      ]
    }
  },
  realUserPrice: {
    key: 'realUserPrice',
    label: '会员价格(元)',
    config: {
      initialValue: 0,
      rules: [
        {required: true, message: '请输入会员价格'},
      ]
    }
  },
  // integral: {
  //   key: 'integral',
  //   label: '兑换积分',
  //   config: {
  //     initialValue: 0,
  //     rules: [
  //       {required: true, message: '请输入兑换积分'},
  //     ]
  //   }
  // },
  exchangeIntegral: {
    key: 'exchangeIntegral',
    label: '是否赠送积分',
    config: {
      initialValue: 0,
      rules: [
        {required: true, message: '请选择是否赠送积分'},
      ]
    }
  }
};

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      verifyArr: []
    }
  };

  setFormData = () => {
    const { verifyArr } = this.state;
    const { form, priceIntegralRowData } = this.props;
    if(priceIntegralRowData.goodsStorePrice === null) {
      priceIntegralRowData.goodsStorePrice = {realPrice: 0, realUserPrice: 0, exchangeIntegral: null}
    }

    Object.keys(priceIntegralRowData.goodsStorePrice).forEach(key => {
      if (formMap.hasOwnProperty(key)) {
        const field = {};
        if(verifyArr.indexOf(1) === -1 && (key === 'realPrice' || key === 'realUserPrice')) {
          return;
        }
        if (priceIntegralRowData.goodsStorePrice[key] || priceIntegralRowData.goodsStorePrice[key] === 0) {
          field[key] = priceIntegralRowData.goodsStorePrice[key]
        }
        form.setFieldsValue(field)
      }
    });
  };

  setRowDataFatherId = () => {
    const { priceIntegralRowDataFather } = this.props;
    const arr = [];

    priceIntegralRowDataFather.goodsTypeList.forEach(item => {
      arr.push(item.id)
    })
    this.setState({
      verifyArr: [...arr]
    }, () => this.setFormData())
  };

  componentDidMount() {
    this.setRowDataFatherId();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { verifyArr } = this.state;

    return(
      <Form layout={formMap.layout}>
        {
          verifyArr.indexOf(1) > -1 ?
            <Form.Item label={formMap.realPrice.label} {...formMap.formItemLayout}>
              {getFieldDecorator(formMap.realPrice.key, formMap.realPrice.config)(
                <InputNumber min={0} style={{ width: '100%' }} max={999999} precision={2} />
              )}
            </Form.Item> : null
        }
        {
          verifyArr.indexOf(1) > -1 ? 
            <Form.Item label={formMap.realUserPrice.label} {...formMap.formItemLayout}>
              {getFieldDecorator(formMap.realUserPrice.key, formMap.realUserPrice.config)(
                <InputNumber min={0} style={{ width: '100%' }} max={999999} precision={2} />
              )}
            </Form.Item> : null
        }
        {/* {
          verifyArr.indexOf(2) > -1 ? 
            <Form.Item label={formMap.integral.label} {...formMap.formItemLayout}>
              {getFieldDecorator(formMap.integral.key, formMap.integral.config)(
                <InputNumber min={0} style={{ width: '100%' }} min={1} max={999999} precision={0} />
              )}
            </Form.Item> : null
        } */}
        <Form.Item label={formMap.exchangeIntegral.label} {...formMap.formItemLayout}>
          {getFieldDecorator(formMap.exchangeIntegral.key, formMap.exchangeIntegral.config)(
            <Radio.Group>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          )}
        </Form.Item>
      </Form>
    )
  }
}

const UpdatePriceIntegralForm = Form.create()(BaseForm);

export default UpdatePriceIntegralForm;
