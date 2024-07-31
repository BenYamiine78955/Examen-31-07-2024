const express = require('express');
const router = express.Router();
const db = require('./../services/database');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const JWT_SECRET = "HelloThereImObiWan";

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        console.log('Token absent, non authentifié');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Erreur de vérification du token:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

// Emprunter un livre
// loans.js
router.post('/borrow', authenticateToken, (req, res) => {
    const { livre_id } = req.body;
    if (!livre_id) {
        console.log('ID du livre manquant');
        return res.status(400).json({ error: 'ID du livre requis' });
    }
    const utilisateur_id = req.user.id;
    const date_emprunt = new Date();
    const date_retour_prevue = new Date(date_emprunt);
    date_retour_prevue.setDate(date_retour_prevue.getDate() + 30);
    // Vérifier si le livre est disponible
    const checkAvailabilityQuery = 'SELECT statut FROM livres WHERE id = ?';
    db.query(checkAvailabilityQuery, [livre_id], (err, results) => {
        if (err) {
            console.error('Erreur de vérification de la disponibilité:', err);
            return res.status(500).json({ error: 'Erreur de vérification de la disponibilité' });
        }
        if (results.length === 0) return res.status(404).json({ error: 'Livre non trouvé' });
        if (results[0].statut !== 'disponible') return res.status(400).json({ error: 'Livre non disponible' });
        const borrowBookQuery = `INSERT INTO emprunts (livre_id, utilisateur_id, date_emprunt, date_retour_prevue)
                                 VALUES (?, ?, ?, ?)`;         // Insérer l'emprunt dans la table emprunts
        db.query(borrowBookQuery, [livre_id, utilisateur_id, date_emprunt, date_retour_prevue], (err) => {
            if (err) {
                console.error('Erreur lors de l\'emprunt du livre:', err);
                return res.status(500).json({ error: 'Erreur lors de l\'emprunt du livre' });
            }
            const updateBookStatusQuery = 'UPDATE livres SET statut = ? WHERE id = ?';            // Mettre à jour le statut du livre
            db.query(updateBookStatusQuery, ['emprunté', livre_id], (err) => {
                if (err) {
                    console.error('Erreur lors de la mise à jour du statut du livre:', err);
                    return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut du livre' });
                }
                res.json({ message: 'Livre emprunté avec succès' });
            });
        });
    });
});


// Retourner un livre
router.post('/return', authenticateToken, (req, res) => {
    const { emprunt_id } = req.body;
    const date_retour_effective = new Date();

    // Mettre à jour l'emprunt avec la date de retour effective
    const returnBookQuery = `UPDATE emprunts SET date_retour_effective = ?, status = 'retourné' WHERE id = ?`;
    db.query(returnBookQuery, [date_retour_effective, emprunt_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erreur lors du retour du livre' });

        // Mettre à jour le statut du livre
        const updateBookStatusQuery = 'UPDATE livres SET statut = ? WHERE id = (SELECT livre_id FROM emprunts WHERE id = ?)';
        db.query(updateBookStatusQuery, ['disponible', emprunt_id], (err) => {
            if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut du livre' });
            res.json({ message: 'Livre retourné avec succès' });
        });
    });
});

// Consulter l'historique d'emprunt d'un utilisateur
router.get('/history', authenticateToken, (req, res) => {
    const utilisateur_id = req.user.id;

    const historyQuery = `SELECT emprunts.*, livres.titre 
                          FROM emprunts 
                          JOIN livres ON emprunts.livre_id = livres.id 
                          WHERE emprunts.utilisateur_id = ? 
                          ORDER BY date_emprunt DESC`;

    db.query(historyQuery, [utilisateur_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique d\'emprunt' });
        res.json(results);
    });
});

module.exports = router;
