export default {
	returnOrderTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum', },
		{ title: '销售退货单编号', dataIndex: 'returnNo', key: 'returnNo' },
		{ title: '退货时间', dataIndex: 'createTime', key: 'createTime' },
		{ title: '申请门店名称', dataIndex: 'storeName', key: 'storeName' },
		{ title: '退货结果', dataIndex: 'typeName', key: 'typeName' },
		{ title: '关联订单编号', dataIndex: 'orderBaseNo', key: 'orderBaseNo' },
		{ title: '关联销售出库单编号', dataIndex: 'leaveWarehouseNo', key: 'leaveWarehouseNo' },
		{ title: '最后审批时间', dataIndex: 'updateTime', key: 'updateTime' },
		{ title: '退款状态', dataIndex: 'returnMoney', key: 'returnMoney' },
		{ title: '退货单状态', dataIndex: 'returnStatus', key: 'returnStatus' },
		{ title: '操作', dataIndex: 'actions', key: 'actions', width: 200},
	],
	operationTableHead: [
		{
			title: '操作',
			width: '8%',
			dataIndex: 'addAndDelete',
		},
		{
			title: '操作',
			width: '8%',
			dataIndex: 'operation',
		},
		{
			title: '商品编号',
			dataIndex: 'goodsHrNo',
			editable: false,
			type: 'input'
		},
		{
			title: '商品名称',
			dataIndex: 'goodsName',
			required: true,
			editable: false,
			type: 'input'
		},
		{
			title: '剩余可退数量',
			dataIndex: 'goodsNum',
			required: true,
			editable: true,
			disabled: true,
			type: 'input'
		},

		{
			title: '单位',
			dataIndex: 'priceUnitName',
			required: true,
			editable: false,
			type: 'input'
		},
		{
			title: '退货数',
			dataIndex: 'returnMoney',
			editable: true,
			type: 'number',
			canChange: true,
			required: true
		},
		{
			title: '退货单价',
			dataIndex: 'unitPrice',
			required: true,
			editable: true,
			disabled: true,
			type: 'input',
		},
		{
			title: '小计',
			dataIndex: 'subtotal',
			required: true,
			editable: true,
			disabled: true,
			type: 'input'
		},
		{
			title: '扣减积分',
			dataIndex: 'returnIntegral',
			required: true,
			editable: true,
			disabled: true,
			type: 'input'
		},
		{
			title: '备注',
			dataIndex: 'remark',
			editable: false,
			type: 'input'
		},
	],
	disCountTableHead: [
		{ title: '赠品编号', dataIndex: 'companyOrStoreName', key: 'companyOrStoreName'},
		{ title: '赠品名称', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '规格型号', dataIndex: 'province', key: 'province' },
		{ title: '单位', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '剩余可退数量', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '退货数', dataIndex: 'province', key: 'province' },
		{ title: '备注', dataIndex: 'province', key: 'province' },
	],
	memberTableHead: [
		{ title: '会员姓名', dataIndex: 'name', key: 'name',},
		{ title: '手机号', dataIndex: 'mobile', key: 'mobile' },
		{ title: '会员卡号', dataIndex: 'cardNo', key: 'cardNo'},
		{ title: '地址', dataIndex: 'address', key: 'address'},
		{ title: '会员注册门店', dataIndex: 'storeName', key: 'storeName'},
		{ title: '会员积分', dataIndex: 'nowIntegral', key: 'nowIntegral'},
		{ title: '会员等级', dataIndex: 'province', key: 'province' },
	],
	operateTableHead: [
		{ title: '操作人', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '时间', dataIndex: 'k3Code', key: 'code' },
		{ title: '操作类别', dataIndex: 'depotName', key: 'storeName'},
		{ title: '操作日志', dataIndex: 'belongCompanyName', key: 'belongCompanyName'},
	],
	goodsTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '商品编号', dataIndex: 'goodsHrNo', key: 'goodsHrNo' },
		{ title: '入库单编号', dataIndex: 'putInNo', key: 'putInNo' },
		{ title: '商品名称', dataIndex: 'goodsName', key: 'goodsName'},
		{ title: '剩余可退数量', dataIndex: 'goodsNum', key: 'goodsNum'},
		{ title: '单位', dataIndex: 'priceUnitName', key: 'priceUnitName'},
		{ title: '退货数', dataIndex: 'returnMoney', key: 'returnMoney' },
		{ title: '退货单价(元)', dataIndex: 'unitPrice', key: 'unitPrice'},
		{ title: '小计(元)', dataIndex: 'subtotal', key: 'subtotal'},
		{ title: '扣减积分', dataIndex: 'returnIntegral', key: 'returnIntegral' },
		{ title: '备注', dataIndex: 'remark', key: 'remark' },
	],
	giftTableHead: [
		{ title: '赠品编号', dataIndex: 'companyOrStoreName', key: 'companyOrStoreName'},
		{ title: '赠品名称', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '规格型号', dataIndex: 'province', key: 'province' },
		{ title: '单位', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '剩余可退数量', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '退货数', dataIndex: 'province', key: 'province' },
		{ title: '备注', dataIndex: 'remark', key: 'remark' },
	],
	editTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '商品编号', dataIndex: 'goodsHrNo', key: 'goodsHrNo' },
		{ title: '商品名称', dataIndex: 'goodsName', key: 'goodsName'},
		{ title: '签收数量', dataIndex: 'saveGoodsNum', key: 'saveGoodsNum', required: true,  editable: true, width: '15%'},
	],
	logisticsApprovalHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '商品编号', dataIndex: 'goodsHrNo', key: 'goodsHrNo' },
		{ title: '商品名称', dataIndex: 'goodsName', key: 'goodsName'},
		{ title: '入库数量', dataIndex: 'saveGoodsNum', key: 'saveGoodsNum', required: true,  editable: true, type: 'input', width: '15%'},
		{ title: '入库仓', dataIndex: 'store', key: 'store', required: true,  editable: true, type: 'select', width: '20%'},
	],
	littleCustomerTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '商品编号', dataIndex: 'goodsHrNo', key: 'goodsHrNo' },
		{ title: '商品名称', dataIndex: 'goodsName', key: 'goodsName'},
		{ title: '单位', dataIndex: 'priceUnitName', key: 'priceUnitName', type: 'input', },
		{ title: '签收数量', dataIndex: 'serviceNum', key: 'serviceNum', type: 'input', }
	],
	littleLogisticsTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '商品编号', dataIndex: 'goodsHrNo', key: 'goodsHrNo' },
		{ title: '商品名称', dataIndex: 'goodsName', key: 'goodsName'},
		{ title: '单位', dataIndex: 'priceUnitName', key: 'priceUnitName', type: 'input', },
		{ title: '入库数量', dataIndex: 'logisticsNum', key: 'logisticsNum', type: 'input', },
		{ title: '入库仓', dataIndex: 'warehouseName', key: 'warehouseName', type: 'input', },
	]
}
