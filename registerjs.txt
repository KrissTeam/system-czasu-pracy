import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase'; // Importujemy auth i db z pliku firebase
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';  // Dodajemy importy setDoc i doc

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [pesel, setPesel] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [role, setRole] = useState('user'); // Dodajemy stan dla roli (domyślnie ustawione na 'user')
  const navigate = useNavigate();

  // Nasłuchujemy, czy użytkownik jest już zalogowany
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate('/dashboard'); // Przekierowanie do dashboardu, jeśli użytkownik jest już zalogowany
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Rejestracja użytkownika w Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Zarejestrowano użytkownika:', user);

      // Zapisz dane użytkownika w Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        address,
        pesel,
        documentNumber,
        email,
        role, // Zapisujemy rolę użytkownika w Firestore
      });

      console.log('Dane użytkownika zapisane w Firestore');
      
      alert('Zarejestrowano pomyślnie');
      navigate('/dashboard'); // Przekierowanie na dashboard po pomyślnej rejestracji
    } catch (error) {
      console.error('Błąd rejestracji:', error.message);
      alert('Błąd rejestracji: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Rejestracja</h2>
      <form onSubmit={handleRegister}>
        {/* Formularz rejestracji */}
        <div>
          <label>Imię:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nazwisko:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Adres:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>PESEL:</label>
          <input
            type="text"
            value={pesel}
            onChange={(e) => setPesel(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Numer dokumentu:</label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Dodajemy opcję wyboru roli */}
        <div>
          <label>Wybierz rolę:</label>
          <div>
            <input
              type="radio"
              id="user"
              name="role"
              value="user"
              checked={role === 'user'}
              onChange={() => setRole('user')} // Ustawiamy rolę na 'user'
            />
            <label htmlFor="user">Użytkownik</label>
          </div>
          <div>
            <input
              type="radio"
              id="admin"
              name="role"
              value="admin"
              checked={role === 'admin'}
              onChange={() => setRole('admin')} // Ustawiamy rolę na 'admin'
            />
            <label htmlFor="admin">Administrator</label>
          </div>
        </div>
        <button type="submit">Zarejestruj się</button>
      </form>
      <p>
        Masz już konto? <a href="/login">Zaloguj się tutaj</a>
      </p>
    </div>
  );
};

export default Register;
