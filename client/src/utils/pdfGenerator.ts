/**
 * Generates and triggers download of a formal civic complaint report in text/html/PDF format.
 * Includes explicit HACKATHON PROTOTYPE watermark and MakkalSaantru seal.
 */
export function downloadComplaintText(reportCode: string, complaintText: string) {
  const blob = new Blob([complaintText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportCode}_Official_Complaint.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printOrDownloadComplaintPDF(params: {
  reportCode: string;
  category: string;
  issueType: string;
  locationText: string;
  authorityName: string;
  complaintText: string;
  evidenceHash?: string | null;
  createdAt: string;
  photoUrl?: string | null;
}) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to download or print the complaint PDF.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>MakkalSaantru Civic Report - ${params.reportCode}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
          }
          .watermark {
            position: fixed;
            top: 40%;
            left: 10%;
            right: 10%;
            transform: rotate(-30deg);
            font-size: 3.5rem;
            font-weight: 900;
            color: rgba(220, 38, 38, 0.12);
            text-align: center;
            text-transform: uppercase;
            pointer-events: none;
            z-index: 9999;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-box {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .badge {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.85rem;
            color: #475569;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .meta-table td {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            font-size: 0.9rem;
          }
          .meta-table td.label {
            background-color: #f1f5f9;
            font-weight: 600;
            width: 25%;
          }
          .complaint-box {
            background-color: #fafafa;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #2563eb;
            padding: 20px;
            white-space: pre-wrap;
            font-family: inherit;
            margin-bottom: 30px;
            font-size: 0.95rem;
          }
          .evidence-section {
            margin-top: 25px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          .photo-thumb {
            max-width: 320px;
            max-height: 240px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 0.8rem;
            color: #64748b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="watermark">HACKATHON PROTOTYPE • MAKKALSAANTRU</div>

        <div class="header">
          <div class="logo-box">
            <h1 style="margin:0; font-size:1.6rem; color:#0f172a;">MAKKALSAANTRU • மக்கள்சான்று</h1>
          </div>
          <div class="badge">REPORT ID: ${params.reportCode}</div>
        </div>

        <h2 style="margin-top:0; color:#1e3a8a; font-size:1.3rem;">CIVIC ISSUE FORMAL COMPLAINT DRAFT</h2>

        <table class="meta-table">
          <tr>
            <td class="label">Report Code</td>
            <td><strong>${params.reportCode}</strong></td>
            <td class="label">Date Reported</td>
            <td>${new Date(params.createdAt).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="label">Category</td>
            <td>${params.category}</td>
            <td class="label">Issue Type</td>
            <td>${params.issueType}</td>
          </tr>
          <tr>
            <td class="label">Location</td>
            <td colspan="3">${params.locationText}</td>
          </tr>
          <tr>
            <td class="label">Target Authority</td>
            <td colspan="3"><strong>${params.authorityName}</strong></td>
          </tr>
          <tr>
            <td class="label">Integrity Hash</td>
            <td colspan="3"><code style="font-size:0.8rem;">${params.evidenceHash || 'SHA-256 RECORDED'}</code></td>
          </tr>
        </table>

        <div class="complaint-box">
${params.complaintText}
        </div>

        ${params.photoUrl ? `
          <div class="evidence-section">
            <h3 style="font-size:1rem; margin-bottom:5px;">Photographic Evidence</h3>
            <img class="photo-thumb" src="${params.photoUrl}" alt="Civic Issue Evidence" />
          </div>
        ` : ''}

        <div class="footer">
          <p>Generated by MakkalSaantru Civic Issue Portal. Prototype system developed for Anveshan hackathon.</p>
          <p><strong>Disclaimer:</strong> Direct submission to government authority requires an official integration interface.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
