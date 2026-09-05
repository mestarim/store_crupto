import React, { useState, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Search, X, UploadCloud, Download, 
  Image as ImageIcon, AlertTriangle, 
  Layers, DollarSign, Tag, Sparkles, Eye, 
  Copy, ArrowUp, ArrowDown, EyeOff, Zap
} from 'lucide-react';
import ProductCard from '../../components/ProductCard';
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

  // Form & Variant States
  const [variantMode, setVariantMode] = useState('visual'); // 'visual' | 'text'
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [optionsStr, setOptionsStr] = useState('');

  // Helper to convert structured options array to readable text lines
  const syncToText = (opts = []) => {
    return opts.map(o => {
      let line = `${o.label}: ${o.price}`;
      if (o.originalPrice) line += ` : ${o.originalPrice}`;
      if (o.badge) line += ` : ${o.badge}`;
      return line;
    }).join('\n');
  };

  // Helper to parse text lines back to structured options
  const syncFromText = (text = '') => {
    if (!text.trim()) return [];
    return text.split('\n').map((line, idx) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        return {
          id: `opt-${Date.now()}-${idx}`,
          label: parts[0].trim(),
          price: parts[1].trim(),
          originalPrice: parts[2] ? parts[2].trim() : '',
          badge: parts[3] ? parts[3].trim() : '',
        };
      }
      return null;
    }).filter(Boolean);
  };

  const initialForm = {
    title: '',
    category: 'Crypto',
    type: 'crypto',
    price: '',
    originalPrice: '',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: '',
    options: [
      { id: 'opt-1', label: '50 USDT', price: '51.00', originalPrice: '', badge: '' },
      { id: 'opt-2', label: '100 USDT', price: '101.50', originalPrice: '', badge: 'الأكثر طلباً 🔥' },
      { id: 'opt-3', label: '500 USDT', price: '505.00', originalPrice: '510.00', badge: 'وفر 5 MRU' },
      { id: 'opt-4', label: '1000 USDT', price: '1008.00', originalPrice: '1020.00', badge: 'أفضل سعر ⭐' },
    ]
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
    setOptionsStr(syncToText(initialForm.options));
    setUploadedInfo(null);
    setImageTab('upload');
    setVariantMode('visual');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const opts = product.options && Array.isArray(product.options)
      ? product.options.map((opt, idx) => ({
          id: `opt-${idx}`,
          label: opt.label || '',
          price: opt.price !== undefined ? opt.price.toString() : '',
          originalPrice: opt.originalPrice !== undefined ? opt.originalPrice.toString() : '',
          badge: opt.badge || ''
        }))
      : [];

    setFormData({
      title: product.title || '',
      category: product.category || 'Crypto',
      type: product.type || (product.category === 'Crypto' ? 'crypto' : product.category === 'Games' ? 'game' : 'gift'),
      price: product.price !== undefined ? product.price.toString() : '',
      originalPrice: product.originalPrice !== undefined ? product.originalPrice.toString() : '',
      image: product.image || '',
      description: product.description || '',
      options: opts
    });
    setOptionsStr(syncToText(opts));
    setUploadedInfo(null);
    setImageTab(product.image && product.image.startsWith('data:') ? 'upload' : 'url');
    setVariantMode('visual');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setUploadedInfo(null);
  };

  // Variant Manipulation Handlers
  const handleAddVariant = () => {
    const newOpt = {
      id: `opt-${Date.now()}`,
      label: '',
      price: '',
      originalPrice: '',
      badge: ''
    };
    const next = [...formData.options, newOpt];
    setFormData(prev => ({ ...prev, options: next }));
    setOptionsStr(syncToText(next));
  };

  const handleUpdateVariant = (index, field, value) => {
    const next = [...formData.options];
    next[index] = { ...next[index], [field]: value };
    setFormData(prev => ({ ...prev, options: next }));
    setOptionsStr(syncToText(next));
  };

  const handleRemoveVariant = (index) => {
    const next = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, options: next }));
    setOptionsStr(syncToText(next));
  };

  const handleDuplicateVariant = (index) => {
    const target = formData.options[index];
    const copy = {
      ...target,
      id: `opt-${Date.now()}`,
      label: target.label ? `${target.label} (نسخة)` : 'نسخة جديدة'
    };
    const next = [...formData.options];
    next.splice(index + 1, 0, copy);
    setFormData(prev => ({ ...prev, options: next }));
    setOptionsStr(syncToText(next));
    if (showToast) showToast('تم تكرار الفئة بنجاح 📋');
  };

  const handleMoveVariant = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.options.length) return;
    const next = [...formData.options];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setFormData(prev => ({ ...prev, options: next }));
    setOptionsStr(syncToText(next));
  };

  const handleClearAllVariants = () => {
    setFormData(prev => ({ ...prev, options: [] }));
    setOptionsStr('');
    if (showToast) showToast('تم مسح جميع الفئات');
  };

  const handleSetPriceFromLowest = () => {
    const activeOpts = variantMode === 'text' ? syncFromText(optionsStr) : formData.options;
    const validPrices = activeOpts
      .map(o => parseFloat(o.price))
      .filter(p => !isNaN(p) && p > 0);
    if (validPrices.length > 0) {
      const min = Math.min(...validPrices);
      setFormData(prev => ({ ...prev, price: min.toString() }));
      if (showToast) showToast(`تم ضبط السعر الأساسي على أقل فئة (${min} MRU) ✨`);
    } else {
      if (showToast) showToast('لا توجد أسعار صالحة في الفئات الحالية', 'info');
    }
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

  // Comprehensive Presets Library
  const applyPreset = (presetType) => {
    let cat = formData.category;
    let opts = [];
    let defaultPrice = '';
    let defaultImg = formData.image;
    let defaultDesc = formData.description;
    let titlePlaceholder = formData.title;

    if (presetType === 'usdt') {
      cat = 'Crypto';
      opts = [
        { id: '1', label: '10 USDT', price: '10.50', originalPrice: '', badge: '' },
        { id: '2', label: '50 USDT', price: '51.00', originalPrice: '', badge: '' },
        { id: '3', label: '100 USDT', price: '101.50', originalPrice: '', badge: 'الأكثر طلباً 🔥' },
        { id: '4', label: '500 USDT', price: '505.00', originalPrice: '510.00', badge: 'وفر 5 MRU' },
        { id: '5', label: '1000 USDT', price: '1008.00', originalPrice: '1020.00', badge: 'أفضل سعر ⭐' }
      ];
      defaultPrice = '10.50';
      if (!titlePlaceholder) titlePlaceholder = 'USDT (Tether)';
      if (!defaultDesc) defaultDesc = 'شراء وتعبئة رصيد USDT الفوري عبر شبكات TRC20 / BEP20 مباشرة إلى محفظتك.';
      defaultImg = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (presetType === 'pubg') {
      cat = 'Games';
      opts = [
        { id: '1', label: '60 UC', price: '0.99', originalPrice: '', badge: '' },
        { id: '2', label: '325 UC', price: '4.99', originalPrice: '', badge: '+25 مجاناً' },
        { id: '3', label: '660 UC', price: '9.99', originalPrice: '11.50', badge: 'الأكثر طلباً 🔥' },
        { id: '4', label: '1800 UC', price: '24.99', originalPrice: '28.00', badge: 'بونص +300 🎁' },
        { id: '5', label: '3850 UC', price: '49.99', originalPrice: '55.00', badge: 'الأفضل قيمة ⭐' },
        { id: '6', label: '8100 UC', price: '99.99', originalPrice: '110.00', badge: 'باقة المحترفين 👑' }
      ];
      defaultPrice = '0.99';
      if (!titlePlaceholder) titlePlaceholder = 'PUBG Mobile UC';
      if (!defaultDesc) defaultDesc = 'شحن رسمي وفوري لشدات ببجي موبايل عن طريق ID الحساب.';
      defaultImg = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (presetType === 'freefire') {
      cat = 'Games';
      opts = [
        { id: '1', label: '100 جوهرة', price: '1.00', originalPrice: '', badge: '' },
        { id: '2', label: '310 جوهرة', price: '3.10', originalPrice: '', badge: '+31 مجاناً' },
        { id: '3', label: '520 جوهرة', price: '5.20', originalPrice: '', badge: '+50 بونص 🔥' },
        { id: '4', label: '1060 جوهرة', price: '10.50', originalPrice: '12.00', badge: 'الأكثر طلباً' },
        { id: '5', label: '2180 جوهرة', price: '21.00', originalPrice: '24.00', badge: 'توفير كبير ⭐' }
      ];
      defaultPrice = '1.00';
      if (!titlePlaceholder) titlePlaceholder = 'Free Fire Diamonds';
      if (!defaultDesc) defaultDesc = 'شحن فوري ومضمون لجواهر فري فاير عن طريق المعرف ID.';
      defaultImg = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (presetType === 'roblox') {
      cat = 'Games';
      opts = [
        { id: '1', label: '400 Robux', price: '4.99', originalPrice: '', badge: '' },
        { id: '2', label: '800 Robux', price: '9.99', originalPrice: '', badge: 'شائع 🔥' },
        { id: '3', label: '1700 Robux', price: '19.99', originalPrice: '22.00', badge: 'وفر 10%' },
        { id: '4', label: '4500 Robux', price: '49.99', originalPrice: '55.00', badge: 'الأفضل قيمة ⭐' }
      ];
      defaultPrice = '4.99';
      if (!titlePlaceholder) titlePlaceholder = 'Roblox Robux';
      if (!defaultDesc) defaultDesc = 'شحن رصيد روبلكس روبكس فوري ومباشر.';
      defaultImg = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (presetType === 'playstation') {
      cat = 'Cards';
      opts = [
        { id: '1', label: 'بطاقة $10', price: '9.90', originalPrice: '', badge: '' },
        { id: '2', label: 'بطاقة $25', price: '24.50', originalPrice: '', badge: 'شائع' },
        { id: '3', label: 'بطاقة $50', price: '49.00', originalPrice: '55.00', badge: 'خصم خاص ✨' },
        { id: '4', label: 'بطاقة $100', price: '97.00', originalPrice: '105.00', badge: 'الأكثر طلباً 🔥' }
      ];
      defaultPrice = '9.90';
      if (!titlePlaceholder) titlePlaceholder = 'PlayStation Store Card';
      if (!defaultDesc) defaultDesc = 'أكواد وبطاقات شحن رصيد بلايستيشن ستور أصلية 100%.';
      defaultImg = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (presetType === 'apple') {
      cat = 'Cards';
      opts = [
        { id: '1', label: 'بطاقة $10', price: '9.99', originalPrice: '', badge: '' },
        { id: '2', label: 'بطاقة $15', price: '14.90', originalPrice: '', badge: '' },
        { id: '3', label: 'بطاقة $25', price: '24.50', originalPrice: '', badge: 'شائع' },
        { id: '4', label: 'بطاقة $50', price: '49.00', originalPrice: '53.00', badge: 'وفر 4 MRU' },
        { id: '5', label: 'بطاقة $100', price: '98.00', originalPrice: '105.00', badge: 'الأفضل قيمة ⭐' }
      ];
      defaultPrice = '9.99';
      if (!titlePlaceholder) titlePlaceholder = 'iTunes & Apple Gift Card';
      if (!defaultDesc) defaultDesc = 'بطاقات آبل وأيتونز لشراء التطبيقات والاشتراكات في App Store.';
      defaultImg = 'https://images.unsplash.com/photo-1620189507195-68309c04c4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (presetType === 'google') {
      cat = 'Cards';
      opts = [
        { id: '1', label: 'بطاقة $5', price: '4.99', originalPrice: '', badge: '' },
        { id: '2', label: 'بطاقة $10', price: '9.90', originalPrice: '', badge: 'شائع' },
        { id: '3', label: 'بطاقة $25', price: '24.50', originalPrice: '', badge: 'الأكثر طلباً 🔥' },
        { id: '4', label: 'بطاقة $50', price: '49.00', originalPrice: '54.00', badge: 'وفر 5 MRU' }
      ];
      defaultPrice = '4.99';
      if (!titlePlaceholder) titlePlaceholder = 'Google Play Gift Card';
      if (!defaultDesc) defaultDesc = 'بطاقات شحن رصيد جوجل بلاي لشراء التطبيقات والألعاب.';
      defaultImg = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }

    setFormData(prev => ({
      ...prev,
      title: titlePlaceholder || prev.title,
      category: cat,
      type: cat === 'Crypto' ? 'crypto' : cat === 'Games' ? 'game' : 'gift',
      price: defaultPrice || prev.price,
      image: defaultImg || prev.image,
      description: defaultDesc || prev.description,
      options: opts
    }));
    setOptionsStr(syncToText(opts));
    if (showToast) showToast('تم تطبيق القالب النموذجي بنجاح ✨');
  };

  // Save product
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      if (showToast) showToast('يرجى ملء اسم المنتج', 'error');
      return;
    }

    const activeOpts = variantMode === 'text' ? syncFromText(optionsStr) : formData.options;

    const cleanedOptions = activeOpts
      .map(opt => ({
        label: opt.label ? opt.label.trim() : '',
        price: parseFloat(opt.price) || 0,
        originalPrice: opt.originalPrice && !isNaN(parseFloat(opt.originalPrice)) ? parseFloat(opt.originalPrice) : undefined,
        badge: opt.badge && opt.badge.trim() ? opt.badge.trim() : undefined,
      }))
      .filter(opt => opt.label && opt.price > 0);

    let finalPrice = parseFloat(formData.price);
    if (isNaN(finalPrice) || finalPrice <= 0) {
      if (cleanedOptions.length > 0) {
        finalPrice = Math.min(...cleanedOptions.map(o => o.price));
      } else {
        if (showToast) showToast('يرجى ملء السعر الأساسي للمنتج', 'error');
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      type: formData.category === 'Crypto' ? 'crypto' : formData.category === 'Games' ? 'game' : 'gift',
      price: finalPrice,
      originalPrice: formData.originalPrice && !isNaN(parseFloat(formData.originalPrice)) ? parseFloat(formData.originalPrice) : undefined,
      image: formData.image || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: formData.description.trim(),
      options: cleanedOptions.length > 0 ? cleanedOptions : undefined
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
              padding: '26px', 
              backgroundColor: '#0a0f1d', 
              border: '1px solid #1e293b', 
              borderRadius: '24px',
              maxWidth: '860px', 
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0,0,0,0.85)'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              borderBottom: '1px solid #1e293b', 
              paddingBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '19px', fontWeight: '900', color: 'white' }}>
                    {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
                  </h3>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    color: '#818cf8', 
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid rgba(99, 102, 241, 0.25)'
                  }}>
                    {formData.category}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                  عيّن الاسم، السعر، الباقات المتعددة داخل البطاقة، وارفع صورة مميزة مع تجربة المعاينة الفورية
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Live Preview Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: showLivePreview ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: showLivePreview ? '#a5b4fc' : '#94a3b8',
                    border: `1px solid ${showLivePreview ? 'rgba(99, 102, 241, 0.4)' : '#334155'}`,
                    cursor: 'pointer'
                  }}
                  title="إظهار أو إخفاء معاينة البطاقة الحية"
                >
                  {showLivePreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showLivePreview ? 'إخفاء المعاينة' : 'معاينة البطاقة'}</span>
                </button>

                <button 
                  onClick={closeModal} 
                  style={{ 
                    color: '#94a3b8', 
                    width: '34px', height: '34px', borderRadius: '50%', 
                    backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ─── LIVE CARD PREVIEW (INTERACTIVE) ─── */}
            {showLivePreview && (
              <div style={{
                backgroundColor: '#070a12',
                border: '1px solid #1f293d',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '22px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>
                      معاينة حية ومباشرة للبطاقة في المتجر:
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    💡 يمكنك تجربة النقر على أزرار الفئات لاختبار السعر والتفاعل!
                  </span>
                </div>

                <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                  <ProductCard
                    id={editingProduct?.id || 9999}
                    title={formData.title || 'اسم المنتج التجريبي'}
                    price={parseFloat(formData.price) || 0}
                    originalPrice={formData.originalPrice ? parseFloat(formData.originalPrice) : undefined}
                    image={formData.image || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    category={formData.category}
                    type={formData.type}
                    options={(variantMode === 'text' ? syncFromText(optionsStr) : formData.options)
                      .map(o => ({
                        label: o.label || 'باقة',
                        price: parseFloat(o.price) || 0,
                        originalPrice: o.originalPrice ? parseFloat(o.originalPrice) : undefined,
                        badge: o.badge || undefined
                      }))
                      .filter(o => o.label)}
                    description={formData.description}
                    onClick={() => {}}
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Title Field */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
                  اسم المنتج *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="مثال: USDT (Tether) أو شحن ببجي موبايل أو بطاقة بلايستيشن"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ backgroundColor: '#131b2e', borderColor: '#26354a', fontSize: '14px' }}
                  required
                />
              </div>

              {/* Category, Base Price & Original Price */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
                    القسم الرئيسي *
                  </label>
                  <select 
                    className="form-input"
                    value={formData.category}
                    onChange={e => {
                      const newCat = e.target.value;
                      setFormData({ 
                        ...formData, 
                        category: newCat,
                        type: newCat === 'Crypto' ? 'crypto' : newCat === 'Games' ? 'game' : 'gift'
                      });
                    }}
                    style={{ backgroundColor: '#131b2e', borderColor: '#26354a', color: 'white' }}
                  >
                    <option value="Crypto">عملات رقمية (Crypto)</option>
                    <option value="Games">شحن ألعاب (Games)</option>
                    <option value="Cards">بطاقات هدايا (Cards)</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>
                      السعر الأساسي (MRU) *
                    </label>
                    {formData.options.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSetPriceFromLowest}
                        style={{ fontSize: '10.5px', color: '#818cf8', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}
                        title="تعيين السعر تلقائياً من أقل سعر فئة"
                      >
                        ⚡ أقل فئة
                      </button>
                    )}
                  </div>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="101.50"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    style={{ backgroundColor: '#131b2e', borderColor: '#26354a' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="مثال: 120.00"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                    style={{ backgroundColor: '#131b2e', borderColor: '#26354a' }}
                  />
                </div>
              </div>

              {/* ─── PRODUCT IMAGE MANAGEMENT BOX (UPLOAD & DOWNLOAD) ─── */}
              <div style={{ 
                backgroundColor: '#131b2e', 
                border: '1px solid #233146', 
                borderRadius: '16px', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} color="#818cf8" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>
                      صورة المنتج (رفع وتحميل وتحسين)
                    </span>
                  </div>

                  {/* Mode switcher tabs */}
                  <div style={{ display: 'flex', backgroundColor: '#0b1120', padding: '3px', borderRadius: '10px' }}>
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
                        border: `2px dashed ${isDragging ? '#6366f1' : '#2d3f59'}`,
                        backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : '#0b1120',
                        borderRadius: '12px',
                        padding: '20px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '50%', 
                        backgroundColor: 'rgba(99,102,241,0.15)', 
                        color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 8px'
                      }}>
                        <UploadCloud size={22} />
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', marginBottom: '3px' }}>
                        {uploadingImage ? 'جاري معالجة الصورة...' : 'انقر لاختيار صورة من جهازك أو اسحبها هنا'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>
                        PNG, JPG, WebP, SVG • يتم ضغطها وتحسين دقتها تلقائياً
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
                      style={{ backgroundColor: '#0b1120', borderColor: '#2d3f59', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>روابط سريعة:</span>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' })}
                        style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'underline' }}
                      >
                        USDT
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' })}
                        style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'underline' }}
                      >
                        ألعاب
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' })}
                        style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'underline' }}
                      >
                        بطاقات
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Live Preview & Action Toolbar */}
                {formData.image && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '10px 14px', 
                    backgroundColor: '#0b1120', 
                    borderRadius: '12px', 
                    border: '1px solid #233146',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={formData.image} 
                        alt="معاينة" 
                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #334155' }} 
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.title || 'P')}&background=6366f1&color=fff`;
                        }}
                      />
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'white', display: 'block' }}>
                          معاينة الصورة المعتمدة
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#10b981' }}>
                          {formData.image.startsWith('data:') 
                            ? (uploadedInfo?.sizeKb ? `ملف مرفوع (${uploadedInfo.sizeKb} KB)` : 'صورة مرفوعة من جهازك')
                            : 'رابط خارجي'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => downloadProductImage(formData.image, formData.title || 'product', showToast)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                        title="تحميل الصورة"
                      >
                        <Download size={13} />
                        تحميل
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: '#818cf8',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <UploadCloud size={13} />
                        استبدال
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        style={{
                          padding: '6px 9px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171',
                          borderRadius: '8px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                        title="إزالة الصورة"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── ENHANCED MULTI-ITEMS & VARIANT BUILDER BOX ─── */}
              <div style={{ 
                backgroundColor: '#111827', 
                border: '1px solid #1f2937', 
                borderRadius: '18px', 
                padding: '18px' 
              }}>
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="#a5b4fc" />
                      <span style={{ fontSize: '14px', fontWeight: '900', color: 'white' }}>
                        باقات وفئات المنتج (تعدد العناصر داخل البطاقة)
                      </span>
                      <span style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '999px'
                      }}>
                        {formData.options.length} فئات
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      تظهر هذه الفئات كأزرار تفاعلية داخل بطاقة المنتج في المتجر لتمكين العميل من اختيار الباقة المطلوبة بنقرة واحدة
                    </p>
                  </div>

                  {/* Mode switcher tabs (Visual vs Quick Text) */}
                  <div style={{ display: 'flex', backgroundColor: '#0b1120', padding: '3px', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setVariantMode('visual')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '7px',
                        fontSize: '12px',
                        fontWeight: variantMode === 'visual' ? '800' : '600',
                        backgroundColor: variantMode === 'visual' ? '#4f46e5' : 'transparent',
                        color: variantMode === 'visual' ? 'white' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      قائمة مرئية تفاعلية
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOptionsStr(syncToText(formData.options));
                        setVariantMode('text');
                      }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '7px',
                        fontSize: '12px',
                        fontWeight: variantMode === 'text' ? '800' : '600',
                        backgroundColor: variantMode === 'text' ? '#4f46e5' : 'transparent',
                        color: variantMode === 'text' ? 'white' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      تحرير نصي سريع
                    </button>
                  </div>
                </div>

                {/* 1-Click Presets Toolbar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  padding: '8px 0 12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  marginBottom: '14px'
                }} className="hide-scrollbar">
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', flexShrink: 0 }}>
                    ⚡ نماذج بنقرة واحدة:
                  </span>
                  
                  <button 
                    type="button" 
                    onClick={() => applyPreset('usdt')}
                    style={{ 
                      flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: '700', color: '#10b981', 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    💎 USDT
                  </button>

                  <button 
                    type="button" 
                    onClick={() => applyPreset('pubg')}
                    style={{ 
                      flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: '700', color: '#f59e0b', 
                      backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    🎮 ببجي UC
                  </button>

                  <button 
                    type="button" 
                    onClick={() => applyPreset('freefire')}
                    style={{ 
                      flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: '700', color: '#f43f5e', 
                      backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    🔥 فري فاير
                  </button>

                  <button 
                    type="button" 
                    onClick={() => applyPreset('roblox')}
                    style={{ 
                      flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: '700', color: '#06b6d4', 
                      backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    🕹️ روبلوكس
                  </button>

                  <button 
                    type="button" 
                    onClick={() => applyPreset('playstation')}
                    style={{ 
                      flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: '700', color: '#3b82f6', 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    🎮 بلايستيشن
                  </button>

                  <button 
                    type="button" 
                    onClick={() => applyPreset('apple')}
                    style={{ 
                      flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: '700', color: '#a855f7', 
                      backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    🍎 آبل ستور
                  </button>

                  <button 
                    type="button" 
                    onClick={() => applyPreset('google')}
                    style={{ 
                      flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: '700', color: '#10b981', 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    🌐 جوجل بلاي
                  </button>

                  {formData.options.length > 0 && (
                    <button 
                      type="button" 
                      onClick={handleClearAllVariants}
                      style={{ 
                        flexShrink: 0, padding: '3px 9px', borderRadius: '6px', 
                        fontSize: '11px', fontWeight: '700', color: '#f87171', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                        cursor: 'pointer', marginRight: 'auto'
                      }}
                    >
                      مسح الكل
                    </button>
                  )}
                </div>

                {/* ─── VISUAL BUILDER MODE ─── */}
                {variantMode === 'visual' && (
                  <div>
                    {formData.options.length === 0 ? (
                      <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: '#0b1120',
                        borderRadius: '12px',
                        border: '1px dashed #334155',
                        marginBottom: '14px'
                      }}>
                        <Layers size={28} color="#64748b" style={{ margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>
                          لا توجد فئات محددة لهذا المنتج حالياً
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>
                          سيباع المنتج بسعر ثابت واحد ({formData.price || 0} MRU). اضغط على الزر أدناه لإضافة خيارات متعددة.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          style={{
                            padding: '7px 16px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Plus size={15} />
                          إضافة أول فئة للمنتج
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                        {formData.options.map((opt, idx) => {
                          const hasDiscount = opt.originalPrice && parseFloat(opt.originalPrice) > parseFloat(opt.price);
                          const discountPct = hasDiscount 
                            ? Math.round(((parseFloat(opt.originalPrice) - parseFloat(opt.price)) / parseFloat(opt.originalPrice)) * 100) 
                            : null;

                          return (
                            <div 
                              key={opt.id || idx}
                              style={{
                                backgroundColor: '#0a0f1d',
                                border: '1px solid #1e293b',
                                borderRadius: '12px',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                              }}
                            >
                              {/* Top Bar of Variant: #Index, Reorder, Duplicate, Delete */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ 
                                    width: '22px', height: '22px', borderRadius: '6px', 
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: '800'
                                  }}>
                                    {idx + 1}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'white' }}>
                                    {opt.label || `فئة رقم ${idx + 1}`}
                                  </span>
                                  {discountPct && (
                                    <span style={{ 
                                      fontSize: '10px', fontWeight: '800', color: '#10b981', 
                                      backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' 
                                    }}>
                                      خصم {discountPct}%
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {/* Move Up */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveVariant(idx, -1)}
                                    disabled={idx === 0}
                                    style={{
                                      padding: '4px 6px', borderRadius: '6px',
                                      backgroundColor: 'rgba(255,255,255,0.05)',
                                      color: idx === 0 ? '#475569' : '#94a3b8',
                                      cursor: idx === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                    title="تحريك لأعلى"
                                  >
                                    <ArrowUp size={13} />
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveVariant(idx, 1)}
                                    disabled={idx === formData.options.length - 1}
                                    style={{
                                      padding: '4px 6px', borderRadius: '6px',
                                      backgroundColor: 'rgba(255,255,255,0.05)',
                                      color: idx === formData.options.length - 1 ? '#475569' : '#94a3b8',
                                      cursor: idx === formData.options.length - 1 ? 'not-allowed' : 'pointer'
                                    }}
                                    title="تحريك لأسفل"
                                  >
                                    <ArrowDown size={13} />
                                  </button>

                                  {/* Duplicate */}
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateVariant(idx)}
                                    style={{
                                      padding: '4px 8px', borderRadius: '6px',
                                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                      color: '#818cf8',
                                      fontSize: '11px', fontWeight: '700',
                                      display: 'flex', alignItems: 'center', gap: '3px',
                                      cursor: 'pointer'
                                    }}
                                    title="تكرار هذه الفئة"
                                  >
                                    <Copy size={12} />
                                    نسخ
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(idx)}
                                    style={{
                                      padding: '4px 8px', borderRadius: '6px',
                                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                      color: '#f87171',
                                      fontSize: '11px', fontWeight: '700',
                                      display: 'flex', alignItems: 'center', gap: '3px',
                                      cursor: 'pointer'
                                    }}
                                    title="حذف هذه الفئة"
                                  >
                                    <Trash2 size={12} />
                                    حذف
                                  </button>
                                </div>
                              </div>

                              {/* Inputs Grid for Variant */}
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                                gap: '10px' 
                              }}>
                                {/* Label */}
                                <div>
                                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                    اسم الفئة / الكمية *
                                  </span>
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="مثال: 660 UC أو 100 USDT"
                                    value={opt.label}
                                    onChange={e => handleUpdateVariant(idx, 'label', e.target.value)}
                                    style={{ backgroundColor: '#131b2e', borderColor: '#26354a', fontSize: '12.5px', padding: '7px 10px' }}
                                    required
                                  />
                                </div>

                                {/* Price */}
                                <div>
                                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                    سعر البيع (MRU) *
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    className="form-input"
                                    placeholder="101.50"
                                    value={opt.price}
                                    onChange={e => handleUpdateVariant(idx, 'price', e.target.value)}
                                    style={{ backgroundColor: '#131b2e', borderColor: '#26354a', fontSize: '12.5px', padding: '7px 10px', color: '#10b981', fontWeight: '800' }}
                                    required
                                  />
                                </div>

                                {/* Original Price */}
                                <div>
                                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                    السعر قبل الخصم (اختياري)
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    className="form-input"
                                    placeholder="مثال: 120.00"
                                    value={opt.originalPrice || ''}
                                    onChange={e => handleUpdateVariant(idx, 'originalPrice', e.target.value)}
                                    style={{ backgroundColor: '#131b2e', borderColor: '#26354a', fontSize: '12.5px', padding: '7px 10px' }}
                                  />
                                </div>

                                {/* Badge */}
                                <div>
                                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                    شارة ترويجية (اختياري)
                                  </span>
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="مثال: الأكثر طلباً 🔥"
                                    value={opt.badge || ''}
                                    onChange={e => handleUpdateVariant(idx, 'badge', e.target.value)}
                                    style={{ backgroundColor: '#131b2e', borderColor: '#26354a', fontSize: '12.5px', padding: '7px 10px' }}
                                  />
                                </div>
                              </div>

                              {/* Quick Badge Suggestions */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>اقتراح شارة:</span>
                                {['الأكثر طلباً 🔥', 'وفر 10%', 'بونص مجاني 🎁', 'الأفضل قيمة ⭐', 'عرض محدود ⏳'].map(suggested => (
                                  <button
                                    key={suggested}
                                    type="button"
                                    onClick={() => handleUpdateVariant(idx, 'badge', suggested)}
                                    style={{
                                      fontSize: '9.5px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      backgroundColor: opt.badge === suggested ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.04)',
                                      color: opt.badge === suggested ? '#fbbf24' : '#94a3b8',
                                      border: `1px solid ${opt.badge === suggested ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    + {suggested}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions: Add Variant & Sync Price */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(99, 102, 241, 0.18)',
                          border: '1px solid rgba(99, 102, 241, 0.35)',
                          color: '#c7d2fe',
                          fontWeight: '800',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <Plus size={16} />
                        إضافة فئة / باقة جديدة
                      </button>

                      {formData.options.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSetPriceFromLowest}
                          style={{
                            padding: '9px 14px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            fontWeight: '700',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Zap size={14} />
                          مزامنة السعر الأساسي من أقل فئة
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── QUICK TEXT MODE (FOR BULK COPY/PASTE) ─── */}
                {variantMode === 'text' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        اكتب كل فئة في سطر منفصل بالصيغة: <strong style={{ color: '#c7d2fe' }}>الاسم: السعر: السعر_قبل_الخصم: الشارة</strong>
                      </span>
                    </div>
                    <textarea 
                      className="form-input" 
                      rows={5}
                      placeholder={"60 UC: 0.99\n325 UC: 4.99 : 5.50 : +25 مجاناً\n660 UC: 9.99 : 11.50 : الأكثر طلباً 🔥"}
                      value={optionsStr}
                      onChange={e => {
                        const val = e.target.value;
                        setOptionsStr(val);
                        setFormData(prev => ({ ...prev, options: syncFromText(val) }));
                      }}
                      style={{ fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#0a0f1d', borderColor: '#26354a' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      سيتم تحويل هذا النص تلقائياً إلى بطاقات وخيارات قابلة للاختيار والنقر المباشر في واجهة المتجر.
                    </span>
                  </div>
                )}
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
                  style={{ backgroundColor: '#131b2e', borderColor: '#26354a', fontSize: '13px' }}
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
                    backgroundColor: '#131b2e', 
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
