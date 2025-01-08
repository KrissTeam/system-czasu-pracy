import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Zaimportuj Navigate
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

const App = () => {
  const [user, setUser] = useState(null);

  // Nasłuchujemy stanu logowania użytkownika
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Jeśli użytkownik się zaloguje, zapisujemy go w stanie
    });

    return () => unsubscribe(); // Czyszczenie subskrypcji po wylogowaniu
  }, []);

  // Komponent PrivateRoute, który zapewnia dostęp do stron tylko dla zalogowanych użytkowników
  const PrivateRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />; // Jeśli użytkownik nie jest zalogowany, przekierowujemy na login
    }
    return children; // Jeśli użytkownik jest zalogowany, wyświetlamy dzieci (np. Dashboard)
  };

  return (
    <Router>
      <Routes>
        {/* Przekierowanie domyślne na /login jeśli nie jesteś zalogowany */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Strona logowania */}
        <Route path="/login" element={<Login />} />

        {/* Strona rejestracji */}
        <Route path="/register" element={<Register />} />

        {/* Strona Dashboard (dostęp tylko dla zalogowanych użytkowników) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
