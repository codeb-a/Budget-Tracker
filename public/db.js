let db;

const request = window.indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("BudgetStore", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(`Woops! ${event.target.errorCode}.`);
};

function saveRecord(record) {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  store.add(record);
}

function checkDatabase() {
  let transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(["BudgetStore"], "readwrite");
            const currentStore = transaction.objectStore("BudgetStore");
            currentStore.clear();
          }
        });
    }
  };
}
window.addEventListener("online", checkDatabase);
