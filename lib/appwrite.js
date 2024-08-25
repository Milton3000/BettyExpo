import { Client, Account, ID, Databases, Avatars } from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.betty.bettybooth",
  projectId: "66cb8ec3002c3277268c",
  databaseId: "66cb906c0036e0448ba6",
  userCollectionId: "66cb90980004fa174798",
  imageCollectionId: "66cb90c4000336e9af4d",
  videoCollectionId: "66cb91cc000b179560cc",
  storageId: "66cb934a00293831a513",
};

// Init React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Appwrite Endpoint
  .setProject(config.projectId) // Project ID
  .setPlatform(config.platform); // Application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register User
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),

      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    )

    return newUser;

  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export async function signIn(email, password) {
    try {
      const currentSession = await account.getSession("current");
      if (currentSession) return currentSession;
      const newSession = await account.createEmailPasswordSession(
        email,
        password
      );
      return newSession;
    } catch (error) {
      throw new Error(error);
    }
  }

// OLD ONE
// export async function signIn(email, password) {
//   try {
//     const session = await account.createEmailPasswordSession(email, password);
//     return session;
//   } catch (error) {
//     throw new Error(error);
//   }
// }
