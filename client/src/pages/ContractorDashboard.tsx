import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HardHat,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Building,
} from 'lucide-react';
import { Project, ContractorProgressSubmission } from '../types';

export const ContractorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const handleDemoContractorLogin = async () => {
    setLoginLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'contractor@makkalsaantru.gov.in',
          password: 'contractor123',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed demo contractor login');
      
      localStorage.setItem('makkalsaantru_token', data.token);
      localStorage.setItem('makkalsaantru_user', JSON.stringify(data.user));
      localStorage.setItem('ms_auth_token', data.token);

      await fetchAssignedProjects();
    } catch (err: any) {
      setError(err.message || 'Demo contractor login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchAssignedProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || localStorage.getItem('ms_auth_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/contractor/assigned-projects', { headers });

      if (!res.ok) {
        throw new Error('Failed to fetch assigned projects. Please log in as an authorized contractor.');
      }

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || 'Error loading contractor projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" /> VERIFIED BY HUMAN AUTHORITY
          </span>
        );
      case 'MORE_EVIDENCE_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> MORE EVIDENCE REQUESTED
          </span>
        );
      case 'FIELD_INSPECTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Clock className="w-3.5 h-3.5" /> FIELD INSPECTION SCHEDULED
          </span>
        );
      case 'NOT_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> PROGRESS NOT CONFIRMED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5" /> AWAITING PUBLIC / HUMAN REVIEW
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HardHat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  OFFICIAL CONTRACTOR WORKSPACE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-1">Contractor Execution Portal</h1>
              <p className="text-sm text-slate-400">
                Upload real-time ground evidence for assigned public works. Evidence is evaluated by citizens, AI, and field inspectors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDemoContractorLogin}
              disabled={loginLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20"
            >
              <HardHat className="w-4 h-4" /> {loginLoading ? 'Logging In...' : 'Demo Login as Contractor'}
            </button>
            <button
              onClick={fetchAssignedProjects}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Security Rule Notice */}
        <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-200">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-300">Evidence Transparency Rule:</span> Submitted contractor evidence cannot be overwritten or self-verified. If additional documentation is requested by an inspector, submit a new version to preserve full audit history.
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading assigned public work projects...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-950/40 border border-red-800 p-4 rounded-xl text-red-200 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span>{error}</span>
            <button
              onClick={handleDemoContractorLogin}
              disabled={loginLoading}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shrink-0"
            >
              {loginLoading ? 'Logging In...' : '⚡ Quick Login as Demo Contractor'}
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((proj) => {
              const latestSubmission: ContractorProgressSubmission | undefined =
                proj.contractorSubmissions && proj.contractorSubmissions.length > 0
                  ? proj.contractorSubmissions[0]
                  : undefined;

              return (
                <div
                  key={proj.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {proj.verificationCode || 'MS-PROJECT'}
                        </span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">{proj.category}</span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-1">{proj.title}</h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {proj.location}
                      </p>
                    </div>

                    <Link
                      to={`/contractor/projects/${proj.id}/progress/new`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 shrink-0"
                    >
                      <Upload className="w-4 h-4" /> UPLOAD PROGRESS EVIDENCE
                    </Link>
                  </div>

                  {/* Stages & Progress Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Stages Column */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" /> Configured Work Stages
                      </h3>
                      <div className="space-y-2">
                        {proj.stages && proj.stages.length > 0 ? (
                          proj.stages.map((st) => (
                            <div
                              key={st.id}
                              className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                                  {st.sequence}
                                </span>
                                <div>
                                  <div className="font-semibold text-slate-200">{st.name}</div>
                                  {st.description && <div className="text-xs text-slate-500">{st.description}</div>}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 italic">No stages configured.</div>
                        )}
                      </div>
                    </div>

                    {/* Latest Submission Column */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400" /> Latest Submitted Evidence
                      </h3>

                      {latestSubmission ? (
                        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Version {latestSubmission.version} • {new Date(latestSubmission.submittedAt).toLocaleDateString()}
                            </span>
                            {getStatusBadge(latestSubmission.status)}
                          </div>

                          <div className="font-semibold text-slate-200 text-sm">{latestSubmission.title}</div>
                          <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg italic border border-slate-800">
                            "{latestSubmission.claim}"
                          </p>

                          {latestSubmission.evidences && latestSubmission.evidences.length > 0 && (
                            <div className="flex items-center gap-3 pt-2">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                                <img
                                  src={latestSubmission.evidences[0].fileUrl}
                                  alt="Contractor Evidence"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs space-y-1 text-slate-400">
                                <div className="font-mono text-emerald-400">SHA-256 Verified</div>
                                <div className="truncate max-w-[200px] text-slate-500">{latestSubmission.evidences[0].sha256Hash?.slice(0, 20)}...</div>
                              </div>
                            </div>
                          )}

                          {latestSubmission.status === 'MORE_EVIDENCE_REQUIRED' && (
                            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                              <span>Field Inspector requested additional ground evidence.</span>
                              <Link
                                to={`/contractor/projects/${proj.id}/progress/new`}
                                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded text-xs hover:bg-amber-400 transition"
                              >
                                Upload Version {latestSubmission.version + 1}
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-950/40 border border-dashed border-slate-800 p-8 rounded-xl text-center space-y-3">
                          <Building className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-500">No progress updates uploaded yet for this project.</p>
                          <Link
                            to={`/contractor/projects/${proj.id}/progress/new`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:underline"
                          >
                            Submit First Progress Evidence <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;
