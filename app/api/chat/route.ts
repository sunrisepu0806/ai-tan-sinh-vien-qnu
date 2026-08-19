import { NextResponse } from 'next/server';

// Link Google Sheets CSV dữ liệu trực tiếp:
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRr5UQ7Hz13S-iMFhlT8BI4HoKvlWk6tC0lvixbk2lBNZYePYkrGeoFtzpY9PKUklL9mLsyZ8d_j6nH/pub?output=csv';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY.' }, { status: 500 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Nội dung tin nhắn không hợp lệ.' }, { status: 400 });
    }

    // Tự động kéo dữ liệu mới nhất từ Google Sheets (không cache)
    let knowledgeBase = '';
    try {
      const sheetRes = await fetch(GOOGLE_SHEET_CSV_URL, { cache: 'no-store' });
      if (sheetRes.ok) {
        knowledgeBase = await sheetRes.text();
      }
    } catch (err) {
      console.error('Lỗi khi tải Google Sheet:', err);
    }

    // Gửi dữ liệu cho Gemini AI xử lý
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `Bạn là Trợ lý AI hỗ trợ tân sinh viên Khóa 49 Trường Đại học Quy Nhơn (QNU).
Nhiệm vụ: Trả lời các câu hỏi dựa trên dữ liệu cẩm nang từ bảng tính sau:
"""
${knowledgeBase}
"""

Quy tắc trả lời:
1. Giọng văn nhiệt tình, thân thiện, lịch sự, xưng hô "mình - bạn" hoặc "trợ lý - bạn".
2. Trình bày ngắn gọn, gạch đầu dòng rõ ràng, bôi đậm ngày tháng, địa điểm quan trọng.
3. Nếu nội dung không có trong bảng tính, hãy trả lời: "Hiện tại cẩm nang chưa có thông tin về vấn đề này. Bạn vui lòng liên hệ hotline 1800.55.88.49 hoặc Fanpage 'Trường Đại học Quy Nhơn' để được thầy cô hỗ trợ chi tiết nhé!"
4. Tuyệt đối không tự suy diễn hoặc bịa đặt thông tin không có trong bảng.`
              }
            ]
          },
          generationConfig: {
            temperature: 0.2,
          },
          contents: [{ role: 'user', parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, hiện tại mình chưa thể xử lý câu trả lời.';
    return NextResponse.json({ reply: replyText });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server nội bộ.' }, { status: 500 });
  }
}