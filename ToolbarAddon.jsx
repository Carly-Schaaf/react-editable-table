import React from 'react';

// STYLE IMPORTS
import AddCircleIcon from '@material-ui/icons/AddCircle';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';

export default ({ 
    rows, 
    rowEditing, 
    setRows,
    classes, 
    columns, 
    setColumns, 
    newRowActive,
    rowIdxEditing,
    setSearchText, 
    editState, 
    setEditState, 
    turnOffEditState }) => {

    const clearTableFilters = () => {
        const colsCopy = columns.map(col => {
            const colCopy = Object.assign({}, col);
            colCopy.options.filterList = [];
            return colCopy;
        })
        
        setColumns(colsCopy);
    }

    const addNewRow = (e) => {
        e.stopPropagation();
        setEditState(true);

        const rowsCopy = [...rows];
        rowsCopy.unshift(rowEditing);
        setRows(rowsCopy);
        
        newRowActive.current = true; 
        rowIdxEditing.current = 0;

        // reset table so that new row is visible
        setSearchText('');
        clearTableFilters();
    }

    const saveChanges = (e) => {
        e.stopPropagation();

        const type = newRowActive.current ? 'create' : 'update';
        turnOffEditState(type);
    }
    
    const renderSaveButton = () => {
        if (editState) {
          return (
            <div>
              <Button 
              onClick={saveChanges}
              variant='contained' 
              color='primary' 
              data-save-changes>
                Save Changes
              </Button>
            </div>
          )
        } else {
          return null;
        }
      }
    
    return (
        <React.Fragment>
            <Tooltip title='Add row'>
                <IconButton 
                disabled={editState}
                onClick={addNewRow}
                className={classes.addNew}>
                <AddCircleIcon />
                </IconButton>
            </Tooltip>
           {renderSaveButton()}
        </React.Fragment>
    );
}
