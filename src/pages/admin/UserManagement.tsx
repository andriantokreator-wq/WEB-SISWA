import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function UserManagement() {
  const { user: currentUser, role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const isOwner = currentUser?.email === 'andriantokreator@gmail.com';

  const fetchUsers = async () => {
    try {
      const snapUsers = await getDocs(collection(db, "users"));
      const snapInvites = await getDocs(collection(db, "invites"));
      
      const usersData = snapUsers.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const existingEmails = new Set(usersData.map(u => u.email));
      const invitesData = snapInvites.docs
        .map(doc => ({ id: doc.id, ...doc.data(), isInvite: true } as any))
        .filter(invite => !existingEmails.has(invite.email));
      
      setUsers([...usersData, ...invitesData]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    // Check if email already exists
    if (users.find(u => u.email === inviteEmail)) {
      toast.error("Email sudah ada di daftar pengguna atau undangan");
      return;
    }
    
    setInviting(true);
    try {
      const newUser = {
        email: inviteEmail,
        role: "superadmin",
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "invites"), newUser);
      
      setUsers([...users, { id: docRef.id, ...newUser, isInvite: true, createdAt: { toDate: () => new Date() } }]);
      setInviteEmail("");
      toast.success("Admin berhasil ditambahkan! Silahkan minta mereka untuk login.");
    } catch (error) {
      console.error("Error inviting:", error);
      toast.error("Gagal menambahkan admin");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, isInvite?: boolean) => {
    try {
      if (isInvite) {
         await updateDoc(doc(db, "invites", userId), { role: newRole });
      } else {
         await updateDoc(doc(db, "users", userId), { role: newRole });
      }
      toast.success("Peran pengguna berhasil diperbarui");
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Gagal memperbarui peran");
    }
  };

  const handleDelete = async (userId: string, isInvite?: boolean) => {
    try {
      if (isInvite) {
        await deleteDoc(doc(db, "invites", userId));
      } else {
        await deleteDoc(doc(db, "users", userId));
      }
      toast.success("Pengguna dihapus");
      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Gagal menghapus pengguna");
    }
  };

  if (role !== "superadmin") {
    return <div className="p-8 text-center text-red-500 font-bold">Akses Ditolak</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden border-t-4 border-t-blue-900">
        <div className="p-6">
          <h2 className="text-2xl font-serif italic font-bold text-slate-900">Tambahkan Admin</h2>
          <p className="text-sm text-slate-500 mt-1">Undang pengguna lain menjadi Admin menggunakan email Google mereka.</p>
          
          <form onSubmit={handleInvite} className="mt-4 flex gap-3 max-w-md">
            <Input 
              type="email" 
              placeholder="email@gmail.com" 
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="border-slate-300 focus-visible:ring-blue-600 rounded-sm"
              disabled={inviting}
            />
            <Button type="submit" disabled={inviting} className="rounded-sm bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              {inviting ? "Menambahkan..." : "Tambah"}
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-serif italic font-bold text-slate-900">Daftar Pengguna</h2>
          <p className="text-sm text-slate-500 mt-1">Ubah peran pengguna atau hapus pengguna.</p>
        </div>
        
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[700px]">
        <TableHeader className="bg-slate-50 border-b-2 border-slate-900">
          <TableRow>
            <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Nama</TableHead>
            <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Email</TableHead>
            <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Terdaftar</TableHead>
            <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Peran</TableHead>
            <TableHead className="text-right font-bold text-slate-800 uppercase tracking-widest text-[10px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 font-serif italic text-slate-500">Memuat...</TableCell></TableRow>
          ) : users.map(u => (
            <TableRow key={u.id} className={u.isInvite ? "bg-slate-50 border-l-2 border-l-blue-400" : ""}>
              <TableCell className="font-bold text-slate-900">
                {u.name || (u.isInvite ? <span className="text-slate-400 font-normal italic text-xs">Belum login (Undangan)</span> : "-")}
              </TableCell>
              <TableCell className="font-mono text-xs">{u.email}</TableCell>
              <TableCell className="text-xs text-slate-500 font-medium">
                {u.createdAt ? format(u.createdAt.toDate(), "dd MMM yyyy") : '-'}
              </TableCell>
              <TableCell>
                {u.email === 'andriantokreator@gmail.com' ? (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200 font-bold uppercase tracking-widest text-[9px]">Super Admin</Badge>
                ) : (
                  <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val, u.isInvite)} disabled={!isOwner && u.role === 'superadmin'}>
                    <SelectTrigger className="w-[120px] h-8 text-[10px] font-bold uppercase tracking-widest rounded-sm border-slate-300 focus:ring-blue-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user" className="text-xs">User</SelectItem>
                      <SelectItem value="editor" className="text-xs">Editor</SelectItem>
                      <SelectItem value="superadmin" className="text-xs">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-right">
                {deleteConfirm === u.id ? (
                  <div className="flex justify-end items-center gap-1">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id, u.isInvite)} className="h-8 text-[10px] font-bold">
                      Hapus
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setDeleteConfirm(null)} className="h-8 w-8">
                      X
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setDeleteConfirm(u.id)}
                    disabled={u.email === 'andriantokreator@gmail.com' || (!isOwner && u.role === 'superadmin')}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      </div>
    </div>
  );
}
