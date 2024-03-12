# TileUp!

TileUp is a gamified web portal for controlling MSP432 robotic car. It includes an interface to view the sensors on the car. The colors on the ground will determine if the car can move based on the instruction given.

- Red - Reverse
- Green - Forward
- Blue - Left and Right

![TileUp](/img/web-portal.gif)

In this example, the sensor determined the color on the ground is green, which allowed the instruction to execute and move the car forward.

### Framework used

The project is using the MEVN Stack.

- [MongoDB(M)](https://www.mongodb.com/)
- [ExpressJS(E)](https://expressjs.com/)
- [VueJS(V)](https://vuejs.org/)
- [NodeJS(N)](https://nodejs.org/en/)

## How it works

1. The project is a monorepo containing both the frontend and backend. The backend is in [`src/`](https://github.com/ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7/tree/main/src). The backend consist of MongoDB, ExpressJS and NodeJS. The VueJS frontend is nested within the backend directory [`src/client`](https://github.com/ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7/tree/main/src/client).
2. The ExpressJS server will handle the HTTP requests from the VueJS frontend.

## Architecture

The project follows the MVC+Service layer design pattern.

When a View makes a request, it will be routed to the respective controller that is responsible for receiving and responding to the request. The Controller will call the Service layer (business layer) that contains the logic. When an operation requires interaction with the database, it will use the Model that contains data model definition and operations. In this case, only UserService has to interact with the database for authentication.

> The user class is responsible for the creation and authentication of users.

> The program class is responsible for interacting with the TCP Server that communicates with the ESP8266.

![Architecture](/img/architecture.png)

## Prerequisite

- npm >= 6.14.15
- node >= 14.18.1
- MongoDB local or Remote MongoDB Instance (Atlas)

### Set up local or remote MongoDB instance

> 1. [Great Guide on setting up a local MongoDB](https://www.prisma.io/dataguide/mongodb/setting-up-a-local-mongodb-database)
>
> 2. [Getting Started with Atlas](https://docs.atlas.mongodb.com/getting-started/)

### Clone the repository

```bash
/* clone the repository */
git clone git@github.com:ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7.git tileup

/* Change directory into source*/
cd tileup/src

```

![Start server](/img/clone-repository.gif)

### Install dependencies

```bash
npm install
```

### Configure Database URI

Modify your [config/config.js](https://github.com/ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7/blob/main/src/config/config.js) depending on chosen Mongodb instance.

```js
/* Update
1.  mongoUri - Change process.env.MONGO_URI to localhost or remote atlas.
2.  testMongoUri - Change process.env.MONGO_URI to localhost or remote atlas.
*/
module.exports = {
    # default - Add MONGO_URI and TEST_MONGO_URI to terminal profile.
    mongoUri: process.env.MONGO_URI,
    testMongoUri: process.env.TEST_MONGO_URI,
    ...
    # localhost
    mongoUri: "mongodb://localhost:27017/tileup",
    testMongoUri: "mongodb://localhost:27017/",
    ...
    # remote
    mongoUri: "mongodb+srv://fake:morefake@tileup.123fa.mongodb.net/tileup",
    testMongoUri: "mongodb+srv://fake:morefake@tileup.123fa.mongodb.net/",
}
```

> Do not commit config.js.

#### Alternative: Add to Terminal Profile

> No change is required in config.js. Add the variable into your terminal zsh/bash profile.

```bash
# Example for Windows Bash

code ~/.bash_profile

# Add the following code
## Local
export MONGO_URI="mongodb://localhost:27017/tileup"
## or Remote Atlas
# export MONGO_URI="mongodb+srv://fake:morefake@tileup.123fa.mongodb.net/tileup"

## Local testing db. Do not include database name after /
export TEST_MONGO_URI="mongodb://localhost:27017/"
# export TEST_MONGO_URI="mongodb+srv://fake:morefake@tileup.123fa.mongodb.net/"

# Restart terminal!
```

### Usage

```bash

/* Command to run backend */
npm run server

/* Open a new terminal*/

/* Command to run frontend */
npm run client
```

![Start server](/img/start-server.gif)

### Development Workflow

Branches

1. Main

2. Develop

3. Feature branch

   > All developers will work on their own dedicated branches that is based on the **development** branch.

```bash
git checkout development

git checkout -b feature/new-button development

git commit -am 'Add a new play button at login page'

git push --set-upstream origin feature/new-button


/* Continue working on the branch */
git commit -m 'add new button'
git push
git commit -m 'styling the button'
git push
git commit -m 'add logic to the button'
git push

/* Ready for review */

Create push request on Github, assign a reviewer.

The PR will be allowed to merge once it is approved.

Success!

```

### Limitations

> Only the leader can merge the **development** branch to main
> No pushing changes to main. Only merge is allowed. Branch protection is enabled.

## Postman Collection

Download the postman collection to test the API available.

> Take note: Some API requires logging in first to be able to call the API.
>
> Send the Login request first, then try the others. It will automatically update the authorization variable and allow access to the API

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/54010551dd3d1ae90e8e?action=collection%2Fimport)

## User Acceptance Testing


https://user-images.githubusercontent.com/89976082/144744240-ea74146f-d0c0-4344-b225-d18f4f6f1779.mp4


## M2 State Diagram

![ICT2x01_Milestone2_StateDiagram_LabGroup4-Team7_AY2122](https://user-images.githubusercontent.com/89976082/144716632-dd3d2ead-c5f0-4800-bd1d-4dd3f7b0fb43.png)

## M3 Refined State Diagram

- Green color refers to transitions with changes made

![refinedStateDiagram](https://user-images.githubusercontent.com/89976082/144716625-cfeefd1e-afc2-496d-a545-55eea84993de.png)

## Whitebox Testing

The tool used for testing is Jest. Statistics are generated with Jest, the full report can be found in [Coverage Report](https://github.com/ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7/tree/main/src/coverage/lcov-report).

[mockingoose](https://github.com/alonronin/mockingoose) is used to mock the mongoose model.

## How to run tests

```bash
# Run the tests - Note that this will run ALL the tests in the Express Backend.
npm run test

# Generate the coverage report for backend.
npm run test-coverage

# Generated report can be found in coverage/lcov-report/index.html

```

The chosen class is User Service class. It handles the logic for user authentication.

## User Service

The tests can be found in [User Service Tests](https://github.com/ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7/blob/main/src/services/__tests__/user_service.test.js).

The statistics after running all the test case in User Service. The breakdown into the test cases can be found below.

![User Service Tests](/img/tests/user-service-test-stats.png)

```bash
npm run test user_service.test.js
```

#### Running the test

![User Service Tests](/img/tests/user-service-run.gif)

### Test cases

![User Service Tests](/img/tests/user-service-test.png)

The tests are further isolated using Jest Filters.

```bash
npm run test 'user_service.test.js' -t 'UserService test'
```

[Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) extension is used to help run the tests, as it helps to filter to a single test case. Individual tests statistics are extracted from the coverage report after filtering.

### Create User

![Create User](/img/tests/create-user.png)

#### Success

- Valid PIN

  ![Valid PIN](/img/tests/create-user-valid-pin.png)

#### Error

- Invalid PIN

  ![Invalid PIN](/img/tests/create-user-invalid-pin.png)

- Non-matching PIN

  ![Non-matching PIN](/img/tests/create-user-non-matching-pin.png)

- Weak PIN

  ![Weak PIN](/img/tests/create-user-weak-pin.png)

- Existing User

  ![Existing User](/img/tests/create-user-another-user-exist.png)

### Login

![Login](/img/tests/login.png)

#### Success

- Successful login

  ![Login Success](/img/tests/login-success.png)

#### Error

- No existing user

  ![Login no existing user](/img/tests/login-no-user-exist.png)

- Wrong PIN

  ![Wrong PIN](/img/tests/login-wrong-pin.png)

- No login attempts left

  ![No login attempts left](/img/tests/login-no-attempts-left.png)

- Exceed login attempts

  ![Exceed attempts](/img/tests/login-exceed-attempts.png)

### Reset PIN

![Reset PIN](/img/tests/reset.png)

#### Success

- Successfully Reset

  ![Reset PIN success](/img/tests/reset-success.png)

#### Error

- No user exist

  ![No user exist](/img/tests/reset-no-user-exist.png)

- Missing required PIN

  ![Missing required PIN](/img/tests/reset-missing-pin.png)

- New PIN do not match confirmation PIN

  ![PIN do not match](/img/tests/reset-no-match.png)

- Incorrect current PIN

  ![Current PIN incorrect](/img/tests/reset-current-pin-incorrect.png)

- PIN is not a Number

  ![PIN is NaN](/img/tests/reset-pin-nan.png)

- Weak PIN

  ![Weak PIN](/img/tests/reset-weak-pin.png)

## Additional Tests

### User Model

The tests can be found in [User Model Test](https://github.com/ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7/blob/main/src/models/User/__tests__/user_model.test.js).

```bash
npm run test 'user_model.test.js'
```

![User Model Tests](/img/tests/user-model-run.gif)

![User Model Tests](/img/tests/user-model-test.png)

### Additional Blackbox Testing - E2E

[supertest](https://github.com/visionmedia/supertest) to help with testing the HTTP API.

The tests can be found in [E2E test](https://github.com/ICT2x01-P4-7/ICT2x01-P4-7-ICT2x01-p4-7/blob/main/src/__tests__/app.test.js).

```bash
npm run test 'app.test.js'
```

![E2E Tests](/img/tests/e2e-run.gif)

![E2E Tests](/img/tests/e2e-test.png)
