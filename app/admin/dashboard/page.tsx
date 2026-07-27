"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/data";
import {
  ShieldCheck,
  LogOut,
  Package,
  Tag,
  TrendingUp,
  Star,
  Users,
  ShoppingCart,
  PlusCircle,
  Search,
  Upload,
  Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Removed MOCK_ORDERS since we now fetch from Supabase

const MOCK_CUSTOMERS = []; // Deprecated, we will derive this dynamically

type TabState = "products" | "add-product" | "orders" | "customers";

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabState>("products");
  
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const supabase = createClient();

  // Add Product Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated");
    if (auth !== "true") {
      router.replace("/admin");
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      // Fetch Products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (productsData) setProducts(productsData);
      setLoadingProducts(false);

      // Fetch Orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });
      if (ordersData) setOrders(ordersData);
      setLoadingOrders(false);
    }
    
    if (authenticated) {
      fetchData();
    }
  }, [authenticated, supabase]);

  const customers = useMemo(() => {
    const customerMap = new Map();
    orders.forEach(order => {
      if (!customerMap.has(order.phone)) {
        customerMap.set(order.phone, {
          id: order.phone,
          name: order.name,
          email: `${order.wilaya}, ${order.commune}`, // Repurposing email for location
          spent: 0,
          lastOrder: order.date
        });
      }
      const customer = customerMap.get(order.phone);
      customer.spent += Number(order.total_price) || 0;
      if (order.date > customer.lastOrder) {
        customer.lastOrder = order.date;
      }
    });
    // Sort customers by amount spent (highest first)
    return Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  function handleLogout() {
    sessionStorage.removeItem("admin_authenticated");
    router.replace("/admin");
  }

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    let imageUrl = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800"; // Default image

    const imageFile = formData.get('imageFile') as File;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products') // Make sure this bucket exists in your Supabase project and is public
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
        
      imageUrl = publicUrlData.publicUrl;
    }

    const newProduct = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      image: imageUrl,
      is_new: formData.get('status') === 'new',
      description: formData.get('description') as string,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      alert("Error adding product: " + error.message);
    } else if (data) {
      setProducts([data, ...products]);
      setImagePreview(null);
      alert("Product added successfully!");
      setCurrentTab("products");
    }
  }

  async function handleConfirmOrder(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .update({ confirmation: 'Confirmed' })
      .eq('order_id', orderId);

    if (error) {
      alert("Error confirming order: " + error.message);
    } else {
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, confirmation: 'Confirmed' } : order
      ));
    }
  }

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

  return (
    <main className="admin-dash-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <ShieldCheck size={22} />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-link ${currentTab === "products" ? "active" : ""}`}
            onClick={() => setCurrentTab("products")}
          >
            <Package size={16} /> Products
          </button>
          <button
            className={`admin-nav-link ${currentTab === "orders" ? "active" : ""}`}
            onClick={() => setCurrentTab("orders")}
          >
            <ShoppingCart size={16} /> Orders
          </button>
          <button
            className={`admin-nav-link ${currentTab === "customers" ? "active" : ""}`}
            onClick={() => setCurrentTab("customers")}
          >
            <Users size={16} /> Customers
          </button>
        </nav>
        <button id="admin-logout-btn" className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="admin-content">
        <header className="admin-dash-header">
          <div>
            <h1 className="admin-dash-title">
              {currentTab === "products" && "Product Inventory"}
              {currentTab === "add-product" && "Add New Product"}
              {currentTab === "orders" && "Recent Orders"}
              {currentTab === "customers" && "Customer Directory"}
            </h1>
            <p className="admin-dash-sub">Welcome back, Jeanostar Admin</p>
          </div>
          {currentTab === "products" && (
            <button
              className="admin-btn-primary"
              onClick={() => setCurrentTab("add-product")}
            >
              <PlusCircle size={18} />
              Add Product
            </button>
          )}
        </header>

        {/* Dynamic Content Rendering */}

        {/* --- PRODUCTS TAB --- */}
        {currentTab === "products" && (
          <>
            {/* Stats */}
            <section className="admin-stats-grid">
              {stats.map((s) => (
                <div key={s.label} className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
                    <s.icon size={22} />
                  </div>
                  <div>
                    <p className="admin-stat-value">{s.value}</p>
                    <p className="admin-stat-label">{s.label}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Products table */}
            <section className="admin-table-section">
              <div className="admin-table-toolbar">
                <div className="admin-search-box">
                  <Search size={16} />
                  <input type="text" placeholder="Search products..." />
                </div>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProducts ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                          <Loader2 className="w-6 h-6 animate-spin text-primary inline-block" />
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="admin-table-row">
                          <td className="admin-td-id">#{product.id}</td>
                          <td>
                            <div className="admin-product-cell">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.image}
                                alt={product.name}
                                className="admin-product-thumb"
                              />
                              <span className="admin-product-name">{product.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="admin-badge-category">{product.category}</span>
                          </td>
                          <td className="admin-td-price">{formatPrice(product.price)}</td>
                          <td>
                            {product.is_new ? (
                              <span className="admin-badge-new">New</span>
                            ) : (
                              <span className="admin-badge-active">Active</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* --- ADD PRODUCT TAB --- */}
        {currentTab === "add-product" && (
          <section className="admin-form-section">
            <button className="admin-btn-back" onClick={() => setCurrentTab("products")}>
              &larr; Back to Products
            </button>
            <div className="admin-card">
              <form onSubmit={handleAddProduct} className="admin-form">
                <div className="admin-form-row">
                  <div className="admin-input-group">
                    <label>Product Name</label>
                    <input type="text" name="name" placeholder="e.g. Neon Cyber Jacket" required />
                  </div>
                  <div className="admin-input-group">
                    <label>Price (DZD)</label>
                    <input type="number" name="price" step="0.01" placeholder="99.99" required />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-input-group">
                    <label>Category</label>
                    <select name="category" required defaultValue="">
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
                    <select name="status" required defaultValue="new">
                      <option value="new">New Arrival</option>
                      <option value="active">Active</option>
                      <option value="sale">On Sale</option>
                    </select>
                  </div>
                </div>

                <div className="admin-input-group">
                  <label>Description</label>
                  <textarea name="description" rows={4} placeholder="Detailed product description..." required></textarea>
                </div>

                <div className="admin-input-group">
                  <label>Product Image</label>
                  <label htmlFor="imageFile" className="admin-image-upload">
                    <input 
                      type="file" 
                      id="imageFile" 
                      name="imageFile" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          setImagePreview(null);
                        }
                      }}
                    />
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
                    ) : (
                      <>
                        <Upload size={24} style={{ margin: '0 auto' }} />
                        <p>Click to upload or drag and drop</p>
                        <span>SVG, PNG, JPG or GIF</span>
                      </>
                    )}
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="admin-btn-secondary" onClick={() => setCurrentTab("products")}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* --- ORDERS TAB --- */}
        {currentTab === "orders" && (
          <section className="admin-table-section">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>ORDER ID</th>
                    <th>NAME</th>
                    <th>PHONE</th>
                    <th>PHONE 2</th>
                    <th>WILAYA</th>
                    <th>COMMUNE</th>
                    <th>ADRESSE</th>
                    <th>PRODUCT</th>
                    <th>PRODUCT VAR</th>
                    <th>QUANTITY</th>
                    <th>PRODUCT PR</th>
                    <th>DELIVERY PRIC</th>
                    <th>TOTAL PRICE</th>
                    <th>DELIVERY MOD</th>
                    <th>NOTE</th>
                    <th>EXCHANGE</th>
                    <th>FRAGILE</th>
                    <th>SOCIETE</th>
                    <th>CONFIRMATION</th>
                    <th>TRACKING</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={21} style={{ textAlign: 'center', padding: '2rem' }}>
                        <Loader2 className="animate-spin w-6 h-6 mx-auto text-primary" />
                        <p className="text-muted-foreground mt-2">Loading orders...</p>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={21} style={{ textAlign: 'center', padding: '2rem' }}>
                        <p className="text-muted-foreground">No orders found.</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
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
                        <td>
                          <span className={order.exchange === "Yes" ? "admin-badge-warning" : "admin-badge-neutral"}>
                            {order.exchange}
                          </span>
                        </td>
                        <td>
                          <span className={order.fragile === "Yes" ? "admin-badge-danger" : "admin-badge-neutral"}>
                            {order.fragile}
                          </span>
                        </td>
                        <td className="admin-td-text font-semibold text-white">{order.societe}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={
                              order.confirmation === "Confirmed" ? "admin-badge-active" :
                              "admin-badge-pending"
                            }>
                              {order.confirmation}
                            </span>
                            {order.confirmation === "Pending" && (
                              <button 
                                onClick={() => handleConfirmOrder(order.order_id)}
                                className="bg-green-500/20 hover:bg-green-500/40 text-green-400 text-xs py-1 px-2 rounded-md transition-colors border border-green-500/30"
                              >
                                Confirm
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="admin-td-text" style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>{order.tracking}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- CUSTOMERS TAB --- */}
        {currentTab === "customers" && (
          <section className="admin-table-section">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                        <Loader2 className="animate-spin w-6 h-6 mx-auto text-primary" />
                        <p className="text-muted-foreground mt-2">Loading customers...</p>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                        <p className="text-muted-foreground">No customers found.</p>
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="admin-table-row">
                        <td className="admin-td-id">{customer.id}</td>
                        <td className="admin-product-name">{customer.name}</td>
                        <td className="admin-td-text">{customer.email}</td>
                        <td className="admin-td-price">{formatPrice(customer.spent)}</td>
                        <td className="admin-td-text">{customer.lastOrder}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>

      <style>{`
        .admin-dash-root {
          display: flex;
          min-height: 100vh;
          background: #09090b;
          color: #e4e4e7;
          font-family: inherit;
        }

        /* Sidebar */
        .admin-sidebar {
          width: 240px;
          min-height: 100vh;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #a5b4fc;
          margin-bottom: 2.5rem;
          padding: 0 0.5rem;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .admin-nav-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .admin-nav-link.active { background: rgba(99,102,241,0.18); color: #a5b4fc; }

        .admin-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: none;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          color: #f87171;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }

        .admin-logout-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.45); }

        /* Content */
        .admin-content {
          flex: 1;
          padding: 2.5rem 3rem;
          overflow-y: auto;
        }

        .admin-dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
        }

        .admin-dash-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.3rem;
          letter-spacing: -0.02em;
        }

        .admin-dash-sub {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }

        /* Buttons */
        .admin-btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        }
        .admin-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }
        .admin-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .admin-btn-secondary {
          padding: 0.6rem 1.25rem;
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .admin-btn-secondary:hover { background: rgba(255,255,255,0.1); }

        .admin-btn-back {
          background: none;
          border: none;
          color: #a5b4fc;
          font-size: 0.9rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
          display: inline-block;
        }
        .admin-btn-back:hover { text-decoration: underline; }

        /* Stats */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .admin-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .admin-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.1rem;
        }

        .admin-stat-label {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        /* Forms */
        .admin-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 2rem;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .admin-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-input-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }

        .admin-input-group input, 
        .admin-input-group select, 
        .admin-input-group textarea {
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .admin-input-group input:focus, 
        .admin-input-group select:focus, 
        .admin-input-group textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
        }

        .admin-image-upload {
          border: 2px dashed rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 2.5rem;
          text-align: center;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .admin-image-upload:hover {
          border-color: #6366f1;
          background: rgba(99,102,241,0.05);
        }
        .admin-image-upload p { color: #fff; margin: 1rem 0 0.25rem; font-weight: 500;}
        .admin-image-upload span { font-size: 0.8rem; }

        .admin-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        /* Table */
        .admin-table-toolbar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .admin-search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          width: 300px;
        }

        .admin-search-box input {
          background: none;
          border: none;
          color: #fff;
          width: 100%;
          outline: none;
        }

        .admin-table-wrapper {
          background: rgba(20,20,25,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow-x: auto;
          overflow-y: auto;
          max-height: 70vh;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }

        /* Premium Scrollbar for Table */
        .admin-table-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .admin-table-wrapper::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
        }
        .admin-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 8px;
        }
        .admin-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }

        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 1800px; /* Force width for all columns */
        }

        .admin-table th {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(18, 18, 24, 0.95);
          backdrop-filter: blur(12px);
          padding: 1.25rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        /* Sticky First two columns */
        .admin-table th:nth-child(1), .admin-table td:nth-child(1) {
          position: sticky;
          left: 0;
          z-index: 11;
          background: rgba(18, 18, 24, 0.95);
        }
        .admin-table th:nth-child(2), .admin-table td:nth-child(2) {
          position: sticky;
          left: 100px;
          z-index: 11;
          background: rgba(18, 18, 24, 0.95);
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .admin-table td:nth-child(1), .admin-table td:nth-child(2) {
          background: rgba(25, 25, 30, 0.95);
        }

        .admin-table-row { transition: background 0.2s; }
        .admin-table-row:nth-child(even) td { background: rgba(255,255,255,0.015); }
        .admin-table-row:nth-child(even) td:nth-child(1),
        .admin-table-row:nth-child(even) td:nth-child(2) { background: rgba(28, 28, 33, 0.95); }
        
        .admin-table-row:hover td { background: rgba(255,255,255,0.05) !important; }
        
        .admin-table-row:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,0.05); }

        .admin-table td {
          padding: 1.15rem 1rem;
          font-size: 0.85rem;
          vertical-align: middle;
        }

        .admin-td-id { color: #a5b4fc; font-size: 0.85rem; font-weight: 600; font-family: monospace; }
        .admin-td-price { color: #10b981; font-weight: 600; font-family: monospace; }
        .admin-td-text { color: rgba(255,255,255,0.75); }

        .admin-product-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-product-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .admin-product-name { color: #e4e4e7; font-weight: 500; }

        .admin-badge-category {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .admin-badge-new {
          background: rgba(245,158,11,0.15);
          color: #fcd34d;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .admin-badge-active {
          background: rgba(16,185,129,0.15);
          color: #6ee7b7;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .admin-badge-pending {
          background: rgba(236,72,153,0.15);
          color: #f9a8d4;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .admin-badge-warning {
          background: rgba(245,158,11,0.15);
          color: #fcd34d;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .admin-badge-danger {
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .admin-badge-neutral {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .admin-sidebar { display: none; }
          .admin-content { padding: 1.5rem; }
          .admin-form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
