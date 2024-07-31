// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const base = import.meta.env.VITE_BASE_URL || '/';

const Dashboard = () => {
    const [statistics, setStatistics] = useState({ total_books: 0, total_users: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetch(base + 'api/statistics', {
            credentials: 'include'
        })
            .then(response => response.status === 200 ? response.json() : (function () { throw "error" }()))
            .then(data => setStatistics(data))
            .catch(error => console.error('Erreur:', error));
    }, []);

    const handleGoToBookList = () => {
        navigate('/books');
    };

    return (
        <div className="container">
            <h1>Dashboard</h1>
            <div className="statistic">
                <h3>Total des Livres</h3>
                <p>{statistics.total_books}</p>
            </div>
            <div className="statistic">
                <h3>Utilisateurs Enregistrés</h3>
                <p>{statistics.total_users}</p>
            </div>
            <button onClick={handleGoToBookList}>Voir la Liste des Livres</button>
        </div>
    );
};

export default Dashboard;
