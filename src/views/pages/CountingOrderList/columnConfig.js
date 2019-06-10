export default {
  tableData: [
    { title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
    { title: '单号', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime'},
    { title: '盘点日期', dataIndex: 'inventoryTime', key: 'inventoryTime'},
    { title: '仓库名称', dataIndex: 'depotName', key: 'depotName'},
    { title: '盘盈合计', dataIndex: 'profitNum', key: 'profitNum'},
    { title: '盘亏合计', dataIndex: 'lossNum', key: 'lossNum' },
    { title: '关联入库单编号', dataIndex: 'relationInputOrder', key: 'relationInputOrder'},
    { title: '关联出库单编号', dataIndex: 'relationOutputOrder', key: 'relationOutputOrder'},
    { title: '创建人', dataIndex: 'pdUser', key: 'pdUser'},
    { title: '备注', dataIndex: 'remark', key: 'remark'},
    { title: '操作', dataIndex: 'actions', key: 'actions', width: 200}
  ],
  addOrderHead: [
    { title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
    { title: '编码', dataIndex: 'goodsCode', key: 'goodsCode' },
    { title: '品名规格', dataIndex: 'goodsName', key: 'goodsName'},
    { title: '货架号', dataIndex: 'shelvesId', key: 'shelvesId'},
    { title: '生产批号', dataIndex: 'produceNum', key: 'produceNum'},
    { title: '生产日期', dataIndex: 'produceTime', key: 'produceTime' },
    { title: '单位', dataIndex: 'unit', key: 'unit'},
    { title: '系统数量', dataIndex: 'sysNum', key: 'sysNum'},
    { title: '盘点数量', dataIndex: 'pdNum', key: 'pdNum'},
    { title: '盘盈盘亏', dataIndex: 'posOrNeg', key: 'posOrNeg'},
    { title: '备注', dataIndex: 'remark', key: 'remark'}
  ],
  detailTableHead: [
    { title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
    { title: '编码', dataIndex: 'goodsCode', key: 'goodsCode' },
    { title: '品名规格', dataIndex: 'goodsName', key: 'goodsName'},
    { title: '货架号', dataIndex: 'shelvesId', key: 'shelvesId'},
    { title: '生产批号', dataIndex: 'batchNumber', key: 'batchNumber'},
    { title: '生产日期', dataIndex: 'productionTime', key: 'productionTime' },
    { title: '单位', dataIndex: 'unit', key: 'unit'},
    { title: '系统数量', dataIndex: 'sysNum', key: 'sysNum'},
    { title: '盘点数量', dataIndex: 'pdNum', key: 'pdNum'},
    { title: '盘盈盘亏', dataIndex: 'profitLoss', key: 'profitLoss'},
    { title: '备注', dataIndex: 'remark', key: 'remark'},
  ]
}
