import { Client, Account, ID, Databases, Avatars, Query } from "react-native-appwrite";

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

const {
endpoint,
platform,
projectId,
databaseId,
userCollectionId,
imageCollectionId,
videoCollectionId,
storageId,
} = config;

// Init React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Appwrite Endpoint
  .setProject(config.projectId) // Project ID
  .setPlatform(config.platform) // Application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
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
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    await account.deleteSessions();  // Deletes all sessions
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error('Sign In Error:', error.response ? error.response.data : error.message);
    throw new Error(error.message || 'Failed to sign in.');
  }
};


// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}


// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};



// Get All Posts (Videos + Images)
export const getAllPosts = async () => {
  try {
    // Fetch videos
    const videos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      []  // You can add queries here if needed
    );
    
    // Fetch images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      []  // You can add queries here if needed
    );

    // Combine videos and images
    const posts = [...videos.documents, ...images.documents];

    return posts;
  } catch (error) {
    throw new Error(error);
  }
}


export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt', Query.limit(7))]  // You can add queries here if needed
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}