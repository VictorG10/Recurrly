import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const settingsItems = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy & Security" },
  { id: "help", label: "Help & Support" },
];

const Settings = () => {
  const { isLoaded, user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#081126" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  const fullName =
    user.fullName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const username = user.username;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="px-5"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-5 rounded-4xl bg-card p-5">
          <View className="flex-row items-center gap-4">
            <Image
              source={{ uri: user.imageUrl ?? undefined }}
              className="h-20 w-20 rounded-full bg-muted"
            />
            <View className="flex-1">
              <Text className="text-2xl font-sans-bold text-primary">
                {fullName || "Profile"}
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                {email}
              </Text>
              {username ? (
                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  @{username}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View className="mt-6 space-y-3">
          {settingsItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.id === "account") {
                  router.push("/account");
                }
              }}
              className="rounded-3xl bg-white px-4 py-4 border border-border"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-sans-semibold text-primary">
                  {item.label}
                </Text>
                <Text className="text-xl font-sans-bold text-muted-foreground">
                  ›
                </Text>
              </View>
            </Pressable>
          ))}

          <Pressable
            onPress={() => void signOut()}
            className="rounded-3xl bg-white px-4 py-4 border border-border"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-sans-semibold text-destructive">
                Sign Out
              </Text>
              <Text className="text-xl font-sans-bold text-muted-foreground">
                ›
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
