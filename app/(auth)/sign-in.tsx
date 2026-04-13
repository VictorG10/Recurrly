import { useSignIn } from "@clerk/expo";
import clsx from "clsx";
import { Link, useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [pendingTask, setPendingTask] = React.useState<any | null>(null);

  const resolveFieldMessage = (field?: unknown) => {
    if (!field) return undefined;
    if (typeof field === "string") return field;
    if (typeof field === "object" && field !== null && "message" in field) {
      return (field as any).message;
    }
    return undefined;
  };

  const fieldErrors = errors.fields as any;
  const codeError = resolveFieldMessage(fieldErrors.code);
  const identifierError = resolveFieldMessage(fieldErrors.identifier);
  const passwordError = resolveFieldMessage(fieldErrors.password);

  const emailIsValid = emailPattern.test(emailAddress.trim());
  const readyToSubmit = emailIsValid && password.length > 0;
  const requiresTrust = signIn.status === "needs_client_trust";

  const navigateToDecoratedUrl = async (url: string | Href) => {
    if (typeof url === "string" && url.startsWith("http")) {
      if (typeof window !== "undefined") {
        window.location.href = url;
      } else {
        await Linking.openURL(url);
      }
    } else {
      router.replace(url as Href);
    }
  };

  const handleSubmit = async () => {
    setGlobalError(null);

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setGlobalError(error.message ?? "We couldn’t sign you in.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: async ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setPendingTask(session.currentTask);
            return;
          }

          const url = decorateUrl("/");
          await navigateToDecoratedUrl(url);
        },
      });
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const factor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (factor) {
        await signIn.mfa.sendEmailCode();
      } else {
        setGlobalError(
          "Unable to send a verification code. Please contact support.",
        );
      }
      return;
    }

    setGlobalError("Unable to sign in. Please verify your credentials.");
  };

  const handleVerify = async () => {
    setGlobalError(null);

    const { error } = await signIn.mfa.verifyEmailCode({ code });

    if (error) {
      setGlobalError(error.message ?? "We couldn’t verify the code.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: async ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setPendingTask(session.currentTask);
            return;
          }

          const url = decorateUrl("/");
          await navigateToDecoratedUrl(url);
        },
      });
    } else {
      setGlobalError("The verification code did not complete sign-in.");
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen justify-center"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="auth-content">
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <Text className="auth-wordmark">Recurrly</Text>
            </View>
            <Text className="auth-wordmark-sub">
              Return to the subscription control center
            </Text>
            <Text className="auth-title">Sign in to your account</Text>
            <Text className="auth-subtitle">
              Enter your email and password to continue managing renewals and
              billing.
            </Text>
          </View>

          <View className="auth-card">
            {pendingTask ? (
              <View className="auth-form">
                <Text className="auth-title">Action required</Text>
                <Text className="auth-subtitle">
                  We need a bit more information before signing you in.
                </Text>
                <Text className="auth-helper">
                  {pendingTask?.name ||
                    pendingTask?.type ||
                    "Please follow the required task to continue."}
                </Text>
              </View>
            ) : requiresTrust ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      fieldErrors.code && "auth-input-error",
                    )}
                    value={code}
                    placeholder="000000"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    onChangeText={setCode}
                  />
                  {codeError && <Text className="auth-error">{codeError}</Text>}
                </View>

                <Pressable
                  className={clsx(
                    "auth-button",
                    (fetchStatus === "fetching" || !code) &&
                      "auth-button-disabled",
                  )}
                  onPress={handleVerify}
                  disabled={fetchStatus === "fetching" || !code}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching" ? "Verifying…" : "Verify code"}
                  </Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.mfa.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.reset()}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      fieldErrors.identifier && "auth-input-error",
                    )}
                    value={emailAddress}
                    placeholder="you@email.com"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    onChangeText={setEmailAddress}
                  />
                  {identifierError ? (
                    <Text className="auth-error">{identifierError}</Text>
                  ) : (
                    <Text className="auth-helper">
                      Use the email address linked to your account.
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      fieldErrors.password && "auth-input-error",
                    )}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="#666"
                    secureTextEntry
                    onChangeText={setPassword}
                  />
                  {passwordError ? (
                    <Text className="auth-error">{passwordError}</Text>
                  ) : (
                    <Text className="auth-helper">
                      Keep your password secure and private.
                    </Text>
                  )}
                </View>

                <Pressable
                  className={clsx(
                    "auth-button",
                    (!readyToSubmit || fetchStatus === "fetching") &&
                      "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={!readyToSubmit || fetchStatus === "fetching"}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching" ? "Signing in…" : "Continue"}
                  </Text>
                </Pressable>
              </View>
            )}

            {globalError && <Text className="auth-error">{globalError}</Text>}

            <View className="auth-link-row">
              <Text className="auth-link-copy">Need a new account?</Text>
              <Link href="/(auth)/sign-up" className="auth-link">
                Create one
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
