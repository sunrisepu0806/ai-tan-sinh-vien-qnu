import { NextResponse } from 'next/server';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRr5UQ7Hz13S-iMFhlT8BI4HoKvlWk6tC0lvixbk2lBNZYePYkrGeoFtzpY9PKUklL9mLsyZ8d_j6nH/pub?output=csv';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: 'Lỗi: Chưa cấu hình GEMINI_API_KEY trên Vercel.' }, { status: 200 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ reply: 'Vui lòng nhập câu hỏi.' }, { status: 200 });
    }

    // Cache dữ liệu Google Sheets 60s để phản hồi siêu tốc
    let knowledgeBase = '';
    try {
      const sheetRes = await fetch(GOOGLE_SHEET_CSV_URL, {
        next: { revalidate: 60 }
      });
      if (sheetRes.ok) {
        knowledgeBase = await sheetRes.text();
      }
    } catch (err) {
      console.error('Lỗi tải Sheet:', err);
    }

    const promptWithContext = `Bạn là Trợ lý AI hỗ trợ tân sinh viên Khóa 49 Trường Đại học Quy Nhơn (QNU).
DƯỚI ĐÂY LÀ DỮ LIỆU CẨM NANG:
---
${knowledgeBase}
---

1. PHONG CÁCH & XƯNG HÔ:
   - Thân thiện, nhiệt tình, chuẩn tinh thần sinh viên tình nguyện.
   - Tự xưng là "mình" hoặc "AI Đội TNTN QNU", gọi người dùng là "bạn".

2. CÂU HỎI TRA CỨU CHÍNH QUY (Lịch nhập học, hồ sơ, học phí, địa điểm...):
   - Trích xuất chính xác theo cẩm nang phía trên.
   - Trình bày gạch đầu dòng rõ ràng, IN ĐẬM các mốc thời gian, số tiền và địa điểm cụ thể.

3. CÂU HỎI TRÊU ĐÙA / VÔ TRI / XÃ GIAO (như "thật không", "chém gió à", "bot là ai", "chào bot", "bot ăn cơm chưa", v.v.):
   - Phản hồi ngắn gọn (1–2 câu), vui vẻ, dí dỏm và khẳng định thông tin trong cẩm nang là chuẩn xác 100% từ nhà trường.
   - Ví dụ: "Thật 100% luôn bạn ơi, thông tin chính thức từ nhà trường chuẩn chỉnh từng chữ nha! Bạn cần tra cứu mục nào cứ bảo mình nè."

4. CÂU TỤC TĨU / XÚC PHẠM / PHÁ HOẠI / KHÔNG LIÊN QUAN:
   - Giữ thái độ lịch sự, từ chối trả lời và nhắc nhở quay lại chủ đề nhập học.
   - Mẫu phản hồi: "Hệ thống chỉ hỗ trợ giải đáp các thông tin liên quan đến thủ tục nhập học Khóa 49 Trường Đại học Quy Nhơn. Bạn vui lòng sử dụng ngôn từ lịch sự hoặc đặt câu hỏi về nhập học để mình hỗ trợ nhé!"

5. KHI THÔNG TIN NGOÀI CẨM NANG:
   - Trả lời: "Hiện tại cẩm nang chưa có thông tin về nội dung này. Bạn vui lòng liên hệ hotline 1800.55.88.49 hoặc Fanpage 'Đội Thanh niên tình nguyện Trường Đại học Quy Nhơn' để được thầy cô và anh chị hỗ trợ nhé!"
Câu hỏi: ${message}`;

    // Gọi đúng model gemini-3.5-flash-lite
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptWithContext }] }],
          generationConfig: {
            temperature: 0.2
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini Error:', data.error);
      return NextResponse.json({ reply: `Lỗi Google API: ${data.error.message}` }, { status: 200 });
    }

    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, hiện tại mình chưa thể xử lý câu trả lời.';
    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ reply: 'Lỗi kết nối máy chủ, vui lòng thử lại sau!' }, { status: 200 });
  }
}