async function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const dob = document.getElementById("dob").value;
  const role = document.getElementById("role").value;
  const gender = document.getElementById("gender").value;

  const userData = { name, email, password, dob, role, gender };
  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    console.log(result);

    if (response.ok) {
      alert("Registration successful!");
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error registering user.");
  }
}

async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const loginData = { email, password };

  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Login successful!");
      window.localStorage.setItem("token", result.token);
      fetchProfile();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error logging in.");
  }
}

function autoLogin() {
  const token = localStorage.getItem("token");
  if (token) {
    fetchProfile();
  }
}

function loadRegisterForm() {
  document.getElementById("main").innerHTML = `
    <div class="input-div">
        <h2>Register</h2>
        <form onsubmit="registerUser(event)">
            <label for="name">Full Name</label><br>
        <input type="text" id="name" name="name" placeholder="Full Name" required><br><br>
        
        <label for="email">Email</label><br>
        <input type="email" id="email" name="email" placeholder="Email" required><br><br>
        
        <label for="password">Password</label><br>
        <input type="password" id="password" name="password" placeholder="Password" required><br><br>
        
        <label for="dob">Date of Birth</label><br>
        <input type="date" id="dob" name="dob" required><br><br>
        
        <label for="role">Role</label><br>
        <select id="role" name="role" required>
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
        </select><br><br>
        
        <label for="gender">Gender</label><br>
        <select id="gender" name="gender" required>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
        </select><br><br>
            <button type="submit">Register</button>
        </form>
        <div class="input-option">
        <span>Already have a account?</span>
        <a onclick="loadLoginForm()">Login</a>
        </div>
        </div>
    `;
}

function loadLoginForm() {
  document.getElementById("main").innerHTML = `
        <div class="input-div">
        <h2>Login</h2>
        <form onsubmit="loginUser(event)">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <div class="input-option">
        <span>Don't have a account?</span>
        <a onclick="loadRegisterForm()">Register</a>
        </div>
        </div>
    `;
}

// Load login form by default
autoLogin();
loadLoginForm();
