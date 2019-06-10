import { observable, action } from 'mobx'

class Store {
  @observable
  sessionData = null;

  @observable
  loading = false; // 全局加载中

  @observable
  searchData = {}; // 搜索数据

  @observable
  pageNum = 1; // 分页

  @observable
  pageSize = 20; // 分页尺寸

  @observable
  total = 0; // 总条数

  @observable
  tableData = []; // 表格数据

  @observable
  tableLoading = false; // 表格是否加载中

  @observable
  submitType = false; // 新增还是编辑

  @observable
  modalVisible = false; // 弹窗开关

  @observable
  editIndex = 0; // 当前编辑行

  @observable
  tableRowData = {}; // 表格某一行的数据

  @observable
  productSpecTableData = {};   // 添加货品货品规格表格数据

  @observable
  otherModalVisible = false;

  @observable
  globalVisible = false;

  @observable
  noticeCount = 0; // 通知的个数

  @action
  setProductSpecTableData = (data) => {
    if (!data) {
      return;
    }

    this.productSpecTableData.productSpecList = data;
  };

  @action
  setCommon = (key, value) => { // 修改common数据
    this[key] = value;
  };

  @action
  addTableData = (data) => { // 表格插入数据
    if (!data) {
      return;
    }

    this.tableData.unshift(data);
  };

  @action
  setTableRowData = (data, index) => { // 修改某一行数据
    if (!data) {
      return;
    }
    Object.keys(data).forEach(key => this.tableData[index][key] = data[key])
  };

  @action
  removeTableData = (index) => { // 移除表格某一行数据
    this.tableData.splice(index, 1)
  };

  @action
  setDefault = () => { // 初始化
    this.loading = false;
    this.searchData = {};
    this.pageNum = 1;
    this.pageSize = 20;
    this.total = 0;
    this.tableData = [];
    this.tableLoading = false;
    this.submitType = false;
    this.modalVisible = false;
    this.editIndex = 0;
    this.tableRowData = {};
    this.productSpecTableData = [];
    this.otherModalVisible = false;
    this.globalVisible = false;
    this.noticeCount = 0;
  }
}

export default new Store();
