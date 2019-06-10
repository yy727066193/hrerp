const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  },
  goodsType: {
    key: 'goodsType',
    label: '货品类别',
    ruleConfig: {
      rules: [{ required: true, message: '请选择货品类别' }]
    }
  },
};

export default formConfig;