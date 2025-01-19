const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const axios = require("axios");
const twilio = require("twilio");
const cors = require("cors");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Employee Directory API :> Asoh Chrishtian Mbeh");
});

//app routes
// Fetch all employees
app.get("/employees", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        role: true,
      },
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all departments
app.get("/departments", async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all roles
app.get("/roles", async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new employee
app.post("/employees", async (req, res) => {
  try {
    const { name, email, departmentId, roleId } = req.body;
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        departmentId,
        roleId,
      },
    });
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add a new department
app.post("/departments", async (req, res) => {
  try {
    const { name } = req.body;
    const newDepartment = await prisma.department.create({
      data: {
        name,
      },
    });
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add a new role
app.post("/roles", async (req, res) => {
  try {
    const { title, salary } = req.body;
    const newRole = await prisma.role.create({
      data: {
        title,
        salary,
      },
    });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fetching github repos
app.get("/github-repos/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//chat with twilio
app.post("/send-message", async (req, res) => {
  try {
    const { to, message } = req.body;
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
