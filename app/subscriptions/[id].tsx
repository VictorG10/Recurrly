import { Link, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text>Subscription Details: {id}</Text>
      <Link href={"/(tabs)"} className="mt-4 rounded p-4 bg-primary text-white">
        {" "}
        Go Back
      </Link>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;
