import { validChar } from '../../../utils/RegExps';

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {
    key: 'name',
    label: '货品名称',
    ruleConfig: {
      rules: [
        { required: true, message: '请输入货品名称' },
        { max: 60, message: '输入字符在60字以内' },
        { pattern: validChar, message: '请勿输入特殊字符' }
      ]
    }
  },
  categoriesId: {
    key: 'categoriesId',
    label: '货品分类',
    fieldNames: {label: 'name', value: 'id', children: 'children'},
    ruleConfig: {
      rules: [{ required: true, message: '请选择货品分类' }],
    }
  },
  // k3No: {
  //   key: 'k3No',
  //   label: '货品编号',
  //   ruleConfig: {
  //     rules: [
  //       { required: false, message: '请务必保持和K3系统一致，以便和金蝶系统打通' },
  //       { max: 20, message: '请输入字符在20字以内' },
  //       { pattern: validNumEng, message: '请输入英文、数字或英文数字组合' }
  //     ]
  //   }
  // },
  goodsBrand: {
    key: 'goodsBrand',
    label: '品牌',
    ruleConfig: {
      rules: [{ required: false, message: '请选择品牌' }]
    }
  },
  goodsProvider: {
    key: 'goodsProvider',
    label: '供应商',
    ruleConfig: {
      rules: [{ required: true, message: '请选择供应商' }]
    }
  },
  priceUnit: {
    key: 'priceUnit',
    label: '计价单位',
    ruleConfig: {
      rules: [{ required: true, message: '请选择计价单位' }]
    }
  },
  stockUnit: {
    key: 'stockUnit',
    label: '库存单位',
    ruleConfig: {
      rules: [{ required: true, message: '选择计价单位后自动生成' }]
    }
  },
  qualificationUrl: {
    key: 'qualificationUrl',
    label: '货品资质',
    ruleConfig: {
      rules: [{ required: false, message: '请输入货品资质' }]
    }
  },
  packingSpecNum: {
    key: 'packingSpecNum',
    label: '包装规格数量',
    ruleConfig: {
      rules: [{ required: true, message: '请输入包装规格数量' }]
    }
  },
  packingSpec: {
    key: 'packingSpec',
    label: '包装规格',
    ruleConfig: {
      rules: [{ required: true, message: '请选择包装规格' }]
    }
  },
  goodsType: {
    key: 'goodsType',
    label: '货品类别',
    ruleConfig: {
      rules: [{ required: true, message: '请选择货品类别' }]
    }
  },
  productSpec: {
    key: 'productSpec',
    label: '货品规格',
    ruleConfig: {
      rules: [{ required: true, message: '请选择货品规格' }]
    }
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
      initialValue: 0,
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

  // 展示信息
  sortId: {
    key: 'sortId',
    label: '终端排序',
    ruleConfig: {
      rules: [{ required: false, message: '请输入排序数值，数值越大越靠前' }]
    }
  },
  mainImgs: {
    key: 'mainImgs',
    label: '货品主图',
  },
  videos: {
    key: 'videos',
    label: '货品视频',
  },
  description: {
    key: 'description',
    label: '货品描述',
    ruleConfig: {
      rules: [
        { required: false, message: '请输入货品描述' },
        { max: 200, message: '输入字符在200字以内' }
      ]
    }
  },
  detailImgs: {
    key: 'detailImgs',
    label: '货品详情图',
  }
};

export default formConfig;