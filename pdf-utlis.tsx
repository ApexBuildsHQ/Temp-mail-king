import html2pdf from 'html2pdf.js';

/**
 * تحويل كود HTML إلى مستند PDF احترافي وعالي الدقة من جانب العميل
 * تعتمد هذه الدالة على بيئة عرض معزولة (Sandbox) تضمن ثبات الأبعاد والخطوط
 */
export async function convertHtmlToPdf(htmlContent: string, filename: string = 'document.pdf'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 1. التأكد من تحميل كافة الخطوط في المتصفح تماماً قبل بدء التصيير لمنع تداخل النصوص
      if (document.fonts) {
        document.fonts.ready
          .then(() => initiateRendering(htmlContent, filename, resolve, reject))
          .catch(() => initiateRendering(htmlContent, filename, resolve, reject));
      } else {
        initiateRendering(htmlContent, filename, resolve, reject);
      }
    } catch (error) {
      console.error('خطأ أثناء تهيئة محرك الـ PDF:', error);
      reject(error);
    }
  });
}

function initiateRendering(
  htmlContent: string, 
  filename: string, 
  resolve: () => void, 
  reject: (err: any) => void
) {
  // 2. إنشاء بيئة العرض المعزولة (Sandbox Container)
  const container = document.createElement('div');
  
  // ضبط خصائص الحاوية لتكون بأبعاد ورقة A4 قياسية (800 بكسل) مع إخفائها ذكياً دون تدمير الإحداثيات
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '800px'; 
  container.style.opacity = '0';
  container.style.zIndex = '-99999';
  container.style.pointerEvents = 'none';
  container.style.backgroundColor = '#ffffff';
  container.style.overflow = 'visible';

  // 3. حقن قواعد CSS العالمية والمتقدمة للتحكم في سلوك الطباعة وتقسيم الصفحات
  container.innerHTML = `
    <div id="pdf-core-render-root" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000000; padding: 40px; width: 100%; box-sizing: border-box;">
      <style>
        /* توحيد طريقة حساب المساحات للأداة بالكامل */
        #pdf-core-render-root * { 
          box-sizing: border-box !important; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important;
        }
        
        /* منع انقسام الصور في منتصف أطراف الصفحة */
        #pdf-core-render-root img { 
          max-width: 100% !important; 
          height: auto !important; 
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* القواعد الأكاديمية للعناوين: لا يُترك عنوان وحيداً أسفل الصفحة أبداً */
        #pdf-core-render-root h1, 
        #pdf-core-render-root h2, 
        #pdf-core-render-root h3, 
        #pdf-core-render-root h4, 
        #pdf-core-render-root h5, 
        #pdf-core-render-root h6 { 
          page-break-after: avoid !important; 
          break-after: avoid !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* تحرير الفقرات العادية والقوائم لتنقسم بسلاسة ويختفي الفراغ الأبيض الكبير */
        #pdf-core-render-root p, 
        #pdf-core-render-root li, 
        #pdf-core-render-root span,
        #pdf-core-render-root div { 
          page-break-inside: auto !important; 
          break-inside: auto !important; 
        }
        
        /* تحسين انقسام وثبات الجداول البرمجية */
        #pdf-core-render-root table { 
          width: 100% !important; 
          border-collapse: collapse !important;
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        #pdf-core-render-root tr { 
          page-break-inside: avoid !important; 
          break-inside: avoid !important; 
        }
        
        /* كلاسات الدعم والتحكم اليدوي المتقدم للمستخدم */
        .page-break { 
          page-break-before: always !important; 
          break-before: always !important; 
        }
        .avoid-break { 
          page-break-inside: avoid !important; 
          break-inside: avoid !important; 
        }
      </style>
      ${htmlContent}
    </div>
  `;

  document.body.appendChild(container);

  // 4. معالجة وتطهير العناصر ذات التموضع الثابت (Fixed Elements) التي قد تشوه الصفحات المتتالية
  const elements = container.querySelectorAll('#pdf-core-render-root *');
  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (window.getComputedStyle(htmlEl).position === 'fixed') {
      htmlEl.style.setProperty('position', 'absolute', 'important');
    }
  });

  // 5. التحقق من اكتمال تحميل جميع الصور (إن وجدت) لضمان عدم ظهور مساحات بيضاء فارغة مكانها
  const images = container.getElementsByTagName('img');
  const imagePromises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(res => { img.onload = res; img.onerror = res; });
  });

  Promise.all(imagePromises).then(() => {
    // مهلة زمنية قصيرة جداً (تُحسب بالملي ثانية) للتأكد من استقرار أبعاد الـ DOM بالكامل
    setTimeout(() => {
      const renderTarget = container.querySelector('#pdf-core-render-root');

      const options = {
        margin:       [15, 15, 15, 15], // هوامش هندسية متزنة (15 مم) للحواف الأربعة لراحة العين
        filename:     filename,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
          scale: 2.5, // رفع جودة ومعدل كثافة البكسل لتصبح النصوص حادة جداً (Crisp) مثل كود المصنع
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 800,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { 
          mode: ['css', 'legacy'],
          // حظر الانقسام يقتصر بشكل ذكي على العناوين، أسطر الجداول، الصور، والكلاس المخصص فقط
          avoid: ['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', '.avoid-break']
        }
      };

      // 6. تشغيل المحرك المطور لتوليد وحفظ الملف
      html2pdf()
        .set(options)
        .from(renderTarget)
        .save()
        .then(() => {
          document.body.removeChild(container);
          resolve();
        })
        .catch((err: any) => {
          console.error('خطأ برمي أثناء تشغيل المحرك الأساسي للـ PDF:', err);
          document.body.removeChild(container);
          reject(err);
        });
    }, 300);
  });
}

