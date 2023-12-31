import React, { useEffect } from 'react';
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';

import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';

import AboutPage from '../AboutPage/AboutPage';
import UserPage from '../UserPage/UserPage';
import InfoPage from '../InfoPage/InfoPage';
import LandingPage from '../LandingPage/LandingPage';
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';

import UserDeckList from '../UserDeckList/UserDeckList';
import UserDeckDetails from '../UserDeckDetails/UserDeckDetails';
import EditDeck from '../EditDeck/EditDeck';
import StudyPage from '../StudyPage/StudyPage';

import './App.css';



function App() {
  const dispatch = useDispatch();

  const user = useSelector(store => store.user);

  useEffect(() => {
    dispatch({ type: 'FETCH_USER' });
  }, [dispatch]);

  return (
    <Router>
      <div>
        <Nav />
        <Switch>

          {/* Visiting localhost:3000 will redirect to localhost:3000/home */}
          <Redirect exact from="/" to="/home" />


          {/* shows AboutPage at all times (logged in or not) */}
          <Route exact path="/about">
            <AboutPage />
          </Route>


          {/* For protected routes, the view could show one of several things on the same route.
            Visiting localhost:3000/user will show the UserPage if the user is logged in.
            If the user is not logged in, the ProtectedRoute will show the LoginPage (component).
            Even though it seems like they are different pages, the user is always on localhost:3000/user */}


          {/* logged in shows UserPage, else shows LoginPage */}
          <ProtectedRoute exact path="/user">
            <UserPage />
          </ProtectedRoute>

          {/* logged in shows InfoPage, else shows LoginPage */}
          <ProtectedRoute exact path="/info" >
            <InfoPage />
          </ProtectedRoute>


          <Route exact path="/login">
            {user.id ?
              // Redirrect to /user if the user is already logged in
              <Redirect to="/user" />
              :
              // Otherwise, show the login page
              <LoginPage />
            }
          </Route>


          <Route exact path="/registration">
            {user.id ?
              // Redirect to /user if the user is already logged in
              <Redirect to="/user" />
              :
              // Otherwise, show the registration page
              <RegisterPage />
            }
          </Route>


          <Route exact path="/home">
            {user.id ?
              // Redirect to /user if the user is already logged in
              <Redirect to="/user" />
              :
              // Otherwise, show the Landing page
              <LandingPage />
            }
          </Route>

          <Route exact path="/decks">
            <UserDeckList />
          </Route>

          <Route exact path="/deck/details">
            <UserDeckDetails />
          </Route>

          <Route path="/deck/edit">
            <EditDeck />
          </Route> 

          <Route path="/session">
            <StudyPage />
          </Route>

          {/* If none of the other routes matched, we will show a 404. */}
          <Route>
            <h1>404</h1>
          </Route>

        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
