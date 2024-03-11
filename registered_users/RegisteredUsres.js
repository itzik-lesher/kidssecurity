import { View, Text, ScrollView } from "react-native";
import { useContext, useEffect } from "react";
//import { DUMMY_REGISTERED_USERS } from "./DummyRegisteredUsers";
import { AllContext } from "../store/context/all-context";
import { fetchRegisteredUsers } from "../util/database";
//import { useNavigation } from "@react-navigation/native";

function RegisteredUsers({ navigation }) {
  const allContext = useContext(AllContext);
  //const navigation = useNavigation();

  // this use\effect is only to fetch RegisterdUsers from DB to state
  useEffect(() => {
    async function fechUsers() {
      const regUsers = await fetchRegisteredUsers();

      allContext.setRegsiteredUsersCtx(regUsers.rows._array);
      console.log("Inside RegisterdUsers.js useEffect");
      console.log("regUsers.rows._array =" + regUsers.rows._array);
      console.log(JSON.stringify(regUsers.rows._array, null, 2));
    }
    fechUsers();
  }, []);

  function onPressRegisteredUserHandler(selectedUser, phone, pushtoken) {
    console.log("PRESS On Registed User");
    console.log("selectedUser = " + selectedUser);
    console.log("phone = " + phone);
    console.log("pushtoken = " + pushtoken);
    //console.log("user = " + user);
    //console.log(JSON.stringify(user, null, 2));
    navigation.navigate("ManageUserScreen", {
      selectedUser: selectedUser,
      phone: phone,
      pushtoken: pushtoken,
    });
  }
  const usersList = (
    <>
      <ScrollView>
        <Text>
          the following are just for debugging in every line user.tel
          user.pushtoken
        </Text>
        {allContext.registeredUsersCtx.map((user) => {
          return (
            <View key={user.id}>
              <Text
                onPress={onPressRegisteredUserHandler.bind(
                  this,
                  user.name,
                  user.tel,
                  user.pushtoken
                )}
              >
                {user.name}
                {user.tel}
                {user.pushtoken}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
  return (
    <View style={{ flex: 1 }}>
      <Text>Users Details</Text>
      {usersList}
    </View>
  );
}

export default RegisteredUsers;
