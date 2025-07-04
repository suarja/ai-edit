Expo Setup
UploadThing is the easiest way to add file uploads to your native mobile applications powered by Expo.

Check out a full example here ↗

Setting up your environment
Install the packages
npm
pnpm
yarn
bun
npm install uploadthing @uploadthing/expo expo-image-picker expo-document-picker

Copy
Copied!
Add env variables
UPLOADTHING_TOKEN=... # A token for interacting with the SDK
EXPO_PUBLIC_SERVER_URL=... # Absolute URL to your server

Copy
Copied!
If you don't already have a uploadthing secret key, sign up ↗ and create one from the dashboard! ↗

Set Up A FileRouter
Steps 1 and 2 below assumes you're using Expo API routes ↗ which are currently experimental. You can also choose to use a standalone server using some of our backend adapters, e.g. Fetch

Creating your first FileRoute
All files uploaded to uploadthing are associated with a FileRoute. The following is a very minimalistic example, with a single FileRoute "imageUploader". Think of a FileRoute similar to an endpoint, it has:

Permitted types ["image", "video", etc]
Max file size
How many files are allowed to be uploaded
(Optional) input validation to validate client-side data sent to the route
(Optional) middleware to authenticate and tag requests
onUploadComplete callback for when uploads are completed
To get full insight into what you can do with the FileRoutes, please refer to the File Router API.

src/app/api/uploadthing+api.ts
import { createUploadthing, UploadThingError } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";
const f = createUploadthing();
const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);
      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(({ file, metadata }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
export type UploadRouter = typeof uploadRouter;

Copy
Copied!
Create an API route using the FileRouter
src/app/api/uploadthing+api.ts
import { createRouteHandler } from "uploadthing/server";
const uploadRouter = { ... } satisfies FileRouter;
export type UploadRouter = typeof uploadRouter;
const handlers = createRouteHandler({
  router: uploadRouter,
  // Apply an (optional) custom config:
  // config: { ... },
})
export { handlers as GET, handlers as POST }

Copy
Copied!
See configuration options in server API reference

Generate typed hooks
Unlike the other UploadThing packages, the Expo package does not include any prebuilt components. Instead, we provide some helper hooks to help interact with the native file pickers.

*src/utils/uploadthing.ts
import { generateReactNativeHelpers } from "@uploadthing/expo";
import type { UploadRouter } from "~/app/api/uploadthing+api";
export const { useImageUploader, useDocumentUploader } =
  generateReactNativeHelpers<UploadRouter>({
    /**
     * Your server url.
     * @default process.env.EXPO_PUBLIC_SERVER_URL
     * @remarks In dev we will also try to use Expo.debuggerHost
     */
    url: "https://my-server.com",
  });
*
Copy
Copied!
Use the FileRouter in your app
src/routes/index.tsx
import { openSettings } from "expo-linking";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useImageUploader } from "~/utils/uploadthing";
export default function Home() {
  const { openImagePicker, isUploading } = useImageUploader("imageUploader", {
    /**
     * Any props here are forwarded to the underlying `useUploadThing` hook.
     * Refer to the React API reference for more info.
     */
    onClientUploadComplete: () => Alert.alert("Upload Completed"),
    onUploadError: (error) => Alert.alert("Upload Error", error.message),
  });
  return (
    <View>
      <Pressable
        style={styles.button}
        onPress={() => {
          openImagePicker({
            input, // Matches the input schema from the FileRouter endpoint
            source: "library", // or "camera"
            onInsufficientPermissions: () => {
              Alert.alert(
                "No Permissions",
                "You need to grant permission to your Photos to use this",
                [
                  { text: "Dismiss" },
                  { text: "Open Settings", onPress: openSettings },
                ],
              );
            },
          })
        }}
      >
        <Text>Select Image</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  button: { ... },
});****