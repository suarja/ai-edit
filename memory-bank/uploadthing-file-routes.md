File Routes
File Routes are the routes you create with the helper instantiated by createUploadthing. Think of them as the "endpoints" for what your users can upload. An object with file routes constructs a file router where the keys (slugs) in the object are the names of your endpoints. You can name your routes whatever you want, preferably something that explains what the route does, e.g. profilePicture, resume, messageAttachment, etc.

Below you can see an example file router with a few routes:

import { createUploadthing, type FileRouter } from "uploadthing/server";
const f = createUploadthing();
export const uploadRouter = {
  // Example "profile picture upload" route - these can be named whatever you want!
  profilePicture: f(["image"])
    .middleware(({ req }) => auth(req))
    .onUploadComplete((data) => console.log("file", data)),
  // This route takes an attached image OR video
  messageAttachment: f(["image", "video"])
    .middleware(({ req }) => auth(req))
    .onUploadComplete((data) => console.log("file", data)),
  // Takes exactly ONE image up to 2MB
  strictImageAttachment: f({
    image: { maxFileSize: "2MB", maxFileCount: 1, minFileCount: 1 },
  })
    .middleware(({ req }) => auth(req))
    .onUploadComplete((data) => console.log("file", data)),
  // Takes up to 4 2mb images and/or 1 256mb video
  mediaPost: f({
    image: { maxFileSize: "2MB", maxFileCount: 4 },
    video: { maxFileSize: "256MB", maxFileCount: 1 },
  })
    .middleware(({ req }) => auth(req))
    .onUploadComplete((data) => console.log("file", data)),
  // Takes up to 4 2mb images, and the client will not resolve
  // the upload until the `onUploadComplete` resolved.
  withAwaitedServerData: f(
    { image: { maxFileSize: "2MB", maxFileCount: 4 } },
    { awaitServerData: true },
  )
    .middleware(({ req }) => auth(req))
    .onUploadComplete((data) => {
      return { foo: "bar" as const };
    }),
} satisfies FileRouter;
export type UploadRouter = typeof uploadRouter;

Copy
Copied!
Since 5.0
Route Config
The f function takes two arguments. The first can be an array of FileType, or a record mapping each FileType with a route config. The route config allow more granular control, for example what files can be uploaded and how many of them can be uploaded for a given upload. The array syntax will fallback to applying the defaults to all file types.

A FileType can be any valid web MIME type ↗. For example: use application/json to only allow JSON files to be uploaded.

Additionally, you may pass any of the following custom types: image, video, audio, pdf or text. These are shorthands that allows you to specify the type of file without specifying the exact MIME type. Lastly, there's blob which allows any file type.

A route config can have the following properties:

Name
maxFileSize
Type
FileSize
Default: 4MB *Since 5.0
Description
The maximum file size for a file of this type. FileSize is a string that can be parsed as a number followed by a unit of measurement (B, KB, MB, or GB)

* The default max file size depends on the file type. 4MB is the default unless using one of the custom file types:

File Type	Default Max Size
image	4MB
video	16MB
audio	8MB
blob	8MB
pdf	4MB
text	64kB
Name
maxFileCount
Type
number
Default: 1Since 5.0
Description
The maximum number of files of this type that can be uploaded.

Name
minFileCount
Type
number
Default: 1Since 6.8
Description
The minimum number of files of this type that must be uploaded.

Name
contentDisposition
Type
inline | attachment
Default: inlineSince 5.7
Description
The content disposition to set on the storage provider. Content disposition indicates how the file is expected to be displayed in the browser. Read more about content disposition on MDN ↗.

Name
acl
Type
public-read | private
Since 6.0
Description
The ACL to set on the storage provider.

ACL can only be overridden if you have enabled the "Allow Overriding ACL" setting on the UploadThing dashboard. Attempts to override the ACL without enabling this setting will result in an error.

Since 7.0
Route Options
The second argument to the f function is an optional object of route options. Route options are shared configurations for all file types in a route. These configurations are not bound to a specific type of file that is uploaded, but will apply to the entire route.

Name
awaitServerData
Type
boolean
Default: trueSince 7.0
Description
Set this to true to wait for the server onUploadComplete data on the client before running onClientUploadComplete.

The f function returns a builder object that allows you to chain methods that will run during the upload process.

import { z } from "zod";
f(["image"])
  .input(z.object({ foo: z.string() }))
  .middleware(async ({ req, input }) => {
    input;
    // ^? { foo: string }
    return {};
  })
  .onUploadError(({ error, fileKey }) => {})
  .onUploadComplete(async (opts) => {});

Copy
Copied!
Since 5.0
input
You can pass a schema validator to validate user input from the client. This data comes from the client when the upload starts. If validation here fails, an error will be thrown and none of your middleware n'or onUploadComplete functions will be executed.

Historically, only Zod ↗ was supported, but since uploadthing@7.4 the following validators are supported:

Zod >=3 ↗
Effect/Schema >=3.10 ↗ is partially supported with the following limitations:
Top-level schema must be of type Schema.Schema
Must not be wrapped (e.g., no optional<Schema.Schema> or optionalWith<Schema.Schema>)
Standard Schema specification ↗, for example Valibot >=1.0 ↗ and ArkType >=2.0 ↗
The schema's input type must only contain JSON serializable types as UploadThing does no special data transforming to handle non-JSON types. You may do transformations yourself, for example z.string().transform(Date) is valid where as z.date() is not.

The input is validated on your server and only leaves your server if you pass it along from the .middleware to the .onUploadComplete. If you only use the input in the middleware without returning it, the Uploadthing server won't have any knowledge of it.

Since 5.0
middleware
This is the function where you authorize a user to do an upload. You can also tag the upload with metadata here. Example using Clerk:

import { currentUser } from "@clerk/nextjs";
import { UploadThingError } from "uploadthing/server";
f(["image"])
  .middleware(async ({ req, res }) => {
    const user = await currentUser();
    // Throw if user isn't signed in
    if (!user)
      throw new UploadThingError(
        "You must be logged in to upload a profile picture",
      );
    // Return userId to be used in onUploadComplete
    return { userId: user.id };
  })
  .onUploadComplete(async ({ metadata }) => {
    console.log("Uploaded by user", metadata.userId);
  });

Copy
Copied!
Note: By default, a thrown UploadThingError's message will be sent to the client's onError. All other errors are turned into generic failure messages to avoid leaking sensitive information. Read more about error handling here.

As of v6.4, you can also tag your metadata using the UTFiles symbol to override the uploaded files attributes. This can be used to either rename the file, or set a custom identifer for the file:

import { UTFiles } from "uploadthing/server";
f(["image"])
  .middleware(async ({ req, files }) => {
    const fileOverrides = files.map((file) => {
      const newName = sluggify(file.name);
      const myIdentifier = generateId();
      return { ...file, name: newName, customId: myIdentifier };
    });
    // Return userId to be used in onUploadComplete
    return { foo: "bar" as const, [UTFiles]: fileOverrides };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // The UTFIles symbol is stripped from the metadata
    metadata; // { foo: "bar" }
    file.customId; // myIdentifier
  });

Copy
Copied!
Since 5.5
onUploadError
Called when an error occurs during the upload process.

The function is called with a single object argument with the following properties:

Name
error
Type
UploadThingError
Since 5.5
Description
The error that occurred.

Name
fileKey
Type
string
Since 5.5
Description
The key of the file that failed to upload.

Since 5.0
onUploadComplete
This is the function you use to do something with the uploaded file, such as persisting it to your database. Whatever you returned in the middleware will be accessible here. Please note that onUploadComplete is the end of the chain, each route must have one and it must be the last method in the builder chain.

As of v6.0, you can return JSON serializable data from this function, which will be passed to the clientside onClientUploadComplete callback.

The function is called with a single object argument with the following properties:

Name
metadata
Type
Generic
Since 5.0
Description
The metadata that was returned from the middleware function.

Name
file
Type
UploadedFileData
Since 5.0
Description
An object with info for the file that was uploaded, such as the name, key, size, url etc.