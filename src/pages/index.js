import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      setStatus("File successfully uploaded to Telegram Drive! 🎉");
    } else {
      setStatus("Upload failed ❌");
    }
  };

  if (!session) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <h1>📁 Welcome to Telegram Drive</h1>
        <button onClick={() => signIn("google")} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>⚡ My Private Cloud Drive ({session.user.name})</h2>
      <button onClick={() => signOut()} style={{ marginBottom: "20px" }}>Logout</button>
      
      <form onSubmit={handleUpload} style={{ border: "2px dashed #ccc", padding: "30px", textAlign: "center" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} /><br/><br/>
        <button type="submit" style={{ padding: "8px 15px", background: "#0070f3", color: "#fff", border: "none", borderRadius: "5px" }}>
          Upload to Telegram
        </button>
      </form>
      {status && <p style={{ marginTop: "20px", fontWeight: "bold" }}>{status}</p>}
    </div>
  );
}
