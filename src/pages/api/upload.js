import { IncomingForm } from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // formidable ব্যবহার করার জন্য এটি false রাখতে হবে
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parsing error" });
    }

    // formidable v3 তে files.file একটি অ্যারে হিসেবে আসে
    const file = files.file && files.file[0];
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // টেলিগ্রাম সার্ভারে পাঠানোর জন্য FormData অবজেক্ট তৈরি
    const telegramForm = new FormData();
    telegramForm.append("chat_id", process.env.TELEGRAM_CHAT_ID);
    
    // ফাইলটিকে স্ট্রিম হিসেবে রিড করে ফরোয়ার্ড করা হচ্ছে
    const fileStream = fs.createReadStream(file.filepath);
    telegramForm.append("document", fileStream, {
      filename: file.originalFilename || "upload",
    });

    try {
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: telegramForm,
        headers: telegramForm.getHeaders(), // form-data এর সঠিক boundary headers সেট করা জরুরি
      });

      const data = await response.json();
      
      if (data.ok) {
        return res.status(200).json({ success: true, file_id: data.result.document.file_id });
      } else {
        return res.status(500).json({ error: data.description || "Telegram upload failed" });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
