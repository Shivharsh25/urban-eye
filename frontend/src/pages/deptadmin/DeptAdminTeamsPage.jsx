import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Phone,
  Wrench,
  CheckCircle2,
  Clock,
  Radio,
  Search,
  Shield,
  X
} from 'lucide-react';

export default function DeptAdminTeamsPage() {
  const [teams, setTeams] = useState([
    {
      id: 'team-1',
      name: 'Rapid Response Unit 01',
      lead: 'Foreman Rajesh Verma',
      phone: '+91 98111 22334',
      status: 'On-Site',
      currentAssignment: 'Pothole restoration on Sector 62 Main Blvd',
      vehicle: 'TATA Xenon Patrol (UP-16-BD-8901)',
      membersCount: 4
    },
    {
      id: 'team-2',
      name: 'Heavy Works & Compaction 03',
      lead: 'Engineer Sunita Pal',
      phone: '+91 98222 33445',
      status: 'Available',
      currentAssignment: 'None (Standby at Depot 4)',
      vehicle: 'Road Roller + Asphalt Hauler (UP-16-EQ-1122)',
      membersCount: 6
    },
    {
      id: 'team-3',
      name: 'Emergency Night Dispatch',
      lead: 'Supervisor Anand Kumar',
      phone: '+91 98333 44556',
      status: 'Available',
      currentAssignment: 'Scheduled for 20:00 - 04:00 shift',
      vehicle: 'Utility Tipper (UP-16-TR-4567)',
      membersCount: 3
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    lead: '',
    phone: '',
    vehicle: '',
    membersCount: 4
  });

  const handleCreateTeam = (e) => {
    e.preventDefault();
    const created = {
      id: `team-${Date.now()}`,
      name: newTeam.name,
      lead: newTeam.lead,
      phone: newTeam.phone,
      vehicle: newTeam.vehicle || 'Standard Department Carrier',
      membersCount: Number(newTeam.membersCount) || 4,
      status: 'Available',
      currentAssignment: 'Ready for dispatch'
    };
    setTeams(prev => [created, ...prev]);
    setModalOpen(false);
    setNewTeam({ name: '', lead: '', phone: '', vehicle: '', membersCount: 4 });
  };

  const handleToggleStatus = (teamId) => {
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId
          ? { ...t, status: t.status === 'Available' ? 'On-Site' : 'Available' }
          : t
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Users2 className="w-6 h-6 text-teal-400" />
            <span>Field Maintenance & Response Teams</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Roster of authorized municipal crews, vehicle tracking, and real-time dispatch availability.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#005C66] to-[#00897B] hover:from-[#004e57] hover:to-[#00796B] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-teal-950/50 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Response Unit</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const isAvailable = team.status === 'Available';
          return (
            <div
              key={team.id}
              className="bg-[#082027] border border-teal-950 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-teal-800 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{team.name}</h3>
                      <span className="text-[10px] text-slate-400">{team.membersCount} crew members</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isAvailable
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-[#06181D] p-3.5 rounded-xl border border-teal-950 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit Lead:</span>
                    <span className="font-semibold text-white">{team.lead}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-teal-300">{team.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Carrier / Vehicle:</span>
                    <span className="text-slate-200 truncate max-w-[150px]">{team.vehicle}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Current Assignment</span>
                  <p className="text-slate-200 line-clamp-2">{team.currentAssignment}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-teal-950 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(team.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    isAvailable
                      ? 'bg-amber-950/30 text-amber-300 border-amber-900/50 hover:bg-amber-900/40'
                      : 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/40'
                  }`}
                >
                  {isAvailable ? 'Dispatch to Site' : 'Mark Available'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#082027] border border-teal-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900 mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Users2 className="w-5 h-5 text-teal-400" />
                <span>Register Response Unit</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit Name *</label>
                <input
                  type="text"
                  required
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g. Quick Patch Unit 05"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Crew Leader / Supervisor *</label>
                <input
                  type="text"
                  required
                  value={newTeam.lead}
                  onChange={(e) => setNewTeam({ ...newTeam, lead: e.target.value })}
                  placeholder="e.g. Supervisor Dinesh Tyagi"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newTeam.phone}
                    onChange={(e) => setNewTeam({ ...newTeam, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Crew Size</label>
                  <input
                    type="number"
                    min="1"
                    value={newTeam.membersCount}
                    onChange={(e) => setNewTeam({ ...newTeam, membersCount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Vehicle / Equipment</label>
                <input
                  type="text"
                  value={newTeam.vehicle}
                  onChange={(e) => setNewTeam({ ...newTeam, vehicle: e.target.value })}
                  placeholder="e.g. Utility Truck (UP-16-ZZ-9999)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-teal-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-bold tracking-wider uppercase"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

