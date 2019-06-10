const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
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