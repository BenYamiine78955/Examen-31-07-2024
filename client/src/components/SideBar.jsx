import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importez useNavigate
import './../styles/sidebar.css';

const base = import.meta.env.VITE_BASE_URL || '/';

const Sidebar = ({ userT }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Ajoutez ceci

    useEffect(() => {
        fetch(base + 'api/session', {
            credentials: 'include'
        })
        .then(response => {
            if (response.status === 200) return response.json();
            else throw new Error("Account not found");
        })
        .then(data => setUser(data.user))
        .catch(error => setUser(null));
    }, [userT]);

    const handleLogout = () => {
        fetch(base + 'api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Inclure les cookies
        })
        .then(response => {
            if (response.ok) {
                setUser(null); // Réinitialisez l'état utilisateur
                navigate('/'); // Redirection vers la page d'accueil
            } else {
                console.error('Erreur lors de la déconnexion');
                return response.json().then(data => console.error(data.message));
            }
        })
        .catch(error => {
            console.error('Erreur lors de la déconnexion:', error);
        });
    };
    
    return (
        <nav id="sidebar">
            <ul>
                {user?.role ? (
                    <>
                        <li>Bonjour {user.email}</li>
                        <li style={{ textAlign: 'right' }}><i>{user.role}</i></li>
                        <li><Link to="/books">Voir la liste des livres</Link></li>
                        <li><Link to="/loan-history">Historique des emprunts</Link></li>
                        <li><Link to="/return-books">Retourner un livre</Link></li> {/* Ajout du lien ici */}
                        <li><Link to="/profile">Mon profil</Link></li>
                        <li><button onClick={handleLogout}>Déconnexion</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Connexion</Link></li>
                        <li><Link to="/register">Inscription</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Sidebar;
