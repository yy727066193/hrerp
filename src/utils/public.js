import {SESSION_LOGIN_KEY, SYS_ID} from "../conf";
/**
 * 缓存登录信息
 * @param {object} data 登录服务端返回的object
 * */
export function saveLoginInfo(data) {
  SESSION_LOGIN_KEY.forEach((item) => {
    const { key, type } = item;

    if (data[key] || data[key] === 0) {
      if (type === 'object')
        sessionStorage.setItem(`__${key}__`, JSON.stringify(data[key]));
      else
        sessionStorage.setItem(`__${key}__`, data[key])
    }
  })
}

/**
 * 获取登录信息
 * */
export function getLoginInfo () {
  const obj = {};

  SESSION_LOGIN_KEY.forEach((item) => {
    const { key, type } = item;
    if (type === 'object')
      obj[key] = JSON.parse(sessionStorage.getItem(`__${key}__`));
    else
      obj[key] = sessionStorage.getItem(`__${key}__`);
  });

  obj.modules = searchList(JSON.parse(sessionStorage.getItem(`__systemList__`)), 'sysId', SYS_ID).moduleList || [];

  return obj;
}

/**
 * 移除登录缓存
 * */
export function clearLoginInfo() {
  SESSION_LOGIN_KEY.forEach((item) => {
    sessionStorage.removeItem(`__${item.key}__`)
  })
}

/**
 * 搜索list
 * @param {array}  targetList 被查询的list
 * @param {string} searchKey  被查询的key
 * @param          searchData 关键字符串
 * */
export function searchList(targetList, searchKey, searchData) {
  if (!targetList || !searchKey) {
    return ''
  }

  const findArr = targetList.filter(item => item[searchKey] === searchData);

  if (!findArr) {
    return ''
  }

  if (findArr.length === 0) {
    return ''
  }

  return findArr[0]
}

/**
 * 是否有权限
 * @param {string} path  检查的路由地址
 * @param {string} action 某一操作的enums
 * */
export function setAction(path, action) {
  const actions = getLoginInfo().actions;
  const obj = searchList(actions, 'path', path);
  if (!obj) {
    return false;
  } else {
    if (!obj.actionVals) {
      return false;
    } else {
      return obj.actionVals.split(',').indexOf(action) !== -1;
    }
  }
}


/**
 * 获取url上的参数
 * @param {string} name 需要获取的参数名
 * */
export function getUrlParams(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return null;
}

/**
 * formatModules
 * */
export function formatModulesToTree() {
  const data = getLoginInfo().modules;
  data.forEach(function (item) {
    delete item.modules;
  });

  let map = {};
  data.forEach(function (item) {
    map[item.id] = item;
  });

  let val = [];
  data.forEach(function (item) {
    // 以当前遍历项，的pid,去map对象中找到索引的id
    let parent = map[item.parentId];
    // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.modules || ( parent.modules = [] )).push(item);
    } else {
      //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
      val.push(item);
    }
  });
  return val;
}


/**
 * 找到第一个有path的菜单
 * */
export function getFirstModulesPath() {
  const modules = getLoginInfo().modules;
  let obj = {};
  for (let i = 0; i < modules.length; i++) {
    if (modules[i].path) {
      obj = modules[i];
      break;
    }
  }

  return obj;
}

// 获取省市区联动数据
export function getProvinceLinkage() {
  window.provinceCityAreaOption.forEach((item) => {
    item.label = item.areaName;
    item.value = item.areaName;
    item.children.forEach((childItem) => {
      childItem.label = childItem.areaName;
      childItem.value = childItem.areaName;
      if (childItem.children) {
        childItem.children.forEach((grandItem) => {
          grandItem.label = grandItem.areaName;
          grandItem.value = grandItem.areaName;
        })
      }
    })
  });

  return window.provinceCityAreaOption;
}


export function getTypeFont(id) {
  switch(id) {
    case 11:
      return '销售出库'
    case 12:
      return '采购退货出库'
    case 13:
      return '盘亏出库'
    case 14:
      return '调拨出库'
    case 15:
      return '其它出库'
    case 21:
      return '销售退货入库'
    case 22:
      return '采购入库'
    case 23:
      return '盘盈入库'
    case 24:
      return '调拨入库'
    case 25:
      return '其它入库'
    case 31: 
      return '门店调往公司'
    case 32: 
      return '公司调往门店'
    case 33: 
      return '门店调往门店'
    case 34: 
      return '公司调往公司'
    case 35: 
      return '内部仓库互调'
    default:
      return null;
  }
}

/**
 * json根据某一个key去重
 * @param {array}  arr   // 需要去重的数组
 * @param {string} attribute    // 根据什么key去重
 * */
export function uniqueJson (arr, attribute) {
  let new_arr = [];
  let json_arr = [];

  for (let i = 0; i < arr.length; i++) {
    if (new_arr.indexOf(arr[i][attribute]) === -1) {
      new_arr.push(arr[i][attribute]);
      json_arr.push(arr[i]);
    }
  }
  return json_arr;
}

/**
 * 数组排列组合
 * @param {array} arr  排列前的数组
 * @param {number} index 起始下标
 * */
export function getPermutationCombination(arr, index) {
  let results = [];
  let result = [];
  doExchange(arr, index);
  function doExchange(arr, index){
    for (var i = 0; i<arr[index].length; i++) {
        result[index] = arr[index][i];
        if (index !== arr.length - 1) {
            doExchange(arr, index + 1)
        } else {
          results.push([...result])
        }
    }
  };
  return results
};

