
async function search(event) {
  event.preventDefault();

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not logged in.");
      return;
    }
    const role = document.getElementById("role").value;
    const skills = document.getElementById("skills").value;
    const interests = document.getElementById("interests").value;

    const queryParams = new URLSearchParams({
      role,
      skills,
      interests,
    }).toString();
    const response = await fetch(
      `${API_URL}/api/users?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const users = await response.json();
    console.log(users);

    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    if (users.length === 0) {
      const userDiv = document.createElement("div");
      userDiv.className = "user";
      userDiv.innerHTML = `<h2>No user found.</h2>`;
      userList.appendChild(userDiv);
      return;
    }
    {
      users.length > 0 &&
        users.forEach((user) => {
          const userDiv = document.createElement("div");
          userDiv.className = "user";
          userDiv.innerHTML = `
            <div id='user-card'>
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Age:</strong> ${calculateAge(user.dob)}</p>
                <p><strong>Gender:</strong> ${user.gender}</p>
                <p><strong>Role:</strong> ${user.user_role}</p>
                <p><strong>Skills:</strong> ${user.skills}</p>
                <p><strong>Interests:</strong> ${user.interests}</p>
                <p><strong>Bio:</strong> ${user.bio}</p>
                <button onclick="sendRequest(${user.id})">Connect</button>
            </div>
            `;
          userList.appendChild(userDiv);
        });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Failed to fetch users. Please try again.");
  }
}
function calculateAge(birthdate) {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

async function sendRequest(userId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("User not logged in.");
    return;
  }
  try {
    const response = await fetch(
      `${API_URL}/api/connection-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: userId }),
      }
    );

    if (response.ok) {
      alert("Connection request sent!");
    } else if (response.status === 409) {
      alert("Connection already exists!");
    } else {
      alert(`Failed to send connection request. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending request:", error);
    alert("Failed to send connection request.");
  }
}

function loadSearch() {
  document.getElementById("main").innerHTML = `
    <div id="user-discovery">
    <h2>Discover Users</h2>
    <form id="filterForm" onsubmit="search(event)">
        <label for="role">Role:</label>
        <select id="role">
            <option value="">All</option>
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
        </select>

        <label for="skills">Skills:</label>
        <input type="text" id="skills" placeholder="e.g., JavaScript">

        <label for="interests">Interests:</label>
        <input type="text" id="interests" placeholder="e.g., AI, Web Development">

        <button type="submit">Search</button>
        <button type="button" onclick='fetchProfile()' id='cancel-btn'>Cancel</button>
    </form>
    <div id="user-list"></div>
</div>`;
}
