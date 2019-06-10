export default {
	goodsTableHead: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum'},
		{ title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
		{ title: '下单时间', dataIndex: 'createTime', key: 'createTime'},
		{ title: '下单门店名称', dataIndex: 'storeName', key: 'storeName'},
		{ title: '关联销售出库单编号', dataIndex: 'leaveWarehouseNo', key: 'leaveWarehouseNo'},
		{ title: '关联销售退货单编号', dataIndex: 'returnApplyNo', key: 'returnApplyNo'},
		{ title: '销售员/收银员', dataIndex: 'createEmployeeName', key: 'createEmployeeName'},
		{ title: '订单实收金额', dataIndex: 'totalAmount', key: 'totalAmount'},
		{ title: '订单来源', dataIndex: 'type', key: 'type', width: '5%'},
		{ title: '订单状态', dataIndex: 'changeTradeStatus', key: 'changeTradeStatus'},
		{ title: '支付状态', dataIndex: 'changePayStatus', key: 'changePayStatus'},
		{ title: '操作', dataIndex: 'actions', key: 'actions', width: 200},
	],
	detailGoodsTableHead: [
		{title: '商品名称', dataIndex: 'goodsName', key: 'goodsName'},
		{title: '商品编号', dataIndex: 'goodsHrNo', key: 'goodsHrNo' },
		{title: '单位', dataIndex: 'priceUnitName', key: 'priceUnitName' },
		{title: '销售价(元)', dataIndex: 'marketPrice', key: 'marketPrice'},
		{title: '购买价(元)', dataIndex: 'unitPrice', key: 'unitPrice'},
		{title: '数量', dataIndex: 'goodsNum', key: 'goodsNum' },
		{title: '获取积分', dataIndex: 'returnIntegral', key: 'returnIntegral' },
		{title: '应付金额', dataIndex: 'subtotal', key: 'subtotal' },
		{title: '备注', dataIndex: 'remark', key: 'remark' },
	],
	AddModalColumns: [
		{
			title: '操作',
			width: '10%',
			dataIndex: 'addAndDelete',
		  },
		  {
			title: '操作',
			width: '8%',
			dataIndex: 'operation',
		  },
		  {
			title: '商品编号',
			dataIndex: 'goodsCode',
			editable: true,
			required: false,
			type: 'input'
		  },
		  {
			title: '商品名称',
			dataIndex: 'goodsName',
			editable: true,
			required: false,
			type: 'input'
		  },
		  {
			title: '规格型号',
			dataIndex: 'size',
			editable: true,
			required: false,
			type: 'input'
		  },
		  {
			title: '单位',
			dataIndex: 'unit',
			editable: true,
			required: false,
			type: 'input'
		  },

		  {
			title: '单价(元)',
			dataIndex: 'shelfNum',
			required: true,
			width: '15%',
			editable: true,
			type: 'select',
			options:[]
		  },
		  {
			title: '数量',
			dataIndex: 'num',
			editable: true,
			required: false,
			type: 'number',
		  },
		  {
			title: '获取积分',
			dataIndex: 'batch',
			required: false,
			editable: true,
			type: 'input'
		  },
		  {
			title: '应付金额',
			dataIndex: 'time',
			editable: true,
			required: false,
			type: 'input'
		  },
		  {
			title: '是否有赠品',
			dataIndex: 'remark',
			required: false,
			editable: true,
			type: 'input'
		  },
		  {
			title: '备注',
			dataIndex: 'remark',
			required: false,
			editable: true,
			type: 'input'
		  },
	],
	disCountTableHead: [
		{ title: '赠品编号', dataIndex: 'companyOrStoreName', key: 'companyOrStoreName'},
		{ title: '赠品名称', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '规格型号', dataIndex: 'province', key: 'province' },
		{ title: '单位', dataIndex: 'city', key: 'city'},
		{ title: '赠送数量', dataIndex: 'region', key: 'area'},
		{ title: '备注', dataIndex: 'remark', key: 'province' },
	],
	baseTableHead: [
		{ title: '订单状态', dataIndex: 'changeTradeStatus', key: 'changeTradeStatus',},
		{ title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
		{ title: '下单时间', dataIndex: 'createTime', key: 'createTime'},
		{ title: '订单来源', dataIndex: 'type', key: 'type'},
		{ title: '下单门店', dataIndex: 'storeName', key: 'storeName'},
		{ title: '销售员/收银员', dataIndex: 'createEmployeeName', key: 'createEmployeeName'},
		{ title: '导购员', dataIndex: 'guideMan', key: 'guideMan'},
		{ title: '实付金额', dataIndex: 'totalAmount', key: 'totalAmount' },
		{ title: '获取积分', dataIndex: 'totalReturnIntegral', key: 'totalReturnIntegral'},
		{ title: '购买数量', dataIndex: 'buyCount', key: 'buyCount' },
	],
	goodsTableHeadList: [
		{ title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '商品名称', dataIndex: 'k3Code', key: 'code' },
		{ title: '商品编号', dataIndex: 'depotName', key: 'storeName'},
		{ title: '单位', dataIndex: 'belongCompanyName', key: 'belongCompanyName'},
		{ title: '单价(元)', dataIndex: 'companyOrStoreName', key: 'companyOrStoreName'},
		{ title: '数量', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '获取积分', dataIndex: 'province', key: 'province' },
		{ title: '应付金额(元)', dataIndex: 'depotCode', key: 'storeNumber'},
		{ title: '是否有赠品', dataIndex: 'province', key: 'province' },
		{ title: '备注', dataIndex: 'remark', key: 'province' },
	],
	payTableHead: [
		{ title: '支付状态', dataIndex: 'trade', key: 'trade',},
		{ title: '交易号', dataIndex: 'tradeNo', key: 'tradeNo' },
		{ title: '支付方式', dataIndex: 'payWayName', key: 'payWayName'},
		{ title: '支付时间', dataIndex: 'createTime', key: 'createTime'},
		{ title: '应付金额', dataIndex: 'orderAmount', key: 'orderAmount'},
		{ title: '抹零金额', dataIndex: 'wipePrice', key: 'wipePrice'},
		{ title: '实付金额', dataIndex: 'totalAmount', key: 'totalAmount' },
		{ title: '支付来源', dataIndex: 'paySource', key: 'paySource'},
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
	invoiceTableHead: [
		{ title: '是否需要发票', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '发票类型', dataIndex: 'k3Code', key: 'code' },
		{ title: '发票抬头', dataIndex: 'depotName', key: 'storeName'},
		{ title: '收票人信息', dataIndex: 'belongCompanyName', key: 'belongCompanyName'},
		{ title: '发票内容', dataIndex: 'companyOrStoreName', key: 'companyOrStoreName'},
	],
	operateTableHead: [
		{ title: '操作人', dataIndex: 'serialNum', key: 'serialNum',},
		{ title: '时间', dataIndex: 'k3Code', key: 'code' },
		{ title: '操作类别', dataIndex: 'depotName', key: 'storeName'},
		{ title: '操作日志', dataIndex: 'belongCompanyName', key: 'belongCompanyName'},
	]
}
