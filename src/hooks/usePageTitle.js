import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook يُغيّر عنوان التبويب (document.title) حسب المسار الحالي
 */
const PAGE_TITLES = {
  '/':           'DigiStore | المتجر الرقمي',
  '/cart':       'سلة المشتريات | DigiStore',
  '/product':    'تفاصيل المنتج | DigiStore',
  '/admin':      'لوحة تحكم المسؤول | DigiStore',
  '/admin/products': 'إدارة المنتجات | لوحة التحكم',
  '/admin/orders':   'الطلبات والمبيعات | لوحة التحكم',
  '/admin/settings': 'إعدادات المتجر | لوحة التحكم',
};

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // exact match first, then prefix match
    const title =
      PAGE_TITLES[path] ||
      Object.entries(PAGE_TITLES).find(([key]) => key !== '/' && path.startsWith(key))?.[1] ||
      'DigiStore';

    document.title = title;
  }, [location.pathname]);
}
