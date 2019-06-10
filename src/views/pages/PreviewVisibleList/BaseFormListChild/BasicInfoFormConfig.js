import { validChar } from '../../../../utils/RegExps';

const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
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
      rules: [{ required: true, message: '请选择货品分类' }]
    }
  },
  k3No: {
    key: 'k3No',
    label: '货品编号',
    ruleConfig: {
      rules: [
        { required: false, message: '请输入货品编号' },
        // { max: 20, message: '输入字符在20字以内' },
        // { pattern: validNumEng, message: '请勿输入特殊字符' }
      ]
    }
  },
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
  }
};

export default formConfig;