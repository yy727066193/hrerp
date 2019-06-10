export default [
  {title: '序号', dataIndex: 'serialNumber'},
  {title: '套餐名称', dataIndex: 'name', formType: 'input'},
  {title: '单位', dataIndex: 'priceUnitName'},
  {title: '套餐编码', dataIndex: 'hrNo'},
  {title: '套餐分类', dataIndex: 'goodsCategories', formType: 'cascader'},
  {title: '销售价格(元)', dataIndex: 'realPrice'},
  {title: '会员价格(元)', dataIndex: 'realUserPrice'},
  // {title: '兑换积分', dataIndex: 'integral'},
  {title: '操作', dataIndex: 'action', width: 150}
]