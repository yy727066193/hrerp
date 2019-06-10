export default [
  {title: '序号', dataIndex: 'serialNumber'},
  {title: '货品', dataIndex: 'productProperty'},
  {title: '货品图片', dataIndex: 'mainImgs', visible: 1},
  {title: '货品名称', dataIndex: 'name', formType: 'input', visible: 1},
  {title: '货品编号', dataIndex: 'k3No', formType: 'input', visible: 1},
  {title: '货品条码', dataIndex: 'barCode', visible: 1},
  {title: '货品品牌', dataIndex: 'goodsBrand', formType: 'select'},
  {title: '货品供应商', dataIndex: 'goodsProvider', formType: 'select'},
  {title: '包装规格', dataIndex: 'packingSpec'},
  {title: '库存单位', dataIndex: 'goodsStockUnit'},
  {title: '计价单位', dataIndex: 'goodsPriceUnit'},
  {title: '货品类别', dataIndex: 'goodsTypeList', formType: 'select'},
  {title: '货品分类', dataIndex: 'categoriesName', formType: 'cascader'},
  {title: '创建人', dataIndex: 'createEName'},
  {title: '创建时间', dataIndex: 'createTime', formType: 'dateScope', visible: 1},
  {title: '操作', dataIndex: 'actions', width: 260}
]