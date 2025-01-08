// src/RegisterEmployee.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Importujemy Firebase Authentication

const RegisterEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    pesel: '',
    documentNumber: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook do przekierowywania

  // Funkcja do aktualizacji formularza
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Funkcja do obsługi wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      // Rejestracja nowego użytkownika w Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Możemy dodać tutaj zapis do Firestore lub innej bazy danych, żeby przechować dane pracownika

      // Przekierowanie po udanej rejestracji
      navigate('/dashboard');
    } catch (err) {
      setError(err.message); // Wyświetlamy komunikat o błędzie
    }
  };

  return (
    <div>
      <h2>Rejestracja nowego pracownika</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="Imię"
          value={formData.firstName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Nazwisko"
          value={formData.lastName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Adres"
          value={formData.address}
          onChange={handleChange}
        />
        <input
          type="text"
          name="pesel"
          placeholder="PESEL"
          value={formData.pesel}
          onChange={handleChange}
        />
        <input
          type="text"
          name="documentNumber"
          placeholder="Numer dokumentu"
          value={formData.documentNumber}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
        />
        {error && <p>{error}</p>}
        <button type="submit">Zarejestruj</button>
      </form>
    </div>
  );
};

export default RegisterEmployee;
