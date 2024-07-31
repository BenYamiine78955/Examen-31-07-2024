const express = require('express')
const bodyParser = require('body-parser')
const booksrouter = require('./router/books')
const usersRouter = require('./router/users')
const loansRouter = require('./router/loans'); // <- Nouvelle ligne
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const db = require('./services/database')

const JWT_SECRET = "HelloThereImObiWan"
function authenticateToken(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        console.log('Token absent, non authentifié')
        return res.sendStatus(401)
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Erreur de vérification du token:', err)
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}

const router = express.Router()
router.use(bodyParser.json());
router.use(cors(corsOptions));
router.use(cookieParser());
router.use('/api/books', booksrouter);
router.use('/api/users', usersRouter);
router.use('/api/loans', loansRouter); // <- Nouvelle ligne


router.post('/api/logout', (req, res) => {
    console.log('Déconnexion demandée');
    
    // Essayez d'effacer le cookie et de détruire la session
    res.clearCookie('token'); // Assurez-vous que le nom du cookie est correct
    
    req.session.destroy(err => {
        if (err) {
            console.error('Erreur lors de la destruction de la session:', err);
            return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
        }
        res.json({ message: 'Déconnexion réussie' });
    });
});





router.get('/api/session', authenticateToken, (req, res) => {
    if (req?.user) {
        console.log('Utilisateur authentifié:', req.user)
        res.json({ user: req.user });
    } else {
        console.log('Utilisateur non authentifié')
        res.status(401).json({ message: 'Non authentifié' });
    }
});

router.get('/api/statistics', (req, res) => {
    console.log('Requête pour les statistiques reçue')
    const totalBooksQuery = 'SELECT COUNT(*) AS total_books FROM livres';
    const totalUsersQuery = 'SELECT COUNT(*) AS total_users FROM utilisateurs';

    db.query(totalBooksQuery, (err, booksResult) => {
        if (err) {
            console.log('Erreur lors de la requête pour le total des livres:', err)
            throw err;
        }
        db.query(totalUsersQuery, (err, usersResult) => {
            if (err) {
                console.log('Erreur lors de la requête pour le total des utilisateurs:', err)
                throw err;
            }
            res.json({
                total_books: booksResult[0].total_books,
                total_users: usersResult[0].total_users
            });
        });
    });
});

router.use('/', express.static(path.join(__dirname, "./webpub")))
router.use(express.static(path.join(__dirname, "./webpub")))
router.use('/*', (_, res) => {
    console.log('Route non trouvée, renvoi de index.html')
    res.sendFile(
        path.join(__dirname, "./webpub/index.html")
    );
})
router.get("*", (_, res) => {
    console.log('Route non trouvée, renvoi de index.html')
    res.sendFile(
        path.join(__dirname, "./webpub/index.html")
    );
});

module.exports = router;
