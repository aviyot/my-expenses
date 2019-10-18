import { Expense } from "./modules/expense.js";
window.onload = function() {
  //localStorage.removeItem("localExpenses");
  let expenses = null;
  let totalAmount = 0;
  let selectedIndex = -1;

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
  const inputs = document.querySelectorAll("input");

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

  function writeToFirebase() {
    firebase
      .firestore()
      .collection("expenses")
      .add({
        name: "bire",
        amount: "300",
        freq: "2"
      });
  }

  inputs.forEach(input => {
    input.addEventListener("keyup", () => {
      console.log("input changed");
      saveBtn.classList.remove("d-none");
    });
  });

  form.addEventListener("submit", onSubmit);

  btnRemove.addEventListener("click", removeExpense);
  btnUpdate.addEventListener("click", putToEdit);
  showForm.addEventListener("click", () => {
    inputSection.classList.remove("d-none");
    addBtn.classList.remove("d-none");
    showForm.classList.add("d-none");
    document.querySelector("#edit").classList.add("d-none");
    tbody.childNodes[selectedIndex].classList.remove("bg-warning");
  });

  saveBtn.addEventListener("click", update);

  window.addEventListener("beforeunload", function() {
    if (expenses !== null) {
      localStorage.setItem("localExpenses", JSON.stringify(expenses));
    }
  });

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

  //getDataFromLocalStorage();

  function getDataFirestore() {
    firebase
      .firestore()
      .collection("expenses")
      .orderBy("amount", "desc")
      .onSnapshot(snaps => {
        // Loop through documents in database
        snaps.forEach(doc => {
          if (expenses == null) {
            expenses = [];
            expenses.push(doc.data());
            totalAmount = totalAmount + Number(doc.amount) * Number(doc.freq);
            console.log(doc.data());
          } else {
            expenses.push(doc.data());
            totalAmount = totalAmount + Number(doc.amount) * Number(doc.freq);
            console.log(doc.data());
            //totalAmount = totalAmount + doc.total;
          }
        });

        addToDom();
      });
  }

  getDataFirestore();
  // getDataFromLocalStorage();

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
  }

  function addToDom() {
    addTable.classList.remove("d-none");
    inputSection.classList.add("d-none");

    tbody.textContent = null;
    expenses.forEach((element, index) => {
      let td = document.createElement("td");
      const tr = document.createElement("tr");
      tr.setAttribute("id", "exp" + index);
      tr.addEventListener("click", onBodyClick);

      td.textContent = index + 1;
      tr.appendChild(td);

      for (const prop in element) {
        if (prop !== "id") {
          //  console.log(prop);
          td = document.createElement("td");
          td.textContent = element[prop];
          tr.appendChild(td);
        }
      }

      tbody.appendChild(tr);
    });
    totalAmountDiv.textContent = totalAmount;
    showForm.classList.remove("d-none");
  }

  function putToEdit() {
    inputSection.classList.remove("d-none");
    //showForm.classList.add("d-none");
    name.value = expenses[selectedIndex].name;
    amount.value = expenses[selectedIndex].amount;
    frequency.value = expenses[selectedIndex].frequency;
    saveBtn.classList.add("d-none");
    addBtn.classList.add("d-none");

    document.querySelector("#edit").classList.add("d-none");
  }
  function update() {
    totalAmount = totalAmount - expenses[selectedIndex].total;
    expenses[selectedIndex].id = selectedIndex;
    expenses[selectedIndex].name = name.value;
    expenses[selectedIndex].amount = amount.value;
    expenses[selectedIndex].frequency = frequency.value;
    expenses[selectedIndex].total = expenses[selectedIndex].total;

    totalAmount = totalAmount + expenses[selectedIndex].total;
    totalAmountDiv.textContent = totalAmount;

    btnAction.classList.add("d-none");
    showForm.classList.remove("d-none");

    addToDom();
    form.reset();
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

    //remove previes style

    /* const a = Number(event.currentTarget.offsetWidth);
    const d = Number(event.clientY);
    const b = Number(event.clientX);
    const c = Number(document.querySelector("#edit").offsetWidth); */

    if (selectedIndex > -1 && tbody.childNodes[selectedIndex]) {
      tbody.childNodes[selectedIndex].classList.remove("bg-warning");
    }
    selectedIndex = event.currentTarget.id[3];

    //document.querySelector("#edit").style.left = "0px";

    //console.log(a, b, c, a - b);

    /* if (a - b < c) {
      document.querySelector("#edit").style.left = a - c + "px";
    } */
    //console.log(document.querySelector("#edit").offsetWidth);
    event.currentTarget.classList.add("bg-warning");
    event.currentTarget.classList.add("position-relative");

    //putToEdit();
  }

  function removeExpense() {
    console.log(expenses[selectedIndex].total);
    totalAmount = totalAmount - expenses[selectedIndex].total;
    expenses.splice(selectedIndex, 1);
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
