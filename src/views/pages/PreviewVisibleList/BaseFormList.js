import React from 'react';
import {inject, observer} from 'mobx-react'
import { message, Popconfirm, Button, Collapse } from 'antd';
import GoodsCenterService from "../../../service/GoodsCenterService";
import BasicInfoForm from './BaseFormListChild/BasicInfoForm'
import ProductCategoriesForm from './BaseFormListChild/ProductCategoriesForm'
import SpecInfoForm from './BaseFormListChild/SpecInfoForm'
import ExtendedAttrForm from './BaseFormListChild/ExtendedAttrForm'
import ExhibitionInfoForm from './BaseFormListChild/ExhibitionInfoForm'

import './BaseFormListStyle.less';
import '../../../assets/style/common/pageItem.less'
import { SUCCESS_CODE } from '../../../conf';
import { uniqueJson } from '../../../utils/public';
import helper from '../../../utils/helper';
import { validChar } from '../../../utils/RegExps';

const getIdObj = (id, list) => {
  if(!id) {
    return;
  }
  const arr = [];
  list.forEach(item => {
    if(item.id === id) {
      arr.push(item);
    }
  })
  return arr;
};

let isBasicInfoForm = false;
let isProductCategoriesForm = false;
let isSpecInfoForm = false;
let isExtendedAttrForm = false;
let isExhibitionInfoForm = false;
let heavyUnit = 'kg/件';   // 体重单位
let volumeUnit = 'm³/件';   // 体积单位

@inject('store')
@observer
class BaseFormList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addGoodsLoading: false,   // 点击保存loading
    }
  }
  handleSubmit = () => {
    const { 
      goodsBrandData,
      goodsProviderData,
      goodsTypeData, 
      goodsBaseUnitData,
      productSpecData,
      goodsLabelData } = this.props;

    const allData = {};
    this.basicInfoForm.validateFields((err, basicInfoValues) => {
      if(err) {
        return;
      }
      allData['basicInfoValues'] = basicInfoValues;
      const basicInfoValuesUrl = this.basicInfoValuesUrl.wrappedInstance.state.qualificationUrlFileList;
      if(basicInfoValuesUrl.length) {
        const arr = [];
        basicInfoValuesUrl.forEach(item => {
          if(item.url) {
            arr.push(item.url)
          } else {
            arr.push(item.response.data)
          }
        })
        allData['basicInfoValues'].qualificationUrl = arr.join(',');
      } else {
        allData['basicInfoValues'].qualificationUrl = '';
      };
      allData['basicInfoValues'].categoriesId = allData['basicInfoValues'].categoriesId[allData['basicInfoValues'].categoriesId.length-1];

      if(allData['basicInfoValues'].goodsBrand) {
        allData['basicInfoValues'].goodsBrand = getIdObj(allData['basicInfoValues'].goodsBrand, goodsBrandData)[0];
      }
      allData['basicInfoValues'].goodsProvider = getIdObj(allData['basicInfoValues'].goodsProvider, goodsProviderData)[0];
      allData['basicInfoValues'].goodsPriceUnit = getIdObj(allData['basicInfoValues'].priceUnit, goodsBaseUnitData)[0];
      allData['basicInfoValues'].goodsStockUnit = getIdObj(allData['basicInfoValues'].stockUnit, goodsBaseUnitData)[0];

      delete allData['basicInfoValues'].priceUnit;
      delete allData['basicInfoValues'].stockUnit;

      isBasicInfoForm = true;   // 基础信息验证无误为true
    });

    this.productCategoriesForm.validateFields((err, productCategoriesValues) => {
      if(err) {
        return;
      }
      const arr = [];
      productCategoriesValues.goodsType.forEach(item => {
        arr.push(getIdObj(item, goodsTypeData)[0])
      })
      allData['goodsTypeList'] = arr;
      arr.length ? isProductCategoriesForm = true : isProductCategoriesForm = false;
    });

    this.specInfoForm.validateFields((err, specInfoFormValues) => {
      if(err) {
        return;
      }
      // isProductSpecTable验证是新添加的sku,还是沿用以前的; productSpecTableData.productSpecList新生成表格的数据
      const { isProductSpecTable } = this.specInfoFormJudge.wrappedInstance.state;   
      const productSpecTableData = this.props.store.productSpecTableData;   // 获取到的表格中原数据

      if(isProductSpecTable) {   // isProductSpecTable为true是重新生成表格
        const goodsSkuList = [];
        if(productSpecTableData.productSpecList.length) {
          let isSpecInfoFormArr = [];   // 判断表格每一行数据是否合法，若合法数组为空
          productSpecTableData.productSpecList.forEach((itemOne, indexOne) => {
            let goodsBaseSpuList = [];
            itemOne.forEach(itemTow => {
              goodsBaseSpuList.push(itemTow);
            })
            if(!itemOne.k3No) {
              message.warning('请填写货品编码！');
              isSpecInfoFormArr.push(itemOne)
              return;
            }
            if(!validChar.test(itemOne.k3No)) {
              message.warning('请勿输入特殊字符！');
              isSpecInfoFormArr.push(itemOne)
              return;
            }
            // if(!itemOne.barcode) {
            //   message.warning('请填写条形码！');
            //   isSpecInfoFormArr.push(itemOne)
            //   return;
            // }
            let goodsPackingUnitList = [];
            if(itemOne.goodsPackingUnitList) {
              itemOne.goodsPackingUnitList.forEach(itemFree => {
                goodsPackingUnitList.push(itemFree)
              })
            } else {
              message.warning('请填写完整包装规格！');
              isSpecInfoFormArr.push(itemOne)
              return;
            }
            goodsSkuList[indexOne] = { 'goodsBaseSpuList': goodsBaseSpuList.length ? goodsBaseSpuList :null,
                                      'barcode': itemOne['barcode'] ? itemOne['barcode'] : null,
                                      'k3No': itemOne['k3No'] ? itemOne['k3No'] : null,
                                      'goodsPackingUnitList': goodsPackingUnitList ? goodsPackingUnitList : null,
                                      'goodsPresentation': itemOne.goodsPresentation,
                                      'goodsExtendedAttribute': itemOne.goodsExtendedAttribute
                                    };
          })
          isSpecInfoForm = isSpecInfoFormArr.length ? false : true;
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
            allData.goodsSpuList = [...goodsSpuList];
          }
        } else {
          message.warning('请至少填写一种货品规格！');
          isSpecInfoForm = false;
          return;
        }
        allData['goodsSkuList'] = [...goodsSkuList];
      } else {   // isProductSpecTable为false是只更改表格中的数据，表格未重新生成
        allData['goodsSkuList'] = JSON.parse(JSON.stringify([...productSpecTableData.productSpecList]));

        if(allData['goodsSkuList'] && allData['goodsSkuList'].length) {   // 根据最终表格无论删除与否，拼接spu对象
          const arr = [];
          allData['goodsSkuList'].forEach((itemOne) => {
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
          allData.goodsSpuList = [...goodsSpuList];
        }

        if(!allData['goodsSkuList'].length) {
          message.warning('请至少填写一种货品规格！');
          return;
        } else {
          let isSpecInfoFormArr = [];   // 判断表格每一行数据是否合法，若合法数组为空
          allData['goodsSkuList'].forEach(item => {
            delete item.createTime;
            delete item.updateTime;
            delete item.hidden;
            delete item.hrNo;
            delete item.hrNos;
            delete item.id;
            delete item.name;
            delete item.num;
            delete item.parentHrNo;
            delete item.priceUnitId;
            delete item.priceUnitName;
            delete item.stockUnitId;
            if(!item.k3No) {
              message.warning('请填写货品编码！');
              isSpecInfoFormArr.push(item)
              return;
            }
            if(!validChar.test(item.k3No)) {
              message.warning('请勿输入特殊字符！');
              isSpecInfoFormArr.push(item)
              return;
            }
            // if(!item.barcode) {
            //   message.warning('请填写条形码！');
            //   isSpecInfoFormArr.push(item)
            //   return;
            // }
            if(!item.goodsPackingUnitList.length) {
              message.warning('请填写完整包装规格！');
              isSpecInfoFormArr.push(item)
              return;
            }
          })
          isSpecInfoForm = isSpecInfoFormArr.length ? false : true
        }
      }
    });

    this.extendedAttrForm.validateFields((err, extendedAttrFormValue) => {
      if(err) {
        return;
      }
      if(extendedAttrFormValue) {
        if(extendedAttrFormValue.goodsKeywordsList) {
          const arr = [];
          extendedAttrFormValue.goodsKeywordsList.forEach(item => {
            arr.push(getIdObj(item, goodsLabelData)[0]);
          })
          allData['goodsKeywordsList'] = arr;
        }
        if(extendedAttrFormValue.expirationDateUnit && extendedAttrFormValue.expirationDate) {
          if(extendedAttrFormValue.expirationDateUnit === 1) {
            extendedAttrFormValue.expirationDate = extendedAttrFormValue.expirationDate * 365;
          } else if(extendedAttrFormValue.expirationDateUnit === 2) {
            extendedAttrFormValue.expirationDate = extendedAttrFormValue.expirationDate * 30;
          }
        }
        allData['goodsExtendedAttribute'] = extendedAttrFormValue;
        allData['goodsExtendedAttribute'].heavyUnit = heavyUnit;
        allData['goodsExtendedAttribute'].volumeUnit = volumeUnit;
        allData['goodsExtendedAttribute'].costPrice = extendedAttrFormValue.costPrice * 100;
        allData['goodsExtendedAttribute'].marketPrice = extendedAttrFormValue.marketPrice * 100;
        delete extendedAttrFormValue.goodsKeywordsList;
      } else {
        allData['goodsExtendedAttribute'] = {};
      }
      isExtendedAttrForm = true;
    });

    this.exhibitionInfoForm.validateFields((err, exhibitionInfoValue) => {
      if(err) {
        return;
      }
      allData['goodsPresentation'] = exhibitionInfoValue;
      const {detailImgsFileList, mainImgsFileList, videosFileList} = this.exhibitionInfoFormUrl.wrappedInstance.state;

      if(detailImgsFileList.length) {
        const arr = [];
        detailImgsFileList.forEach(item => {
          if(item.url) {
            arr.push(item.url)
          } else {
            arr.push(item.response.data)
          }
        })
        allData['goodsPresentation'].detailImgs = arr.join(',');
      } else {
        allData['goodsPresentation'].detailImgs = '';
      }

      if(mainImgsFileList.length) {
        const arr = [];
        mainImgsFileList.forEach(item => {
          if(item.url) {
            arr.push(item.url)
          } else {
            arr.push(item.response.data)
          }
        })
        allData['goodsPresentation'].mainImgs = arr.join(',');
      } else {
        allData['goodsPresentation'].mainImgs = '';
      }

      if(videosFileList.length) {
        const arr = [];
        videosFileList.forEach(item => {
          if(item.url) {
            arr.push(item.url)
          } else {
            arr.push(item.response.data)
          }
        })
        allData['goodsPresentation'].videos = arr.join(',');
      } else {
        allData['goodsPresentation'].videos = '';
      }
      isExhibitionInfoForm = true;
    })

    if(isBasicInfoForm && isProductCategoriesForm && isSpecInfoForm && isExtendedAttrForm && isExhibitionInfoForm) {
      this.submitData(allData);
    } else {
      message.warning('请检查必填项是否填写完整！！');
    }
  };

  submitData = async (allData) => {
    const { setCommon, tableRowData } = this.props.store;
    const { basicInfoValues, goodsExtendedAttribute, goodsKeywordsList, goodsPresentation, goodsSkuList, goodsTypeList, goodsSpuList } = allData;
    const params = { 
                    //  id: tableRowData.id,
                     createEId: tableRowData.createEId,
                     createEName: tableRowData.createEName,
                     name: basicInfoValues.name,
                     categoriesId: basicInfoValues.categoriesId,
                     k3No: basicInfoValues.k3No,   // 新增时，此处对应k3No，编辑是对应hrNo
                     hrNo: basicInfoValues.k3No,
                     goodsBrand: basicInfoValues.goodsBrand,
                     goodsProvider: basicInfoValues.goodsProvider,
                     qualificationUrl: basicInfoValues.qualificationUrl,
                     goodsPriceUnit: basicInfoValues.goodsPriceUnit,
                     goodsStockUnit: basicInfoValues.goodsStockUnit,
                     goodsExtendedAttribute,
                     goodsKeywordsList,
                     goodsPresentation,
                     goodsSkuList,
                     goodsSpuList,
                     goodsTypeList
                    };
    // console.log(params)
    // console.log(JSON.stringify(params))
    this.setState({addGoodsLoading: true})
    const { code, msg } = await GoodsCenterService.PreviewVisibleList.addInsertOne(params);
    this.setState({addGoodsLoading: false})
    if(code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    setCommon('tableRowData', {});
    setCommon('modalVisible', false);
    // 刚商品修改成功后，马上再修改下面五种判断的值并没有改变，需要初始化
    isBasicInfoForm = false;
    isProductCategoriesForm = false;
    isSpecInfoForm = false;
    isExtendedAttrForm = false;
    isExhibitionInfoForm = false;
    this.props.getData();
  };

  render() {
    const { addGoodsLoading } = this.state;
    const { goodsCategoriesData,
            goodsBrandData,
            goodsProviderData,
            goodsBaseUnitData,
            goodsPackingUnitData, 
            goodsTypeData,
            productSpecData,
            goodsLabelData } = this.props;
    return(
      <div className="base-form">
        <div className="base-form-title">
          <span className="base-form-title-text">可根据需求编辑货品信息</span>
          <span className="base-form-title-button">
            <Popconfirm title="确认执行吗" placement="left" onConfirm={this.handleSubmit}>
              <Button type="primary" loading={addGoodsLoading}>保存</Button>
            </Popconfirm>
          </span>
        </div>
        <div className="base-form-centent">
          <Collapse bordered={true} defaultActiveKey={['1']}>

            <Collapse.Panel forceRender header="基础信息" key="1">
              <div ClassName="base-form-centent-coll">
                <BasicInfoForm ref={el => this.basicInfoForm = el} 
                               goodsCategoriesData={goodsCategoriesData}
                               goodsBrandData={goodsBrandData}
                               goodsProviderData={goodsProviderData}
                               goodsBaseUnitData={goodsBaseUnitData}
                               goodsPackingUnitData={goodsPackingUnitData}
                               wrappedComponentRef={el => this.basicInfoValuesUrl = el} />
              </div>
            </Collapse.Panel>

            <Collapse.Panel forceRender header="货品类型" key="2">
              <div ClassName="base-form-centent-coll">
                <ProductCategoriesForm goodsTypeData={goodsTypeData} 
                                       ref={el => this.productCategoriesForm = el} />
              </div>
            </Collapse.Panel>

            <Collapse.Panel forceRender header="规格信息" key="3">
              <div ClassName="base-form-centent-coll">
                <SpecInfoForm ref={el => this.specInfoForm = el} 
                              productSpecData={productSpecData}
                              goodsPackingUnitData={goodsPackingUnitData}
                              goodsLabelData={goodsLabelData}
                              wrappedComponentRef={el => this.specInfoFormJudge = el} />
              </div>
            </Collapse.Panel>

            <Collapse.Panel forceRender header="扩展属性" key="4">
              <div ClassName="base-form-centent-coll">
                <ExtendedAttrForm ref={el => this.extendedAttrForm = el}
                                  goodsLabelData={goodsLabelData} />
              </div>
            </Collapse.Panel>

            <Collapse.Panel forceRender header="展示信息" key="5">
              <div ClassName="base-form-centent-coll">
                <ExhibitionInfoForm ref={el => this.exhibitionInfoForm = el} 
                                    wrappedComponentRef={el => this.exhibitionInfoFormUrl = el} />
              </div>
            </Collapse.Panel>

          </Collapse>
        </div>
      </div>
    )
  }
};

export default BaseFormList;
