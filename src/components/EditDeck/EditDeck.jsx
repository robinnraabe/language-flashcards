import React, { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Stack, Box, TextField, Select, MenuItem, Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import Swal from 'sweetalert2';

function EditDeck() {
  const history = useHistory();
  const dispatch = useDispatch();
  const deck = useSelector(store => store.editDetails[0]);
  const user = useSelector(store => store.user);
  const languageList = useSelector(store => store.languages);
  const [newInfo, setInfo] = useState({    
    id: deck.id, 
    title: deck.title, 
    details: deck.details, 
    language_id: deck.language_id, 
    image_url: deck.image_url, 
    creator_id: deck.creator_id,
    contributor_id: deck.contributor_id,
    public_status: deck.public_status});
  const [details, setDetails] = useState(deck.details);
  const [title, setTitle] = useState(deck.title);
  const [image, setImage] = useState(deck.image_url);
  const [chosenLanguage, setLanguage] = useState(deck.language_id);
  const [contributors, setContributors] = useState(deck.creator);
  const [status, setStatus] = useState(deck.public_status);

  // This will delete the selected deck and send the user to the UserDeckList page
  const deleteDeck = () => {
    Swal.fire({
      title: "Delete deck?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#42d3ff",
      cancelButtonColor: "#888888",
      confirmButtonText: "Confirm",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: 'DELETE_DECK', payload: [deck.id, user.id] });
        history.push('/decks')
      }
    });
  }

  // Adds new deck details to object
  const updateDeck = (key, value) => {
    setInfo({...newInfo, id: deck.id,
        [key]: value, 
    })
  }

  const handleChange = (type, value) => {
    if (type === 'title') { setTitle(value); }
    else if (type === 'details') { setDetails(value); }
    else if (type === 'language_id') { setLanguage(value); }
    else if (type === 'public_status') { setStatus(value); }
    else if (type === 'contriubtor_id') { setContributors(value); }
    else if (type === 'image_url') { setImage(value); }
    updateDeck(type, value);
  }

  // Saves details returns user to the UserDeckDetails page
  // should return to the deck page itself after setup
  const saveDetails = (event) => {  
    event.preventDefault();
    axios.put('/deck/update', newInfo)
      .then(response => {
        dispatch({ type: 'FETCH_DECK_DETAILS', payload: deck.id });
        setTimeout(() => {
          history.push('/deck/details');
        }, '500');
      })
      .catch(error => {
        console.log('Error saving EditDeck details:', error);
        alert('Something went wrong!');
    })
  }

  const stackStyle = {
    margin: '20px'
  }

  // Toggle swtich styling, probably placeholder
  const ToggleSwitch = styled(Switch)(({ theme }) => ({
      width: 200,
      height: 25,
      padding: 0,
      display: 'flex',
      '&:active': {
      '& .MuiSwitch-thumb': {
          width: 50,
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
          transform: 'translateX(144px)',
      },
      },
      '& .MuiSwitch-switchBase': {
      padding: 3,
      '&.Mui-checked': {
          transform: 'translateX(144px)',
          color: '#fff',
          '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
          },
      },
      },
      '& .MuiSwitch-thumb': {
      boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
      width: 50,
      height: 19,
      borderRadius: 10,
      transition: theme.transitions.create(['width'], {
          duration: 200,
      }),
      },
      '& .MuiSwitch-track': {
      borderRadius: 24 / 2,
      opacity: 1,
      backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
      boxSizing: 'border-box',
      },
  }));

  useEffect(() => {
    dispatch({ type: 'FETCH_LANGUAGES' });
  }, [deck]);

  return (
    <Box sx={{ margin: '50px', width: '80%', backgroundColor: 'aliceblue', borderRadius: '20px', margin: 'auto' }}>
      <Stack style={stackStyle} direction='row' height='100%' justifyContent='space-between'>

        {/* Left stack */}
        <Stack style={stackStyle} direction='column' justifyContent='space-between' padding='18px 0px' >
          <Stack direction='column'>
            <img src={image} width='400px'/>
            <br /><br />
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              URL
              <TextField variant='outlined' margin='0px 10px'
                sx={{ width: '350px' }}
                value={image}
                onChange={(e) => handleChange('image_url', e.target.value)}
              />
            </Stack>
          </Stack>
          <Button type='button' variant='contained' 
            sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }}
            onClick={() => deleteDeck(deck.id)}> Delete Deck </Button>
        </Stack>

        {/* Right stack */}
        <Stack style={stackStyle} direction='column' justifyContent='space-between' width='550px'>
          <Stack style={stackStyle} direction='row' alignItems='center' justifyContent='space-between'>
            Title 
            <TextField variant='outlined' 
              sx={{ width: '400px' }}
              value={title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </Stack>

          <Stack style={stackStyle} direction='row' alignItems='center' justifyContent='space-between'>
            Language
            <Select sx={{ 
              borderRadius: '0px', 
              margin: '0px 3px', 
              width: '400px'  }}
              value={chosenLanguage}
              label='Language'
              onChange={(e) => handleChange('language_id', e.target.value)}>
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
          </Stack>

          <Stack style={stackStyle} direction='row' alignItems='center' justifyContent='space-between'>
            Details
            <TextField 
              multiline
              value={details}
              onChange={(e) => handleChange('details', e.target.value)}
              sx={{ width: '400px' }}
              inputProps={{ style: {fontWeight: '500'} }} 
            />
          </Stack>

          <Stack style={stackStyle} direction='row' alignItems='center' justifyContent='space-between'>
            Contributors
            <TextField variant='outlined'
              sx={{ width: '400px' }}
              value={contributors} 
              onChange={(e) => handleChange('contributor_id', e.target.value)}
            />
          </Stack>

          {/* might make this a toggle instead */}
          <Stack style={stackStyle} direction='row' alignItems='center' justifyContent='space-between'>
            Make public?
            <ToggleSwitch inputProps={{ 'aria-label': 'ant design' }} 
              /* value={status} onChange={(e) => handleChange('public_status', e.target.value)} */ />
          </Stack>
          <Stack style={stackStyle} width='100%'>
            <Button type='submit' variant='contained' 
              sx={{ borderRadius: '0px', fontWeight: '600', backgroundColor: '#42d3ff', color: 'black' }}
              onClick={(e) => saveDetails(e)}>Save</Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default EditDeck;