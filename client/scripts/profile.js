const API_URL = window.env.API_URL;
function logout() {
  const token = localStorage.getItem("token");
  if (token) {
    window.localStorage.removeItem("token");
    loadLoginForm();
    return;
  }
}
async function handleEdit(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value;
  const skills = document.getElementById("skills").value;
  const interests = document.getElementById("interests").value;
  const bio = document.getElementById("bio").value;
  const editdata = { name, email, role, skills, interests, bio };
  const token = localStorage.getItem("token");
  if (!token) {
    alert("User not logged in.");
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/edit-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editdata),
    });
    const result = await response.json();
    console.log(result);
    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    alert("Profile updated successfully!");
    fetchProfile();
    exitEditMode();
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("There was an error updating your profile. Please try again.");
  }
}
function editMode() {
  const profileView = document.getElementById("profileView");
  const profileEdit = document.getElementById("profileEdit");

  // Show the edit form and hide the profile view
  profileView.style.display = "none";
  profileEdit.style.display = "block";

  // Prefill the edit form with existing profile data
  document.getElementById("name").value =
    document.getElementById("profileName").textContent;
  document.getElementById("email").value =
    document.getElementById("profileEmail").textContent;
  document.getElementById("role").value = document
    .getElementById("profileRole")
    .textContent.toLowerCase();
  document.getElementById("skills").value =
    document.getElementById("profileSkills").textContent;
  document.getElementById("interests").value =
    document.getElementById("profileInterests").textContent;
  document.getElementById("bio").value =
    document.getElementById("profileBio").textContent;
}
function exitEditMode() {
  const profileView = document.getElementById("profileView");
  const profileEdit = document.getElementById("profileEdit");

  // Hide the edit form and show the profile view
  profileEdit.style.display = "none";
  profileView.style.display = "block";
}

async function fetchProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("User not logged in.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    loadProfile();
    if (response.ok) {
      document.getElementById("profileName").textContent = data.name;
      document.getElementById("profileEmail").textContent = data.email;
      document.getElementById("profileRole").textContent = data.role;
      document.getElementById("profileSkills").textContent =
        data.profile.skills;
      document.getElementById("profileInterests").textContent =
        data.profile.interests;
      document.getElementById("profileBio").textContent = data.profile.bio;
    }
  } catch (error) {
    alert(error.response.data.message || "Failed to load profile.");
  }
}

function loadProfile() {
  document.getElementById("main").innerHTML = `
    <div class="profile-div">
        <div class="profile-page">
    <h1>Your Profile</h1>

    <!-- Profile View Section -->
    <div class="profile-view" id="profileView">
        <h2>Profile Information</h2>
        <p><strong>Name:</strong> <span id="profileName">Loading...</span></p>
        <p><strong>Email:</strong> <span id="profileEmail">Loading...</span></p>
        <p><strong>Role:</strong> <span id="profileRole">Loading...</span></p>
        <p><strong>Skills:</strong> <span id="profileSkills">Loading...</span></p>
        <p><strong>Interests:</strong> <span id="profileInterests">Loading...</span></p>
        <p><strong>Bio:</strong> <span id="profileBio">Loading...</span></p>
        <div class="profile-btn-div">
        <button id="blue-btn" onclick="editMode()">Edit Profile</button>
        <button id="blue-btn" type="button" id="search-btn" onclick="loadSearch()">Search</button>
        <button id="blue-btn" onclick="loadConnections()">Connections</button>
        <button id="logout" onclick="logout()">Logout</button>
        </div>
    </div>

    <!-- Profile Edit Section -->
    <div class="profile-edit" id="profileEdit" style="display:none;">
        <h2>Edit Profile</h2>
        <form id="profileForm" onsubmit="handleEdit(event)">
            <label for="name">Name:</label>
            <input type="text" id="name" required>
            
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            
            <label for="role">Role:</label>
            <select id="role" required>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
            </select>
            
            <label for="skills">Skills:</label>
            <textarea id="skills" placeholder="Skills (Node.js, React, JAVA etc)"></textarea>
            
            <label for="interests">Interests:</label>
            <textarea id="interests" placeholder="Interests (Web Dev, Dev Ops etc)"></textarea>
            
            <label for="bio">Bio:</label>
            <textarea id="bio" placeholder="I am new programmer." ></textarea>
            
            <button type="submit">Save Changes</button>
            <button type="button" id="cancel-btn" onclick="exitEditMode()">Cancel</button>
        </form>
    </div>
</div>
</div>

    `;
}
