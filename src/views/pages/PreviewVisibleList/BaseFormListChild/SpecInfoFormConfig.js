const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  },
  productSpec: {
    key: 'productSpec',
    label: '货品规格',
    ruleConfig: {
      rules: [{ required: false, message: '请选择货品规格' }]
    }
  }
};

export default formConfig;