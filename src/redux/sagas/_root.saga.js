import { all } from 'redux-saga/effects';
import loginSaga from './login.saga';
import registrationSaga from './registration.saga';
import userSaga from './user.saga';
import languageSaga from './languages.saga';
import itemSaga from './item.saga';
import chapterSaga from './chapter.saga';
import updateDetailsSaga from './deckDetails.saga';
import promptAnswerSaga from './promptAnswers.saga';
import userSettingsSaga from './userSettings.saga';

// rootSaga is the primary saga.
// It bundles up all of the other sagas so our project can use them.
// This is imported in index.js as rootSaga

// some sagas trigger other sagas, as an example
// the registration triggers a login
// and login triggers setting the user
export default function* rootSaga() {
  yield all([
    loginSaga(), // login saga is now registered
    registrationSaga(),
    userSaga(),
    languageSaga(),
    itemSaga(),
    chapterSaga(),
    updateDetailsSaga(),
    promptAnswerSaga(),
    userSettingsSaga()
  ]);
}
