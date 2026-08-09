-- 0007's event_translation only carried title/short_title/summary/body.
-- lib/events-ar.ts (the static overlay phase 9b replaces) also translates
-- venue, area, duration_label, group_size, tags and includes labels — moving
-- to the database without these columns would silently regress the Arabic
-- listings. Nullable: a vendor authoring a new event may not fill Arabic in
-- right away, and each field falls back to the English row independently.

alter table public.event_translation
  add column venue text,
  add column area text,
  add column duration_label text,
  add column group_size text,
  add column tags text[],
  add column includes jsonb;

-- Backfill the seven seeded listings from lib/events-ar.ts, verbatim.

update public.event_translation t
set venue = v.venue, area = v.area, duration_label = v.duration_label,
    group_size = v.group_size, tags = v.tags, includes = v.includes
from (values
  ('an-afternoon-at-salt-candle-making-mango-softies', 'سولت، متحف المستقبل', 'شارع الشيخ زايد', 'ساعتان', 'حتى 16 شخصاً',
    array['ورشة عمل','تطبيق عملي','يشمل الطعام'],
    '["ورشة موجّهة لصناعة الشموع مستوحاة من مانجو سوفتي","جميع مواد ومستلزمات صناعة الشموع","مانجو سوفتي الشهير من سولت","شمعتك المصنوعة يدوياً لتأخذها معك"]'::jsonb),
  ('sunset-dhow-supper-al-seef', 'محطة السيف البحرية', 'السيف', 'ساعتان ونصف', 'حتى 24 شخصاً',
    array['عشاء','على الماء','غروب'],
    '["عشاء إماراتي من أربعة أطباق","مشروبات غازية وكرك","جولة بحرية لساعتين في الخور"]'::jsonb),
  ('rooftop-film-club-alserkal', 'السركال أفنيو', 'القوز', 'ساعتان ونصف', 'حتى 60 شخصاً',
    array['في الهواء الطلق','سهرة'],
    '["كرسي استلقاء محجوز","سماعات لاسلكية","مشروب واحد من الكشك"]'::jsonb),
  ('padel-and-pizza-social', 'بادل برو، البرشاء', 'البرشاء', '3 ساعات', 'من 8 إلى 24 شخصاً',
    array['رياضة','مناسب للمبتدئين','يشمل الطعام'],
    '["حجز الملعب والمضارب","مباريات دورية","بيتزا ومشروبات بعد اللعب"]'::jsonb),
  ('desert-supper-club', 'محمية المرموم الصحراوية', 'المرموم', '4 ساعات ونصف', 'حتى 30 شخصاً',
    array['عشاء','خارج المدينة','مراقبة النجوم'],
    '["توصيل ذهاباً وإياباً من دبي","عشاء على النار","جولة مراقبة نجوم موجّهة"]'::jsonb),
  ('glassblowing-taster-dubai-glass', 'استوديو دبي للزجاج', 'القوز', 'ساعتان', 'حتى 6 أشخاص',
    array['ورشة عمل','تطبيق عملي','مجموعة صغيرة'],
    '["جلسة موجّهة لساعتين","جميع المواد","قطعتك النهائية، تُستلم لاحقاً"]'::jsonb),
  ('arabic-calligraphy-workshop', 'سكة للفنون', 'الفهيدي', 'ساعتان ونصف', 'حتى 12 شخصاً',
    array['ورشة عمل','مناسب للمبتدئين'],
    '["قلم قصب وحبر تحتفظ بهما","أوراق تدريب","قهوة عربية وتمر"]'::jsonb)
) as v(slug, venue, area, duration_label, group_size, tags, includes)
where t.event_id = (select id from public.event where slug = v.slug) and t.locale = 'ar';
