# Expo plugin: Add SPM Dependency
### Introduction

As you probably know, [CocoaPods will sunset](https://blog.cocoapods.org/) in the near future, and Meta is [already working](https://github.com/react-native-community/discussions-and-proposals/issues/587#issuecomment-2748837968) on adding first-class support for Swift Package Manager. It’s not there yet, but we can start installing SPM dependencies in our CocoaPods modules using [this](https://github.com/mfazekas/discussions-and-proposals/blob/spm-deps-in-podspec/proposals/0000-cocoapods-spm.md) RFC from Miklós Fazekas.

If everything is on good track, then why we are here and why I decided to create this blog post?

### The problem

Let’s look at a real-world scenario where you need to install a dependency using SPM. As mentioned above, you can only do this from your local native module or a third-party native module.

Here is my _\*.podspec_ file for a local module called _TerminalKit_, which I use to bridge the native TerminalSDK and Tap to Pay SDK from Adyen:

TerminalKit.podspec

```
Pod::Spec.new do |s|
  s.name           = 'TerminalKit'
  s.version        = '1.0.0'
  s.summary        = 'React Native Bridge for Adyen Terminal and TapToPay API'
  s.description    = 'Swift/Kotlin Terminal Bridge'
  s.author         = 'Jacek Pudysz'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => min_ios_version_supported }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  spm_dependency(s,
    url: 'https://github.com/Adyen/adyen-pos-mobile-ios-test',
    requirement: {kind: 'upToNextMajorVersion', minimumVersion: '3.6.0'},
    products: ['AdyenPOSTEST']
  )

  s.dependency 'TerminalAPIKit'
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
```


The crucial part lies between lines 20 and 24. With the _spm\_dependency_ utility, we can easily install an external dependency.

Here is the current structure of the project and its dependencies:

```
PaymentProject <-- main target
├── TerminalKit <-- Cocoapod dependency (local Expo native module)
│   └── AdyenPOSTTEST <-- SPM dependency (framework)
└── Other dependencies

```


![Project dependencies](https://reactnativecrossroads.b-cdn.net/08-spm-dependency/framework.png)

If we run the project and try to call some Adyen native SDK methods, everything seems to work fine! 🎉

So, we pass the build to the testers, they run the app on their phones, and… it _crashes_ 💥.

If we inspect our build folder, we can see that _AdyenPOSTTEST_ is a dynamic framework, and it’s not copied to our main app target. I’m not sure why the behavior is different on simulators, somehow we’re able to reference the framework at runtime, but it doesn’t matter since in the real world, our users will be on physical devices.

To fix this issue in a React Native bare project, we would simply add a new SPM dependency to our _main target_, save the changes, and we’re good to go:

![Add SPM dependency via Xcode UI](https://reactnativecrossroads.b-cdn.net/08-spm-dependency/add-spm-dependency-ui.png)

But we can’t do that with an Expo dev client, since the _ios_ folder is re-generated with each build.

That’s why we need to build a plugin to link everything together.

### How Xcode references SPM dependencies

Before we start, I’ll follow the same decision algorithm as in the previous post about [adding a target to any file via an Expo plugin](https://www.reactnativecrossroads.com/posts/config-plugin-expo-add-target):

1.  Perform a clean build with _npx expo prebuild —clean_
2.  Copy the contents of _\*.pbxproj_
3.  Apply changes via the Xcode UI
4.  Copy the contents of _\*.pbxproj_ again
5.  Compare the “before” and “after” changes using an external tool

Once we’ve completed all the steps, we can compare the changes.

#### New section XCRemoteSwiftPackageReference

```
/* Begin XCRemoteSwiftPackageReference section */

		DA0478D4C9834812BB54457A /* XCRemoteSwiftPackageReference "adyen-pos-mobile-ios-test" */ = {

			isa = XCRemoteSwiftPackageReference;

			repositoryURL = "https://github.com/Adyen/adyen-pos-mobile-ios-test";

			requirement = {

				kind = upToNextMajorVersion;

				minimumVersion = 3.6.0;

			};

		};

/* End XCRemoteSwiftPackageReference section */
```


It has the same contents as the code in _spm\_dependency_ it’s just represented differently in a way that Xcode can understand it. I just want you to focus on the generated ID, as it’s crucial: _DA0478D4C9834812BB54457A_.

#### New section: XCSwiftPackageProductDependency

```
/* Begin XCSwiftPackageProductDependency section */

		90A4A40685CA43888D02B158 /* AdyenPOSTEST */ = {

			isa = XCSwiftPackageProductDependency;

			package = DA0478D4C9834812BB54457A /* XCRemoteSwiftPackageReference "adyen-pos-mobile-ios-test" */;

			productName = AdyenPOSTEST;

		};

/* End XCSwiftPackageProductDependency section */
```


Xcode also requires an additional section called _XCSwiftPackageProductDependency_ to reference the SPM package. Pay close attention to the IDs again: here, we reference the ID from the previous step and add a new one — _90A4A40685CA43888D02B158_.

#### Updated section PBXProject

```

/* Begin PBXProject section */

		/* Other content - Removed from example snippet */

			mainGroup = 83CBB9F61A601CBA00E9B192;

			packageReferences = (

				DA0478D4C9834812BB54457A /* XCRemoteSwiftPackageReference "adyen-pos-mobile-ios-test" */,

			);

			productRefGroup = 83CBBA001A601CBA00E9B192 /* Products */;

			projectDirPath = "";

			projectRoot = "";

			targets = (

				13B07F861A680F5B00A75B9A /* paymentProject */,

			);

		};

/* End PBXProject section */
```


This time, Xcode applied the changes to the existing _PBXProject_ by adding a _packageReferences_ section. This section includes our _first ID_.

#### Updated section PBXBuildFile

```
/* Begin PBXBuildFile section */

		06B2DB1B7E264E8EA790150D /* AdyenPOSTEST in Frameworks */ = {isa = PBXBuildFile; productRef = 90A4A40685CA43888D02B158 /* AdyenPOSTEST */; };

		/* Other content - Removed from example snippet */

/* End PBXBuildFile section */
```


In this section we need to reference the new framework in the _PBXBuildFile_. We also need to generate new ID: _06B2DB1B7E264E8EA790150D_ and use ID from 2nd step _90A4A40685CA43888D02B158_.

#### Updated section PBXFrameworksBuildPhase

```

/* Begin PBXFrameworksBuildPhase section */

		13B07F8C1A680F5B00A75B9A /* Frameworks */ = {

			isa = PBXFrameworksBuildPhase;

			buildActionMask = 2147483647;

			files = (

				96905EF65AED1B983A6B3ABC /* libPods-paymentProject.a in Frameworks */,

				06B2DB1B7E264E8EA790150D /* AdyenPOSTEST in Frameworks */,

			);

			runOnlyForDeploymentPostprocessing = 0;

		};

/* End PBXFrameworksBuildPhase section */
```


Last but not least, Xcode updates the list of our _files_. In addition to our project’s CocoaPods framework, it also includes the desired framework. Once again, we need to link the correct ID: _06B2DB1B7E264E8EA790150D_ (from previous step).

### Solution

There are a lot of code changes, and it may seem complicated, but with a little patience, we can solve this issue. Let’s go through it together, step-by-step.

#### Create expo plugin boilerplate

addSPMDependenciesToMainTarget.js

```
const addSPMDependenciesToMainTarget = (config, options) => {
    // todo

    return config
}

modules.exports = addSPMDependenciesToMainTarget
```


For the options, you can use whatever you want. I’ll focus on a dedicated plugin for adding a single dependency, but feel free to support an array of SPM dependencies.

app.json

```
{
  "expo": {
    "plugins": [
      ["./plugins/addSPMDependenciesToMainTarget.js", {
          "version": "3.6.0",
          "repositoryUrl": "https://github.com/Adyen/adyen-pos-mobile-ios-test",
          "repoName": "adyen-pos-mobile-ios-test",
          "productName": "AdyenPOSTEST"
      }]
    ]
  }
}
```


#### (Step 1) Apply XCRemoteSwiftPackageReference changes

To apply Xcode changes we need to use… _withXcodeProject_ plugin:

addSPMDependenciesToMainTarget.js

```
const { withXcodeProject } = require('@expo/config-plugins')

const addSPMDependenciesToMainTarget = (config, options) => {
const addSPMDependenciesToMainTarget = (config, options) => withXcodeProject(config, config => {
    // reference the "props"
    const { version, repositoryUrl, repoName, productName } = options

    // reference xcodeProject
    const xcodeProject = config.modResults

    // get XCRemoteSwiftPackageReference section
    const spmReferences = xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference']

    // if doesn't exist (this is our first SPM package) create empty object
    if (!spmReferences) {
        xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference'] = {}
    }

    // generate new ID
    const packageReferenceUUID = xcodeProject.generateUuid()

    // add XCRemoteSwiftPackageReference section
    xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference'][`${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`] = {
        isa: 'XCRemoteSwiftPackageReference',
        repositoryURL: repositoryUrl,
        requirement: {
            kind: 'upToNextMajorVersion',
            minimumVersion: version
        }
    }

    // todo
})
}
```


I’ll take some time to explain the first step to give you a glimpse of how you need to think about Xcode hashes. Later, I’ll leave comments only to help you understand the meaning of the code.

In the very first lines, I extract properties passed to the plugin from _app.json_ and get a reference to the object-oriented representation of our _xcodeProject_.

If you want to better understand how this plugin works, you should _console.log_ the contents of the _xcodeProject_ object.

In line 12, I try to reference the _XCRemoteSwiftPackageReference_ section. If it doesn’t exist, I create it.

Finally, in the last lines of this snippet, I add a new package reference.

You may ask, how do I know which fields to use?

It’s simple! Just scroll up and compare my plugin snippet to the Xcode diff in the previous step.

#### (Step 2) Apply XCSwiftPackageProductDependency changes

addSPMDependenciesToMainTarget.js

```
const addSPMDependenciesToMainTarget = (config, options) => withXcodeProject(config, config => {
    const { version, repositoryUrl, repoName, productName } = options

    // previous step has been skipped

    // get XCSwiftPackageProductDependency section
    const spmProducts = xcodeProject.hash.project.objects['XCSwiftPackageProductDependency']

    // if doesn't exist (this is our first SPM package) create empty object
    if (!spmProducts) {
        xcodeProject.hash.project.objects['XCSwiftPackageProductDependency'] = {}
    }

    // generate new ID
    const packageUUID = xcodeProject.generateUuid()

    // add XCSwiftPackageProductDependency section
    xcodeProject.hash.project.objects['XCSwiftPackageProductDependency'][`${packageUUID} /* ${productName} */`] = {
        isa: 'XCSwiftPackageProductDependency',
        // from step before
        package: `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`,
        productName: productName
    }
})
```


#### (Step 3) Apply PBXProject changes

addSPMDependenciesToMainTarget.js

```
const addSPMDependenciesToMainTarget = (config, options) => withXcodeProject(config, config => {
    const { version, repositoryUrl, repoName, productName } = options

    // Steps 1 and 2 are skipped

    // get main project ID
    const projectId = Object.keys(xcodeProject.hash.project.objects['PBXProject']).at(0)

    // create empty array for package references if it doesn't exist
    if (!xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences']) {
        xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences'] = []
    }

    // add our package reference (use ID from first step)
    xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences'] = [
        ...xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences'],
        `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`,
    ]
})
```


#### (Step 4) Apply PBXBuildFile changes

addSPMDependenciesToMainTarget.js

```
const addSPMDependenciesToMainTarget = (config, options) => withXcodeProject(config, config => {
    const { version, repositoryUrl, repoName, productName } = options

    // Steps 1 to 3 are skipped

    // generate new ID
    const frameworkUUID = xcodeProject.generateUuid()

    // add comment and reference to our framework in PBXBuildFile section
    xcodeProject.hash.project.objects['PBXBuildFile'][`${frameworkUUID}_comment`] = `${productName} in Frameworks`
    xcodeProject.hash.project.objects['PBXBuildFile'][frameworkUUID] = {
        isa: 'PBXBuildFile',
        productRef: packageUUID,
        productRef_comment: productName
    }
})
```


#### (Step 5) Apply PBXFrameworksBuildPhase changes

addSPMDependenciesToMainTarget.js

```
const addSPMDependenciesToMainTarget = (config, options) => withXcodeProject(config, config => {
    const { version, repositoryUrl, repoName, productName } = options

    // Steps 1 to 4 are skipped

    // get first build phase
    const buildPhaseId = Object.keys(xcodeProject.hash.project.objects['PBXFrameworksBuildPhase']).at(0)

    // create empty array for files if it doesn't exist
    if (!xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files']) {
        xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'] = []
    }

    // add our framework reference (use ID from step 4)
    xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'] = [
        ...xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'],
        `${frameworkUUID} /* ${productName} in Frameworks */`,
    ]

    // return all the changes
    return config
})
```


### Summary

Now we have a working SPM dependency in our project. If we test it, we can see that our main app target has the _AdyenTapToPaySDK_ correctly attached! 🎉

![Plugin result](https://reactnativecrossroads.b-cdn.net/08-spm-dependency/plugin-result.jpg)

You can find the full source code of this project [here](https://gist.github.com/jpudysz/c04217fe3f9a584471bcb988407d2ee3).

### Do you want to support me even more?

![github-mona](https://www.reactnativecrossroads.com/mona.png)

Sponsor me on Github

![kofi](https://www.reactnativecrossroads.com/kofi.png)

Buy me a coffee

![x-twitter](https://www.reactnativecrossroads.com/twitter.png)

Share it on Twitter