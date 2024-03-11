import * as React from "react";
import { View, Text, Button, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AllContextComponent from "./store/context/all-context";
import { AllContext } from "./store/context/all-context";
import HomeScreen from "./screens/HomeScreen";
import ContactsScreen from "./screens/ContactsScreen";
import { init, fetchRegisteredUsers } from "./util/database";
import ManageUserScreen from "./screens/ManageUserScreen";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { COLORS } from "./constnats/colors";
import LocationPicker from "./components/LocationPicker";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { useBearStore } from "./zu";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log(
      "Received a notification in the background!",
      data,
      executionInfo
    );
    const notifiData = JSON.parse(data.notification.data.body);
    const bears = useBearStore.getState().bears;
    sendPushNotification(notifiData.pushToken, bears);
  }
);
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const sendPushNotification = async (pushToken, data) => {
  const apiUrl = "https://exp.host/--/api/v2/push/send";
  const notificationData = {
    to: pushToken,
    title: "Backgorund",
    body: `The app is in backGround ${data}`,
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

const Stack = createNativeStackNavigator();

function App() {
  const locationPickerRef = React.useRef();
  const [dbInitialized, setDbInitialized] = React.useState(false);
  const allContext = React.useContext(AllContext);

  React.useEffect(() => {
    //console.log("useeffect in app");
    init()
      .then(() => {
        setDbInitialized(true);
        //console.log("init done");
      })
      .catch((err) => {
        //console.log("error in init = " + err);
      });
    /*
    fetchRegisteredUsers()
      .then(() => {
        //allContext.setRegsiteredUsersCtx();
        setDbInitialized(true);
        console.log("fetchRegisteredUsers done");
      })
      .catch((err) => {
        console.log("error in  fetchRegisteredUsers = " + err);
      });
    */
  }, []);

  // target function
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      console.log("Receiving Notification");
      console.log(
        "notification.request.content.title = " +
          notification.request.content.title
      );

      //console.log(
      //  "notification.request.content.body   = " +
      //    notification.request.content.body
      //);

      // find according to body if its a sender or target function

      if (
        notification.request.content.body.slice(0, 17) === "ExponentPushToken"
      ) {
        // sender message- performed in target
        //console.log('slice1 = ' + notification.request.content.body.slice(0, 17));
        if (notification.request.content.title === "location-request") {
          // this calls the function getLocationHandler from LocationPicker.js
          // !!!!! I have still to use its return value here
          const location = await locationPickerRef.current.myLocation();
          console.log(
            "OOOOOOOOOOOOOOOOOOOOOOnotification.request.content.body"
          );
          console.log(
            JSON.stringify(notification.request.content.body, null, 2)
          );
          // send back my location to the sender
          // target meddage
          fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: notification.request.content.body,
              title: "location-result",
              body: JSON.stringify(location),
            }),
          });
        }
      } else {
        //  notification.request.content.body.slice(0, 17) === "ExponentPushToken"
        // sender function - target message - performed in sender since slice(0, 17) != "ExponentPushToken"
        if (notification.request.content.title === "location-result") {
          console.log("here is seneder message returning from target");
          console.log(
            "target message body = " + notification.request.content.body
          );
          console.log(
            "target message notification.request.content.title = " +
              notification.request.content.title
          );

          console.log(
            "notification.request.content.body   = " +
              notification.request.content.body
          );
        }
        //await locationPickerRef.current.myLocation();
      }

      return {
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowAlert: true,
      };
    },
  }); //  Notifications.setNotificationHandler({

  if (!dbInitialized) {
    return (
      <>
        <StatusBar />
        <View>
          <Text>Waiting for database...</Text>
          <LocationPicker ref={locationPickerRef} />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar />
      <AllContextComponent>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.primary500 },
              headerTintColor: COLORS.gray700,
              contentStyle: COLORS.gray700,
            }}
          >
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
            <Stack.Screen
              name="ManageUserScreen"
              component={ManageUserScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <LocationPicker ref={locationPickerRef} />
      </AllContextComponent>
    </>
  );
}

export default App;
