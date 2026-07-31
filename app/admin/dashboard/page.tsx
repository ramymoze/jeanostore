"use client";

import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/data";
import {
  ShieldCheck, LogOut, Package, Tag, TrendingUp, Star, Users,
  ShoppingCart, PlusCircle, Search, Upload, Loader2, Trash2, Pencil, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/lib/cart-context";

type TabState = "products" | "add-product" | "edit-product" | "orders" | "customers";

export default function AdminDashboard() {
  const router = useRouter();
  const { setLanguage } = useLanguage();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabState>("products");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (tab: TabState) => {
    setCurrentTab(tab);
    setSearchQuery("");
    setProductsPage(1);
    setOrdersPage(1);
    setCustomersPage(1);
  };

  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination on search
  useEffect(() => {
    setProductsPage(1);
    setOrdersPage(1);
    setCustomersPage(1);
  }, [searchQuery]);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const supabase = createClient();

  // Add/Edit Product Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  // For edit: existing images from DB (array) and new files to upload
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated");
    if (auth !== "true") { router.replace("/admin"); } else { setAuthenticated(true); }
  }, [router]);

  // Ensure dashboard always uses English language
  useEffect(() => {
    setLanguage("en");
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsData) setProducts(productsData);
      setLoadingProducts(false);
      const { data: ordersData } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (ordersData) setOrders(ordersData);
      setLoadingOrders(false);
    }
    if (authenticated) fetchData();
  }, [authenticated, supabase]);

  const customers = useMemo(() => {
    const customerMap = new Map();
    orders.forEach(order => {
      if (!customerMap.has(order.phone)) {
        customerMap.set(order.phone, { id: order.phone, name: order.name, email: `${order.wilaya}, ${order.commune}`, spent: 0, lastOrder: order.date });
      }
      const customer = customerMap.get(order.phone);
      customer.spent += Number(order.total_price) || 0;
      if (order.date > customer.lastOrder) customer.lastOrder = order.date;
    });
    return Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  function handleLogout() {
    sessionStorage.removeItem("admin_authenticated");
    router.replace("/admin");
  }

  // Upload multiple images and return their public URLs
  async function uploadImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
      if (uploadError) { alert("Error uploading image: " + uploadError.message); return []; }
      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
      urls.push(publicUrlData.publicUrl);
    }
    return urls;
  }

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Collect all selected files
    const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
    const files = fileInput?.files ? Array.from(fileInput.files) : [];

    let imageUrls: string[] = [];
    if (files.length > 0) {
      imageUrls = await uploadImages(files);
      if (imageUrls.length === 0) { setIsSubmitting(false); return; }
    } else {
      imageUrls = ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800"];
    }

    const newProduct = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      image: imageUrls[0], // Primary image
      images: imageUrls,   // All images array
      is_new: formData.get('status') === 'new',
      sold_out: formData.get('status') === 'sold_out',
      description: formData.get('description') as string,
    };

    const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
    setIsSubmitting(false);
    if (error) { alert("Error adding product: " + error.message); }
    else if (data) {
      setProducts([data, ...products]);
      setImagePreviews([]);
      setCurrentTab("products");
    }
  }

  function openEditProduct(product: any) {
    setEditingProduct(product);
    // Support both old single image and new images array
    const imgs: string[] = product.images && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : [];
    setExistingImages(imgs);
    setNewImageFiles([]);
    setActivePreviewIndex(0);
    setCurrentTab("edit-product");
  }

  async function handleEditProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    let newUrls: string[] = [];
    if (newImageFiles.length > 0) {
      newUrls = await uploadImages(newImageFiles);
      if (newUrls.length === 0) { setIsSubmitting(false); return; }
    }

    const allImages = [...existingImages, ...newUrls];

    const updatedProduct = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      image: allImages[0] || editingProduct.image,
      images: allImages,
      is_new: formData.get('status') === 'new',
      sold_out: formData.get('status') === 'sold_out',
      description: formData.get('description') as string,
    };

    const { data, error } = await supabase.from('products').update(updatedProduct).eq('id', editingProduct.id).select().single();
    setIsSubmitting(false);
    if (error) { alert("Error updating product: " + error.message); }
    else if (data) {
      setProducts(products.map(p => p.id === data.id ? data : p));
      setEditingProduct(null);
      setCurrentTab("products");
    }
  }

  async function handleDeleteProduct(productId: number, productName: string) {
    if (!confirm(`Are you sure you want to delete "${productName}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) { alert("Error deleting product: " + error.message); }
    else { setProducts(products.filter(p => p.id !== productId)); }
  }

  async function handleConfirmOrder(orderId: string) {
    const { error } = await supabase.from('orders').update({ confirmation: 'Confirmed' }).eq('order_id', orderId);
    if (error) { alert("Error confirming order: " + error.message); }
    else { setOrders(orders.map(order => order.order_id === orderId ? { ...order, confirmation: 'Confirmed' } : order)); }
  }

  async function handleDeleteOrder(orderId: string) {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    const { error } = await supabase.from('orders').delete().eq('order_id', orderId);
    if (error) { alert("Error deleting order: " + error.message); }
    else { setOrders(orders.filter(order => order.order_id !== orderId)); }
  }

  async function handleDeleteCustomer(phone: string) {
    if (!confirm(`Are you sure you want to delete all orders for customer ${phone}? This will remove the customer entirely.`)) return;
    const { error } = await supabase.from('orders').delete().eq('phone', phone);
    if (error) { alert("Error deleting customer: " + error.message); }
    else { setOrders(orders.filter(order => order.phone !== phone)); }
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));
  const paginatedProducts = filteredProducts.slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage);
  const totalProductsPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const filteredOrders = orders.filter(o => 
    (o.order_id && o.order_id.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (o.name && o.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (o.phone && o.phone.includes(searchQuery))
  );
  const paginatedOrders = filteredOrders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage);
  const totalOrdersPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const filteredCustomers = customers.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (c.id && c.id.includes(searchQuery))
  );
  const paginatedCustomers = filteredCustomers.slice((customersPage - 1) * itemsPerPage, customersPage * itemsPerPage);
  const totalCustomersPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  if (!authenticated) return null;

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const newArrivals = products.filter((p) => p.is_new).length;
  const categories = [...new Set(products.map((p) => p.category))].length;
  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "#6366f1" },
    { label: "Catalog Value", value: formatPrice(totalValue), icon: TrendingUp, color: "#10b981" },
    { label: "New Arrivals", value: newArrivals, icon: Star, color: "#f59e0b" },
    { label: "Categories", value: categories, icon: Tag, color: "#ec4899" },
  ];

  // Shared product form fields (used by both Add and Edit)
  const ProductFormFields = ({ product }: { product?: any }) => (
    <>
      <div className="admin-form-row">
        <div className="admin-input-group">
          <label>Product Name</label>
          <input type="text" name="name" defaultValue={product?.name} placeholder="e.g. Neon Cyber Jacket" required />
        </div>
        <div className="admin-input-group">
          <label>Price (DZD)</label>
          <input type="number" name="price" step="0.01" defaultValue={product?.price} placeholder="99.99" required />
        </div>
      </div>
      <div className="admin-form-row">
        <div className="admin-input-group">
          <label>Category</label>
          <select name="category" required defaultValue={product?.category || ""}>
            <option value="" disabled>Select category</option>
            <option value="Streetwear">Streetwear</option>
            <option value="Footwear">Footwear</option>
            <option value="Outerwear">Outerwear</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        <div className="admin-input-group">
          <label>Status</label>
          <select name="status" required defaultValue={product?.sold_out ? "sold_out" : product?.is_new ? "new" : "active"}>
            <option value="new">New Arrival</option>
            <option value="active">Active</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </div>
      </div>
      <div className="admin-input-group">
        <label>Description</label>
        <textarea name="description" rows={4} defaultValue={product?.description} placeholder="Detailed product description..." required></textarea>
      </div>
    </>
  );

  return (
    <main className="admin-dash-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand"><ShieldCheck size={22} /><span>Admin Panel</span></div>
        <nav className="admin-nav">
          <button className={`admin-nav-link ${currentTab === "products" || currentTab === "add-product" || currentTab === "edit-product" ? "active" : ""}`} onClick={() => handleTabChange("products")}>
            <Package size={16} /> Products
          </button>
          <button className={`admin-nav-link ${currentTab === "orders" ? "active" : ""}`} onClick={() => handleTabChange("orders")}>
            <ShoppingCart size={16} /> Orders
          </button>
          <button className={`admin-nav-link ${currentTab === "customers" ? "active" : ""}`} onClick={() => handleTabChange("customers")}>
            <Users size={16} /> Customers
          </button>
        </nav>
        <button id="admin-logout-btn" className="admin-logout-btn" onClick={handleLogout}><LogOut size={16} />Logout</button>
      </aside>

      {/* Main content */}
      <div className="admin-content">
        <header className="admin-dash-header">
          <div>
            <h1 className="admin-dash-title">
              {currentTab === "products" && "Product Inventory"}
              {currentTab === "add-product" && "Add New Product"}
              {currentTab === "edit-product" && "Edit Product"}
              {currentTab === "orders" && "Recent Orders"}
              {currentTab === "customers" && "Customer Directory"}
            </h1>
            <p className="admin-dash-sub">Welcome back, Silverwear Admin</p>
          </div>
          {currentTab === "products" && (
            <button className="admin-btn-primary" onClick={() => { setImagePreviews([]); setCurrentTab("add-product"); }}>
              <PlusCircle size={18} /> Add Product
            </button>
          )}
        </header>

        {/* --- PRODUCTS TAB --- */}
        {currentTab === "products" && (
          <>
            <section className="admin-stats-grid">
              {stats.map((s) => (
                <div key={s.label} className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: `${s.color}22`, color: s.color }}><s.icon size={22} /></div>
                  <div><p className="admin-stat-value">{s.value}</p><p className="admin-stat-label">{s.label}</p></div>
                </div>
              ))}
            </section>
            <section className="admin-table-section">
              <div className="admin-table-toolbar">
                <div className="admin-search-box"><Search size={16} /><input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table" style={{ minWidth: '700px' }}>
                  <thead>
                    <tr>
                      <th>ID</th><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Images</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProducts ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="w-6 h-6 animate-spin text-primary inline-block" /></td></tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No products found.</td></tr>
                    ) : (
                      paginatedProducts.map((product) => {
                        const imgs = product.images && product.images.length > 0 ? product.images : [product.image];
                        return (
                          <tr key={product.id} className="admin-table-row">
                            <td className="admin-td-id">#{product.id}</td>
                            <td>
                              <div className="admin-product-cell">
                                <div className="admin-thumb-stack">
                                  {imgs.slice(0, 3).map((img: string, i: number) => (
                                    <img key={i} src={img} alt={product.name} className="admin-product-thumb" style={{ marginLeft: i > 0 ? '-10px' : '0', zIndex: 3 - i }} />
                                  ))}
                                </div>
                                <span className="admin-product-name">{product.name}</span>
                              </div>
                            </td>
                            <td><span className="admin-badge-category">{product.category}</span></td>
                            <td className="admin-td-price">{formatPrice(product.price)}</td>
                            <td>{product.sold_out ? <span className="admin-badge-danger">Sold Out</span> : product.is_new ? <span className="admin-badge-new">New</span> : <span className="admin-badge-active">Active</span>}</td>
                            <td className="admin-td-text">{imgs.length} photo{imgs.length !== 1 ? 's' : ''}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="admin-action-btn edit" onClick={() => openEditProduct(product)} title="Edit product"><Pencil size={15} /></button>
                                <button className="admin-action-btn delete" onClick={() => handleDeleteProduct(product.id, product.name)} title="Delete product"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {totalProductsPages > 1 && (
                <div className="admin-pagination">
                  <button onClick={() => setProductsPage(p => Math.max(1, p - 1))} disabled={productsPage === 1}><ChevronLeft size={16} /> Prev</button>
                  <span>Page {productsPage} of {totalProductsPages}</span>
                  <button onClick={() => setProductsPage(p => Math.min(totalProductsPages, p + 1))} disabled={productsPage === totalProductsPages}>Next <ChevronRight size={16} /></button>
                </div>
              )}
            </section>
          </>
        )}

        {/* --- ADD PRODUCT TAB --- */}
        {currentTab === "add-product" && (
          <section className="admin-form-section">
            <button className="admin-btn-back" onClick={() => setCurrentTab("products")}>← Back to Products</button>
            <div className="admin-card">
              <form onSubmit={handleAddProduct} className="admin-form">
                <ProductFormFields />
                <div className="admin-input-group">
                  <label>Product Images <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(select multiple)</span></label>
                  <label htmlFor="imageFiles" className="admin-image-upload">
                    <input
                      type="file" id="imageFiles" name="imageFiles" accept="image/*" multiple
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        setImagePreviews(files.map(f => URL.createObjectURL(f)));
                        setActivePreviewIndex(0);
                      }}
                    />
                    {imagePreviews.length > 0 ? (
                      <div className="admin-preview-gallery">
                        <img src={imagePreviews[activePreviewIndex]} alt="Preview" className="admin-preview-main" />
                        <div className="admin-preview-thumbs">
                          {imagePreviews.map((src, i) => (
                            <img key={i} src={src} alt="" className={`admin-preview-thumb ${i === activePreviewIndex ? 'active' : ''}`} onClick={(ev) => { ev.preventDefault(); setActivePreviewIndex(i); }} />
                          ))}
                        </div>
                        <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected. Click to change.</p>
                      </div>
                    ) : (
                      <><Upload size={24} style={{ margin: '0 auto' }} /><p>Click to upload (select multiple)</p><span>SVG, PNG, JPG or GIF</span></>
                    )}
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-btn-secondary" onClick={() => setCurrentTab("products")}>Cancel</button>
                  <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>{isSubmitting ? <><Loader2 size={16} className="admin-spinner" /> Saving...</> : "Save Product"}</button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* --- EDIT PRODUCT TAB --- */}
        {currentTab === "edit-product" && editingProduct && (
          <section className="admin-form-section">
            <button className="admin-btn-back" onClick={() => setCurrentTab("products")}>← Back to Products</button>
            <div className="admin-card">
              <form onSubmit={handleEditProduct} className="admin-form">
                <ProductFormFields product={editingProduct} />

                <div className="admin-input-group">
                  <label>Current Images</label>
                  {existingImages.length > 0 ? (
                    <div className="admin-existing-images">
                      {existingImages.map((src, i) => (
                        <div key={i} className="admin-existing-img-wrap">
                          <img src={src} alt="" className="admin-existing-img" />
                          <button type="button" className="admin-remove-img" onClick={() => {
                            setExistingImages(existingImages.filter((_, idx) => idx !== i));
                          }} title="Remove image"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No images remaining.</p>
                  )}
                </div>

                <div className="admin-input-group">
                  <label>Add More Images</label>
                  <label htmlFor="newImageFiles" className="admin-image-upload" style={{ padding: '1.5rem' }}>
                    <input
                      type="file" id="newImageFiles" accept="image/*" multiple
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        setNewImageFiles(files);
                        setImagePreviews(files.map(f => URL.createObjectURL(f)));
                      }}
                    />
                    {imagePreviews.length > 0 ? (
                      <div className="admin-preview-gallery">
                        <div className="admin-preview-thumbs">
                          {imagePreviews.map((src, i) => <img key={i} src={src} alt="" className="admin-preview-thumb active" />)}
                        </div>
                        <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{imagePreviews.length} new image{imagePreviews.length !== 1 ? 's' : ''} to add.</p>
                      </div>
                    ) : (
                      <><Upload size={20} style={{ margin: '0 auto' }} /><p>Click to add more images</p></>
                    )}
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="admin-btn-secondary" onClick={() => setCurrentTab("products")}>Cancel</button>
                  <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>{isSubmitting ? <><Loader2 size={16} className="admin-spinner" /> Saving...</> : "Update Product"}</button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* --- ORDERS TAB --- */}
        {currentTab === "orders" && (
          <section className="admin-table-section">
            <div className="admin-table-toolbar">
              <div className="admin-search-box"><Search size={16} /><input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>DATE</th><th>ORDER ID</th><th>NAME</th><th>PHONE</th><th>PHONE 2</th>
                    <th>WILAYA</th><th>COMMUNE</th><th>ADRESSE</th><th>PRODUCT</th>
                    <th>PRODUCT VAR</th><th>QUANTITY</th><th>PRODUCT PR</th>
                    <th>DELIVERY PRIC</th><th>TOTAL PRICE</th><th>DELIVERY MOD</th>
                    <th>NOTE</th><th>EXCHANGE</th><th>FRAGILE</th><th>SOCIETE</th>
                    <th>CONFIRMATION</th><th>TRACKING</th><th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr><td colSpan={22} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin w-6 h-6 mx-auto text-primary" /></td></tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan={22} style={{ textAlign: 'center', padding: '2rem' }}><p className="text-muted-foreground">No orders found.</p></td></tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order.order_id} className="admin-table-row" style={{ whiteSpace: 'nowrap' }}>
                        <td className="admin-td-text">{order.date}</td>
                        <td className="admin-td-id">{order.order_id}</td>
                        <td className="admin-product-name">{order.name}</td>
                        <td className="admin-td-text">{order.phone}</td>
                        <td className="admin-td-text">{order.phone_2}</td>
                        <td className="admin-td-text">{order.wilaya}</td>
                        <td className="admin-td-text">{order.commune}</td>
                        <td className="admin-td-text">{order.adresse}</td>
                        <td className="admin-td-text">{order.product}</td>
                        <td className="admin-td-text">{order.product_var}</td>
                        <td className="admin-td-text">{order.quantity}</td>
                        <td className="admin-td-price">{formatPrice(order.product_pr)}</td>
                        <td className="admin-td-price">{formatPrice(order.delivery_pric)}</td>
                        <td className="admin-td-price">{formatPrice(order.total_price)}</td>
                        <td className="admin-td-text">{order.delivery_mod}</td>
                        <td className="admin-td-text">{order.note}</td>
                        <td><span className={order.exchange === "Yes" ? "admin-badge-warning" : "admin-badge-neutral"}>{order.exchange}</span></td>
                        <td><span className={order.fragile === "Yes" ? "admin-badge-danger" : "admin-badge-neutral"}>{order.fragile}</span></td>
                        <td className="admin-td-text" style={{ fontWeight: 600, color: '#fff' }}>{order.societe}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={order.confirmation === "Confirmed" ? "admin-badge-active" : "admin-badge-pending"}>{order.confirmation}</span>
                            {order.confirmation !== "Confirmed" && (
                              <button onClick={() => handleConfirmOrder(order.order_id)} className="bg-green-500/20 hover:bg-green-500/40 text-green-400 text-xs py-1 px-2 rounded-md transition-colors border border-green-500/30">Confirm</button>
                            )}
                          </div>
                        </td>
                        <td className="admin-td-text" style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>{order.tracking}</td>
                        <td>
                          <button className="admin-action-btn delete" onClick={() => handleDeleteOrder(order.order_id)} title="Delete order"><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalOrdersPages > 1 && (
              <div className="admin-pagination">
                <button onClick={() => setOrdersPage(p => Math.max(1, p - 1))} disabled={ordersPage === 1}><ChevronLeft size={16} /> Prev</button>
                <span>Page {ordersPage} of {totalOrdersPages}</span>
                <button onClick={() => setOrdersPage(p => Math.min(totalOrdersPages, p + 1))} disabled={ordersPage === totalOrdersPages}>Next <ChevronRight size={16} /></button>
              </div>
            )}
          </section>
        )}

        {/* --- CUSTOMERS TAB --- */}
        {currentTab === "customers" && (
          <section className="admin-table-section">
            <div className="admin-table-toolbar">
              <div className="admin-search-box"><Search size={16} /><input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr><th>Customer ID</th><th>Name</th><th>Location</th><th>Total Spent</th><th>Last Order</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin w-6 h-6 mx-auto text-primary" /></td></tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><p className="text-muted-foreground">No customers found.</p></td></tr>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer.id} className="admin-table-row">
                        <td className="admin-td-id">{customer.id}</td>
                        <td className="admin-product-name">{customer.name}</td>
                        <td className="admin-td-text">{customer.email}</td>
                        <td className="admin-td-price">{formatPrice(customer.spent)}</td>
                        <td className="admin-td-text">{customer.lastOrder}</td>
                        <td>
                          <button className="admin-action-btn delete" onClick={() => handleDeleteCustomer(customer.id)} title="Delete customer & orders"><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalCustomersPages > 1 && (
              <div className="admin-pagination">
                <button onClick={() => setCustomersPage(p => Math.max(1, p - 1))} disabled={customersPage === 1}><ChevronLeft size={16} /> Prev</button>
                <span>Page {customersPage} of {totalCustomersPages}</span>
                <button onClick={() => setCustomersPage(p => Math.min(totalCustomersPages, p + 1))} disabled={customersPage === totalCustomersPages}>Next <ChevronRight size={16} /></button>
              </div>
            )}
          </section>
        )}
      </div>

      <style>{`
        .admin-dash-root { display: flex; min-height: 100vh; background: #09090b; color: #e4e4e7; font-family: inherit; }
        .admin-sidebar { width: 240px; min-height: 100vh; background: rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; padding: 1.5rem 1rem; position: sticky; top: 0; height: 100vh; }
        .admin-brand { display: flex; align-items: center; gap: 0.6rem; font-size: 1.1rem; font-weight: 700; color: #a5b4fc; margin-bottom: 2.5rem; padding: 0 0.5rem; }
        .admin-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .admin-nav-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; color: rgba(255,255,255,0.5); font-size: 0.9rem; font-weight: 500; background: none; border: none; width: 100%; text-align: left; cursor: pointer; transition: background 0.15s, color 0.15s; }
        .admin-nav-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .admin-nav-link.active { background: rgba(99,102,241,0.18); color: #a5b4fc; }
        .admin-logout-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.75rem; background: none; border: 1px solid rgba(239,68,68,0.25); border-radius: 8px; color: #f87171; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
        .admin-logout-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.45); }
        .admin-content { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; }
        .admin-dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
        .admin-dash-title { font-size: 1.85rem; font-weight: 700; color: #fff; margin: 0 0 0.3rem; letter-spacing: -0.02em; }
        .admin-dash-sub { font-size: 0.9rem; color: rgba(255,255,255,0.4); margin: 0; }
        .admin-btn-primary { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
        .admin-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
        .admin-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .admin-btn-secondary { padding: 0.6rem 1.25rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
        .admin-btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .admin-btn-back { background: none; border: none; color: #a5b4fc; font-size: 0.9rem; cursor: pointer; margin-bottom: 1.5rem; display: inline-block; }
        .admin-btn-back:hover { text-decoration: underline; }
        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }
        .admin-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1.25rem; }
        .admin-stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .admin-stat-value { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 0.1rem; }
        .admin-stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.45); margin: 0; }
        .admin-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem; }
        .admin-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .admin-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .admin-input-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .admin-input-group label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.7); }
        .admin-input-group input, .admin-input-group select, .admin-input-group textarea { padding: 0.75rem 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 0.95rem; font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .admin-input-group input:focus, .admin-input-group select:focus, .admin-input-group textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
        .admin-image-upload { border: 2px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 2.5rem; text-align: center; color: rgba(255,255,255,0.5); cursor: pointer; transition: border-color 0.2s, background 0.2s; display: block; }
        .admin-image-upload:hover { border-color: #6366f1; background: rgba(99,102,241,0.05); }
        .admin-image-upload p { color: #fff; margin: 1rem 0 0.25rem; font-weight: 500; }
        .admin-image-upload span { font-size: 0.8rem; }
        .admin-preview-gallery { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .admin-preview-main { max-width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
        .admin-preview-thumbs { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
        .admin-preview-thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; border: 2px solid transparent; cursor: pointer; transition: border-color 0.2s; }
        .admin-preview-thumb.active { border-color: #6366f1; }
        .admin-existing-images { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .admin-existing-img-wrap { position: relative; }
        .admin-existing-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); }
        .admin-remove-img { position: absolute; top: -6px; right: -6px; background: #ef4444; border: none; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; transition: background 0.2s; }
        .admin-remove-img:hover { background: #dc2626; }
        .admin-form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
        .admin-table-toolbar { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .admin-search-box { display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.5rem 1rem; width: 300px; }
        .admin-search-box input { background: none; border: none; color: #fff; width: 100%; outline: none; }
        .admin-table-wrapper { background: rgba(20,20,25,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow-x: auto; overflow-y: auto; max-height: 70vh; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
        .admin-table-wrapper::-webkit-scrollbar { width: 8px; height: 8px; }
        .admin-table-wrapper::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px; }
        .admin-table-wrapper::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 8px; }
        .admin-table-wrapper::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
        .admin-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1800px; }
        .admin-table th { position: sticky; top: 0; z-index: 10; background: rgba(18,18,24,0.95); backdrop-filter: blur(12px); padding: 1.25rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .admin-table th:nth-child(1), .admin-table td:nth-child(1) { position: sticky; left: 0; z-index: 11; background: rgba(18,18,24,0.95); }
        .admin-table th:nth-child(2), .admin-table td:nth-child(2) { position: sticky; left: 100px; z-index: 11; background: rgba(18,18,24,0.95); border-right: 1px solid rgba(255,255,255,0.08); }
        .admin-table td:nth-child(1), .admin-table td:nth-child(2) { background: rgba(25,25,30,0.95); }
        .admin-table-row { transition: background 0.2s; }
        .admin-table-row:nth-child(even) td { background: rgba(255,255,255,0.015); }
        .admin-table-row:nth-child(even) td:nth-child(1), .admin-table-row:nth-child(even) td:nth-child(2) { background: rgba(28,28,33,0.95); }
        .admin-table-row:hover td { background: rgba(255,255,255,0.05) !important; }
        .admin-table-row:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .admin-table td { padding: 1.15rem 1rem; font-size: 0.85rem; vertical-align: middle; }
        .admin-td-id { color: #a5b4fc; font-size: 0.85rem; font-weight: 600; font-family: monospace; }
        .admin-td-price { color: #10b981; font-weight: 600; font-family: monospace; }
        .admin-td-text { color: rgba(255,255,255,0.75); }
        .admin-product-cell { display: flex; align-items: center; gap: 1rem; }
        .admin-thumb-stack { display: flex; align-items: center; }
        .admin-product-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.15); position: relative; }
        .admin-product-name { color: #e4e4e7; font-weight: 500; }
        .admin-action-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 7px; border: none; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .admin-action-btn.edit { background: rgba(99,102,241,0.15); color: #a5b4fc; }
        .admin-action-btn.edit:hover { background: rgba(99,102,241,0.35); color: #fff; }
        .admin-action-btn.delete { background: rgba(239,68,68,0.12); color: #f87171; }
        .admin-action-btn.delete:hover { background: rgba(239,68,68,0.3); color: #fff; }
        .admin-badge-category { background: rgba(99,102,241,0.15); color: #a5b4fc; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .admin-badge-new { background: rgba(245,158,11,0.15); color: #fcd34d; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .admin-badge-active { background: rgba(16,185,129,0.15); color: #6ee7b7; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .admin-badge-pending { background: rgba(236,72,153,0.15); color: #f9a8d4; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .admin-badge-warning { background: rgba(245,158,11,0.15); color: #fcd34d; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .admin-badge-danger { background: rgba(239,68,68,0.15); color: #fca5a5; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .admin-badge-neutral { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .admin-pagination { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 1rem; padding: 0.5rem 0; color: rgba(255,255,255,0.6); font-size: 0.85rem; }
        .admin-pagination button { display: flex; align-items: center; gap: 0.25rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.4rem 0.75rem; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
        .admin-pagination button:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
        .admin-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 768px) { .admin-sidebar { display: none; } .admin-content { padding: 1.5rem; } .admin-form-row { grid-template-columns: 1fr; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-spinner { animation: spin 0.8s linear infinite; }
      `}</style>
    </main>
  );
}
