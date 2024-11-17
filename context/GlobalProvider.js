import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUser, signOut } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Save session to AsyncStorage
  const saveSession = async (session) => {
    try {
      await AsyncStorage.setItem("userSession", JSON.stringify(session));
    } catch (error) {
      console.error("Error saving session", error);
    }
  };

  // Load session from AsyncStorage
  const loadSession = async () => {
    try {
      const storedSession = await AsyncStorage.getItem("userSession");
      return storedSession ? JSON.parse(storedSession) : null;
    } catch (error) {
      console.error("Error loading session", error);
      return null;
    }
  };

  // Clear session from AsyncStorage
  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem("userSession");
    } catch (error) {
      console.error("Error clearing session", error);
    }
  };

  // Check session and determine user or guest status
  useEffect(() => {
    const checkSession = async () => {
      const storedSession = await loadSession();

      if (storedSession) {
        // Try to use stored session
        try {
          const res = await getCurrentUser();
          if (res) {
            setIsLogged(true);
            setIsGuest(false); // Not a guest
            setUser(res);
          } else {
            throw new Error("Session expired or invalid");
          }
        } catch (error) {
          console.log("Session error, logging out:", error);
          setIsLogged(false);
          setIsGuest(true); // Guest access
          setUser(null);
          await signOut(); // Clear invalid session
        }
      } else {
        setIsGuest(true); // No session, default to guest
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        isGuest,
        setIsGuest,
        user,
        setUser,
        loading,
        clearSession,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;


// ORIGINAL GLOBALPROVIDER

// import React, { createContext, useContext, useEffect, useState } from "react";

// import { getCurrentUser } from "../lib/appwrite";

// const GlobalContext = createContext();
// export const useGlobalContext = () => useContext(GlobalContext);

// const GlobalProvider = ({ children }) => {
//   const [isLogged, setIsLogged] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getCurrentUser()
//       .then((res) => {
//         if (res) {
//           setIsLogged(true);
//           setUser(res);
//         } else {
//           setIsLogged(false);
//           setUser(null);
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <GlobalContext.Provider
//       value={{
//         isLogged,
//         setIsLogged,
//         user,
//         setUser,
//         loading,
//       }}
//     >
//       {children}
//     </GlobalContext.Provider>
//   );
// };

// export default GlobalProvider;