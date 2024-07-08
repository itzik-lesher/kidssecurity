import * as SQLite from "expo-sqlite/legacy";

// if doent exist - it will be created
//const database = SQLite.openDatabase("usrer_phone_pudhtoken.db");
// build a new DB since tel uses the INTEGER instead of TEXT
const database = SQLite.openDatabase("user_phone_token2.db");

// LIST of ALL FUNCTIONS HERE

// Drop User from PhusToken Databse
 // insertUser
// replaceUser
// searchIfUserExists
// getTokenFromPhone
// dropUser
// dropAllUsers
// fetchRegisteredUsers


export function init() {
  //console.log("init1");
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      //console.log("init2");
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS user_phone_token2 (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        suspended TEXT,
        reserved1 TEXT,
        reserved2 TEXT,
        tel TEXT NOT NULL UNIQUE,
        pushtoken TEXT NOT NULL
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
  console.log("phone original string =" + registereduser.tel);
  const telCleaned = registereduser.tel.replace("972", "0");
  console.log("telCleaned string =" + telCleaned);
  const telCleaned2 = telCleaned.replace(" ", "");
  console.log("telCleaned string =" + telCleaned2);
  const telCleaned3 = telCleaned2.replace("+", "");
  console.log("telCleaned string =" + telCleaned3);
  const telCleaned4 = telCleaned3.replace(/-/g, "");
  // convert it to string
  const telCleaned_final = telCleaned4.toString();
  console.log("telCleaned_final insert =" + telCleaned_final);

  //If user exists -> Update, else -> simple insert

  // First check if user exists
  const isUserExists = searchIfUserExists(telCleaned_final);
  console.log("isUserExists = " + isUserExists);
  console.log(JSON.stringify(isUserExists, null, 2));

  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO user_phone_token2 (name, tel, pushtoken) VALUES (?, ?, ?)`,
        //[registereduser.name, registereduser.tel],
        [registereduser.name, telCleaned_final, registereduser.pushtoken],
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

export function replaceUser(registereduser) {
  console.log("enter replaceUser");
  console.log("phone original string =" + registereduser.tel);
  const telCleaned = registereduser.tel.replace("972", "0");
  console.log("telCleaned string =" + telCleaned);
  const telCleaned2 = telCleaned.replace(" ", "");
  console.log("telCleaned string =" + telCleaned2);
  const telCleaned3 = telCleaned2.replace("+", "");
  console.log("telCleaned string =" + telCleaned3);
  const telCleaned4 = telCleaned3.replace(/-/g, "");
  // convert it to string
  const telCleaned_final = telCleaned4.toString();
  console.log("telCleaned_final insert =" + telCleaned_final);

  //If user exists -> Update, else -> simple insert

  // First check if user exists(the function searchIfUserExists itself is right bellow)
  const isUserExists = searchIfUserExists(telCleaned_final);
  console.log("isUserExists = " + isUserExists);
  console.log(JSON.stringify(isUserExists, null, 2));

  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `REPLACE INTO user_phone_token2 (name, tel, pushtoken) VALUES (?, ?, ?)`,
        //[registereduser.name, registereduser.tel],
        [registereduser.name, telCleaned_final, registereduser.pushtoken],
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

export function searchIfUserExists(telCleaned_final) {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM user_phone_token2 WHERE tel = ? and pushtoken LIKE "ExponentPushToken%" `,
        [telCleaned_final],
        (_, result) => {
          resolve(result);
          console.log("result searchIfUserExists = " + result);
          console.log(JSON.stringify(result, null, 2));
        },
        (_, error) => {
          reject(error);
          console.log("error in searchIfUserExists = " + error);
        }
      );
    });
  });

  return promise;
}

export  function getTokenFromPhone(telCleaned_final) {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM user_phone_token2 WHERE tel = ? and pushtoken LIKE "ExponentPushToken%" `,
        //`SELECT * FROM user_phone_token WHERE pushtoken LIKE "ExponentPushToken%" `,
        [telCleaned_final],
        (_, result) => {
          resolve(result);
          console.log("$$$$$$$$$$$$$$$$ result getTokenFromPhone = " + result);
          console.log(JSON.stringify(result, null, 2));
        },
        (_, error) => {
          reject(error);
          console.log(
            "$$$$$$$$$$$$$$$$$ error in getTokenFromPhone = " + error
          );
        }
      );
    });
  });

  return promise;
} // getTokenFromPhone


export function dropUser(registereduser) {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM user_phone_token2 WHERE name = ?`,
        [registereduser],
        (_, result) => {
          resolve(result);
          console.log("result = " + result);
          console.log(JSON.stringify(result, null, 2));
        },
        (_, error) => {
          reject(error);
          console.log("error in insertsuer = " + error);
        }
      );
    });
  });

  return promise;
}

export function dropAllUsers() {
  const promise = new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM user_phone_token2`,
        (_, result) => {
          resolve(result);
          console.log("result = " + result);
          console.log(JSON.stringify(result, null, 2));
        },
        (_, error) => {
          reject(error);
          console.log("error in dropAllUsers = " + error);
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
        "SELECT * FROM user_phone_token2",
        [],
        (_, result) => {
          resolve(result);
          console.log(
            "result fetching users FFFFFFFFFF = " +
              JSON.stringify(result, null, 2));
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
