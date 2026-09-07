import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QrCode, Printer, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

export const AdminQRPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (response.ok && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: '#64748b' }}>
        Loading QR Code Generator...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={32} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
          <h2>Project Not Found</h2>
          <Link to="/admin" className="btn-primary">Return to Admin Portal</Link>
        </div>
      </div>
    );
  }

  const verificationCode = project.verificationCode || `MS-${project.category}-00${project.id.slice(-1)}`;
  const qrTargetUrl = `${window.location.origin}/citizen/qr-resolve?code=${verificationCode}`;

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Administrator Portal
        </Link>

        {/* DEMO PROJECT BADGE */}
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={18} /> DEMO PUBLIC PROJECT QR CODE
          </span>
          <span className="badge badge-review">PROTOTYPE ONLY</span>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            OFFICIAL PUBLIC WORK VERIFICATION SIGNBOARD
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            {project.title}
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {project.location} • Category: <strong>{project.category}</strong>
          </p>

          {/* QR CODE CONTAINER */}
          <div style={{ display: 'inline-block', backgroundColor: '#ffffff', border: '4px solid #0f172a', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            {/* SVG QR Code Simulation */}
            <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white"/>
              {/* Outer Position Detection Patterns */}
              <rect x="5" y="5" width="30" height="30" fill="#0f172a"/>
              <rect x="10" y="10" width="20" height="20" fill="white"/>
              <rect x="15" y="15" width="10" height="10" fill="#0f172a"/>

              <rect x="65" y="5" width="30" height="30" fill="#0f172a"/>
              <rect x="70" y="10" width="20" height="20" fill="white"/>
              <rect x="75" y="15" width="10" height="10" fill="#0f172a"/>

              <rect x="5" y="65" width="30" height="30" fill="#0f172a"/>
              <rect x="10" y="70" width="20" height="20" fill="white"/>
              <rect x="15" y="75" width="10" height="10" fill="#0f172a"/>

              {/* Data Modules */}
              <rect x="40" y="10" width="10" height="10" fill="#0f172a"/>
              <rect x="40" y="30" width="10" height="10" fill="#0f172a"/>
              <rect x="50" y="20" width="10" height="10" fill="#0f172a"/>
              <rect x="20" y="45" width="10" height="10" fill="#0f172a"/>
              <rect x="40" y="45" width="20" height="10" fill="#0f172a"/>
              <rect x="70" y="45" width="15" height="10" fill="#0f172a"/>
              <rect x="45" y="65" width="10" height="25" fill="#0f172a"/>
              <rect x="65" y="65" width="25" height="10" fill="#0f172a"/>
              <rect x="75" y="80" width="15" height="10" fill="#0f172a"/>
            </svg>

            <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
              {verificationCode}
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
            Current Reported Progress: <strong>{project.reportedProgress}%</strong> • Safe URL: <code>{qrTargetUrl}</code>
          </div>

          <button onClick={handlePrint} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            <Printer size={18} /> Print / Display Official Project QR Signboard
          </button>
        </div>
      </div>
    </div>
  );
};
