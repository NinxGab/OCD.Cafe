import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Staff } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Users,
  UserPlus,
  KeyRound,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle,
  X,
  Lock,
  ShieldCheck,
  HardDrive,
  Download,
  Upload,
  Database,
  CheckCircle2
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const {
    staffList,
    currentStaff,
    addStaff,
    updateStaff,
    removeStaff,
    changeStaffPinOrPassword,
    clockInOutStaff,
    orders,
    products,
    shifts,
    customerNumber,
    exportBackupData,
    importBackupData,
  } = useApp();

  const backupInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackupData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaffForPassword, setSelectedStaffForPassword] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Staff['role']>('cashier');
  const [newPin, setNewPin] = useState('1111');
  const [newPassword, setNewPassword] = useState('staff123');

  const [editPin, setEditPin] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addStaff({
      name: newName.trim(),
      role: newRole,
      pin: newPin.trim() || '1234',
      password: newPassword.trim() || 'password',
      shiftStatus: 'clocked_out',
    });

    setShowAddModal(false);
    setNewName('');
    setNewPin('1111');
    setNewPassword('staff123');
  };

  const handleOpenPasswordModal = (staff: Staff) => {
    setSelectedStaffForPassword(staff);
    setEditPin(staff.pin);
    setEditPassword(staff.password || '');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPassword) return;

    changeStaffPinOrPassword(
      selectedStaffForPassword.id,
      editPin.trim() || selectedStaffForPassword.pin,
      editPassword.trim() || selectedStaffForPassword.password
    );

    setSelectedStaffForPassword(null);
  };

  return (
    <div className="flex-1 bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#432d1e] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#824618]" />
            <span>Staff Roster &amp; Sales Productivity</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7a5e4b]">
            Manage employee access, POS tablet PINs, passwords, and track real-time individual sales.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {staffList.map(staff => {
          const isCurrentLoggedIn = currentStaff?.id === staff.id;
          const avgTicket = staff.ordersProcessed > 0 ? staff.totalSales / staff.ordersProcessed : 0;

          return (
            <div
              key={staff.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isCurrentLoggedIn
                  ? 'border-[#824618] ring-2 ring-[#824618]/20'
                  : 'border-[#e6ded3]'
              }`}
            >
              <div>
                {/* Staff Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5efe6] border border-[#dec7b7] text-[#824618] flex items-center justify-center font-black text-lg">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-[#432d1e]">{staff.name}</h3>
                        {isCurrentLoggedIn && (
                          <span className="text-[10px] font-bold bg-[#824618]/15 text-[#824618] px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className={`font-bold uppercase text-[10px] px-2 py-0.2 rounded ${
                          staff.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : staff.role === 'cashier'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {staff.role}
                        </span>
                        <span className="text-[#7a5e4b] text-[11px] font-mono">
                          PIN: {staff.pin}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => clockInOutStaff(staff.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      staff.shiftStatus === 'clocked_in'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {staff.shiftStatus === 'clocked_in' ? '● Clocked In' : '○ Clocked Out'}
                  </button>
                </div>

                {/* Individual Real-Time Sales Metrics */}
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#f0e8de] mt-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a5e4b] block">
                    Individual Sales Performance
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-[#e6ded3]">
                      <span className="text-[10px] text-[#7a5e4b] block">Total Sales</span>
                      <strong className="text-xs font-black text-[#824618] tabular-nums block">
                        {formatCurrency(staff.totalSales)}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#e6ded3]">
                      <span className="text-[10px] text-[#7a5e4b] block">Orders</span>
                      <strong className="text-xs font-black text-[#432d1e] tabular-nums block">
                        {staff.ordersProcessed}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#e6ded3]">
                      <span className="text-[10px] text-[#7a5e4b] block">Avg Ticket</span>
                      <strong className="text-xs font-black text-[#593c28] tabular-nums block">
                        {formatCurrency(avgTicket)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#f5efe6]">
                <button
                  onClick={() => handleOpenPasswordModal(staff)}
                  className="px-3 py-1.5 bg-[#f5efe6] hover:bg-[#ede4d8] text-[#432d1e] font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#824618]" />
                  <span>Change Password / PIN</span>
                </button>

                <button
                  onClick={() => setStaffToDelete(staff)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Remove staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Persistent Storage & Backup Management Panel */}
      <div className="bg-white rounded-3xl border border-[#e6ded3] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f5efe6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-[#432d1e]">
                  Persistent Storage &amp; Session Continuity
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  100% Saved
                </span>
              </div>
              <p className="text-xs text-[#7a5e4b]">
                All data is preserved in browser storage on this tablet. Logging out, switching users, or exiting the browser will never lose your orders, prices, customer tickets, or staff credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportBackupData}
              className="px-3.5 py-2 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup (.JSON)</span>
            </button>

            <button
              onClick={() => backupInputRef.current?.click()}
              className="px-3.5 py-2 bg-[#f5efe6] hover:bg-[#ede4d8] text-[#432d1e] font-bold rounded-xl text-xs border border-[#e6ded3] cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-[#824618]" />
              <span>Restore Backup</span>
            </button>
            <input
              type="file"
              ref={backupInputRef}
              onChange={handleBackupUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Live Storage Item Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#f0e8de]">
            <span className="text-[10px] uppercase font-bold text-[#7a5e4b] block">Customer Orders</span>
            <span className="text-base font-black text-[#432d1e]">{orders.length} orders saved</span>
          </div>

          <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#f0e8de]">
            <span className="text-[10px] uppercase font-bold text-[#7a5e4b] block">Menu Catalog</span>
            <span className="text-base font-black text-[#432d1e]">{products.length} products saved</span>
          </div>

          <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#f0e8de]">
            <span className="text-[10px] uppercase font-bold text-[#7a5e4b] block">Staff Accounts</span>
            <span className="text-base font-black text-[#432d1e]">{staffList.length} staff saved</span>
          </div>

          <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#f0e8de]">
            <span className="text-[10px] uppercase font-bold text-[#7a5e4b] block">Current Ticket</span>
            <span className="text-base font-black text-[#824618]">Customer #{customerNumber}</span>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateStaff}
            className="bg-[#faf8f5] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e6ded3] flex flex-col"
          >
            <div className="bg-[#f5f0e8] text-[#432d1e] p-4 flex items-center justify-between border-b border-[#e6ded3]">
              <div>
                <h3 className="font-black text-base">Add New Staff / Admin</h3>
                <p className="text-xs text-[#7a5e4b]">Configure role and login PIN</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#7a5e4b] hover:text-[#432d1e] hover:bg-[#ede4d8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                  Employee Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Dennis, Sarah, Maria"
                  className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-sm text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/50 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                  Access Role
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Staff['role'])}
                  className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-xs text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/50"
                >
                  <option value="cashier">Cashier (POS &amp; Orders)</option>
                  <option value="barista">Barista (Beverages &amp; Kitchen)</option>
                  <option value="kitchen">Kitchen Staff (Food prep)</option>
                  <option value="admin">Admin (Full Control: Products, Prices, Reports)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                    Tablet PIN (4 digits)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-sm font-mono text-center tracking-widest text-[#432d1e] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                    Remote Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Secret pass"
                    className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-sm text-[#432d1e]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#f5f0e8] p-4 flex items-center justify-between border-t border-[#e6ded3]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white rounded-xl border border-[#e6ded3] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#824618] hover:bg-[#6c3a14] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Add Staff Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password / PIN Modal */}
      {selectedStaffForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSavePassword}
            className="bg-[#faf8f5] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#e6ded3] flex flex-col"
          >
            <div className="bg-[#f5f0e8] text-[#432d1e] p-4 flex items-center justify-between border-b border-[#e6ded3]">
              <div>
                <h3 className="font-black text-base">Change Password / PIN</h3>
                <p className="text-xs text-[#7a5e4b]">{selectedStaffForPassword.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaffForPassword(null)}
                className="p-1.5 rounded-lg text-[#7a5e4b] hover:text-[#432d1e] hover:bg-[#ede4d8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                  POS Tablet PIN (4 digits)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={editPin}
                  onChange={e => setEditPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-lg font-mono text-center tracking-widest text-[#432d1e] font-black focus:outline-none focus:ring-2 focus:ring-[#824618]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                  Password
                </label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-sm text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/50"
                />
              </div>
            </div>

            <div className="bg-[#f5f0e8] p-4 flex items-center justify-between border-t border-[#e6ded3]">
              <button
                type="button"
                onClick={() => setSelectedStaffForPassword(null)}
                className="px-4 py-2 bg-white rounded-xl border border-[#e6ded3] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#824618] hover:bg-[#6c3a14] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Staff Confirmation */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#432d1e]">Remove Employee?</h3>
              <p className="text-xs text-[#7a5e4b] mt-1">
                Are you sure you want to remove <strong>{staffToDelete.name}</strong> from the roster?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStaffToDelete(null)}
                className="flex-1 py-2 bg-[#f5efe6] rounded-xl text-xs font-bold text-[#432d1e] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeStaff(staffToDelete.id);
                  setStaffToDelete(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
