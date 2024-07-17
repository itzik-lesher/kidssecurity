import { View, Text, ScrollView } from "react-native";
import { useContext, useEffect, useState } from "react";
import { DUMMY_REGISTERED_USERS } from "./DummyRegisteredUsers";
import { AllContext } from "../store/context/all-context";
import { fetchRegisteredUsers, replaceUser } from "../util/database";
//import { useNavigation } from "@react-navigation/native";
    
import { getTokenFromPhone } from '../util/database';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBearStore2 } from "../components/LocationPicker";

function RegisteredUsers({ navigation }) {
  const allContext = useContext(AllContext);
  
  // the following triggers useEffect to navigate since it envolves async db call
  const [navigateToManageUserScreen, setNavigateToManageUserScreen] = useState({
    selectedUser: '',
    phone: '',
    pushtoken: ''
  });
  // this use\effect is only to fetch RegisterdUsers from DB to state
  useEffect(() => {
    async function fechUsers() {
      const regUsers = await fetchRegisteredUsers();

      allContext.setRegsiteredUsersCtx(regUsers.rows._array);
      console.log("Inside RegisterdUsers.js useEffect");
      console.log("regUsers.rows._array =" + regUsers.rows._array);
      console.log("regUsers.rows._array.length =" + regUsers.rows._array.length);
      console.  log ('LLLLL LLLLLL regUsers.rows.length', regUsers.rows.length);
      console.log(JSON.stringify(regUsers.rows._array, null, 2));
    }
    fechUsers();
  }, []);
  
  function onPressRegisteredUserHandlerNew(selectedUser, phone, pushtoken) {
    console.log("Inside onPressRegisteredUserHandlerNew");
    // this triggers useEffect to call async db call and than to navigate
    setNavigateToManageUserScreen((prevState) =>{
      console.log("Inside onPressRegisteredUserHandlerNew");
      console.log(JSON.stringify(prevState, null, 2));
     const newState =  {...prevState, selectedUser:selectedUser, pushtoken:pushtoken,phone:phone}
     console.log(JSON.stringify(newState, null, 2));
     return newState;
    })
  }

  // this useEffect navigate to ManageUserScrin upon pressing
  // on a registered user
  useEffect(() => {
    async function cheCeckUserByPhone() {
      //const regUsers = await fetchRegisteredUsers();
      let pushTokenUpdated='';
      let userObject =  await getTokenFromPhone(navigateToManageUserScreen.phone);
      console.log('userObject iside USEFFECT follows');     
      console.log(JSON.stringify(userObject, null, 2));
      console.log('navigateToManageUserScreen.phone', navigateToManageUserScreen.phone);
      ////////////////
      //!!! this is probbaly bad since it return a row without phone number
      //!!! probbaly should be 
      // !! if ( userObject.rows_array[0].tel == undefined ) 
      // I took it from the case where != undefined at the end
       
      console.log('userObject.rows.length', userObject.rows.length)
      // 14-7 if ( userObject.rows == undefined ) 
      if ( userObject.rows.length === 0 ) 
        { // probably user not registered in SQLite at all
          console.log('userObject.rows == undefined');
          // check in rest api
    /////////////////////////////////////////////////
      // Rest api from App.js
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var raw = JSON.stringify({
          local_name: "localName",
          local_phone: allContext.localPhoneNumberCtx,
          local_token: allContext.localPushTokenCtx,
          //10-9 remote_name: selectedUser,
          remote_name: navigateToManageUserScreen.selectedUser,
          //10-9 remote_phone: phone,
          remote_phone: navigateToManageUserScreen.phone,
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
            console.log("Object.keys(result).length  = " + Object.keys(result).length );
            console.log("remote name = " + result.remote_name);
              console.log("remote phone = " + result.remote_phone);
              console.log("remote token = " + result.remote_token);
              ///console.log("name = " + name);
              
            // if we have a matching partner we get 3 json porperties string
            if (Object.keys(result).length === 3) {
              // ther is a match to a partner record       
              // !!! modify that since may exists with unknown pushtoken
              console.log('insdie onPressRegisteredUserHandler  Object.keys(result).length ============== 3)');
              replaceUser({
                //10-9 name: selectedUser,
                name: navigateToManageUserScreen.selectedUser,
                tel: result.remote_phone,
                pushtoken: result.remote_token,
              });
            } else if (result === 1) {
              console.log('insdie onPressRegisteredUserHandler  Object.keys(result).length ============== 1)');
              // No match. The row was inserted to WP DB
              // there is no match to a partner
              // Insert it also to local DB with an unknown pudhToken
              console.log("phoneNumber = " + phoneNumber);
              replaceUser({
                //10-9 name: selectedUser,
                name: navigateToManageUserScreen.selectedUser,
                tel: phoneNumber,
                pushtoken: "notKnown",
              });
            } else if (result === 0) {
              console.log('insdie onPressRegisteredUserHandler  Object.keys(result).length ============== 0)');
              // Dont insert into local DB since not inserted in Rest DB
              // - probably duplicated user
              /* 10-9 following commneted out since there 
                 is no new data from REST API
              replaceUser({
                name: selectedUser,
                tel: phoneNumber,
                pushtoken: "notKnown",
              });
              */
            }
          })
          .catch((error) => console.log("error", error));
    
    // End Rest api
    /////////////////////////////////////////////////
    
         // 14-7 pushTokenUpdated = pushtoken;
         // 14-7- the following is relevant only in cases were
         // result = 3 and result = 1, Not when result = 0     
         if (typeof pushtoken !== 'undefined'){
            pushTokenUpdated = pushtoken;
         }
        } // if ( userObject.rows == undefined ) 
        else
        { // HERE userObject.rows != undefined. User exists in local SQlit
          
          console.log('!!!!! userObject.rows != undefined ')
          console.log(JSON.stringify(userObject, null, 2));
          // update pushToken from db
          // the following  fails even if the previous userObject prints fine
          // The following verifies that code doen't use undefined variabl(pushtoken)
          if (userObject.rows.length > 0 ){
          pushTokenUpdated = userObject.rows._array[0].pushtoken;
          }
          //console.log(JSON.stringify(userObject.rows._array[0].pushtoken, null, 2));
          
        } // HERE userObject.rows != undefined. User exists in local SQlit
        
        console.log('pushTokenUpdated followss');
        console.log(' = ' + pushTokenUpdated);
        //console.log('selectedUser' + selectedUser);
        console.log('navigateToManageUserScreen.selectedUser' + navigateToManageUserScreen.selectedUser);
        navigation.navigate("ManageUserScreen", {
          selectedUser: navigateToManageUserScreen.selectedUser,
          phone: navigateToManageUserScreen.phone,
          //pushtoken: pushtoken,
          pushtoken: pushTokenUpdated
    
        });
        
     

     ////////////////////

    } // async function cheCeckUserByPhone() {

    //cheCeckUserByPhone();
    //without the following the app jums uppon startup to
    // ManageUserScreen without selecting user
    if (navigateToManageUserScreen.phone !== ''){
      cheCeckUserByPhone();
    }
  }, [navigateToManageUserScreen])
   ////////////////////////////////////////

  function onPressRegisteredUserHandler(selectedUser, phone, pushtoken) {
    console.log("PRESS On Registed User");
    console.log("selectedUser = " + selectedUser);
    console.log("phone = " + phone);
    console.log("pushtoken = " + pushtoken);

    //console.log("user = " + user);
    //console.log(JSON.stringify(user, null, 2));

    // check in local db if token is already known. If not
    // check in Rest Api
    let userObject =  getTokenFromPhone(phone);
    console.log('userObject follows');
    console.log(JSON.stringify(userObject, null, 2));

    //console.log('userObject.rows._array[0].pushtoken = ' + userObject.rows._array[0].pushtoken)
    if ( userObject.rows == undefined ) 
    {
      console.log('userObject.rows == undefined');
      // check in rest api
/////////////////////////////////////////////////
  // Rest api from App.js
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      local_name: "localName",
      local_phone: allContext.localPhoneNumberCtx,
      local_token: allContext.localPushTokenCtx,
      remote_name: selectedUser,
      remote_phone: phone,
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
        console.log("Object.keys(result).length  = " + Object.keys(result).length );
        console.log("remote name = " + result.remote_name);
          console.log("remote phone = " + result.remote_phone);
          console.log("remote token = " + result.remote_token);
          ///console.log("name = " + name);
          
        // if we have a matching partner we get 3 json porperties string
        if (Object.keys(result).length === 3) {
          // ther is a match to a partner record       
          // !!! modify that since may exists with unknown pushtoken
          console.log('insdie onPressRegisteredUserHandler  Object.keys(result).length ============== 3)');
          replaceUser({
            name: selectedUser,
            tel: result.remote_phone,
            pushtoken: result.remote_token,
          });
        } else if (result === 1) {
          console.log('insdie onPressRegisteredUserHandler  Object.keys(result).length ============== 1)');
          // No match. The row was inserted to WP DB
          // there is no match to a partner
          // Insert it also to local DB with an unknown pudhToken
          console.log("phoneNumber = " + phoneNumber);
          replaceUser({
            name: selectedUser,
            tel: phoneNumber,
            pushtoken: "notKnown",
          });
        } else if (result === 0) {
          console.log('insdie onPressRegisteredUserHandler  Object.keys(result).length ============== 0)');
          // Dont insert into local DB since not inserted in Rest DB
          // - probably duplicated user
          replaceUser({
            name: selectedUser,
            tel: phoneNumber,
            pushtoken: "notKnown",
          });
        }
      })
      .catch((error) => console.log("error", error));

// End Rest api
/////////////////////////////////////////////////

      pushTokenUpdated = pushtoken;
    } // if ( userObject.rows == undefined ) 
    else
    { // HERE userObject.rows != undefined  
      console.log(JSON.stringify(userObject, null, 2));
      // update pushToken from db
      pushTokenUpdated = userObject.rows._array[0].pushtoken;
    }
    console.log('pushTokenUpdated follows');
    console.log(' = ' + pushTokenUpdated);

    navigation.navigate("ManageUserScreen", {
      selectedUser: selectedUser,
      phone: phone,
      //pushtoken: pushtoken,
      pushtoken: pushTokenUpdated

    });
  } // function onPressRegisteredUserHandler(selectedUser, phone, pushtoken) {

  /////////////////////////////////////////
  //onst setZustandProperty = useBearStore2((state) => state.setZustandProperty);
  //const setZustandAcceptedLocation = useBearStore2((state) => state.setZustandAcceptedLocation);
  //let locationText = JSON.stringify(useBearStore2.getState().localStateLocalPhone)

  const setMyTrackingState = useBearStore2((state) => state.setMyTrackingState);
  const onPressTemporarryStopTracking = () =>{
    // using zustand stop tracking
    console.log('onPressTemporarryStopTracking');
    //console.log(JSON.stringify(useBearStore2.state.setMyTrackingState, null, 2));
    //console.log(useBearStore2.state)
    console.log(JSON.stringify(useBearStore2.getState().myTrackingState));
    setMyTrackingState(false);
    //console.log(JSON.stringify(useBearStore2, null, 2));
    console.log(JSON.stringify(useBearStore2.getState().myTrackingState));
  };

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
                onPress={onPressRegisteredUserHandlerNew.bind(
                  this,
                  user.name,
                  user.tel,
                  user.pushtoken
                )}
              >
                {user.name}
                {user.tel}
                {user.pushtoken}
                <Ionicons name="checkmark-done-outline" color="#ff0000" size={20} />
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
      <Text onPress={onPressTemporarryStopTracking}>הפסק זמנית מעקב אחרי</Text>
    </View>
  );
}

export default RegisteredUsers;
