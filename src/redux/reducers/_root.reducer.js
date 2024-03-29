import { combineReducers } from 'redux';
import errors from './errors.reducer';
import user from './user.reducer';
import deck from './deck.reducer';
import languages from './language.reducer';
import deckDetails from './deckDetails.reducer';
import chapters from './chapters.reducer';
import items from './items.reducer';
import lesson from './lesson.reducer';
import lessonExtras from './lessonExtras.reducer';
import prompts from './prompts.reducer';
import answers from './answers.reducer';
import learnedCount from './learnedCount.reducer';
import totalCount from './totalCount.reducer';
import correct from './correct.reducer';
import wrong from './wrong.reducer';
import editDetails from './editDetails.reducer';

// rootReducer is the primary reducer for our entire project
// It bundles up all of the other reducers so our project can use them.
// This is imported in index.js as rootSaga

// Lets make a bigger object for our store, with the objects from our reducers.
// This is what we get when we use 'state' inside of 'mapStateToProps'
const rootReducer = combineReducers({
  errors, // contains registrationMessage and loginMessage
  user, // will have an id and username if someone is logged in
  deck,
  languages,
  deckDetails,
  chapters,
  items,
  lesson,
  lessonExtras,
  prompts,
  answers,
  learnedCount,
  totalCount,
  correct,
  wrong, 
  editDetails

});

export default rootReducer;
