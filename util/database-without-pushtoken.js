import * as SQLite from "expo-sqlite";

// if doent exist - it will be created
const database = SQLite.openDatabase("allusers.db");

export function init() {
  //console.log("init1");
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      //console.log("init2");
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS allusers (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        tel INTEGER NOT NULL 
       )`,
        [],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
  //console.log("init3");
  return promise;
}

export function insertUser(registereduser) {
  const promise = new Promise((resolve, reject) => {
    //console.log("result aaaaaaaaaaaaaa = " + result);
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO allusers (name, tel) VALUES (?, ?)`,
        //[registereduser.name, registereduser.tel],
        [registereduser.name, registereduser.tel],
        (_, result) => {
          //() => {
          //console.log(
          //  "result Inserting ggggggggggggggg = " +
          //    JSON.stringify(result, null, 2)
          //);
          resolve(result);
        },
        (_, error) => {
          reject(error);
          //console.log("error in insertsuer = " + error);
        }
      );
    });
  });

  return promise;
}
/*
export function deletetUser(registereduser) {
  const promise = new Promise((resolve, reject) => {
    //console.log("result aaaaaaaaaaaaaa = " + result);
    database.transaction((tx) => {
      tx.executeSql(
        `DELETE  INTO allusers (name, tel) VALUES (?, ?)`,
        //[registereduser.name, registereduser.tel],
        [registereduser.name, registereduser.tel],
        (_, result) => {
          //() => {
          //console.log(
          //  "result Inserting ggggggggggggggg = " +
          //    JSON.stringify(result, null, 2)
          //);
          resolve(result);
        },
        (_, error) => {
          reject(error);
          //console.log("error in insertsuer = " + error);
        }
      );
    });
  });

  return promise;
}
*/
export function fetchRegisteredUsers() {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM allusers",
        [],
        (_, result) => {
          resolve(result);
          //console.log(
          //  "result fetching users FFFFFFFFFF = " +
          //    JSON.stringify(result, null, 2)
          //);
        },
        (_, error) => {
          reject(error);
          // console.log("error in fetchRegisteredUsers = " + error);
        }
      );
    });
  });

  return promise;
}

export function fetchDuplicateUsers(phoneNumber) {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM allusers WHERE phoneNumber",
        [],
        (_, result) => {
          resolve(result);
          //console.log(
          //  "result fetching users FFFFFFFFFF = " +
          //    JSON.stringify(result, null, 2)
          //);
        },
        (_, error) => {
          reject(error);
          // console.log("error in fetchRegisteredUsers = " + error);
        }
      );
    });
  });

  return promise;
}
