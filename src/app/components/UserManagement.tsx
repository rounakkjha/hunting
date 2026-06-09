import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, User as UserIcon, Crown, Key } from 'lucide-react';
import { getAllUsers, createUser, deleteUser, updateUserRole } from '../utils/auth';
import type { User } from '../App';

interface UserManagementProps {
  currentUser: User | null;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = currentUser?.role === 'superadmin';

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    setLoading(true);
    const success = await createUser(newUsername.trim(), newPassword.trim(), newRole);
    if (success) {
      setNewUsername('');
      setNewPassword('');
      setShowAddForm(false);
      loadUsers();
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      const success = await deleteUser(userId);
      if (success) {
        loadUsers();
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin' | 'superadmin') => {
    if (userId === currentUser?.id && newRole !== 'superadmin') {
      alert('You cannot demote yourself from superadmin');
      return;
    }
    const success = await updateUserRole(userId, newRole);
    if (success) {
      loadUsers();
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-purple-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl ring-1 ring-purple-500/20">
                <Crown className="w-5 h-5 text-purple-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">User Management</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {users.length} user{users.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add User
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {showAddForm && (
            <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-background/50 rounded-2xl border border-border/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-foreground/90 mb-1 block">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/90 mb-1 block">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/90 mb-1 block">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                    className="w-full px-4 py-2.5 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-muted/50 text-muted-foreground rounded-xl text-sm hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center ring-1 ring-purple-500/20">
                <Users className="w-10 h-10 text-purple-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No users yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create user accounts to allow others to use the application
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 p-4 bg-background/50 rounded-2xl border border-border/60"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      user.role === 'superadmin' ? 'bg-purple-500/10' : 
                      user.role === 'admin' ? 'bg-blue-500/10' : 'bg-muted/50'
                    }`}>
                      {user.role === 'superadmin' ? (
                        <Crown className="w-4 h-4 text-purple-500" strokeWidth={2.5} />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                      ) : (
                        <UserIcon className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{user.username}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.role !== 'superadmin' && (
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as 'user' | 'admin' | 'superadmin')}
                        className="px-3 py-1.5 bg-background/60 rounded-lg border border-border/60 text-xs focus:ring-2 focus:ring-primary/30 outline-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    )}
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
