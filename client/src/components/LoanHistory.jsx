import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoanHistory = () => {
    const [history, setHistory] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const base = import.meta.env.VITE_BASE_URL || '/';

    useEffect(() => {
        fetch(base + 'api/loans/history', {
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) return response.json();
            return response.json().then(data => Promise.reject(data));
        })
        .then(data => setHistory(data))
        .catch(error => setErrorMessage(error.error || 'Erreur lors de la récupération de l\'historique.'));
    }, [base]);

    const handleHome = () => {
        navigate('/');
    };

    return (
        <div className="container">
            <h2>Historique des Emprunts</h2>
            {errorMessage && <p className="error">{errorMessage}</p>}
            {history.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID de l'Emprunt</th>
                            <th>Titre du Livre</th>
                            <th>Date d'Emprunt</th>
                            <th>Date de Retour Prévue</th>
                            <th>Date de Retour Effective</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.titre}</td>
                                <td>{new Date(record.date_emprunt).toLocaleDateString()}</td>
                                <td>{new Date(record.date_retour_prevue).toLocaleDateString()}</td>
                                <td>{record.date_retour_effective ? new Date(record.date_retour_effective).toLocaleDateString() : 'Non retourné'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Aucun emprunt trouvé.</p>
            )}
            <button onClick={handleHome}>Retour à l'accueil</button>
        </div>
    );
};

export default LoanHistory;
