const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { body, validationResult } = require('express-validator');
const dotenv = require("dotenv");
const {
  generateToken,
  authenticateToken,
} = require("./jwtUtils");
dotenv.config();
const { Client } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());


//Connect to PostgreSQL
const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // for self-signed certificates
  },
});

client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL", err);
  });

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password, dob, role, gender } = req.body;

  // Hash the password before storing it
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const queryForUserRegistration =
      "INSERT INTO users (name, email, password, dob, role, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
    const queryForProfileCreation = `INSERT INTO profile (user_id) VALUES ($1)`;
    try {
      const result = await client.query(queryForUserRegistration, [
        name,
        email,
        hashedPassword,
        dob,
        role,
        gender,
      ]);
      console.log(result);
      const result_2 = await client.query(queryForProfileCreation, [
        result.rows[0].id,
      ]);
      res.json({ message: "User registered successfully!" });
    } catch (err) {
      console.error("Error executing query during registration:", err);
      if (err.code === "23505") {
        console.log(err.code);
        return res.status(400).json({ error: "User already exist." });
      }
      res
        .status(500)
        .json({ error: "Database error occurred during registration" });
    }
  } catch (err) {
    console.error("Error hashing password:", err);
    res.status(500).json({ error: "Error hashing the password" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  try {
    const user = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password with the hash stored in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.rows[0]);

    res.status(200).json({ token });
  } catch (err) {
    console.error("Error executing query during registration:", err);
    res
      .status(500)
      .json({ error: "Database error occurred during registration" });
  }
});

// Profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const userQuery = `
            SELECT id, name, email, dob, role, gender, created_at
            FROM users
            WHERE id = $1;
        `;
    const userResult = await client.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileQuery = `
            SELECT skills, interests, bio
            FROM profile
            WHERE user_id = $1;
        `;
    const profileResult = await client.query(profileQuery, [userId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Combine user and profile data
    const userProfile = {
      ...userResult.rows[0],
      profile: profileResult.rows[0],
    };

    res.status(200).json(userProfile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});
//edit profile
app.put("/api/edit-profile", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const { name, email, role, skills, interests, bio } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Email and Name are required" });
    }

    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE users SET name = $1, role = $2, email = $3 WHERE id  = $4",
        [name, role, email, userId]
      );

      await client.query(
        "UPDATE profile SET skills = $1, interests = $2, bio = $3 WHERE user_id = $4",
        [skills, interests, bio, userId]
      );
      await client.query("COMMIT");
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (dbError) {
      await client.query("ROLLBACK");
      console.error("Database error:", dbError);
      res.status(500).json({ error: "Failed to update profile" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

//search user
app.get("/api/users", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const { role, skills, interests } = req.query;

    // sql injection check
    if (role && !validateString(role)) {
      return res.status(400).json({ error: "Invalid role input" });
    }

    if (skills && !validateString(skills)) {
      return res.status(400).json({ error: "Invalid skills input" });
    }

    if (interests && !validateString(interests)) {
      return res.status(400).json({ error: "Invalid interests input" });
    }

    let query = `SELECT 
                users.name,
                users.id, 
                users.email, 
                users.dob, 
                users.role AS user_role, 
                users.gender, 
                profile.skills, 
                profile.interests, 
                profile.bio 
            FROM users
            JOIN profile ON users.id = profile.user_id
            WHERE users.id != $1`;
    
    const params = [userId];
    let paramIndex = 2;
    if (role) {
      query += ` AND users.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (skills) {
      query += ` AND profile.skills ILIKE $${paramIndex}`;
      params.push(`%${skills}%`);
      paramIndex++;
    }

    if (interests) {
      query += ` AND profile.interests ILIKE $${paramIndex}`;
      params.push(`%${interests}%`);
      paramIndex++;
    }
    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

//create a connection request
app.post("/api/connection-request", authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.userId;
    const recipient = await client.query(
      `SELECT id FROM profile WHERE user_id = $1`,
      [recipientId]
    );
    const sender = await client.query(
      `SELECT id FROM profile WHERE user_id = $1`,
      [senderId]
    );
    //check connection request or connection already exist
    const checkQuery = `
    SELECT * FROM connection_requests 
    WHERE (sender_id = $1 AND recipient_id = $2) 
       OR (sender_id = $2 AND recipient_id = $1)
`;

    const checkResult = await client.query(checkQuery, [
      sender?.rows[0]?.id,
      recipient?.rows[0]?.id,
    ]);

    if (checkResult.rowCount > 0) {
      res.status(409).json({ error: "Connection already exist." });
      return;
    }
    const result = await client.query(
      "INSERT INTO connection_requests (sender_id, recipient_id, status) VALUES ($1, $2, $3) RETURNING *",
      [sender?.rows[0]?.id, recipient?.rows[0]?.id, "pending"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ error: "Failed to send connection request" });
  }
});
//get connections
app.get("/api/getConnections", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const requester = await client.query(
      `SELECT id FROM profile WHERE user_id = $1`,
      [userId]
    );
    if (requester.rowCount === 0) {
      res.status(400).json({ message: "User doesnot exist" });
    }
    const result = await client.query(
      `SELECT 
    users.name,
    profile.id, 
    users.email, 
    users.dob, 
    users.role AS user_role, 
    users.gender, 
    profile.skills, 
    profile.interests, 
    profile.bio,
    connection_requests.status

FROM 
    connection_requests
JOIN 
    profile ON profile.id = connection_requests.sender_id
JOIN 
    users ON users.id = profile.user_id
WHERE 
    connection_requests.recipient_id = $1
    AND connection_requests.status != $2`,
      [requester.rows[0].id, "rejected"]
    );
    //console.log(result)
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ error: "Failed to get connections" });
  }
});
// Accept or decline request
app.put("/api/connection-requests/:id", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }
  const requester = await client.query(
    `SELECT id FROM profile WHERE user_id = $1`,
    [userId]
  );
  if (requester.rowCount === 0) {
    return res.status(400).json({ error: "User not found" });
  }
  if (status === "rejected") {
    console.log(status)
    await client.query("BEGIN");
    try {
      const result = await client.query(
        `UPDATE connection_requests
           SET status = $1
           WHERE recipient_id = $3
           AND  sender_id = $2
           RETURNING *`,
        [status, id, requester.rows[0].id]
      );
      const Delete = await client.query(`DELETE FROM connection_requests WHERE recipient_id = $1`, [requester.rows[0].id]);
      console.log(Delete)
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Connection request not found" });
      }
      await client.query("BEGIN");
      return res.json({
        message: `Connection request ${status}.`,
        request: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACk");
      console.error("Error updating connection status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  try {
    const result = await client.query(
      `UPDATE connection_requests
           SET status = $1
           WHERE recipient_id = $3
           AND  sender_id = $2
           RETURNING *`,
      [status, id, requester.rows[0].id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    res.json({
      message: `Connection request ${status}.`,
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating connection status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
