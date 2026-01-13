import { useState, useEffect } from "react";
import axios from "axios";
// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const Home = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  //確認登入
  const [isAuth, setIsAuth] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  };

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexTokenAPI="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      //如果成功取到資訊 則加入axios 的 token
    }
    const checkLogin = async () => {
      //確認token是否正確
      try {
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);
        setIsAuth(true);
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
    checkLogin();
  }, []);

  //登入
  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexTokenAPI=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="container p-4">
          <form onSubmit={(e) => onSubmit(e)}>
            <div className="mb-3">
              <label htmlFor="userName" className="form-label">
                帳號
              </label>
              <input type="email" name="username" className="form-control" id="userName" aria-describedby="userName" placeholder="email" value={formData.username} onChange={(e) => handleInputChange(e)} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                密碼
              </label>
              <input type="password" name="password" className="form-control" id="password" placeholder="password" value={formData.password} onChange={(e) => handleInputChange(e)} />
            </div>
            <button type="submit" className="btn btn-primary">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div>已登入</div>
      )}
    </>
  );
};

export default Home;
