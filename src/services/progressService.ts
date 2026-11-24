import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export const SEAT_PATTERN = /^[1-9][0-9]{0,2}$/;
export const SEAT_MAX_LENGTH = 3;
const COLLECTION_NAME = 'studentProgress';

export interface StudentProgressRecord {
  seatNumber: string;
  warmupCompleted: number[];
  visualPresetsExplored: string[];
  elfBlankSolved: boolean;
  sortCompleted: number;
  rankCompletedModes: string[];
  mazeCompleted: boolean;
  quizSubmitted: boolean;
  quizScore: number;
  quizCorrectCount: number;
  lastStage: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export function normalizeSeatInput(raw: string): string | null {
  const trimmed = raw.trim().replace(/^0+/, '');
  if (!trimmed || trimmed.length > SEAT_MAX_LENGTH || !SEAT_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export async function ensureStudentRecord(seatNumber: string): Promise<StudentProgressRecord> {
  const docPath = `${COLLECTION_NAME}/${seatNumber}`;
  const docRef = doc(db, COLLECTION_NAME, seatNumber);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StudentProgressRecord;
    }

    const initialPayload = {
      seatNumber,
      warmupCompleted: [],
      visualPresetsExplored: [],
      elfBlankSolved: false,
      sortCompleted: 0,
      rankCompletedModes: [],
      mazeCompleted: false,
      quizSubmitted: false,
      quizScore: 0,
      quizCorrectCount: 0,
      lastStage: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, initialPayload);
    return {
      ...initialPayload,
      createdAt: null,
      updatedAt: null,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export interface StudentProgressPatch {
  addWarmupIdx?: number;
  addVisualPreset?: string;
  elfBlankSolved?: boolean;
  sortCompleted?: number;
  addRankMode?: string;
  mazeCompleted?: boolean;
  quizResult?: { score: number; correctCount: number };
  lastStage?: number;
}

export async function recordStudentProgress(
  seatNumber: string,
  patch: StudentProgressPatch
): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${seatNumber}`;
  const docRef = doc(db, COLLECTION_NAME, seatNumber);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await ensureStudentRecord(seatNumber);
    }
    const freshSnap = await getDoc(docRef);
    const current = (freshSnap.data() as StudentProgressRecord) || {
      seatNumber,
      warmupCompleted: [],
      visualPresetsExplored: [],
      elfBlankSolved: false,
      sortCompleted: 0,
      rankCompletedModes: [],
      mazeCompleted: false,
      quizSubmitted: false,
      quizScore: 0,
      quizCorrectCount: 0,
      lastStage: 0,
    };

    const updateFields: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (
      patch.addWarmupIdx !== undefined &&
      patch.addWarmupIdx >= 0 &&
      patch.addWarmupIdx <= 2 &&
      !current.warmupCompleted.includes(patch.addWarmupIdx)
    ) {
      updateFields.warmupCompleted = [...current.warmupCompleted, patch.addWarmupIdx].slice(0, 3);
    }

    if (
      patch.addVisualPreset &&
      ['ex1', 'ex2', 'ex3', 'ex4', 'ex5'].includes(patch.addVisualPreset) &&
      !current.visualPresetsExplored.includes(patch.addVisualPreset)
    ) {
      updateFields.visualPresetsExplored = [
        ...current.visualPresetsExplored,
        patch.addVisualPreset,
      ].slice(0, 5);
    }

    if (patch.elfBlankSolved && !current.elfBlankSolved) {
      updateFields.elfBlankSolved = true;
    }

    if (
      patch.sortCompleted !== undefined &&
      patch.sortCompleted > current.sortCompleted &&
      patch.sortCompleted <= 12
    ) {
      updateFields.sortCompleted = Math.min(12, Math.max(0, Math.floor(patch.sortCompleted)));
    }

    if (
      patch.addRankMode &&
      ['basic', 'challenge', 'random'].includes(patch.addRankMode) &&
      !current.rankCompletedModes.includes(patch.addRankMode)
    ) {
      updateFields.rankCompletedModes = [...current.rankCompletedModes, patch.addRankMode].slice(
        0,
        3
      );
    }

    if (patch.mazeCompleted && !current.mazeCompleted) {
      updateFields.mazeCompleted = true;
    }

    if (patch.quizResult) {
      updateFields.quizSubmitted = true;
      updateFields.quizScore = Math.min(100, Math.max(0, Math.floor(patch.quizResult.score)));
      updateFields.quizCorrectCount = Math.min(
        10,
        Math.max(0, Math.floor(patch.quizResult.correctCount))
      );
    }

    if (patch.lastStage !== undefined && patch.lastStage >= 0 && patch.lastStage <= 6) {
      updateFields.lastStage = patch.lastStage;
    }

    if (Object.keys(updateFields).length > 1) {
      await updateDoc(docRef, updateFields);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export function subscribeAllStudentProgress(
  onData: (records: StudentProgressRecord[]) => void,
  onError: (err: Error) => void
): () => void {
  const path = COLLECTION_NAME;
  return onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot) => {
      const list: StudentProgressRecord[] = snapshot.docs.map(
        (d) => d.data() as StudentProgressRecord
      );
      list.sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function deleteStudentProgress(seatNumber: string): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${seatNumber}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, seatNumber));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
