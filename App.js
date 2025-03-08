import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [balance, setBalance] = useState(null);
    const [token, setToken] = useState(null);

    const register = async () => {
        try {
            await axios.post('http://localhost:5000/register', { username, password });
            alert('Registrierung erfolgreich!');
        } catch (error) {
            alert('Fehler bei der Registrierung');
        }
    };

    const login = async () => {
        try {
            const res = await axios.post('http://localhost:5000/login', { username, password });
            setToken(res.data.token);
            setBalance(res.data.balance);
        } catch (error) {
            alert('Fehler beim Login');
        }
    };

    const playSlot = async () => {
        try {
            const res = await axios.post('http://localhost:5000/slot', {}, { headers: { Authorization: `Bearer ${token}` } });
            setBalance(res.data.newBalance);
            alert(`Gewinn: ${res.data.win} $`);
        } catch (error) {
            alert('Nicht genug Guthaben oder Fehler!');
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: 20 }}>
            <h1>Slot Machine 🎰</h1>
            <input placeholder='Username' value={username} onChange={e => setUsername(e.target.value)} /><br />
            <input type='password' placeholder='Passwort' value={password} onChange={e => setPassword(e.target.value)} /><br />
            <button onClick={register}>Registrieren</button>
            <button onClick={login}>Einloggen</button>
            {token && <>
                <h2>Guthaben: {balance} $</h2>
                <button onClick={playSlot}>Spielen</button>
            </>}
        </div>
    );
}

export default App;
