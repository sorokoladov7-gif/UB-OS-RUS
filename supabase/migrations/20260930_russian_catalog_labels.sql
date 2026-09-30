-- UB OS-RUS: Russian display names for platform modules and industries.
update public.module_definitions set
 name = case key
  when 'crm' then 'Клиенты и CRM'
  when 'documents' then 'Документы'
  when 'employees' then 'Сотрудники'
  when 'finance' then 'Финансы'
  when 'inventory' then 'Склад и запасы'
  when 'products' then 'Товары и каталог'
  when 'projects' then 'Проекты и задачи'
  when 'reports' then 'Отчёты и аналитика'
  when 'sales' then 'Продажи'
  when 'services' then 'Услуги и записи'
  when 'support' then 'Поддержка'
  else name end,
 description = case key
  when 'crm' then 'Клиенты, контакты и история взаимодействий.'
  when 'documents' then 'Договоры, документы и рабочие файлы.'
  when 'employees' then 'Сотрудники, роли и структура бизнеса.'
  when 'finance' then 'Платежи, расходы и финансовый контроль.'
  when 'inventory' then 'Остатки, склады и перемещения.'
  when 'products' then 'Товары, услуги, каталог и цены.'
  when 'projects' then 'Проекты, задачи и этапы выполнения.'
  when 'reports' then 'Показатели, отчёты и аналитика.'
  when 'sales' then 'Продажи, заказы и сделки.'
  when 'services' then 'Услуги, записи клиентов и выполнение.'
  when 'support' then 'Обращения клиентов и поддержка.'
  else description end;

update public.industry_packages set
 name = case key
  when 'automotive' then 'Автосервис и автомобили'
  when 'beauty' then 'Красота и уход'
  when 'construction' then 'Строительство и ремонт'
  when 'education' then 'Образование'
  when 'logistics' then 'Логистика и перевозки'
  when 'manufacturing' then 'Производство'
  when 'professional_services' then 'Профессиональные услуги'
  when 'restaurant' then 'Ресторанный бизнес'
  when 'retail' then 'Розничная торговля'
  else name end,
 description = case key
  when 'automotive' then 'Автосервисы, автомойки, дилеры и автомобильные услуги.'
  when 'beauty' then 'Салоны красоты, студии, мастера и услуги ухода.'
  when 'construction' then 'Строительные компании, ремонт и монтажные работы.'
  when 'education' then 'Школы, курсы, центры обучения и образовательные услуги.'
  when 'logistics' then 'Перевозки, доставка, транспорт и логистические операции.'
  when 'manufacturing' then 'Производственные компании и управление выпуском продукции.'
  when 'professional_services' then 'Консалтинг, агентства и другие профессиональные услуги.'
  when 'restaurant' then 'Рестораны, кафе, столовые, доставка и общепит.'
  when 'retail' then 'Магазины, торговые точки и управление продажами.'
  else description end;
