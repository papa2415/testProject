import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// --- 📸 自定義圖片插件 (支援網址與上傳) ---
class UrlImage {
  static get toolbox() {
    return { title: "Image (URL/Upload)", icon: "📸" };
  }
  constructor({ data }) {
    this.data = data;
    this.wrapper = undefined;
  }
  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "p-3 border rounded bg-light text-center shadow-sm";

    if (this.data && this.data.url) {
      this._showImage(this.data.url, this.data.caption);
    } else {
      const container = document.createElement("div");
      const input = document.createElement("input");
      input.className = "form-control mb-2";
      input.placeholder = "貼上圖片網址並按 Enter...";
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const url = e.target.value.trim();
          if (url) this._showImage(url);
        }
      });

      const uploadBtn = document.createElement("button");
      uploadBtn.className = "btn btn-sm btn-outline-primary w-100 mb-1";
      uploadBtn.innerHTML = "📁 選擇本地檔案上傳";

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";

      uploadBtn.onclick = () => fileInput.click();
      fileInput.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadBtn.innerText = "⏳ 上傳中...";
        try {
          const formData = new FormData();
          formData.append("file-to-upload", file);
          const res = await axios.post(
            `https://vue3-course-api.hexschool.io/v2/api/leafandhome/admin/upload`,
            formData
          );
          if (res.data.success) this._showImage(res.data.imageUrl);
        } catch (err) {
          alert("上傳失敗");
          uploadBtn.innerText = "📁 重新上傳";
        }
      };
      container.appendChild(input);
      container.appendChild(uploadBtn);
      container.appendChild(fileInput);
      this.wrapper.appendChild(container);
    }
    return this.wrapper;
  }
  _showImage(url, caption = "") {
    this.wrapper.innerHTML = "";
    this.wrapper.style.border = "none";
    this.wrapper.style.background = "transparent";
    const img = document.createElement("img");
    img.src = url;
    img.classList.add("img-fluid", "rounded", "mb-2");
    const capInput = document.createElement("input");
    capInput.classList.add("form-control", "form-control-sm", "text-center", "border-0");
    capInput.placeholder = "輸入圖片說明...";
    capInput.value = caption;
    this.wrapper.appendChild(img);
    this.wrapper.appendChild(capInput);
    this.data = { url, caption };
  }
  save(blockContent) {
    const captionInput = blockContent.querySelector("input");
    return {
      url: this.data.url,
      caption: captionInput ? captionInput.value : "",
    };
  }
}

// --- CMS 主程式 ---
const API_BASE = "https://vue3-course-api.hexschool.io/v2";
const API_PATH = "leafandhome";

function App() {
  const [articles, setArticles] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInfo, setLoginInfo] = useState({ username: "", password: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    create_at: "",
    author: "森活小編",
    isPublic: true,
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [comments, setComments] = useState([]);
  const editorRef = useRef(null);

  const TAG_OPTIONS = ["新手友善", "澆水技巧", "光線需求", "疑難雜症", "居家搭配"];

  const AVATAR_OPTIONS = [
    {
      label: "萌芽者",
      value: "https://images.unsplash.com/photo-1613737693063-a3c03b374aaf?q=80&w=764&auto=format&fit=crop",
    },
    {
      label: "馴綠者",
      value: "https://images.unsplash.com/photo-1750341005578-210e78d64c1d?q=80&w=387&auto=format&fit=crop",
    },
    {
      label: "植人級",
      value: "https://plus.unsplash.com/premium_photo-1668780538108-a097b10a918a?q=80&w=387&auto=format&fit=crop",
    },
  ];

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new window.EditorJS({
        holder: "editorjs-container",
        placeholder: "在此輸入正文...",
        tools: {
          header: {
            class: window.Header,
            config: { levels: [3], defaultLevel: 3 },
          },
          image: { class: UrlImage },
        },
        onReady: () => {
          if (window.DragDrop) new window.DragDrop(editorRef.current);
        },
      });
    }
    checkToken();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, loginInfo);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}; path=/`;
      axios.defaults.headers.common["Authorization"] = token;
      setIsLoggedIn(true);
      fetchInitialData();
      alert("✅ 登入成功！");
    } catch (err) {
      alert("❌ 登入失敗");
    }
  };

  const checkToken = () => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      setIsLoggedIn(true);
      fetchInitialData();
    }
  };

  const fetchInitialData = () => {
    fetchArticles();
    fetchAllProducts();
  };

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/articles`);
      setArticles(res.data.articles || []);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/products/all`);
      if (res.data.success) setAllProducts(res.data.products);
    } catch (err) {
      console.error("無法取得產品清單");
    }
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file-to-upload", file);
    try {
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, data);
      if (res.data.success) callback(res.data.imageUrl);
    } catch (err) {
      alert("上傳失敗");
    }
  };

  const syncProductData = (index, value) => {
    const matched = allProducts.find((p) => p.title === value || p.id === value);
    if (matched) {
      const newProds = [...relatedProducts];
      newProds[index].name = matched.title;
      newProds[index].productId = matched.id;
      newProds[index].img = matched.imageUrl;
      setRelatedProducts(newProds);
    }
  };

  const handleSave = async () => {
    const editorData = await editorRef.current.save();
    const convertedBlocks = editorData.blocks
      .map((block) => {
        if (block.type === "paragraph") return { type: "paragraph", content: block.data.text };
        if (block.type === "header")
          return { type: "heading", level: block.data.level, content: block.data.text };
        if (block.type === "image")
          return { type: "image", imageUrl: block.data.url, caption: block.data.caption || "" };
        return null;
      })
      .filter((b) => b);

    convertedBlocks.push({ type: "relatedProducts", title: "與植物相遇：", products: relatedProducts });
    if (comments.length > 0)
      convertedBlocks.push({ type: "commentSection", title: "留言與討論", comments: comments });

    const payload = {
      data: {
        ...formData,
        tag: selectedTags,
        create_at: Math.floor(new Date(formData.create_at).getTime() / 1000),
        content: formData.description,
        contentBlocks: convertedBlocks,
      },
    };

    try {
      const url = editId
        ? `${API_BASE}/api/${API_PATH}/admin/article/${editId}`
        : `${API_BASE}/api/${API_PATH}/admin/article`;
      await axios[editId ? "put" : "post"](url, payload);
      alert("✅ 儲存成功！");
      resetForm();
      fetchArticles();
    } catch (err) {
      alert("儲存失敗");
    }
  };

  const handleEdit = async (article) => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/article/${article.id}`);
      const d = res.data.article;
      setEditId(d.id);
      setFormData({
        title: d.title,
        description: d.description || "",
        image: d.image,
        author: d.author || "森活小編",
        isPublic: d.isPublic,
        create_at: new Date(d.create_at * 1000).toISOString().split("T")[0],
      });
      setSelectedTags(d.tag || []);
      const blocks = d.contentBlocks || [];
      setRelatedProducts(blocks.find((b) => b.type === "relatedProducts")?.products || []);
      setComments(blocks.find((b) => b.type === "commentSection")?.comments || []);

      const editorBlocks = blocks
        .filter((b) => ["paragraph", "heading", "image"].includes(b.type))
        .map((b) => {
          if (b.type === "paragraph") return { type: "paragraph", data: { text: b.content } };
          if (b.type === "heading") return { type: "header", data: { text: b.content, level: b.level } };
          if (b.type === "image") return { type: "image", data: { url: b.imageUrl, caption: b.caption } };
          return null;
        }).filter(b => b);
      editorRef.current.render({ blocks: editorBlocks });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("讀取失敗");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", description: "", image: "", create_at: "", author: "森活小編", isPublic: true });
    setSelectedTags([]);
    setRelatedProducts([]);
    setComments([]);
    editorRef.current.clear();
  };

  return (
    <div className="container py-5 mx-auto" style={{ maxWidth: "950px" }}>
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body bg-dark text-white rounded d-flex justify-content-between align-items-center py-2 px-4">
          <h5 className="mb-0 fw-bold">🌿 森活 CMS 管理系統</h5>
          {isLoggedIn ? (
            <button className="btn btn-sm btn-outline-light" onClick={() => {
              document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location.reload();
            }}>登出</button>
          ) : (
            <form className="d-flex gap-2" onSubmit={handleLogin}>
              <input type="email" placeholder="Email" className="form-control form-control-sm" onChange={(e) => setLoginInfo({ ...loginInfo, username: e.target.value })} />
              <input type="password" placeholder="Password" className="form-control form-control-sm" onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })} />
              <button type="submit" className="btn btn-sm btn-primary">登入</button>
            </form>
          )}
        </div>
      </div>

      <div className={!isLoggedIn ? "opacity-50 pointer-events-none" : ""}>
        <div className="card shadow-sm border-0 p-4 mb-5 bg-white">
          <div className="row g-3 mb-4 p-3 bg-light rounded border">
            <div className="col-md-9">
              <label className="small fw-bold">文章標題 *</label>
              <input className="form-control shadow-sm" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold">發布日期 *</label>
              <input type="date" className="form-control shadow-sm" value={formData.create_at} onChange={(e) => setFormData({ ...formData, create_at: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="small fw-bold">作者名稱 *</label>
              <input className="form-control shadow-sm" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
            </div>
            <div className="col-md-5">
              <label className="small fw-bold">主圖 URL (封面) *</label>
              <div className="input-group shadow-sm">
                <input className="form-control" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                <button className="btn btn-outline-secondary" type="button" onClick={() => document.getElementById("cover-up").click()}>📁 上傳</button>
              </div>
              <input type="file" id="cover-up" hidden onChange={(e) => handleFileUpload(e, (url) => setFormData({ ...formData, image: url }))} />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold">發布狀態</label>
              <select className="form-select shadow-sm" value={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "true" })}>
                <option value="true">公開發布</option>
                <option value="false">草稿</option>
              </select>
            </div>
            <div className="col-12">
              <label className="small fw-bold d-block mb-2">文章標籤 *</label>
              <div className="d-flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button key={tag} type="button" onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                    className={`btn btn-sm rounded-pill px-3 shadow-sm ${selectedTags.includes(tag) ? "btn-success" : "btn-outline-secondary"}`}>{tag}</button>
                ))}
              </div>
            </div>
            <div className="col-12">
              <label className="small fw-bold ">文章簡介</label>
              <textarea className="form-control shadow-sm" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="輸入簡短介紹..."></textarea>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold mb-3 border-start border-4 border-success ps-2">文章正文編輯區</h6>
            <div id="editorjs-container" className="border rounded bg-white p-3 shadow-sm" style={{ minHeight: "400px" }}></div>
          </div>

          <div className="row mb-4">
            {/* 🛍️ 相關商品區 */}
            <div className="col-md-6 border-end">
              <h6 className="fw-bold border-bottom pb-2">🛍️ 相關商品</h6>
              <button className="btn btn-xs btn-outline-primary mb-2" onClick={() => setRelatedProducts([...relatedProducts, { name: "", productId: "", img: "" }])}>+ 新增商品</button>
              <datalist id="productList">
                {allProducts.map((p) => <option key={p.id} value={p.title} />)}
              </datalist>
              {relatedProducts.map((p, i) => (
                <div key={i} className="p-3 border rounded mb-3 bg-white shadow-sm">
                  <div className="mb-2">
                    <label className="small text-muted fw-bold">商品名稱</label>
                    <div className="input-group input-group-sm">
                      <input className="form-control" list="productList" placeholder="搜尋商店產品..." value={p.name} onChange={(e) => {
                        const n = [...relatedProducts]; n[i].name = e.target.value; setRelatedProducts(n); syncProductData(i, e.target.value);
                      }} />
                      <button className="btn btn-primary" type="button" onClick={() => syncProductData(i, p.name)}>🔍</button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="small text-muted fw-bold">商品 ID</label>
                    <input className="form-control form-control-sm" placeholder="ID" value={p.productId} onChange={(e) => {
                      const n = [...relatedProducts]; n[i].productId = e.target.value; setRelatedProducts(n);
                    }} />
                  </div>
                  <div className="mb-1">
                    <label className="small text-muted fw-bold">圖片 URL</label>
                    <div className="input-group input-group-sm">
                      <input className="form-control" placeholder="網址" value={p.img} onChange={(e) => {
                        const n = [...relatedProducts]; n[i].img = e.target.value; setRelatedProducts(n);
                      }} />
                      <button className="btn btn-outline-secondary" type="button" onClick={() => document.getElementById(`p-up-${i}`).click()}>📁</button>
                    </div>
                    <input type="file" id={`p-up-${i}`} hidden accept="image/*" onChange={(e) => handleFileUpload(e, (url) => {
                      const n = [...relatedProducts]; n[i].img = url; setRelatedProducts(n);
                    })} />
                  </div>
                  <div className="text-end mt-1">
                    <button className="btn btn-sm text-danger p-0" onClick={() => setRelatedProducts(relatedProducts.filter((_, idx) => idx !== i))}>✕ 移除</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 💬 留言板預覽 - 修正自動隨機邏輯 */}
            <div className="col-md-6">
              <h6 className="fw-bold border-bottom pb-2">💬 留言板預覽</h6>
              <button
                className="btn btn-xs btn-outline-secondary mb-2"
                onClick={() => {
                  // --- ✨ 這裡就是自動指派頭像的邏輯 ✨ ---
                  const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)].value;
                  setComments([
                    ...comments,
                    {
                      userName: "",
                      content: "",
                      avatarType: randomAvatar, // 自動選一個
                    },
                  ]);
                }}
              >
                + 新增留言
              </button>
              {comments.map((c, i) => (
                <div key={i} className="p-2 border rounded mb-2 bg-white">
                  <div className="d-flex gap-1 mb-1 align-items-center">
                    <input className="form-control form-control-sm" placeholder="用戶名" value={c.userName} onChange={(e) => {
                      const n = [...comments]; n[i].userName = e.target.value; setComments(n);
                    }} />
                    <select className="form-select form-select-sm w-auto" value={c.avatarType} onChange={(e) => {
                      const n = [...comments]; n[i].avatarType = e.target.value; setComments(n);
                    }}>
                      {AVATAR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <img src={c.avatarType} alt="avatar" className="rounded-circle" style={{ width: "24px", height: "24px", objectFit: "cover" }} />
                    <button className="btn btn-sm text-danger ms-auto" onClick={() => setComments(comments.filter((_, idx) => idx !== i))}>✕</button>
                  </div>
                  <input className="form-control form-control-sm" placeholder="留言內容" value={c.content} onChange={(e) => {
                    const n = [...comments]; n[i].content = e.target.value; setComments(n);
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            {editId ? (
              <div className="d-flex gap-3">
                <button className="btn btn-primary btn-lg flex-grow-1 fw-bold shadow py-3" onClick={handleSave}>更新文章</button>
                <button className="btn btn-outline-danger btn-lg fw-bold shadow py-3 px-5" onClick={() => { if (confirm("確定取消？")) resetForm(); }}>取消編輯</button>
              </div>
            ) : (
              <button className="btn btn-success btn-lg w-100 fw-bold shadow py-3" onClick={handleSave}>發布新文章</button>
            )}
          </div>
        </div>

        {/* 文章清單 */}
        <div className="list-group">
          {articles.map((a) => (
            <div key={a.id} className="list-group-item d-flex justify-content-between align-items-center mb-2 rounded border-0 shadow-sm p-3 bg-white">
              <div>
                <h6 className="mb-0 fw-bold">{a.title}</h6>
                <p className="text-muted small mb-1">{a.description}</p>
                <small className="text-secondary">{a.author} · {new Date(a.create_at * 1000).toLocaleDateString()}</small>
              </div>
              <div className="btn-group gap-2">
                <button className="btn btn-sm btn-outline-primary px-3 rounded-pill" onClick={() => handleEdit(a)}>編輯</button>
                <button className="btn btn-sm btn-outline-danger px-3 rounded-pill" onClick={() => {
                  if (confirm("確定刪除？")) axios.delete(`${API_BASE}/api/${API_PATH}/admin/article/${a.id}`).then(fetchArticles);
                }}>刪除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;