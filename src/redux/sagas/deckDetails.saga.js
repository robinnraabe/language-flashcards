import { takeLatest, put } from 'redux-saga/effects';
import axios from 'axios';

function* updateDeckDetails(action) {
    try {
        yield axios.put(`/deck/update`, action.payload);
        yield put ({ type: 'FETCH_DECK_DETAILS', payload: action.payload.id });
    } catch (error) {
        console.log('Error updating deck:', error);
    }
}

function* fetchDeckDetails(action) {
    try { 
        const deckDetails = yield axios.get(`/deck/${action.payload}`);
        console.log('deets:', deckDetails.data[0]);
        yield put ({
          type: 'SET_DECK_DETAILS',
          payload: deckDetails.data[0]
        });
      } catch (error) {
        console.log('Error fetching deck details:', error);
      }
}

function* addNewDeck(action) {
    try {
        yield axios.post('/deck', action.payload);
        yield put ({ type: 'SET_DECK_DETAILS', payload: action.payload });
    } catch (error) {
        console.log('Error adding deck:', error);
    }
}

function* deleteDeck(action) {
  const request = {
    params: {
      deckId: action.payload[0],
      userId: action.payload[1]
    }
  }
    try {
      yield axios.delete(`/deck/delete`, request); 
      yield put ({ type: 'FETCH_DECKS', payload: action.payload[1] });
    } catch (error) {
      console.log('Error deleting deck:', error);
    }
}

function* fetchDecks(action) {
    try { 
      const deckList = yield axios.get(`/decks/user/all/${action.payload}`);
      yield put ({
        type: 'SET_USER_DECKLIST',
        payload: deckList
      });
    } catch (error) {
      console.log('Error fetching decks:', error);
    }
  }

function* updateDetailsSaga() {
    yield takeLatest('UPDATE_DECK', updateDeckDetails);
    yield takeLatest('ADD_DECK', addNewDeck);
    yield takeLatest('DELETE_DECK', deleteDeck);
    yield takeLatest('FETCH_DECKS', fetchDecks);
    yield takeLatest('FETCH_DECK_DETAILS', fetchDeckDetails);
}

export default updateDetailsSaga;
