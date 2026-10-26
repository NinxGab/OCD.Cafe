import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftSchedule } from '../../types';
import {
  CalendarDays,
  Clock,
  Plus,
  Pencil,
  Trash2,
  User,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';

export const StaffSchedule: React.FC = () => {
  const { shifts, staffList, updateShift, addShift, deleteShift, clockInOutStaff } = useApp();

  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftSchedule | null>(null);

  // Form state
  const [formStaffId, setFormStaffId] = useState(staffList[0]?.id || '');
  const [formDay, setFormDay] = useState(1);
  const [formShiftType, setFormShiftType] = useState<ShiftSchedule['shiftType']>('morning');
  const [formStart, setFormStart] = useState('07:00 AM');
  const [formEnd, setFormEnd] = useState('03:00 PM');
  const [formNotes, setFormNotes] = useState('');

  const daysOfWeek = [
    { index: 1, name: 'Monday' },
    { index: 2, name: 'Tuesday' },
    { index: 3, name: 'Wednesday' },
    { index: 4, name: 'Thursday' },
    { index: 5, name: 'Friday' },
    { index: 6, name: 'Saturday' },
    { index: 0, name: 'Sunday' },
  ];

  const shiftPresets = {
    morning: { start: '07:00 AM', end: '03:00 PM', label: 'Morning Shift' },
    mid: { start: '10:00 AM', end: '07:00 PM', label: 'Mid-Day Rush' },
    evening: { start: '02:00 PM', end: '10:00 PM', label: 'Evening & Close' },
    off: { start: '--', end: '--', label: 'Day Off' },
  };

  const dayShifts = shifts.filter(s => s.dayOfWeek === selectedDay);

  const handleOpenAdd = () => {
    setEditingShift(null);
    setFormStaffId(staffList[0]?.id || '');
    setFormDay(selectedDay);
    setFormShiftType('morning');
    setFormStart(shiftPresets.morning.start);
    setFormEnd(shiftPresets.morning.end);
    setFormNotes('');
    setShowAddShiftModal(true);
  };

  const handleOpenEdit = (shift: ShiftSchedule) => {
    setEditingShift(shift);
    setFormStaffId(shift.staffId);
    setFormDay(shift.dayOfWeek);
    setFormShiftType(shift.shiftType);
    setFormStart(shift.startTime);
    setFormEnd(shift.endTime);
    setFormNotes(shift.notes || '');
    setShowAddShiftModal(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === formStaffId);
    const staffName = staff ? staff.name : 'Unknown';

    if (editingShift) {
      updateShift(editingShift.id, {
        staffId: formStaffId,
        staffName,
        dayOfWeek: formDay,
        shiftType: formShiftType,
        startTime: formStart,
        endTime: formEnd,
        notes: formNotes,
      });
    } else {
      addShift({
        staffId: formStaffId,
        staffName,
        dayOfWeek: formDay,
        shiftType: formShiftType,
        startTime: formStart,
        endTime: formEnd,
        notes: formNotes,
      });
    }
    setShowAddShiftModal(false);
  };

  return (
    <div className="flex-1 bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#432d1e] flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#824618]" />
            <span>Staff Shift Scheduling &amp; Attendance</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7a5e4b]">
            Plan weekly shifts, opening/closing coverage, and monitor staff attendance.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Shift</span>
        </button>
      </div>

      {/* Week Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {daysOfWeek.map(d => {
          const isSelected = selectedDay === d.index;
          const count = shifts.filter(s => s.dayOfWeek === d.index).length;

          return (
            <button
              key={d.index}
              onClick={() => setSelectedDay(d.index)}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#824618] text-white border-[#824618] shadow-xs'
                  : 'bg-white text-[#593c28] border-[#e6ded3] hover:bg-[#f5efe6]'
              }`}
            >
              <span>{d.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white text-[#824618]' : 'bg-[#f5efe6] text-[#7a5e4b]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shift Cards Grid for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dayShifts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-[#e0d3c4] p-8 text-center text-[#8c6d5b] space-y-2">
            <Clock className="w-10 h-10 mx-auto text-[#dfd0bf]" />
            <h3 className="font-bold text-base text-[#2c1d16]">No shifts assigned for this day</h3>
            <p className="text-xs">Tap &quot;Assign New Shift&quot; above to schedule coverage for {daysOfWeek.find(d => d.index === selectedDay)?.name}.</p>
          </div>
        ) : (
          dayShifts.map(shift => {
            const staff = staffList.find(s => s.id === shift.staffId);
            const isClockedIn = staff?.shiftStatus === 'clocked_in';

            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl border border-[#e0d3c4] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#281b15] text-white flex items-center justify-center font-bold text-sm">
                        {shift.staffName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#2c1d16]">{shift.staffName}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded ${
                          shift.shiftType === 'morning'
                            ? 'bg-amber-100 text-amber-900'
                            : shift.shiftType === 'mid'
                            ? 'bg-blue-100 text-blue-900'
                            : shift.shiftType === 'evening'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {shift.shiftType} shift
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(shift)}
                        className="p-1.5 text-[#188a8d] hover:bg-[#188a8d]/10 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteShift(shift.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#ebdccb] mt-3 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#2c1d16]">
                      <Clock className="w-4 h-4 text-[#e05326]" />
                      <span>{shift.startTime} - {shift.endTime}</span>
                    </div>
                    {shift.notes && (
                      <p className="text-[11px] text-[#6e503f] italic pl-5">
                        ↳ {shift.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#f0e6da] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="text-[#6e503f]">
                      Status: <strong>{isClockedIn ? 'Clocked In' : 'Clocked Out'}</strong>
                    </span>
                  </div>

                  {staff && (
                    <button
                      onClick={() => clockInOutStaff(staff.id)}
                      className="text-[11px] font-bold text-[#e05326] hover:underline cursor-pointer"
                    >
                      Toggle Attendance
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Shift Modal */}
      {showAddShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveShift}
            className="bg-[#faf7f2] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e5d8c8] flex flex-col"
          >
            <div className="bg-[#281b15] text-[#f7f3ed] p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingShift ? 'Edit Shift Schedule' : 'Schedule Staff Shift'}
                </h3>
                <p className="text-xs text-[#dac7b5]">Set work hours &amp; duty notes</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddShiftModal(false)}
                className="p-1 rounded-lg text-[#dac7b5] hover:text-white hover:bg-[#38261e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5c3e2f] uppercase mb-1">
                  Employee
                </label>
                <select
                  value={formStaffId}
                  onChange={e => setFormStaffId(e.target.value)}
                  className="w-full bg-white border border-[#dfd0bf] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2c1d16] font-semibold focus:outline-none focus:ring-2 focus:ring-[#e05326]/50"
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5c3e2f] uppercase mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formDay}
                    onChange={e => setFormDay(Number(e.target.value))}
                    className="w-full bg-white border border-[#dfd0bf] rounded-xl px-3 py-2 text-xs text-[#2c1d16]"
                  >
                    {daysOfWeek.map(d => (
                      <option key={d.index} value={d.index}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5c3e2f] uppercase mb-1">
                    Shift Category
                  </label>
                  <select
                    value={formShiftType}
                    onChange={e => {
                      const type = e.target.value as ShiftSchedule['shiftType'];
                      setFormShiftType(type);
                      setFormStart(shiftPresets[type].start);
                      setFormEnd(shiftPresets[type].end);
                    }}
                    className="w-full bg-white border border-[#dfd0bf] rounded-xl px-3 py-2 text-xs text-[#2c1d16]"
                  >
                    <option value="morning">Morning Shift (7am-3pm)</option>
                    <option value="mid">Mid-Day Rush (10am-7pm)</option>
                    <option value="evening">Evening Shift (2pm-10pm)</option>
                    <option value="off">Day Off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5c3e2f] uppercase mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formStart}
                    onChange={e => setFormStart(e.target.value)}
                    className="w-full bg-white border border-[#dfd0bf] rounded-xl px-3 py-2 text-xs text-[#2c1d16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5c3e2f] uppercase mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formEnd}
                    onChange={e => setFormEnd(e.target.value)}
                    className="w-full bg-white border border-[#dfd0bf] rounded-xl px-3 py-2 text-xs text-[#2c1d16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c3e2f] uppercase mb-1">
                  Shift Notes / Focus Area
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Barista peak rush, inventory audit, cashier"
                  className="w-full bg-white border border-[#dfd0bf] rounded-xl px-3 py-2 text-xs text-[#2c1d16]"
                />
              </div>
            </div>

            <div className="bg-[#ede2d4] p-4 flex items-center justify-between border-t border-[#dfd0bf]">
              <button
                type="button"
                onClick={() => setShowAddShiftModal(false)}
                className="px-4 py-2 bg-white rounded-xl border border-[#dfd0bf] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#e05326] hover:bg-[#c9451c] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                Save Shift
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
