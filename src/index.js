import axios from "axios";
import cookies from "js-cookie";

export default class Auth {
  #baseUrl = "/";
  #config = {
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

  #auth = {
    user: null,
    loggedIn: false,
  };

  #reactiveState = {
    user: {
      set: (user) => {
        this.#auth.user = user;
      },
      get: () => {
        return this.#auth.user;
      },
    },
    loggedIn: {
      set: (loggedIn) => {
        this.#auth.loggedIn = loggedIn;
      },
      get: () => {
        return this.#auth.loggedIn;
      },
    },
  };

  constructor(baseUrl, config) {
    this.#baseUrl = baseUrl ?? this.#baseUrl;

    this.#config.endpoints.login.url =
      config?.endpoints?.login?.url ?? this.#config.endpoints.login.url;
    this.#config.endpoints.login.method =
      config?.endpoints?.login?.method ?? this.#config.endpoints.login.method;

    this.#config.endpoints.logout.url =
      config?.endpoints?.logout?.url ?? this.#config.endpoints.logout.url;
    this.#config.endpoints.logout.method =
      config?.endpoints?.logout?.method ?? this.#config.endpoints.logout.method;

    this.#config.endpoints.user.url =
      config?.endpoints?.user?.url ?? this.#config.endpoints.user.url;
    this.#config.endpoints.user.method =
      config?.endpoints?.user?.method ?? this.#config.endpoints.user.method;

    this.#config.user.property =
      config?.user?.property ?? this.#config.user.property;
    this.#config.user.autoFetch =
      config?.user?.autoFetch ?? this.#config.user.autoFetch;

    this.#config.token.property =
      config?.token?.property ?? this.#config.token.property;
    this.#config.token.type = config?.token?.type ?? this.#config.token.type;
    this.#config.token.header =
      config?.token?.header ?? this.#config.token.header;

    this.#reactiveState.user.set =
      config?.reactiveState?.user?.set ?? this.#reactiveState.user.set;
    this.#reactiveState.user.get =
      config?.reactiveState?.user?.get ?? this.#reactiveState.user.get;

    this.#reactiveState.loggedIn.set =
      config?.reactiveState?.loggedIn?.set ?? this.#reactiveState.loggedIn.set;
    this.#reactiveState.loggedIn.get =
      config?.reactiveState?.loggedIn?.get ?? this.#reactiveState.loggedIn.get;

    this.init();
  }

  async init() {
    const token = this.#getToken();
    if (token && !this.#reactiveState.user.get()) {
      this.#setToken(token);
      if (this.#config.user.autoFetch) await this.fetchUser();
    }
  }

  login(params) {
    return new Promise((resolve, reject) => {
      axios({
        url: `${this.#baseUrl}${this.#config.endpoints.login.url}`,
        method: this.#config.endpoints.login.method,
        data: params,
      })
        .then(async (response) => {
          const token = response.data[this.#config.token.property];
          const type = this.#config.token.type;
          this.#setToken(`${type} ${token}`);
          if (this.#config.user.autoFetch) await this.fetchUser();
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  fetchUser() {
    return new Promise((resolve, reject) => {
      const token = this.#getToken();
      const headers = {};
      headers[this.#config.token.header] = token;

      axios({
        url: `${this.#baseUrl}${this.#config.endpoints.user.url}`,
        method: this.#config.endpoints.user.method,
        headers: headers,
      })
        .then((response) => {
          const user = response.data[this.#config.user.property];
          this.#setUser(user);
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      const token = this.#getToken();
      const headers = {};
      headers[this.#config.token.header] = token;

      axios({
        url: `${this.#baseUrl}${this.#config.endpoints.logout.url}`,
        method: this.#config.endpoints.logout.method,
        headers: headers,
      })
        .then((response) => {
          resolve(response.data);
          this.#setUser(null);
          this.#removeToken();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  #setUser(user = null) {
    this.#reactiveState.user.set(user);
    this.#reactiveState.loggedIn.set(Boolean(user));
  }

  get user() {
    return this.#reactiveState.user.get();
  }

  get loggedIn() {
    return this.#reactiveState.loggedIn.get();
  }

  #setToken(token) {
    localStorage.setItem("auth.token", token);
    cookies.set("auth.token", token);
  }

  #getToken() {
    let token = null;
    if (!token) token = localStorage.getItem("auth.token");
    if (!token) token = cookies.get("auth.token");
    return token;
  }

  #removeToken() {
    localStorage.removeItem("auth.token");
    cookies.remove("auth.token", { paht: "" });
  }
}
