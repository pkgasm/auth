# Auth

The module authenticates users using a configurable authentication scheme. It provides an API for triggering authentication and accessing resulting user information. While it takes care of storing the information on the client-side, it does NOT implement session handling or provide session based authentication on the server.

**Table of Contents**

[TOC]

## Features

- Custom scheme for user authentication.
- Make login, save user token in local storage and cookies.
- Auto fetch data of user.
- Make logout, remove user token from local storage and cookies.

## Dependencies

- axios
- js-cookie

## Basic usage

```javascript
import Auth from "./auth";

const baseUrl = "https://api.domain.com";

const config = {
  endpoints: {
    login: {
      url: "api/v1/auth/login",
      method: "post",
    },
    logout: {
      url: "api/v1/auth/logout",
      method: "post",
    },
    user: {
      url: "api/v1/users/me",
      method: "get",
    },
  },
  user: {
    property: "user",
    autoFetch: true,
  },
  token: {
    property: "token",
    type: "bearer",
    header: "Authorization",
  },
};

const email = "test@email.com";
const password = "password";

const auth = new Auth(baseUrl, config);

await auth.login({ email, password });

auth.user; // User data
auth.loggedIn; // Session flag
```

## Functions

| Function  | Params            | Description                                                     |
| --------- | ----------------- | --------------------------------------------------------------- |
| login     | {email, password} | User log in. Save user token in local storage and in cookies.   |
| logout    | No params         | User log out. Remove user token from local storage and cookies. |
| fetchUser | No params         | Get current user data.                                          |
| init      | No params         | Detect if there is a session and get the user data.             |

## Sycn init

When we instantiate an object of the auth class, it will asynchronously execute the init function, so properties like user and loggedin will not have the correct information until the init function has finished.

To obtain the data synchronously we must execute the init function synchronously.

```javascript
const auth = new Auth(baseUrl, config);
await auth.init();
auth.user; // Correct information
auth.loggedIn; // Correct information
```

## Reactive state

If you are using frameworks like vue or react, the user object and the loggedIn flag are not reactive variables.

The config object has attributes to assign the reactive variables.

### Example with vue

```javascript
import Auth from "./auth";

const user = ref(null);
const loggedIn = ref(false);

const baseUrl = "https://api.domain.com";

const config = {
  reactiveState: {
    user: {
      set: (user) => {
        user.value = user;
      },
      get: () => {
        return user.value;
      },
    },
    loggedIn: {
      set: (loggedIn) => {
        loggedIn.value = loggedIn;
      },
      get: () => {
        return loggedIn.value;
      },
    },
  },
};

const email = "test@email.com";
const password = "password";

const auth = new Auth(baseUrl, config);

await auth.login({ email, password });

// With the reactive states you can already observe the changes in the attributes.
watch(
  () => auth.loggedIn,
  () => {
    auth.user; // User data
  }
);
```

### Example with react

```javascript
import Auth from "./auth";

const [user, setUser] = useState(null);
const [loggedIn, setLoggedIn] = useState(false);

const baseUrl = "https://api.domain.com";

const config = {
  reactiveState: {
    user: {
      set: (user) => {
        setUser(user);
      },
      get: () => {
        return user;
      },
    },
    loggedIn: {
      set: (loggedIn) => {
        setLoggedIn(loggedIn);
      },
      get: () => {
        return loggedIn;
      },
    },
  },
};

const email = "test@email.com";
const password = "password";

const auth = new Auth(baseUrl, config);

await auth.login({ email, password });

// With the reactive states you can already observe the changes in the attributes.
useEffect(() => {
  auth.user; // User data
}, [auth.loggedIn]);
```
