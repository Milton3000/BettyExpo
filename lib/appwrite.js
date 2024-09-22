import { Client, Account, ID, Databases, Avatars, Query, Storage } from "react-native-appwrite";

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
const storage = new Storage(client);

// Function to check if there is an active session
export const checkActiveSession = async () => {
  try {
    const session = await account.getSession('current'); // Get the current session
    return session !== null; // Return true if there is an active session
  } catch (error) {
    // If there's an error (e.g., no active session), handle it appropriately
    if (error.code === 401) {
      return false; // No active session
    }
    throw error; // Re-throw other unexpected errors
  }
};

// Function to delete all sessions for the current user
export const deleteSessions = async () => {
  try {
    // Get the list of all sessions
    const sessions = await account.listSessions();

    // Delete each session
    await Promise.all(
      sessions.sessions.map(async (session) => {
        await account.deleteSession(session.$id);
      })
    );

    console.log('All sessions deleted successfully');
  } catch (error) {
    console.error('Error deleting sessions:', error.message);
    throw error; // Re-throw the error for further handling
  }
};

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
        // await account.deleteSessions(); 
    const session = await account.createEmailPasswordSession(email, password);
    console.log('Session created:', session);
    return session;
  } catch (error) {
    console.error('Sign In Error:', error.response ? error.response.data : error.message);
    throw new Error(error.message || 'Failed to sign in.');
  }
};

// Get Account
export const getAccount = async () => {
  try {
    // await account.deleteSessions(); 
    console.log('Checking session...');
    const currentAccount = await account.get();
    console.log('Current Account:', currentAccount);
    return currentAccount;
  } catch (error) {
    console.error('Get Account Error:', error.message || error);
    throw new Error(error.message || 'Failed to fetch account details.');
  }
};


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
      [Query.orderDesc('$createdAt')]  // You can add queries here if needed
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

// Get Latest Posts
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

// Search Query - Only for Videos.
export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [
        Query.search('title', query),  // Wrap the query in an array
      ]  // You can change queries here if needed (or revert back to the one above)
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Search Query - Images
export const searchImages = async (query) => {
  try {
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [Query.search('title', query)]
    );

    return images.documents;
  } catch (error) {
    throw new Error(error.message || 'Failed to search images.');
  }
};

// Get Profile (user) Posts. Images + Videos.
export const getUserPosts = async (userId) => {
  try {
    // Fetch videos
    const videos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.equal('creator', userId)]
    );

    // Fetch images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [Query.equal('creator', userId)]
    );

    // Combine results
    const combinedPosts = [...videos.documents, ...images.documents];
    
    return combinedPosts;
  } catch (error) {
    throw new Error(error);
  }
}

// LOGOUT FUNCTION
export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error)
  }
}

// GET FILE PREVIEW + VIDEO VIEW
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(config.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        config.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// UPLOAD FUNCTION TO STORAGE BUCKETS
export const uploadFile = async (file, type) => {
  if(!file) return;
  
  const asset = { 
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };
  
  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
  }
  
  
// UPLOADING TO APPWRITE DATABASE (Video or Image based on the type)
export async function createPost(form, type) {
  try {
    const [thumbnailUrl, assetUrl] = await Promise.all([
      form.thumbnail ? uploadFile(form.thumbnail, "image") : null,
      form.asset ? uploadFile(form.asset, type) : null,
    ]);

    const collectionId = type === "video" ? config.videoCollectionId : config.imageCollectionId;

    const newPost = await databases.createDocument(
      config.databaseId,
      collectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        [type]: assetUrl, // dynamically store the asset as either video or image
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}

  