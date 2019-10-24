import { Expense } from "./modules/expense.js";

window.onload = function() {
  //localStorage.removeItem("localExpenses");
  let expenses = null;
  let totalAmount = 0;
  let selectedIndex = -1;

  const body = document.querySelector("#body");
  const form = document.querySelector("#form");
  const name = document.querySelector("#name");
  const amount = document.querySelector("#amount");
  const frequency = document.querySelector("#freq");
  const addBtn = document.querySelector("#addBtn");

  const btnAction = document.querySelector("#btnAction");
  const btnUpdate = document.querySelector("#btnUpdate");
  const btnRemove = document.querySelector("#btnRemove");
  const totalAmountDiv = document.querySelector("#totalAmount");
  const tbody = document.querySelector("tbody");
  const addTable = document.querySelector(".addTable");
  const inputSection = document.querySelector("#inputSection");
  const showForm = document.querySelector("#showForm");
  const saveBtn = document.querySelector("#saveBtn");
  const inputs = document.querySelectorAll("#inputSection input");

  const firebaseConfig = {
    apiKey: "AIzaSyAKZ7KW44NYNem21ocPSnBHkKBlXaI4Lk8",
    authDomain: "expense-fe336.firebaseapp.com",
    databaseURL: "https://expense-fe336.firebaseio.com",
    projectId: "expense-fe336",
    storageBucket: "expense-fe336.appspot.com",
    messagingSenderId: "1088239030058",
    appId: "1:1088239030058:web:d3604342f00fff77989853",
    measurementId: "G-7L21JJ5WRC"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  // Initialize the FirebaseUI Widget using Firebase.
 
  firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function() {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.

      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start("#firebaseui-auth-container", {
        signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            document.querySelector("#main-app").classList.remove("d-none");
            getDataFirestore();
            return false;
          }
        }
      });
    
      // ...
      // New sign-in will be persisted with session persistence.
      return firebase.auth().signInWithEmailAndPassword(email, password);
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });

  function addToFirebase(addedexpense) {
    firebase
      .firestore()
      .collection("expenses")
      .doc(`${addedexpense.id}`)
      .set({
        id: addedexpense.id,
        name: addedexpense.name,
        amount: addedexpense.amount,
        frequency: addedexpense.frequency,
        total: addedexpense.total
      });
  }

  inputs.forEach(input => {
    input.addEventListener("keyup", inputChangeHandler);
  });

  form.addEventListener("submit", onSubmit);
  btnRemove.addEventListener("click", removeExpense);
  btnUpdate.addEventListener("click", putToEdit);
  showForm.addEventListener("click", formShowClickHandler);
  saveBtn.addEventListener("click", update);
  window.addEventListener("beforeunload", beforeunloadHandler);

  function inputChangeHandler() {
    saveBtn.classList.remove("d-none");
  }

  function formShowClickHandler() {
    inputSection.classList.remove("d-none");
    addBtn.classList.remove("d-none");
    showForm.classList.add("d-none");
    document.querySelector("#edit").classList.add("d-none");
    if (selectedIndex > 0)
      tbody.childNodes[selectedIndex].classList.remove("bg-warning");
  }

  function beforeunloadHandler() {
    if (expenses !== null) {
      localStorage.setItem("localExpenses", JSON.stringify(expenses));
    }
  }

  function getDataFromLocalStorage() {
    expenses = JSON.parse(localStorage.getItem("localExpenses"));
    if (expenses === null) {
    } else {
      expenses.forEach(item => {
        totalAmount = totalAmount + item.total;
      });

      addToDom();
    }
  }

  function getDataFirestore() {
    firebase
      .firestore()
      .collection("expenses")
      .get()
      .then(snaps => {
        // Loop through documents in database
        snaps.forEach(doc => {
          if (expenses == null) expenses = [];

          expenses.push(doc.data());
          totalAmount =
            totalAmount +
            Number(doc.data().amount) * Number(doc.data().frequency);
        });

        addToDom();
      });
  }

  function addExpenses() {
    if (expenses === null) {
      expenses = [];
    }
    let expense1 = new Expense(
      expenses.length + 1,
      name.value,
      amount.value,
      frequency.value,
      amount.value * frequency.value
    );
    expenses.push(expense1);

    totalAmount += expense1.amountPerMonth();

    addToDom();

    addToFirebase(expense1);
  }

  function addToDom() {
    addTable.classList.remove("d-none");
    inputSection.classList.add("d-none");

    tbody.textContent = null;

    if (expenses) {
      expenses.forEach((element, index) => {
        let td = document.createElement("td");
        let tr = document.createElement("tr");
        tr.setAttribute("id", "exp" + index);
        tr.addEventListener("click", onBodyClick);

        td.textContent = index + 1;
        tr.appendChild(td);

        const el = [];
        for (const prop in element) {
          if (prop == "name") el[0] = element[prop];
          if (prop == "amount") el[1] = element[prop];
          if (prop == "frequency") el[2] = element[prop];
          if (prop == "total") el[3] = element[prop];
        }

        el.forEach(element => {
          td = document.createElement("td");
          td.textContent = element;
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    totalAmountDiv.textContent = totalAmount;
    showForm.classList.remove("d-none");
  }

  function putToEdit() {
    inputSection.classList.remove("d-none");
    //showForm.classList.add("d-none");
    name.value = expenses[selectedIndex].name;
    amount.value = expenses[selectedIndex].amount;
    frequency.value = expenses[selectedIndex].frequency;
    saveBtn.classList.remove("d-none");
    addBtn.classList.add("d-none");

    document.querySelector("#edit").classList.add("d-none");
  }
  function update() {
    totalAmount = totalAmount - expenses[selectedIndex].total;
    expenses[selectedIndex].id = selectedIndex;
    expenses[selectedIndex].name = name.value;
    expenses[selectedIndex].amount = amount.value;
    expenses[selectedIndex].frequency = frequency.value;
    expenses[selectedIndex].total =
      Number(amount.value) * Number(frequency.value);

    totalAmount = totalAmount + expenses[selectedIndex].total;
    totalAmountDiv.textContent = totalAmount;

    btnAction.classList.add("d-none");
    showForm.classList.remove("d-none");

    addToDom();
    form.reset();
    updateInFirebase(expenses[selectedIndex]);
  }

  function updateInFirebase(key) {
    firebase
      .firestore()
      .collection("expenses")
      .doc(`${Number(key.id) + 1}`)
      .update({
        name: key.name,
        amount: key.amount,
        frequency: key.frequency,
        total: key.total
      })
      .then(function() {
        console.log("Document successfully updated!");
      });
  }

  function updatePos() {
    const sizeTarget = event.currentTarget.getBoundingClientRect();
    const editBtns = document.querySelector("#edit");
    editBtns.classList.remove("d-none");
    document.querySelector("#edit").style.top = sizeTarget.top + "px";
    //document.querySelector("#edit").style.left = event.clientX + "px"
    document.querySelector("#edit").style.left =
      sizeTarget.right - editBtns.getBoundingClientRect().width + "px";
  }
  function onBodyClick(event) {
    btnAction.classList.remove("d-none");
    inputSection.classList.add("d-none");
    showForm.classList.remove("d-none");
    updatePos();

    if (selectedIndex > -1 && tbody.childNodes[selectedIndex]) {
      tbody.childNodes[selectedIndex].classList.remove("bg-warning");
    }
    selectedIndex = event.currentTarget.id[3];

    event.currentTarget.classList.add("bg-warning");
    event.currentTarget.classList.add("position-relative");
  }

  function removeDocumentFromFirestore(key) {
    firebase
      .firestore()
      .collection("expenses")
      .doc(`${key}`)
      .delete()
      .then(function() {
        console.log("Document successfully deleted!");
      })
      .catch(function(error) {
        console.error("Error removing document: ", error);
      });
  }
  function removeExpense() {
    totalAmount = totalAmount - expenses[selectedIndex].total;
    const deltedItem = expenses.splice(selectedIndex, 1);
    removeDocumentFromFirestore(deltedItem[0].id);
    addToDom();
    totalAmountDiv.textContent = totalAmount;
    btnAction.classList.add("d-none");
    form.reset();
    showForm.classList.remove("d-none");
  }

  function onSubmit(event) {
    event.preventDefault();
    addExpenses();
    form.reset();
  }
};
