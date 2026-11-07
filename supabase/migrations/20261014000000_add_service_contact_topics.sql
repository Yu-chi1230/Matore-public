-- Add the new service menu without invalidating past inquiries or open pages.
begin;

alter table public.contact_inquiries
  drop constraint contact_inquiries_topic_check;

alter table public.contact_inquiries
  add constraint contact_inquiries_topic_check check (topic in (
    'Excel・スプレッドシートの改善',
    'データ集計・加工の自動化',
    'Googleサービスの連携・自動化',
    'その他・何から始めるか相談したい',
    '退職後のアクセスを残さない',
    '日々の対応に追われない',
    '担当者ひとりに頼らない'
  ));

commit;
