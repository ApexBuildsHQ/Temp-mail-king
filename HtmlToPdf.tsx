import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileCode2, Download, Eye, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { convertHtmlToPdf } from '../lib/pdf-utils';

export function HtmlToPdf() {
  // قالب افتراضي غني واحترافي لاختبار كفاءة محرك الطباعة وانقسام الصفحات المطور
  const defaultTemplate = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير المعاينة الاحترافي</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; }
    h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    .badge { background: #e0e7ff; color: #4338ca; padding: 4px 12px; rounded-radius: 6px; font-size: 14px; font-weight: bold; }
    table { width: 100%; margin-top: 20px; border-collapse: collapse; }
    th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: right; }
    th { background-color: #f8fafc; color: #0f172a; }
  </style>
</head>
<body>
  <h1>نموذج تقرير مالي وإداري متطور</h1>
  <p>هذا النص مصمم لاختبار دقة محرك التصدير وعملية انقسام العناصر بسلاسة بين الصفحات بدون تداخل.</p>
  
  <table>
    <thead>
      <tr>
        <th>البند</th>
        <th>الوصف</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>المشروع الأول</td>
        <td>تطوير منصة معالجة الملفات المحلية برمجياً</td>
        <td><span class="badge">مكتمل</span></td>
      </tr>
      <tr>
        <td>المشروع الثاني</td>
        <td>بناء محرك التصدير عالي الدقة Pixel-Perfect</td>
        <td><span class="badge">مكتمل</span></td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

  const [html, setHtml] = useState(defaultTemplate);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code');

  const handleDownload = async () => {
    if (!html.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      // استدعاء المحرك عالي الدقة لإنتاج المستند
      await convertHtmlToPdf(html, 'high-fidelity-document.pdf');
    } catch (error) {
      console.error('PDF Generation Component Error:', error);
      alert('فشل في توليد مستند PDF عالي الجودة. يرجى مراجعة تركيبة كود HTML الخاص بك.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      {/* علامة التبويب العلوية / الهيدر */}
      <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">HTML to PDF Converter</h2>
          <p className="text-sm text-slate-500 mt-1">حطّم أخطاء التداخل وحوّل أكواد HTML إلى مستندات معزولة وعالية الدقة فوراً</p>
        </div>
        <span className="hidden sm:inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          Engine V2.5 Active
        </span>
      </div>

      {/* مساحة العمل الأساسية */}
      <div className="flex flex-col flex-grow bg-slate-50 min-h-0">
        {/* أزرار التنقل والتبديل */}
        <div className="flex border-b border-slate-200 bg-white px-2 sm:px-6 shrink-0 shadow-sm z-10 w-full overflow-x-auto">
          <button
            onClick={() => setActiveView('code')}
            className={`px-4 sm:px-6 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-all ${
              activeView === 'code' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>محرر الأكواد</span>
          </button>
          <button
            onClick={() => setActiveView('preview')}
            className={`px-4 sm:px-6 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-all ${
              activeView === 'preview' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>المعاينة الحية المتطابقة</span>
          </button>
        </div>

        {/* حاويات المحتوى الخاضعة للتبديل */}
        <div className="flex-grow relative h-full w-full p-4 sm:p-6 overflow-hidden min-h-0">
          {activeView === 'code' ? (
            <div className="w-full h-full bg-[#1e1e2e] rounded-xl relative overflow-hidden flex flex-col shadow-lg border border-slate-800">
              <div className="w-full h-10 bg-[#11111b] flex items-center px-4 space-x-2 shrink-0 border-b border-[#313244]">
                <div className="w-3 h-3 rounded-full bg-[#f38ba8]"></div>
                <div className="w-3 h-3 rounded-full bg-[#f9e2af]"></div>
                <div className="w-3 h-3 rounded-full bg-[#a6e3a1]"></div>
                <span className="text-xs text-[#bac2de] font-mono ml-4 tracking-wide">index.html</span>
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="flex-grow w-full h-full p-6 outline-none resize-none font-mono text-sm text-[#cdd6f4] bg-transparent leading-relaxed overflow-y-auto min-h-0 custom-scrollbar"
                spellCheck="false"
                placeholder="أدخل كود الـ HTML هنا..."
              />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-200/50 rounded-xl overflow-auto border border-slate-300 shadow-inner custom-scrollbar relative">
              <div className="min-w-max min-h-full p-4 sm:p-8 flex justify-center">
                {/* الحاوية الذهبية: عرض 800 بكسل وبادنج 40 بكسل للتطابق المليمتري مع بيئة تصدير الـ PDF */}
                <div className="bg-white shadow-xl w-[800px] min-h-[1131px] shrink-0 rounded-sm p-[40px] border border-slate-100 overflow-visible">
                  <div 
                    dangerouslySetInnerHTML={{ __html: html }}
                    className="prose prose-slate max-w-none text-[15px] leading-relaxed break-words [&_*]:max-w-full [&_*]:box-border [&_table]:w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words [&_pre]:whitespace-pre-wrap [&_code]:whitespace-pre-wrap [&_img]:h-auto [&_img]:mx-auto"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* لوحة التحكم السفلية */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between shrink-0">
        <div className="space-x-3 flex items-center">
          <button 
             onClick={() => setHtml(defaultTemplate)}
             className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors bg-white shadow-sm flex items-center gap-2"
          >
             <Sparkles className="w-4 h-4 text-indigo-600"/>
             <span>تحميل القالب النموذجي</span>
          </button>
          <button 
             onClick={() => setHtml('')}
             className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors bg-white shadow-sm flex items-center gap-2"
          >
             <Trash2 className="w-4 h-4 text-red-500" />
             <span>مسح الكود</span>
          </button>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={isGenerating || !html.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95 ml-auto w-full sm:w-auto"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          <span>{isGenerating ? 'جاري معالجة وتصدير ملف الـ PDF...' : 'تصدير كملف PDF'}</span>
        </button>
      </div>
    </motion.div>
  );
}
