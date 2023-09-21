const admin = require("firebase-admin");
const serviceAccount = require("../firebase/service");
const { User } = require("../db/Scheme");
const jwt = require("jsonwebtoken");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace with your Firebase project config
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const jwtPrivetKey = process.env.JWT_SECRET;

const phoneLoginRoute = async (req, res) => {
  try {
    const { token } = req.body;

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ error: "ID token not provided." });
    }

    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Decoded Firebase Token:", decodedToken);

      // Check if phone_number is missing
      if (!decodedToken.phone_number) {
        return res.status(400).json({ error: "Enter your Mobile Number" });
      }

      // Check if the user exists in your database
      const isUserExist = await User.findOne({ phoneNumber: decodedToken.phone_number });

      if (!isUserExist) {
        return res.status(404).json({ error: "User not found" });
      }

      const payload = {
        id: isUserExist._id,
        email: isUserExist.email,
      };

      // Set expiresIn to a very high value (100 years)
      const expiresIn = '36500y';

      // Sign a JWT token and send it in the response
      const jwtToken = jwt.sign(payload, jwtPrivetKey, { expiresIn });

      return res.status(200).json({ token: jwtToken });
    } catch (error) {
      console.error("Error verifying Firebase token:", error);
      return res.status(401).json({ error: "Invalid ID token." });
    }
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const Protected = (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "You are authorized" });
  } else {
    res.status(401).json({ message: "You are not authorized" });
  }
};
const GetUser = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id)
    if(user){
      res.status(200).json(user)
    }else{
      res.status(404).json({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  phoneLoginRoute,
  Protected,
  GetUser
};
