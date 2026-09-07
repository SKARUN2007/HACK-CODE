import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  HardHat,
  FileText,
  Clock,
} from 'lucide-react';
import { ProjectStage } from '../types';

export const ContractorProgressUploadPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [projectTitle, setProjectTitle] = useState<string>('Public Work Project');
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [claim, setClaim] = useState<string>('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProjectAndStages = async () => {
      try {
        // Fetch project info
        const projRes = await fetch(`/api/projects/${projectId}`);
        if (projRes.ok) {
          const data = await projRes.json();
          if (data.project) setProjectTitle(data.project.title);
        }

        // Fetch stages
        const stageRes = await fetch(`/api/contractor/projects/${projectId}/stages`);
        if (stageRes.ok) {
          const data = await stageRes.json();
          setStages(data.stages || []);
          if (data.stages && data.stages.length > 0) {
            setSelectedStageId(data.stages[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching project stages:', err);
      }
    };

    fetchProjectAndStages();
  }, [projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setError('Failed to capture GPS location: ' + err.message);
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setError('Please attach at least one clear progress evidence photo.');
      return;
    }
    if (!selectedStageId) {
      setError('Please select a project work stage.');
      return;
    }
    if (!title.trim() || !claim.trim()) {
      setError('Please enter a progress title and specific work claim.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('ms_auth_token');
      const formData = new FormData();
      formData.append('projectId', projectId || '');
      formData.append('projectStageId', selectedStageId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('claim', claim);
      if (latitude !== null) formData.append('latitude', String(latitude));
      if (longitude !== null) formData.append('longitude', String(longitude));
      formData.append('photo', photoFile);

      const res = await fetch('/api/contractor/submissions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contractor progress evidence');
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'Error submitting contractor evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-white">Progress Evidence Submitted</h2>
          <p className="text-sm text-slate-300">
            Your progress evidence has been registered on the server with a cryptographic SHA-256 integrity hash.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl text-left space-y-2 border border-slate-800 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-amber-400 font-bold">AWAITING_VERIFICATION</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SHA-256 Fingerprint:</span>
              <span className="text-emerald-400">{successData.submission?.fingerprint}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Submitted At:</span>
              <span className="text-slate-300">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-300 text-left">
            💡 Next Step: Nearby citizens and authorized field inspectors can now verify your submitted evidence on ground.
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              to="/contractor"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              Return to Contractor Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Nav */}
        <Link
          to="/contractor"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Contractor Workspace
        </Link>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <HardHat className="w-4 h-4" /> Contractor Evidence Upload
          </div>
          <h1 className="text-2xl font-bold text-white">{projectTitle}</h1>
          <p className="text-xs text-slate-400">
            Submit photographic ground evidence for completed work stages. Evidence is evaluated by the community and field inspectors.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 p-4 rounded-xl text-red-200 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          {/* Work Stage Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Select Completed Work Stage *
            </label>
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            >
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  Stage {st.sequence}: {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Title */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Progress Update Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Road base layer completed for approximately 500 metres"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Work Claim */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              3. Specific Contractor Claim *
            </label>
            <input
              type="text"
              placeholder="e.g. Crushed stone base layer laid, compacted, and ready for asphalt surfacing."
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              4. Additional Technical Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide quantity measurements, material specs, or field notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Photo Evidence Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              5. Progress Evidence Photo *
            </label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex flex-col items-center">
                <img src={photoPreview} alt="Evidence Preview" className="max-h-64 object-contain rounded-lg" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-xs text-amber-400 font-semibold hover:underline"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500/60 p-8 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center gap-3 transition"
              >
                <Camera className="w-8 h-8 text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">Take Photo or Upload Ground Evidence</span>
                <span className="text-xs text-slate-500">Supports JPEG, PNG, WEBP up to 15MB. Verified with binary magic-byte scanner.</span>
              </button>
            )}
          </div>

          {/* Location Capture */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              6. On-Site GPS Location (Optional Signal)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={locating}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
              >
                <MapPin className={`w-4 h-4 text-amber-400 ${locating ? 'animate-bounce' : ''}`} />
                {locating ? 'Capturing GPS...' : 'Capture Device GPS Location'}
              </button>

              {latitude !== null && longitude !== null && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span>SHA-256 evidence integrity hash will be generated upon receipt to prove evidence non-tampering.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Upload className={`w-5 h-5 ${submitting ? 'animate-spin' : ''}`} />
            {submitting ? 'Submitting Evidence...' : 'SUBMIT EVIDENCE FOR VERIFICATION'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContractorProgressUploadPage;
