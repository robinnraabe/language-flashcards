import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Stack, Box, Grid } from '@mui/material';
import ChapterItem from '../ChapterItem/ChapterItem';

// Displays the details for the selected deck
function DeckDetails() {
  const deck = useSelector(store => store.deckDetails[0]);
  const chapters = useSelector(store => store.chapters);
  const deckId = deck.id;
  const history = useHistory();
  const dispatch = useDispatch();

  // Sends the user back to UserDeckList page
  const toUserDeckList = () => {
    history.push('/decks');
  }

  // Sends the user to the EditDeck page
  // need to figure out how to create a page for each deck...
  const toEditDeck = () => {
    axios.get(`/deck/${deckId}`).then(response => {
        dispatch({ type: 'SET_DECK_DETAILS', payload: response.data });
        history.push('/deck/edit');
      })
        .catch(error => {
          console.log('Error getting deck details:', error);
          alert('Something went wrong!');
        })
  }

  // Gets details for all chapters in selected deck
  const getChapterDetails = () => {
    axios.get(`/chapters/${deckId}`).then(response => {
        dispatch({ type: 'SET_CHAPTER_DETAILS', payload: response.data });
      })
        .catch(error => {
          console.log('Error getting chapter details:', error);
          alert('Something went wrong!');
        })
  }

  // This adds a new chapter to the deck
  const addChapter = () => {
    const newChapter = { 
      deck_id: deckId,
      title: 'New Chapter',
      learned: 0,
      reviewed: 0,
      total: 0,
      edit: true
    };
    dispatch({ type: 'ADD_CHAPTER', payload: newChapter });
    getChapterDetails();
  }

  const toLesson = (type) => {
    // This will link to Learning/Review page and load deck for studying
    history.push('/session');
  }

  const resetProgress = () => {
    // Update the learning and review progress in the database to equal 0
  }

  const boxStyle = {
    color: 'lavender',
    padding: '20px',
    backgroundImage: `url('${deck.image_url}')`
  }

  const btnStyle = {
    color: 'white',
    margin: '5px 0px'
  }

  useEffect(() => {
    getChapterDetails();
  }, []);

  // Displays the information for the selected Deck
  return (
    <div data-testid="deckDetails">
        {/* Top subheader */}
        <Stack direction='row' justifyContent='space-between' >

            {/* Left subheader items */}
            <Stack direction='row' alignItems='center'>
                <img src='https://static.tumblr.com/d7d601c9f738a1e6098326472def2cac/zd84lno/qI6p0mf8w/tumblr_static_9tutvrt14iskcs04w448040wo.png' 
                    style={{borderRadius: '200px'}} 
                    width='80px' height='80px' />
                <Stack direction='column'>
                    {deck.title}<br />
                    Creator: {deck.creator_id}
                </Stack>
            </Stack>

            {/* Right subheader items */}
            <Stack alignItems='center'>
                Language: {deck.language_id}<br />
                <Button onClick={toUserDeckList} 
                    disableRipple
                    variant='contained'>
                        Return to decks
                </Button>
            </Stack>
        </Stack>

        {/* Stats and deck options */}
        <Box style={boxStyle}>
            <Stack direction='row' justifyContent='space-between'>
                <Stack direction='column'>
                    <Button variant='contained' style={btnStyle}
                        onClick={() => toLesson('learning')}>
                        Learn
                    </Button>
                    <Button variant='contained' style={btnStyle}
                        onClick={() => toLesson('learning')}>
                        Review
                    </Button>
                </Stack>

                <Stack direction='column'>
                    <Button variant='contained' style={btnStyle}
                        onClick={() => toEditDeck()}>
                        Edit Deck
                    </Button>
                    <Button variant='contained' style={btnStyle}
                        onClick={() => resetProgress()}>
                        Reset Progress
                    </Button>
                </Stack>
            </Stack>
        </Box>

        {/* Chapters header */}
        <Stack direction='row' justifyContent='space-between' sx={{ margin: '0px 20px'}}>
            <h2>Chapters</h2>
            <Button onClick={addChapter}>+ New Chapter</Button>
        </Stack>
        
        <Grid container spacing={2}>
            {chapters.map((chapter) => {
                return <ChapterItem key={chapter.id} chapter={chapter} getChapterDetails={getChapterDetails} />
            })} 
        </Grid>
    </div>
  );
}

export default DeckDetails;