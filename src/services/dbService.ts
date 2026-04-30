import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ScamAnalysisResult } from './geminiService';

export interface SavedReport extends ScamAnalysisResult {
  id: string;
  userId: string;
  content: string;
  contentType: 'text' | 'audio';
  timestamp: any;
}

export async function saveReport(content: string, type: 'text' | 'audio', analysis: ScamAnalysisResult) {
  if (!auth.currentUser) return null;

  const path = 'reports';
  try {
    const reportData = {
      userId: auth.currentUser.uid,
      content,
      contentType: type,
      ...analysis,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, path), reportData);
    return { id: docRef.id, ...reportData };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getReports(limitCount = 10) {
  if (!auth.currentUser) return [];

  const path = 'reports';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedReport[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteReport(reportId: string) {
  const path = `reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncUserProfile() {
  if (!auth.currentUser) return;

  const path = `users/${auth.currentUser.uid}`;
  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || 'Anonymous User',
        photoURL: auth.currentUser.photoURL || '',
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
