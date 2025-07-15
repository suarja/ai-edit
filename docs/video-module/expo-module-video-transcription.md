Hi friends, this is a special video, one I'm 
really excited to share with you. Expo modules are one of the most powerful tools in the React Native 
ecosystem. And today we are going beyond just how to create one. I want this to be a complete 
resource that shows you what Expo modules are, why you should care, how they work, and who's 
using them. All in a way that's approachable even if you are new to native development. 
Then we'll dive into building a real native   module step by step, unlocking advanced native 
APIs like Apple's ondevice foundation models in iOS 26. If you ever wanted to go beyond 
JavaScript and feel confident bringing   any native feature to your application, 
this video is for you. Let's get into it. Okay, let's start with the basics. The Expo 
Modules API lets you write Swift and Kotlin   code to create native modules and views 
that integrate seamlessly into your React Native application. It's designed to minimize 
boilerplate, work consistently across iOS and Android, leverage modern language features, and 
deliver the performance needed for realworld, high-frequency native calls. All Expo 
modules are fully compatible with the   new architecture, and they work out 
of the box in existing applications. No need to worry about compatibility. Even 
better, the API is actively maintained by   the Expo SDK core team. These are some of 
the smartest engineers in the ecosystem, and you can trust this API will be 
around and improving for years to come. Sometimes you need a native feature that no 
existing library covers. Or maybe you just   want full control over how your model works. 
That's where custom expo modules come in. Take the foundation models API for example. 
It requires you to define generables,   the structure of the data you want the local 
LLM to generate and you have to define this directly in Swift. In this case, writing a custom 
Expo module makes perfect sense. The good news, Expo modules are built to integrate seamlessly 
with the Expo workflow. Whether you're using   development build, pre-build, or continuous 
native generation, no extra configuration needed. Just import your module where you need 
it and you're good to go. But wait, there's more. Even if you are not using Expo in your React 
Native project, Expo modules are still likely your best option. They work great in plain React 
Native projects, too. And if you want inspiration,   just check the Expo repo with over 100 production 
ready modules powering apps like Bluesky, Starlink, Coinbase, Notion Calendar, 
Brex, and many, many more. By the way, Bluesky is open source and they have great expo 
modules. My favorite one is the bottom sheet. Okay, so let's dive into what you're going to need 
to follow along with this video. You need to have   an Apple developer account to be able to download 
the developer beta. You need XO26 and iOS 26, preferable a physical device with Apple 
intelligence enabled. You need to be familiar with Apple Foundation models, so I would 
highly recommend to watch the WWDC video that I'm going to leave in the description. That's all you 
need. I'm extremely excited to start this video,   guys. So, I would highly recommend that 
you follow along with me if you really want to learn how to master expo modules. 
Now, let's get started. To get started,   go ahead and clone the repo that I'm going to 
leave in the description. Um, so just come here, copy the link, clone it, and then switch from 
main to the branch video tutorial starter. This is an app that already works but doesn't have 
the module that we're going to create, and it's perfect to get started. Once you clone the project 
and switch to video tutorial starter branch, let's go ahead and install dependencies using bun. 
Now let's go ahead and pre-build the project. So I'm going to say npx expo prebuild and hit enter. 
This is going to generate the native projects for iOS and Android. And you can see the folders on 
the left. We are using CNG or continuous native generation. Meaning that we don't need to track 
these projects because we are autogenerating   them each time that we run this command. The next 
thing that I want to do is open this iOS project in Xcode. A shortcut for that is running XED iOS. 
This is going to open Xcode. Just make sure that you're using the Va version. So if I press command 
comma um this is going to open the settings of Xcode and you can just double check that you are 
using the Xcode beta 26. Then select your project on the left. Go to sign in and capabilities and 
select your Apple developer team. And just to make sure that everything is working. Let's select my 
iPhone. In this case it's already there iPhone 15   Pro Max. And let's press play. Okay. And the build 
is successful. It is installing on my device and it is using the development client. Let me just 
go ahead and close it. Since I changed the bundle   identifier, now I have foundation starter and 
foundation app as different applications. And it's great because this one is using the development 
client which allows us to go and change the   JavaScript and enjoy of hot reloading. And the 
other one is a standalone application which works without any server running. Perfect. So now this 
is actually not working because we need to have the local server running. So let me replace Xcode 
with VS Code. So back to our project. Now let's run npx expo start to start the server. It's using 
a development build of course. Now we just need to scan this QR code. So I'm going to open my camera 
and scan this QR code. Let's allow access to the network so that we can connect to this local 
host. And if I reload, this should work just fine. Awesome. And we have our application running. 
Great. With the native tabs and everything right now, it says that it's not available. And this is 
because um I'm just showing hardcoded data right now. But this is like the skeleton and UI of our 
application. Nothing is going to work. Of course, if I go to basic generation and start typing stuff 
and press generate, nothing is going to happen. We don't have a native module yet. With this 
setup, we are more than ready to start developing our native module. So let's go ahead and stop 
the server for now. Okay. So now that we know   that our application is working, we are ready to 
start implementing our module. To create a module locally in your project, you can run bun x create 
expo module with the flag local. This is going to be a custom module just for my application. So 
that's why I'm going to be having it locally. And it's also a good way to start any module 
if you decide to open source it later. You can just abstract it from your codebase. But this 
is a good starting point. I'm running bun x   since I'm using bun. But if you are just using 
npm for example, you can run npx create expo module with a flash local. So let's go ahead and 
hit enter. This is going to ask the name of your module. In this case, my module is going to be 
named expo foundation models. Let's type this name and hit enter. And from here, I recommend 
just selecting the defaults. It's going to ask you the native module name. We need an Android 
package name. Let's hit enter. And that's it. We have successfully created an expo module. And 
on the left now, I have this folder modules. And inside of it, we have the boiler plate of a new 
expo module. By default, this module is already compatible with iOS, Android, and web. So if you 
look at it, we have this web view and web module. This is for web only usage. Let's take a look at 
the iOS folder. And this is the module. Basically, this is how we can declare a module just by 
using the expo module score in Swift. And we can do the same on Android. If you look at the 
Android module, it's pretty much the same thing but using Kotlin instead of Swift. Um but in 
today's video, we're going to be focusing on   Swift. Just by looking at this module, we get a 
bunch of information like the name of the module, how we can declare constants, how we can declare 
events that are happening on the native side of of my application and how we can access them on the 
JavaScript side of the application. And then we have functions, async functions, and even a view. 
So let's take a look at the hello function. This is swift code, right? And we are defining this 
hello function. So if we go to the expo foundation modules module TypeScript file, you can see that 
we are declaring this hello function as well. Meaning that if I now go to my index screen, this 
is the home screen that we're seeing on the right. And after the examples title, I'm going to have 
a button that says check availability. And let me start the server. Let me refresh the application. 
Okay, now I have this check availability. Uh but I'm going I'm going to rename this to be check 
hello function and hit save. So in the on press we can say expo foundation and let's hit enter 
to autoimp import and this is my module. So now I can say dot and I'm going to get access to all 
the methods that we are defining in this module. And you can see here the hello function. So if I 
just call this function, this actually returns a string as you can see here. Um so we can actually 
put this in the console. Let's store the value in this variable and then say console log value 
and hit save. All right. And now as you notice something weird happened and this is because 
since we created native code we cannot use live reloading right now. We need to create a new 
build of our application and pre-build again so that the new build contains the native code 
that we just created. But just for fun, let's open the the console. And you can see the error here. 
Cannot find native module expo foundation modules, which makes perfect sense. And if I try to 
just press this button to check availability,   nothing is going to happen. So let's go ahead and 
recreate our application. So I'm going to stop the server. And this is how we iterate each time 
that we make native changes in our application. Let's close Xcode again. Let's go back in here 
and say MPX expo prebuild. You can specify the platform if you want to just pre build for 
iOS. I'm going to say PIOS. And that's it. Now, a pro tip. I would recommend that you 
always prebuild with the clean flag. This is going to basically remove the previous 
iOS folder and regenerate it again to prevent any cache. Now from here we can open again Xcode 
um using exit iOS to open the iOS folder or you can run it directly on your device. An alternative 
to run it on your real device is running npx expo run iOS and then specify the device. You can pass 
the name of the device. Um, so to get the name of your device, you can just connect your iPhone 
and then go to the locations, select your iPhone, and this is going to tell you the exact name of 
your iPhone. In my case, Betos iPhone 15 Pro Max. Let's copy that, paste it in here, and select it 
as the device that I want to run this build. So, let's hit enter. And now the build is in progress. 
Okay. And the build was successful. Let's see if it launches my iPhone. Okay, there we go. and it's 
going to load it automatically. So that's a way of building it if you don't want to open Xcode. 
But actually I would highly recommend to use Xcode since when we open Xcode we actually can see 
syntax highlight when we are writing Swift code. But it's good to know that you can also do that. 
Okay. So now we have revealed our application.   That means that now we have access to the native 
module that we just created just by importing it, right? just by calling it in here. This is our 
module and if I search for it, we are importing   this from uh the foundation models. So let's open 
the console and now let's check hello function. And each time I press the the button we get the 
hello world. So what is actually happening under the hood is that we are calling the native 
implementation of this hello world function. So if you have made it this far, congratulations. 
At this point, you have integrated a native module into your Expo project. So on the left inside 
my modules folder, let's go ahead and remove the Expo Foundation modules view. We don't have 
any views right now. Everything is going to be a module right now. So let's move this to the trash. 
And as well, let's remove the web implementations. Since we are not going to be using this module 
on the web, let's just go ahead and remove it to   keep things simple for now. Let's go to the Expo 
modules config JSON and let's remove web. Let's just keep Apple and Android. Let's remove this 
Expo Foundation models view tsx. We are not going to be compiling this on Android but if you want 
we can also remove the expo foundation models view Kotlin file. Now let's go to the types and on the 
types I want to actually remove everything that we have in here and let's remove the imports. 
Let's hit save. Let's go to the module. Let's remove these functions that we are declaring 
here. Okay. So, this is how it looks. We are still importing our types and exporting the class. 
So, but nothing is in there. Let's go to the index and let's remove this view. Let's just keep things 
super simple like this. Okay. Once that's done, let's close everything. Now, if I go back to my 
index and import all as expo modules module like this. If I come down here now, we're going to get 
a warning that says that the hello world function is not implemented because we just deleted it. 
So, let's go ahead and remove it. Okay. So,   now we are ready to start developing in Xcode. 
Let's stop the server. Let's clear the terminal and open the iOS folder in Xcode again. All right, 
just let's make sure that everything is looking good. I'm going to select my Foundation starter on 
the left. And if I go to signing in capabilities, everything looks good. Now to access the 
source code from our native module, we can select the pods on the left. The development pods 
folder contains the source code of all the native modules used in our application. So as you can 
see, we already have a bunch of uh expo modules. But if you take a closer look, we have the Expo 
Foundation modules folder, which is our module, our custom module that we just created. And as 
you notice, this is red because we just deleted   the view. But that's fine. Let's just double click 
on the foundation modules. And this is our native module. And like I said before, now at this time, 
I get syntax highlight because I'm using Xcode. And now I can enjoy of type safety. And now this 
is actually complaining because I deleted the view file which makes total sense. So what I want to 
do here is just go ahead and delete everything to start fresh. Uh we can leave the name. Let's 
delete the events functions and everything else. Okay. Now on the left I'm going to right click in 
here and delete this file to remove the reference. All right. And now we're ready to actually start 
working on our module. If you have any questions   about anything that I'm going to be doing right 
now, I would highly recommend to come to the expo documentation under Expo modules API. We have 
the reference and you can check the module API reference and if you want to learn more about 
each specific uh thing that we are doing for   example the name, it says the name of the module 
and things like that. You can come here and learn everything. But one thing that I want to focus 
right now and actually we're going to start doing   is define records. Records are basically the way 
you type your module. When I'm creating a native module, I like to think that I'm basically doing 
kind of like an API for a backend. And I need to declare the structure that I'm going to be sending 
to the client side. And you can think of it like the native side being the back end and then the 
JavaScript side being the front end. So we need   to declare the data that we're going to be sending 
to the client right from native to JavaScript. And the Expo modules API allows you to construct 
this complex data structures to have a fully typed native u structure by using this record property. 
So we can actually copy this example if you want to. So to keep things simple on the left, let's 
select the expo foundation models and I'm going to press command N. This is going to create a 
new file. Let's just select a regular Swift file and press next. The name of my file is going to be 
records. This file, of course, is going to contain all the types or records that we're going to be 
sending to the JavaScript site. Under targets, make sure that Expo Foundation models is selected. 
That's all we need actually. So, let's go ahead and create. And now we have this records file. 
And we can actually drag it to have it in here. And this is my file where where I'm going to be 
declaring the types. So we can paste the thing that we copied before. Now since we're going to be 
using record, we need to import expo module score. Sounds good. Now instead of having this name, 
I'm going to rename this to be foundation models availability. So let's start with a boolean 
is available. And it's a good idea, guys, to always initialize these variables. So by default 
this is going to be false. This is actually good enough at this point. If you want you can just 
keep a boolean to validate if it is available   or not. But we can go further than that. We could 
even have a field with the reason why this is not available. And this could be an optional string. 
And I'm going to initialize this to be nil. Let's define more fields. We can have a variable 
like device supported which is a boolean. We can initialize this to be false. And we can even 
do more complex things. Let's declare a variable that is going to return the operating system 
version. So let's call this OS version. This is not optional. And I want to initialize this to the 
version of the iPhone. So we can actually access that super easily by using the process info dot 
process info dot operating system version string. This is a string containing the version of 
the operating system on which the process   is executing. So just like that we are able to 
access the native stuff right and we can actually put that as an initial value on a record which is 
amazing. You can add more fields if you want but right now this is good for me. Now I can actually 
use this foundation models availability to type my function for permissions or to see if we actually 
have the foundation models available. Since Apple foundation models is going to be available on the 
latest devices, many iPhones and all devices won't have access to this feature, right? So we need 
to make sure that we can validate that the LLM is available before we can actually use it. And this 
is the purpose of this function. So let's declare an async function and the name for this function 
is going to be check availability. In swift we can declare the return type of a function just by 
calling the record that we created here which is foundation models availability. And this is like 
this okay foundation. Okay. So this ensures that now we have type safety on the native side. And 
now of course Xcode is complaining because we are not returning the foundation models availability. 
So I can say return. So if I say return foundation models availability like this, this is going to 
return the record with the initial values. False false. But we actually want to run logic in here. 
Right? So to keep things clean, instead of just doing my logic inside this async function, we 
can actually create a new file or we can do it down here. So let's create like a section in Swift 
or Xcode. You can mark sections like this. So I'm going to say foundation models availability check. 
And then let's create a function. So I'm going to   say private. In Swift to declare a function you 
just say funk and I'm going to call this get foundation models availability. And I have nice 
autocomplete which is cool. Uh so we are fully typing the return value of this function is the 
record that we defined before. But actually this function is going to be an async function. So we 
can just add here async. And this is where things get interesting. At this point we're actually 
going to start using the foundation models from   Apple. And if you want to learn more about how you 
can actually start using this. You can check out their documentation. This is in beta right now as 
you can see here and you can see the usage of this module. Uh but what we need to do here is come at 
the top of our uh file and import foundation and foundation models when we're going to be using 
them. Okay. Now at this point what I want to do   is start initializing the data or the record that 
we are going to return. So we can save this into an availability variable. we are initializing a 
new record and then we can overwrite the default values that we define in here based on the actual 
availability on the current device. So we need to check if available this is going to be available 
only on iOS 26 and Mac OS 26 as well. This is how you can validate the availability on Xcode. 
So let's grab the system model by using the system language model dot default. Then let's 
grab the variable is available and we can now use this system model that we initialize. So I can 
say is available. We also have this availability supported languages. So now I just the thing 
I care is this boolean if it is available or not. And if you press option click you can double 
check that the value of this is boolean. And once we are sure that this is a boolean, we can graph 
our record in here. We can say availability dot is available equal to this variable in here that it's 
actually going to contain yes or not depending on the device. Then we can say availability device 
supported equal to true. So at this point I'm initializing it to true. But actually if if is not 
available we can overwrite the availability reason equal to the device does not support foundation 
models. This is totally optional of course if you want you can just return the volume value. But 
yeah otherwise I can say availability reason and actually this else is going to be for this if 
statement. So I can put it in here. So if the user does not have iOS 26, the error is going to 
be foundation models requires iOS 26. Otherwise maybe the user is actually using iOS 26 but 
they don't have Apple intelligence enabled for example. So in that case the error is going to 
be the device does not support foundation models.   You can change the message if you want to. And 
then finally we can return our availability. And let me just close this. And this is our function. 
Super simple. Now we can come here and instead of returning this structure I can say return await. 
Remember that this is an async function. Let's call it get foundation models availability. 
As clean as that guys now I can actually save this and we need to rebuild the application. So 
I'm just going to press play to rebuild it on my iPhone 15 Pro. While this is building I'm going to 
switch to VS Code. I'm going to start my server. And let's minimize the console. And now let's go 
to the module in my types inside source. In here, I'm actually going to delete this type and declare 
a new interface that is actually going to match exactly the record that we just defined on our 
module. This provides fully type safety on the JavaScript side or DScript side. Let's go to the 
foundation model. We don't have events anymore. Let's delete that. Let's delete this in here as 
well. Now, this looks cleaner. And inside this class, we can start defining the actual functions 
that we just created. So, if I go to my uh Swift Foundation models again, I can just copy the name 
of my function, which is check availability. Come back in here and declare it. It is going to return 
a promise with the foundation models availability. All right, let's hit save. Now we are type saved 
on the TypeScript side as well. And we're actually ready to start using this because the build is 
ready. So let's go to the settings screen. If I go to the settings screen on my phone right 
now, you can see that available says no. And   we can start using our stuff. So instead of 
having this any, I can use the uh type that we just declared foundation models availability 
for my state variable. And we can import this from our module like this. This is coming from the 
types. And now we can call the function when the component mounts using a use effect like this. 
So let's import use effect from react. And then let's import as well our foundation model like 
this. So once we import the foundation model, we are going to have actually fully type safety 
with my function get availability. And if I hover, I can see that this is a promise that is going 
to return the foundation models availability data structure. So once we get that, we can set 
the availability to the state and then we are just using the availability to rec uh to you know 
populate our UI. So let's hit save and suddenly on the right I get real data. Device is supported. 
OS is version 26 and it is available. So, how cool is that? And it was super easy, honestly. 
And it's super enjoyable to me being able to declare my records, being able to have fully type 
safety across native and TypeScript. It's just an enjoyable experience building a native module like 
this. And this is actually going to be super fast.   So, if I refresh the application, as soon as I go 
to the settings screen, notice that it says yes by default. So this runs instantly. Okay. Now at 
this point we can actually start using the local LLMs. So let's start with the basic generation 
and from here we can repeat the process guys. So let's go back to the records. Let's define the 
data that we are going to return for our next uh functionality which is the basic generation of 
text. This is simple. We are not streaming data yet. So for this I'm going to declare a couple of 
records. First of all, uh when we handle a basic generation, we're going to get a prompt from the 
user, right? So I'm defining the record for the prompt. It's generation text request. It's going 
to get a prompt of type string and by default it's going to be an empty string. Then once we use 
the local LLM, we are going to return a response. So in this case I decided that for the response 
of the LLM I'm going to have the token count and the generation time just so that we have you know 
some data to show. This is the metadata and apart from that I'm going to have the generation text 
response which is what returns my function. It's going to return the content that the LLM returned 
which is a string at the beginning is going to be an empty string and then the metadata which is 
going to be of type generation text metadata   which is this record that we define it in here and 
you can see now that we can define very complex data structures using the records from expo 
modules. So I'm defining the data and finally I'm adding this optional error initializing it to 
be new. Pretty solid stuff. So let's go back to uh to here and I'm going to minimize this get 
foundation models availability and let's go ahead and create a new function. Same stuff guys 
we can declare a new async function. In this case I'm going to call it generate text. It's going 
to get a request. In this case as you notice now the parentheses are not empty. And now I'm 
defining that this function gets a request of type generation text request and then returns a 
generation text response. Now finally I'm calling the generate text function passing the request. So 
of course this is complaining because we need to create our function. So we can do the same thing 
private function get text. This is going to get the request and it's going to return the response. 
So we can actually do pretty much the same thing. Let's initialize a new response record by saying 
let response equal to generate generation text response. This is going to contain the values. 
Now based on what the model response we are going to overwrite the defaults and then return that 
right. So so that u to stop the complaints here. Let's just go ahead and return the response like 
this and this should get rid of it. All right. So   same thing we need to check that the foundation 
models are actually available and we're using iOS 26. Otherwise we can return the same error. 
So in this case if the user is not using iOS 26 I'm going to set my error to be foundation models 
requires iOS 26. Okay. And then we return the text response. So let me actually rename this to be 
text response. And let's rename this as well. And actually I can just remove this and put it inside 
of here. And this should work. Now inside this I'm going to create the equivalent to a try catch. 
And we can do that in Swift using a do catch. So I'm going to say do catch like this. And then 
let's put the return inside the do. All right. And let's start defining our variables. So start 
time is going to be equal to a date. So I'm going to count the time that it takes to for the LLM 
to respond. So we need to keep track of when it started. Let's get the prompt initialized. This is 
going to take the prompt. So we can grab this from the request prompt. And if you take a look at this 
prompt just so that everyone is on the same page, this is just a structure that represents a 
prompt for the local LLMs. And then we need to create a new session or to use the local LLM. 
So let's create this session equal to language model session. This is an object that represents 
a session that interacts with the language model. Once we initialize the session, we can pass the 
prompt by saying let response equal to try await. Let's use the session. And the session comes 
with uh a lot of stuff like streaming responses or just a simple respond to and then we can pass 
a prompt which is this variable that we define in here and that's pretty much it right. Uh so this 
is actually going to throw an error in case there is something wrong and we are going to catch it 
in here and set the error based on what happened and then return the response. That's pretty much 
it. Now once we get the response we need to store it in our text response but after that I want to 
keep track of the end time and then let's declare a variable to store the generation time which 
is going to be end time dot time interval time interval since and this gets a date which is the 
start time. Then let's try to calculate the number of tokens. So I'm going to have this variable oops 
let token count which is going to be equal to the response content count. So if you say response 
dot you get the transcript entries or content and then the content is going to have count hash 
value and stuff like that. So I'm just grabbing the count and divided by four. This is to get a 
rough estimate. And then finally we can say text response dot content equal to response.content 
text response do metadata. We need to initialize the generation response metadata. This is going to 
get the token count which is the estimated count and the generation time which is the generation 
time. And if you are wondering where is this coming from, this is actually a record that we 
define in here and we are just initializing it in line instead of doing this thing and then override 
each property. You can also call it like this and then pass each variable. So we are setting that 
into the metadata of the response and finally we can return the response. And that's it. Another 
beautiful and clean function in our module that we can simply call in the async function here. 
generate text. Now we have added native code which means that we need to rebuild our application. 
So let's press play and let's go back to VS code. Let's repeat the process guys. First of all 
I want to go to my types. Basically it's the same thing. We need to generate the types. In this case 
I'm going to create an interface for the request. It gets the prompt and then an interface for 
the response which contains the content metadata and all the stuff that we are returning from the 
native side. So let's go ahead and hit save. Let's go back to our module. And now we should have 
access to the generate text function which takes in the request. Let's import this from the types 
and returns the generation response. Cool. So let's hit save and now we are good to start using 
it. So if we go to the screen basic generation in here we can start typing the response for 
example. Right now nothing is working. So let's go ahead and type the response to be the generation 
response. Let's import this from the generation response expo foundation models. From here it's 
just a simple matter of typing the prompt. we have a variable when it's loading and that's pretty 
much it. Now I have this function that I call each time that we press the generate button here. 
So if I go to the basic generation I have this generate right and if I type test it is enabled. 
So when I press this text this generate button I'm calling this function. So the first thing that 
I want to do is just a try catch. I'm setting my variables to be loading error equal to null. 
Set response equal to null and then we can call our expo foundation models module. Let's import 
this. And now I have access to the generate text function which takes the prompt as a parameter. So 
let's pass this variable from the state and just trimming it. And this is uh going to return the uh 
response. So we check if we have an error, we are setting the error. Otherwise, we set the response. 
And that's pretty much it. Now in the UI, I'm just having a text input. When we change this, 
we set the prompt. And when we press the button, we call the function. That's pretty much it. When 
it's loading, I show the generating uh and finally the response. And finally, uh, if I keep scrolling 
down, you can see that we have an error, we show an error. Otherwise, if we have the response 
and it's not loading, I'm going to be showing   the response with the content. Again, guys, this 
is fully typed. So, I can say response.content metadata. I actually know that the content is 
always going to be there. The error is optional, so you can validate accordingly. Uh, but yeah, so 
let's hit save. And now, let's test if this works. I'm going to call generate. And you have the 
response from the model. It took 12 tokens, 1.3 seconds. And then I can start asking more complex 
questions like fun fact about Mars. Let's start generating. And it generates like a good amount of 
text. And it's still pretty fast. At this point, I don't think we really need streaming, but 
things actually get kind of I would I wouldn't say it's slow, but for example, if you ask for 
tell me a story and then generate each time that I ask tell me a story, it actually takes time to 
generate and we don't have any feedback. It looks like something went wrong, but after a moment, 
once this is done, we're going to get the chunk of data. as you can see there. So this is how it 
looks a bunch of data. So in this case it would be nice to have streaming so that we know when this 
is happening. If we go to the release build that I created under streaming chats, if I say tell me 
a story, you notice that this is actually super fast to react. And it takes time because it's 
generating a bunch of stuff, but we can actually have uh an instant response and start reading 
it. Okay, let's cancel this. And then I almost forgot about structured data. So let's actually 
do structured data and then streaming. Okay,   so let's do structured data quickly. Let's go back 
to Xcode. Let's do the same thing, guys. Let's declare some records for the response that I'm 
going to be handling here. JavaScript side, we're going to pass the prompt, and then we're going to 
have metadata, which is basically the same thing   that we had before, which is the token count, 
the generation time, uh, and the model. This is actually totally not related, so we can actually 
just remove it. And then the response is going to have the data that I want to define. So let's 
define a record for the user profile that I want to generate. And this is how it looks. Metadata, 
it's the one that I define in here, the structured generation metadata. And then an optional error 
in case something goes wrong. So as you notice, we can start creating more complex records like in 
this case the profile record. It's going to have name, age, interest, location, and then we need 
to create the location record. So let's create the location record here where the location is just 
city and country and that's it. So these are my my records, the data that I want to return. We can 
hit save. If we go to the documentation of Apple, uh you can learn more about degenerables and 
basically are structures that you defined natively with the kind of data that you expect from the 
local LLM. So you can pass this macro guide with description about the field. So in this case you 
can have search terms which is going to be a list of suggested search terms and then you can also 
define like the count of how many you want passing the type in this case search term and you can find 
more complex stuff like search term is going to have an ID and then it's going to have a search 
term and then define another description for the search term. In this case, we can say to the LLM 
uh this this search term needs to be two or three words search term like beautiful sunsets. You can 
provide examples to have better results. So let's use these generable bolts in our application. 
Let's go back to the project. I'm going to select   my expo foundation models folder and just press 
command end to create a new swift file and I'm going to call this file generable data structures. 
Uh notice that the target is expo foundation models. Let's press create. And let's move this 
up in here. And let's define the generables. Let's import foundation models. And then we can define 
the structure like this. So if it is available on iOS 26, we just call the generable. This is coming 
from the foundation models. So as you notice, if I comment this line, it's going to start 
complaining. And from here I can just start   defining the properties of this structure like the 
user profile name and the description about this field like the user full name and you can you know 
specify first and last name for example right then the age the user age in years and as you notice 
each field you can provide a guide and the guide is actually optional and you can also combine more 
strokes. So let's create a location with guides like the city name. And we can say from the US 
only for example, right? And let's close this in here. We also need to pass the uh available here 
because this is only available on iOS 26. And this is how you can declare the general data structure 
for your specific needs in your application. And once we have this, we can just pass this structure 
to the LLM. So let's go back to the module. Now let's minimize the generate text function. Let's 
create another private function in here. In this case, we're using our types structure generation 
request and structure generation response. So let's initialize a variable for the response 
like this. Uh we can return the response so that it stops complaining. And then basically we 
can do the same thing that we did above. U so we can actually copy paste it. It's going to be a 
do catch. In case we have an error, we update the response with the error accordingly. In this 
case, something went wrong with the generation, right? If something goes wrong inside this 
if statement otherwise the error is that the   user is not using iOS 26. So inside the do let's 
prepare to prompt the LLM by creating a session and initializing the prompt. So here's the session 
using the language model. We are initializing the prompt from the request.prompt. And then we 
can grab the response from the llm by calling session respond to and then we can pass a second 
parameter generating. And this is going to be the data structure that we want the model to generate. 
In this case, I want the model to generate a user profile. So we pass this data structure in here. 
After we get the response, it's just a matter of setting the values of the response. So I'm going 
to paste this in here. So if I question mark this, this is going to return a user profile as you 
can see there. So I'm initializing this profile based on the content. And then we initialize a 
new record using the user profile record. And then we just map the properties. So the record 
name is going to be equal to the profile name, record age. So basically we are just passing the 
response to the type that we created before. Uh same with the location, same with the end date. 
It's the same thing that we did above. And for the token count, we can estimate the token count 
by calling this function. And this is another example of how you can start abstracting utility 
functions into another files. But in this case, I'm going to create this helper function that 
CHD created for me. It's just going to estimate the token count based on the record. We pass the 
record in here. And that's it. So we initialize it metadata as well. And finally, we return the 
response. So if I hit save, uh we're actually good to start implementing this. This is not super 
complicated. I guess this looks like a lot because   we are mapping a bunch of data, but this is custom 
data for our specific needs and business logic of the application, which makes total sense. It could 
be simpler for your case or maybe more complex, but you can abstract it in helper functions and at 
the end of the day, it's not going it's is going   to look not that bad, right? So let's minimize 
this generate structure data. And now we need to declare our async function in here. So basically 
the same thing the name is going to be generate structure data. We get the request. We return 
the response and we just call return await the generate structure data function passing the 
request. As simple as that. Now we are good to start using this in JavaScript land. So let's 
rebuild the app and switch to VS code. Let's go to the types. Okay. build is ready and should be 
working fine. Let's go. All right. And from here we can keep going, right? So I'm going to just 
define the request and response. This is the exact data that my model is going to respond. Okay. So 
I'm just grabbing this from my records from the native side. This is how my type looks like. And 
then we can go to the module and just call our new function. Let's import the types. It's going to 
return a promise of type uh generation request. And now we're good to start using it. So let's 
go to the structured data. And then we can start   typing the response, right? So this is going to be 
structured data. This is coming from our module. Then we can start using it in this function. When 
we call the generate structured data, I'm just calling my module with the generate structure data 
function that now it's fully available. passing the prompt and then based on the response we can 
set the error or set the result and at the end of the day I'm just displaying the result on screen. 
So let's try this out. Let's go to the starter uh let's go to the structure data and generate 
at 25 year old. Okay guys, so a little bit of bad news because I'm trying to test this uh generation 
structure data and I'm actually getting an error regarding the LLM pretty frequently. This one 
right here. And I think this has to do with being a beta version at this point. Uh because 
I'm testing right now on the streaming on the production one and I'm getting the same error and 
yesterday it was working. So I'm suspicious about Apple intelligence. And since this is a better 
version, well I'm not sure what's wrong. But let's keep moving on to the streaming chat. Uh hopefully 
this works for you. So the goal for this section is to basically have this functionality streaming 
chat just a simple response. And for this we're actually going to start using some more advanced 
features of expo modules like defining events uh and emitting events each time that we get a 
chunk of data from the local LLM. So let's start by doing the same thing. Let's start by defining 
the data that we're going to be sending to the   JavaScript side. So in my records, I'm going to 
paste some streaming records that I came up with, which is the request. Uh we're going to pass 
a prompt and session ID. And then for the uh session, we're going to have an ID for each 
session. And this is because when we start streaming, we need to keep track of if we are 
actually streaming data or if it's if something went wrong or if it's done streaming. So for 
that, I'm going to have this streaming session, it's going to have a unique ID and then the 
streaming chunk events. So each time that the local LLM is generating a chunk of data, we're 
going to send an event to the JavaScript side and use that. It's going to contain of course 
the data and then we can uh update the UI based on that. It's going to have the session ID, the 
content is complete flag, the token count as well. And some of these fields are totally optional 
like I said before. Then we have streaming error event the session ID and the error streaming 
canceled event. We want to provide the ability to cancel the streaming. So to do that, we need to 
pass the session ID and this is why we're also tracking the the session because we can cancel it 
from JavaScript. So we send this event and then we check if we're actually streaming on the native 
side, we can cancel the the session. And finally, we have the streaming chunk event. So what we 
are sending on each chunk, we are sending data, the session ID and the schema type is complete 
is partial. Okay, so this is how it looks. This is basically initializing a an empty JSON string. 
You can think of it. So once we have this, let's press save and let's go to the module. Okay, so 
after this function, I'm going to define a couple functions for the streaming implementation. Now 
since we want the ability to cancel each streaming session, I'm actually going to declare two private 
variables at the top of my module. one is going to be to keep track of all the sessions that are 
active. So, usually it's going to be just one. So, we're going to have that in an array of strings. 
And then we're going to store the active streaming task for cancellation. This is so that when we get 
a request to cancel a specific streaming session, we can check the streaming task and then if we 
have a session that is matching, we can cancel it. Okay. So, once we have these variables, 
I can come down here. Okay. And in this case, it is complaining because it's out of the scope. 
And I just realized that all these functions are outside of my module class. So let's put 
them inside. I'm going to just remove this closing curly brace and then put them in here. 
That way we should have access to these variables. Okay. So now we have this start streaming session 
function that is going to get this the streaming request and the streaming session. It's going 
to return the streaming session. So when we can press a button on the JavaScript side and 
start the streaming. Uh so for that we're going to need to start a session record. We define 
this in our records and then we are going to initialize a new language model session by getting 
a unique ID. So we can set the session ID for this specific session and then we create the language 
session. After that we we store the session in our uh record to keep track of it in case we need to 
cancel it later and then we can create a task for the streaming of the data. So we initialize 
the prompt based on the request prompt and then we call in this case string response from the 
session and this is a method that we can use from the foundation models to string response. So we 
can response to this specific prompt that we are initializing here and then we're iterating over 
the current content of the stream. In the loop we can check if the task is canled then we throw a 
cancellation error otherwise uh we continue. So the stream returns the full accumulated content 
each time meaning that it's not going to return just each chunk that we can append but it's 
going to return everything. Uh but you know   each time is going to be different. So we'll 
send the full content to JavaScript to handle it. So we can just calculate the current tokens. 
This is an estimate as well and then we send the full content as a chunk event. So we initialize a 
new streaming chunk event. we map each variable. So the important part here is the content which 
we are grabbing it from the loop in here. We're iterating for each uh current content in the 
stream and we are sending that as content. Okay. Now something very important here is that we are 
going to send an event once we get this chunk. And the event that that we're going to be sending, 
and this is actually a method from Expo modules that allows us to send this data each time on each 
stream, super fast to the JavaScript side. And the data that I'm sending is just the chunk event, but 
transforming this to a dictionary. And by the way, I almost forgot that after declaring my my 
functions in here inside my definition of the module, we can also define the uh events that 
we're going to be sending to the JavaScript site. So the event is on streaming chunk on streaming 
error on streaming cancel unstructured streaming chunk. And this is a different events for 
when we are streaming a structured data. I don't think we're going to have time to cover 
that but we can go over that in a moment. Uh but   anyways once we get the chunk we are sending it 
with the event on streaming chunk. So each time you're sending chunks chunks chunk sending events 
and once the streaming is completed we uh grab the streaming chunk event initialize it again and then 
just set it to be an empty content. At this time the the JavaScript side should have everything. 
Uh we set this to be complete and basically reset everything and send a final event on streaming 
chunk passing the competition event to dictionary as well. And then just clean up. Once everything 
is done just remove the streaming session from our uh map of sessions and the streaming task as well. 
We are going to remove the ID in case we have an error. we are just going to remove it as well 
from the sessions. And down here in case of an error when we're sending data, we are as well 
removing the sessions and also sending an event on streaming error. And the the data 
for this is going to be the error event uh to dictionary as well. And this is because we 
need to change this. We need to send this as a dictionary because sending events only accepts 
a dictionary of strings as you can see there. So that's it. Then after this we store the task 
for cancellation. This is while we are streaming and by finally we return the session. Okay, this 
is to start streaming. This is a function to start streaming and handles cancellation of course. So 
it adds the session to the to the records that we have and starts the streaming. And then we have 
another function to cancel the streaming session. This is going to take the session ID that we 
want to cancel. And then we check if it is in the   streaming task record. And if it is, we cancel it. 
Okay. And remove it from the uh map. And finally, we remove the session. So we can call the 
streaming session dot remove. And finally, we send an event on streaming cancel with the 
data cancel event. So now we have two functions to start streaming and cancel streaming. we are uh 
storing the sessions that we are handling. So now we can define these functions inside our module 
definition. We set the start streaming function that gets the streaming request and returns 
the streaming session. And then we expose as well this cancel streaming session uh which 
gets the streaming ID and returns void because it only cancels the session. Okay. And this 
should actually work for a simple response. We are not passing any generables yet. So we are just 
responding with the string response to this prompt that the user is going to send on the request. So 
let's reveal this and let's go back to VS Code. We can just define the same records on our types, the 
streaming request, the streaming chunk. Basically, it's the same thing but with TypeScript 
interfaces. So let's hit save. Let's now back to the module and then back in our module. 
Now we should be able to handle streaming events. We can fully type this by importing our types and 
our streaming session. So now we should be able to have this start streaming session and cancel 
streaming session. But if you remember we also define events. So let's go ahead and and define 
the events here in our module. And let's type this by importing from our types. So what we're doing 
here is just adding a listener for the event type and we are defining the events that we declare in 
our module on start streaming on streaming error and on streaming cancel. That way we can use these 
events to listen for changes and update the UI accordingly. So let's go ahead and hit save. And 
the perfect way to use this is creating a hook. So let's go ahead and create a hook that is going to 
abstract setting up the listeners and things like that. So I'll create this use foundation models 
hook and in here we can handle the state and updates depending on the events and functions. 
So let's walk through it quickly. I'm importing everything from my expo foundation models stream 
cancel type the chunk the error and the session. And then I'm just defining the state that we're 
going to be handling depending on the streaming.   So the content the session I'm typing this by 
the way if we are loading if we have an error the token count it's just state variables and then I'm 
defining two references one to the subscription ref and one to the ID ref. And then we can set up 
the listeners in a use effect. So we set the event listeners for the onstream chunk and the way 
we do that is just by calling the add listener and this is going to take the event listener 
that we want to type on stream chunk in this case and this is fully type by the way. So we can 
define it and then we know that this is going to get an event of type streaming chunk. Here's the 
type and then each time that we get a streaming chunk we can grab the data from the event. So 
in this case I'm grabbing the session ID uh and we are validating if it's different from the 
current then just return only process events for our session of course and then the event if the 
event is completed we set the state accordingly and then if is not completed we are going to keep 
setting the content of the stream. Okay, so this is basically the only one that we should need to 
have the functionality. But of course, we want to handle if we have an error accordingly. So we can 
add a listener in case we have an error for the current session. Uh we set the error. If the user 
cancels, we are going to listen for that event as well. That is going to come from the native 
side. And then uh we set the state accordingly. Down here we are setting the reference to be 
three reference. One for the chunk, one for the error and one for the cancel. And finally when we 
unmount this component we are just clearing all the subscriptions by calling the cancel streaming 
session passing this session ID reference. Okay. And then we have a function to start the streaming 
using a callback. If we already had a session, we're going to clear it before we start a new one. 
This is what this is doing. And then we start you know the basic stuff which is start loading start 
the error to null. The content is going to be empty at the beginning and the session is going 
to be returned for the uh by the start streaming session and this takes the prompt of the user. So 
once we have the session, we can validate if we have an error. Otherwise, we're going to set the 
session and the reference for the session ID. And that's all it is to it. If we have an error, we 
catch it and put in the state. We have a function to cancel the streaming. Uh we are checking 
the reference. If we actually have a reference,   we're going to call the cancel streaming session 
passing the session ID and reset the the reference to be null. And that's basically it. Then we're 
exposing as well a reset function. And this is totally optional. This is going to reset the 
state. And finally, we're returning all these functions with this hook, which should allows us 
to now go to the streaming chat. And just import our hook. Uh, and let's bring this from our module 
like this. And now we can actually use this data. So let me just go ahead and replace this current 
state that I had before. And in here we can uh call these functions that I had commented before 
to cancel and start streaming. So if I hit save uh let's open the console just to make sure that 
everything is working fine. And this should work.   Now let's go to the streaming chat and let's say 
hello and stream. Awesome. And as you notice a lot of things are happening but Expo modules actually 
handles everything super fast and that's why we are getting you know these updates super quickly. 
And now if we try to do the same thing like tell me a story this is going to generate a bunch 
of data. And if you remember at the beginning   we did it and we didn't get any response after 8 
seconds I think. And right now this is instantly streaming data which is really cool is that 
this is actually going to work offline as well. So great for local first applications. And here 
we have the summary, the tokens and everything. Now let's stream this again and cancel it. And as 
you notice when we cancel, we stop the streaming, we clear everything. And if I dismiss, this 
is going to clear everything as well. So super cool that we're able to stream. And at the end 
of the day, we are end up with this beautiful you know this beautiful custom hook that is really 
easy to use. And what I really want to highlight is that when you're creating an expo module, 
the code is actually extremely well structured, well-maintained, and just high quality. That's 
something that I really like about Expo modules. Allows me to write a type saved custom module 
on the native and on the JavaScript side. Well, this video now is getting super long, guys. H 
but if you made it this far and if you want to learn more about streaming structured data 
and how this would look like in the code, let me actually show you uh I'm just going to 
walk you through the current implementation   that we already have. So let's see how this looks 
for streaming structure data. First of all, same thing. We are going to define the records that we 
want to use and you can find this in the source code down here. uh but for streaming structured 
data we just need to keep track of the session ID that that we are streaming in case we want to 
cancel it and we're getting the prompt as well and then we have this record for streaming session 
for structured data in this case it's just session ID is active total tokens schema type and error 
and that's it now in this case we need to define a generable so if we take a look at the generable 
data structures we have a product which is what we are seeing on the demo here. This is a product 
and I can change the name. For example, this is like a soundwave but I ask for headphones but 
I can change this to be an iPhone for example, right? And look at that. Now I have an error. 
Let's see, Premium phone generate. Okay. So sometimes that happens and this is because it 
is a beta and you shouldn't rely completely on   this model. Like I said before, not many devices 
are going to have it, but these modules are great for summaries, for categorization and you can 
learn more about usage in the WWDC video that I recommended to watch at the beginning. Uh but 
yeah, so we are defining this product and we are providing a description. So, for example, as you 
notice, I'm always asking for the price to be in USD. And you can play around with this uh to get 
us a better sense of what kind of responses you're going to get from this model. Uh let's keep in 
mind as well that this is a local LLM and it's not super powerful. You cannot compare it with the 
latest modules from Anthropic or OpenAI. But yeah so once we define the generable and we provide the 
structure we can go back to the module and let's take a look at the start structured streaming this 
function is going to get the structure streaming request and it's going to return the streaming 
session. So we start again the same session. Uh we set the schema type to be product and this is 
because I was handling multiple uh data structures uh previously but now I decided to simplify to 
only have a product but you can generate any   custom data depending on the schema type. But yeah 
in this case a product we generate a new session initialize the session for the with the model 
store the session and then start the streaming response. So in this case, we pass the generating, 
we pass a product. This is what we're generating. And this is totally optional, but you can pass 
options by the way. So generation options, you can pass the sampling greedy. And you and we have more 
things that we can pass in here. So for example, if we take a look at the generation, we can pass 
the sampling and then we can pass the temperature and the maximum response tokens. So if you want 
to specify maximum response tokens let's say 10 you can do that here. So once we have that include 
schema and prompt equal to false. This is another variable that you can set and then we pass the 
prompt like this and this is good because it allows us to give more context to the LLM. So in 
this case I'm I'm giving it the context of give it a real name, price, category because at this 
point the model knows that it needs to generate a product. So I'm just saying just give it 
a real name, price, category, description,   features. On top of that, we're passing the prompt 
of the user which is going to influence the result of the final data structure. And then after that, 
we're just streaming the chunk and we are doing basically the same thing that we did previously 
uh when we were handling the structure data, but on each chunk. So this is going to return 
a partial product each time and then for each partial product we are generating a new product 
data and sending that on an event each time that we generate a new chunk. So based on that we 
send that event once it is completed we reset everything and we clean up the session. If the 
task was cancelled we removed everything as well and if we have an error we removed everything 
as well. So it might be actually a good idea to   abstract these functions. Uh but yeah, this is 
at the end of the day easier to understand. In this case, we are sending an event on streaming 
error. We pass the error event and that's pretty much it. So this is returning the session. And for 
this screen, I'm actually reutilizing some of the some of the functions that we had before. So if 
we take a look at the streaming structure data, I created this hook to keep things simple in here. 
But if we take a look at the implementation, we're adding a listener for the unstructured streaming 
chunk and we are reutilizing the onstream error and reutilizing the onstream cancel from 
the simple streaming screen and pretty much the same thing right we are just setting the state and 
yeah so once you have the previous implementation implementing the streaming of structured data 
should be fairly easy. So let's try to just to end this video. Let's try to generate a different 
product. So let's say wooden table for example and generate. Okay. And as you can see it says oak 
table which is really nice and a nice description price. It is very expensive. Uh but yeah in 
stock. Cool. So yeah it is influencing the end result. And that's it for this video guys. It 
was longer than I that I expected. But of course, I went ahead and kept adding more and more 
features because once you get the hand of writing an Expo modules is very addictive to keep adding 
more and more features because you actually have the power of the full native capabilities. 
So, anything that your device can do, you can expose that through an expo module, which 
is exciting, even if it's a beta version like we saw right now. So, I hope you like this video. I 
hope you enjoy it as much as I did recording it.   Please let me know in the comments if you have any 
questions, if you would like me to create another video like this. Maybe creating now a native view 
for example, or if you just have any questions, feedback, comments, if you tried it or not. Don't 
forget to check out the source code down here. Don't forget to give it a like and subscribe. 
Thanks for watching and I'll see you in the next
