// Using Firebase global compat scripts loaded via HTML
const firebaseConfig = {
  apiKey: "AIzaSyCUwsvNGxWj98aMkuzFHXwBRl91xLbacwY",
  authDomain: "yt-web-58043.firebaseapp.com",
  databaseURL: "https://yt-web-58043-default-rtdb.firebaseio.com",
  projectId: "yt-web-58043",
  storageBucket: "yt-web-58043.firebasestorage.app",
  messagingSenderId: "32116509565",
  appId: "1:32116509565:web:143feab9e000dcabf81a14",
  measurementId: "G-Z6VT7XHZPD"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // References
    const messagesRef = database.ref('contacts');
    const subscribersRef = database.ref('subscribers');

    // DOM Elements
    const messagesBody = document.getElementById('messages-body');
    const subscribersBody = document.getElementById('subscribers-body');
    const emailAllBtn = document.getElementById('email-all-btn');

    // Load Messages
    messagesRef.on('value', (snapshot) => {
        messagesBody.innerHTML = '';
        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).reverse().forEach(key => {
                const msg = data[key];
                if (!msg) return; // Fault-tolerance for empty array slots
                
                const safeDate = new Date(msg.timestamp || Date.now()).toLocaleDateString();
                const safeName = msg.name || 'Anonymous';
                const safeEmail = msg.email || '-';
                const safeInt = msg.interest || 'General';
                const safeMsg = msg.message || '-';

                messagesBody.innerHTML += `
                    <tr>
                        <td>${safeDate}</td>
                        <td>${safeName}</td>
                        <td><a href="mailto:${safeEmail}" style="color:var(--primary)">${safeEmail}</a></td>
                        <td>${safeInt}</td>
                        <td>${safeMsg}</td>
                        <td><button class="btn-danger delete-msg" data-id="${key}">Delete</button></td>
                    </tr>
                `;
            });

            // Delete message listener
            document.querySelectorAll('.delete-msg').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if(confirm('Delete this message?')) {
                        database.ref('contacts/' + e.target.getAttribute('data-id')).remove();
                    }
                });
            });
        } else {
            messagesBody.innerHTML = '<tr><td colspan="6">No messages found.</td></tr>';
        }
    }, (error) => {
        messagesBody.innerHTML = `<tr><td colspan="6" style="color:#ef4444; font-weight:bold; padding: 2rem;">Firebase Error: ${error.message}</td></tr>`;
        console.error("Firebase Messages Error:", error);
    });

    // Load Subscribers
    subscribersRef.on('value', (snapshot) => {
        subscribersBody.innerHTML = '';
        let emails = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).reverse().forEach(key => {
                const sub = data[key];
                if (!sub) return;

                const safeEmail = sub.email || '-';
                if (safeEmail !== '-') emails.push(safeEmail);
                
                const safeDate = new Date(sub.timestamp || Date.now()).toLocaleDateString();
                
                subscribersBody.innerHTML += `
                    <tr>
                        <td>${safeDate}</td>
                        <td>${safeEmail}</td>
                        <td><button class="btn-danger delete-sub" data-id="${key}">Delete</button></td>
                    </tr>
                `;
            });

            // Set Email All link
            emailAllBtn.href = `mailto:?bcc=${emails.join(',')}&subject=Updates from Young Technology`;

            // Delete sub listener
            document.querySelectorAll('.delete-sub').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if(confirm('Delete this subscriber?')) {
                        database.ref('subscribers/' + e.target.getAttribute('data-id')).remove();
                    }
                });
            });
        } else {
            subscribersBody.innerHTML = '<tr><td colspan="3">No subscribers found.</td></tr>';
            emailAllBtn.href = '#';
        }
    }, (error) => {
        subscribersBody.innerHTML = `<tr><td colspan="3" style="color:#ef4444; font-weight:bold; padding: 2rem;">Firebase Error: ${error.message}</td></tr>`;
        console.error("Firebase Subscribers Error:", error);
    });
});
