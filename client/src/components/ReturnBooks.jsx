import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const base = import.meta.env.VITE_BASE_URL || '/';

const ReturnBooks = () => {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        fetch(base + 'api/loans/history', {
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Erreur lors de la récupération des emprunts');
        })
        .then(data => setLoans(data))
        .catch(error => console.error('Erreur:', error));
    }, []);

    const handleReturn = (empruntId) => {
        fetch(base + 'api/loans/return', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emprunt_id: empruntId }),
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                alert('Livre retourné avec succès');
                setLoans(loans.filter(loan => loan.id !== empruntId));
            } else {
                console.error('Erreur lors du retour du livre');
                return response.json().then(data => alert(data.error));
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    };

    return (
        <div>
            <h1>Retourner un Livre</h1>
            <table>
                <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Date d'emprunt</th>
                        <th>Date de retour prévue</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loans.map(loan => (
                        <tr key={loan.id}>
                            <td>{loan.titre}</td>
                            <td>{new Date(loan.date_emprunt).toLocaleDateString()}</td>
                            <td>{new Date(loan.date_retour_prevue).toLocaleDateString()}</td>
                            <td>
                                {loan.status === 'retourné' ? 'Déjà retourné' : (
                                    <button onClick={() => handleReturn(loan.id)}>Retourner</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReturnBooks;
