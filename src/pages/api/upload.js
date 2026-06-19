import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form error" });

    const file = files.file[0];
    const fileStream = fs.createReadStream(file.filepath);

    const formData = new FormData();
    formData.append("chat_id", process.env.TELEGRAM_CHAT_ID);
    formData.append("document", new Blob([fs.readFileSync(file.filepath)]), file.originalFilename);

    try {
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.ok) {
        res.status(200).json({ success: true, file_id: data.result.document.file_id });
      } else {
        res.status(500).json({ error: "Telegram upload failed" });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}
