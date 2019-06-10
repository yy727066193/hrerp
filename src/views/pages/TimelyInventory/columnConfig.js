export default {
  tableHead: [
    { title: '序号', dataIndex: 'serialNum', key: 'serialNum'},
    { title: '货品编码', dataIndex: 'goodsCode', key: 'goodsCode'},
    { title: '品名规格', dataIndex: 'goodsName', key: 'goodsName'},
    { title: '单位', dataIndex: 'unit', key: 'unit'},
    { title: '所属仓库', dataIndex: 'depotName', key: 'depotName'},
    { title: '货架号', dataIndex: 'allShelves', key: 'allShelves'},
    { title: '预警上限', dataIndex: 'stockMax', key: 'stockMax'},
    { title: '预警下限', dataIndex: 'stockMin', key: 'stockMin'},
    { title: '总量', dataIndex: 'stock', key: 'stock'},
    { title: '操作', dataIndex: 'actions', key: 'actions', width: 200}
  ],

  tableDetailHead: [
    { title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
    { title: '货品编码', dataIndex: 'goodsCode', key: 'goodsCode' },
    { title: '品名规格', dataIndex: 'goodsName', key: 'goodsName'},
    { title: '单位', dataIndex: 'unit', key: 'unit'},
    { title: '所属仓库', dataIndex: 'depotName', key: 'depotName'},
    { title: '货架号', dataIndex: 'shelvesId', key: 'shelvesId' },
    { title: '类型', dataIndex: 'newType', key: 'newType'},
    { title: '单号', dataIndex: 'orderNumber', key: 'orderNumber'},
    { title: '出入库时间', dataIndex: 'createTime', key: 'createTime'},
    { title: '出入库数量', dataIndex: 'inputOutputNum', key: 'inputOutputNum'},
    { title: '操作', dataIndex: 'actions', key: 'actions', width: 100}
  ]
}
