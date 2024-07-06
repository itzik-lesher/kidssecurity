import { useState, useEffect, useContext } from "react";
import {
  View,
  Button,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Contacts from "expo-contacts";
import { AllContext } from "../store/context/all-context";
import { insertUser, replaceUser, searchIfUserExists } from "../util/database";

function UsersList() {
  const [contacts, setContacts] = useState([]);
  const [tempContacts, setTempContsacts] = useState([]);

  let [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const navigation = useNavigation();

  const allContext = useContext(AllContext);

  function headerButtonPressHandler() {
    //console.log("PRESS");
  }

  // allContext.addUserName("dddd");
  ///allContext.addPhoneNumber("78787");
  //allContext.addPhoneNumber(99999);
  useEffect(() => {
    //console.log("useeffect in UsersList");
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.FirstName, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          const ContactsFiltered = data.filter((item, index) => {
            return (
              item.firstName !== undefined &&
              item.firstName.length > 0 &&
              // the following caused missing records like נטע
              //data[index - 1].firstName !== item.firstName &&
              item.name !== undefined &&
              item.name.length > 0 &&
              data[index - 1].name !== item.name
            );
          });
          //setContacts(ContactsFiltered);
          //setContacts(data);
          setContacts([...ContactsFiltered]);
          setTempContsacts([...ContactsFiltered]);
          console.log("data.length > 0");
        } else {
          console.log("data.length < 0");
          setError("No contacs available");
        }
      } else {
        // if (status === "granted") {
        setError("Permission to access contacts denied");
      }
    })();
    //allContext.addUserNameCtx("dddd");
    //allContext.addPhoneNumberCtx("99999999999");
    // just to see if reconized in context
    //console.log(
    //  " LLLLLLLLLLLLLLL AllContext.addedUser =" +
    //    JSON.stringify(allContext, null, 2)
    //);
  }, []);
  /* 23-6-2024
  // the following useEffect is only to enter for debugging initail
  // pnone numbers. In A51 we get 0523010298, in the EItan we get 0546552991
  // WHich belongs to יאלי הרצליה
  useEffect(() => {
    if (Platform.constants.Model != "SM-A515F") {
      allContext.setLocalPhoneNumberCtx("0544662132");
    } else {
      allContext.setLocalPhoneNumberCtx(allContext.localPhoneNumberCtx);
    }
  }, []);
  */
  const onChangeSelectedUserHandler = (enteredText) => {
    setSelectedUser(enteredText);
    //console.log("enteredText =" + enteredText);
    let fiteredUser = contacts.filter((contact, index) => {
      //if (index === 100) {
      //  console.log("contact.firstName =" + JSON.stringify(contact, null, 2));
      //}
      return (
        (contact.firstName && contact.firstName.indexOf(enteredText) >= 0) ||
        (contact.name && contact.name.indexOf(enteredText) >= 0) ||
        (contact.lastName && contact.lastName.indexOf(enteredText) >= 0)
      );
    });
    setTempContsacts(fiteredUser);
  };
  /* 23-6-2024
  const enterLoaclPhoneManuallyHandler = (localPhoneNumber) => {
    allContext.setLocalPhoneNumberCtx(localPhoneNumber);
  };
  */

  const onAddContactHandlerReplace = async (index, e) => {
    console.log('iiiiiiiiiiiiiiiiiiiinside onAddContactHandlerReplace UserList', allContext.localPhoneNumberCtx);
    //  "tempContacts[index]=" + JSON.stringify(tempContacts[index], null, 2)
    //);
    const phoneNumber = tempContacts[index].phoneNumbers[0].number;
    /* 23-6-2024
    if (allContext.localPhoneNumberCtx.length != 10) {
      Alert.alert("הכנס מספר טלפון שלך");
      return;
    }
    */
    //console.log("phone =" + phoneNumber);
    const name = tempContacts[index].name;
    // give an id according to name
    // !!!!!!!!!! consider remove the id from state or modify with random
    const id = tempContacts[index].name;
    //console.log("name =" + name);
    const pushToken = "notKnown";
    // First search for this user in local DB

    const userExistCheck = await searchIfUserExists(phoneNumber);
    console.log("userExistCheck = " + userExistCheck);
    console.log(JSON.stringify(userExistCheck, null, 2));
    console.log("userExistCheck.rows.length = " + userExistCheck.rows.length);

    // check if token is meaningfull or just "unknown"
    if (userExistCheck.rows.length === 1) {
      if (
        userExistCheck.rows._array[0].pushtoken.slice(0, 17) ===
        "ExponentPushToken"
      ) {
        console.log(
          "userExistCheck.rows._array[0].pushtoken.slice(0,17) = " +
            userExistCheck.rows._array[0].pushtoken.slice(0, 17)
        );
        console.log(
          "userExistCheck.length === 1 && real token:ExponentPushToken... "
        );
        // Meanning user already exists with meaningfull PushToken,
        // Do nothing
        // we have the partner pushToken so peobabaly in rest DB our
        // record with both tokens and if not than the other partner got it also
        // and deleted this record
        return;
      } else {
        console.log("userExistCheck.length !=== 1 || not ExponentPushToken");
        // user exists but token = 'notKnown'
        // continue to the next step in onAddContactHandler hoping
        // the POST will return the real token
      }
    } // if (userExistCheck.rows.length === 1) {

    // update state with new registeredUser
    allContext.addRegisteredUserCtx([id, name, phoneNumber, pushToken]);
    console.log("after addRegisteredUserCtx");
    console.log("AAAAAAAAAAAA in  addRegisteredUserCtx", id);
    console.log("AAAAAAAAAAAA in  addRegisteredUserCtx", name);
    console.log("AAAAAAAAAAAA in  addRegisteredUserCtx", phoneNumber);
    console.log("AAAAAAAAAAAA in  addRegisteredUserCtx", pushToken);
    // Rest api to kidssecurity.triplebit.com from Postman
    // I took it as is from POSTM and modified on ly on line later:
    // .then((response) => response.text()) => .then((response) => response.json())

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      local_name: "localName",
      local_phone: allContext.localPhoneNumberCtx,
      local_token: allContext.localPushTokenCtx,
      remote_name: name,
      remote_phone: phoneNumber,
      remote_token: "notKnown",
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://kidssecurity.triplebit.com/wp-json/wp-learn-form-submissions-api/v1/form-submissions/",
      requestOptions
    )
      //.then((response) => response.text())
      // Worked only when I changed text() to json()
      .then((response) => response.json())
      .then((result) => {
        console.log("fetch to kidssecurity result = " + result);
        // if we have a matching partner we get 3 json porperties string
        if (Object.keys(result).length === 3) {
          // ther is a match to a partner record
          console.log("remote name = " + result.remote_name);
          console.log("remote phone = " + result.remote_phone);
          console.log("remote token = " + result.remote_token);
          // !!! modify that since may exists with unknown pushtoken
          replaceUser({
            //name: result.remote_name,
            name: name,
            tel: result.remote_phone,
            pushtoken: result.remote_token,
          });
        } else if (result === 1) {
          // No match. The row was inserted to WP DB
          // there is no match to a partner
          // Insert it also to local DB with an unknown pudhToken
          console.log("phoneNumber = " + phoneNumber);
          replaceUser({
            name: name,
            tel: phoneNumber,
            pushtoken: "notKnown",
          });
        } else if (result === 0) {
          // Dont insert into local DB since not inserted in Rest DB
          // - probably duplicated user
          replaceUser({
            name: name,
            tel: phoneNumber,
            pushtoken: "notKnown",
          });
        }
      })
      .catch((error) => console.log("error", error));

    // |End

    // move automatically to HomeScreen
    navigation.navigate("HomeScreen");
  }; //  const onAddContactHandler = async (index, e) => {

  const users = (
    <View style={styles.usersListView}>
      <TextInput
        style={styles.textInput}
        keyboardType="default"
        maxLength={20}
        placeholder="הכנס שם או חלק ממנו"
        onChangeText={onChangeSelectedUserHandler}
        value={selectedUser}
      />
      <Text>Home</Text>
      {tempContacts !== undefined ? (
        <FlatList
          data={tempContacts}
          renderItem={({ item, index }) => (
            <View key={index} style={styles.userLine}>
              <Text
                onPress={onAddContactHandlerReplace.bind(this, index)}
                style={styles.name}
              >
                {item.name}
              </Text>

              <Text
                style={styles.fontNumber}
                onPress={onAddContactHandlerReplace.bind(this, index)}
              >
                {item.phoneNumbers &&
                item.phoneNumbers[0] &&
                item.phoneNumbers[0].number
                  ? item.phoneNumbers[0].number
                  : null}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index}
        />
      ) : null}
      {/*23-6-2024 <TextInput
        style={styles.localPhone}
        placeholder="הכנס את מספר הטלפון שלך"
        value={allContext.localPhoneNumberCtx}
        onChangeText={enterLoaclPhoneManuallyHandler}
      />*/}
    </View>
  );

  return users;
}

export default UsersList;

const styles = StyleSheet.create({
  usersListView: {
    marginTop: 50,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  userLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: "95%",
    paddingLeft: 10,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 12,
    minWidth: "50%",
  },
  fontNumber: {
    fontSize: 10,
    color: "#000",
    maxWidth: "50%",
    minWidth: "40%",
  },
  textInput: {
    minHeight: 50,
    minWidth: "75%",
    backgroundColor: "#FFF",
    borderColor: "#000",
    borderWidth: 2,
    paddingRight: 10,
    paddingLeft: 10,
  },
  localPhone: {
    minHeight: 50,
    minWidth: "75%",
    backgroundColor: "#FFF",
    borderColor: "#000",
    borderWidth: 2,
    paddingRight: 10,
    paddingLeft: 10,
    fontSize: 20,
  },
});
