export default [
  {title: '套餐名称', dataIndex: 'name', formType: 'input', width: '10%'},
  {title: '单位', dataIndex: 'priceUnitName', width: '10%'},
  {title: '初始价(元)', dataIndex: 'initPrice', width: '10%', render: (text) => text ? (isNaN(text / 100) ? '0.00' : (text / 100).toFixed(2)) : '0.00'},
  {title: '套餐编码', dataIndex: 'hrNo'},
  {title: '套餐分类', dataIndex: 'categoriesId', formType: 'cascader', width: '10%'},
]
