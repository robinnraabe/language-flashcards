import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Grid, Stack, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import DeckItem from '../DeckItem/DeckItem';

function UserPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [userDeckList, setUserDeckList] = useState([]);
  const languageList = useSelector(store => store.languages);
  const [chosenLanguage, setLanguage] = useState({});
  const user = useSelector(store => store.user);

  // Sets language ID for GET route
  const handleLanguageChange = (key) => (event) => {
    setLanguage({[key]: event.target.value}); 
    console.log(chosenLanguage);
  }

  // Sends user to the page for the selected deck
  const toDeck = (deckId) => {
    axios.get(`/deck/${deckId}`).then(response => {
      dispatch({ type: 'SET_DECK_DETAILS', payload: response.data });
      history.push('/deck/details');
    })
      .catch(error => {
        console.log('Error getting deck details:', error);
        alert('Something went wrong!');
      })
  }

  // Creates a new (empty) deck and sends the user to the EditDeck page
  const addDeck = () => {
    const newDeck = {
      title: 'New Deck', 
      details: 'New Deck', 
      language_id: 3, 
      creator_id: user.id, 
      contributor_id: user.id,
      image_url: 'https://images.unsplash.com/photo-1483354483454-4cd359948304'
    }
    dispatch({ type: 'ADD_DECK', payload: newDeck });
    getUserDeckList();
    // history.push('/deck/edit');
  }

  const getUserDeckList = () => {
    // need to pass user ID?, toggle and language filters
    axios.get(`/decks/user/all/${user.id}`).then((response) => {
        const action = { type: 'SET_USER_DECK_LIST', payload: response.data };
        dispatch(action);
        setUserDeckList(response.data);
    }).catch((error) => {
        console.log('GET /user/all error', error);
        alert("Something went wrong fetching user's decks");
    })
    console.log('chosenLanguage:', chosenLanguage);
  }
  
  useEffect(() => {
    getUserDeckList();
    // dispatch({ type: 'FETCH_LANGUAGES' });
  }, [])

  return (
    <div>
      {/* Subheader filters */}
      <Stack direction='row' alignItems='center' justifyContent='space-between' margin='20px'>
        <Button variant='contained' onClick={() => addDeck()}>+ New Deck</Button>
        
        {/* Language select filter - still need to make this select an option */}
        <FormControl>
          <InputLabel>Language</InputLabel>
          <Select sx={{ 
            backgroundColor: 'lavender', 
            borderRadius: '20px', 
            margin: '0px 3px', 
            width: '200px'  }}
            value={chosenLanguage.id}
            label='Language'
            onChange={handleLanguageChange('id')}
          >
            {languageList.map(language => {
                return (
                    <MenuItem 
                        key={language.id} 
                        value={language.id}>
                            {language.language}
                    </MenuItem>
                );
            })}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction='row' justifyContent='space-between' sx={{ margin: '0px 20px'}}>
            <h2>Decks</h2>
        </Stack>
      <Grid container spacing={1}>
        {userDeckList.map((deck) => {
            return <DeckItem key={deck.id} deck={deck} toDeck={() => toDeck(deck.deck_id)} />
        })} 
      </Grid>
    </div>
  );
}

export default UserPage;
