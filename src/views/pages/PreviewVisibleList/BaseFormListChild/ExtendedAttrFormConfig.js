const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 19 },
  },
  // 扩展属性
  shortName: {
    key: 'shortName',
    label: '短名称',
    ruleConfig: {
      rules: [{ required: false, message: '请输入短名称' }]
    }
  },
  helpCode: {
    key: 'helpCode',
    label: '助记码',
    ruleConfig: {
      rules: [{ required: false, message: '请输入助记码' }]
    }
  },
  marketPrice: {
    key: 'marketPrice',
    label: '成本价',
    ruleConfig: {
      rules: [{ required: false, message: '请输入成本价' }]
    }
  },
  costPrice: {
    key: 'costPrice',
    label: '市场价',
    ruleConfig: {
      rules: [{ required: false, message: '请输入市场价' }]
    }
  },
  heavy: {
    key: 'heavy',
    label: '货品重量',
    ruleConfig: {
      rules: [{ required: false, message: '请输入货品重量' }]
    }
  },
  longth: {
    key: 'longth',
    label: '长',
    ruleConfig: {
      initialValue: 0,
      rules: [{ required: false, message: '货品长度' }]
    }
  },
  width: {
    key: 'width',
    label: '宽',
    ruleConfig: {
      initialValue: 0,
      rules: [{ required: false, message: '货品宽度' }]
    }
  },
  height: {
    key: 'height',
    label: '高',
    ruleConfig: {
      initialValue: 0,
      rules: [{ required: false, message: '货品高度' }]
    }
  },
  volume: {
    key: 'volume',
    label: '货品体积',
    ruleConfig: {
      rules: [{ required: false, message: '货品体积' }]
    }
  },
  expirationDate: {
    key: 'expirationDate',
    label: '保质期',
    ruleConfig: {
      rules: [{ required: false, message: '请输入保质期' }]
    }
  },
  expirationDateUnit: {
    key: 'expirationDateUnit',
    label: '保质期单位',
    ruleConfig: {
      rules: [{ required: false, message: '请选择保质期单位' }]
    }
  },
  createArea: {
    key: 'createArea',
    label: '产地',
    ruleConfig: {
      rules: [{ required: false, message: '请输入产地' }]
    }
  },
  goodsKeywordsList: {
    key: 'goodsKeywordsList',
    label: '货品标签',
    ruleConfig: {
      rules: [{ required: false, message: '请选择货品标签' }]
    }
  },
};

export default formConfig;