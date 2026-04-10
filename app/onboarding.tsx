import { Link } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  return (
    <SafeAreaView className="flex-1  items-center justify-center bg-background">
      <Text>Onboarding</Text>
      <View className="flex-row gap-5">
        <Link
          href={"/(auth)/sign-in"}
          className="mt-4 rounded bg-primary text-white p-4"
        >
          Sign In
        </Link>
        <Link
          href={"/(auth)/sign-up"}
          className="mt-4 rounded bg-primary text-white p-4"
        >
          Sign Up
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
