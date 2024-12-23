
async function updateRequestStatus(requestId, newStatus) {
    const token = localStorage.getItem('token');  
    if (!token) {
        alert("User not logged in.")
        return;
    }
    try {
        const response = await fetch(`${API_URL}/api/connection-requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json',
                       'Authorization': `Bearer ${token}`, 
             },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`${result.message}!`);
            showRequests('pending'); 
        } else {
            const error = await response.json();
            alert(`Failed to update request: ${error.error}`);
        }
    } catch (error) {
        console.error('Error updating request status:', error);
        alert('An error occurred. Please try again.');
    }
}

async function fetchConnections() {
    try {
        const token = localStorage.getItem('token');  
        if (!token) {
          alert("User not logged in.")
          return;
        }
      const response = await fetch(`${API_URL}/api/getConnections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log(data)
      return data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      alert('Failed to load connection requests. Please try again later.');
      return [];
    }
  } 

  function showRequests(status) {  
    fetchConnections().then((connections) => {
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; 
  
        // Filter connections based on the status
        const filteredConnections = connections.filter((connection) => connection.status === status);

        if (filteredConnections.length === 0) {
            userList.innerHTML = `<p>No ${status} requests found.</p>`;
            return;
        }

        filteredConnections.forEach((user) => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user';
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
                    <p><strong>Status:</strong> ${user.status}</p>
                    ${status === 'accepted' ? 
                        `<button onclick="updateRequestStatus(${user.id}, 'rejected')">Delete Connection</button>` : 
                        `<button onclick="updateRequestStatus(${user.id}, 'accepted')">Accept</button>
                         <button onclick="updateRequestStatus(${user.id}, 'rejected')">Reject</button>`
                    }
                </div>
            `;
            userList.appendChild(userDiv);
        });
    }).catch((error) => {
        console.error('Error fetching connections:', error);
        const userList = document.getElementById('user-list');
        userList.innerHTML = '<p>Error loading connection requests. Please try again later.</p>';
    });
}


  function loadConnections() {
    document.getElementById('main').innerHTML = `
    <div id="connections-div">
    <div class="header">
      <h1>Connection Requests</h1>
    </div>
    <div class="panel">
      <button class="accepted" onclick="showRequests('accepted')">Accepted</button>
      <button class="pending" onclick="showRequests('pending')">Pending</button>
    </div>
    <button type="button" onclick='fetchProfile()' id='cancel-btn'>Back</button>
      <div id="user-list"></div>
  </div>`;
  showRequests('accepted');
}

