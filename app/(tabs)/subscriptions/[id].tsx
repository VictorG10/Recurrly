import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text>Subscription Details: {id}</Text>
      <Link href={"/(tabs)"} className="mt-4 rounded p-4 bg-primary text-white">
        {" "}
        Go Back
      </Link>
    </View>
  );
};

export default SubscriptionDetails;
