import React, { useState, useEffect, useRef } from 'react';
import Loading from "../Loading";
import { deleteRows, createRow, updateRow, fetchRows, renderChemicals, renderPolygon } from './TableHelper';
import ToolbarAddon from './ToolbarAddon';

// STYLE IMPORTS
import { makeStyles } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  addNew: {
    '& :hover': {
      color: theme.palette.primary.main
    }
  },
  formControl: {
    minWidth: 120,
    margin: theme.spacing(1)
  }
}))

const DBTable = (props) => {
    const columnIdxs = useRef([]);
    const rowEditing = useRef({});
    const blankRow = useRef({});
    const editingNodes = useRef([]);
    const lastSortedColumn = useRef(null);
    const newRowActive = useRef(false);
    const rowIdxEditing = useRef(null);
    const setRowIdxEditing = (value) => rowIdxEditing.current = value;

    const classes = useStyles();  
    const [columns, setColumns] = useState([]);
    const [tableLoading, setTableLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [rows, setRows] = useState(props.rows);

    // DataTable component should re-render when 'editState' changes
    // but since it only keeps up-to-date values of refs, not state,
    // we need to setState to trigger a re-render but use a ref to keep track of the value
    const editStateRef = useRef(false);
    const [_, setEditState] = useState(false);

    const setEditStateOverwrite = (value) => {
        editStateRef.current = value;
        setEditState(value);
    }
    
    useEffect(() => {
        const turnOffEditing = (e) => {
            turnOffEditState(false);
        }

        window.addEventListener('click', turnOffEditing)

        return () => {
        window.removeEventListener('click', turnOffEditing)
        }
    })

    const customBodyRender = (value, tableMeta) => {
        if (value === null || value === undefined) {
            return null;
        } else if (tableMeta.columnData.name === 'polygon') { 
            return renderPolygon(value.split(','));
        } else if (tableMeta.columnData.name === 'chemicals') { 
            return renderChemicals(value);
        } else {
            return value.toString();
        }
    }

    const colOptions = {
        customBodyRender,
        setCellProps: (cellValue, rowIndex, columnIndex) => {
            return {
                'data-row-index': rowIndex,
                'data-is-cell': true,
                'data-original-content': cellValue || '',
                'data-column-index': columnIndex,
                tabIndex: rowIndex,
                onFocus: (e) => {
                    if ((editStateRef.current && (rowIndex !== rowIdxEditing.current)) || !(columnEditable(columnIndex))) {
                        e.target.blur();
                    }
                }
        }},
    }

    const setupColumns = (cols) => {
        return cols.map(col => {
            rowEditing.current[col] = null;
            blankRow.current[col] = null;

            columnIdxs.current.push(col);
            
            const display = col === 'updated_at' ? false : true;          
            return ({
                name: col, 
                label: col.split("_").join(" "),
                options: {
                    display, 
                    ...colOptions
            }
        })});
    }

    const resetTable = () => {
        props.clearAllErrors();
        setColumns([]);
        setMessages([]);
        setSearchText('');
        setTableLoading(true);
        columnIdxs.current = [];
    }

    useEffect(() => {
        resetTable();

        fetchRows(props)
        .then((fetchedRows) => { 
            setTableLoading(false);

            if (fetchedRows.length) {
                return setColumns(setupColumns(Object.keys(fetchedRows[0])));
            } else {
                return props.fetchColumns(props.tableName)
                .then(cols => setColumns(setupColumns(cols)))
            }
        })
        .catch((err) => {
            setRows([]); 
            console.log(err)
        });
    }, [props.content])

    useEffect(() => {
        setRows(props.rows);
    }, [props.rows])

    const discardEdits = () => {
        editingNodes.current.forEach(node => {
            const prevContent = node.dataset.originalContent;
            node.textContent = prevContent;
        })

        editingNodes.current = [];
    }

    const disableEditing = () => {
        editingNodes.current.forEach(node => {
            node.contentEditable = false;
        })
    }

    const turnOffEditState = (saveChanges) => {
        disableEditing();  
        setEditStateOverwrite(false);
        setRowIdxEditing(null);

        if (saveChanges) {
            const action = saveChanges === 'create' ? createRow : updateRow;
            action(props, rowEditing.current)
            .catch(err => discardEdits());
        } else {
            discardEdits()
        }

        if (newRowActive.current) {
            const rowsCopy = [...rows];
            rowsCopy.shift();
            setRows(rowsCopy);

            newRowActive.current = false;
            editingNodes.current = [];
        }
        rowEditing.current = blankRow.current;
    }

    const editCell = (rowIdx, node, colIndex) => {
        node.contentEditable = true;
        editingNodes.current.push(node);

        const column = columns[colIndex].name;
        node.oninput = (e) => {
            rowEditing.current[column] = e.target.textContent;
        };

    }

    const onRowClick = (rowData, rowMeta, event) => {
        event.stopPropagation();
        const rowIndex = rowMeta.dataIndex;

        // turn off editing mode if in editState and the row clicked is not the row currently being edited
        // or if adding a new row and row clicked is not the new row
        if ((editStateRef.current && rowIdxEditing.current !== rowIndex)
            || (newRowActive.current && rowIdxEditing.current !== rowIndex)) {
            return turnOffEditState();
        }

        if (!editStateRef.current) {
            const targetRow = rows[rowIndex];
            rowEditing.current = Object.assign({}, targetRow);
        }

        setEditStateOverwrite(true);
        setRowIdxEditing(rowIndex);

        event.currentTarget.childNodes.forEach(node => {
            const columnIndex = parseInt(node.dataset.columnIndex);

            
            if (node.dataset.isCell && columnEditable(columnIndex)) {
                editCell(rowIndex, node, columnIndex);
            }
        });
    }

    const columnEditable = (columnIndex) => {
        const idIdx = 0;
        const createdAtIdx = columnIdxs.current.indexOf('created_at');
        const updatedAtIdx = columnIdxs.current.indexOf('updated_at');
        const farmerIdx = columnIdxs.current.indexOf('farmer');
        const polygonIdx = columnIdxs.current.indexOf('polygon');

        const nonEditablesIdxs = [idIdx, createdAtIdx, updatedAtIdx, farmerIdx, polygonIdx];

        if (nonEditablesIdxs.includes(columnIndex)) {
            return false;
        } else {
            return true;
        }
    }

    const onRowsDelete = (indexes) => {
        const { rows } = props;
        const idsToDelete = indexes.map(idx => rows[idx].id);
        deleteRows(props, idsToDelete)
        .catch(err => console.log(err));
    }

    const onRowsSelect = (currentSelection, allSelected) => {
        const deleteIcon = document.querySelector('[title="Delete"]');
        const dataIdxs = allSelected.map(obj => obj.dataIndex);
        deleteIcon.onclick = (e) => {
            e.stopPropagation();
            return onRowsDelete(dataIdxs);
        };
    }

    const setupColumnDuplication = column => {
        const colIdx = columnIdxs.current.indexOf(column);
        const columnCopy = Object.assign({}, columns[colIdx]);
        const columnsCopy = [...columns];

        return {colIdx, columnCopy, columnsCopy};
    }

    const onColumnViewChange = (column, action) => {
        const {colIdx, columnCopy, columnsCopy} = setupColumnDuplication(column);

        if (action === 'remove') {
            columnCopy.options.display = false;
        } else {
            columnCopy.options.display = true;
        }

        columnsCopy[colIdx] = columnCopy;
        setColumns(columnsCopy);
    }

    const onFilterChange = (changedColumn, filterList, type) => {
        const {colIdx, columnCopy, columnsCopy} = setupColumnDuplication(changedColumn);

        columnCopy.options.filterList = filterList[colIdx];
        columnsCopy[colIdx] = columnCopy;
        setColumns(columnsCopy);
    }

    const onColumnSortChange = (changedColumn, direction) => {
        if (lastSortedColumn.current) delete lastSortedColumn.current.options.sortDirection;

        const {colIdx, columnCopy, columnsCopy} = setupColumnDuplication(changedColumn);
        direction = direction === 'ascending' ? 'asc' : 'desc';

        columnCopy.options.sortDirection = direction;
        columnsCopy[colIdx] = columnCopy;
        lastSortedColumn.current = columnCopy;

        setColumns(columnsCopy);
    }

    const loadingContent = tableLoading ?  <Loading /> : 'No matching records found';

    const tableOptions = {
        filterType: 'checkbox',
        textLabels: {
            body: {
                noMatch: loadingContent,
                toolTip: "Sort",
                columnHeaderTooltip: column => `Sort for ${column.label}`
            }
        },
        onRowsSelect,
        onRowClick,
        onSearchChange: (text) => setSearchText(text),
        searchText,
        onColumnViewChange,
        onFilterChange,
        onColumnSortChange,
        customToolbar: () => (
            <ToolbarAddon
            classes={classes} 
            editState={editStateRef.current}
            setEditState={setEditStateOverwrite}
            rowEditing={rowEditing.current}
            rows={rows}
            setRows={setRows}
            turnOffEditState={turnOffEditState}
            columns={columns}
            setColumns={setColumns}
            setSearchText={setSearchText}
            newRowActive={newRowActive}
            rowIdxEditing={rowIdxEditing}
        />)
    };

    return(
        <MUIDataTable
            title={
            <React.Fragment>
            <Typography component='h2' variant='h5' display='inline'>
                {props.content}
            </Typography>
            </React.Fragment>}
            data={rows}
            columns={columns}
            options={tableOptions}
            className={classes.root}
        />
    )
}

export default DBTable;