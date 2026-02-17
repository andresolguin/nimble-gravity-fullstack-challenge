import { useEffect, useState } from "react";

const BASE_URL = "https://botfilter-h5ddh6dye8exb7ha.centralus-01.azurewebsites.net";

// Datos tuyos (Step 2)
const CANDIDATE_UUID = "fda7ae67-5304-48e9-ad6e-97f73ff60ae9";
const CANDIDATE_ID = "74075819005";
const APPLICATION_ID = "77740293005"; // ✅ Faltaba para que el body sea válido

function JobItem({
  job,
  repoUrl,
  onRepoUrlChange,
  onSubmit,
  isSubmitting,
  submitError,
  submitOk,
}) {
  const isValidGithubUrl = repoUrl?.startsWith("https://github.com/");
  const canSubmit = Boolean(repoUrl) && isValidGithubUrl && !isSubmitting;

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 700 }}>{job.title}</div>
        <div style={{ opacity: 0.7, fontSize: 12 }}>ID: {job.id}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => onRepoUrlChange(job.id, e.target.value)}
          placeholder="https://github.com/andresolguin/nimble-gravity-fullstack-challenge"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.25)",
            color: "inherit",
          }}
        />

        <button
          onClick={() => onSubmit(job.id)}
          disabled={!canSubmit}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: canSubmit
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.06)",
            color: "inherit",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.65,
            minWidth: 110,
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      {!repoUrl && (
        <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
          Pegá la URL de tu repo.
        </div>
      )}

      {repoUrl && !isValidGithubUrl && (
        <div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>
          La URL debería empezar con <b>https://github.com/</b>
        </div>
      )}

      {submitError && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,80,80,0.6)",
          }}
        >
          <b>Error:</b> {submitError}
        </div>
      )}

      {submitOk && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(0,255,120,0.35)",
          }}
        >
          ✅ Postulación enviada (ok: true)
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // Guarda un repoUrl por jobId
  const [repoUrls, setRepoUrls] = useState({});

  // Estados por job (Step 5: loading/error/ok)
  const [submitting, setSubmitting] = useState({});
  const [submitError, setSubmitError] = useState({});
  const [submitOk, setSubmitOk] = useState({});

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoadingJobs(true);
        setJobsError("");
        const res = await fetch(`${BASE_URL}/api/jobs/get-list`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (e) {
        setJobsError(e?.message || "Error cargando posiciones");
      } finally {
        setLoadingJobs(false);
      }
    }
    loadJobs();
  }, []);

  function handleRepoUrlChange(jobId, value) {
    setRepoUrls((prev) => ({ ...prev, [jobId]: value }));
    setSubmitError((prev) => ({ ...prev, [jobId]: "" }));
    setSubmitOk((prev) => ({ ...prev, [jobId]: false }));
  }

  async function handleSubmit(jobId) {
    const repoUrl = (repoUrls[jobId] || "").trim();

    setSubmitError((prev) => ({ ...prev, [jobId]: "" }));
    setSubmitOk((prev) => ({ ...prev, [jobId]: false }));

    if (!repoUrl) {
      setSubmitError((prev) => ({ ...prev, [jobId]: "Ingresá la URL del repo." }));
      return;
    }
    if (!repoUrl.startsWith("https://github.com/")) {
      setSubmitError((prev) => ({
        ...prev,
        [jobId]: "La URL debe empezar con https://github.com/",
      }));
      return;
    }

    const payload = {
      uuid: CANDIDATE_UUID,
      candidateId: CANDIDATE_ID,
      applicationId: APPLICATION_ID, // ✅ agregado
      jobId: String(jobId),
      repoUrl,
    };

    try {
      setSubmitting((prev) => ({ ...prev, [jobId]: true }));

      const res = await fetch(`${BASE_URL}/api/candidate/apply-to-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json(); // { ok: true }
      if (data?.ok === true) {
        setSubmitOk((prev) => ({ ...prev, [jobId]: true }));
      } else {
        setSubmitError((prev) => ({
          ...prev,
          [jobId]: "La API respondió, pero no devolvió { ok: true }.",
        }));
      }
    } catch (e) {
      setSubmitError((prev) => ({
        ...prev,
        [jobId]: e?.message || "Error enviando postulación",
      }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [jobId]: false }));
    }
  }

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>Open Positions</h1>
      <div style={{ opacity: 0.75 }}>Step 5 — Submit hace POST real a la API</div>

      <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
        <b>https://github.com/andresolguin/nimble-gravity-fullstack-challenge</b>
      </div>

      {loadingJobs && <p style={{ marginTop: 16 }}>Cargando posiciones…</p>}

      {jobsError && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: "1px solid rgba(255,80,80,0.6)",
            borderRadius: 10,
          }}
        >
          <b>Error:</b> {jobsError}
        </div>
      )}

      {!loadingJobs &&
        !jobsError &&
        jobs.map((job) => (
          <JobItem
            key={job.id}
            job={job}
            repoUrl={repoUrls[job.id] || ""}
            onRepoUrlChange={handleRepoUrlChange}
            onSubmit={handleSubmit}
            isSubmitting={Boolean(submitting[job.id])}
            submitError={submitError[job.id] || ""}
            submitOk={Boolean(submitOk[job.id])}
          />
        ))}
    </div>
  );
}
