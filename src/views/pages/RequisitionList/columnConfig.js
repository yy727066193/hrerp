export default {
  tableHead: [
    { title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
    { title: '调拨单号', dataIndex: 'dbOrder', key: 'dbOrder' },
    { title: '调出仓库', dataIndex: 'dcDepotName', key: 'dcDepotName'},
    { title: '调入仓库', dataIndex: 'drDepotName', key: 'drDepotName',},
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime'},
    { title: '关联出库单编号', dataIndex: 'relationOutputOrder', key: 'relationOutputOrder'},
    { title: '关联入库单编号', dataIndex: 'relationInputOrder', key: 'relationInputOrder', },
    { title: '关联发运编码', dataIndex: 'relationFyOrderNumber', key: 'relationFyOrderNumber', },
    { title: '创建人', dataIndex: 'createPerson', key: 'createPerson'},
    { title: '审批状态', dataIndex: 'approverName', key: 'approverName'},
    { title: '备注', dataIndex: 'remark', key: 'remark'},
    { title: '操作', dataIndex: 'actions', key: 'actions'}
  ],
  detailTableHead: [
    { title: '序号', dataIndex: 'serialNum', key: 'serialNum',},
    { title: '调入仓库', dataIndex: 'drDepotName', key: 'drDepotName'},
    { title: '货品编号', dataIndex: 'goodsCode', key: 'goodsCode' },
    { title: '品名规格', dataIndex: 'goodsName', key: 'goodsName'},
    { title: '单位', dataIndex: 'unit', key: 'unit'},
    { title: '货架号', dataIndex: 'shelvesId', key: 'shelvesId'},
    { title: '调拨数量', dataIndex: 'num', key: 'num' },
    { title: '备注', dataIndex: 'remark', key: 'remark'},
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
      type: 'select',
      options: []
    },
    {
      title: '调拨数量',
      dataIndex: 'num',
      editable: true,
      required: true,
      type: 'number'
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

}
