import React, { useState } from 'react';
import { auth } from './firebase'; // Importujemy auth z Firebase
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importujemy funkcję logowania
import { sendPasswordResetEmail } from 'firebase/auth'; // Importujemy funkcję resetowania hasła
import { useNavigate } from 'react-router-dom';  // Importujemy hook useNavigate z React Router
import { Link } from 'react-router-dom'; // Importujemy Link

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState(''); // Stan dla adresu e-mail do resetowania hasła
  const [showResetForm, setShowResetForm] = useState(false); // Stan do kontrolowania wyświetlania formularza resetowania

  const navigate = useNavigate();  // Hook do nawigacji

  // Funkcja logowania
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Zalogowano pomyślnie');
      navigate('/dashboard');  // Przekierowanie na Dashboard po udanym logowaniu
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  // Funkcja do wysyłania maila z linkiem do resetowania hasła
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Link do resetowania hasła został wysłany!');
      setShowResetForm(false); // Ukrywamy formularz resetowania po wysłaniu
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Logowanie</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Hasło"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj'}
        </button>
      </form>

      <button onClick={() => setShowResetForm(true)}>Zapomniałeś hasła?</button>

      {showResetForm && (
        <div>
          <h3>Resetowanie hasła</h3>
          <form onSubmit={handleResetPassword}>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Podaj swój email"
              required
            />
            <button type="submit">Wyślij link do resetowania</button>
          </form>
          <button onClick={() => setShowResetForm(false)}>Anuluj</button>
        </div>
      )}

      {/* Link do strony rejestracji */}
      <p>Nie masz jeszcze konta? <Link to="/register">Zarejestruj się</Link></p>
    </div>
  );
};

export default Login;
