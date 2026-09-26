
function showSection(sectionId, asideId) {
    document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('aside .aside-section').forEach(a => a.classList.add('hidden'));

    const section = document.getElementById(sectionId);
    const aside = document.getElementById(asideId);
    if(section) section.classList.remove('hidden');
    if(aside) aside.classList.remove('hidden');
}


document.getElementById('nav-bio').onclick = (e) => { e.preventDefault(); showSection('content-bio', 'aside-bio'); };
document.getElementById('nav-photos').onclick = (e) => { e.preventDefault(); showSection('content-photos', 'aside-photos'); };
document.getElementById('nav-distinction').onclick = (e) => { e.preventDefault(); showSection('content-dynamic', 'aside-distinction'); loadData('awards'); };
document.getElementById('nav-links').onclick = (e) => { e.preventDefault(); showSection('content-dynamic', 'aside-links'); loadData('links'); };
document.getElementById('nav-management').onclick = (e) => { e.preventDefault(); showSection('content-admin', 'aside-admin'); };


async function loadData(type) {
    const table = document.getElementById('data-table');
    table.innerHTML = '<tr><td>Loading data...</td></tr>';
    try {
        const response = await fetch(`/api/${type}`);
        const data = await response.json();
        if (data && data.length > 0) {
            let aHeaderHTML = "<tr>" + Object.keys(data[0]).map(k => `<th>${k.toUpperCase()}</th>`).join("") + "</tr>";
            let aRowsHTML = data.map(item => {
                return "<tr>" + Object.keys(item).map(key => {
                    let val = item[key];
                    if (typeof val === 'string' && val.startsWith('http')) {
                        return `<td><a href="${val}" target="_blank">Visit Link</a></td>`;
                    }
                    return `<td>${val}</td>`;
                }).join("") + "</tr>";
            }).join("");
            table.innerHTML = `<thead>${aHeaderHTML}</thead><tbody>${aRowsHTML}</tbody>`;
        }
    } catch (err) {
        console.error("Error:", err);
        table.innerHTML = '<tr><td>Error loading data.</td></tr>';
    }
}



async function showManagementForm(type) {
    const dashboard = document.getElementById('admin-dashboard');
    const response = await fetch(`/api/${type}`);
    const data = await response.json();

    let html = `
        <div style="background: #222; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 id="form-title">New Entry (${type})</h3>
            <form id="crud-form" style="display:grid; gap:10px; max-width:400px;">
                <input type="hidden" id="edit-index" value="-1">
                ${type === 'awards'
                    ? '<input type="text" id="f1" placeholder="Year" required><input type="text" id="f2" placeholder="Competition" required><input type="text" id="f3" placeholder="Event" required><input type="text" id="f4" placeholder="Medal" required>'
                    : '<input type="text" id="f1" placeholder="Category" required><input type="text" id="f2" placeholder="Title" required><input type="text" id="f3" placeholder="URL" required>'}
                <button type="submit" style="background:#ff4444; color:white; padding:10px; border:none; cursor:pointer;">Save</button>
                <button type="button" onclick="showManagementForm('${type}')" style="background:#444; color:white; border:none; padding:5px; cursor:pointer;">Clear</button>
            </form>
        </div>
        <h3>Existing Entries</h3>
        <table style="width:100%; border-collapse: collapse;">
            ${data.map((item, index) => `
                <tr style="border-bottom: 1px solid #444;">
                    <td>${Object.values(item).slice(0, 3).join(" - ")}</td>
                    <td style="text-align:right;">
                        <button onclick="editItem('${type}', ${index})" style="background:orange; border:none; margin:2px; cursor:pointer;">Edit</button>
                        <button onclick="deleteItem('${type}', ${index})" style="background:red; color:white; border:none; margin:2px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `).join("")}
        </table>
    `;
    dashboard.innerHTML = html;

    document.getElementById('crud-form').onsubmit = async (e) => {
        e.preventDefault();
        const index = document.getElementById('edit-index').value;
        const item = type === 'awards'
            ? { YEAR: document.getElementById('f1').value, COMPETITION: document.getElementById('f2').value, EVENT: document.getElementById('f3').value, MEDAL: document.getElementById('f4').value }
            : { CATEGORY: document.getElementById('f1').value, TITLE: document.getElementById('f2').value, URL: document.getElementById('f3').value };

        await fetch(`/api/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item, index: parseInt(index) })
        });
        alert('Saved!');
        showManagementForm(type);
    };
}

async function editItem(type, index) {
    const response = await fetch(`/api/${type}`);
    const data = await response.json();
    const item = data[index];

    document.getElementById('form-title').innerText = `Change Entry #${index + 1}`;
    document.getElementById('edit-index').value = index;
    const values = Object.values(item);
    document.getElementById('f1').value = values[0];
    document.getElementById('f2').value = values[1];
    document.getElementById('f3').value = values[2];
    if (type === 'awards' && values[3]) {
        document.getElementById('f4').value = values[3];
    }
}

async function deleteItem(type, index) {
    if(confirm('Are you sure you want to delete this?')) {
        await fetch(`/api/${type}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index })
        });
        showManagementForm(type);
    }
}

document.getElementById('menu-manage-awards').onclick = (e) => { e.preventDefault(); showManagementForm('awards'); };
document.getElementById('menu-manage-links').onclick = (e) => { e.preventDefault(); showManagementForm('links'); };


document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: document.getElementById('user').value, password: document.getElementById('pass').value })
        });
        const result = await response.json();
        if (result.success) {
            alert('Correct data!');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            document.getElementById('menu-logout').classList.remove('hidden');
            document.getElementById('menu-manage-awards').classList.remove('hidden');
            document.getElementById('menu-manage-links').classList.remove('hidden');
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('admin-dashboard').innerHTML = '<h3>Choose a category.</h3>';
        } else { throw "Wrong data"; }
    } catch (err) { alert(err); }
};

document.getElementById('menu-logout').onclick = (e) => {
    e.preventDefault();
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('menu-logout').classList.add('hidden');
    document.getElementById('menu-manage-awards').classList.add('hidden');
    document.getElementById('menu-manage-links').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    alert("Logged out successfully.");
};

document.querySelectorAll('.bio-link').forEach(link => {
    link.onclick = (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');
        document.querySelectorAll('.bio-part').forEach(part => part.classList.add('hidden'));
        const targetEl = document.getElementById(target);
        if(targetEl) targetEl.classList.remove('hidden');
    };
});

document.querySelectorAll('.photo-filter').forEach(filter => {
    filter.onclick = (e) => {
        e.preventDefault();
        const category = e.target.getAttribute('data-category');
        document.querySelectorAll('.photo-item').forEach(img => {
            img.style.display = img.classList.contains(category) ? 'block' : 'none';
        });
    };
});
