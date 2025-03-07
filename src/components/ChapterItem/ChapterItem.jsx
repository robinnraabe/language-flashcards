import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, Stack, CardContent, CardActions,
  Grid, Button, TextField, IconButton, Tooltip } from '@mui/material';
import ItemGrid from '../ItemGrid/ItemGrid';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProgressBar from '../ProgressBar/ProgressBar';
import Swal from 'sweetalert2';

// This displays each chapter on the UserDeckDetails page
function ChapterItem(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(store => store.user);
  const [newItem, setItem] = useState({ 
    chapter_id: props.chapter.id,
    deck_id: props.deckId,
    user_id: user.id,
    language_id: props.languageId
  });
  const [edit, setEdit] = useState(false);
  const [newTitle, setTitle] = useState(props.chapter.title);
  const [updateList, setUpdateList] = useState([]);

  let ratio = () => {
    if (props.chapter.learned === 0 || props.chapter.total === 0) {
      return 0;
    }
    else {
      return (props.chapter.learned/props.chapter.total) * 100;
    }
  }

  // Gets 5 extra random items in the same language for study session
  const getExtraItems = () => {
    axios.get(`/items/language/${props.languageId}`)
      .then(response => {
        dispatch({ type: 'SET_LESSON_EXTRAS', payload: response.data });
      })
      .catch(error => {
        console.log('Error in ChapterItem/getExtraItems GET request:', error);
        alert('Something went wrong!');
    })
  }

  // This sends the user to the Study page and loads the selected chapter for studying
  const toLesson = (type, chapterId) => {
    if (type === 'learn') {
      axios.get(`/study/chapter/learn/${chapterId}`).then(response => {
        dispatch({ type: 'SET_LESSON', payload: response.data });
      })
        .catch(error => {
          console.log('Error in ChapterItem/toLesson/learn GET request:', error);
          alert('Something went wrong!');
        })
    }

    else if (type === 'review') {
      axios.get(`/study/chapter/review/${chapterId}`).then(response => {
        dispatch({ type: 'SET_LESSON', payload: response.data });
      })
        .catch(error => {
          console.log('Error in ChapterItem/toLesson/review GET request:', error);
          alert('Something went wrong!');
        })
    }
    getExtraItems();
    setTimeout(() => {
      history.push('/session');
    }, '1000');
  }

  // This toggles the editor for the selected chapter
  const editChapter = (chapterId) => {
    if (edit === true && props.creatorId === user.id) {
      Swal.fire({
        title: "Close editor?",
        text: "Any unsaved changes will be lost.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#42d3ff",
        cancelButtonColor: "#888888",
        confirmButtonText: "Confirm",
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          setEdit(false);
          setUpdateList([]);
        }
      });
    }
    else if (edit === true && props.creatorId !== user.id) {
      setEdit(false);
      setUpdateList([]);
    }
    else {
      setEdit(true);
      setUpdateList([]);
    }
  }

  // This resets the progress for the selected chapter
  const resetProgress = (chapterId) => {

    const request = {
      params: {
        chapterId: chapterId,
        userId: user.id
      }
    }
    // This resets learned_status
    axios.put(`/items/reset/learned`, request)
      .catch((error) => {
        console.log('Error in ChapterItem/resetProgress/learned PUT request:', error);
        alert('Something went wrong!');
    });

    // This resets repetition
    axios.put(`/items/reset/repetition`, request)
      .then((response) => {
        props.getChapterDetails();
      })
      .catch((error) => {
        console.log('Error in ChapterItem/resetProgress/repetition PUT request:', error);
        alert('Something went wrong!');
  });
  }

  // This sets new item to add
  const handleChange = (key) => (event) => {
    event.preventDefault();
    setItem({...newItem, 
     [key]: event.target.value,
    })
  }

  // This adds new item to chapter
  const addItem = () => {
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    setItem({ 
      chapter_id: props.chapter.id,
      deck_id: props.deckId,
      user_id: user.id,
      language_id: props.languageId,
      item: '',
      description: '',
      hint: '',
      custom: '',
      image: ''
    })

    // Updates "total" number of items in chapter
    axios.put(`/chapters/total/add/${props.chapter.id}`)
      .catch(error => {
        console.log('Error updating ChapterItem/total/add:', error);
        alert('Something went wrong!');
    })
  }

  // This deletes the selected chapter from its deck
  const deleteChapter = (chapterAndDeck) => {
    Swal.fire({
      title: "Delete chapter?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#42d3ff",
      cancelButtonColor: "#888888",
      confirmButtonText: "Confirm",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: 'DELETE_CHAPTER', payload: chapterAndDeck });
        // Updates "total" number of items in chapter
        axios.put(`/chapters/total/subtract/${props.chapter.id}`)
          .catch(error => {
            console.log('Error updating ChapterItem/GetProgressData counts:', error);
            alert('Something went wrong!');
        })
      }
    });
  }

  // This updates all items in chapter when saved
  const saveChanges = (chapterId) => {
    // This removes all but the most recent edit from updateList
    if (updateList.length > 0) {
      let removeIndexList = [0];
      for (let index = updateList.length-1; index > -1; index--) {
        for (let removeIndex of removeIndexList) {
          if (updateList[index].i_id === removeIndex) {
            updateList.splice(index, 1);
            break;
          }
        }
        removeIndexList.push(updateList[index].i_id);
      }
      for (let index of updateList) {
        index.chapter_id = chapterId;
      }
      // This creates a PUT request for every row in updateList
      for (let update of updateList) {
        axios.put('/items/update', update)
          .then((response) => {
            dispatch({ type: 'FETCH_CHAPTERS', payload: props.deckId })
            props.getChapterDetails();
          })
          .catch((error) => {
            console.log('Error in ChapterItem/saveChanges PUT request:', error);
            alert('Something went wrong!');
        });
      }
    }
    // This updates the chapter title
    if (newTitle !== props.chapter.title) {
      axios.put('/chapters/update', {title: newTitle, chapterId: props.chapter.id})
        .then((response) => {
          dispatch({ type: 'FETCH_CHAPTERS', payload: props.deckId })
          props.getChapterDetails();
        })
        .catch((error) => {
          console.log('Error in ChapterItem/saveChanges/title PUT request:', error);
          alert('Something went wrong!');
      });
    }
    setUpdateList([]);
    Swal.fire({
      title: "Your changes have been saved.",
      icon: "success",
      confirmButtonColor: "#42d3ff",
      cancelButtonColor: "#888888",
      confirmButtonText: "Ok",
    })
  }

  return (
    <Grid item xs={12}>
      {edit ?
        // Displays chapter in edit mode
        <Card sx={[ 
          {width: '70%'},
          {margin: 'auto'},
          {padding: '0px 20px'},
          {display: 'flex'}, 
          {flexDirection: 'row'},
          {justifyContent: 'space-between'},
          {borderRadius: '0px'}, 
          {backgroundColor: 'aliceblue'},
          {alignItems: 'center'}
        ]}>
          <CardContent sx={{ width: '100%' }}>
              <Stack direction='row' justifyContent='space-between'>
                { user.id === props.creatorId ?
                  <TextField label="Title" variant="outlined"
                    type="text" 
                    value={newTitle} 
                    onChange={e => setTitle(e.target.value)} />
                :
                  <h2>{props.chapter.title}</h2>
                }
                  {/* Button to turn edit mode off */}
                  <IconButton onClick={() => editChapter(props.chapter.id)}
                    disableElevation
                    disableRipple
                    size="large"
                    sx={{
                      ml: 1,
                      "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent"
                      }
                    }} >
                    <Tooltip title="Hide Details">
                        <ExpandLessIcon sx={{fontSize: '40px'}} />   
                    </Tooltip>
                  </IconButton>
              </Stack>

              <ItemGrid chapterId={props.chapter.id} 
                updateList={updateList} 
                setUpdateList={setUpdateList} 
                creatorId={props.creatorId}/>
              <br />
              { user.id === props.creatorId ?
                <form>
                  <TextField label="Word" variant="outlined" sx={{}}
                      required 
                      type="text" 
                      value={newItem.item} 
                      onChange={handleChange('item')} />
                  <TextField label="Definition/Translation" variant="outlined" sx={{}}
                      required 
                      type="text" 
                      value={newItem.description} 
                      onChange={handleChange('description')}/>
                  {/* Audio upload goes here */}
                  <TextField label="Custom" variant="outlined" sx={{}}
                      type="text" 
                      value={newItem.custom} 
                      onChange={handleChange('custom')} />
                  <TextField label="Hint" variant="outlined" sx={{}}
                      type="text" 
                      value={newItem.hint} 
                      onChange={handleChange('hint')} />
                  <TextField label="Image" variant="outlined" sx={{}}
                      type="text" 
                      value={newItem.image} 
                      onChange={handleChange('image')} />
                  <IconButton onClick={() => addItem()}
                    disableElevation
                    disableRipple
                    size="large"
                    sx={{
                      ml: 1,
                      "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent"
                      }
                    }} >
                    <Tooltip title="Add New Item">
                        <AddIcon sx={{fontSize: '40px'}} />   
                    </Tooltip>
                  </IconButton>
                </form>
              :
              ''
              }
              <br /><br />
              { user.id === props.creatorId ?
                <Stack direction='row' justifyContent='space-between'>
                  <Button type='button' variant= 'contained' 
                    sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }}
                    onClick={() => deleteChapter([props.chapter.id, props.chapter.deck_id])}>Delete Chapter</Button>
                  <Button type='button' variant= 'contained' 
                    sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }}
                    onClick={() => resetProgress(props.chapter.id)}>Reset Progress</Button>
                  <Button type='button' variant= 'contained' 
                    sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }}
                    onClick={() => saveChanges(props.chapter.id)}>Save Changes</Button>
                </Stack>
                :
                <Stack direction='row' justifyContent='center'>
                  <Button type='button' variant= 'contained' 
                    sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }}
                    onClick={() => resetProgress(props.chapter.id)}>Reset Progress</Button>
                </Stack>
                }
          </CardContent>
        </Card>
      :
        // Displays chapter in minimized view mode
        <Card sx={[ 
            {width: '70%'},
            {height: '80px'},
            {margin: 'auto'},
            {padding: '0px 20px'},
            {display: 'flex'}, 
            {flexDirection: 'row'},
            {justifyContent: 'space-between'},
            {borderRadius: '0px'}, 
            {backgroundColor: 'aliceblue'},
            {alignItems: 'center'}
        ]}>
          <CardContent sx={{ padding: '0px' }}>
              <h2>{props.chapter.title}</h2>
          </CardContent>
          <Stack direction='row' spacing={20} width='70%' justifyContent='end'>
            <CardContent sx={{ padding: '0px', width: '100%' }}>
              <ProgressBar progress={`${ratio()}%`} height={50} />
            </CardContent> 
            <CardActions>
              {props.chapter.learned < props.chapter.total ?
                  // Clickable if there are unlearned words remaining
                  <Button variant='contained' 
                    sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }} 
                    onClick={() => toLesson('learn', props.chapter.id)}>
                      Learn
                  </Button>
                  :
                  // Greyed out and unclickable
                  <Button variant='contained' 
                    sx={[ {borderRadius: '0px'}, {fontWeight: '600'}, {backgroundColor: 'lightgrey'}, 
                    {color: 'grey'}, {'&:hover': {backgroundColor: 'lightgrey' }} ]}>
                      Learn
                  </Button>
              }
              {props.chapter.learned > 0 ?
                  // Clickable if learned words > 0
                  <Button variant='contained' 
                    sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }} 
                    onClick={() => toLesson('review', props.chapter.id)}>
                      Review
                  </Button>
                  :
                  // Greyed out and unclickable
                  <Button variant='contained' 
                    sx={[ {borderRadius: '0px'}, {fontWeight: '600'}, {backgroundColor: 'lightgrey'}, 
                    {color: 'grey'}, {'&:hover': {backgroundColor: 'lightgrey' }} ]}>
                      Review
                  </Button>
              }
              {/* Button to turn edit mode on */}
              <IconButton onClick={() => editChapter(props.chapter.id)}
                disableElevation
                disableRipple
                size="large"
                sx={{
                  ml: 1,
                  "&.MuiButtonBase-root:hover": {
                    bgcolor: "transparent"
                  }
              }}>
                <Tooltip title="Open Detailed View">
                  <ExpandMoreIcon sx={{fontSize: '40px'}} />   
                </Tooltip>
              </IconButton>
            </CardActions>
          </Stack>
        </Card>
      }
    </Grid>
  )
}

export default ChapterItem;