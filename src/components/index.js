import SearchForm from './SearchForm/SearchForm'
import Bread from './Bread/Bread'
import { EditableCell, EditableFormRow, EditableContext, SignalEditCell } from './EditTable/EditTable';
const Components = {
  body: {
    row: EditableFormRow,
    cell: EditableCell,
  },
};
const EditSignalCellComponents = {
  body: {
    row: EditableFormRow,
    cell: SignalEditCell,
  }
}
export {
  SearchForm,
  Bread,
  EditableCell,
  Components,
  EditableContext,
  EditSignalCellComponents,
}
