import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast.success("Peran pengguna berhasil diperbarui");
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Gagal memperbarui peran");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Hapus pengguna ini dari database?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      toast.success("Pengguna dihapus");
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      toast.error("Gagal menghapus pengguna");
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden border-t-4 border-t-blue-900">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-2xl font-serif italic font-bold text-slate-900">Manajemen Pengguna</h2>
        <p className="text-sm text-slate-500 mt-1">Ubah peran pengguna menjadi Editor atau Admin.</p>
      </div>
      
      <Table>
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
            <TableRow key={u.id}>
              <TableCell className="font-bold text-slate-900">{u.name}</TableCell>
              <TableCell className="font-mono text-xs">{u.email}</TableCell>
              <TableCell className="text-xs text-slate-500 font-medium">
                {u.createdAt ? format(u.createdAt.toDate(), "dd MMM yyyy") : '-'}
              </TableCell>
              <TableCell>
                {u.email === 'andriantokreator@gmail.com' ? (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200 font-bold uppercase tracking-widest text-[9px]">Super Admin</Badge>
                ) : (
                  <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
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
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleDelete(u.id)}
                  disabled={u.email === 'andriantokreator@gmail.com'}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
