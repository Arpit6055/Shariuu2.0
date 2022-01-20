require('dotenv').config();
dbPassword = `${process.env.MONGO_CONNECTION_URL}`;
module.exports = {
    mongoURI: dbPassword
};
