import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  dbUser: any | null;
  role: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user exists in Firestore
        let userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let currentRole = "user";
        let dbUserData = null;
        
        if (userDoc.exists()) {
          currentRole = userDoc.data().role;
          dbUserData = userDoc.data();
          
          if (currentUser.email === "andriantokreator@gmail.com" && currentRole !== "superadmin") {
            currentRole = "superadmin";
            await setDoc(userDocRef, { role: "superadmin" }, { merge: true });
            dbUserData.role = "superadmin";
          }
        } else {
          // Check if invited
          const q = query(collection(db, "invites"), where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const inviteDoc = querySnapshot.docs[0];
            currentRole = inviteDoc.data().role || "superadmin";
          } else if (currentUser.email === "andriantokreator@gmail.com") {
            currentRole = "superadmin";
          }
          
          const newUserData = {
            email: currentUser.email,
            name: currentUser.displayName,
            role: currentRole,
            createdAt: new Date()
          };
          
          await setDoc(userDocRef, newUserData);
          dbUserData = newUserData;
        }
        
        setRole(currentRole);
        setDbUser(dbUserData);
      } else {
        setRole(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
