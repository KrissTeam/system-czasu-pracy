import React, { useState, useEffect } from 'react';
import { db } from './firebase';  // Importujemy bazę danych Firestore
import { collection, getDocs } from 'firebase/firestore';  // Importujemy funkcje do pobierania danych z Firestore

const DashboardAdmin = () => {
  const [users, setUsers] = useState([]);  // Stan do przechowywania listy użytkowników
  const [loading, setLoading] = useState(true);  // Stan do śledzenia ładowania danych

  // Funkcja do pobierania użytkowników z Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));  // Pobieramy dokumenty z kolekcji 'users'
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));  // Przechowujemy dane w tablicy
      setUsers(usersList);  // Ustawiamy stan z pobranymi użytkownikami
    } catch (error) {
      console.error("Błąd podczas pobierania użytkowników: ", error);
    } finally {
      setLoading(false);  // Po zakończeniu ładowania danych, ustawiamy loading na false
    }
  };

  useEffect(() => {
    fetchUsers();  // Wywołujemy funkcję do pobierania danych przy załadowaniu komponentu
  }, []);  // Ten useEffect uruchomi się tylko raz przy renderowaniu komponentu

  if (loading) {
    return <div>Ładowanie danych...</div>;  // Komunikat podczas ładowania danych
  }

  return (
    <div>
      <h2>Dashboard Admina</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Imię</th>
            <th>Nazwisko</th>
            <th>Adres</th>
            <th>PESEL</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.address}</td>
              <td>{user.pesel}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardAdmin;
