import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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

        if (userDoc.exists()) {
          currentRole = userDoc.data().role;
          
          if (currentUser.email === "andriantokreator@gmail.com" && currentRole !== "superadmin") {
            currentRole = "superadmin";
            await setDoc(userDocRef, { role: "superadmin" }, { merge: true });
          }
        } else {
          // Check if invited
          const q = query(collection(db, "invites"), where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const inviteDoc = querySnapshot.docs[0];
            currentRole = inviteDoc.data().role || "superadmin";
            // Do not delete the invite here as the client might not have permission yet (new user)
            // Or wait, if we grant them superadmin, they still can't delete it before their user doc is created.
            // But we don't necessarily need to delete it.
          } else if (currentUser.email === "andriantokreator@gmail.com") {
            currentRole = "superadmin";
          }
          
          await setDoc(userDocRef, {
            email: currentUser.email,
            name: currentUser.displayName,
            role: currentRole,
            createdAt: new Date()
          });
        }
        
        setRole(currentRole);
      } else {
        setRole(null);
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
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
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
