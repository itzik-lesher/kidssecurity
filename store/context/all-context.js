import { createContext, useState } from "react";
import { DUMMY_REGISTERED_USERS } from "../../registered_users/DummyRegisteredUsers";

export const AllContext = createContext({
  addedUserCtx: "testuser",
  addedPhoneNumberCtx: 4344340,
  //registeredUsersCtx: DUMMY_REGISTERED_USERS,
  registeredUsersCtx: () => {},
  addRegisteredUserCtx: () => {},
  removeRegisteredUserCtx: () => {},
  removeAllRegisteredUserCtx: () => {},
  setRegsiteredUsersCtx: () => {},
  addExpoPushTokenCtx: () => {},
  setLocalPhoneNumberCtx: () => {},
  localPhoneNumberCtx: () => {},
  displayLocationStoreCtx: () => {},
  setDisplayLocationStoreCtx: () => {}
});

// this is actuall component
function AllContextComponent({ children }) {
  const [registeredUsers, setRegsiteredUsers] = useState(
    DUMMY_REGISTERED_USERS
  );
  const [addedUserState, setAddedUserState] = useState({
    user: "",
    phone: 0,
  });
  const [localPushToken, setLocalPushToken] = useState("");
  const [localPhoneNumber, setLocalPhoneNumber] = useState("0523010298");
  const [displayLocationStore,setDisplayLocationStore] = useState(false);

  const addRegisteredUser = (newUser) => {
    const userRecordExists = registeredUsers.find((user) => {
      console.log("newUser[2] = " + newUser[2]);
      console.log(JSON.stringify(newUser), null, 2);
      const telCleaned = newUser[2].replace("972", "0");
      console.log("telCleaned string =" + telCleaned);
      const telCleaned2 = telCleaned.replace(" ", "");
      console.log("telCleaned string =" + telCleaned2);
      const telCleaned3 = telCleaned2.replace("+", "");
      console.log("telCleaned string =" + telCleaned3);
      const telCleaned4 = telCleaned3.replace(/-/g, "");
      // convert it to string
      const telCleaned_final = telCleaned4.toString();
      console.log("user.tel = " + user.tel);
      console.log("telCleaned_final= " + telCleaned_final);
      //console.log(JSON.stringify(user), null, 2);
      //return user.tel === newUser[2];
      return user.tel === telCleaned_final;
    });
    console.log("userRecordExists = " + userRecordExists);
    if (userRecordExists === undefined) {
      console.log("userRecordExists - no = " + userRecordExists);
    } else {
      console.log("userRecordExists-yes" + userRecordExists);
      return;
    }

    setRegsiteredUsers((registeredUsers) => {
      console.log("insetRegsiteredUsers trl:newUser[2] = " + newUser[2]);
      const telCleaned = newUser[2].replace("972", "0");
      console.log("telCleaned string =" + telCleaned);
      const telCleaned2 = telCleaned.replace(" ", "");
      console.log("telCleaned string =" + telCleaned2);
      const telCleaned3 = telCleaned2.replace("+", "");
      console.log("telCleaned string =" + telCleaned3);
      const telCleaned4 = telCleaned3.replace(/-/g, "");
      // convert it to string
      const telCleaned_final = telCleaned4.toString();
      console.log(
        "insetRegsiteredUsers telCleaned_final = " + telCleaned_final
      );
      return [
        ...registeredUsers,
        //{ id: newUser[0], name: newUser[0], tel: newUser[2] },
        {
          id: newUser[0],
          name: newUser[0],
          tel: telCleaned_final,
          pushToken: "notKnown",
        },
      ];
    });
  };

  const removeRegisteredUser = (userNametoRemove) => {
    // the following is imutable
    const registeredUsersReduced = [...registeredUsers].filter((userRow) => {
      return userRow.name != userNametoRemove;
    });
    setRegsiteredUsers(registeredUsersReduced);
  };

  const removeAllRegisteredUser = () => {
    setRegsiteredUsers([]);
  };

  const contextxValue = {
    addedUserCtx: addedUserState.user,
    addedPhoneNumberCtx: addedUserState.phone,
    registeredUsersCtx: registeredUsers,
    addRegisteredUserCtx: addRegisteredUser,
    removeRegisteredUserCtx: removeRegisteredUser,
    removeAllRegisteredUserCtx: removeAllRegisteredUser,
    setRegsiteredUsersCtx: setRegsiteredUsers,
    localPushTokenCtx: localPushToken,
    addExpoPushTokenCtx: setLocalPushToken,
    setLocalPhoneNumberCtx: setLocalPhoneNumber,
    localPhoneNumberCtx: localPhoneNumber,
    displayLocationStoreCtx: displayLocationStore,
    setDisplayLocationStoreCtx: setDisplayLocationStore
  };
  //console.log("contextxValue = " + JSON.stringify(contextxValue, null, 2));
  return (
    <AllContext.Provider value={contextxValue}>{children}</AllContext.Provider>
  );
}

export default AllContextComponent;
