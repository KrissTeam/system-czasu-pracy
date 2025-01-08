import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, onSnapshot, addDoc, updateDoc } from 'firebase/firestore'; // Dodane importy

const Dashboard = () => {
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  const [comment, setComment] = useState('');
  const [userRole, setUserRole] = useState(''); // Rola użytkownika (admin/user)
  const [firstName, setFirstName] = useState('');  // Stan przechowujący imię użytkownika
  const [lastName, setLastName] = useState('');    // Stan przechowujący nazwisko użytkownika
  const [activeSession, setActiveSession] = useState(null); // Stan przechowujący aktywną sesję
  const db = getFirestore();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login'); // Jeśli użytkownik nie jest zalogowany, przekierowujemy na login
    } else {
      fetchUserRole(); // Sprawdzamy rolę użytkownika
      fetchUserData(); // Pobieramy dane użytkownika
      checkActiveSession(); // Sprawdzamy, czy użytkownik ma aktywną sesję pracy
    }
  }, [navigate]);

  const fetchUserRole = async () => {
    const userEmail = auth.currentUser?.email;
    if (userEmail === 'barmiedwie@gmail.com') {
      setUserRole('admin');
    } else {
      const userRef = collection(db, 'users');
      const userQuery = query(userRef, where('uid', '==', auth.currentUser?.uid));
      onSnapshot(userQuery, (snapshot) => {
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0].data();
          setUserRole(userDoc.role || 'user');
        }
      });
    }
  };

  const fetchUserData = async () => {
    const userRef = doc(db, 'users', auth.currentUser?.uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
    } else {
      console.log("Nie znaleziono użytkownika.");
    }
  };

  const checkActiveSession = async () => {
    const sessionRef = doc(db, 'work_sessions', auth.currentUser?.uid);
    const sessionSnapshot = await getDoc(sessionRef);

    if (sessionSnapshot.exists()) {
      const sessionData = sessionSnapshot.data();
      if (sessionData.startTime && !sessionData.endTime) {
        // Jeśli sesja jest aktywna
        setStartTime(new Date(sessionData.startTime));
        setActiveSession(sessionData);
      }
    }
  };

  const startWork = async () => {
    const currentTime = new Date();
    setStartTime(currentTime);
    // Zapisujemy czas rozpoczęcia pracy w Firestore
    const sessionRef = doc(db, 'work_sessions', auth.currentUser?.uid);
    await setDoc(sessionRef, { startTime: currentTime.toISOString(), endTime: null });
    setActiveSession({ startTime: currentTime.toISOString() });
  };

  const endWork = async () => {
    const currentTime = new Date();
    setEndTime(currentTime);
    // Zapisujemy czas zakończenia pracy w Firestore
    const sessionRef = doc(db, 'work_sessions', auth.currentUser?.uid);
    await updateDoc(sessionRef, { endTime: currentTime.toISOString() });
    setActiveSession(null); // Kończymy sesję
  };

  const calculateWorkedHours = () => {
    if (!startTime || !endTime) return { hours: 0, minutes: 0 };
    const diffInMs = endTime - startTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const hours = Math.floor(diffInHours);
    const minutes = Math.round((diffInHours - hours) * 60);
    return { hours, minutes };
  };

  const saveWorkSession = async () => {
    // Upewnijmy się, że firstName i lastName są dostępne przed zapisaniem
    if (!firstName || !lastName) {
      console.error("Brak danych użytkownika, nie można zapisać sesji pracy.");
      return; // Zatrzymujemy zapis, jeśli imię lub nazwisko są puste
    }

    const { hours, minutes } = calculateWorkedHours();
    const newSession = {
      userId: auth.currentUser?.uid,
      firstName: firstName || "Nieznane",  // Ustawiamy domyślną wartość
      lastName: lastName || "Nieznane",    // Ustawiamy domyślną wartość
      startTime: startTime?.toLocaleString(),
      endTime: endTime?.toLocaleString(),
      workedHours: `${hours}h ${minutes}m`,
      comment,
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, 'work_sessions'), newSession);
      console.log('Sesja pracy została zapisana.');
    } catch (error) {
      console.error('Błąd podczas zapisywania sesji pracy:', error);
    }

    setWorkHistory((prevHistory) => [...prevHistory, newSession]);
    setStartTime(null);
    setEndTime(null);
    setComment('');
  };

  const fetchWorkHistory = () => {
    const workSessionsRef = collection(db, 'work_sessions');
    let userWorkQuery;

    if (userRole === 'admin') {
      userWorkQuery = query(workSessionsRef);
    } else {
      userWorkQuery = query(workSessionsRef, where('userId', '==', auth.currentUser?.uid));
    }

    onSnapshot(userWorkQuery, (snapshot) => {
      const workSessions = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Dodajemy ID do każdej sesji pracy
      }));
      setWorkHistory(workSessions);
    });
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Na pewno chcesz usunąć tę sesję pracy?')) {
      try {
        const sessionRef = doc(db, 'work_sessions', sessionId);
        await deleteDoc(sessionRef); // Usuwanie dokumentu z Firestore
        console.log('Sesja pracy została usunięta');
      } catch (error) {
        console.error('Błąd podczas usuwania sesji pracy:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error.message);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchWorkHistory();
    }
  }, [auth.currentUser, userRole]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2 style={{ color: '#4A90E2' }}>
        Witaj {firstName && lastName ? `${firstName} ${lastName}` : auth.currentUser?.email}
      </h2>
      <p style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#555' }}>
        Twoja rola: <strong>{userRole === 'admin' ? 'Administrator' : 'Użytkownik'}</strong>
      </p>

      {/* Przyciski do rozpoczęcia i zakończenia pracy */}
      {!startTime && !endTime && !activeSession && (
        <div>
          <button
            onClick={startWork}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px 0',
              transition: 'background-color 0.3s',
            }}
          >
            Rozpocznij pracę
          </button>
        </div>
      )}

      {(startTime || activeSession) && !endTime && (
        <div>
          <p>Rozpoczęto pracę o: {startTime?.toLocaleString() || new Date(activeSession.startTime).toLocaleString()}</p>
          <button
            onClick={endWork}
            style={{
              backgroundColor: '#FF5733',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px 0',
              transition: 'background-color 0.3s',
            }}
          >
            Zakończ pracę
          </button>
        </div>
      )}

      {endTime && (
        <div>
          <p>Praca zakończona o: {endTime.toLocaleString()}</p>
          <p>Przepracowane godziny: {calculateWorkedHours().hours}h {calculateWorkedHours().minutes}m</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Dodaj komentarz do sesji pracy..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              margin: '10px 0',
            }}
          />
          <button
            onClick={saveWorkSession}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px 0',
            }}
          >
            Zapisz sesję
          </button>
        </div>
      )}

      {/* Historia pracy */}
      {workHistory.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Historia pracy</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Imię i Nazwisko</th>
                <th style={tableHeaderStyle}>Start</th>
                <th style={tableHeaderStyle}>Koniec</th>
                <th style={tableHeaderStyle}>Godziny pracy</th>
                <th style={tableHeaderStyle}>Komentarz</th>
                {userRole === 'admin' && <th style={tableHeaderStyle}>Akcja</th>}
              </tr>
            </thead>
            <tbody>
              {workHistory.map((session, index) => (
                <tr key={index} style={tableRowStyle}>
                  <td>{userRole === 'admin' ? `${session.firstName} ${session.lastName}` : `${firstName} ${lastName}`}</td>
                  <td>{new Date(session.startTime).toLocaleString()}</td>
                  <td>{new Date(session.endTime).toLocaleString()}</td>
                  <td>{session.workedHours}</td>
                  <td>{session.comment}</td>
                  {userRole === 'admin' && (
                    <td>
                      <button
                        onClick={() => handleDelete(session.id)} // Pass session.id here
                        style={{
                          backgroundColor: '#D32F2F',
                          color: 'white',
                          padding: '5px 10px',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                        }}
                      >
                        Usuń
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Przycisk do wylogowania */}
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: '#1976D2',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Wyloguj
      </button>
    </div>
  );
};

// Stylizacja tabeli
const tableHeaderStyle = {
  backgroundColor: '#f2f2f2',
  padding: '10px 15px',
  textAlign: 'left',
};

const tableRowStyle = {
  borderBottom: '1px solid #ddd',
  padding: '10px 15px',
};

export default Dashboard;
