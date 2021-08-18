import React, { useEffect, useState } from "react";
import { StyleSheet, Button, Text, View, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

export default function App() {
  const [pushToken, setPushToken] = useState();

  useEffect(() => {
    const permissionrequest = async () => {
      if (Constants.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          Alert.alert(
            "Notification Permission Error!",
            "Failed to get push token for push notification!",
            [{ text: "Okey" }]
          );
          await Notifications.getPermissionsAsync();
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setPushToken(token);
      } else {
        alert("Must use physical device for Push Notifications");
      }
      //console.log(finalStatus,"= Final value of notification permission")
    };
    permissionrequest();
  }, []);

  useEffect(() => {
    const backgroundSubcriptions =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    const foregroundSubcriptions =
      Notifications.addNotificationReceivedListener((notify) => {
        //console.log(notify);
      });
    return () => {
      backgroundSubcriptions.remove(), foregroundSubcriptions.remove();
    };
  }, []);

  const triggerNotificationHandler = () => {
    /* Local Notification
    Notifications.scheduleNotificationAsync({
      content: {
        title: "First Local Notification",
        body: "This is the first local notification we are sending!",
        data: { mySpecialData: "Data" },
      },
      trigger: {
        seconds: 2,
      },
    });*/

    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip,deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        data: { extraData: "Some Data" },
        title: "Send via the app",
        body: "This push notif was sent via the app!",
      }),
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Trigger notification"
        onPress={triggerNotificationHandler}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
