import React from 'react'
import {inject, observer} from 'mobx-react'
import { Button, Popconfirm, Form, Input, InputNumber, Select, Checkbox, Collapse, Icon, Cascader, Upload, Modal, message } from 'antd'
import '../../../assets/style/common/pageItem.less'
import './index.less'
import api from '../../../service/api'
import { Bread } from '../../../components'
import {getLoginInfo, searchList, getPermutationCombination, uniqueJson} from "../../../utils/public";
import GoodsCenterService from "../../../service/GoodsCenterService";
import formConfig from './FormConfig'
import ProductSpecTable from './ProductSpecTable'
import {SUCCESS_CODE, IMG_SIZE, VIDEO_SIZE} from "../../../conf/index";
import helper from '../../../utils/helper';
import { validChar } from '../../../utils/RegExps';

const PATH = 'addUpdateGoods';
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 18, offset: 6 },
  },
};
let packingSpecId = 0;   // 包装规格批量添加起始值
let productSpecId = 0;   // 货品规格批量添加起始值
let productSpecIds = [];   // 货品规格选中项数组
let productSpecSonData = [];   // 货品规格子级下拉选择项
let heavyUnit = 'kg/件';   // 体重单位
let volumeUnit = 'm³/件';   // 体积单位
let expirationDate = [{id: 1, name: '年'}, {id: 2, name: '月'}, {id: 3, name: '天'}];   // 保质期单位
let goodsPackingUnitDataArr = [];   // 包装规格下拉数据
let fullData = {};   // 请求后台传输的数据
let goodsSkuList = [];
let isProductSpecVerify = true;   // 货品规格验证
let isProductSpecTableVerify = true;   // 货品规格表格中的值验证

@inject('store')
@observer
class AddUpdateGoodsForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      goodsTypeList: [],   // 货品类别

      goodsCategoriesData: [],   // 货品分类(下拉用)
      goodsBrandData: [],   // 货品品牌(下拉用)
      goodsProviderData: [],   // 货品供应商(下拉用)
      goodsTypeData: [],   // 货品类别(下拉用)
      goodsBaseUnitData: [],   // 基础单位(下拉用)
      goodsPackingUnitData: [],   // 组合单位(下拉用)
      productSpecData: [],   // 货品规格(下拉用)
      goodsLabelData: [],   // 货品标签(下拉用)

      productSpecParentList: [],   // 货品规格表格表头(父级)动态部分数据
      productSpecSonList: [],   // 货品规格表格表头(父级)动态部分数据
      isProductSpecTable: false,   // 货品规格表格是否渲染
      ProductSpecTableList: [],   // 表格数据

      mainImgsPreviewVisible: false,
      mainImgsPreviewImage: '',
      mainImgsFileList: [],
      mainImgsFileType: '.jpg, .gif, .png',

      videosFileList: [],
      videosFileType: '.mp4, .avi, .mkv',

      detailImgsPreviewVisible: false,
      detailImgsPreviewImage: '',
      detailImgsFileList: [],

      qualificationUrlPreviewVisible: false,
      qualificationUrlPreviewImage: '',
      qualificationUrlFileList: [],

      succeedModalVisible: false,   // 添加成功后提示框
    }
  };

  getData = async () => {
    const goodsTypeData = await GoodsCenterService.GoodsType.listAll({ parentId: 0, goodsTypeId: 1, pageSize: 99999 });
    const propData = await GoodsCenterService.AddUpdateGoods.setProp();
    const productSpecData = await GoodsCenterService.UnitModel.selectAll({pageNum: 1, pageSize: 999999});
    const goodsLabelData = await GoodsCenterService.GoodsLabel.selectAll({pageNum: 1, pageSize: 999999});

    this.setState({
      goodsCategoriesData: goodsTypeData.data.list,
      goodsBrandData: propData.data.goodsBrand,
      goodsProviderData: propData.data.goodsProvider,
      goodsTypeData: propData.data.goodsType,
      goodsBaseUnitData: propData.data.goodsBaseUnit,
      goodsPackingUnitData: propData.data.goodsPackingUnit,
      productSpecData: productSpecData.data.list,
      goodsLabelData: goodsLabelData.data.list,
    })
  };

  handleSubmit = () => {   // 点击保存提交数据
    const { goodsBrandData,
            goodsLabelData,
            productSpecData,
            goodsBaseUnitData,
            goodsProviderData,
            goodsTypeData,
            goodsTypeList,
            mainImgsFileList,
            videosFileList,
            detailImgsFileList,
            qualificationUrlFileList } = this.state;
    const { productSpecTableData } = this.props.store;

    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      isProductSpecTableVerify = true; 

      goodsBrandData.forEach(item => {   // 货品品牌id转换成对象
        if(item.id === values.goodsBrand) {
          fullData.goodsBrand = item;
        }
      });

      goodsBaseUnitData.forEach(item => {   // 计价单位和库存单位id转换成对象
        if(item.id === values.priceUnit) {
          fullData.goodsPriceUnit = item;   // 计价单位
          fullData.goodsStockUnit = item;   // 库存单位
        }
      });

      goodsProviderData.forEach(item => {   // 货品供应商id转换成对象
        if(item.id === values.goodsProvider) {
          fullData.goodsProvider = item;
        }
      });

      if(!goodsTypeList.length) {
        message.warning('请选择货品类别！');
        return;
      }

      goodsTypeData.forEach(itemOne => {   // 商品类别转换
        goodsTypeList.forEach((itemTow, indexTow) => {
          if(itemOne.id === itemTow) {
            fullData.goodsTypeList[indexTow] = itemOne;
          }
        })
      })

      if(values.goodsKeywordsList) {   // 标签格式转换
        let arr = [];
        goodsLabelData.forEach(itemOne => {
          values.goodsKeywordsList.forEach(itemTow => {
            if(itemOne.id === itemTow) {
              arr.push(itemOne);
            }
          })
        })
        fullData.goodsKeywordsList = [...arr];
      }

      if(productSpecTableData.productSpecList && productSpecTableData.productSpecList.length) {
        goodsSkuList = [];
        productSpecTableData.productSpecList.forEach((itemOne, indexOne) => {
          let goodsBaseSpuList = [];
          itemOne.forEach(itemTow => {
            goodsBaseSpuList.push(itemTow);
          })
          if(!itemOne.k3No) {
            message.warning('请填写货品编码！');
            isProductSpecTableVerify = false;
            return;
          }
          if(!validChar.test(itemOne.k3No)) {
            message.warning('请勿输入特殊字符！');
            isProductSpecTableVerify = false;
            return;
          }
          // if(!itemOne.barcode) {
          //   message.warning('请填写条形码！');
          //   isProductSpecTableVerify = false;
          //   return;
          // }
          let goodsPackingUnitList = [];
          if(itemOne.goodsPackingUnitList) {
            itemOne.goodsPackingUnitList.forEach(itenFree => {
              goodsPackingUnitList.push(itenFree.packingSpecUnit)
            })
          } else {
            message.warning('请填写完整包装规格！');
            isProductSpecTableVerify = false;
            return;
          }
          goodsSkuList[indexOne] = { 'goodsBaseSpuList': goodsBaseSpuList.length ? goodsBaseSpuList : null,
                                    'barcode': itemOne['barcode'] ? itemOne['barcode'] : null,
                                    'k3No': itemOne['k3No'] ? itemOne['k3No'] : null,
                                    'goodsPackingUnitList': goodsPackingUnitList ? goodsPackingUnitList : null,
                                    'goodsPresentation': itemOne.goodsPresentation,
                                    'goodsExtendedAttribute': itemOne.goodsExtendedAttribute,
                                    'goodsKeywordsList': itemOne.goodsKeywordsList
                                  };
        })
      } else {
        message.warning('请选择货品规格，生成表格并填写信息！');
        isProductSpecTableVerify = false;
        return;
      }

      if(isProductSpecTableVerify) {
        // if(values.productSpecParent) {
        //   const productSpecParentArr = [];
        //   const productSpecSonArr = [];
        //   values.productSpecParent.forEach(item => {   // 若有删除将其key重置
        //     productSpecParentArr.push(item)
        //   })
        //   values.productSpecSon.forEach(item => {   // 若有删除将其key重置
        //     productSpecSonArr.push(item)
        //   })
        //   let goodsSpuList = [];
        //   productSpecData.forEach(itemOne => {
        //     productSpecParentArr.forEach((itemTow, indexTow) => {
        //       if(itemOne.id === itemTow[0]) {
        //         const arr = [];
        //         itemOne.goodsBaseSpuList.forEach(itemTree => {
        //           if(productSpecSonArr[indexTow][1].indexOf(itemTree.id) !== -1) {
        //             arr.push(itemTree)
        //           }
        //         })
        //         itemOne.goodsBaseSpuList = arr;
        //         goodsSpuList.push(itemOne);
        //       }
        //     })
        //   })
        //   fullData.goodsSpuList = [...goodsSpuList];
        // }

        if(goodsSkuList && goodsSkuList.length) {   // 根据最终表格无论删除与否，拼接spu对象
          const arr = [];
          goodsSkuList.forEach((itemOne) => {
            itemOne.goodsBaseSpuList.forEach((itemTwo) => {
              arr.push(itemTwo)
            })
          })
          let goodsSpuList = [];
          productSpecData.forEach(itemTree => {
            const supArr = [];
            uniqueJson(arr, 'id').forEach(itemFour => {
              if(itemTree.id === itemFour.parentId) {
                supArr.push(itemFour)
              }
            })
            if(supArr.length) {
              itemTree.goodsBaseSpuList = [...supArr]
              goodsSpuList.push(itemTree);
            }
          })
          fullData.goodsSpuList = [...goodsSpuList];
        }

        fullData.createEId = getLoginInfo().employee.id;
        fullData.createEName = getLoginInfo().employee.name;
        fullData.companyId = getLoginInfo().companyId;
        fullData.goodsSkuList = goodsSkuList;
        fullData.name = values.name;
        fullData.k3No = values.k3No;
        fullData.categoriesId = values.categoriesId[values.categoriesId.length - 1];
        fullData.goodsTypeList = goodsTypeList;
        const qualificationUrlList = [];
        if(qualificationUrlFileList.length) {
          qualificationUrlFileList.forEach(item => {
            qualificationUrlList.push(item.response.data)
          })
        }
        fullData.qualificationUrl = qualificationUrlList.length ? qualificationUrlList.join(',') : null;

        let goodsExtendedAttribute = {};
        goodsExtendedAttribute.shortName = values.shortName ? values.shortName : null;
        goodsExtendedAttribute.helpCode = values.helpCode ? values.helpCode : null;
        goodsExtendedAttribute.marketPrice = values.marketPrice ? values.marketPrice * 100 : null;
        goodsExtendedAttribute.costPrice = values.costPrice ? values.costPrice * 100 : null;
        goodsExtendedAttribute.heavy = values.heavy ? values.heavy : null;
        goodsExtendedAttribute.longth = values.longth ? values.longth : null;
        goodsExtendedAttribute.width = values.width ? values.width : null;
        goodsExtendedAttribute.height = values.height ? values.height : null;
        goodsExtendedAttribute.volume = values.volume ? values.volume.toFixed(2) : null;
        goodsExtendedAttribute.heavyUnit = heavyUnit ? heavyUnit : null;
        goodsExtendedAttribute.volumeUnit = volumeUnit ? volumeUnit : null;
        if(values.expirationDateUnit && values.expirationDate) {
          if(values.expirationDateUnit === 1) {
            values.expirationDate = values.expirationDate * 365;
          } else if(values.expirationDateUnit === 2) {
            values.expirationDate = values.expirationDate * 30;
          }
        }
        goodsExtendedAttribute.expirationDate = values.expirationDate ? values.expirationDate : null;
        goodsExtendedAttribute.createArea = values.createArea ? values.createArea : null;
        fullData.goodsExtendedAttribute = {...goodsExtendedAttribute};

        let goodsPresentation = {};
        goodsPresentation.sortId = values.sortId ? values.sortId : null;
        const mainImgsList = [];
        if(mainImgsFileList.length) {
          mainImgsFileList.forEach(item => {
            mainImgsList.push(item.response.data)
          })
        }
        goodsPresentation.mainImgs = mainImgsList.length ? mainImgsList.join(',') : null;
        const videosList = [];
        if(videosFileList.length) {
          videosFileList.forEach(item => {
            videosList.push(item.response.data)
          })
        }
        goodsPresentation.videos = videosList.length ? videosList.join(',') : null;
        const detailImgsList = [];
        if(detailImgsFileList.length) {
          detailImgsFileList.forEach(item => {
            detailImgsList.push(item.response.data)
          })
        }
        goodsPresentation.detailImgs = detailImgsList.length ? detailImgsList.join(',') : null;
        goodsPresentation.description = values.description ? values.description : null;
        fullData.goodsPresentation = {...goodsPresentation};

        this.addSubmit({...fullData});
      }
    });
  };

  addSubmit = async (params) => {
    // console.log(params)
    // console.log(JSON.stringify(params))
    const { setCommon } = this.props.store;
    setCommon('loading', true);
    const { code, msg } = await GoodsCenterService.AddUpdateGoods.addOne(JSON.parse(JSON.stringify(params)));
    setCommon('loading', false);
    if(code !== SUCCESS_CODE) {
      message.error(msg);
      return;
    }
    this.setState({succeedModalVisible: true})
    // message.success('恭喜您，货品添加成功!');
  }

  handleCancelMainImgs = () => this.setState({ mainImgsPreviewVisible: false })

  handlePreviewMainImgs = (file) => {
    this.setState({
      mainImgsPreviewImage: file.url || file.thumbUrl,
      mainImgsPreviewVisible: true,
    });
  }

  handleChangeMainImgs = (e) => {
    if(e.file.status) {
      this.setState({ mainImgsFileList: e.fileList });
    }
  };

  hlandChangVideos = (e) => {
    if(e.file.status) {
      this.setState({ videosFileList: e.fileList });
    }
  };

  handleCancelDetailImgs = () => this.setState({ detailImgsPreviewVisible: false })

  handlePreviewDetailImgs = (file) => {
    this.setState({
      detailImgsPreviewImage: file.url || file.thumbUrl,
      detailImgsPreviewVisible: true,
    });
  }

  handleChangeDetailImgs = (e) => {
    if(e.file.status) {
      this.setState({ detailImgsFileList: e.fileList });
    }
  };

  handleCancelQualificationUrl = () => this.setState({ qualificationUrlPreviewVisible: false })

  handlePreviewQualificationUrl = (file) => {
    this.setState({
      qualificationUrlPreviewImage: file.url || file.thumbUrl,
      qualificationUrlPreviewVisible: true,
    });
  }

  handleChangeQualificationUrl = (e) => {
    if(e.file.status) {
      this.setState({ qualificationUrlFileList: e.fileList });
    }
  };

  beforeUpload = (maxSize, file) => {
    if (file.size/1024 <= maxSize) {
      return true;
    } else {
      helper.W('上传文件过大');
      return false;
    }
  };

  checkBoxChange = (e) => {   // 货品类别多选框变化
    if(e.target.checked) {
      this.state.goodsTypeList.push(e.target.value)
    } else {
      this.state.goodsTypeList.forEach((item, index) => {
        if(e.target.value.id === item.id) {
           this.state.goodsTypeList.splice(index, 1)
        }
      })
    }
  };

  addPackingSpec = () => {   // 添加更多包装规格
    const { form } = this.props;
    const packingSpecKeys = form.getFieldValue('packingSpecKeys');
    const nextKeys = packingSpecKeys.concat(++packingSpecId);

    form.setFieldsValue({
      packingSpecKeys: nextKeys,
    });
  };

  removePackingSpec = (k) => {   // 删除更多包装规格
    const { form } = this.props;
    const packingSpecKeys = form.getFieldValue('packingSpecKeys');

    if (packingSpecKeys.length === 1) {
      return;
    }
    form.setFieldsValue({
      packingSpecKeys: packingSpecKeys.filter(key => key !== k),
    });
  };

  addProductSpec = () => {   // 添加更多货品规格
    const { form } = this.props;
    const productSpecKeys = form.getFieldValue('productSpecKeys');
    const nextKeys = productSpecKeys.concat(++productSpecId);

    form.setFieldsValue({
      productSpecKeys: nextKeys,
    });
  };

  removeProductSpec = (k) => {   // 删除更多货品规格
    const { form } = this.props;
    const productSpecKeys = form.getFieldValue('productSpecKeys');

    if (productSpecKeys.length === 1) {
      return;
    }
    form.setFieldsValue({
      productSpecKeys: productSpecKeys.filter(key => key !== k),
    });

    productSpecIds.splice(k, 1)

    productSpecSonData.splice(k, 1)

    productSpecKeys.splice(k, 1)
  };

  packingSpecNumVali = (val, callback, index) => {   // 包装规格数量输入框验证
    if(!val) {
      callback('请输入包装规格数量，需大于零')
    }
    callback()
  };

  packingSpecVali = (val, callback, index) => {   // 包装规格选择框验证
    if(!val) {
      callback('请选择包装规格')
    }
    callback()
  };

  productSpecParentVali = (val, callback, index) => {   // 货品规格父级选择框验证
    if(!val) {
      callback('请选择货品规格')
    }
    callback()
  };

  productSpecSonVali = (val, callback, index) => {   // 货品规格父级选择框验证
    if(!val) {
      callback('请选择货品规格,可多选')
    }
    callback()
  };

  productSpecParentChange = (value, option, index) => {   // 货品规格父级改变获取子级数据
    const { productSpecData } = this.state;

    if(productSpecIds.length-1 >= index) {
      productSpecIds.splice(index, 1, value);
      productSpecData.forEach((item) => {
        if(item.id === value) {
          productSpecSonData.splice(index, 1, item.goodsBaseSpuList)
        }
      })
    } else {
      productSpecIds.push(value);
      productSpecData.forEach((item) => {
        if(item.id === value) {
          productSpecSonData.push(item.goodsBaseSpuList)
        }
      })
    }
  };

  setProductSpecData = () => {   // 获取货品规格，方便生成表格
    const { productSpecData, productSpecParentList, productSpecSonList } = this.state;
    const outputField = ['productSpecKeys', 'productSpecParent', 'productSpecSon'];

    this.props.form.validateFields(outputField, (err, productSpecForm) => {
      if(err) {
        return;
      }

      isProductSpecVerify = true;
      productSpecForm.productSpecSon.forEach(item => {
        if(!item[1].length) {
          helper.W('请先选择货品规格！')
          isProductSpecVerify = false;
          return;
        }
      })

      if(isProductSpecVerify) {
        productSpecForm.productSpecKeys.forEach((itemOne, indexOne) => {
          productSpecData.forEach(itemTow => {
            if(itemTow.id === productSpecForm.productSpecParent[itemOne][0]) {
              productSpecParentList.push(itemTow)
            }
            const sonArr = [];
            itemTow.goodsBaseSpuList.forEach((itemThree, indexThree) => {
              if(productSpecForm.productSpecSon[itemOne]) {
                productSpecForm.productSpecSon[itemOne][1].forEach((itemFive, indexFive) => {
                  if(itemThree.id === itemFive) {
                    sonArr.push(itemThree)
                  }
                });
              }
            })
            if(sonArr.length !== 0) {
              productSpecSonList.push(sonArr)
            }
          })
        });
        this.setState({
          isProductSpecTable: true,
          ProductSpecTableList: getPermutationCombination(productSpecSonList, 0),
        })
      }
    })
  };

  priceUnitChange = (value) => {   // 计价单位变化
    const { goodsPackingUnitData } = this.state;
    const goodsPackingArr = [];
    goodsPackingUnitData.forEach((item, index) => {
      if(item.firstBaseUnitId === value) {
        goodsPackingArr.push(item)
      }
    })
    if(goodsPackingUnitDataArr.length) {
      goodsPackingUnitDataArr.splice(0, 1, goodsPackingArr)
    } else {
      goodsPackingUnitDataArr.push(goodsPackingArr)
    }
  };

  packingSpecChange = (value, k) => {   // 包装规格
    const { goodsPackingUnitData } = this.state;
    const packingSpecArr = [];
    const packingSpecArrObj = {};

    goodsPackingUnitData.forEach(item => {
      if(item.id === value) {
        packingSpecArrObj.packingSpecArrObj = item;
      }
    })
    goodsPackingUnitData.forEach(item => {
      if(item.firstBaseUnitId === packingSpecArrObj.packingSpecArrObj.secondBaseUnitId) {
        packingSpecArr.push(item)
      }
    })
    if(goodsPackingUnitDataArr.length > k+1) {
      goodsPackingUnitDataArr.splice(k+1, 1, packingSpecArr)
    } else {
      goodsPackingUnitDataArr.push(packingSpecArr)
    }
  };

  volumeValueChange = (type, value) => {   // 体积中长宽高发生变化时
    const { form } = this.props;
    const { longth, width, height } = form.getFieldsValue(['longth', 'width', 'height']);
    if(type === 1 && value) {
      const volumeNum = value ? value * width * height : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    } else if (type === 2 && value) {
      const volumeNum = value ? longth * value * height : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    } else {
      const volumeNum = value ? longth * width * value : 0;
      form.setFieldsValue({'volume': isNaN(volumeNum) ? 0 : volumeNum})
    }
  };

  componentDidMount() {
    this.getData()
  }

  render() {
    const { goodsCategoriesData,
            goodsBrandData,
            goodsProviderData,
            goodsTypeData,
            goodsBaseUnitData,
            goodsPackingUnitData,
            productSpecData,
            goodsLabelData,
            productSpecParentList,
            isProductSpecTable,
            ProductSpecTableList,

            mainImgsFileType,
            mainImgsFileList,
            mainImgsPreviewImage,
            mainImgsPreviewVisible,

            videosFileList,
            videosFileType,

            detailImgsFileList,
            detailImgsPreviewImage,
            detailImgsPreviewVisible,

            qualificationUrlPreviewVisible,
            qualificationUrlPreviewImage,
            qualificationUrlFileList,
          
            succeedModalVisible} = this.state;
    const { loading } = this.props.store;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator('productSpecKeys', { initialValue: [productSpecId] });
    const productSpecKeys = getFieldValue('productSpecKeys');

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return(
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={[`${searchList(getLoginInfo().modules || [], 'path', PATH).name || ''}`]} />
          <div className="page-wrapper-bread-txt">
            {searchList(getLoginInfo().modules || [], 'path', PATH).subName || ''}
            <span className="page-wrapper-bread-txt-button">
              <Popconfirm title="确认执行吗" placement="left" onConfirm={this.handleSubmit}>
                <Button type="primary" loading={loading}>保存</Button>
              </Popconfirm>
            </span>
          </div>
        </div>

        <div className="page-wrapper-form">
          <Form layout={formConfig.layout}>
            <Collapse bordered={true} defaultActiveKey={['1', '2', '3']}>
                <Collapse.Panel className="page-wrapper-form-panel" header="基础信息" key="1">
                  <div className="page-wrapper-form-content">
                    <Form.Item label={formConfig.name.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.name.key, formConfig.name.ruleConfig)(
                        <Input
                          allowClear
                          placeholder={formConfig.name.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.categoriesId.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.categoriesId.key, formConfig.categoriesId.ruleConfig)(
                        <Cascader
                          showSearch
                          allowClear
                          changeOnSelect
                          options={goodsCategoriesData}
                          fieldNames={formConfig.categoriesId.fieldNames}
                          placeholder={formConfig.categoriesId.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    {/* <Form.Item label={formConfig.k3No.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.k3No.key, formConfig.k3No.ruleConfig)(
                        <Input
                          allowClear
                          placeholder='请输入K3系统中该货品的编号'/>
                      )}
                    </Form.Item> */}
                    <Form.Item label={formConfig.goodsBrand.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.goodsBrand.key, formConfig.goodsBrand.ruleConfig)(
                        <Select style={{ width: '100%' }}
                          placeholder={formConfig.goodsBrand.ruleConfig.rules[0].message}
                          showSearch
                          allowClear
                          optionFilterProp="children">
                          {goodsBrandData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.goodsProvider.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.goodsProvider.key, formConfig.goodsProvider.ruleConfig)(
                        <Select style={{ width: '100%' }}
                          placeholder={formConfig.goodsProvider.ruleConfig.rules[0].message}
                          showSearch
                          allowClear
                          optionFilterProp="children">
                          {goodsProviderData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.priceUnit.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.priceUnit.key, formConfig.priceUnit.ruleConfig)(
                        <Select style={{ width: '100%' }}
                          placeholder={formConfig.priceUnit.ruleConfig.rules[0].message}
                          showSearch
                          allowClear
                          onSelect={(value) => this.priceUnitChange(value)}
                          optionFilterProp="children">
                          {goodsBaseUnitData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.stockUnit.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.priceUnit.key, formConfig.priceUnit.ruleConfig)(
                        <Select style={{ width: '100%' }}
                          placeholder={formConfig.stockUnit.ruleConfig.rules[0].message}
                          showSearch
                          allowClear
                          disabled
                          optionFilterProp="children">
                          {goodsBaseUnitData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.qualificationUrl.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.qualificationUrl.key)(
                        <div>
                          <Upload
                            accept={mainImgsFileType}
                            action={api.Upload}
                            listType="picture-card"
                            fileList={qualificationUrlFileList}
                            beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                            onPreview={this.handlePreviewQualificationUrl}
                            onChange={this.handleChangeQualificationUrl}>
                            {qualificationUrlFileList.length >= 5 ? null : uploadButton}
                          </Upload>
                          <Modal visible={qualificationUrlPreviewVisible} footer={null} onCancel={this.handleCancelQualificationUrl}>
                            <img alt="example" style={{ width: '100%' }} src={qualificationUrlPreviewImage} />
                          </Modal>
                        </div>
                      )}
                      <div>支持多图上传,最多5个,每个图应小于1M，jpg,gif,png格式。</div>
                    </Form.Item>
                    {/* {[
                      packingSpecKeys.map((k, index) => {
                        return(
                          <Form.Item
                            label={index === 0 ? formConfig.packingSpec.label : ''}
                            key={k} {...(index === 0 ? formConfig.formItemLayout : formItemLayoutWithOutLabel)} required>
                            <Form.Item style={{'display': 'inline-block', width: packingSpecKeys.length > 1 ? '45%' : '50%', marginBottom: 0}}>
                              {getFieldDecorator(`packingSpecNum[${k}][0]`, {
                                rules: [{validator: (rule, value, callback) => this.packingSpecNumVali(value, callback, k)}]
                              })(
                                <InputNumber placeholder={formConfig.packingSpecNum.ruleConfig.rules[0].message} style={{width: '100%'}}/>
                              )}
                            </Form.Item>
                            <Form.Item style={{'display': 'inline-block', width: packingSpecKeys.length > 1 ? '45%' : '50%', marginBottom: 0}}>
                              {getFieldDecorator(`packingSpec[${k}][1]`, {
                                rules: [{validator: (rule, value, callback) => this.packingSpecVali(value, callback, k)}]
                              })(
                                <Select
                                  placeholder={formConfig.packingSpec.ruleConfig.rules[0].message}
                                  showSearch
                                  allowClear
                                  onSelect={(value) => this.packingSpecChange(value, k)}
                                  optionFilterProp="children">
                                  {goodsPackingUnitDataArr.length ? goodsPackingUnitDataArr[k].map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>) : null}
                                </Select>
                              )}
                            </Form.Item>
                            {packingSpecKeys.length > 1 ? (
                              <Icon style={{ marginLeft: '10px' }} className="dynamic-delete-button" type="minus-circle-o" disabled={packingSpecKeys.length === 1} onClick={() => this.removePackingSpec(k)} />
                            ) : null}
                          </Form.Item>
                        )
                      }),
                      <Button type="dashed" onClick={this.addPackingSpec} style={{ marginLeft: '25%' }}>
                        <Icon type="plus" /> 增加包装规格
                      </Button>
                    ]} */}
                  </div>
                </Collapse.Panel>

                <Collapse.Panel className="page-wrapper-form-panel" header="货品类别" key="2">
                  <div className="page-wrapper-form-content">
                    <Form.Item label={formConfig.goodsType.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.goodsType.key, formConfig.goodsType.ruleConfig)(
                        <div>
                          {goodsTypeData.map(item => <Checkbox onChange={this.checkBoxChange} value={item} key={item.id}>{item.name}</Checkbox>)}
                        </div>
                      )}
                    </Form.Item>
                  </div>
                </Collapse.Panel>

                <Collapse.Panel className="page-wrapper-form-panel" header="货品信息" key="3">
                  <div className="page-wrapper-form-content">
                    <div>
                      {[
                        productSpecKeys.map((k, index) => {
                          return(
                            <Form.Item
                              label={index === 0 ? formConfig.productSpec.label : ''}
                              key={k} {...(index === 0 ? formConfig.formItemLayout : formItemLayoutWithOutLabel)} required>
                              <Form.Item style={{display: 'inline-block', width: productSpecKeys.length > 1 ? '45%' : '50%', marginBottom: 0}}>
                                {getFieldDecorator(`productSpecParent[${k}][0]`, {
                                  rules: [{validator: (rule, value, callback) => this.productSpecParentVali(value, callback, k)}]
                                })(
                                  <Select
                                    onChange={(value, option) => this.productSpecParentChange(value, option, index)}
                                    placeholder={formConfig.productSpec.ruleConfig.rules[0].message}
                                    disabled={isProductSpecTable}
                                    showSearch
                                    allowClear
                                    optionFilterProp="children">
                                    {productSpecData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                                  </Select>
                                )}
                              </Form.Item>
                              {productSpecIds.length > index ? <Form.Item style={{'display': 'inline-block', width: productSpecKeys.length > 1 ? '45%' : '50%', marginBottom: 0}}>
                                {getFieldDecorator(`productSpecSon[${k}][1]`, {
                                  rules: [
                                    {validator: (rule, value, callback) => this.productSpecSonVali(value, callback, k)}]
                                })(
                                  <Select
                                    placeholder={formConfig.productSpec.ruleConfig.rules[0].message}
                                    disabled={isProductSpecTable}
                                    mode="multiple"
                                    showSearch
                                    allowClear
                                    optionFilterProp="children">
                                    {productSpecSonData[index] ? productSpecSonData[index].map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>) : null}
                                  </Select>
                                )}
                              </Form.Item> : null}
                              {(productSpecKeys.length > 1 && !isProductSpecTable) ? (
                                <Icon style={{ marginLeft: '10px' }}
                                  className="dynamic-delete-button"
                                  type="minus-circle-o" disabled={productSpecKeys.length === 1}
                                  onClick={() => this.removeProductSpec(k)} />
                              ) : null}
                            </Form.Item>
                          )
                          }),
                          <Button type="dashed" onClick={this.addProductSpec} disabled={isProductSpecTable} style={{ marginLeft: '25%' }}>
                            <Icon type="plus" /> 增加货品规格
                          </Button>
                      ]}
                      <Popconfirm title="确认执行吗" placement="top" onConfirm={this.setProductSpecData}>
                        <Button type="primary" style={{ marginLeft: '20px' }} disabled={isProductSpecTable}>生成表格</Button>
                      </Popconfirm>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      {isProductSpecTable ?
                        <ProductSpecTable
                          goodsLabelData={goodsLabelData}
                          productSpecParentList={productSpecParentList}
                          tableDataList={ProductSpecTableList}
                          goodsPackingUnitData={goodsPackingUnitData}/> : null}
                    </div>
                  </div>
                </Collapse.Panel>

                <Collapse.Panel className="page-wrapper-form-panel" header="扩展属性" key="4">
                  <div className="page-wrapper-form-content">
                    <Form.Item label={formConfig.shortName.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.shortName.key, formConfig.shortName.ruleConfig)(
                        <Input
                        allowClear
                        placeholder={formConfig.shortName.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.helpCode.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.helpCode.key, formConfig.helpCode.ruleConfig)(
                        <Input
                        allowClear
                        placeholder={formConfig.helpCode.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.marketPrice.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.marketPrice.key, formConfig.marketPrice.ruleConfig)(
                        <InputNumber
                        min={0}
                        max={99999999}
                        precision={2}
                        style={{ width: '100%' }}
                        allowClear
                        placeholder={formConfig.marketPrice.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.costPrice.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.costPrice.key, formConfig.costPrice.ruleConfig)(
                        <InputNumber
                        min={0}
                        max={99999999}
                        precision={2}
                        style={{ width: '100%' }}
                        allowClear
                        placeholder={formConfig.costPrice.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.heavy.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.heavy.key, formConfig.heavy.ruleConfig)(
                        <InputNumber
                        min={0}
                        max={99999999}
                        precision={2}
                        style={{ width: '100%' }}
                        allowClear
                        placeholder={formConfig.heavy.ruleConfig.rules[0].message}/>
                      )}
                      <span className="page-wrapper-form-content-unit">{heavyUnit}</span>
                    </Form.Item>
                    <Form.Item label={formConfig.volume.label} { ...formConfig.formItemLayout }>
                      <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                        {getFieldDecorator(formConfig.longth.key, formConfig.longth.ruleConfig)(
                          <InputNumber
                            min={0}
                            max={99999999}
                            precision={2}
                            style={{ width: '100%' }}
                            allowClear
                            onChange={this.volumeValueChange.bind(this, 1)}
                            placeholder={formConfig.longth.ruleConfig.rules[0].message}/>
                        )}
                      </Form.Item>
                      <span style={{ fontSize: '20px', padding: '0 5px' }}>*</span>
                      <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                        {getFieldDecorator(formConfig.width.key, formConfig.width.ruleConfig)(
                          <InputNumber
                            min={0}
                            max={99999999}
                            precision={2}
                            style={{ width: '100%' }}
                            allowClear
                            onChange={this.volumeValueChange.bind(this, 2)}
                            placeholder={formConfig.width.ruleConfig.rules[0].message}/>
                        )}
                      </Form.Item>
                      <span style={{ fontSize: '20px', padding: '0 5px' }}>*</span>
                      <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                        {getFieldDecorator(formConfig.height.key, formConfig.height.ruleConfig)(
                          <InputNumber
                            min={0}
                            max={99999999}
                            precision={2}
                            style={{ width: '100%' }}
                            allowClear
                            onChange={this.volumeValueChange.bind(this, 3)}
                            placeholder={formConfig.height.ruleConfig.rules[0].message}/>
                        )}
                      </Form.Item>
                      <span style={{ fontSize: '20px', padding: '0 5px' }}>=</span>
                      <Form.Item style={{ width: '22%', 'display': 'inline-block', marginBottom: 0 }}>
                        {getFieldDecorator(formConfig.volume.key, formConfig.volume.ruleConfig)(
                          <InputNumber
                            disabled
                            min={0}
                            max={99999999}
                            precision={2}
                            style={{ width: '100%' }}
                            allowClear
                            placeholder={formConfig.volume.ruleConfig.rules[0].message}/>
                        )}
                      </Form.Item>
                      <span className="page-wrapper-form-content-unit">{volumeUnit}</span>
                    </Form.Item>
                    <Form.Item label={formConfig.expirationDate.label} { ...formConfig.formItemLayout }>
                      <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>
                        {getFieldDecorator(formConfig.expirationDate.key, formConfig.expirationDate.ruleConfig)(
                          <InputNumber
                          min={0}
                          max={99999999}
                          precision={2}
                          style={{ width: '100%' }}
                          allowClear
                          placeholder={formConfig.expirationDate.ruleConfig.rules[0].message}/>
                        )}
                      </Form.Item>
                      <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>
                        {getFieldDecorator(formConfig.expirationDateUnit.key, formConfig.expirationDateUnit.ruleConfig)(
                          <Select
                            style={{ width: '100%' }}
                            placeholder={formConfig.expirationDateUnit.ruleConfig.rules[0].message}
                            showSearch
                            allowClear
                            optionFilterProp="children">
                            {expirationDate.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                          </Select>
                        )}
                      </Form.Item>
                    </Form.Item>
                    <Form.Item label={formConfig.createArea.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.createArea.key, formConfig.createArea.ruleConfig)(
                        <Input
                        allowClear
                        placeholder={formConfig.createArea.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.goodsKeywordsList.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.goodsKeywordsList.key, formConfig.goodsKeywordsList.ruleConfig)(
                        <Select
                          style={{ width: '100%' }}
                          placeholder={formConfig.goodsKeywordsList.ruleConfig.rules[0].message}
                          mode="multiple"
                          showSearch
                          allowClear
                          optionFilterProp="children">
                          {goodsLabelData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                        </Select>
                      )}
                    </Form.Item>
                  </div>
                </Collapse.Panel>

                <Collapse.Panel className="page-wrapper-form-panel" header="展示信息" key="5">
                  <div className="page-wrapper-form-content">
                    <Form.Item label={formConfig.sortId.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.sortId.key, formConfig.sortId.ruleConfig)(
                        <InputNumber
                          min={0}
                          max={99999999}
                          precision={2}
                          style={{ width: '100%' }}
                          allowClear
                          placeholder={formConfig.sortId.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.mainImgs.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.mainImgs.key)(
                        <div>
                          <Upload
                            accept={mainImgsFileType}
                            action={api.Upload}
                            listType="picture-card"
                            fileList={mainImgsFileList}
                            beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                            onPreview={this.handlePreviewMainImgs}
                            onChange={this.handleChangeMainImgs}>
                            {mainImgsFileList.length >= 5 ? null : uploadButton}
                          </Upload>
                          <Modal visible={mainImgsPreviewVisible} footer={null} onCancel={this.handleCancelMainImgs}>
                            <img alt="example" style={{ width: '100%' }} src={mainImgsPreviewImage} />
                          </Modal>
                        </div>
                      )}
                      <div>支持多图上传,最多5个,每个图应小于1M，jpg,gif,png格式。</div>
                    </Form.Item>
                    <Form.Item label={formConfig.videos.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.videos.key)(
                        <Upload
                          accept={videosFileType}
                          action={api.Upload}
                          beforeUpload={this.beforeUpload.bind(this, VIDEO_SIZE)}
                          fileList={videosFileList}
                          onChange={this.hlandChangVideos}>
                          <Button disabled={videosFileList.length >=1}>
                            <Icon type="upload" /> 上传货品视频
                          </Button>
                        </Upload>
                      )}
                      <div>建议上传格式为mp4的视频，大小不超过20MB。</div>
                    </Form.Item>
                    <Form.Item label={formConfig.description.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.description.key, formConfig.description.ruleConfig)(
                        <Input.TextArea
                        allowClear
                        placeholder={formConfig.description.ruleConfig.rules[0].message}/>
                      )}
                    </Form.Item>
                    <Form.Item label={formConfig.detailImgs.label} { ...formConfig.formItemLayout }>
                      {getFieldDecorator(formConfig.detailImgs.key)(
                        <div>
                          <Upload
                            accept={mainImgsFileType}
                            action={api.Upload}
                            listType="picture-card"
                            fileList={detailImgsFileList}
                            beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                            onPreview={this.handlePreviewDetailImgs}
                            onChange={this.handleChangeDetailImgs}>
                            {detailImgsFileList.length >= 5 ? null : uploadButton}
                          </Upload>
                          <Modal visible={detailImgsPreviewVisible} footer={null} onCancel={this.handleCancelDetailImgs}>
                            <img alt="example" style={{ width: '100%' }} src={detailImgsPreviewImage} />
                          </Modal>
                        </div>
                      )}
                      <div>支持多图上传,最多5个,每个图应小于1M，jpg,gif,png格式。</div>
                    </Form.Item>
                  </div>
                </Collapse.Panel>

            </Collapse>
          </Form>
        </div>

        <Modal visible={succeedModalVisible}
               destroyOnClose
               okText="去看看"
               cancelText="再添加"
               onOk={() => 
                 this.setState({succeedModalVisible: false}, () => {
                  this.props.history.push({ pathname: '/previewVisibleList'});
               })}
               onCancel={() => this.setState({succeedModalVisible: false}, () => {
                window.location.reload(true);
               })}>
          <div style={{ textAlign: 'center', fontSize: '17px' }}>恭喜您，货品添加成功!</div>
        </Modal>
      </div>
    )
  }
}

const AddUpdateGoods = Form.create()(AddUpdateGoodsForm);

export default AddUpdateGoods;
