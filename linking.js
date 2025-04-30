const linking = {
    prefixes: ['betty://', 'https://*.bettybooth.com'],
    config: {
      screens: {
        "index": "",
        "(auth)": {
          screens: {
            login: "login",
            register: "register",
          },
        },
        "(tabs)": {
          screens: {
            home: "home",
            profile: "profile",
          },
        },
        "galleries/[galleryId]": "galleries/:galleryId",
      },
    },
  };
  
  export default linking;
  