export default {
	outPutTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum', width: '5%'},
		{ title: '销售出库单编号', dataIndex: 'orderNumber', key: 'orderNumber' },
		{ title: '出库日期', dataIndex: 'inDate', key: 'inDate', width: '10%'},
		{ title: '仓库', dataIndex: 'createDepotName', key: 'createDepotName', width: '10%'},
		{ title: '关联订单编号', dataIndex: 'relationOrder', key: 'relationOrder',  width: '20%'},
		{ title: '备注', dataIndex: 'remark', key: 'remark',  width: '10%'},
		{ title: '操作', dataIndex: 'actions', key: 'action', width: 100},
	],
	SaleDetail: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '货品名称', dataIndex: 'goodsName', key: 'goodsName' },
		{ title: '货品编号', dataIndex: 'goodsCode', key: 'goodsCode'},
		// { title: '规格型号', dataIndex: 'belongCompanyName', key: 'belongCompanyName'},
		{ title: '单位', dataIndex: 'unit', key: 'unit'},
		{ title: '出库数量', dataIndex: 'inputOutputNum', key: 'inputOutputNum' },
		{ title: '备注', dataIndex: 'remark', key: 'action'},
	]
}
