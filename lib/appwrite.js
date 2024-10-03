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
  galleriesCollectionId: "66f06208002c5f6d7f3b",
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
galleriesCollectionId,
} = config;

// Init React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Appwrite Endpoint
  .setProject(config.projectId) // Project ID
  .setPlatform(config.platform) // Application ID or bundle ID.

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

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

// ORIGINAL Sign In
export const signIn = async (email, password) => {
  try {
        // await account.deleteSessions(); KEEP THIS COMMENTED OUT
    const session = await account.createEmailPasswordSession(email, password);
    // console.log('Session created:', session); CAN SKIP THIS LINE
    return session;
  } catch (error) {
    console.error('Sign In Error:', error.response ? error.response.data : error.message);
    throw new Error(error.message || 'Failed to sign in.');
  }
};

// SIGN IN WITH ASYNCSTORAGE
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const signIn = async (email, password) => {
//   try {
//     const session = await account.createEmailPasswordSession(email, password);
//     console.log('Session created:', session);

//     // Save session locally
//     await AsyncStorage.setItem('userSession', JSON.stringify(session));

//     return session;
//   } catch (error) {
//     console.error('Sign In Error:', error.response ? error.response.data : error.message);
//     throw new Error(error.message || 'Failed to sign in.');
//   }
// };

// Get Account
export const getAccount = async () => {
  try {
    // await account.deleteSessions(); 
    console.log('Checking session...');
    const currentAccount = await account.get();
    console.log("Logged in as:", currentAccount.email);
    // console.log('Current Account:', currentAccount); CAN SKIP THIS LINE
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
      [Query.orderDesc('$createdAt')]
    );
    
    // Fetch images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [Query.orderDesc('$createdAt')]
    );

    // Combine videos and images
    const posts = [...videos.documents, ...images.documents];

    // Sort combined posts by creation date (newest first)
    posts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    return posts;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
}

// Get Latest Posts (Videos + Images)
export const getLatestPosts = async () => {
  try {
    // Fetch latest videos
    const videos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(7)]
    );

    // Fetch latest images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(7)]
    );

    // Combine and sort all posts
    const posts = [...videos.documents, ...images.documents];
    posts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    // Return only the latest 7 posts
    return posts.slice(0, 7);
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    throw error;
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

// GET ALL POSTS
export const getUserPosts = async (userId) => {
  try {
    // Fetch videos
    const videos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [
        Query.equal('creator', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    // Fetch images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [
        Query.equal('creator', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    // Combine results
    const combinedPosts = [...videos.documents, ...images.documents];
    
    // Sort combined posts by creation date (newest first)
    combinedPosts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    return combinedPosts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
}

// ORIGINAL LOGOUT FUNCTION
export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error)
  }
}

// LOGOUT WITH ASYNC STORAGE
// export const signOut = async () => {
//   try {
//     await account.deleteSession("current");  // Log out from Appwrite

//     // Clear the local session
//     await AsyncStorage.removeItem('userSession');

//     console.log('User logged out and session cleared');
//   } catch (error) {
//     throw new Error(error);
//   }
// };


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
  if (!file) return;

  const asset = { 
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {
    // Upload file to Appwrite storage
    const uploadedFile = await storage.createFile(
      config.storageId, // Your storage bucket ID
      ID.unique(), // Ensure unique ID for the file
      asset // Pass the asset directly
    );

    // console.log("Uploaded file response:", uploadedFile); // Log the full uploaded file response

    // Check if the upload was successful and the file has a valid $id
    if (!uploadedFile.$id) {
      throw new Error('File upload failed: No $id in response');
    }

    // Use Appwrite's getFileView method to generate the correct URL
    const fileUrl = storage.getFileView(config.storageId, uploadedFile.$id);

    return fileUrl; // Return the correctly formatted file URL
  } catch (error) {
    console.error("Error during file upload:", error.message || error);
    throw new Error('Failed to upload file.');
  }
};

  
  
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


// GALLERIES FUNCTIONS
export const createGallery = async ({ title, thumbnail, assets, assetType, userId }) => {
  try {
    const thumbnailUrl = await uploadFile(thumbnail, 'image');
    const assetUrls = await Promise.all(assets.map(asset => uploadFile(asset, assetType)));

    const newGallery = await databases.createDocument(
      config.databaseId,
      config.galleriesCollectionId,
      ID.unique(),
      {
        title,
        thumbnail: thumbnailUrl,
        [assetType === 'image' ? 'images' : 'videos']: assetUrls,
        users: userId
      }
    );

    console.log("Gallery created successfully:", newGallery);

    // Fetch updated galleries after successful creation
    const updatedGalleries = await fetchGalleries();
    return { newGallery, updatedGalleries }; // Return both the new gallery and updated galleries list
  } catch (error) {
    console.error("Error creating gallery:", error.message);
    throw new Error(error.message || "Failed to create gallery.");
  }
};

// FETCH THE GALLERIES AFTER CREATING ONE
export const fetchGalleries = async () => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.galleriesCollectionId
    );
    return response.documents; // Return the list of galleries
  } catch (error) {
    console.error("Error fetching galleries:", error.message);
    throw new Error(error.message || "Failed to fetch galleries.");
  }
};





// Add images to a gallery (using the gallery ID)
export const addImagesToGallery = async (galleryId, newImageUrls) => {
  try {
    // First, fetch the current gallery data
    const currentGallery = await databases.getDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId
    );

    // Append the new images to the existing array
    const updatedImages = [...(currentGallery.images || []), ...newImageUrls];

    // Update the gallery with the appended images array
    const gallery = await databases.updateDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId,
      {
        images: updatedImages,
      }
    );
    return gallery;
  } catch (error) {
    console.error("Error adding images to gallery:", error);
    throw new Error(error);
  }
};


// Add videos to a gallery (using the gallery ID)
export const addVideosToGallery = async (galleryId, newVideoUrls) => {
  try {
    // First, fetch the current gallery data
    const currentGallery = await databases.getDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId
    );

    // Append the new videos to the existing array
    const updatedVideos = [...(currentGallery.videos || []), ...newVideoUrls];

    // Update the gallery with the appended videos array
    const gallery = await databases.updateDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId,
      {
        videos: updatedVideos,
      }
    );
    return gallery;
  } catch (error) {
    console.error("Error adding videos to gallery:", error);
    throw new Error(error);
  }
};


export const getLatestGalleries = async () => {
  try {
    // Fetch the latest galleries
    const galleries = await databases.listDocuments(
      databaseId,
      galleriesCollectionId,  // Use your galleries collection ID
      [Query.orderDesc('$createdAt'), Query.limit(10)]  // Sort by creation date and limit to 7
    );

    // Sort galleries by creation date (already sorted in the query, but just in case)
    const sortedGalleries = galleries.documents.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    // Return only the latest 7 galleries
    return sortedGalleries.slice(0, 10);
  } catch (error) {
    console.error("Error fetching latest galleries:", error);
    throw error;
  }
};


// Function to delete a document and its associated files
export const deleteGallery = async (collectionId, documentId, imageUrls = [], videoUrls = []) => {
  try {
    // Delete associated images/videos from storage
    const promises = [...imageUrls, ...videoUrls].map(async (url) => {
      const fileId = getFileIdFromUrl(url); // Helper function to extract file ID
      if (fileId) {
        await storage.deleteFile(config.storageId, fileId); // Delete the file from storage
      }
    });

    // Wait for all files to be deleted
    await Promise.all(promises);

    // Now delete the gallery document from the database
    await databases.deleteDocument(config.databaseId, collectionId, documentId);
    console.log(`Gallery with ID ${documentId} and its files deleted successfully.`);
  } catch (error) {
    console.error("Error deleting gallery:", error.message);
    throw error;
  }
};

// Helper function to extract the file ID from the file URL
const getFileIdFromUrl = (url) => {
  const regex = /files\/([a-zA-Z0-9]+)\//; // Extract the file ID from the URL
  const match = url.match(regex);
  return match ? match[1] : null;
};
