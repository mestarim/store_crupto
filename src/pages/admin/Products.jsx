import React, { useState, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Search, X, UploadCloud, Download, 
  Image as ImageIcon, Check, AlertTriangle, ExternalLink, 
  RefreshCw, Layers, DollarSign, Tag, Sparkles, Eye, FileText,
  Copy
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

// Helper to optimize and compress image before saving to localStorage
const compressImage = (file, maxDimension = 900, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    // If SVG or very small, keep original
    if (file.type === 'image/svg+xml' || file.size < 120 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          dataUrl: e.target.result,
          sizeKb: Math.round(file.size / 1024),
          type: file.type || 'image/png'
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          sizeKb: approxSizeKb,
          width,
          height,
          type: 'image/jpeg'
        });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to download product image
const downloadProductImage = async (imgUrl, title = 'product-image', onToast) => {
  if (!imgUrl) return;
  try {
    if (onToast) onToast('جاري بدء تحميل الصورة... 📥');
    const cleanName = (title || 'product').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');

    // If Base64 data URL
    if (imgUrl.startsWith('data:')) {
      const extMatch = imgUrl.match(/^data:image\/([a-zA-Z0-9]+);/);
      const ext = extMatch ? extMatch[1] : 'jpg';
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = `${cleanName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (onToast) onToast('تم تنزيل الصورة بنجاح ✅');
      return;
    }

    // Remote URL
    try {
      const response = await fetch(imgUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const ext = blob.type.split('/')[1] || 'jpg';
      link.download = `${cleanName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      if (onToast) onToast('تم تنزيل الصورة بنجاح ✅');
    } catch (corsErr) {
      // CORS fallback: open in new tab or trigger direct download
      const link = document.createElement('a');
      link.href = imgUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `${cleanName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (onToast) onToast('تم فتح الصورة للتحميل 📥');
    }
  } catch (err) {
    console.error('Download error', err);
    window.open(imgUrl, '_blank');
    if (onToast) onToast('تم فتح رابط الصورة في نافذة جديدة', 'info');
  }
};

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Image Tab in Form ('upload' | 'url')
  const [imageTab, setImageTab] = useState('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedInfo, setUploadedInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const initialForm = {
    title: '',
    category: 'Crypto',
    type: 'crypto',
    price: '',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: '',
    optionsStr: '100 USDT: 101.50\n500 USDT: 505.00'
  };
  const [formData, setFormData] = useState(initialForm);

  // Category counts
  const counts = {
    all: products.length,
    Crypto: products.filter(p => p.category === 'Crypto').length,
    Games: products.filter(p => p.category === 'Games').length,
    Cards: products.filter(p => p.category === 'Cards').length,
  };

  // Filtered products
  const filtered = products.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setUploadedInfo(null);
    setImageTab('upload');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const optionsStr = product.options 
      ? product.options.map(opt => `${opt.label}: ${opt.price}`).join('\n')
      : '';

    setFormData({
      title: product.title,
      category: product.category || 'Crypto',
      type: product.type || (product.category === 'Crypto' ? 'crypto' : product.category === 'Games' ? 'game' : 'gift'),
      price: product.price.toString(),
      image: product.image || '',
      description: product.description || '',
      optionsStr
    });
    setUploadedInfo(null);
    setImageTab(product.image && product.image.startsWith('data:') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setUploadedInfo(null);
  };

  // Handle local image file upload & compression
  const handleFileProcess = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (showToast) showToast('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP...)', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      const result = await compressImage(file);
      setFormData(prev => ({ ...prev, image: result.dataUrl }));
      setUploadedInfo({
        sizeKb: result.sizeKb,
        dimensions: result.width ? `${result.width}x${result.height}` : null,
        name: file.name
      });
      if (showToast) showToast('تم رفع الصورة وتحسين أبعادها بنجاح 🖼️');
    } catch (err) {
      console.error('Image upload failed', err);
      if (showToast) showToast('حدث خطأ أثناء معالجة الصورة', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFileProcess(file);
  };

  // Option Presets Helpers
  const applyPreset = (type) => {
    if (type === 'crypto') {
      setFormData(prev => ({
        ...prev,
        category: 'Crypto',
        optionsStr: '50 USDT: 51.00\n100 USDT: 101.50\n500 USDT: 505.00\n1000 USDT: 1008.00'
      }));
    } else if (type === 'pubg') {
      setFormData(prev => ({
        ...prev,
        category: 'Games',
        optionsStr: '60 UC: 0.99\n325 UC: 4.99\n660 UC: 9.99\n1800 UC: 24.99'
      }));
    } else if (type === 'cards') {
      setFormData(prev => ({
        ...prev,
        category: 'Cards',
        optionsStr: '$10 بطاقة: 9.90\n$25 بطاقة: 24.50\n$50 بطاقة: 49.00\n$100 بطاقة: 97.00'
      }));
    }
    if (showToast) showToast('تم تطبيق نموذج الخيارات بنجاح ✨');
  };

  // Save product
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      if (showToast) showToast('يرجى ملء اسم المنتج والسعر الأساسي', 'error');
      return;
    }

    let options = null;
    if (formData.optionsStr.trim()) {
      options = formData.optionsStr
        .split('\n')
        .map(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
            return {
              label: parts[0].trim(),
              price: parseFloat(parts[1].trim()) || 0
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      type: formData.category === 'Crypto' ? 'crypto' : formData.category === 'Games' ? 'game' : 'gift',
      price: parseFloat(formData.price),
      image: formData.image || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: formData.description,
      options: options && options.length > 0 ? options : undefined
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    closeModal();
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmItem) {
      deleteProduct(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>
              إدارة المنتجات
            </h1>
            <span style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              fontSize: '12px',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              {products.length} منتج مسجل
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            تحكم كامل في قائمة المعروضات، إضافة أو تعديل الأسعار، رفع صور عالية الجودة وتنزيلها
          </p>
        </div>

        <button 
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ 
            padding: '11px 22px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontWeight: '800',
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
          }}
        >
          <Plus size={20} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* KPI Stats Chips */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '14px', 
        marginBottom: '22px' 
      }}>
        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>إجمالي المعروضات</span>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginTop: '2px' }}>{counts.all}</h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Layers size={22} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>عملات رقمية (Crypto)</span>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', marginTop: '2px' }}>{counts.Crypto}</h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>شحن ألعاب (Games)</span>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b', marginTop: '2px' }}>{counts.Games}</h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Sparkles size={22} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>بطاقات هدايا (Cards)</span>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#ec4899', marginTop: '2px' }}>{counts.Cards}</h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
            <Tag size={22} />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ 
        backgroundColor: '#0f172a', 
        borderRadius: '20px', 
        border: '1px solid #1e293b', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        overflow: 'hidden' 
      }}>
        
        {/* Search & Category Filter Toolbar */}
        <div style={{ 
          padding: '18px 20px', 
          borderBottom: '1px solid #1e293b', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '14px', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
            <Search size={17} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو القسم أو الوصف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ 
                paddingRight: '42px', 
                paddingLeft: searchTerm ? '38px' : '14px',
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '13px'
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'الكل', count: counts.all },
              { id: 'Crypto', label: 'عملات', count: counts.Crypto },
              { id: 'Games', label: 'ألعاب', count: counts.Games },
              { id: 'Cards', label: 'بطاقات', count: counts.Cards },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: selectedCategory === cat.id ? '800' : '600',
                  backgroundColor: selectedCategory === cat.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: selectedCategory === cat.id ? '#a5b4fc' : '#94a3b8',
                  border: selectedCategory === cat.id ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <span>{cat.label}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: selectedCategory === cat.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  color: 'white'
                }}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 16px', color: '#64748b' 
            }}>
              <Search size={28} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
              لا توجد منتجات مطابقة
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', margin: '0 auto 16px' }}>
              لم يتم العثور على أي منتج يطابق معايير البحث أو الفلتر المحدد
            </p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="btn"
              style={{ backgroundColor: '#1e293b', color: '#818cf8', fontSize: '13px' }}
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="desktop-table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#090d16', color: '#94a3b8' }}>
                    <th style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b' }}>المنتج والصورة</th>
                    <th style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b' }}>القسم</th>
                    <th style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b' }}>السعر الأساسي</th>
                    <th style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b' }}>الفئات والخيارات</th>
                    <th style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', textAlign: 'center' }}>إجراءات الصورة والمنتج</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const isBase64 = product.image && product.image.startsWith('data:');
                    return (
                      <tr 
                        key={product.id} 
                        style={{ 
                          borderBottom: '1px solid #1e293b', 
                          transition: 'background-color 0.15s' 
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Product Title + Thumbnail */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div 
                              onClick={() => setPreviewImageModal(product)}
                              style={{ 
                                position: 'relative', 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                overflow: 'hidden', 
                                border: '1px solid #334155',
                                flexShrink: 0,
                                cursor: 'pointer',
                                backgroundColor: '#1e293b'
                              }}
                              title="انقر لمعاينة الصورة بحجم كامل"
                            >
                              <img 
                                src={product.image} 
                                alt={product.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=6366f1&color=fff`;
                                }}
                              />
                              <div style={{
                                position: 'absolute', inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: 0, transition: 'opacity 0.2s',
                                color: 'white'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                              >
                                <Eye size={16} />
                              </div>
                            </div>
                            <div>
                              <span style={{ fontWeight: '800', color: '#f8fafc', fontSize: '14px', display: 'block' }}>
                                {product.title}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>#{product.id}</span>
                                {isBase64 ? (
                                  <span style={{ fontSize: '10px', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                                    مرفوعة محلياً
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '10px', color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                                    رابط ويب
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ 
                            backgroundColor: product.category === 'Crypto' ? 'rgba(16, 185, 129, 0.15)' : product.category === 'Games' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                            color: product.category === 'Crypto' ? '#34d399' : product.category === 'Games' ? '#fbbf24' : '#f472b6',
                            padding: '4px 12px', 
                            borderRadius: '999px', 
                            fontSize: '12px', 
                            fontWeight: '700',
                            border: `1px solid ${product.category === 'Crypto' ? 'rgba(16, 185, 129, 0.25)' : product.category === 'Games' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(236, 72, 153, 0.25)'}`
                          }}>
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td style={{ padding: '14px 20px', fontWeight: '800', color: '#10b981', fontSize: '15px' }}>
                          {product.price} <span style={{ fontSize: '11px', color: '#94a3b8' }}>MRU</span>
                        </td>

                        {/* Options */}
                        <td style={{ padding: '14px 20px' }}>
                          {product.options && product.options.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ color: '#38bdf8', fontWeight: '700', fontSize: '12px' }}>
                                {product.options.length} فئات مسجلة
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                من {Math.min(...product.options.map(o => o.price))} إلى {Math.max(...product.options.map(o => o.price))} MRU
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>سعر ثابت موحد</span>
                          )}
                        </td>

                        {/* Actions: Download Image, Edit, Delete */}
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            {/* Download Image Button */}
                            <button 
                              onClick={() => downloadProductImage(product.image, product.title, showToast)}
                              title="تحميل صورة المنتج إلى جهازك"
                              style={{ 
                                padding: '8px', 
                                color: '#38bdf8', 
                                backgroundColor: 'rgba(56, 189, 248, 0.12)', 
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                borderRadius: '10px',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.12)'}
                            >
                              <Download size={15} />
                              <span style={{ fontSize: '11px', fontWeight: '700' }}>تحميل</span>
                            </button>

                            {/* Edit Button */}
                            <button 
                              onClick={() => openEditModal(product)}
                              title="تعديل بيانات المنتج"
                              style={{ 
                                padding: '8px', 
                                color: '#a5b4fc', 
                                backgroundColor: 'rgba(99, 102, 241, 0.15)', 
                                border: '1px solid rgba(99, 102, 241, 0.25)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.28)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)'}
                            >
                              <Edit2 size={15} />
                            </button>

                            {/* Delete Button */}
                            <button 
                              onClick={() => setDeleteConfirmItem(product)}
                              title="حذف المنتج"
                              style={{ 
                                padding: '8px', 
                                color: '#f87171', 
                                backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.28)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (shown on small screens) */}
            <div className="mobile-only-cards" style={{ display: 'none', flexDirection: 'column', gap: '12px', padding: '14px' }}>
              {filtered.map(product => (
                <div 
                  key={product.id}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #475569' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '3px' }}>{product.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '800' }}>{product.price} MRU</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>• {product.category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                    <button 
                      onClick={() => downloadProductImage(product.image, product.title, showToast)}
                      style={{ 
                        flex: 1, padding: '8px', backgroundColor: 'rgba(56, 189, 248, 0.12)', 
                        color: '#38bdf8', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <Download size={14} />
                      تحميل الصورة
                    </button>
                    <button 
                      onClick={() => openEditModal(product)}
                      style={{ 
                        flex: 1, padding: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', 
                        color: '#a5b4fc', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <Edit2 size={14} />
                      تعديل
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmItem(product)}
                      style={{ 
                        padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                        color: '#f87171', borderRadius: '8px', display: 'flex', alignItems: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── ADD / EDIT PRODUCT MODAL ─── */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={closeModal}
          style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div 
            className="modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              padding: '24px', 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b', 
              borderRadius: '24px',
              maxWidth: '680px', 
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>
                  {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  قم بتعيين الاسم، السعر، خيارات الشراء، وارفع صورة مميزة للمنتج
                </p>
              </div>
              <button 
                onClick={closeModal} 
                style={{ 
                  color: '#94a3b8', 
                  width: '34px', height: '34px', borderRadius: '50%', 
                  backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Title Field */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
                  اسم المنتج *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="مثال: USDT (TRC20) أو شحن ببجي 660 UC"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                  required
                />
              </div>

              {/* Category & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
                    القسم الرئيسي *
                  </label>
                  <select 
                    className="form-input"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                  >
                    <option value="Crypto">عملات رقمية (Crypto)</option>
                    <option value="Games">شحن ألعاب (Games)</option>
                    <option value="Cards">بطاقات هدايا (Cards)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
                    السعر الأساسي (MRU) *
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="101.50"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    required
                  />
                </div>
              </div>

              {/* ─── PRODUCT IMAGE MANAGEMENT BOX (UPLOAD & DOWNLOAD) ─── */}
              <div style={{ 
                backgroundColor: '#161f30', 
                border: '1px solid #283548', 
                borderRadius: '16px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} color="#818cf8" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>
                      صورة المنتج (رفع وتحميل)
                    </span>
                  </div>

                  {/* Mode switcher tabs */}
                  <div style={{ display: 'flex', backgroundColor: '#0f172a', padding: '3px', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '7px',
                        fontSize: '12px',
                        fontWeight: imageTab === 'upload' ? '800' : '600',
                        backgroundColor: imageTab === 'upload' ? '#6366f1' : 'transparent',
                        color: imageTab === 'upload' ? 'white' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      رفع من الجهاز
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '7px',
                        fontSize: '12px',
                        fontWeight: imageTab === 'url' ? '800' : '600',
                        backgroundColor: imageTab === 'url' ? '#6366f1' : 'transparent',
                        color: imageTab === 'url' ? 'white' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      رابط ويب (URL)
                    </button>
                  </div>
                </div>

                {/* Tab 1: File Upload (Drag & Drop + Button) */}
                {imageTab === 'upload' && (
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      onChange={handleFileInputChange} 
                      style={{ display: 'none' }} 
                    />
                    
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      style={{
                        border: `2px dashed ${isDragging ? '#6366f1' : '#334155'}`,
                        backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : '#0f172a',
                        borderRadius: '12px',
                        padding: '24px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ 
                        width: '46px', height: '46px', borderRadius: '50%', 
                        backgroundColor: 'rgba(99,102,241,0.15)', 
                        color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 10px'
                      }}>
                        <UploadCloud size={24} />
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
                        {uploadingImage ? 'جاري معالجة الصورة...' : 'انقر هنا لاختيار صورة أو اسحبها إلى هنا'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>
                        يدعم PNG, JPG, WebP, SVG • يتم ضغطها وتحسينها تلقائياً للمتجر
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: URL Input */}
                {imageTab === 'url' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      style={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>روابط سريعة:</span>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' })}
                        style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'underline' }}
                      >
                        صورة Tether
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' })}
                        style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'underline' }}
                      >
                        صورة ألعاب
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' })}
                        style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'underline' }}
                      >
                        صورة بطاقات
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Live Preview & Action Toolbar (Download / Replace / Remove) */}
                {formData.image && (
                  <div style={{ 
                    marginTop: '14px', 
                    padding: '12px', 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: '1px solid #1e293b',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={formData.image} 
                        alt="معاينة" 
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #334155' }} 
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.title || 'P')}&background=6366f1&color=fff`;
                        }}
                      />
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'white', display: 'block' }}>
                          معاينة الصورة الحالية
                        </span>
                        <span style={{ fontSize: '11px', color: '#10b981' }}>
                          {formData.image.startsWith('data:') 
                            ? (uploadedInfo?.sizeKb ? `ملف مرفوع (${uploadedInfo.sizeKb} KB)` : 'صورة مرفوعة من جهازك')
                            : 'رابط خارجي معتمد'}
                        </span>
                      </div>
                    </div>

                    {/* Image Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* DOWNLOAD BUTTON */}
                      <button
                        type="button"
                        onClick={() => downloadProductImage(formData.image, formData.title || 'product', showToast)}
                        style={{
                          padding: '7px 12px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer'
                        }}
                        title="تحميل الصورة إلى جهاز الكمبيوتر أو الهاتف"
                      >
                        <Download size={14} />
                        تحميل الصورة
                      </button>

                      {/* REPLACE IMAGE BUTTON */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        style={{
                          padding: '7px 12px',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: '#818cf8',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <UploadCloud size={14} />
                        استبدال
                      </button>

                      {/* REMOVE BUTTON */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        style={{
                          padding: '7px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="إزالة الصورة"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Options & Variants */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>
                    الفئات والخيارات المتاحة (اختياري)
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      type="button" 
                      onClick={() => applyPreset('crypto')}
                      style={{ fontSize: '11px', color: '#818cf8', backgroundColor: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '4px' }}
                    >
                      + نموذج USDT
                    </button>
                    <button 
                      type="button" 
                      onClick={() => applyPreset('pubg')}
                      style={{ fontSize: '11px', color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px' }}
                    >
                      + نموذج ببجي
                    </button>
                  </div>
                </div>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder={"100 USDT: 101.50\n500 USDT: 505.00"}
                  value={formData.optionsStr}
                  onChange={e => setFormData({ ...formData, optionsStr: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#1e293b', borderColor: '#334155' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  اكتب كل فئة في سطر منفصل بالصيغة: <strong style={{ color: '#94a3b8' }}>الاسم: السعر</strong> (مثال: 60 UC: 0.99)
                </span>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
                  وصف المنتج وتعليمات الاستلام
                </label>
                <textarea 
                  className="form-input" 
                  rows={2}
                  placeholder="وصف تفصيلي، طريقة التسليم، مدة الشحن..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '13px' }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    flex: 1, 
                    padding: '13px', 
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '15px'
                  }}
                >
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج إلى المتجر'}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn" 
                  style={{ 
                    padding: '13px 20px', 
                    backgroundColor: '#1e293b', 
                    color: '#94a3b8',
                    borderRadius: '12px',
                    fontWeight: '700'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CUSTOM DELETE CONFIRMATION MODAL ─── */}
      {deleteConfirmItem && (
        <div 
          className="modal-overlay" 
          onClick={() => setDeleteConfirmItem(null)}
          style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div 
            className="modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '420px', 
              width: '100%', 
              padding: '28px 24px', 
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '20px',
              textAlign: 'center' 
            }}
          >
            <div style={{ 
              width: '58px', height: '58px', borderRadius: '50%', 
              backgroundColor: 'rgba(239, 68, 68, 0.12)', 
              color: '#ef4444', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
              تأكيد حذف المنتج؟
            </h3>
            
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' }}>
              هل أنت متأكد من رغبتك في حذف <strong style={{ color: '#fff' }}>"{deleteConfirmItem.title}"</strong> نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleDeleteConfirm}
                style={{ 
                  flex: 1, padding: '12px', 
                  backgroundColor: '#ef4444', color: 'white', 
                  borderRadius: '10px', fontWeight: '800', fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                نعم، احذف المنتج
              </button>
              <button 
                onClick={() => setDeleteConfirmItem(null)}
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: '#1e293b', color: '#94a3b8', 
                  borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FULL SIZE IMAGE PREVIEW MODAL ─── */}
      {previewImageModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setPreviewImageModal(null)}
          style={{ zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div 
            className="modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '540px', 
              width: '100%', 
              backgroundColor: '#0f172a', 
              borderRadius: '20px', 
              overflow: 'hidden',
              border: '1px solid #1e293b'
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxHeight: '420px', backgroundColor: '#000' }}>
              <img 
                src={previewImageModal.image} 
                alt={previewImageModal.title} 
                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block' }}
              />
              <button 
                onClick={() => setPreviewImageModal(null)}
                style={{ 
                  position: 'absolute', top: '12px', right: '12px',
                  backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>{previewImageModal.title}</h4>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{previewImageModal.category} • {previewImageModal.price} MRU</span>
              </div>
              <button 
                onClick={() => downloadProductImage(previewImageModal.image, previewImageModal.title, showToast)}
                className="btn btn-primary"
                style={{ padding: '9px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Download size={16} />
                تحميل الصورة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
