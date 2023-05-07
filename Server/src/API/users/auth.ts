
// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {

//     try {
//         const token = req.headers.authorization.split(" ")[1];
//         const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
//         const tokenUserId = decodedToken.userId;

//         if(req.body.userId && req.body.userId !== tokenUserId) throw "ID utilisateur non valable !";
//         else next();
//     }

//     catch (error) {
//         res.status(401).json({ error: error | "Requête non authentifiée !" });
//     }
// };