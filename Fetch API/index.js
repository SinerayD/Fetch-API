const tBody = document.querySelector("tbody");
const companyNameInput = document.getElementById("companyName");
const contactNameInput = document.getElementById("contactName");
const contactTitleInput = document.getElementById("contactTitle");
let selectedSupplierId = null;

function displayError(inputElement, errorMessage) {
    const errorElement = inputElement.nextElementSibling;
    errorElement.textContent = errorMessage;
}

function clearError(inputElement) {
    const errorElement = inputElement.nextElementSibling;
    errorElement.textContent = "";
}

function validateInputs() {
    let isValid = true;

    if (companyNameInput.value.trim() === "") {
        displayError(companyNameInput, "Company name field is required");
        isValid = false;
    } else {
        clearError(companyNameInput);
    }

    if (contactNameInput.value.trim() === "") {
        displayError(contactNameInput, "Contact name field is required");
        isValid = false;
    } else {
        clearError(contactNameInput);
    }

    if (contactTitleInput.value.trim() === "") {
        displayError(contactTitleInput, "Contact title field is required");
        isValid = false;
    } else {
        clearError(contactTitleInput);
    }

    return isValid;
}

async function getData() {
    let response = await fetch("https://northwind.vercel.app/api/suppliers/");
    let data = await response.json();
    data.sort((a, b) => a.id - b.id);

    data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.companyName ?? "-"}</td>
            <td>${item.contactName ?? "-"}</td>
            <td>${item.contactTitle ?? "-"}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        tBody.appendChild(tr);

        const editBtn = tr.querySelector(".edit-btn");
        editBtn.addEventListener("click", () => {
            fillEditForm(item.id, item.companyName, item.contactName, item.contactTitle);
        });

        const deleteBtn = tr.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => {
            deleteSupplier(item.id, tr);
        });
    });
}

async function fetchData() {
    await getData();
}

fetchData();

function addSupplier(companyName, contactName, contactTitle) {
    if (!validateInputs()) {
        return;
    }

    fetch("https://northwind.vercel.app/api/suppliers/", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            companyName: companyName,
            contactName: contactName,
            contactTitle: contactTitle,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${data.id}</td>
                <td>${data.companyName}</td>
                <td>${data.contactName}</td>
                <td>${data.contactTitle}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;
            tBody.appendChild(tr);

            const editBtn = tr.querySelector(".edit-btn");
            editBtn.addEventListener("click", () => {
                fillEditForm(data.id, data.companyName, data.contactName, data.contactTitle);
            });

            const deleteBtn = tr.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteSupplier(data.id, tr);
            });

            companyNameInput.value = "";
            contactNameInput.value = "";
            contactTitleInput.value = "";
            clearError(companyNameInput);
            clearError(contactNameInput);
            clearError(contactTitleInput);
        })
        .catch((error) => console.error(error));
}

function editSupplier(id, companyName, contactName, contactTitle) {
    if (!validateInputs()) {
        return;
    }

    fetch(`https://northwind.vercel.app/api/suppliers/${id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            companyName: companyName,
            contactName: contactName,
            contactTitle: contactTitle,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            const tr = Array.from(tBody.getElementsByTagName("tr")).find(
                (tr) => tr.querySelector("td").textContent === id.toString()
            );
            if (tr) {
                tr.innerHTML = `
                    <td>${data.id}</td>
                    <td>${data.companyName}</td>
                    <td>${data.contactName}</td>
                    <td>${data.contactTitle}</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                `;

                const editBtn = tr.querySelector(".edit-btn");
                editBtn.addEventListener("click", () => {
                    fillEditForm(data.id, data.companyName, data.contactName, data.contactTitle);
                });

                const deleteBtn = tr.querySelector(".delete-btn");
                deleteBtn.addEventListener("click", () => {
                    deleteSupplier(data.id, tr);
                });
            }

            companyNameInput.value = "";
            contactNameInput.value = "";
            contactTitleInput.value = "";
            clearError(companyNameInput);
            clearError(contactNameInput);
            clearError(contactTitleInput);
            selectedSupplierId = null;
        })
        .catch((error) => console.error(error));
}

function deleteSupplier(id, row) {
    fetch(`https://northwind.vercel.app/api/suppliers/${id}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (response.ok) {
                tBody.removeChild(row);
            }
        })
        .catch((error) => console.error(error));
}

function fillEditForm(id, companyName, contactName, contactTitle) {
    selectedSupplierId = id;
    companyNameInput.value = companyName || "";
    contactNameInput.value = contactName || "";
    contactTitleInput.value = contactTitle || "";
}

document.getElementById("addSupplierBtn").addEventListener("click", () => {
    const companyName = companyNameInput.value.trim();
    const contactName = contactNameInput.value.trim();
    const contactTitle = contactTitleInput.value.trim();

    addSupplier(companyName, contactName, contactTitle);
});

document.getElementById("editSupplierBtn").addEventListener("click", () => {
    const companyName = companyNameInput.value.trim();
    const contactName = contactNameInput.value.trim();
    const contactTitle = contactTitleInput.value.trim();

    editSupplier(selectedSupplierId, companyName, contactName, contactTitle);
});
