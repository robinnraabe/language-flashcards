import React from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableFooter, TablePagination } from '@mui/material';
import ItemRow from '../ItemRow/ItemRow';

function ItemGrid(props) {
  const items = useSelector(store => store.items);
  const dispatch = useDispatch();

  // Gets details for all items in selected chapter
  const getItemDetails = () => {
    axios.get(`/items/${props.chapterId}`).then(response => {
      dispatch({ type: 'SET_ITEM_DETAILS', payload: response.data });
    })
      .catch(error => {
      console.log('Error getting item details:', error);
      alert('Something went wrong!');
      })
  }

  useEffect(() => {
    getItemDetails();
  }, [])

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Word</TableCell>
            <TableCell align="center">Definition/Translation</TableCell>
            <TableCell align="center">Image</TableCell>
            <TableCell align="center">Custom</TableCell>
            <TableCell align="center">Hint</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((row) => (
            <ItemRow row={row} 
              chapterId={props.chapterId} 
              updateList={props.updateList} 
              setUpdateList={props.setUpdateList} 
              creatorId={props.creatorId}/>
          ))}
        </TableBody> 
      </Table>
    </TableContainer>
  );
}

export default ItemGrid;