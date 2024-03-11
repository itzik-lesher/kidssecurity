import { useLayoutEffect, useEffect, useContext } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import IconButton from "../components/GUI/IconButton";
import RegisteredUsers from "../registered_users/RegisteredUsres";
import { sendBackLocation } from "../components/native_actions/getCordinates";

//import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";
import { AllContext } from "../store/context/all-context";

//const USERS = ["איצקי", "משה", "חיים", "עוד דליה אביאל", "נועם"];

//------------------ background notification support
/*
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log("Received a notification in the background!");
    // Do something with the notification data
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
*/
//--------------------------

function HomeScreen({ navigation }) {
  const allContext = useContext(AllContext);

  useLayoutEffect(() => {
    //console.log(JSON.stringify(navigation.route.name, null, 2));
    navigation.setOptions({
      headerRight: () => {
        return (
          <IconButton
            iconText="הוסף איש קשר"
            title="Tap Me"
            onPress={headerButtonPressHandler}
          />
        );
      },
    });
  }, [navigation]);

  //export default function App() {
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      console.log("status getPermissionsAsync = " + status);
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("status requestPermissionsAsync = " + status);
        finalStatus = status;
      }

      //finalStatus = "granted";

      console.log("finalStatus requestPermissionsAsync = " + finalStatus);
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions."
        );
        return;
      }

      Alert.alert("notificatuion permission granted");
      //const pushTokenData = await Notifications.getExpoPushTokenAsync();
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "bd9aaf8c-d148-4cc2-91dc-6add6fb33250",
      });
      console.log(JSON.stringify(pushTokenData), null, 2);
      alert(pushTokenData.data);
      console.log("following pushToken.data");
      console.log(JSON.stringify(pushTokenData.data), null, 2);
      allContext.addExpoPushTokenCtx(pushTokenData.data);
      console.log("LOCAL PUSHTOKEN FOLLOWS - allContext.pushToken");
      console.log(JSON.stringify(allContext.localPushTokenCtx), null, 2);
      console.log("LOCAL PUSHTOKEN = " + allContext.localPushTokenCtx);
      console.log(JSON.stringify(allContext.localPushTokenCtx.data), null, 2);
      Alert.alert(pushTokenData.data);

      if (Platform.OS === "android") {
        const setChannelResult =
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        console.log("SET CHANNEL RESULT", setChannelResult);
      }
    }

    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(notification);
        //const userName = notification.request.content.data.userName;
        //console.log(userName);
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  function headerButtonPressHandler() {
    console.log("PRESS HomeScreen");
    navigation.navigate("ContactsScreen");
  }
  /*
  function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification.",
        data: { userName: "Max" },
      },
      trigger: {
        seconds: 5,
      },
    });
  }
*/
  // send to myself: Samsung A51
  function sendPushNotificationHandler() {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[TSh-SVAOFDIMzSkyXxs9oA]",
        title: "title notification",
        body: "body notification",
      }),
    });
    // send notification to old Noams Samsung
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[u5-0jANU8-TYl0fuRGaf22]",
        title: "title notification",
        body: "body notification",
      }),
    });
  }

  return (
    <View style={styles.homeScreenView}>
      <RegisteredUsers navigation={navigation} />
      <View style={styles.title}>
        {/*<Button
          title="Schedule Notification"
          onPress={scheduleNotificationHandler}
  />*/}
        <Button
          title="Send Notification"
          onPress={sendPushNotificationHandler}
        />
        <Text>HomeScreen</Text>
      </View>
      <View style={styles.scrollViewContainer}></View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  homeScreenView: {
    flexDirection: "column",
    flex: 1,
  },
  title: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  scrollViewContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    flex: 1,
    minWidth: "60%",
    marginBottom: 10,
    borderColor: "#000",
    borderWidth: 2,
    paddingLeft: 5,
    paddingRight: 0,
  },
});
