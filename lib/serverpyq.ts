import {  storage } from "./supabase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadPYQ = async (file, data) => {
  const storageRef = ref(storage, `pyqs/${file.name}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "pyqs"), {
    title: data.title,
    branch: data.branch,
    semester: data.semester,
    year: data.year,
    pdfUrl: url
  });
};

export const getPYQs = async () => {
  const querySnapshot = await getDocs(collection(db, "pyqs"));
  return querySnapshot.docs.map(doc => doc.data());
};