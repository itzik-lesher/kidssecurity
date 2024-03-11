import { onPress, Pressable, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { useContext, useEffect, useLayoutEffect, useRef } from "react";
//import { sendBackLocation } from "../components/native_actions/getCordinates";

import { AllContext } from "../store/context/all-context";

import {
  init,
  dropUser,
  dropAllUsers,
  fetchRegisteredUsers,
  getTokenFromPhone,
} from "../util/database";
import LocationPicker from "../components/LocationPicker";

function ManageUserScreen({ route, navigation }) {
  const allContext = useContext(AllContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.selectedUser,
    });
  }, [navigation]);

  console.log("in manageuserscreen ");
  console.log("phone = " + route.params.phone);
  console.log("route in manageuserscreen ");
  console.log(JSON.stringify(route, null, 2));

  // sender function
  async function sendNotificationLocation() {
    // send notification to the target
    // with the demmand of Location Cordinates

    // get pushtoken from Sqlite

    let userObject = await getTokenFromPhone(route.params.phone);

    /////$$$sendMeInfo("location-request", route.params.pushtoken);
    sendMeInfo("location-request", userObject.rows._array[0].pushtoken);
  }
  /*
  // sender function
  function sendMeInfo(request, targetPudhToken) {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: targetPudhToken,
        title: request,
        body: allContext.localPushTokenCtx,
        data: { pushToken: allContext.localPushTokenCtx },
      }),
    });
  }
*/
  const sendMeInfo = async (request, targetPudhToken) => {
    const apiUrl = "https://exp.host/--/api/v2/push/send";
    const notificationData = {
      to: targetPudhToken,
      title: request,
      body: allContext.localPushTokenCtx,
      data: { pushToken: allContext.localPushTokenCtx },
    };
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error("Error sending push notification:", error.message);
    }
  };

  function deletUserFromDb(userName, e) {
    console.log("userName =" + userName);
    // update the state
    allContext.removeRegisteredUserCtx(userName);
    console.log("userName =" + userName);
    // update the db
    dropUser(userName);
    // navigate to Homescreen
    navigation.navigate("HomeScreen");
  }
  function deletAllUserFromDb() {
    //console.log("userName =" + userName);
    // update the state
    allContext.removeAllRegisteredUserCtx();
    //console.log("userName =" + userName);
    // update the db
    dropAllUsers();
    // navigate to Homescreen
    navigation.navigate("HomeScreen");
  }

  return (
    <View>
      {/*<Text onPress={() => Linking.openURL("tel:" + route.params.phone)}>
        ManageUserScreen
  </Text>*/}
      <Text>חייג </Text>
      <Text onPress={sendNotificationLocation}> הצג מיקום </Text>
      <Text>האזן לטלפון</Text>
      <Text onPress={deletUserFromDb.bind(this, route.params.selectedUser)}>
        מחק משתמש
      </Text>
      <Text onPress={deletAllUserFromDb}>מחק את כל המשתמשים</Text>
    </View>
  );
}

export default ManageUserScreen;
