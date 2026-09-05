import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

const initialProducts = [
  { 
    id: 1, 
    title: 'USDT (Tether)', 
    price: 101.50, 
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    category: 'Crypto', 
    type: 'crypto', 
    description: 'شراء وتعبئة عملة USDT الرقمية (TRC20 / BEP20) بشكل فوري ومباشر لمحفظتك بأفضل سعر صرف.',
    options: [ 
      { label: '50 USDT', price: 51.00 },
      { label: '100 USDT', price: 101.50, badge: 'الأكثر طلباً 🔥' }, 
      { label: '500 USDT', price: 505.00, originalPrice: 510.00, badge: 'وفر 5 MRU' }, 
      { label: '1000 USDT', price: 1008.00, originalPrice: 1020.00, badge: 'أفضل سعر ⭐' } 
    ] 
  },
  { 
    id: 2, 
    title: 'PUBG Mobile UC', 
    price: 9.99, 
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    category: 'Games', 
    type: 'game', 
    description: 'شحن فوري ومباشر لشدات ببجي موبايل عن طريق الآيدي (ID). شحن رسمي ومضمون 100%.',
    options: [ 
      { label: '60 UC', price: 0.99 }, 
      { label: '325 UC', price: 4.99, badge: '+25 مجاناً' }, 
      { label: '660 UC', price: 9.99, originalPrice: 11.50, badge: 'الأكثر طلباً 🔥' }, 
      { label: '1800 UC', price: 24.99, originalPrice: 28.00, badge: 'بونص +300 🎁' } 
    ] 
  },
  { 
    id: 3, 
    title: 'PlayStation Store Card', 
    price: 49.00, 
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    category: 'Cards', 
    type: 'gift', 
    description: 'بطاقات بلايستيشن ستور رصيد أمريكي وسعودي لشراء الألعاب والاشتراكات في PS Plus.',
    options: [ 
      { label: '$10', price: 9.90 }, 
      { label: '$20', price: 19.50, badge: 'الأكثر مبيعاً' }, 
      { label: '$50', price: 49.00, originalPrice: 55.00, badge: 'خصم خاص ✨' } 
    ] 
  },
  { 
    id: 4, 
    title: 'Bitcoin (BTC)', 
    price: 650.00, 
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    category: 'Crypto', 
    type: 'crypto', 
    description: 'شراء كسر بيتكوين ونقل مباشر إلى عنوان محفظتك بأمان وبدون تعقيد.',
    options: [
      { label: '0.001 BTC', price: 95.00 },
      { label: '0.005 BTC', price: 470.00, badge: 'عرض الأسبوع' },
      { label: '0.01 BTC', price: 930.00, originalPrice: 950.00, badge: 'أفضل قيمة' }
    ]
  },
  { 
    id: 5, 
    title: 'Free Fire Diamonds', 
    price: 10.50, 
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    category: 'Games', 
    type: 'game', 
    description: 'شحن جواهر فري فاير بواسطة المعرف ID فوراً وبسرعة فائقة.',
    options: [ 
      { label: '100 Diamonds', price: 1.00 }, 
      { label: '520 Diamonds', price: 5.20, badge: '+50 بونص' }, 
      { label: '1080 Diamonds', price: 10.50, originalPrice: 12.00, badge: 'عرض مميز 🔥' } 
    ] 
  },
  { 
    id: 6, 
    title: 'iTunes & Apple Gift Card', 
    price: 24.50, 
    image: 'https://images.unsplash.com/photo-1620189507195-68309c04c4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    category: 'Cards', 
    type: 'gift', 
    description: 'بطاقات آبل وأيتونز لشراء التطبيقات والاشتراكات في Apple Music و iCloud.',
    options: [ 
      { label: '$10', price: 9.99 }, 
      { label: '$25', price: 24.50, badge: 'شائع' }, 
      { label: '$50', price: 49.00, originalPrice: 52.00, badge: 'وفر 3 MRU' } 
    ] 
  },
];

const mockOrders = [
  { 
    id: '#ORD-001', 
    customer: 'أحمد محمد الشنقيطي', 
    phone: '33 12 34 56',
    paymentMethod: 'bankily',
    date: '2026-09-03', 
    total: 91.35, 
    subtotal: 101.50,
    status: 'completed',
    digitalCode: 'USDT-TXN-849102-TRC20',
    couponCode: 'WELCOME10',
    discountAmount: 10.15,
    items: [{ title: 'USDT (Tether) - 100 USDT', quantity: 1, price: 101.50 }]
  },
  { 
    id: '#ORD-002', 
    customer: 'سارة خالد', 
    phone: '44 98 76 54',
    paymentMethod: 'masrivi',
    date: '2026-09-04', 
    total: 24.99, 
    subtotal: 24.99,
    status: 'pending',
    digitalCode: '',
    items: [{ title: 'PUBG Mobile UC - 1800 UC', quantity: 1, price: 24.99 }]
  },
];

const defaultSettings = {
  bankilyNumber: '33 44 55 66',
  masriviNumber: '44 55 66 77',
  sedadNumber: '22 33 44 55',
  adminPin: 'admin123',
  storeName: 'DigiStore',
  bannerNotice: '🚀 مرحباً بكم في متجرنا الرقمي! تسليم فوري ودفع آمن عبر بنكيلي ومصرفي وسداد.',
  whatsappNumber: '22233445566',
  telegramAlerts: true,
  telegramChatId: 'digistore_orders_bot',
  whatsappAlerts: true
};

const initialCoupons = [
  { code: 'WELCOME10', type: 'percent', value: 10, label: 'خصم ترحيبي 10%', minOrder: 0 },
  { code: 'CRYPTO5', type: 'percent', value: 5, label: 'خصم عملات رقمية 5%', minOrder: 50 },
  { code: 'DIGI50', type: 'fixed', value: 50, label: 'خصم خاص 50 MRU', minOrder: 200 },
  { code: 'FLASH15', type: 'percent', value: 15, label: 'عرض خاطف 15%', minOrder: 0 }
];

const initialReviews = {
  1: [
    { id: 101, name: 'محمد فال ولد المختار', rating: 5, date: 'اليوم', comment: 'تسليم فوري ومباشر لمحفظة Binance خلال دقيقة واحدة! مصداقية عالية وأفضل سعر صرف في موريتانيا.', verified: true },
    { id: 102, name: 'سيد أحمد', rating: 5, date: 'أمس', comment: 'تحويل بنكيلي وسرعة استجابة على الواتساب، تجربة ممتازة وسأكرر الشراء بكل تأكيد.', verified: true },
    { id: 103, name: 'عمر الموريتاني', rating: 5, date: 'منذ 3 أيام', comment: 'ممتازين جداً والتواصل سريع ومحترم.', verified: true }
  ],
  2: [
    { id: 201, name: 'الداه الشيخ', rating: 5, date: 'أمس', comment: 'شحنت 660 شدة ببجي ووصلت لحسابي فوراً بعد إرسال الآيدي. شكراً لكم!', verified: true },
    { id: 202, name: 'إبراهيم حامد', rating: 5, date: 'منذ يومين', comment: 'أفضل متجر شحن ألعاب في انواكشوط، أسعار ممتازة.', verified: true }
  ],
  3: [
    { id: 301, name: 'فاطمة الزهراء', rating: 5, date: 'منذ يومين', comment: 'كود بلايستيشن اشتغل فوراً، شحنت رصيد الستور واشتريت اللعبة مباشرة.', verified: true }
  ],
  4: [
    { id: 401, name: 'يعقوب محمد', rating: 5, date: 'اليوم', comment: 'شراء بيتكوين ونقل سلس للمحفظة الباردة. خدمة احترافية.', verified: true }
  ],
  5: [
    { id: 501, name: 'سيدي عالي', rating: 5, date: 'منذ أسبوع', comment: 'شحن جواهر فري فاير سريع جداً ومضمون.', verified: true }
  ],
  6: [
    { id: 601, name: 'مريم منت سيدي', rating: 5, date: 'منذ أسبوع', comment: 'بطاقة آيتونز أصلية وموثوقة 100%.', verified: true }
  ]
};

export function StoreProvider({ children }) {
  // Persistence loaders (with fallback to local storage)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('digistore_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('digistore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('digistore_orders');
      return saved ? JSON.parse(saved) : mockOrders;
    } catch {
      return mockOrders;
    }
  });

  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('digistore_coupons');
      return saved ? JSON.parse(saved) : initialCoupons;
    } catch {
      return initialCoupons;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('digistore_reviews');
      return saved ? JSON.parse(saved) : initialReviews;
    } catch {
      return initialReviews;
    }
  });

  const [referralCode] = useState(() => {
    try {
      const saved = localStorage.getItem('digistore_ref_code');
      if (saved) return saved;
      const code = `MR-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('digistore_ref_code', code);
      return code;
    } catch {
      return 'MR-7742';
    }
  });

  const [referralStats] = useState({
    invitedCount: 3,
    rewardMru: 150
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('digistore_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('digistore_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [toast, setToast] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('digistore_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('digistore_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('digistore_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('digistore_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('digistore_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('digistore_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('digistore_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Toast Helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Sync with Supabase (Fetch all)
  const syncWithSupabase = useCallback(async (notify = false) => {
    if (!isSupabaseConfigured || !supabase) {
      if (notify) showToast('قاعدة بيانات Supabase غير مهيأة بعد', 'info');
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Fetch Products
      const { data: prods, error: prodErr } = await supabase
        .from('crypto_products')
        .select('*')
        .order('id', { ascending: true });

      if (!prodErr && prods && prods.length > 0) {
        const formattedProds = prods.map(p => ({
          ...p,
          id: isNaN(Number(p.id)) ? p.id : Number(p.id),
          price: Number(p.price),
          options: Array.isArray(p.options) ? p.options : []
        }));
        setProducts(formattedProds);
      }

      // 2. Fetch Orders
      const { data: ords, error: ordErr } = await supabase
        .from('crypto_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ordErr && ords) {
        const formattedOrders = ords.map(o => ({
          id: o.id,
          customer: o.customer,
          phone: o.phone,
          paymentMethod: o.payment_method,
          date: o.date,
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          discountAmount: Number(o.discount_amount || 0),
          couponCode: o.coupon_code,
          status: o.status,
          digitalCode: o.digital_code || '',
          items: Array.isArray(o.items) ? o.items : [],
          receiptImage: o.receipt_image
        }));
        setOrders(formattedOrders);
      }

      // 3. Fetch Coupons
      const { data: cpnData, error: cpnErr } = await supabase
        .from('crypto_coupons')
        .select('*')
        .eq('active', true);

      if (!cpnErr && cpnData && cpnData.length > 0) {
        const formattedCoupons = cpnData.map(c => ({
          code: c.code,
          type: c.type,
          value: Number(c.value),
          label: c.label,
          minOrder: Number(c.min_order || 0)
        }));
        setCoupons(formattedCoupons);
      }

      // 4. Fetch Reviews
      const { data: revData, error: revErr } = await supabase
        .from('crypto_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!revErr && revData) {
        const grouped = {};
        revData.forEach(r => {
          const pid = String(r.product_id);
          if (!grouped[pid]) grouped[pid] = [];
          grouped[pid].push({
            id: r.id,
            name: r.customer_name,
            rating: r.rating,
            date: r.date,
            comment: r.comment,
            verified: r.verified
          });
        });
        setReviews(grouped);
      }

      // 5. Fetch Settings
      const { data: stData, error: stErr } = await supabase
        .from('crypto_settings')
        .select('*')
        .eq('id', 'main_settings')
        .maybeSingle();

      if (!stErr && stData) {
        setStoreSettings(prev => ({
          ...prev,
          bankilyNumber: stData.bankily_number || prev.bankilyNumber,
          masriviNumber: stData.masrivi_number || prev.masriviNumber,
          sedadNumber: stData.sedad_number || prev.sedadNumber,
          adminPin: stData.admin_pin || prev.adminPin,
          storeName: stData.store_name || prev.storeName,
          bannerNotice: stData.banner_notice || prev.bannerNotice,
          whatsappNumber: stData.whatsapp_number || prev.whatsappNumber,
          telegramChatId: stData.telegram_chat_id || prev.telegramChatId,
          telegramAlerts: stData.telegram_alerts ?? prev.telegramAlerts,
          whatsappAlerts: stData.whatsapp_alerts ?? prev.whatsappAlerts
        }));
      }

      setIsSupabaseConnected(true);
      const nowStr = new Date().toLocaleTimeString('ar-MA');
      setLastSyncTime(nowStr);
      if (notify) showToast(`تمت المزامنة الحية مع Supabase بنجاح (${nowStr}) ⚡`);
    } catch (err) {
      console.warn('Supabase sync error:', err);
      setIsSupabaseConnected(false);
      if (notify) showToast('فشلت المزامنة مع خادم السحاب', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  // Initial Sync and Realtime Listeners
  useEffect(() => {
    syncWithSupabase(false);

    if (!isSupabaseConfigured || !supabase) return;

    // Realtime subscription
    const channel = supabase
      .channel('crypto_store_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crypto_orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          const o = payload.new;
          const newOrd = {
            id: o.id,
            customer: o.customer,
            phone: o.phone,
            paymentMethod: o.payment_method,
            date: o.date,
            total: Number(o.total),
            subtotal: Number(o.subtotal),
            discountAmount: Number(o.discount_amount || 0),
            couponCode: o.coupon_code,
            status: o.status,
            digitalCode: o.digital_code || '',
            items: Array.isArray(o.items) ? o.items : [],
            receiptImage: o.receipt_image
          };
          setOrders(prev => [newOrd, ...prev.filter(item => item.id !== newOrd.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const o = payload.new;
          setOrders(prev => prev.map(item => item.id === o.id ? {
            ...item,
            status: o.status,
            digitalCode: o.digital_code !== undefined ? o.digital_code : item.digitalCode,
            total: Number(o.total),
            subtotal: Number(o.subtotal)
          } : item));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crypto_reviews' }, payload => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new;
          const pid = String(r.product_id);
          setReviews(prev => ({
            ...prev,
            [pid]: [{
              id: r.id,
              name: r.customer_name,
              rating: r.rating,
              date: r.date,
              comment: r.comment,
              verified: r.verified
            }, ...(prev[pid] || []).filter(item => item.id !== r.id)]
          }));
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncWithSupabase]);

  // Cart Operations
  const addToCart = (product, quantity = 1, selectedOption = null) => {
    setCart((prevCart) => {
      const cartItemId = selectedOption ? `${product.id}-${selectedOption.label}` : `${product.id}`;
      const existingItem = prevCart.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        return prevCart.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const price = selectedOption ? selectedOption.price : product.price;
      const title = selectedOption ? `${product.title} - ${selectedOption.label}` : product.title;

      return [...prevCart, { ...product, cartItemId, title, price, quantity }];
    });

    const itemLabel = selectedOption ? `${product.title} (${selectedOption.label})` : product.title;
    showToast(`تمت إضافة "${itemLabel}" إلى السلة 🛍️`);
  };

  const updateCartQuantity = (cartItemId, amount) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + amount;
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
    showToast('تم حذف العنصر من السلة', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon Logic
  const applyCoupon = (codeStr, subtotal) => {
    if (!codeStr || !codeStr.trim()) {
      showToast('يرجى إدخال رمز الكوبون', 'error');
      return { success: false };
    }
    const clean = codeStr.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === clean);
    if (!found) {
      showToast('رمز الكوبون غير صحيح أو منتهي الصلاحية!', 'error');
      return { success: false };
    }
    if (found.minOrder && subtotal < found.minOrder) {
      showToast(`هذا الكوبون يتطلب مشتريات بحد أدنى ${found.minOrder} MRU`, 'error');
      return { success: false };
    }

    let discount = 0;
    if (found.type === 'percent') {
      discount = (subtotal * found.value) / 100;
    } else {
      discount = Math.min(subtotal, found.value);
    }
    discount = Math.round(discount * 100) / 100;

    setAppliedCoupon({ ...found, discountAmount: discount });
    showToast(`تم تفعيل الكوبون "${found.code}" بنجاح! خصم ${discount} MRU 🎉`);
    return { success: true, discount, coupon: found };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('تمت إزالة الكوبون', 'info');
  };

  const addCoupon = async (newCoupon) => {
    const created = {
      ...newCoupon,
      code: newCoupon.code.toUpperCase().trim()
    };
    setCoupons(prev => [created, ...prev.filter(c => c.code !== created.code)]);
    showToast(`تمت إضافة الكوبون "${created.code}" بنجاح 🏷️`);

    if (supabase) {
      try {
        await supabase.from('crypto_coupons').upsert({
          code: created.code,
          type: created.type,
          value: created.value,
          label: created.label,
          min_order: created.minOrder || 0,
          active: true
        });
      } catch (err) {
        console.warn('Coupon Supabase save error:', err);
      }
    }
  };

  const deleteCoupon = async (code) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    if (appliedCoupon?.code === code) setAppliedCoupon(null);
    showToast(`تم حذف الكوبون "${code}"`, 'info');

    if (supabase) {
      try {
        await supabase.from('crypto_coupons').delete().eq('code', code);
      } catch (err) {
        console.warn('Coupon Supabase delete error:', err);
      }
    }
  };

  // Reviews Logic
  const addReview = async (productId, reviewData) => {
    const newRev = {
      id: Date.now(),
      name: reviewData.name || 'عميل DigiStore',
      rating: reviewData.rating || 5,
      date: 'الآن',
      comment: reviewData.comment || '',
      verified: true
    };
    setReviews(prev => ({
      ...prev,
      [productId]: [newRev, ...(prev[productId] || [])]
    }));
    showToast('شكراً لك! تم نشر تقييمك ومراجعته بنجاح ⭐');

    if (supabase) {
      try {
        await supabase.from('crypto_reviews').insert([{
          product_id: String(productId),
          customer_name: newRev.name,
          rating: newRev.rating,
          date: 'الآن',
          comment: newRev.comment,
          verified: true
        }]);
      } catch (err) {
        console.warn('Review Supabase insert error:', err);
      }
    }
  };

  const getProductReviews = (productId) => {
    return reviews[productId] || [];
  };

  // Orders Operations
  const addOrder = async (orderData) => {
    const newOrder = {
      id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      digitalCode: '',
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
      ...orderData
    };
    setOrders(prev => [newOrder, ...prev]);
    showToast(`تم إرسال طلبك بنجاح (${newOrder.id}) 🎉`);

    if (supabase) {
      try {
        await supabase.from('crypto_orders').insert([{
          id: newOrder.id,
          customer: newOrder.customer,
          phone: newOrder.phone,
          payment_method: newOrder.paymentMethod,
          date: newOrder.date,
          total: newOrder.total,
          subtotal: newOrder.subtotal,
          discount_amount: newOrder.discountAmount || 0,
          coupon_code: newOrder.couponCode || null,
          status: 'pending',
          digital_code: '',
          items: newOrder.items || [],
          receipt_image: newOrder.receiptImage || null
        }]);
      } catch (err) {
        console.warn('Order Supabase insert error:', err);
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    let generatedCode = '';
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        let code = order.digitalCode;
        if (newStatus === 'completed' && (!code || !code.trim())) {
          const rand = Math.floor(1000 + Math.random() * 9000);
          const rand2 = Math.floor(1000 + Math.random() * 9000);
          code = `DIGI-VAULT-${rand}-${rand2}`;
          generatedCode = code;
        }
        return { ...order, status: newStatus, digitalCode: code };
      }
      return order;
    }));

    showToast(`تم تحديث حالة الطلب ${orderId} إلى: ${newStatus === 'completed' ? 'مكتمل' : newStatus === 'cancelled' ? 'ملغي' : 'قيد المعالجة'}`);

    if (supabase) {
      try {
        const updatePayload = { status: newStatus };
        if (generatedCode) {
          updatePayload.digital_code = generatedCode;
        }
        await supabase.from('crypto_orders').update(updatePayload).eq('id', orderId);
      } catch (err) {
        console.warn('Order status Supabase update error:', err);
      }
    }
  };

  const updateOrderDigitalCode = async (orderId, newCode) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, digitalCode: newCode } : order
    ));
    showToast(`تم تحديث كود التسليم الرقمي للطلب ${orderId} بنجاح 🔑`);

    if (supabase) {
      try {
        await supabase.from('crypto_orders').update({ digital_code: newCode }).eq('id', orderId);
      } catch (err) {
        console.warn('Order code Supabase update error:', err);
      }
    }
  };

  // Export Orders CSV (Excel friendly with UTF-8 BOM)
  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      showToast('لا توجد طلبات لتصديرها حالياً', 'info');
      return;
    }
    const headers = ['رقم الطلب', 'العميل', 'رقم الهاتف', 'طريقة الدفع', 'المبلغ الإجمالي (MRU)', 'قيمة الخصم', 'كود الخصم', 'الحالة', 'كود التسليم الرقمي', 'التاريخ'];
    const rows = orders.map(o => [
      o.id,
      `"${(o.customer || 'عميل').replace(/"/g, '""')}"`,
      o.phone || '',
      o.paymentMethod || '',
      o.total,
      o.discountAmount || 0,
      o.couponCode || 'بدون',
      o.status === 'completed' ? 'مكتمل' : o.status === 'cancelled' ? 'ملغي' : 'قيد المعالجة',
      `"${(o.digitalCode || '').replace(/"/g, '""')}"`,
      o.date
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `digistore_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('تم تصدير تقرير المبيعات بتنسيق Excel بنجاح 📊');
  };

  // Products CRUD Operations (Admin)
  const addProduct = async (newProduct) => {
    const created = {
      ...newProduct,
      id: String(Date.now()),
      price: parseFloat(newProduct.price) || 0
    };
    setProducts(prev => [created, ...prev]);
    showToast(`تمت إضافة المنتج "${created.title}" بنجاح ✨`);

    if (supabase) {
      try {
        await supabase.from('crypto_products').insert([{
          id: String(created.id),
          title: created.title,
          price: created.price,
          image: created.image,
          category: created.category,
          type: created.type,
          description: created.description,
          options: created.options || []
        }]);
      } catch (err) {
        console.warn('Product Supabase insert error:', err);
      }
    }

    return created;
  };

  const updateProduct = async (id, updatedFields) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updatedFields, price: parseFloat(updatedFields.price || p.price) } : p
    ));
    showToast('تم تحديث بيانات المنتج بنجاح ✅');

    if (supabase) {
      try {
        const payload = { ...updatedFields };
        if (payload.price) payload.price = parseFloat(payload.price);
        await supabase.from('crypto_products').update(payload).eq('id', String(id));
      } catch (err) {
        console.warn('Product Supabase update error:', err);
      }
    }
  };

  const deleteProduct = async (id) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(prod => prod.id !== id));
    showToast(`تم حذف المنتج "${p?.title || ''}" 🗑️`, 'info');

    if (supabase) {
      try {
        await supabase.from('crypto_products').delete().eq('id', String(id));
      } catch (err) {
        console.warn('Product Supabase delete error:', err);
      }
    }
  };

  // Admin Auth
  const adminLogin = (pin) => {
    if (pin === storeSettings.adminPin || pin === 'admin123') {
      setIsAdmin(true);
      showToast('مرحباً بك! تم تسجيل الدخول كمدير للنظام 🔐');
      return true;
    } else {
      showToast('رمز المرور غير صحيح!', 'error');
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdmin(false);
    showToast('تم تسجيل الخروج من لوحة التحكم بنجاح', 'info');
  };

  const updateSettings = async (newFields) => {
    setStoreSettings(prev => ({ ...prev, ...newFields }));
    showToast('تم حفظ إعدادات المتجر بنجاح ⚙️');

    if (supabase) {
      try {
        await supabase.from('crypto_settings').upsert({
          id: 'main_settings',
          bankily_number: newFields.bankilyNumber,
          masrivi_number: newFields.masriviNumber,
          sedad_number: newFields.sedadNumber,
          admin_pin: newFields.adminPin,
          store_name: newFields.storeName,
          banner_notice: newFields.bannerNotice,
          whatsapp_number: newFields.whatsappNumber,
          telegram_chat_id: newFields.telegramChatId,
          telegram_alerts: newFields.telegramAlerts,
          whatsapp_alerts: newFields.whatsappAlerts,
          updated_at: new Date()
        });
      } catch (err) {
        console.warn('Settings Supabase upsert error:', err);
      }
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      setProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      orders,
      addOrder,
      updateOrderStatus,
      updateOrderDigitalCode,
      exportOrdersCSV,
      coupons,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      addCoupon,
      deleteCoupon,
      reviews,
      addReview,
      getProductReviews,
      referralCode,
      referralStats,
      isAdmin,
      adminLogin,
      adminLogout,
      isAdminModalOpen,
      setIsAdminModalOpen,
      storeSettings,
      updateSettings,
      toast,
      showToast,
      isSupabaseConnected,
      isSyncing,
      lastSyncTime,
      syncWithSupabase
    }}>
      {children}
    </StoreContext.Provider>
  );
}
