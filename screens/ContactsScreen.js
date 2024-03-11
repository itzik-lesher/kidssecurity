import { useLayoutEffect, useEffect, useState } from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import UsersList from "../contact_users_from_phone/UsersList";
import IconButton from "../components/GUI/IconButton";
//import * as Contacts from "expo-contacts";

function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState(undefined);
  const [error, setError] = useState(null);
  function headerButtonPressHandler() {
    console.log("PRESS Contacts");
    navigation.navigate("HomeScreen");
  }

  useLayoutEffect(() => {
    //console.log(JSON.stringify(navigation.route.name, null, 2));
    navigation.setOptions({
      headerRight: () => {
        return (
          <IconButton
            iconText="לדף הבית"
            title="Tap Me"
            onPress={headerButtonPressHandler}
          />
        );
      },
    });
  }, [navigation]);

  return <UsersList />;
}
export default ContactsScreen;

const styles = StyleSheet.create({
  homeScreanView: {
    marginTop: 50,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
