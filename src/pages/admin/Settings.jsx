import React, { useState, useRef } from 'react';
import { Save, KeyRound, Phone, Bell, CheckCircle2, Download, Upload, RotateCcw, AlertTriangle, Tag, Plus, Trash2, Send, MessageCircle, Cloud, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Settings() {
  const { storeSettings, updateSettings, products, setProducts, orders, showToast, coupons, addCoupon, deleteCoupon, isSupabaseConnected, isSyncing, lastSyncTime, syncWithSupabase } = useStore();
  const [formData, setFormData] = useState({ ...storeSettings });
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef(null);

  // New Coupon Form State
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('percent');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponLabel, setNewCouponLabel] = useState('');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('0');

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponValue) {
      showToast('يرجى ملء رمز الكوبون وقيمته', 'error');
      return;
    }
    const val = parseFloat(newCouponValue);
    if (isNaN(val) || val <= 0) {
      showToast('يرجى إدخال قيمة صحيحة للخصم', 'error');
      return;
    }

    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: val,
      label: newCouponLabel.trim() || `خصم ${newCouponCode.trim().toUpperCase()}`,
      minOrder: parseFloat(newCouponMinOrder) || 0
    });

    setNewCouponCode('');
    setNewCouponValue('');
    setNewCouponLabel('');
    setNewCouponMinOrder('0');
    setShowAddCoupon(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      orders,
      settings: formData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `digistore-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('تم تصدير نسخة احتياطية من البيانات بنجاح 💾');
  };

  // Import Backup JSON
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.products && Array.isArray(parsed.products)) {
          setProducts(parsed.products);
          localStorage.setItem('digistore_products', JSON.stringify(parsed.products));
        }
        if (parsed.settings) {
          updateSettings(parsed.settings);
          setFormData(parsed.settings);
        }
        if (parsed.orders && Array.isArray(parsed.orders)) {
          localStorage.setItem('digistore_orders', JSON.stringify(parsed.orders));
        }
        showToast('تم استعادة البيانات والنسخة الاحتياطية بنجاح! 🚀');
      } catch {
        showToast('ملف النسخة الاحتياطية غير صالح!', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('تحذير: هل أنت متأكد من استعادة إعدادات وبيانات المتجر الافتراضية؟ سيتم مسح التعديلات المخصصة.')) {
      localStorage.removeItem('digistore_products');
      localStorage.removeItem('digistore_orders');
      localStorage.removeItem('digistore_settings');
      window.location.reload();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>إعدادات المتجر والدفع</h2>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>تخصيص أرقام الحسابات البنكية المحلية، رمز مرور الإدارة، والنسخ الاحتياطي</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1000px' }}>
        
        {/* Main Settings Form */}
        <div className="card" style={{ backgroundColor: '#1e293b', padding: '28px', border: '1px solid #334155', borderRadius: '16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Payment Numbers */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#818cf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} /> أرقام حسابات الدفع المحلية في موريتانيا
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>رقم حساب بنكيلي (Bankily)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.bankilyNumber}
                    onChange={e => setFormData({ ...formData, bankilyNumber: e.target.value })}
                    style={{ backgroundColor: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>رقم حساب مصرفي (Masrivi)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.masriviNumber}
                    onChange={e => setFormData({ ...formData, masriviNumber: e.target.value })}
                    style={{ backgroundColor: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>رقم حساب السداد (Sedad)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.sedadNumber}
                    onChange={e => setFormData({ ...formData, sedadNumber: e.target.value })}
                    style={{ backgroundColor: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>رقم واتساب الدعم الفني (بدون +)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="22233445566"
                    value={formData.whatsappNumber}
                    onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    style={{ backgroundColor: '#0f172a' }}
                  />
                </div>
              </div>
            </div>

            <hr style={{ borderColor: '#334155' }} />

            {/* Security PIN */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#818cf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} /> أمان لوحة التحكم (رمز المرور / PIN)
              </h3>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>رمز الدخول السري للأدمن</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.adminPin}
                  onChange={e => setFormData({ ...formData, adminPin: e.target.value })}
                  style={{ backgroundColor: '#0f172a', letterSpacing: '2px', fontWeight: 'bold' }}
                />
              </div>
            </div>

            <hr style={{ borderColor: '#334155' }} />

            {/* Announcement Banner */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#818cf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} /> الشريط الإعلاني أعلى المتجر
              </h3>
              <div>
                <textarea 
                  className="form-input" 
                  rows={2}
                  value={formData.bannerNotice}
                  onChange={e => setFormData({ ...formData, bannerNotice: e.target.value })}
                  style={{ backgroundColor: '#0f172a' }}
                />
              </div>
            </div>

            <hr style={{ borderColor: '#334155' }} />

            {/* Instant Notification Alerts */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#818cf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} /> إشعارات وتنبيهات الطلبات الفورية
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.telegramAlerts ?? true} 
                    onChange={e => setFormData({ ...formData, telegramAlerts: e.target.checked })} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>تفعيل تنبيهات تيليجرام عند وصول طلب جديد</span>
                </label>

                {formData.telegramAlerts && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>معرف قناة أو بوت تيليجرام (Chat ID)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="digistore_orders_bot" 
                      value={formData.telegramChatId || ''} 
                      onChange={e => setFormData({ ...formData, telegramChatId: e.target.value })} 
                      style={{ backgroundColor: '#0f172a' }}
                    />
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.whatsappAlerts ?? true} 
                    onChange={e => setFormData({ ...formData, whatsappAlerts: e.target.checked })} 
                    style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                  />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>إرسال رابط تأكيد وتفاصيل الطلب للعميل عبر واتساب</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
              >
                <Save size={18} />
                <span>حفظ التعديلات</span>
              </button>

              {isSaved && (
                <span style={{ color: '#34d399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  <CheckCircle2 size={16} /> تم الحفظ بنجاح!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Data Backup & Management Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Supabase Cloud Sync Card */}
          <div className="card" style={{ backgroundColor: '#1e293b', padding: '24px', border: '1px solid #334155', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: isSupabaseConnected ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cloud size={18} color={isSupabaseConnected ? '#10b981' : '#f59e0b'} /> المزامنة السحابية (Supabase)
              </h3>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '700', 
                padding: '3px 9px', 
                borderRadius: '999px',
                backgroundColor: isSupabaseConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isSupabaseConnected ? '#34d399' : '#fbbf24',
                border: `1px solid ${isSupabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isSupabaseConnected ? '#10b981' : '#f59e0b', display: 'inline-block' }}></span>
                {isSupabaseConnected ? 'متصل وحي' : 'جاري الاتصال'}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px', lineHeight: '1.6' }}>
              المتجر متصل ومزامن مباشرة مع قاعدة بيانات Supabase. الطلبات، المنتجات، والتقييمات يتم تحديثها فورياً لجميع الأجهزة.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#0f172a', borderRadius: '10px', marginBottom: '14px', fontSize: '12px', color: '#cbd5e1' }}>
              <span>آخر مزامنة ناجحة:</span>
              <strong style={{ color: '#818cf8', direction: 'ltr' }}>{lastSyncTime || 'الآن'}</strong>
            </div>

            <button
              type="button"
              onClick={() => syncWithSupabase(true)}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px', gap: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة وتحديث فوري الآن ⚡'}</span>
            </button>
          </div>

          <div className="card" style={{ backgroundColor: '#1e293b', padding: '24px', border: '1px solid #334155', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} className="text-primary" /> النسخ الاحتياطي للبيانات
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' }}>
              يمكنك تصدير كافة بيانات المنتجات، الطلبات، والإعدادات كملف JSON آمن للرجوع إليها أو نقلها لمتصفح آخر.
            </p>

            <button
              type="button"
              onClick={handleExportBackup}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', gap: '8px', marginBottom: '12px' }}
            >
              <Download size={18} />
              <span>تصدير نسخة احتياطية (JSON)</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleImportBackup} 
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn"
              style={{ width: '100%', padding: '12px', gap: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
            >
              <Upload size={18} />
              <span>استيراد نسخة احتياطية</span>
            </button>
          </div>

          {/* Coupons Management Card */}
          <div className="card" style={{ backgroundColor: '#1e293b', padding: '24px', border: '1px solid #334155', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={18} style={{ color: '#34d399' }} /> إدارة كوبونات الخصم
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>({coupons?.length || 0} كوبونات نشطة)</span>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCoupon(!showAddCoupon)}
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
              >
                <Plus size={14} />
                <span>{showAddCoupon ? 'إلغاء' : 'إضافة كوبون'}</span>
              </button>
            </div>

            {showAddCoupon && (
              <form onSubmit={handleAddCoupon} style={{ padding: '14px', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #334155', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>رمز الكوبون</label>
                    <input 
                      type="text" 
                      placeholder="مثال: VIP25"
                      value={newCouponCode}
                      onChange={e => setNewCouponCode(e.target.value)}
                      className="form-input" 
                      style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>نوع الخصم</label>
                    <select
                      value={newCouponType}
                      onChange={e => setNewCouponType(e.target.value)}
                      className="form-input"
                    >
                      <option value="percent">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (MRU)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>قيمة الخصم</label>
                    <input 
                      type="number" 
                      placeholder="مثال: 10 أو 50"
                      value={newCouponValue}
                      onChange={e => setNewCouponValue(e.target.value)}
                      className="form-input" 
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>الحد الأدنى للطلب</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newCouponMinOrder}
                      onChange={e => setNewCouponMinOrder(e.target.value)}
                      className="form-input" 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>وصف الكوبون</label>
                  <input 
                    type="text" 
                    placeholder="مثال: خصم خاص بنسبة 10%"
                    value={newCouponLabel}
                    onChange={e => setNewCouponLabel(e.target.value)}
                    className="form-input" 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '9px', fontSize: '13px' }}>
                  تأكيد وحفظ الكوبون
                </button>
              </form>
            )}

            {/* Coupons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {coupons && coupons.length > 0 ? (
                coupons.map((c) => (
                  <div 
                    key={c.code}
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', backgroundColor: '#0f172a', borderRadius: '8px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ fontSize: '13px', fontWeight: '800', color: '#34d399', letterSpacing: '0.5px' }}>{c.code}</code>
                        <span style={{ fontSize: '11px', backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '1px 6px', borderRadius: '4px' }}>
                          {c.type === 'percent' ? `${c.value}%` : `${c.value} MRU`}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{c.label} {c.minOrder > 0 && `• للطلبات فوق ${c.minOrder} MRU`}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteCoupon(c.code)}
                      style={{ color: '#f87171', padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.8 }}
                      title="حذف الكوبون"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '12px' }}>
                  لا توجد كوبونات مفعلة حالياً
                </div>
              )}
            </div>
          </div>

          {/* Reset Card */}
          <div className="card" style={{ backgroundColor: '#1e293b', padding: '24px', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> منطقة الخطر (إعادة التعيين)
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.5' }}>
              استعادة الإعدادات والمنتجات الافتراضية الأولية للمتجر ومسح أي تعديلات سابقة.
            </p>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="btn"
              style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', gap: '6px', fontSize: '13px' }}
            >
              <RotateCcw size={16} />
              <span>استعادة ضبط المصنع</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
