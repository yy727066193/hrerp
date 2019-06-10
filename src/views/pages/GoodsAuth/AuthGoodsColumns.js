export default [
  {title: '序号', dataIndex: 'serialNumber', width: 80},
  {title: '货品', dataIndex: 'productProperty', width: 200},
  {title: '货品图片', dataIndex: 'mainImgs', visible: 1},
  {title: '货品名称', dataIndex: 'name', formType: 'input', visible: 1},
  {title: '货品编号', dataIndex: 'k3No', visible: 1},
  {title: '货品条码', dataIndex: 'barCode', visible: 1},
  {title: '包装规格', dataIndex: 'packingSpec', width: 200},
  {title: '计价单位', dataIndex: 'goodsPriceUnit', width: 160},
  {title: '货品类别', dataIndex: 'goodsTypeList', width: 200},
  {title: '货品分类', dataIndex: 'categoriesName', formType: 'cascader'},
  {title: '销售价格(元)', dataIndex: 'realPrice', width: 160},
  {title: '会员价格(元)', dataIndex: 'realUserPrice', width: 160},
  // {title: '兑换积分', dataIndex: 'integral', width: 160},
  {title: '是否赠送积分', dataIndex: 'exchangeIntegral', width: 160},
  {title: '操作', dataIndex: 'actions', width: 100}
]