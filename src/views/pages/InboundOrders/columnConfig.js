export default  {
  Columns: [{
      title: '序号',
      dataIndex: 'serialNum',
      key: 'serialNum',
    },
    {
      title: '入库单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '类型',
      dataIndex: 'orderType',
      key: 'orderType'
    },
    {
      title: '关联单据编号',
      dataIndex: 'relationOrder',
      key: 'relationOrder'
    },
    {
      title: '所属仓库',
      dataIndex: 'createDepotName',
      key: 'createDepotName'
    },
    {
      title: '创建人',
      dataIndex: 'createPerson',
      key: 'createPerson'
    },
    {
      title: '当前审批人',
      dataIndex: 'nowApprovalName',
      key: 'nowApprovalName'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '往来单位',
      dataIndex: 'dealingsUnit',
      key: 'dealingsUnit'
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      width: 200
    }
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
      title: '货品编号',
      width: '10%',
      dataIndex: 'goodsCode',
      editable: true,
      required: true,
      type: 'select'
    },
    {
      title: '货品名称及规格型号',
      width: '10%',
      dataIndex: 'goodsName',
      editable: true,
      required: true,
      type: 'select'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      editable: true,
      required: true,
      type: 'input'
    },

    {
      title: '货架号',
      dataIndex: 'shelfNum',
      required: false,
      width: '15%',
      editable: true,
      type: 'select'
    },
    {
      title: '入库数量',
      dataIndex: 'num',
      editable: true,
      required: true,
      type: 'number',
    },
    {
      title: '生产批号',
      dataIndex: 'batch',
      required: false,
      editable: true,
      type: 'input'
    },
    {
      title: '生产日期',
      dataIndex: 'time',
      editable: true,
      required: false,
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
  detailTableHead: [
    {
      title: '序号',
      dataIndex: 'serialNum',
      key: 'actions'
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'actions'
    },
    {
      title: '货品编号',
      dataIndex: 'goodsCode',
      key: 'actions'
    },
    {
      title: '货架号',
      dataIndex: 'shelvesId',
      key: 'actions'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'actions'
    },
    {
      title: '入库数量',
      dataIndex: 'inputOutputNum',
      key: 'actions'
    },
    {
      title: '备注',
      dataIndex: 'detailsRemark',
      key: 'actions'
    },
    {
      title: '生产批号',
      dataIndex: 'batchNumber',
      key: 'actions'
    },
    {
      title: '生产日期',
      dataIndex: 'productionTime',
      key: 'actions'
    },

  ],
  logTableHead: [
    {
      title: '操作人',
      dataIndex: 'approvalName',
      key: 'actions'
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'actions'
    },
    {
      title: '审批结果',
      dataIndex: 'approvalStatus',
      key: 'actions'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'actions'
    },
  ]
}
