export default {
	InStoreTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum'},
		{ title: '退货入库单编号', dataIndex: 'orderNumber', key: 'orderNumber' },
		{ title: '入库日期', dataIndex: 'inDate', key: 'inDate'},
		{ title: '仓库', dataIndex: 'createDepotName', key: 'createDepotName'},
    { title: '关联订单编号', dataIndex: 'relationOrder', key: 'relationOrder'},
		{ title: '关联退货单编号', dataIndex: 'returnOrderNo', key: 'returnOrderNo'},
		{ title: '备注', dataIndex: 'remark', key: 'remark'},
		{ title: '操作', dataIndex: 'actions', key: 'action', width: 100},
	],
	DetailTableHead: [
		{title: '序号',dataIndex: 'serialNum',key: 'serialNum'},
    {title: '货品名称',dataIndex: 'goodsName',key: 'goodsName'},
    {title: '货品编号',dataIndex: 'goodsCode',key: 'goodsCode'},
    {title: '货架号',dataIndex: 'shelvesId',key: 'shelvesId'},
    {title: '单位',dataIndex: 'unit',key: 'unit'},
    {title: '入库数量',dataIndex: 'inputOutputNum',key: 'inputOutputNum'},
    {title: '备注',dataIndex: 'detailsRemark',key: 'detailsRemark'},
	]
}
