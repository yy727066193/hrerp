import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Bread, SearchForm, Components, EditableContext } from '../../../components/index';
import { Table, Divider, Popconfirm, Icon } from 'antd';
import CollapseForm from './CollapseForm';
import Columns from './columnConfig';
import { setAction } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import helper from '../../../utils/helper';

const STATIC_TABLE_ROW = { key: 0, goodsCode: '', goodsName: '', size: '', unit: '', shelfNum: '', num: '', batch: '', time: '', remark: '' };
const breadCrumbList = ['门店下单'];
const PATH = 'StoreOrderDetail';
const data = [
	STATIC_TABLE_ROW
];
const searchData = [
	{ title: '出库日期', dataIndex: 'company', formType: 'select', required: true },
	{ title: '销售员', dataIndex: 'otherCompant', formType: 'select', required: true },
	{ title: '门店名称', dataIndex: 'otherCompant', formType: 'select', required: true }
];

@inject('store')
@observer
class StoreOrderDetail extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			disCountList: [],
			visible: false,
			data,
			shelfList: [], // 货架列表
		}
		this.index = 0;
	}

	isEditing = record => record.key === this.state.editingKey;

	cancel = () => {
		this.setState({ editingKey: '' });
	};

	save(form, key) {
		form.validateFields((error, row) => {
			if (error) {
				return;
			}
			const newData = [...this.state.data];
			const index = newData.findIndex(item => key === item.key);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row,
				});
				this.setState({ data: newData, editingKey: '' });
			} else {
				newData.push(row);
				this.setState({ data: newData, editingKey: '' });
			}
		});
	}

	edit(key) {
		if (this.searchForm.getFormData().store) {
			this.setState({ editingKey: key });
		} else {
			helper.W('请先选择仓库');
		}

	}

	addLineData(record) {
		const data = this.state.data;
		const obj = {};
		for (const key in STATIC_TABLE_ROW) {
			obj[key] = STATIC_TABLE_ROW[key];
		}
		obj.key = ++this.index;
		data.push(obj);
		this.setState({
			data
		});
	}

	deleteLineData(record) {
		const data = this.state.data;
		data.forEach((item, index) => {
			if (record.key === item.key && data.length > 1) {
				data.splice(index, 1);
			}
		})

		this.setState({
			data
		});
	}
	render() {
		const { shelfList, data } = this.state;
		const newColumns = Columns.AddModalColumns.map((col) => {
			if (col.dataIndex === 'addAndDelete') {
				col.render = (text, record) => {
					return (
						<div>
							<span className="cursorPointer" onClick={() => this.addLineData(record)}><Icon type="plus" /></span>
							<Divider type="vertical" />
							<span className="cursorPointer" onClick={() => this.deleteLineData(record)}><Icon type="minus" /></span>
						</div>
					);
				}
			}
			if (col.dataIndex === 'operation') {
				col.render = (text, record) => {
					const editable = this.isEditing(record);
					return (
						<div>
							{editable ? (
								<span>
									<EditableContext.Consumer>
										{form => (
											<span
												className="cursorPointer"
												onClick={() => this.save(form, record.key)}
												style={{ marginRight: 4, fontSize: 10 }}
											>
												保存
                              </span>
										)}
									</EditableContext.Consumer>
									<Divider type="vertical" />
									<Popconfirm
										title="是否取消操作?"
										onConfirm={() => this.cancel(record.key)}
									>
										<span className="cursorPointer" style={{ fontSize: 10 }}>取消</span>
									</Popconfirm>
								</span>
							) : (
									<span className="cursorPointer" onClick={() => this.edit(record.key)}>编辑</span>
								)}
						</div>

					);
				}
			}
			if (!col.editable) {
				return col;
			}
			return {
				...col,
				onCell: record => ({
					record,
					inputType: col.type,
					dataIndex: col.dataIndex,
					title: col.title,
					required: col.required,
					placeholder: col.placeholder,
					editing: this.isEditing(record),
					options: shelfList
				}),
			};
		});
		return (
			<div className="page-wrapper">
				<div className="page-wrapper-bread">
					<Bread breadList={breadCrumbList} />
				</div>
				
				<div className="page-wrapper-search">
					<SearchForm
						formList={searchData}
						ref={el => this.searchForm = el}
						showSearch={setAction(PATH, 'search')}
						onSubmit={(data) => this.onSearchReset(true, data)}
						onReset={() => this.onSearchReset(0, null)}
					>
					</SearchForm>
				</div>
				<div className="page-wrapper-content">
					<Table
						components={Components}
						bordered
						dataSource={data}
						columns={newColumns}
						pagination={false}
						rowClassName="editable-row"
					/>
				</div>
				<CollapseForm />
			</div>
		)
	}
}

export default StoreOrderDetail