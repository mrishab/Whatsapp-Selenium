# Introduction

Whatsapp-Selenium is a selenium based library that interacts with Whatsapp Web interface and can be used to automate any Whatsapp tasks.

# Setup

1. Clone this repository
    ```
    git clone git@github.com:mrishab/Whatsapp-Selenium.git
    ```

2. Go to the project's root directory and install dependencies.
    ```
    npm install
    ```

3. Create a TAR file locally.
    ```
    npm pack
    ```
    This will create a package in the current directory named `whatsapp-selenium-<version>.tgz`.

4. Now you can install this project in a different project using the relative file path.
    ```
    npm install -f /path/to/this/project/root/directory/explorer-<version>.tgz
    ```

# Getting started with the development

See the project [Whatsapp-Bot](https://github.com/mrishab/Whatsapp-Bot) which is built using this library.

The Whatsapp-Selenium provides 2 layers of abstraction over the WhatsappWeb interface.

## 1. whatsapp.js

This layer contains the pointers to individual elements and properties about the state of the current Whatsapp Web page. Whatsapp uses an instance of selenium webdriver through its `driver` class that abstracts some repetitive patterns.

1. Create a selenium based WebDriver that fits your project's and browser's configuration
    ```
    const { Builder, Capabilities } = require("selenium-webdriver");
    const chrome = require("selenium-webdriver/chrome");

    const chromeOptions = this.getChromeOptions();
    const webDriver = await new Builder()
        .withCapabilities(Capabilities.chrome())
        .setChromeOptions(chromeOptions)
        .build();
    ```

2. Create an instance of Whatsapp
    ```
    const { Driver, Whatsapp } = require("whatsapp-selenium");

    const whatsappDriver = new Driver(webDriver);
    const whatsapp = new Whatsapp(whatsappDriver);
    ```

### Usage

You can use the whatsapp instance to perform any simple action.

```
// Open the page
await whatsapp.openPage();

await pause(10,000); // Wait for the page to load (See WhatsappAction.js for a better approach to this)

await whatsapp.openChatWith("My Contact Person");
await whatsapp.typeMessage("Hi, this is an automated message");
await whatsapp.typeMessage(Key.ENTER); // sends the message

await pause(2000);

const messageIsSent = await whatsapp.isLastMessageSent();

if (messageIsSent) {
    console.log("Message sent successfully");

} else {
    console.log("Something happened");
}

```

While the above code is very elaborate, it provides you with complete control over the actions to perform.

For a set of common actions, keep reading. 

## 2. whatsappAction.js

This layer provides access to commonly performed actions using a whatsapp.js instance.

1. Create an instance of Whatsapp using the steps described in the above section.

2. Create an instance of WhatsappAction.
    ```
    const { WhatsappAction } = require("whatsapp-selenium");
    const whatsappAction = new WhatsappAction(whatsapp);
    ```

### Usage

```
await whatsappAction.init(); // automatically waits until the Whatsapp Web page is completely loaded

await whatsappAction.sendMessageTo("My Contact Person", "Hi, this is an automated message");
```
